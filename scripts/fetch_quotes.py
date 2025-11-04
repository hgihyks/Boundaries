#!/usr/bin/env python3
import argparse
import json
import os
import sys
import time
from typing import Iterable, List, Optional

try:
    import requests
except Exception as exc:  # pragma: no cover
    print("The 'requests' package is required. Install with: pip install requests", file=sys.stderr)
    raise


DEFAULT_LANGS: List[str] = [
     "hi",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Fetch quotes from PaperQuotes API for multiple languages and write them to files."
    )
    parser.add_argument(
        "--out",
        default="quotes",
        help="Output directory for per-language text files (default: quotes)",
    )
    parser.add_argument(
        "--pages",
        type=int,
        default=50,
        help="Maximum number of pages to fetch per language (default: 30)",
    )
    parser.add_argument(
        "--langs",
        default=",".join(DEFAULT_LANGS),
        help=(
            "Comma-separated list of language codes to fetch. "
            "Defaults to en,fr,de,it,pt,ru,es,tr,uk,he"
        ),
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.2,
        help="Delay in seconds between API calls (default: 0.2)",
    )
    return parser.parse_args()


def split_langs(langs_csv: str) -> List[str]:
    return [lang.strip() for lang in langs_csv.split(",") if lang.strip()]


def build_url(lang: str, offset: int) -> str:
    # NOTE: offset must be a multiple of 5 per API behavior
    return f"https://api.paperquotes.com/apiv1/quotes/?lang={lang}&offset={offset}"


def fetch_page(url: str, max_retries: int = 1, timeout_s: int = 20) -> Optional[dict]:
    last_err: Optional[Exception] = None
    for attempt in range(max_retries + 1):
        try:
            resp = requests.get(url, timeout=timeout_s)
            if resp.status_code == 200:
                return resp.json()
            else:
                last_err = RuntimeError(f"HTTP {resp.status_code}: {resp.text[:200]}")
        except Exception as exc:  # pragma: no cover
            last_err = exc
        time.sleep(0.2 * (attempt + 1))
    print(f"Request failed for {url}: {last_err}", file=sys.stderr)
    return None


def extract_quotes(payload: dict) -> Iterable[str]:
    results = payload.get("results") or []
    for item in results:
        quote = item.get("quote")
        if isinstance(quote, str):
            yield quote


def write_quotes(file_path: str, quotes: Iterable[str]) -> None:
    # Append quotes, one per line, UTF-8
    with open(file_path, "a", encoding="utf-8") as f:
        for q in quotes:
            f.write(q)
            if not q.endswith("\n"):
                f.write("\n")


def fetch_for_language(lang: str, out_dir: str, pages: int, delay: float) -> None:
    target_file = os.path.join(out_dir, f"{lang}.txt")
    for page_index in range(pages):
        offset = page_index * 5
        url = build_url(lang, offset)
        payload = fetch_page(url, max_retries=1)
        if not payload:
            # Skip to next page; continue trying remaining pages
            time.sleep(delay)
            continue

        write_quotes(target_file, extract_quotes(payload))

        # Early stop if no next page
        if not payload.get("next"):
            break

        time.sleep(delay)


def main() -> int:
    args = parse_args()

    if args.pages <= 0:
        print("--pages must be a positive integer", file=sys.stderr)
        return 2

    os.makedirs(args.out, exist_ok=True)

    languages = split_langs(args.langs)
    for lang in languages:
        fetch_for_language(lang=lang, out_dir=args.out, pages=args.pages, delay=args.delay)

    return 0


if __name__ == "__main__":
    sys.exit(main())


