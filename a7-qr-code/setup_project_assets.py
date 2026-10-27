import os
import shutil
import qrcode
from PIL import Image, ImageDraw

# Create directories
os.makedirs("assets", exist_ok=True)
os.makedirs("qr_code", exist_ok=True)

# 1. Copy Logo.jpg to assets/logo.jpg
src_logo = r"..\Brand Information\Logo.jpg"
dst_logo = r"assets\logo.jpg"
if os.path.exists(src_logo):
    shutil.copy2(src_logo, dst_logo)
    print("Copied logo to assets/logo.jpg")

# 2. Generate Production Branded QR Code
# Uses Navy #143C78 from the logo
qr = qrcode.QRCode(
    version=3,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=12,
    border=2,
)
# Configured URL (can be updated to final domain / GitHub Pages)
qr.add_data("https://a7agrovet.com/connect")
qr.make(fit=True)

img_qr = qr.make_image(fill_color="#143C78", back_color="white").convert("RGB")

if os.path.exists(dst_logo):
    logo = Image.open(dst_logo).convert("RGBA")
    qr_w, qr_h = img_qr.size
    
    # Calculate logo size (24% of QR code width)
    logo_size = int(qr_w * 0.24)
    logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    
    # Create circular mask
    mask = Image.new("L", (logo_size, logo_size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, logo_size, logo_size), fill=255)
    
    # Create white protective background ring around logo
    ring_size = logo_size + 16
    ring = Image.new("RGBA", (ring_size, ring_size), (255, 255, 255, 255))
    ring_mask = Image.new("L", (ring_size, ring_size), 0)
    ring_draw = ImageDraw.Draw(ring_mask)
    ring_draw.ellipse((0, 0, ring_size, ring_size), fill=255)
    
    # Add green boundary ring
    green_ring = Image.new("RGBA", (ring_size, ring_size), (80, 160, 20, 255)) # #50A014
    green_draw = ImageDraw.Draw(ring_mask)
    
    qr_rgba = img_qr.convert("RGBA")
    pos_ring = ((qr_w - ring_size) // 2, (qr_h - ring_size) // 2)
    pos_logo = ((qr_w - logo_size) // 2, (qr_h - logo_size) // 2)
    
    qr_rgba.paste(ring, pos_ring, ring_mask)
    qr_rgba.paste(logo, pos_logo, mask)
    final_qr = qr_rgba.convert("RGB")
    
    # Save production QR code assets
    final_qr.save(r"qr_code\a7_social_qr.png", quality=100)
    final_qr.save(r"assets\a7_social_qr.png", quality=100)
    final_qr.save("a7_presentation_qr.png", quality=100)
    print("Generated production branded QR code successfully!")
