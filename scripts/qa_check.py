#!/usr/bin/env python3
"""
Forg3d.Art static-site QA checker (zero dependencies).

Validates, across every *.html page in the repo root:
  - internal links and asset references (href/src/link) resolve to real files
  - fragment links (#foo and page.html#foo) resolve to an id or a
    data-filter value (category deep-links activated by main.js) in the target page
  - no duplicate id attributes within a page
  - required <head> tags are present (<title>, canonical, viewport)
  - referenced images actually exist on disk

Exits non-zero if any problem is found, so CI fails fast.
Run locally with:  python3 scripts/qa_check.py
"""
import os
import sys
import glob
from html.parser import HTMLParser
from urllib.parse import urldefrag, urlparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_SCHEMES = ("http:", "https:", "mailto:", "tel:", "data:", "javascript:")


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.filters = set()    # data-filter values (valid deep-link fragments)
        self.refs = []          # (attr_source, value)
        self.has_title = False
        self.has_canonical = False
        self.has_viewport = False
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if "id" in d and d["id"]:
            self.ids.append(d["id"])
        if d.get("data-filter"):
            self.filters.add(d["data-filter"])
        if tag == "a" and d.get("href"):
            self.refs.append(("a[href]", d["href"]))
        if tag in ("img", "script", "source") and d.get("src"):
            self.refs.append((f"{tag}[src]", d["src"]))
        if tag == "link" and d.get("href"):
            rel = (d.get("rel") or "").lower()
            if rel not in ("preconnect", "dns-prefetch"):
                self.refs.append(("link[href]", d["href"]))
            if rel == "canonical":
                self.has_canonical = True
        if tag == "title":
            self._in_title = True
        if tag == "meta" and d.get("name") == "viewport":
            self.has_viewport = True

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_title and data.strip():
            self.has_title = True


def parse_page(path):
    with open(path, encoding="utf-8") as fh:
        html = fh.read()
    p = PageParser()
    p.feed(html)
    return p


def check_page(path, p, anchors_by_page):
    errors = []
    rel = os.path.basename(path)

    # duplicate ids
    seen, dupes = set(), set()
    for i in p.ids:
        (dupes if i in seen else seen).add(i)
    for d in sorted(dupes):
        errors.append(f"duplicate id=\"{d}\"")

    # required head tags
    if not p.has_title:
        errors.append("missing <title>")
    if not p.has_viewport:
        errors.append("missing viewport meta")
    if rel != "404.html" and not p.has_canonical:
        errors.append("missing canonical link")

    # resolve references
    for src, value in p.refs:
        v = value.strip()
        if not v or v.lower().startswith(SKIP_SCHEMES):
            continue
        if v.startswith("#"):
            frag = v[1:]
            if frag and frag not in anchors_by_page.get(rel, set()):
                errors.append(f"broken fragment {src} -> {value}")
            continue
        if urlparse(v).netloc:
            continue
        target, frag = urldefrag(v)
        target = target.split("?")[0]
        if not target:
            continue
        fs = os.path.join(ROOT, target.lstrip("/"))
        if not os.path.exists(fs):
            errors.append(f"broken {src} -> {value}")
        elif frag:
            page = os.path.basename(target)
            if page in anchors_by_page and frag not in anchors_by_page[page]:
                errors.append(f"broken fragment {src} -> {value}")
    return errors


def main():
    pages = sorted(glob.glob(os.path.join(ROOT, "*.html")))
    if not pages:
        print("No HTML pages found.")
        return 1
    parsed = {path: parse_page(path) for path in pages}
    anchors_by_page = {
        os.path.basename(path): set(p.ids) | p.filters
        for path, p in parsed.items()
    }
    total = 0
    for path in pages:
        errs = check_page(path, parsed[path], anchors_by_page)
        name = os.path.basename(path)
        if errs:
            total += len(errs)
            print(f"\n✗ {name}")
            for e in errs:
                print(f"    - {e}")
        else:
            print(f"✓ {name}")
    print()
    if total:
        print(f"QA FAILED: {total} issue(s) found.")
        return 1
    print(f"QA PASSED: {len(pages)} pages clean.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
