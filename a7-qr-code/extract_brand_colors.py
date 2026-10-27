from PIL import Image
from collections import Counter
import json

# Load Logo.jpg
img_path = r"..\Brand Information\Logo.jpg"
im = Image.open(img_path).convert("RGB")

# Resize for fast, accurate color sampling
im_small = im.resize((150, 150))
pixels = list(im_small.getdata())

# Filter out pure whites / very light backgrounds (e.g. > 245 in all channels) to focus on brand colors
brand_pixels = [p for p in pixels if not (p[0] > 240 and p[1] > 240 and p[2] > 240)]

# Quantize into common color buckets
def quantize(rgb, step=16):
    return (
        round(rgb[0] / step) * step,
        round(rgb[1] / step) * step,
        round(rgb[2] / step) * step
    )

quantized = [quantize(p) for p in brand_pixels]
counts = Counter(quantized).most_common(20)

def rgb_to_hex(rgb):
    return f"#{min(255, max(0, rgb[0])):02X}{min(255, max(0, rgb[1])):02X}{min(255, max(0, rgb[2])):02X}"

results = []
for color, count in counts:
    hex_code = rgb_to_hex(color)
    results.append({
        "rgb": color,
        "hex": hex_code,
        "count": count
    })

with open("extracted_colors.json", "w") as f:
    json.dump(results, f, indent=2)

print("Color extraction completed.")
