"""Save a YouTube channel's latest videos and some playlists to JSON files.

Run by .github/workflows/latest-videos.yml so the static site can show
recent uploads without an API key. Uses YouTube's public RSS feeds.
"""

import json
import sys
import urllib.request
import xml.etree.ElementTree as ET

CHANNEL_ID = "UCxbDammM-LkN24W4ahM26Dw"  # youtube.com/@yinlin9811
VIDEO_COUNT = 3

# Shown in the Gaming hobby, in this order. Add or remove IDs here.
PLAYLIST_IDS = [
    "PLh9XIEG13ud9oMrMWk77Fpg92_wnd-INY",  # SonicXShadow Generations
    "PLh9XIEG13ud8Rk0O7HJ7bqVUMH3cK34c7",  # Sonic Colors Ultimate
    "PLh9XIEG13ud95nH3NQIgvpcylVAswTWUv",  # OM
]

VIDEOS_OUTPUT = "fun-portfolio/videos.json"
PLAYLISTS_OUTPUT = "fun-portfolio/playlists.json"
FEED_URL = "https://www.youtube.com/feeds/videos.xml?{}"
FEED_MAX_ENTRIES = 15  # YouTube feeds never return more than this

NS = {
    "atom": "http://www.w3.org/2005/Atom",
    "yt": "http://www.youtube.com/xml/schemas/2015",
}


def fetch_feed(query):
    with urllib.request.urlopen(FEED_URL.format(query), timeout=30) as res:
        return ET.fromstring(res.read())


def thumbnail(video_id):
    return f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"


def latest_videos():
    root = fetch_feed(f"channel_id={CHANNEL_ID}")
    videos = []
    for entry in root.findall("atom:entry", NS)[:VIDEO_COUNT]:
        video_id = entry.findtext("yt:videoId", namespaces=NS)
        videos.append({
            "id": video_id,
            "title": entry.findtext("atom:title", namespaces=NS),
            "published": entry.findtext("atom:published", namespaces=NS),
            "url": f"https://www.youtube.com/watch?v={video_id}",
            "thumbnail": thumbnail(video_id),
        })
    return videos


def playlists():
    result = []
    for playlist_id in PLAYLIST_IDS:
        root = fetch_feed(f"playlist_id={playlist_id}")
        entries = root.findall("atom:entry", NS)
        if not entries:
            continue
        first_video = entries[0].findtext("yt:videoId", namespaces=NS)
        result.append({
            "id": playlist_id,
            "title": root.findtext("atom:title", namespaces=NS),
            "url": f"https://www.youtube.com/playlist?list={playlist_id}",
            "thumbnail": thumbnail(first_video),
            "count": len(entries),
            "countIsCapped": len(entries) >= FEED_MAX_ENTRIES,
        })
    return result


def save(path, data):
    if not data:
        sys.exit(f"Nothing returned for {path}; leaving the existing file alone.")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"Saved {len(data)} items to {path}")


def main():
    save(VIDEOS_OUTPUT, latest_videos())
    save(PLAYLISTS_OUTPUT, playlists())


if __name__ == "__main__":
    main()
