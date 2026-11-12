/* Blueprint / PCB layer: every slide gets a faint SVG of copper traces, vias, signal labels, a chip footprint,
   a ruler and a few lines of code, drawn in the margins behind the content. Seeded, so it never reshuffles.
   One short signal pulse runs along a random trace every few seconds (stroke-dashoffset, one-shot). */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const C = "0,200,255", P = "255,45,149", A = "255,176,46";
  const LABELS = ["SDA", "SCL", "PWM1", "PWM2", "TX", "RX", "GND", "3V3", "ENC_L", "ENC_R", "TRIG", "ECHO", "IRQ", "MOSI", "MISO"];
  const CODE = [
    ["while True:", "  d = sensor.read()", "  if d < 20: brake()", "  else: drive(pid(d))"],
    ["def pid(e):", "  i += e * dt", "  return kp*e + ki*i + kd*(e-p)"],
    ["0x3F 0xA1 0x00 0x7E", "0xC4 0x12 0xFF 0x08", "0x5A 0x5A 0x91 0x2D"],
    ["void loop() {", "  readEncoders();", "  steer(target - heading);", "}"],
  ];
  const rngOf = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const txt = (p, x, y, s, col, o, size, anchor) => { const t = el("text", { x, y, fill: `rgba(${col},${o})`, "font-size": size || 10,
    "font-family": "ui-monospace,Consolas,monospace", "letter-spacing": ".1em", "text-anchor": anchor || "start" }, p); t.textContent = s; return t; };

  // one trace: runs inward from the edge, bends 45 degrees, runs on, ends in a via
  function trace(g, rnd, x0, y0, dir, reach, col, label, pulses) {
    const x1 = x0 + dir * reach * (0.25 + rnd() * 0.25), dy = (rnd() < .5 ? -1 : 1) * (14 + rnd() * 46);
    const x2 = x1 + dir * Math.abs(dy), y2 = y0 + dy, x3 = x2 + dir * reach * (0.2 + rnd() * 0.3);
    const d = `M${x0} ${y0}H${x1}L${x2} ${y2}H${x3}`;
    el("path", { d, fill: "none", stroke: `rgba(${col},.34)`, "stroke-width": 1.4 }, g);
    el("circle", { cx: x3, cy: y2, r: 3.2, fill: "none", stroke: `rgba(${col},.7)`, "stroke-width": 1.2 }, g);
    el("circle", { cx: x3, cy: y2, r: 1, fill: `rgba(${col},.85)` }, g);
    if (label) txt(g, x3 + dir * 8, y2 + 3, label, A, .6, 9, dir > 0 ? "start" : "end");
    const pl = el("path", { d, fill: "none", stroke: `rgba(${col},.95)`, "stroke-width": 2.4, pathLength: 100, class: "cpulse" }, g);
    pulses.push(pl);
  }

  function chip(g, x, y, w, h, name) {
    el("rect", { x, y, width: w, height: h, fill: "none", stroke: `rgba(${C},.42)`, "stroke-width": 1.2 }, g);
    el("circle", { cx: x + 7, cy: y + 7, r: 2.5, fill: "none", stroke: `rgba(${P},.8)` }, g);
    for (let i = 1; i < 6; i++) for (const [px, py, qx, qy] of [[x + i * w / 6, y, x + i * w / 6, y - 6], [x + i * w / 6, y + h, x + i * w / 6, y + h + 6],
      [x, y + i * h / 6, x - 6, y + i * h / 6], [x + w, y + i * h / 6, x + w + 6, y + i * h / 6]])
      el("path", { d: `M${px} ${py}L${qx} ${qy}`, stroke: `rgba(${C},.45)`, "stroke-width": 1 }, g);
    txt(g, x + w / 2, y + h / 2 + 3, name, C, .55, 9, "middle");
  }

  function ruler(g, H) {
    for (let y = 70; y < H; y += 40) {
      const major = (y - 70) % 200 === 0;
      el("path", { d: `M0 ${y}H${major ? 14 : 7}`, stroke: `rgba(${C},${major ? .5 : .28})`, "stroke-width": 1 }, g);
      if (major) txt(g, 18, y + 3, String(y).padStart(4, "0"), C, .42, 8);
    }
  }

  function cross(g, x, y) {
    el("path", { d: `M${x - 9} ${y}H${x + 9}M${x} ${y - 9}V${y + 9}`, stroke: `rgba(${P},.6)`, "stroke-width": 1 }, g);
    el("circle", { cx: x, cy: y, r: 5, fill: "none", stroke: `rgba(${P},.45)` }, g);
  }

  const all = [];
  function build() {
    all.length = 0;
    document.querySelectorAll(".slide").forEach((slide, idx) => {
      const old = slide.querySelector(":scope > .deco"); if (old) old.remove();
      const W = slide.clientWidth, H = slide.clientHeight; if (W < 700) return;   // phones: keep it clean
      const rnd = rngOf(1234 + idx * 77);
      const svg = el("svg", { class: "deco", viewBox: `0 0 ${W} ${H}`, width: W, height: H, "aria-hidden": "true" });
      const g = el("g", {}, svg), pulses = [];
      const mw = Math.max(110, (W - 1000) / 2);            // margin zone beside the content column
      ruler(g, H);
      const bundles = 3 + (H > 700 ? 1 : 0);
      for (let b = 0; b < bundles; b++) {
        const side = b % 2 ? 1 : -1, x0 = side > 0 ? W : 0, yb = 110 + rnd() * (H - 260);
        for (let k = 0; k < 4; k++)
          trace(g, rnd, x0, yb + k * 11, -side, mw * (0.9 + rnd() * 0.6), k === 2 ? P : C, k === 0 || k === 3 ? LABELS[(rnd() * LABELS.length) | 0] : "", pulses);
      }
      chip(g, W - mw * .62, 90 + rnd() * 40, 54, 38, "U" + (idx + 1));
      if (slide.id !== "team") chip(g, mw * .5, 80 + rnd() * 30, 46, 32, "IC" + (idx + 7));
      cross(g, W - 28, 28); cross(g, 28, H - 28);
      if (mw > 180) {
        const c = CODE[idx % CODE.length], x = 26, y0 = H - 64 - c.length * 14;
        c.forEach((ln, i) => txt(g, x, y0 + i * 14, ln, C, .42, 10));
      }
      slide.insertBefore(svg, slide.firstChild);
      pulses.forEach(p => all.push({ p, slide }));
    });
  }

  let t; const rebuild = () => { clearTimeout(t); t = setTimeout(build, 250); };
  let lastW = innerWidth;
  addEventListener("resize", () => { if (innerWidth !== lastW) { lastW = innerWidth; rebuild(); } });
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(build));

  const idle = () => document.hidden || document.body.classList.contains("film") || document.body.classList.contains("locked");
  (function pulse() {
    if (!idle() && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const vis = all.filter(o => { const r = o.slide.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && o.p.isConnected; });
      if (vis.length) {
        const o = vis[(Math.random() * vis.length) | 0];
        o.p.classList.remove("go"); void o.p.getBoundingClientRect(); o.p.classList.add("go");
      }
    }
    setTimeout(pulse, 1800 + Math.random() * 2200);
  })();
})();
