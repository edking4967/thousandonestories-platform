"""
Downloads featured images for thousandone-classic stories and patches
image_url fields into data.py.

Usage: python3 download_og_images.py ../docs/thousandonestorieswordpress.WordPress.2026-06-15.xml
"""

import sys
import os
import re
import urllib.request
import xml.etree.ElementTree as ET

NS = {
    "wp":      "http://wordpress.org/export/1.2/",
    "content": "http://purl.org/rss/1.0/modules/content/",
    "dc":      "http://purl.org/dc/elements/1.1/",
}

IMAGE_DIR = os.path.join(os.path.dirname(__file__), "../frontend/public/images/og")


def main(xml_path):
    tree = ET.parse(xml_path)
    root = tree.getroot()
    channel = root.find("channel")

    # Build attachment id -> url map
    attachments = {}
    for item in channel.findall("item"):
        pt = item.find("wp:post_type", NS)
        if pt is None or pt.text != "attachment":
            continue
        pid = item.find("wp:post_id", NS)
        url = item.find("wp:attachment_url", NS)
        if pid is not None and url is not None:
            attachments[pid.text] = url.text

    # Build post_id -> image_url map: prefer _thumbnail_id, fall back to first inline img
    post_images = {}
    for item in channel.findall("item"):
        pt = item.find("wp:post_type", NS)
        st = item.find("wp:status", NS)
        if pt is None or pt.text != "post" or st is None or st.text != "publish":
            continue
        pid = item.find("wp:post_id", NS)
        if pid is None:
            continue

        # Try featured image first
        for m in item.findall("wp:postmeta", NS):
            k = m.find("wp:meta_key", NS)
            v = m.find("wp:meta_value", NS)
            if k is not None and k.text == "_thumbnail_id" and v is not None:
                img_url = attachments.get(v.text)
                if img_url:
                    post_images[pid.text] = img_url

        # Fall back to first image in body content
        if pid.text not in post_images:
            content_el = item.find("content:encoded", NS)
            body = content_el.text or "" if content_el is not None else ""
            imgs = re.findall(r'src="(https?://[^"]+\.(jpg|jpeg|png|gif|webp)[^"]*)"', body, re.IGNORECASE)
            if imgs:
                post_images[pid.text] = imgs[0][0].split("?")[0]

    os.makedirs(IMAGE_DIR, exist_ok=True)

    # Download images and build story_id -> local path map
    story_image_map = {}
    for post_id, img_url in post_images.items():
        story_id = f"og-{post_id}"
        ext = os.path.splitext(img_url.split("?")[0])[1] or ".jpg"
        filename = f"{post_id}{ext}"
        local_path = os.path.join(IMAGE_DIR, filename)
        public_path = f"/images/og/{filename}"

        if not os.path.exists(local_path):
            try:
                print(f"Downloading {img_url} ...")
                urllib.request.urlretrieve(img_url, local_path)
            except Exception as e:
                print(f"  FAILED: {e}")
                continue
        else:
            print(f"Already have {filename}")

        story_image_map[story_id] = public_path

    print(f"\nDownloaded {len(story_image_map)} images")

    # Patch data.py: add image_url to matching og- stories
    data_path = os.path.join(os.path.dirname(__file__), "data.py")
    with open(data_path, "r") as f:
        content = f.read()

    patched = 0
    for story_id, img_path in story_image_map.items():
        # Find the story block by id and insert image_url after votes if not already present
        pattern = rf'("id": "{re.escape(story_id)}",.*?"votes": 0,\n)'
        replacement = rf'\1        "image_url": "{img_path}",\n'
        new_content, n = re.subn(pattern, replacement, content, flags=re.DOTALL)
        if n:
            content = new_content
            patched += 1

    with open(data_path, "w") as f:
        f.write(content)

    print(f"Patched {patched} stories in data.py")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 download_og_images.py <path-to-xml>")
        sys.exit(1)
    main(sys.argv[1])
