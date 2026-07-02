from playwright.sync_api import sync_playwright
BASE = "http://localhost:4323"

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page(viewport={"width": 1280, "height": 1000})
    perr = []
    pg.on("pageerror", lambda e: perr.append(str(e)))

    # login
    pg.goto(f"{BASE}/admin/login", wait_until="networkidle")
    pg.fill('input[name="password"]', "moonlit2am")
    pg.click('button[type="submit"]'); pg.wait_for_load_state("networkidle")

    # homepage manager
    pg.goto(f"{BASE}/admin/home", wait_until="networkidle")
    assert pg.locator("text=your homepage").count() > 0
    print("OK  homepage manager loads")

    # add a BOOKS section -> should navigate to the editor
    pg.click('.type-btn[data-type="books"]')
    pg.wait_for_url("**/admin/section/**", timeout=8000)
    print("OK  add books -> editor opened")

    # fill heading + one book, show it, save
    pg.fill("#f-heading", "books i loved this month")
    pg.click("#add-item")
    row = pg.locator(".item-row").last
    row.locator('[data-field="title"]').fill("The Song of Achilles")
    row.locator('[data-field="author"]').fill("Madeline Miller")
    row.locator('[data-field="note"]').fill("wrecked me, gently")
    if not pg.is_checked("#f-show"):
        pg.check("#f-show")
    pg.click("#btn-save")
    pg.wait_for_selector("#save-status.ok", timeout=8000)
    print("OK  books section saved + shown")

    # appears on homepage?
    pg.goto(f"{BASE}/", wait_until="networkidle")
    body = pg.content()
    assert "books i loved this month" in body, "books heading missing on homepage"
    assert "The Song of Achilles" in body, "book title missing on homepage"
    print("OK  books section renders on homepage")

    # add a TEXT (venting) section, plain design
    pg.goto(f"{BASE}/admin/home", wait_until="networkidle")
    pg.click('.type-btn[data-type="text"]')
    pg.wait_for_url("**/admin/section/**", timeout=8000)
    pg.select_option("#f-design", "plain")
    pg.fill("#f-heading", "a small vent")
    pg.fill("#f-body", "today was long.\n\nbut the tea was warm.")
    if not pg.is_checked("#f-show"):
        pg.check("#f-show")
    pg.click("#btn-save"); pg.wait_for_selector("#save-status.ok", timeout=8000)
    pg.goto(f"{BASE}/", wait_until="networkidle")
    assert "a small vent" in pg.content(), "vent heading missing"
    assert "the tea was warm" in pg.content(), "vent body missing"
    print("OK  venting/text section renders on homepage")

    # manager shows both new sections + reorder controls
    pg.goto(f"{BASE}/admin/home", wait_until="networkidle")
    rows = pg.locator(".sec-row").count()
    assert rows >= 5, f"expected >=5 sections, got {rows}"
    print(f"OK  manager lists {rows} sections")

    pg.screenshot(path="tools/shot-home-sections.png", full_page=True)
    if perr:
        print("PAGE ERRORS:", perr[:5])
    b.close()
    print("\nALL SECTION TESTS PASSED")
