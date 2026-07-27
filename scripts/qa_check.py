#!/usr/bin/env python3
"""Dependency-free QA for the retained Forg3d.Art static site."""

from collections import Counter
from html.parser import HTMLParser
import json
import os
import re
import sys
import xml.etree.ElementTree as ET
from urllib.parse import unquote, urldefrag, urlparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RETAINED_PAGES = ("index.html", "info.html", "404.html")
RETIRED_DESTINATIONS = {
    "custom-gifts": "https://esn3ly.store/#collections",
    "guides": "https://esn3ly.store/#collections",
    "guide-birthdays": "https://esn3ly.store/#collections",
    "guide-weddings": "https://esn3ly.store/collections/portrait",
    "guide-couples": "https://esn3ly.store/collections/portrait",
    "guide-corporate": "https://esn3ly.store/collections/business",
    "guide-islamic": "https://esn3ly.store/customize",
    "guide-diaspora": "https://esn3ly.store/",
    "portfolio": "https://esn3ly.store/#portfolio",
}
RETIRED_MARKERS = tuple(RETIRED_DESTINATIONS) + ("images/gifts",)
SKIP_SCHEMES = ("http:", "https:", "mailto:", "tel:", "data:", "javascript:")


def full_path(relative_path):
    return os.path.normpath(os.path.join(ROOT, relative_path))


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.filters = set()
        self.refs = []
        self.data_images = []
        self.json_ld = []
        self.new_tab_links = []
        self.tags = Counter()
        self.canonical_count = 0
        self.viewport_count = 0
        self.esn3ly_links = []
        self._json_ld_buffer = None

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        self.tags[tag] += 1
        if data.get("id"):
            self.ids.append(data["id"])
        if data.get("data-filter"):
            self.filters.add(data["data-filter"])
        if data.get("data-images"):
            self.data_images.append(data["data-images"])

        if tag == "a" and data.get("href"):
            self.refs.append(("href", data["href"]))
            if data.get("target") == "_blank":
                self.new_tab_links.append(data)
            if "esn3ly.store" in data["href"]:
                self.esn3ly_links.append(data["href"])
        elif tag in ("img", "script") and data.get("src"):
            self.refs.append(("src", data["src"]))
        elif tag == "link" and data.get("href"):
            self.refs.append(("href", data["href"]))

        if tag == "link" and "canonical" in (data.get("rel") or "").split():
            self.canonical_count += 1
        if tag == "meta" and data.get("name", "").lower() == "viewport":
            self.viewport_count += 1
        if tag == "script" and data.get("type") == "application/ld+json":
            self._json_ld_buffer = []

    def handle_endtag(self, tag):
        if tag == "script" and self._json_ld_buffer is not None:
            self.json_ld.append("".join(self._json_ld_buffer))
            self._json_ld_buffer = None

    def handle_data(self, data):
        if self._json_ld_buffer is not None:
            self._json_ld_buffer.append(data)


def parse_page(page):
    parser = PageParser()
    with open(full_path(page), encoding="utf-8") as handle:
        parser.feed(handle.read())
    return parser


def resolve_local_reference(source_page, value):
    clean_value = unquote(value.strip())
    if not clean_value or clean_value.startswith(SKIP_SCHEMES) or clean_value.startswith("//"):
        return None, None
    path_part, fragment = urldefrag(clean_value)
    path_part = path_part.split("?", 1)[0]
    if not path_part:
        target = source_page
    elif path_part == "/":
        target = "index.html"
    elif path_part.startswith("/"):
        target = path_part.lstrip("/")
    else:
        target = os.path.normpath(os.path.join(os.path.dirname(source_page), path_part))
    return target.replace("\\", "/"), fragment


