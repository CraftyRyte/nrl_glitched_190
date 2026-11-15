/* GLITCHED // TEAM 190 — shared behaviour for every page. No libraries.
   1 navigation · 2 scroll values (--scroll, --p, --pin) · 3 reveals · 4 hotspots · 5 diagram viewer · 6 route */
(function () {
  const doc = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const wide = matchMedia("(min-width: 1001px) and (min-height: 640px)");
  const $ = (s, c) => [...(c || document).querySelectorAll(s)];
  const clamp = v => Math.min(1, Math.max(0, v));

  // Pinned scroll sequences are a desktop extra: off on small screens and for reduced motion.
  const setPin = () => { doc.classList.toggle("pin", wide.matches && !reduce.matches); queue(); };
  wide.addEventListener("change", setPin); reduce.addEventListener("change", setPin);

  /* ---- 1. navigation ---- */
  const nav = document.querySelector(".nav"), toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    const open = v => { nav.classList.toggle("is-open", v); toggle.setAttribute("aria-expanded", String(v)); toggle.textContent = v ? "Close" : "Menu"; };
    toggle.addEventListener("click", () => open(!nav.classList.contains("is-open")));
    $(".nav-links a").forEach(a => a.addEventListener("click", () => open(false)));
    addEventListener("keydown", e => { if (e.key === "Escape") open(false); });
  }

  /* ---- 2. scroll values ----
     .progress            --scroll  0→1 down the page
     [data-p="exit"]      --p       0→1 while the element scrolls out of the top (hero)
     [data-p]             --p       0→1 while the element rises into view
     [data-pin]           --pin     0→1 across a tall pinned section; fires a "pin" event with the raw value */
  const bar = document.querySelector(".progress");
  const tracked = $("[data-p]"), pins = $("[data-pin]");
  let ticking = false;
  function queue() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  function frame() {
    ticking = false;
    const vh = innerHeight, y = scrollY, max = doc.scrollHeight - vh;
    if (bar) bar.style.setProperty("--scroll", max > 0 ? (y / max).toFixed(4) : 0);
    if (nav) nav.classList.toggle("is-solid", y > 24);
    if (reduce.matches) return;
    tracked.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) return;
      const p = el.dataset.p === "exit" ? clamp(-r.top / (r.height * 0.85)) : clamp((vh - r.top) / (vh * 0.9));
      el.style.setProperty("--p", p.toFixed(4));
    });
    pins.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) return;
      const on = doc.classList.contains("pin");
      const q = on ? clamp(-r.top / Math.max(1, r.height - vh)) : 1;
      // data-pin="3": dwell on each of 3 panels and glide between them
      const n = +el.dataset.pin || 0;
      let v = q;
      if (n > 1 && on) { const seg = q * (n - 1), i = Math.min(n - 2, Math.floor(seg)), t = seg - i; v = (i + clamp((t - 0.22) / 0.56)) / (n - 1); }
      el.style.setProperty("--pin", v.toFixed(4));
      el.dispatchEvent(new CustomEvent("pin", { detail: { q, on } }));
    });
  }
  addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", queue);
  setPin(); frame();

  /* ---- 3. reveals (once, on entering the viewport) ---- */
  const revealEls = $("[data-rise],[data-wipe],[data-lines],.ledger li");
  if ("IntersectionObserver" in window && !reduce.matches) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -12% 0px", threshold: 0.05 });
    revealEls.forEach(el => io.observe(el));
  } else revealEls.forEach(el => el.classList.add("is-in"));

  /* ---- 4. hotspots: numbered dots on an image, linked to a list or table rows ---- */
  $("[data-hs]").forEach(box => {
    const dots = $(".hs-dot", box), items = $("[data-hs-item]", box);
    const pick = k => {
      dots.forEach(d => d.setAttribute("aria-pressed", String(d.dataset.k === k)));
      items.forEach(it => { const on = it.dataset.k === k; it.classList.toggle("is-on", on); const b = it.querySelector("button"); if (b) b.setAttribute("aria-expanded", String(on)); });
    };
    dots.forEach(d => d.addEventListener("click", () => pick(d.dataset.k)));
    items.forEach(it => {
      const b = it.querySelector("button");
      if (b) b.addEventListener("click", () => pick(it.dataset.k));
      else { it.tabIndex = 0; it.addEventListener("click", () => pick(it.dataset.k)); it.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(it.dataset.k); } }); }
    });
    if (items[0]) pick(items[0].dataset.k);
  });

  /* ---- 5. diagram viewer: zoom and pan a large image (wheel, drag, buttons, keys) ---- */
  let viewer;
  function openViewer(src, alt, caption) {
    if (!viewer) {
      viewer = document.createElement("dialog");
      viewer.className = "viewer";
      viewer.innerHTML = `<div class="viewer-canvas"><img alt=""></div>
        <div class="viewer-bar"><p></p><div class="viewer-tools">
        <button type="button" data-z="out" aria-label="Zoom out">−</button><button type="button" data-z="in" aria-label="Zoom in">+</button>
        <button type="button" data-z="reset">Reset</button><button type="button" data-z="close">Close</button></div></div>`;
      document.body.appendChild(viewer);
      const img = viewer.querySelector("img"), canvas = viewer.querySelector(".viewer-canvas");
      const s = { z: 1, x: 0, y: 0 };
      const apply = () => { s.z = Math.min(5, Math.max(1, s.z)); if (s.z === 1) { s.x = 0; s.y = 0; } img.style.setProperty("--z", s.z); img.style.setProperty("--tx", s.x + "px"); img.style.setProperty("--ty", s.y + "px"); };
      viewer.reset = () => { s.z = 1; apply(); };
      viewer.addEventListener("click", e => {
        const b = e.target.closest("[data-z]"); if (!b) return;
        if (b.dataset.z === "in") s.z *= 1.5; else if (b.dataset.z === "out") s.z /= 1.5; else if (b.dataset.z === "reset") s.z = 1; else return viewer.close();
        apply();
      });
      canvas.addEventListener("wheel", e => { e.preventDefault(); s.z *= e.deltaY < 0 ? 1.15 : 1 / 1.15; apply(); }, { passive: false });
      let drag = null;
      canvas.addEventListener("pointerdown", e => { drag = { x: e.clientX - s.x, y: e.clientY - s.y }; canvas.setPointerCapture(e.pointerId); });
      canvas.addEventListener("pointermove", e => { if (!drag || s.z === 1) return; s.x = e.clientX - drag.x; s.y = e.clientY - drag.y; apply(); });
      canvas.addEventListener("pointerup", () => { drag = null; });
      canvas.addEventListener("dblclick", () => { s.z = s.z > 1 ? 1 : 2.5; apply(); });
      viewer.addEventListener("keydown", e => {
        const step = 60;
        if (e.key === "+" || e.key === "=") s.z *= 1.5; else if (e.key === "-") s.z /= 1.5; else if (e.key === "0") s.z = 1;
        else if (e.key === "ArrowLeft") s.x += step; else if (e.key === "ArrowRight") s.x -= step; else if (e.key === "ArrowUp") s.y += step; else if (e.key === "ArrowDown") s.y -= step; else return;
        e.preventDefault(); apply();
      });
    }
    const img = viewer.querySelector("img");
    img.src = src; img.alt = alt || "";
    viewer.querySelector("p").textContent = (caption ? caption + "  ·  " : "") + "Scroll or + / − to zoom, drag to move, Esc to close";
    viewer.reset(); viewer.showModal();
  }
  $("[data-zoom]").forEach(b => b.addEventListener("click", () => { const i = b.querySelector("img"); openViewer(b.dataset.zoom, i && i.alt, b.dataset.caption); }));

  /* ---- 6. planned autonomous route: draws the path and moves a marker along it ---- */
  $("[data-route]").forEach(box => {
    const live = box.querySelector(".path-live"), bot = box.querySelector(".bot"), stops = $(".stop", box), btn = box.querySelector("[data-replay]"), out = box.querySelector("[data-route-step]");
    if (!live) return;
    const L = live.getTotalLength();
    live.style.strokeDasharray = L;
    // where along the path each numbered stop sits, in visiting order
    let from = 0; const N = 600;
    const at = stops.map(s => {
      const x = +s.dataset.x, y = +s.dataset.y;
      for (let i = from; i <= N; i++) { const p = live.getPointAtLength(L * i / N); if (Math.hypot(p.x - x, p.y - y) < 9) { from = i + 6; return i / N; } }
      return 1;
    });
    const draw = r => {
      live.style.strokeDashoffset = L * (1 - r);
      const p = live.getPointAtLength(L * r); bot.setAttribute("cx", p.x); bot.setAttribute("cy", p.y);
      let last = -1; stops.forEach((s, i) => { const on = r >= at[i] - 0.002; s.classList.toggle("is-on", on); if (on) last = i; });
      if (out) out.textContent = last < 0 ? "Start zone" : "Stop " + (last + 1) + " of " + stops.length + ": " + stops[last].dataset.label;
    };
    let raf = 0;
    const play = () => {
      cancelAnimationFrame(raf);
      if (reduce.matches) return draw(1);
      const t0 = performance.now(), dur = 11000;
      const step = t => { const r = clamp((t - t0) / dur); draw(r); if (r < 1) raf = requestAnimationFrame(step); };
      raf = requestAnimationFrame(step);
    };
    draw(reduce.matches ? 1 : 0);
    if (btn) btn.addEventListener("click", play);
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { play(); io.disconnect(); } }), { threshold: 0.45 });
      io.observe(box);
    } else draw(1);
  });
})();
