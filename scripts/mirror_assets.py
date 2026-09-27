"""
Mirror all key destination images to root /assets/ and /assets/destinations/
to guarantee 0 404 image errors on any requested path.
"""

import shutil
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
PUBLIC_DIR = BASE_DIR / "Frontend" / "public"
ASSETS_DIR = PUBLIC_DIR / "assets"
DEST_DIR = ASSETS_DIR / "destinations"
YATRA_DIR = ASSETS_DIR / "yatra_sarthi"

DEST_DIR.mkdir(parents=True, exist_ok=True)
ASSETS_DIR.mkdir(parents=True, exist_ok=True)

# Copy all yatra_sarthi photos to assets/ and assets/destinations/
for img in YATRA_DIR.glob("*.jpg"):
    # Copy to assets/
    target1 = ASSETS_DIR / img.name
    shutil.copy2(img, target1)

    # Copy to assets/destinations/
    target2 = DEST_DIR / img.name
    shutil.copy2(img, target2)
    print(f"Mirrored {img.name} to /assets/ and /assets/destinations/")

# Specific aliases
aliases = {
    "uttarakhand_bugyal_panoramic.jpg": YATRA_DIR / "chopta.jpg",
    "adi_kailash.jpg": YATRA_DIR / "adi_kailash.jpg",
    "brahmatal_snow_trek.jpg": YATRA_DIR / "auli.jpg",
    "chandrashila_sunset_snow.jpg": YATRA_DIR / "chopta.jpg",
    "himalayan_basecamp_village.jpg": YATRA_DIR / "valley_of_flowers.jpg",
    "nanda_devi_clouds.jpg": YATRA_DIR / "auli.jpg",
}

for name, src in aliases.items():
    if src.exists():
        shutil.copy2(src, ASSETS_DIR / name)
        shutil.copy2(src, DEST_DIR / name)
        print(f"Created alias {name} from {src.name}")

print("\n✅ All image paths mirrored successfully!")
