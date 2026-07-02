import sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:4323"
SHOT = r"C:\Users\addar\Desktop\My Workspace\Blogger's website\tools"

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        errors = []
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)

        # 1) protected page bounces to login
        page.goto(f"{BASE}/admin/new", wait_until="networkidle")
        assert "/admin/login" in page.url, f"expected login redirect, got {page.url}"
        print("OK  unauth -> login")

        # 2) log in
        page.fill('input[name="password"]', "moonlit2am")
        page.click('button[type="submit"]')
        page.wait_for_load_state("networkidle")
        assert page.url.rstrip("/").endswith("/admin"), f"login landed on {page.url}"
        print("OK  login -> dashboard")

        # 3) open the editor
        page.goto(f"{BASE}/admin/new", wait_until="networkidle")
        page.wait_for_selector(".ProseMirror", timeout=8000)
        print("OK  editor mounted (TipTap loaded)")

        # 4) write a post the way Silky would
        page.fill("#f-title", "written in the browser")
        page.select_option("#f-section", "diary")
        page.fill("#f-excerpt", "typed straight into the editor, then published.")
        pm = page.locator(".ProseMirror")
        pm.click()
        pm.type("This paragraph was typed into the editor. ")
        page.click('button[data-cmd="bold"]')
        pm.type("This part is bold.")
        # new line + a heading
        pm.press("Enter")
        page.click('button[data-cmd="h2"]')
        pm.type("A heading Silky made")
        page.screenshot(path=f"{SHOT}/shot-editor.png")
        print("OK  wrote title, body, bold, heading")

        # 5) publish
        page.click('button[data-save="published"]')
        page.wait_for_url(f"{BASE}/admin", timeout=8000)
        assert page.locator("text=written in the browser").count() > 0
        print("OK  published -> shows on dashboard")

        # 6) appears on the public blog
        page.goto(f"{BASE}/", wait_until="networkidle")
        assert page.locator("text=written in the browser").count() > 0, "not on public wall"
        print("OK  post on public homepage wall")

        page.click("text=written in the browser")
        page.wait_for_load_state("networkidle")
        body = page.inner_text("body")
        assert "This part is bold." in body, "bold text missing on public page"
        assert "A heading Silky made" in body, "heading missing on public page"
        page.screenshot(path=f"{SHOT}/shot-published.png", full_page=True)
        print("OK  public post page renders body + formatting")

        if errors:
            print("CONSOLE ERRORS:", errors[:5])
        browser.close()
        print("\nALL BROWSER TESTS PASSED")

run()
