// Black hole tunnel background (quiet version).
// A faint event horizon with a thin photon ring sits behind the hero logo. Rings, spiral lines and sparks
// drift outward, and scrolling carries you deeper into the tunnel. Everything is deliberately low-contrast
// so the page content always wins. The hole's position/size/brightness are blended continuously from the
// scroll position (no jumps), and the canvas is cheap to draw (no blur filters, capped resolution).
// Tweak CONFIG to change the look; lower "strength" to make it even fainter.
(function () {
  const canvas = document.getElementById("bg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const CONFIG = {
    idleFps: 0,            // redraw rate when nothing is moving. 0 = the background rests (zero CPU); try 10-15 for slow ambient drift
    strength: 0.55,        // overall visibility, 0 (invisible) to 1
    rings: 12,             // tunnel rings
    streaks: 24,           // spiral lines
    sparks: 160,           // flying particles
    depthPerScroll: 0.0011, // how far you travel per scrolled pixel
    idleDrift: 0.03,       // travel per second with no scrolling
    swirl: 0.55,           // how much the spiral lines twist
    cyan: "0,212,255", pink: "255,46,143", ice: "205,240,255"
  };

  let W, H, DPR, small;
  const smooth = (a, b, x) => { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const frac = x => x - Math.floor(x);
  const lerp = (a, b, k) => a + (b - a) * k;
  const col = (c, a) => "rgba(" + c + "," + Math.max(0, Math.min(1, a)) + ")";

  let sparks = [], nRings, nStreaks;
  function build() {
    small = innerWidth < 760;
    nRings = small ? 16 : CONFIG.rings; nStreaks = small ? 20 : CONFIG.streaks;
    const n = small ? Math.round(CONFIG.sparks * 0.5) : CONFIG.sparks;
    sparks = [];
    for (let i = 0; i < n; i++) sparks.push({ a: rnd(0, 6.2832), u: Math.random(), sp: rnd(0.6, 1.6), s: rnd(0.6, 1.4), pink: Math.random() < 0.1 });
  }

  // ---- layout keyframes, one per .slide. Hero and footer are measured from the real logo position.
  let slides = [], tops = [], heroC = null, footC = null;
  function measure() {
    slides = [...document.querySelectorAll(".slide")];
    tops = slides.map(s => s.getBoundingClientRect().top + scrollY);
    const get = sel => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + scrollY + r.height / 2, r: r.width / 2 }; };
    heroC = get(".hero .logo-hud"); footC = get("footer .logo-hud");
  }
  function resize() {
    DPR = Math.min(1, Math.max(0.45, 900 / Math.max(innerWidth, innerHeight)));   // low-res canvas: it is a soft background, 4x fewer pixels to paint
    W = innerWidth; H = innerHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    build(); measure(); warm = 30;
  }

  const STATIC = [  // x,y = fraction of the screen, rh = horizon radius (fraction of the smaller side), a = brightness
    null,                                       // hero (measured)
    { x: 0.86, y: 0.52, rh: 0.16, a: 0.30 },    // about
    { x: 0.10, y: 0.50, rh: 0.16, a: 0.26 },    // challenge
    { x: 0.88, y: 0.50, rh: 0.16, a: 0.26 },    // build
    { x: 0.50, y: 0.50, rh: 0.20, a: 0.14 },    // team
    null                                        // footer (measured)
  ];
  function keyframe(i, sc) {
    const m = Math.min(W, H);
    if (small) {
      if (i === 0 && heroC) return { x: heroC.x, y: heroC.y - sc, rh: heroC.r * 1.2, a: 0.7 };
      if (i === slides.length - 1 && footC) return { x: footC.x, y: footC.y - sc, rh: footC.r * 1.05, a: 0.45 };
      return { x: W * 0.5, y: H * 0.5, rh: m * 0.2, a: 0.14 };
    }
    if (i === 0 && heroC) return { x: heroC.x, y: heroC.y - sc, rh: heroC.r * 1.2, a: 0.7 };
    if (i === slides.length - 1 && footC) return { x: footC.x, y: footC.y - sc, rh: footC.r * 1.05, a: 0.5 };
    const k = STATIC[Math.min(i, STATIC.length - 2)] || STATIC[1];
    return { x: k.x * W, y: k.y * H, rh: k.rh * m, a: k.a };
  }
  function layoutAt(sc) {
    const n = slides.length;
    if (!n) return { x: W * 0.86, y: H * 0.5, rh: Math.min(W, H) * 0.16, a: 0.22 };
    const mid = sc + H * 0.5;
    let p = keyframe(0, sc);
    for (let j = 1; j < n; j++) {                      // blend across each slide boundary over ~one screen
      const w = smooth(0, 1, (mid - (tops[j] - H * 0.45)) / (H * 0.9));
      if (w <= 0) break;
      const k = keyframe(j, sc);
      p = { x: lerp(p.x, k.x, w), y: lerp(p.y, k.y, w), rh: lerp(p.rh, k.rh, w), a: lerp(p.a, k.a, w) };
    }
    return p;
  }

  let mx = 0, my = 0, tmx = 0, tmy = 0, scE = scrollY, lastDraw = 0, warm = 30;
  const cur = { x: 0, y: 0, rh: 100, a: 0.5, init: false };
  addEventListener("pointermove", e => { tmx = e.clientX / W - 0.5; tmy = e.clientY / H - 0.5; }, { passive: true });

  function frame(ms) {
    if (!reduce) requestAnimationFrame(frame);
    if (document.body.classList.contains("film")) { warm = 30; return; }   // paused while the intro film plays
    const t = ms / 1000, sc = scrollY;
    const L = layoutAt(sc);
    if (!cur.init) { Object.assign(cur, L, { init: true }); }
    // only redraw at full speed while something is moving (scroll, pointer, layout easing); otherwise ~15 fps
    const active = Math.abs(L.x - cur.x) + Math.abs(L.y - cur.y) + Math.abs(L.rh - cur.rh) > 0.6 || Math.abs(L.a - cur.a) > 0.003 ||
      Math.abs(sc - scE) > 0.4 || Math.abs(tmx - mx) > 0.003 || Math.abs(tmy - my) > 0.003;
    if (warm > 0) { warm--; }
    else if (!active && !reduce && (CONFIG.idleFps <= 0 || ms - lastDraw < 1000 / CONFIG.idleFps)) return;
    lastDraw = ms;
    scE += (sc - scE) * 0.16;                                         // eased scroll, keeps the motion fluid
    const e = reduce ? 1 : 0.3;
    cur.x += (L.x - cur.x) * e; cur.y += (L.y - cur.y) * e; cur.rh += (L.rh - cur.rh) * e; cur.a += (L.a - cur.a) * e;
    mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const S = CONFIG.strength, K = Math.max(1, 0.9 / DPR);   // keep thin lines visible at low resolution
    const cx = cur.x + mx * 12, cy = cur.y + my * 8, rh = cur.rh, A = cur.a * S;
    if (A < 0.01 || cx + rh * 4 < 0 || cx - rh * 4 > W + W) { /* nothing visible */ }
    const rmax = Math.hypot(W, H) * 0.95;
    const P = scE * CONFIG.depthPerScroll + (reduce ? 0 : t * CONFIG.idleDrift);
    const spin = P * 0.9 + t * 0.02;
    const rad = u => rh * 1.04 + (rmax - rh) * Math.pow(u, 2.6);

    // spiral lines
    ctx.lineWidth = K;
    for (let i = 0; i < nStreaks; i++) {
      const a0 = (i / nStreaks) * 6.2832 + spin, pk = i % 7 === 0;
      ctx.strokeStyle = col(pk ? CONFIG.pink : CONFIG.cyan, (pk ? 0.10 : 0.07) * A);
      ctx.beginPath();
      for (let k = 0; k <= 16; k++) {
        const r = rad(k / 16), ang = a0 + CONFIG.swirl * Math.log(r / rh) * 1.6;
        const x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r;
        k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }

    // tunnel rings moving outward as you scroll deeper
    for (let k = 0; k < nRings; k++) {
      const u = frac(k / nRings + P), r = rad(u);
      const al = smooth(0, 0.1, u) * (1 - smooth(0.72, 1, u)) * 0.22 * A;
      if (al < 0.004) continue;
      const pk = k % 6 === 0;
      ctx.lineWidth = (0.7 + u * 1.2) * K;
      ctx.strokeStyle = col(pk ? CONFIG.pink : CONFIG.cyan, pk ? al * 0.8 : al);
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.stroke();
    }

    // sparks
    const stretch = Math.min(24, Math.abs(sc - scE) * 0.35);
    for (const p of sparks) {
      const u = frac(p.u + P * p.sp), r = rad(u), ang = p.a + spin * 0.4 + CONFIG.swirl * Math.log(r / rh) * 1.6;
      const x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r;
      if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
      const al = smooth(0.02, 0.18, u) * (1 - smooth(0.8, 1, u)) * 0.6 * A;
      if (al < 0.01) continue;
      ctx.fillStyle = col(p.pink ? CONFIG.pink : (p.s > 1.2 ? CONFIG.ice : CONFIG.cyan), al);
      const sz = p.s * (0.8 + u * 1.8);
      if (stretch > 3) { ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = sz * 0.8; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(ang) * stretch * u, y - Math.sin(ang) * stretch * u); ctx.stroke(); }
      else ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
    }

    // accretion disc: tilted ellipse (far half behind the horizon, near half in front), soft glow by stacking strokes
    const disc = front => {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.2); ctx.scale(1, 0.17);
      const dg = ctx.createLinearGradient(-rh * 2, 0, rh * 2, 0);
      dg.addColorStop(0, col(CONFIG.pink, 0)); dg.addColorStop(0.25, col(CONFIG.pink, 0.4 * A)); dg.addColorStop(0.5, col(CONFIG.ice, 0.4 * A)); dg.addColorStop(0.75, col(CONFIG.cyan, 0.4 * A)); dg.addColorStop(1, col(CONFIG.cyan, 0));
      ctx.strokeStyle = dg;
      const a0 = front ? 0 : Math.PI, a1 = front ? Math.PI : Math.PI * 2, base = Math.max(1.5, rh * 0.02) / 0.17;
      ctx.globalAlpha = 0.35; ctx.lineWidth = base * 2.4; ctx.beginPath(); ctx.arc(0, 0, rh * 1.85, a0, a1); ctx.stroke();
      ctx.globalAlpha = 1; ctx.lineWidth = base * 0.6; ctx.beginPath(); ctx.arc(0, 0, rh * 1.85, a0, a1); ctx.stroke();
      ctx.restore();
    };
    disc(false);

    // event horizon: a true void so the logo sits on clean black
    let g = ctx.createRadialGradient(cx, cy, rh * 0.82, cx, cy, rh * 1.14);
    g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(0.72, "rgba(0,0,0,.96)"); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, rh * 1.14, 0, 6.2832); ctx.fill();

    // photon ring (soft glow = three stacked strokes), thin pink rim just inside
    ctx.strokeStyle = col(CONFIG.cyan, 0.16 * A); ctx.lineWidth = Math.max(5, rh * 0.03); ctx.beginPath(); ctx.arc(cx, cy, rh, 0, 6.2832); ctx.stroke();
    ctx.strokeStyle = col(CONFIG.cyan, 0.6 * A); ctx.lineWidth = Math.max(1.2, rh * 0.008) * K; ctx.beginPath(); ctx.arc(cx, cy, rh, 0, 6.2832); ctx.stroke();
    ctx.strokeStyle = col(CONFIG.pink, 0.4 * A); ctx.lineWidth = K; ctx.beginPath(); ctx.arc(cx, cy, rh * 0.975, 0, 6.2832); ctx.stroke();
    // a small hotspot orbiting the ring
    const ha = t * 0.6 + P * 2, hx = cx + Math.cos(ha) * rh, hy = cy + Math.sin(ha) * rh, hr = rh * 0.12;
    g = ctx.createRadialGradient(hx, hy, 0, hx, hy, hr);
    g.addColorStop(0, col(CONFIG.ice, 0.55 * A)); g.addColorStop(1, col(CONFIG.cyan, 0));
    ctx.fillStyle = g; ctx.fillRect(hx - hr, hy - hr, hr * 2, hr * 2);
    disc(true);
  }

  resize();
  addEventListener("resize", resize);
  addEventListener("load", measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  if (window.ResizeObserver) { let rt; new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(measure, 200); }).observe(document.body); }
  if (reduce) addEventListener("scroll", () => requestAnimationFrame(frame), { passive: true });
  requestAnimationFrame(frame);
})();