def check_html(errors):
    parsed = {page: parse_page(page) for page in RETAINED_PAGES}

    root_html = sorted(name for name in os.listdir(ROOT) if name.endswith(".html"))
    if root_html != sorted(RETAINED_PAGES):
        errors.append(f"root HTML set is {root_html}, expected only {list(RETAINED_PAGES)}")

    for page, parser in parsed.items():
        duplicates = sorted(value for value, count in Counter(parser.ids).items() if count > 1)
        if duplicates:
            errors.append(f"{page}: duplicate IDs: {', '.join(duplicates)}")

        expected_singletons = {
            "title": parser.tags["title"],
            "canonical": parser.canonical_count,
            "viewport": parser.viewport_count,
            "h1": parser.tags["h1"],
            "main landmark": parser.tags["main"],
        }
        for label, count in expected_singletons.items():
            if count != 1:
                errors.append(f"{page}: expected exactly one {label}, found {count}")
        if "main-content" not in parser.ids:
            errors.append(f"{page}: missing id=\"main-content\"")

        for link in parser.new_tab_links:
            rel_values = set((link.get("rel") or "").split())
            if not {"noopener", "noreferrer"}.issubset(rel_values):
                errors.append(f"{page}: target=\"_blank\" link lacks noopener noreferrer: {link.get('href')}")

        expected_esn3ly_count = 1 if page in ("index.html", "info.html") else 0
        if len(parser.esn3ly_links) != expected_esn3ly_count:
            errors.append(f"{page}: expected {expected_esn3ly_count} Esn3ly footer link(s), found {len(parser.esn3ly_links)}")

        for index, raw_json in enumerate(parser.json_ld, start=1):
            try:
                json.loads(raw_json)
            except json.JSONDecodeError as exc:
                errors.append(f"{page}: invalid JSON-LD block {index}: {exc}")

        for raw_images in parser.data_images:
            try:
                images = json.loads(raw_images)
            except json.JSONDecodeError as exc:
                errors.append(f"{page}: invalid data-images JSON: {exc}")
                continue
            if not isinstance(images, list) or not images:
                errors.append(f"{page}: data-images must be a non-empty list")
                continue
            for image in images:
                target, _ = resolve_local_reference(page, image)
                if not target or not os.path.isfile(full_path(target)):
                    errors.append(f"{page}: missing carousel image {image}")

        for attribute, value in parser.refs:
            target, fragment = resolve_local_reference(page, value)
            if target is None:
                continue
            target_path = full_path(target)
            if not os.path.isfile(target_path):
                errors.append(f"{page}: broken {attribute} reference {value}")
                continue
            if fragment and target.endswith(".html"):
                target_parser = parsed.get(target) or parse_page(target)
                if fragment not in target_parser.ids and fragment not in target_parser.filters:
                    errors.append(f"{page}: missing fragment #{fragment} in {target}")

    for page in ("index.html", "info.html"):
        with open(full_path(page), encoding="utf-8") as handle:
            source = handle.read().lower()
        if source.count("looking for custom gifts?") != 1:
            errors.append(f"{page}: gift referral must appear exactly once")
        for line_number, line in enumerate(source.splitlines(), start=1):
            if "gift" in line and "looking for custom gifts?" not in line:
                errors.append(f"{page}:{line_number}: gift copy exists outside the footer referral")

    for page in RETAINED_PAGES:
        with open(full_path(page), encoding="utf-8") as handle:
            source = handle.read().lower()
        if "googletagmanager.com" in source or re.search(r"\bgtag\s*\(", source):
            errors.append(f"{page}: analytics code must not be embedded in retained HTML")


def check_redirects(errors):
    redirect_path = full_path("_redirects")
    if not os.path.isfile(redirect_path):
        errors.append("_redirects is missing")
        return

    actual = {}
    with open(redirect_path, encoding="utf-8") as handle:
        for line_number, raw_line in enumerate(handle, start=1):
            line = raw_line.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.split()
            if len(parts) != 3:
                errors.append(f"_redirects:{line_number}: expected source destination status")
                continue
            source, destination, status = parts
            if source in actual:
                errors.append(f"_redirects:{line_number}: duplicate source {source}")
            actual[source] = (destination, status)

    expected = {"/": ("/index.html", "200")}
    for family, destination in RETIRED_DESTINATIONS.items():
        for source in (f"/{family}.html", f"/{family}", f"/{family}/"):
            expected[source] = (destination, "301")

    if set(actual) != set(expected):
        missing = sorted(set(expected) - set(actual))
        extra = sorted(set(actual) - set(expected))
        if missing:
            errors.append(f"_redirects: missing rules: {', '.join(missing)}")
        if extra:
            errors.append(f"_redirects: unexpected rules: {', '.join(extra)}")
    for source, expected_value in expected.items():
        if actual.get(source) != expected_value:
            errors.append(f"_redirects: {source} should be {expected_value}, found {actual.get(source)}")


