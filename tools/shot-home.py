# Full homepage demo check — desktop + mobile, full page.
from playwright.sync_api import sync_playwright

def reveal(pg):
    # force reveal-on-scroll elements visible (IntersectionObserver won't fire reliably headless)
    pg.add_style_tag(content=".rv,[class*='rv']{opacity:1 !important;transform:none !important}")
    pg.evaluate("""async () => { const h=document.body.scrollHeight;
      for(let y=0;y<=h;y+=400){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,50));}
      window.scrollTo(0,0);}""")
    pg.wait_for_timeout(700)

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1280, "height": 900})
    pg.goto("http://localhost:4321/", wait_until="networkidle")
    reveal(pg)
    pg.screenshot(path=".ref-shots/home-demo.png", full_page=True)
    # one post page
    pg.goto("http://localhost:4321/blog/moonlit-nights", wait_until="networkidle")
    reveal(pg)
    pg.screenshot(path=".ref-shots/post-demo.png", full_page=True)
    pg.close()
    m = b.new_page(viewport={"width": 390, "height": 844})
    m.goto("http://localhost:4321/", wait_until="networkidle")
    reveal(m)
    m.screenshot(path=".ref-shots/home-demo-mobile.png", full_page=True)
    b.close()
print("done")
