"""
Re-parses WordPress XML and updates body/excerpt for thousandone-classic
stories in the SQLite DB with proper paragraph breaks.

Usage: python3 fix_classic_bodies.py ../docs/thousandonestorieswordpress.WordPress.2026-06-15.xml
"""

import sys
import re
import sqlite3
import os
import xml.etree.ElementTree as ET
from html.parser import HTMLParser

NS = {
    "content": "http://purl.org/rss/1.0/modules/content/",
    "wp":      "http://wordpress.org/export/1.2/",
}

BLOCK_TAGS = {"p", "div", "br", "h1", "h2", "h3", "h4", "h5", "h6", "li", "blockquote"}

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
    # Use first paragraph if available, otherwise truncate
    paragraphs = [p.strip() for p in body.split('\n\n') if p.strip()]
    if paragraphs and len(paragraphs[0]) <= length * 2:
        first = paragraphs[0]
        if len(first) <= length:
            return first
        return first[:length].rsplit(" ", 1)[0] + "\u2026"
    if len(body) <= length:
        return body
    return body[:length].rsplit(" ", 1)[0] + "\u2026"

def main(xml_path):
    tree = ET.parse(xml_path)
    channel = tree.getroot().find("channel")

    updates = []
    for item in channel.findall("item"):
        pt = item.find("wp:post_type", NS)
        st = item.find("wp:status", NS)
        if pt is None or pt.text != "post" or st is None or st.text != "publish":
            continue
        pid = item.find("wp:post_id", NS)
        if pid is None:
            continue
        content_el = item.find("content:encoded", NS)
        body = strip_html(content_el.text or "" if content_el is not None else "")
        if not body:
            continue
        excerpt = make_excerpt(body)
        story_id = f"og-{pid.text}"
        updates.append((body, excerpt, len(body.split()), story_id))

    db_path = os.path.join(os.path.dirname(__file__), "thousandone.db")
    conn = sqlite3.connect(db_path)
    updated = 0
    for body, excerpt, word_count, story_id in updates:
        cur = conn.execute(
            "UPDATE stories SET body=?, excerpt=?, word_count=? WHERE id=? AND community_id='thousandone-classic'",
            (body, excerpt, word_count, story_id)
        )
        updated += cur.rowcount
    conn.commit()
    conn.close()
    print(f"Updated {updated} stories in thousandone.db")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 fix_classic_bodies.py <path-to-xml>")
        sys.exit(1)
    main(sys.argv[1])
