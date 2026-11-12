/* Polish: progress bar, custom cursor, magnetic buttons, card tilt, scrollspy,
   staggered entrances, heading decode, count-up, hero parallax, page wipe, marquee pausing. */
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const root = document.documentElement, rAF = requestAnimationFrame;
  const $ = (s, c) => [...(c || document).querySelectorAll(s)];
  if (!reduce) root.classList.add("pj");

  // scroll progress
  const bar = document.createElement("div"); bar.className = "progress"; document.body.appendChild(bar);
  let pt = false;
  const prog = () => { pt = false; bar.style.transform = "scaleX(" + Math.min(1, scrollY / Math.max(1, root.scrollHeight - innerHeight)) + ")"; };
  addEventListener("scroll", () => { if (!pt) { pt = true; rAF(prog); } }, { passive: true }); prog();

  // scrollspy (home page)
  const links = $("nav a[href^='#']");
  if (links.length && "IntersectionObserver" in window) {
    const map = new Map(links.map(a => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.remove("active"));
      const a = map.get(e.target.id); if (a) a.classList.add("active");
    }), { rootMargin: "-45% 0px -50% 0px" });
    ["about", "challenge", "build", "team", "contact"].forEach(id => { const s = document.getElementById(id); if (s) spy.observe(s); });
    $(".hero").forEach(h => spy.observe(h));
  }

  // custom cursor
  if (fine && !reduce) {
    const dot = document.createElement("div"), ring = document.createElement("div");
    dot.className = "cur-dot"; ring.className = "cur-ring";
    document.body.append(dot, ring);
    let tx = -100, ty = -100, rx = tx, ry = ty, run = false;
    const loop = () => { rx += (tx - rx) * .18; ry += (ty - ry) * .18; ring.style.transform = `translate(${rx}px,${ry}px)`;
      if (Math.abs(tx - rx) + Math.abs(ty - ry) > .3) rAF(loop); else run = false; };
    addEventListener("mousemove", e => {
      tx = e.clientX; ty = e.clientY; dot.style.transform = `translate(${tx}px,${ty}px)`;
      root.classList.add("pj-cursor");
      if (!run) { run = true; rAF(loop); }
    }, { passive: true });
    document.addEventListener("mouseover", e => ring.classList.toggle("hot", !!(e.target.closest && e.target.closest("a,button,.btn,.strip"))));
    addEventListener("mousedown", () => ring.classList.add("down"));
    addEventListener("mouseup", () => ring.classList.remove("down"));
    document.documentElement.addEventListener("mouseleave", () => root.classList.remove("pj-cursor"));
  }

  // magnetic buttons, card tilt + spotlight, hero parallax
  if (fine && !reduce) {
    $(".btn").forEach(b => {
      b.addEventListener("mousemove", e => { const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`; });
      b.addEventListener("mouseleave", () => { b.style.transform = ""; });
    });
    $("#members .strip").forEach(c => {
      c.addEventListener("mousemove", e => { const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        c.style.setProperty("--mx", px * 100 + "%"); c.style.setProperty("--my", py * 100 + "%");
        c.style.transform = `perspective(800px) rotateX(${(.5 - py) * 8}deg) rotateY(${(px - .5) * 10}deg) translateY(-3px)`; });
      c.addEventListener("mouseleave", () => { c.style.transform = ""; });
    });
    const hero = document.querySelector(".hero"), lh = document.querySelector(".hero .logo-hud"), ht = document.querySelector(".hero-text");
    if (hero && lh && ht) {
      hero.addEventListener("mousemove", e => { const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
        lh.style.transform = `translate(${x * -22}px,${y * -16}px)`; ht.style.transform = `translate(${x * 8}px,${y * 6}px)`; });
      hero.addEventListener("mouseleave", () => { lh.style.transform = ""; ht.style.transform = ""; });
    }
  }

  // stagger indices
  [".points li", ".roles li", ".stats div", ".steps li", "#members .strip", ".terminal p"].forEach(g => $(g).forEach((el, i) => el.style.setProperty("--i", i)));

  // slide entrance: heading decode, count-up
  function scramble(el) {
    if (!el.dataset.fin) el.dataset.fin = el.textContent;      // the real text, saved once
    const fin = el.dataset.fin, pool = fin.replace(/\s/g, "") || "01", N = 22; let f = 0;
    if (el.dataset.busy) return; el.dataset.busy = "1";        // never run two at once
    el.setAttribute("aria-label", fin);
    (function step() {
      f++; const k = Math.floor(fin.length * f / N); let s = "";
      for (let i = 0; i < fin.length; i++) s += (i < k || fin[i] === " ") ? fin[i] : pool[(Math.random() * pool.length) | 0];
      el.textContent = s;
      if (f < N) setTimeout(step, 32); else { el.textContent = fin; delete el.dataset.busy; }
    })();
  }
  function onIn(slide) {
    if (reduce || slide.dataset.done) return; slide.dataset.done = "1";
    $("h2", slide).forEach(scramble);
    $(".stats b", slide).forEach(b => { const n = +b.textContent, t0 = performance.now();
      (function s(now) { const p = Math.min(1, (now - t0) / 900); b.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))); if (p < 1) rAF(s); })(t0); });
  }
  if ("IntersectionObserver" in window) {
    const sio = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && !document.body.classList.contains("film")) { e.target.classList.add("in"); sio.unobserve(e.target); onIn(e.target); }
    }), { threshold: .2 });
    $(".slide").forEach(s => sio.observe(s));
    // intro ends later: mark whatever is visible then
    const mo = new MutationObserver(() => { if (!document.body.classList.contains("film")) { mo.disconnect(); $(".slide").forEach(s => { if (!s.classList.contains("in")) { sio.unobserve(s); sio.observe(s); } }); } });
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    // marquee only animates while visible
    const mio = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle("paused", !e.isIntersecting)));
    $(".mq-track").forEach(t => mio.observe(t));
  } else root.classList.remove("pj");

  // page wipe between pages
  if (!reduce) {
    const wipe = document.createElement("div"); wipe.className = "wipe"; document.body.appendChild(wipe);
    let flag = false; try { flag = sessionStorage.getItem("wipe"); sessionStorage.removeItem("wipe"); } catch (e) {}
    if (flag) { wipe.classList.add("cover"); rAF(() => rAF(() => wipe.classList.add("out"))); }
    document.addEventListener("click", e => {
      const a = e.target.closest && e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || u.pathname === location.pathname) return;
      e.preventDefault(); try { sessionStorage.setItem("wipe", "1"); } catch (er) {}
      wipe.classList.add("go"); setTimeout(() => { location.href = a.href; }, 450);
    });
    addEventListener("pageshow", e => { if (e.persisted) wipe.className = "wipe"; });
  }
})();
