"""Browser checks for the GLITCHED site (Playwright, Python).

Run from the repo root:
    python3 -m http.server 8777 &
    python3 tests/test_site.py            # uses Playwright's Chromium
    CHROME=/usr/bin/google-chrome python3 tests/test_site.py   # or a local Chrome

Checks every page on desktop and phone: no console errors, no failed requests, every image loads,
every internal link resolves, no sideways scrolling, plus the interactive parts (menu, hotspots,
diagram viewer, route, pinned sequences, member profiles, reduced motion).
"""
import os, sys, re
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE", "http://localhost:8777/")
PAGES = ["index.html", "robot.html", "engineering.html", "build-log.html", "team.html", "strategy.html", "member.html?id=1"]
DESKTOP, PHONE = {"width": 1440, "height": 900}, {"width": 390, "height": 844}
fails, passes = [], 0

def check(ok, label):
    global passes
    if ok: passes += 1
    else: fails.append(label); print("  FAIL", label)

def open_page(browser, url, viewport, reduced=False):
    ctx = browser.new_context(viewport=viewport, reduced_motion="reduce" if reduced else "no-preference")
    page = ctx.new_page(); page.errors = []; page.bad = []
    page.on("console", lambda m: page.errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: page.errors.append(str(e)))
    page.on("requestfailed", lambda r: page.bad.append(r.url))
    page.on("response", lambda r: page.bad.append(f"{r.status} {r.url}") if r.status >= 400 else None)
    page.goto(BASE + url); page.wait_for_load_state("networkidle")
    return ctx, page

def scroll_through(page):
    h = page.evaluate("document.documentElement.scrollHeight")
    y = 0
    while y < h:
        page.evaluate(f"window.scrollTo(0,{y})"); page.wait_for_timeout(120); y += 500
        h = page.evaluate("document.documentElement.scrollHeight")
    page.wait_for_timeout(500)

