"""
Parse the WordPress export XML and print stories as Python data
suitable for pasting into data.py.

Usage: python parse_wp_export.py ../docs/thousandonestorieswordpress.WordPress.2026-06-15.xml
"""

import sys
import re
import xml.etree.ElementTree as ET
from html.parser import HTMLParser

NS = {
    "content": "http://purl.org/rss/1.0/modules/content/",
    "excerpt":  "http://wordpress.org/export/1.2/excerpt/",
    "dc":       "http://purl.org/dc/elements/1.1/",
    "wp":       "http://wordpress.org/export/1.2/",
}

class HTMLStripper(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
    def handle_data(self, data):
        self.parts.append(data)
    def get_text(self):
        return " ".join(self.parts)

def strip_html(html):
    s = HTMLStripper()
    s.feed(html or "")
    text = s.get_text()
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def make_excerpt(body, length=250):
    if len(body) <= length:
        return body
    cut = body[:length].rsplit(" ", 1)[0]
    return cut + "…"

def slugify(s):
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', s.lower())).strip('-')

def main(path):
    tree = ET.parse(path)
    root = tree.getroot()
    channel = root.find("channel")

    stories = []
    for item in channel.findall("item"):
        post_type = item.find("wp:post_type", NS)
        status     = item.find("wp:status", NS)
        if post_type is None or post_type.text != "post":
            continue
        if status is None or status.text != "publish":
            continue

        # Skip non-story categories (blog, news, promotion, outside works)
        cats = [c.text for c in item.findall("category") if c.text]
        skip_cats = {"Blog", "news", "promotion", "outside works"}
        if not any(c not in skip_cats for c in cats):
            continue
        if all(c in skip_cats for c in cats):
            continue

        title_el = item.find("title")
        title = title_el.text.strip() if title_el is not None and title_el.text else "(untitled)"

        author_el = item.find("dc:creator", NS)
        author = author_el.text.strip() if author_el is not None and author_el.text else "Unknown"

        date_el = item.find("wp:post_date", NS)
        date_raw = date_el.text.strip() if date_el is not None and date_el.text else ""
        date_published = date_raw[:10] if date_raw else ""

        content_el = item.find("content:encoded", NS)
        body_html = content_el.text or "" if content_el is not None else ""
        body = strip_html(body_html)
        word_count = len(body.split())
        excerpt = make_excerpt(body)

        post_id_el = item.find("wp:post_id", NS)
        post_id = post_id_el.text.strip() if post_id_el is not None else slugify(title)

        stories.append({
            "id": f"og-{post_id}",
            "title": title,
            "author": author,
            "excerpt": excerpt,
            "body": body,
            "word_count": word_count,
            "date_published": date_published,
            "featured": False,
            "votes": 0,
            "categories": cats,
        })

    stories.sort(key=lambda s: s["date_published"])

    print(f"# Found {len(stories)} published stories\n")
    for s in stories:
        print(f"  # {s['title']} ({s['date_published']}) [{', '.join(s['categories'])}]")
        print(f"  # {s['word_count']} words")
        print()

    print("\n# --- Python data ---\n")
    print("og_stories = [")
    for s in stories:
        body_escaped = s['body'].replace('\\', '\\\\').replace('"', '\\"')
        excerpt_escaped = s['excerpt'].replace('\\', '\\\\').replace('"', '\\"')
        print(f"""    {{
        "id": "{s['id']}",
        "title": "{s['title'].replace('"', '\\"')}",
        "author": "{s['author'].replace('"', '\\"')}",
        "excerpt": "{excerpt_escaped}",
        "body": "{body_escaped}",
        "word_count": {s['word_count']},
        "date_published": "{s['date_published']}",
        "featured": False,
        "votes": 0,
    }},""")
    print("]")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python parse_wp_export.py <path-to-xml>")
        sys.exit(1)
    main(sys.argv[1])