def check_manifest_and_service_worker(errors):
    with open(full_path("manifest.json"), encoding="utf-8") as handle:
        try:
            manifest = json.load(handle)
        except json.JSONDecodeError as exc:
            errors.append(f"manifest.json: invalid JSON: {exc}")
            return

    index_parser = parse_page("index.html")
    info_parser = parse_page("info.html")
    parser_by_page = {"index.html": index_parser, "info.html": info_parser}
    for shortcut in manifest.get("shortcuts", []):
        target, fragment = resolve_local_reference("index.html", shortcut.get("url", ""))
        if not target or not os.path.isfile(full_path(target)):
            errors.append(f"manifest.json: broken shortcut {shortcut.get('url')}")
        elif fragment and fragment not in parser_by_page.get(target, parse_page(target)).ids:
            errors.append(f"manifest.json: missing shortcut fragment #{fragment} in {target}")

    with open(full_path("sw.js"), encoding="utf-8") as handle:
        service_worker = handle.read()
    match = re.search(r"const\s+PRECACHE\s*=\s*\[(.*?)\];", service_worker, re.DOTALL)
    if not match:
        errors.append("sw.js: could not parse PRECACHE")
        return
    precache = re.findall(r"['\"]([^'\"]+)['\"]", match.group(1))
    for entry in precache:
        target, _ = resolve_local_reference("index.html", entry)
        if target and not os.path.isfile(full_path(target)):
            errors.append(f"sw.js: missing precache asset {entry}")
        if any(marker in entry.lower() for marker in RETIRED_MARKERS):
            errors.append(f"sw.js: retired resource in precache: {entry}")
    if "forg3d-v3" not in service_worker:
        errors.append("sw.js: cache version is not forg3d-v3")
    if "cache.addAll(PRECACHE).catch" in service_worker:
        errors.append("sw.js: install failures are being swallowed")


def check_sitemap(errors):
    try:
        root = ET.parse(full_path("sitemap.xml")).getroot()
    except (ET.ParseError, OSError) as exc:
        errors.append(f"sitemap.xml: cannot parse: {exc}")
        return
    namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = [node.text for node in root.findall("sm:url/sm:loc", namespace)]
    expected = ["https://forg3d.art/", "https://forg3d.art/info.html"]
    if urls != expected:
        errors.append(f"sitemap.xml: expected {expected}, found {urls}")
    for url in urls:
        parsed = urlparse(url)
        target = "index.html" if parsed.path == "/" else parsed.path.lstrip("/")
        if not os.path.isfile(full_path(target)):
            errors.append(f"sitemap.xml: URL does not resolve to retained page: {url}")


def check_retirement_and_packages(errors):
    for family in RETIRED_DESTINATIONS:
        if os.path.exists(full_path(f"{family}.html")):
            errors.append(f"retired page still exists: {family}.html")
    if os.path.exists(full_path("images/gifts")):
        errors.append("retired images/gifts directory still exists")

    deploy_files = ("index.html", "info.html", "404.html", "main.js", "styles.css", "manifest.json", "sitemap.xml", "sw.js")
    for name in deploy_files:
        with open(full_path(name), encoding="utf-8") as handle:
            source = handle.read().lower()
        for marker in RETIRED_MARKERS:
            if marker in source:
                errors.append(f"{name}: retired marker remains: {marker}")

    with open(full_path("package.json"), encoding="utf-8") as handle:
        package = json.load(handle)
    with open(full_path("package-lock.json"), encoding="utf-8") as handle:
        package_lock = json.load(handle)
    if package.get("name") != package_lock.get("name"):
        errors.append("package-lock.json project name does not match package.json")

    with open(full_path("wrangler.jsonc"), encoding="utf-8") as handle:
        wrangler = json.load(handle)
    assets_config = wrangler.get("assets", {})
    if assets_config.get("html_handling") != "none":
        errors.append('wrangler.jsonc: assets.html_handling must be "none" so /info.html returns 200')
    if assets_config.get("not_found_handling") != "404-page":
        errors.append('wrangler.jsonc: assets.not_found_handling must be "404-page"')

    with open(full_path(".assetsignore"), encoding="utf-8") as handle:
        ignored_assets = {line.strip() for line in handle if line.strip() and not line.startswith("#")}
    for required_ignore in (".git/", ".github/", "node_modules/", "scripts/"):
        if required_ignore not in ignored_assets:
            errors.append(f".assetsignore: missing deployment exclusion {required_ignore}")


def main():
    errors = []
    check_html(errors)
    check_redirects(errors)
    check_manifest_and_service_worker(errors)
    check_sitemap(errors)
    check_retirement_and_packages(errors)

    if errors:
        print(f"[FAIL] Forg3d.Art QA found {len(errors)} issue(s):")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("[OK] Forg3d.Art QA passed")
    print("     3 retained pages, 27 permanent redirects, references, metadata, JSON-LD, PWA, and retirement checks are valid")
    return 0


if __name__ == "__main__":
    sys.exit(main())
