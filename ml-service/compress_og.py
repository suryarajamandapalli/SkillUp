import os
from PIL import Image

src_image = r"C:\Users\surya\.gemini\antigravity\brain\158486d5-33bf-4a91-a21c-0c5b0872e6a3\media__1783653857483.png"
dest_image = r"c:\Users\surya\OneDrive\ONE DRIVE\Desktop\Smart Career Prediction System\frontend\public\og-preview.jpg"

if os.path.exists(src_image):
    print("Source image found! Fitting on 1200x630 canvas...")
    img = Image.open(src_image)
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Create white canvas of 1200x630
    canvas = Image.new('RGB', (1200, 630), (255, 255, 255))
    
    # Scale image to fit within margins
    max_w = 1100
    max_h = 580
    
    w, h = img.size
    ratio = min(max_w / w, max_h / h)
    new_w = int(w * ratio)
    new_h = int(h * ratio)
    
    img_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Calculate centering coordinates
    x = (1200 - new_w) // 2
    y = (630 - new_h) // 2
    
    canvas.paste(img_resized, (x, y))
    
    # Save as compressed JPEG
    canvas.save(dest_image, "JPEG", quality=75, optimize=True)
    print(f"Success! Canvas file size: {os.path.getsize(dest_image)} bytes")
else:
    print("Source image not found.")