def run():
    with sync_playwright() as p:
        kw = {"executable_path": os.environ["CHROME"], "args": ["--no-sandbox"]} if os.environ.get("CHROME") else {}
        b = p.chromium.launch(**kw)

        # ---- every page, both sizes ----
        links = set()
        for url in PAGES:
            for name, vp in (("desktop", DESKTOP), ("phone", PHONE)):
                ctx, page = open_page(b, url, vp)
                tag = f"{url} [{name}]"
                scroll_through(page)
                check(not page.errors, f"{tag}: console errors {page.errors[:3]}")
                check(not page.bad, f"{tag}: failed requests {page.bad[:3]}")
                broken = page.evaluate("[...document.images].filter(i=>!(i.complete&&i.naturalWidth>0)).map(i=>i.getAttribute('src'))")
                check(not broken, f"{tag}: images not loaded {broken}")
                noalt = page.evaluate("[...document.images].filter(i=>!i.hasAttribute('alt')).length")
                check(noalt == 0, f"{tag}: {noalt} images without alt")
                over = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
                check(over <= 1, f"{tag}: page scrolls sideways by {over}px")
                check(page.locator("h1").count() == 1, f"{tag}: expected exactly one h1, found {page.locator('h1').count()}")
                check(bool(page.title()) and "GLITCHED" in page.title(), f"{tag}: title '{page.title()}'")
                check(page.locator('meta[name=description]').count() == 1, f"{tag}: meta description")
                for h in page.evaluate("[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href'))"):
                    if not re.match(r"^(https?:|mailto:)", h): links.add((url.split("?")[0], h))
                ctx.close()

        # ---- internal links and anchors ----
        ctx, page = open_page(b, "index.html", DESKTOP)
        for src, h in sorted(links):
            path, _, frag = h.partition("#")
            target = path or src
            r = page.request.get(BASE + target)
            check(r.status == 200, f"link {h} (from {src}) -> {r.status}")
            if frag and r.status == 200:
                check(re.search(r'id="%s"' % re.escape(frag), r.text()) is not None, f"anchor #{frag} missing in {target.split('?')[0]} (from {src})")
        ctx.close()

        # ---- member profiles ----
        names = ["Pranjal", "Saanvi Kumar", "Abhijay", "Naomi", "Neil", "Saanvi Lalwani", "Rhea", "Neha"]
        for i, n in enumerate(names, 1):
            ctx, page = open_page(b, f"member.html?id={i}", DESKTOP)
            check(page.locator("h1").inner_text().strip().lower() == n.lower(), f"member {i} shows {n}")
            check(n in page.title(), f"member {i} title")
            check(page.evaluate("(()=>{const i=document.querySelector('#member img');return i.complete&&i.naturalWidth>0})()"), f"member {i} portrait loads")
            check(not page.errors, f"member {i} errors {page.errors[:2]}")
            ctx.close()
        ctx, page = open_page(b, "member.html?id=99", DESKTOP)
        check("No such profile" in page.locator("h1").inner_text() or "NO SUCH PROFILE" in page.locator("h1").inner_text().upper(), "unknown member id shows a message")
        ctx.close()
        ctx, page = open_page(b, "team.html", DESKTOP)
        check(page.locator("#roster li").count() == 8, "team page lists 8 members")
        check(page.locator("#matrix tr").count() == 14, "responsibility matrix has 14 rows")
        page.locator("#roster a").nth(4).click(); page.wait_for_load_state("networkidle")
        check("id=5" in page.url and "NEIL" in page.locator("h1").inner_text().upper(), "roster link opens Neil's profile")
        ctx.close()

        # ---- home: interactions on desktop ----
        ctx, page = open_page(b, "index.html", DESKTOP)
        check(page.evaluate("document.documentElement.classList.contains('pin')"), "desktop: pinned mode on")
        check(page.locator(".rail a").count() == 11, "chapter rail has 11 chapters")
        check(page.locator("#slats a").count() == 8, "home shows 8 portrait slats")
        check(page.locator("#credits div").count() == 14, "closing credits list 14 work areas")
        # prototype sequence: stage follows scroll
        top = page.evaluate("document.querySelector('.proto').getBoundingClientRect().top+scrollY"); H = page.evaluate("document.querySelector('.proto').offsetHeight - innerHeight")
        seen = []
        for f in (0.05, 0.5, 0.92):
            page.evaluate(f"window.scrollTo(0,{top + H * f})"); page.wait_for_timeout(700)
            seen.append(page.evaluate("[...document.querySelectorAll('.proto-stage')].findIndex(s=>s.classList.contains('is-on'))"))
            check(page.evaluate("Math.abs(document.querySelector('.proto-in').getBoundingClientRect().top) < 2"), f"prototype sequence stays pinned at {f}")
        check(seen == [0, 1, 2], f"prototype stages follow scroll: {seen}")
        check(page.evaluate("document.querySelectorAll('.proto-stage.is-on .proto-chain div.is-on').length") == 5, "all five rows lit at the end of P3")
        check("PLANNED" in page.locator(".proto-stage.is-on").inner_text().upper(), "P3 is labelled planned")
        # hood: three panels slide sideways
        top = page.evaluate("document.querySelector('.hood').getBoundingClientRect().top+scrollY"); H = page.evaluate("document.querySelector('.hood').offsetHeight - innerHeight")
        xs = []
        for f in (0.0, 0.5, 1.0):
            page.evaluate(f"window.scrollTo(0,{top + H * f})"); page.wait_for_timeout(500)
            xs.append(round(page.evaluate("document.querySelector('.hood-track').getBoundingClientRect().left")))
        check(xs == [0, -1440, -2880], f"hood panels land on each panel: {xs}")
        # hotspots
        page.evaluate("document.querySelector('#pixel .hs').scrollIntoView({block:'center'})"); page.wait_for_timeout(400)
        page.locator("#pixel .hs-dot").nth(3).click()
        check(page.locator("#pixel .hs-item.is-on button").inner_text().strip().upper().endswith("HEXA COMMAND HUB"), "hotspot dot selects its description")
        page.locator("#pixel .hs-item button").nth(5).click()
        check(page.locator("#pixel .hs-dot[aria-pressed=true]").inner_text().strip() == "6", "hotspot list selects its dot")
        page.locator("#pixel .hs-dot").nth(0).focus(); page.keyboard.press("Enter")
        check(page.locator("#pixel .hs-dot").nth(0).get_attribute("aria-pressed") == "true", "hotspots work from the keyboard")
        # viewer (reach the electrical panel first)
        top = page.evaluate("document.querySelector('.hood').getBoundingClientRect().top+scrollY"); H = page.evaluate("document.querySelector('.hood').offsetHeight - innerHeight")
        page.evaluate(f"window.scrollTo(0,{top + H * 0.5})"); page.wait_for_timeout(500)
        page.locator(".hood .zoom").click(); page.wait_for_timeout(300)
        check(page.evaluate("document.querySelector('dialog.viewer').open"), "wiring diagram opens in the viewer")
        page.locator(".viewer [data-z=in]").click(); page.locator(".viewer [data-z=in]").click()
        check(float(page.evaluate("getComputedStyle(document.querySelector('.viewer img')).getPropertyValue('--z')")) > 2, "viewer zooms in")
        page.keyboard.press("Escape"); page.wait_for_timeout(200)
        check(not page.evaluate("document.querySelector('dialog.viewer').open"), "Esc closes the viewer")
        # route
        page.evaluate("document.querySelector('#autonomous [data-route]').scrollIntoView({block:'center'})"); page.wait_for_timeout(12500)
        check(page.locator("#autonomous .stop.is-on").count() == 9, "route animation reaches all 9 stops")
        check("NOT YET TESTED" in page.locator("#autonomous .route-bar").inner_text().upper(), "route is labelled as untested")
        check(not page.errors, f"home interactions: errors {page.errors[:3]}")
        ctx.close()

        # ---- engineering + strategy interactions ----
        ctx, page = open_page(b, "engineering.html", DESKTOP)
        page.evaluate("document.querySelector('#controls .map').scrollIntoView({block:'center'})"); page.wait_for_timeout(300)
        page.locator("#controls .map tbody tr").nth(4).click()
        check(page.locator("#controls .hs-dot[aria-pressed=true]").get_attribute("data-k") == "rb", "controller table highlights the RB button")
        page.locator("#electrical .zoom").click(); page.wait_for_timeout(300)
        check(page.evaluate("document.querySelector('dialog.viewer').open"), "engineering: wiring viewer opens")
        ctx.close()
        ctx, page = open_page(b, "strategy.html", DESKTOP)
        page.locator("#field .hs-dot").nth(2).click()
        check("SPACE STATION" in page.locator("#field .hs-item.is-on").inner_text().upper(), "field marker selects Space Station")
        check("EXPECTED" in page.locator("#score").inner_text().upper() and "NOT A RESULT" in page.locator("#score").inner_text().upper(), "score is labelled expected, not a result")
        ctx.close()

        # ---- phone: menu, no pinning ----
        ctx, page = open_page(b, "index.html", PHONE)
        check(not page.evaluate("document.documentElement.classList.contains('pin')"), "phone: pinned mode off")
        shown = page.evaluate("[...document.querySelectorAll('.proto-stage')].filter(s=>getComputedStyle(s).visibility==='visible'&&getComputedStyle(s).opacity==='1'&&s.offsetHeight>100).length")
        check(shown == 3, f"phone: all three prototype stages are shown ({shown})")
        check(not page.locator(".nav-links").is_visible(), "phone: menu starts closed")
        page.locator(".nav-toggle").click()
        check(page.locator(".nav-links").is_visible() and page.locator(".nav-toggle").get_attribute("aria-expanded") == "true", "phone: menu opens")
        page.locator(".nav-links a", has_text="Team").click(); page.wait_for_load_state("networkidle")
        check(page.url.endswith("team.html"), "phone: menu link navigates")
        ctx.close()

        # ---- reduced motion ----
        ctx, page = open_page(b, "index.html", DESKTOP, reduced=True)
        check(not page.evaluate("document.documentElement.classList.contains('pin')"), "reduced motion: no pinned sequences")
        scroll_through(page)
        hidden = page.evaluate("[...document.querySelectorAll('[data-rise],[data-lines] span')].filter(e=>getComputedStyle(e).opacity==='0'||getComputedStyle(e).clipPath.includes('100%')).length")
        check(hidden == 0, f"reduced motion: {hidden} elements still hidden")
        check(page.locator("#autonomous .stop.is-on").count() == 9, "reduced motion: route shown complete")
        ctx.close()

        # ---- without JavaScript the content is still there ----
        ctx = b.new_context(viewport=DESKTOP, java_script_enabled=False); page = ctx.new_page(); page.goto(BASE + "index.html")
        check(page.locator("h1").is_visible() and page.locator("#build .proto-chain").first.is_visible(), "no JavaScript: content is visible")
        ctx.close()
        b.close()

    print(f"\n{passes} checks passed, {len(fails)} failed")
    for f in fails: print("  -", f)
    sys.exit(1 if fails else 0)

if __name__ == "__main__":
    run()
