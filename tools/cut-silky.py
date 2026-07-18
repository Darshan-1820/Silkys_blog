# Background-remove Silky's photo → transparent sticker cutout (WebP).
from rembg import remove, new_session
from PIL import Image

session = new_session("u2net_human_seg")
inp = Image.open("public/silky.jpg").convert("RGBA")
out = remove(
    inp, session=session,
    alpha_matting=True,
    alpha_matting_foreground_threshold=240,
    alpha_matting_background_threshold=15,
    alpha_matting_erode_size=8,
)
# trim to her silhouette
bbox = out.getbbox()
if bbox:
    out = out.crop(bbox)
out.save("public/desk/silky.webp", "WEBP", quality=92, method=6)
print("saved public/desk/silky.webp", out.size)
