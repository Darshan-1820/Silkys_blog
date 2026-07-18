# Quick visual check of /about: desktop day + night, mobile day.
from playwright.sync_api import sync_playwright

URL = "http://localhost:4321/about"
OUT = ".ref-shots"

def reveal(pg):
    # trigger .rv IntersectionObserver reveals by scrolling through the page
    pg.evaluate("""async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y <= h; y += 300) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    }""")
    pg.wait_for_timeout(600)

with sync_playwright() as p:
    b = p.chromium.launch()
    m = b.new_page(viewport={"width": 390, "height": 844})
    m.goto(URL, wait_until="networkidle")
    reveal(m)
    m.screenshot(path=f"{OUT}/about-mobile.png", full_page=True)
    b.close()
print("done")
