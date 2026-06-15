"""
Parse the WordPress export and write the thousandone-og community
directly into data.py.

Usage: python3 seed_og_community.py ../docs/thousandonestorieswordpress.WordPress.2026-06-15.xml
"""

import sys
import re
import xml.etree.ElementTree as ET
from html.parser import HTMLParser

NS = {
    "content": "http://purl.org/rss/1.0/modules/content/",
    "dc":       "http://purl.org/dc/elements/1.1/",
    "wp":       "http://wordpress.org/export/1.2/",
}

BLOCK_TAGS = {"p", "div", "br", "h1", "h2", "h3", "h4", "h5", "h6", "li", "blockquote", "hr"}

class HTMLStripper(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
    def handle_starttag(self, tag, attrs):
        if tag.lower() in BLOCK_TAGS:
            self.parts.append("\n\n")
    def handle_endtag(self, tag):
        if tag.lower() in BLOCK_TAGS:
            self.parts.append("\n\n")
    def handle_data(self, data):
        self.parts.append(data)
    def get_text(self):
        text = "".join(self.parts)
        return re.sub(r'\n{3,}', '\n\n', text).strip()

def strip_html(html):
    s = HTMLStripper()
    s.feed(html or "")
    return s.get_text()

def make_excerpt(body, length=280):
    if len(body) <= length:
        return body
    return body[:length].rsplit(" ", 1)[0] + "\u2026"

def slugify(s):
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', s.lower())).strip('-')

SKIP_CATS = {"Blog", "news", "promotion", "outside works", "Uncategorized"}
STORY_CATS = {"Stories", "Stories-paid", "Stories-triggerwarning", "Poems",
              "science fiction", "stories"}

def main(xml_path, out_path):
    tree = ET.parse(xml_path)
    root = tree.getroot()
    channel = root.find("channel")

    stories = []
    seen_titles = set()

    for item in channel.findall("item"):
        post_type = item.find("wp:post_type", NS)
        status    = item.find("wp:status", NS)
        if post_type is None or post_type.text != "post":
            continue
        if status is None or status.text != "publish":
            continue

        cats = [c.text for c in item.findall("category") if c.text]
        if not any(c in STORY_CATS for c in cats):
            continue

        title_el = item.find("title")
        title = title_el.text.strip() if title_el is not None and title_el.text else ""
        if not title or title in seen_titles:
            continue
        seen_titles.add(title)

        author_el = item.find("dc:creator", NS)
        raw_author = author_el.text.strip() if author_el is not None and author_el.text else "Unknown"
        # edking4967 is the site admin posting on behalf of authors; keep as-is
        # but strip "edking4967" → "Edward King" for display
        author = "Edward King" if raw_author == "edking4967" else raw_author

        date_el = item.find("wp:post_date", NS)
        date_raw = date_el.text.strip() if date_el is not None and date_el.text else ""
        date_published = date_raw[:10] if date_raw else ""

        content_el = item.find("content:encoded", NS)
        body_html = content_el.text or "" if content_el is not None else ""
        body = strip_html(body_html)
        word_count = len(body.split())

        if word_count < 50:
            continue

        post_id_el = item.find("wp:post_id", NS)
        post_id = post_id_el.text.strip() if post_id_el is not None else slugify(title)

        excerpt = make_excerpt(body)

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
        })

    stories.sort(key=lambda s: s["date_published"])

    # Mark the first story as featured
    if stories:
        stories[0]["featured"] = True

    print(f"Seeding {len(stories)} stories into thousandone-og community")

    # Read existing data.py
    with open(out_path, "r") as f:
        existing = f.read()

    def py_str(s):
        return s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")

    lines = ['og_stories = [']
    for s in stories:
        lines.append('    {')
        lines.append(f'        "id": "{py_str(s["id"])}",')
        lines.append(f'        "title": "{py_str(s["title"])}",')
        lines.append(f'        "author": "{py_str(s["author"])}",')
        lines.append(f'        "excerpt": "{py_str(s["excerpt"])}",')
        lines.append(f'        "body": "{py_str(s["body"])}",')
        lines.append(f'        "word_count": {s["word_count"]},')
        lines.append(f'        "date_published": "{s["date_published"]}",')
        lines.append(f'        "featured": {s["featured"]},')
        lines.append(f'        "votes": 0,')
        lines.append('    },')
    lines.append(']')
    lines.append('')

    og_community = '''og_community = {
    "id": "thousandone-og",
    "name": "Thousand One Original",
    "tagline": "Stories from the original thousandonestories.com",
    "description": "The archive of the original Thousand One Stories publication, 2013–2018. Literary fiction, flash, sci-fi, noir, and more — curated by Edward King.",
    "editor": {
        "name": "Edward King",
        "bio": "Founder of Thousand One Stories. Editor and writer based in New York."
    },
    "stories": og_stories,
}
'''

    new_content = existing.rstrip() + "\n\n\n" + "\n".join(lines) + "\n" + og_community
    # Append og_community to the communities list
    new_content = new_content.replace(
        "communities = [",
        "communities = [\n    og_community,"
    )

    with open(out_path, "w") as f:
        f.write(new_content)

    print(f"Written to {out_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 seed_og_community.py <path-to-xml>")
        sys.exit(1)
    xml_path = sys.argv[1]
    out_path = "data.py"
    main(xml_path, out_path)
