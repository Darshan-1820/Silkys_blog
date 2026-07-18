# Mobile nav check: header with hamburger, and the opened menu.
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch()
    m = b.new_page(viewport={"width": 390, "height": 844})
    m.goto("http://localhost:4321/", wait_until="networkidle")
    m.wait_for_timeout(600)
    m.screenshot(path=".ref-shots/nav-closed.png", clip={"x":0,"y":0,"width":390,"height":120})
    tog = m.query_selector("#navToggle")
    print("toggle visible:", tog.is_visible() if tog else None)
    m.eval_on_selector("#navToggle", "el => el.click()")
    m.wait_for_timeout(500)
    m.screenshot(path=".ref-shots/nav-open.png", clip={"x":0,"y":0,"width":390,"height":360})
    about = m.query_selector("nav#siteNav a[href='/about']")
    print("about visible:", about.is_visible() if about else None)
    b.close()
print("done")
