#!/usr/bin/env python3
"""
Builds a single JSON file that embeds all quote .txt files for browser import.

Input directory: quotes/ (sibling to src/)
Output file:     src/quotes/index.json

Usage:
  python3 scripts/build_quotes_index.py
"""

import json
import os
import sys


def main() -> int:
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    quotes_dir = os.path.join(repo_root, 'public', 'quotes')
    out_dir = os.path.join(repo_root, 'src', 'quotes')
    out_file = os.path.join(out_dir, 'index.json')

    if not os.path.isdir(quotes_dir):
        print(f"Quotes directory not found: {quotes_dir}", file=sys.stderr)
        return 1

    data = {}
    for fname in sorted(os.listdir(quotes_dir)):
        if not fname.endswith('.txt'):
            continue
        fpath = os.path.join(quotes_dir, fname)
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                data[fname] = f.read()
        except Exception as e:
            print(f"Failed reading {fpath}: {e}", file=sys.stderr)
            return 1

    os.makedirs(out_dir, exist_ok=True)
    try:
        with open(out_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False)
    except Exception as e:
        print(f"Failed writing {out_file}: {e}", file=sys.stderr)
        return 1

    print(f"Wrote {out_file} with {len(data)} files.")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())


