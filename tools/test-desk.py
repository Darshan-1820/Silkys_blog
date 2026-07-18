# Interaction test for the /about desk: tap -> note, Escape close, parallax.
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    pg.goto("http://localhost:4321/about", wait_until="networkidle")

    pg.click(".o-smokes")
    pg.wait_for_timeout(400)
    assert pg.is_visible("#deskCard.open"), "note did not open"
    print("smokes note:", pg.inner_text("#deskCard .dc-body h3"))
    pg.keyboard.press("Escape")
    pg.wait_for_timeout(300)
    assert not pg.is_visible("#deskCard.open"), "Escape did not close"

    pg.click(".d-diary")
    pg.wait_for_timeout(400)
    body = pg.inner_text("#deskCard .dc-body")
    print("diary opens:", "long version" in body)
    pg.keyboard.press("Escape")
    pg.wait_for_timeout(300)

    pg.mouse.move(200, 300)
    pg.mouse.move(1200, 700)
    pg.wait_for_timeout(300)
    tx = pg.evaluate("document.querySelector('.o-books').style.getPropertyValue('--tx')")
    print("parallax --tx on books:", repr(tx))
    assert tx not in ("", "0px"), "parallax not moving"

    pg.screenshot(path=".ref-shots/about-note-open.png")
    b.close()
print("ALL PASS")
