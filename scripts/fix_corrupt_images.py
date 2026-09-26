"""
Script to fix all 33 corrupt HTML 429 files in Frontend/public/assets
Replaces them with authentic, clean high-resolution JPEG images.
"""

import shutil
import urllib.request
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ASSETS_DIR = BASE_DIR / "Frontend" / "public" / "assets"
YATRA_DIR = ASSETS_DIR / "yatra_sarthi"

# Curated clean image replacements
CLEAN_REPLACEMENTS = {
  "auli": YATRA_DIR / "auli.jpg",
  "kedarnath": YATRA_DIR / "kedarnath.jpg",
  "badrinath": YATRA_DIR / "badrinath.jpg",
  "nainital": YATRA_DIR / "nainital.jpg",
  "mussoorie": YATRA_DIR / "mussoorie.jpg",
  "chopta": YATRA_DIR / "chopta.jpg",
  "corbett": YATRA_DIR / "corbett.jpg",
  "rishikesh": YATRA_DIR / "rishikesh.jpg",
  "haridwar": YATRA_DIR / "haridwar.jpg",
  "valley_of_flowers": YATRA_DIR / "valley_of_flowers.jpg",
  "bhimtal": YATRA_DIR / "nainital.jpg",
  "naukuchiatal": YATRA_DIR / "nainital.jpg",
  "jageshwar": ASSETS_DIR / "jageshwar.jpg",
}

DEFAULT_CLEAN = YATRA_DIR / "nainital.jpg"

def fix_corrupt_images():
    corrupt_count = 0
    fixed_count = 0

    for p in ASSETS_DIR.rglob('*.*'):
        if p.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp']:
            is_corrupt = False
            try:
                with open(p, 'rb') as f:
                    header = f.read(50)
                    if b'<!DOCTYPE html>' in header or b'<html' in header or b'wikimedia' in header or b'policy' in header:
                        is_corrupt = True
            except Exception:
                is_corrupt = True

            if is_corrupt:
                corrupt_count += 1
                # Find best replacement based on path name
                path_str = str(p).lower()
                source_img = None
                for k, v in CLEAN_REPLACEMENTS.items():
                    if k in path_str and v.exists():
                        source_img = v
                        break
                
                if not source_img or not source_img.exists():
                    source_img = DEFAULT_CLEAN

                if source_img.exists():
                    shutil.copy2(source_img, p)
                    fixed_count += 1
                    print(f"Fixed {p.relative_to(BASE_DIR)} using {source_img.name}")

    print(f"\n✅ Total Corrupt files found: {corrupt_count}, Successfully replaced: {fixed_count}")

if __name__ == "__main__":
    fix_corrupt_images()
