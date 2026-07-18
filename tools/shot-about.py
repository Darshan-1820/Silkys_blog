# Quick visual check of /about: desktop day + night, mobile, and two opened notes.
from playwright.sync_api import sync_playwright

URL = "http://localhost:4321/about"
OUT = ".ref-shots"

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1280, "height": 820})
    pg.goto(URL, wait_until="networkidle")
    pg.wait_for_timeout(900)
    pg.screenshot(path=f"{OUT}/about-day.png")

    # open the long version via the photo (with photo on top)
    pg.click(".d-polaroid")
    pg.wait_for_timeout(700)
    pg.screenshot(path=f"{OUT}/about-note-diary.png")
    pg.keyboard.press("Escape")
    pg.wait_for_timeout(300)

    # open a favourites note (books)
    pg.click(".o-books")
    pg.wait_for_timeout(700)
    pg.screenshot(path=f"{OUT}/about-note-books.png")
    pg.keyboard.press("Escape")
    pg.wait_for_timeout(300)

    # night
    pg.evaluate("document.documentElement.setAttribute('data-theme','night')")
    pg.wait_for_timeout(600)
    pg.screenshot(path=f"{OUT}/about-night.png")
    pg.close()

    # mobile
    m = b.new_page(viewport={"width": 390, "height": 844})
    m.goto(URL, wait_until="networkidle")
    m.wait_for_timeout(900)
    m.screenshot(path=f"{OUT}/about-mobile.png", full_page=True)
    b.close()
print("done")
