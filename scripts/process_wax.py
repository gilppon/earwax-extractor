import os
from PIL import Image

output_dir = r"e:\solarena\귀파기\public\sprites"
os.makedirs(output_dir, exist_ok=True)

files = [
    {
        "src": r"C:\Users\PC\.gemini\antigravity-ide\brain\0ba5f71a-5042-49ce-9e56-a2efaf7186ad\earwax_honey_gold_1791541080426.jpg",
        "dest": os.path.join(output_dir, "wax_gold.webp"),
        "bg_type": "black",
        "size": (256, 256),
    },
    {
        "src": r"C:\Users\PC\.gemini\antigravity-ide\brain\0ba5f71a-5042-49ce-9e56-a2efaf7186ad\earwax_boss_gem_1791541105584.jpg",
        "dest": os.path.join(output_dir, "boss_gem.webp"),
        "bg_type": "black",
        "size": (256, 256),
    },
    {
        "src": r"C:\Users\PC\.gemini\antigravity-ide\brain\0ba5f71a-5042-49ce-9e56-a2efaf7186ad\earwax_jelly_blob_1791541129607.jpg",
        "dest": os.path.join(output_dir, "wax_jelly.webp"),
        "bg_type": "white",
        "size": (256, 256),
    },
]

def make_transparent(img, bg_type):
    img = img.convert("RGBA")
    datas = img.getdata()
    new_data = []

    if bg_type == "black":
        for item in datas:
            brightness = max(item[0], item[1], item[2])
            if brightness < 18:
                new_data.append((0, 0, 0, 0))
            elif brightness < 36:
                alpha = int((brightness - 18) / 18 * 255)
                new_data.append((item[0], item[1], item[2], alpha))
            else:
                new_data.append(item)
    elif bg_type == "white":
        for item in datas:
            min_val = min(item[0], item[1], item[2])
            if min_val > 242:
                new_data.append((255, 255, 255, 0))
            elif min_val > 222:
                alpha = int((242 - min_val) / 20 * 255)
                new_data.append((item[0], item[1], item[2], alpha))
            else:
                new_data.append(item)

    img.putdata(new_data)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    return img

for item in files:
    src_path = item["src"]
    dest_path = item["dest"]
    print(f"Processing {src_path} -> {dest_path}...")
    img = Image.open(src_path)
    processed = make_transparent(img, item["bg_type"])
    processed.thumbnail(item["size"], Image.Resampling.LANCZOS)
    processed.save(dest_path, "WEBP", quality=90)
    print(f"[OK] Saved {dest_path} ({os.path.getsize(dest_path) / 1024:.1f} KB)")

print("All earwax sprites processed successfully!")
