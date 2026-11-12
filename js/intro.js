// Cinematic intro (about 10 s): ENGINE -> MOTHERBOARD CHIP -> CODE -> logo, then the site opens.
// Scenes overlap and dissolve into each other, there are no hard cuts.
// Plays once per browser tab. To replay: open index.html?intro  (or a new tab). Click / any key skips.
(function () {
  const intro = document.getElementById("intro");
  if (!intro) return;
  let seen = false;
  try { seen = sessionStorage.getItem("introSeen"); } catch (e) {}
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ((seen && !/intro/.test(location.search)) || reduce) { intro.remove(); return; }

  document.body.classList.add("locked", "film");   // "film": the page underneath is hidden/paused while the intro runs
  const cv = document.getElementById("introCanvas");
  const ctx = cv.getContext("2d");
  const fill = document.getElementById("introFill");
  const label = document.getElementById("introLabel");
  const clock = document.getElementById("introTime");

  // ===== timing (seconds). Edit here to speed up / slow down =====
  const DUR = 10.4;
  const T = { engOut: [3.0, 4.3], chipIn: [2.9, 4.1], chipOut: [5.7, 6.7], codeIn: [5.6, 6.6], codeOut: [8.7, 9.4], final: 8.9 };
  const PINK = "255,46,143", CYAN = "0,212,255", ICE = "205,240,255";

  let W, H, DPR, U;
  function resize() {
    DPR = Math.min(devicePixelRatio || 1, 1);
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    cv.style.width = W + "px"; cv.style.height = H + "px";
    U = Math.min(W / 1100, H / 700) * (W < 760 ? 1.7 : 1);
  }
  resize(); addEventListener("resize", resize);

  const smooth = (a, b, x) => { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
  const lerp = (a, b, k) => a + (b - a) * k;
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };

  // ---------------------------------------------------------------- ENGINE
  let crank = 0;
  function line(x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
  function col(c, a) { return "rgba(" + c + "," + Math.max(0, Math.min(1, a)) + ")"; }

  function drawEngine(w, t, dt) {
    if (w < 0.01) return;
    const rpmN = smooth(0.25, 3.0, t);
    crank += (4 + 18 * rpmN) * dt;
    const shake = rpmN * 2.4;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.translate(W / 2 + Math.sin(t * 37) * shake * 0.5, H / 2 + 14 * U + Math.sin(t * 53 + 1) * shake * 0.5);
    const s = U * lerp(1, 0.86, smooth(T.engOut[0], T.engOut[1], t));
    ctx.scale(s, s);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    const a = w;

    // tachometer dial behind the engine
    const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25, tcx = 0, tcy = -40, TR = 270;
    ctx.lineWidth = 2;
    ctx.strokeStyle = col(CYAN, 0.22 * a);
    ctx.beginPath(); ctx.arc(tcx, tcy, TR, a0, a1 - 0.5); ctx.stroke();
    ctx.strokeStyle = col(PINK, 0.55 * a);                       // red zone in neon pink
    ctx.beginPath(); ctx.arc(tcx, tcy, TR, a1 - 0.5, a1); ctx.stroke();
    for (let i = 0; i <= 24; i++) {
      const ang = a0 + (a1 - a0) * (i / 24), major = i % 3 === 0, r1 = TR - (major ? 22 : 11);
      ctx.strokeStyle = col(i > 20 ? PINK : CYAN, (major ? 0.5 : 0.22) * a);
      ctx.lineWidth = major ? 2 : 1;
      line(tcx + Math.cos(ang) * r1, tcy + Math.sin(ang) * r1, tcx + Math.cos(ang) * TR, tcy + Math.sin(ang) * TR);
    }
    const na = a0 + (a1 - a0) * (rpmN * 0.92 + 0.03 + Math.sin(t * 40) * 0.004 * rpmN);
    ctx.strokeStyle = col(PINK, 0.95 * a); ctx.lineWidth = 3;
    line(tcx, tcy, tcx + Math.cos(na) * (TR - 30), tcy + Math.sin(na) * (TR - 30));
    ctx.fillStyle = col(ICE, 0.7 * a);
    ctx.font = "600 17px ui-monospace,Consolas,monospace"; ctx.textAlign = "center";
    ctx.fillText(Math.round(800 + rpmN * 6800) + " RPM", 0, 285);

    // cylinders, pistons, rods, crank
    const cc = 150, r = 34, L = 125;
    for (let i = 0; i < 4; i++) {
      const x = (i - 1.5) * 128, th = crank + i * Math.PI / 2;
      const py = cc + r * Math.cos(th) - Math.sqrt(L * L - (r * Math.sin(th)) ** 2);
      // sleeve + head
      ctx.strokeStyle = col(CYAN, 0.45 * a); ctx.lineWidth = 2;
      line(x - 44, -150, x - 44, 82); line(x + 44, -150, x + 44, 82); line(x - 56, -152, x + 56, -152);
      ctx.strokeStyle = col(CYAN, 0.25 * a); line(x - 56, -170, x + 56, -170);
      // piston
      ctx.strokeStyle = col(ICE, 0.85 * a); ctx.lineWidth = 2.4;
      ctx.strokeRect(x - 40, py - 30, 80, 46);
      ctx.strokeStyle = col(CYAN, 0.5 * a); ctx.lineWidth = 1.4;
      line(x - 40, py - 20, x + 40, py - 20); line(x - 40, py - 12, x + 40, py - 12);
      // rod + crank pin
      const pinx = x + r * Math.sin(th), piny = cc + r * Math.cos(th);
      ctx.strokeStyle = col(CYAN, 0.8 * a); ctx.lineWidth = 4; line(x, py, pinx, piny);
      ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(pinx, piny, 7, 0, 7); ctx.stroke();
      ctx.strokeStyle = col(CYAN, 0.3 * a); ctx.beginPath(); ctx.arc(x, cc, r + 14, 0, 7); ctx.stroke();
      // combustion flash near top dead centre
      let d = ((th - Math.PI) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI; // wrap to -pi..pi
      const f = Math.max(0, 1 - Math.abs(d) / 0.6) * rpmN * a + (t < 1.0 ? 0 : 0);
      if (f > 0.02) {
        const g = ctx.createRadialGradient(x, -118, 2, x, -118, 62);
        g.addColorStop(0, col("255,255,255", 0.9 * f)); g.addColorStop(0.3, col(PINK, 0.7 * f)); g.addColorStop(1, col(PINK, 0));
        ctx.fillStyle = g; ctx.fillRect(x - 64, -182, 128, 128);
        ctx.strokeStyle = col("255,255,255", f); ctx.lineWidth = 2; line(x, -176, x, -158);
      }
    }
    // crankshaft + flywheel
    ctx.strokeStyle = col(CYAN, 0.55 * a); ctx.lineWidth = 3; line(-290, cc, 360, cc);
    const fx = 360;
    ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(fx, cc, 84, 0, 7); ctx.stroke();
    ctx.strokeStyle = col(CYAN, 0.3 * a); ctx.beginPath(); ctx.arc(fx, cc, 60, 0, 7); ctx.stroke();
    ctx.strokeStyle = col(ICE, 0.7 * a);
    for (let i = 0; i < 8; i++) { const ang = crank * 0.5 + i * Math.PI / 4; line(fx + Math.cos(ang) * 12, cc + Math.sin(ang) * 12, fx + Math.cos(ang) * 60, cc + Math.sin(ang) * 60); }
    // rising heat shimmer
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 9; i++) {
      const hx = (i - 4) * 62; ctx.strokeStyle = col(CYAN, 0.10 * a * (0.4 + rpmN));
      ctx.beginPath();
      for (let k = 0; k <= 30; k++) { const yy = -190 - k * 7, xx = hx + Math.sin(k * 0.45 + t * (3 + i * 0.4) + i) * (3 + k * 0.35); k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
      ctx.stroke();
    }
    // ground line
    const gg = ctx.createLinearGradient(-500, 0, 500, 0);
    gg.addColorStop(0, col(CYAN, 0)); gg.addColorStop(0.5, col(CYAN, 0.5 * a)); gg.addColorStop(1, col(PINK, 0));
    ctx.strokeStyle = gg; ctx.lineWidth = 1.5; line(-520, 215, 520, 215);
    ctx.restore();
  }

  // ---------------------------------------------------------------- CHIP
  const R = rng(7), traces = [], parts = [];
  (function buildChip() {
    const P = 118, n = 12, sp = 17;
    const sides = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    sides.forEach(([dx, dy], si) => {
      for (let i = 0; i < n; i++) {
        const off = (i - (n - 1) / 2) * sp, sgn = off >= 0 ? 1 : -1;
        const px = dx === 0 ? off : dx * (P + 14), py = dy === 0 ? off : dy * (P + 14);
        const perp = dx === 0 ? [1, 0] : [0, 1];
        const pts = [[px, py]];
        let cx = px, cy = py;
        const lenA = 24 + R() * 190 * (0.5 + Math.abs(off) / 100);
        cx += dx * lenA; cy += dy * lenA; pts.push([cx, cy]);
        const lenB = 40 + R() * 150, k = Math.SQRT1_2;
        cx += (dx * k + perp[0] * sgn * k) * lenB; cy += (dy * k + perp[1] * sgn * k) * lenB; pts.push([cx, cy]);
        const lenC = 30 + R() * 230;
        cx += dx * lenC; cy += dy * lenC; pts.push([cx, cy]);
        let total = 0; const cum = [0];
        for (let j = 1; j < pts.length; j++) { total += Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]); cum.push(total); }
        traces.push({ pts, cum, total, delay: R() * 0.9, speed: 0.18 + R() * 0.3, off: R(), pink: R() < 0.22, side: si, idx: i });
      }
    });
    for (let i = 0; i < 26; i++) {
      const ang = R() * 6.283, rad = 170 + R() * 260;
      parts.push({ x: Math.cos(ang) * rad * 1.25, y: Math.sin(ang) * rad * 0.8, w: 8 + R() * 14, h: 4 + R() * 6, rot: R() < 0.5 ? 0 : Math.PI / 2, d: R() * 1.2, pink: R() < 0.2 });
    }
  })();

  function pointAt(tr, s) {
    const d = s * tr.total;
    for (let j = 1; j < tr.pts.length; j++) if (d <= tr.cum[j]) {
      const k = (d - tr.cum[j - 1]) / (tr.cum[j] - tr.cum[j - 1]);
      return [lerp(tr.pts[j - 1][0], tr.pts[j][0], k), lerp(tr.pts[j - 1][1], tr.pts[j][1], k)];
    }
    return tr.pts[tr.pts.length - 1];
  }

  function drawChip(w, t) {
    if (w < 0.01) return;
    const tc = t - 3.0;
    ctx.save();
    ctx.translate(W / 2, H / 2);
    const out = smooth(T.chipOut[0], T.chipOut[1], t);
    const s = U * lerp(1.18, 1, smooth(T.chipIn[0], T.chipIn[1] + 0.6, t)) * lerp(1, 1.08, out);
    ctx.scale(s, s);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    // PCB dot grid
    ctx.globalAlpha = 0.07 * w; ctx.drawImage(gridImg, -620, -420, 1240, 840); ctx.globalAlpha = 1;

    // traces grow from the pins, with data pulses running along them
    ctx.lineWidth = 1.6;
    for (const tr of traces) {
      const g = smooth(0, 1.5, tc - tr.delay);
      if (g <= 0) continue;
      ctx.strokeStyle = col(tr.pink ? PINK : CYAN, (tr.pink ? 0.42 : 0.38) * w);
      ctx.beginPath(); ctx.moveTo(tr.pts[0][0], tr.pts[0][1]);
      const lim = g * tr.total;
      for (let j = 1; j < tr.pts.length; j++) {
        if (tr.cum[j] <= lim) ctx.lineTo(tr.pts[j][0], tr.pts[j][1]);
        else { const k = (lim - tr.cum[j - 1]) / (tr.cum[j] - tr.cum[j - 1]); ctx.lineTo(lerp(tr.pts[j - 1][0], tr.pts[j][0], k), lerp(tr.pts[j - 1][1], tr.pts[j][1], k)); break; }
      }
      ctx.stroke();
      if (g > 0.98) {
        const e = tr.pts[tr.pts.length - 1];
        ctx.beginPath(); ctx.arc(e[0], e[1], 4.5, 0, 7); ctx.strokeStyle = col(tr.pink ? PINK : CYAN, 0.7 * w); ctx.stroke();
        const sp = ((tc * tr.speed + tr.off) % 1), p = pointAt(tr, sp), p2 = pointAt(tr, Math.max(0, sp - 0.07));
        const pm = pointAt(tr, Math.max(0, sp - 0.035)), pc = tr.pink ? PINK : ICE;
        ctx.lineWidth = 2.4; ctx.strokeStyle = col(pc, 0.3 * w); ctx.beginPath(); ctx.moveTo(p2[0], p2[1]); ctx.lineTo(pm[0], pm[1]); ctx.stroke();
        ctx.strokeStyle = col(pc, 0.95 * w); ctx.beginPath(); ctx.moveTo(pm[0], pm[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); ctx.lineWidth = 1.6;
      }
    }
    // SMD parts
    for (const p of parts) {
      const g = smooth(0.2, 1.2, tc - p.d); if (g <= 0) continue;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.strokeStyle = col(p.pink ? PINK : CYAN, 0.5 * g * w); ctx.lineWidth = 1.3;
      ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    }

    // chip package
    const P = 118, pulse = 0.5 + 0.5 * Math.sin(tc * 5);
    ctx.globalCompositeOperation = "lighter";
    const pg = smooth(0, 0.9, tc + 0.4);
    ctx.fillStyle = col("6,12,24", 0.92 * w * pg); ctx.strokeStyle = col(CYAN, 0.9 * w * pg); ctx.lineWidth = 2.2;
    for (let gI = 3; gI >= 1; gI--) { ctx.lineWidth = 4 * gI + 2; ctx.strokeStyle = col(CYAN, (0.05 + 0.03 * pulse) * w * pg); ctx.beginPath(); ctx.roundRect(-P, -P, P * 2, P * 2, 14); ctx.stroke(); }
    ctx.lineWidth = 2.2; ctx.strokeStyle = col(CYAN, 0.9 * w * pg);
    ctx.beginPath(); ctx.roundRect(-P, -P, P * 2, P * 2, 14); ctx.fill(); ctx.stroke();
    // pins, lit by a sweep that circles the chip
    const sweep = (tc * 1.4) % 4;
    for (const tr of traces) {
      const lit = Math.max(0, 1 - Math.abs(((tr.side + tr.idx / 12) - sweep + 6) % 4 - 0) * 2.2);
      const x = tr.pts[0][0], y = tr.pts[0][1];
      ctx.fillStyle = col(lit > 0.3 ? PINK : CYAN, (0.55 + 0.45 * lit) * w * pg);
      if (tr.side < 2) ctx.fillRect(x - 3.5, y + (tr.side === 0 ? 0 : -14), 7, 14); else ctx.fillRect(x + (tr.side === 2 ? 0 : -14), y - 3.5, 14, 7);
    }
    // die
    ctx.strokeStyle = col(CYAN, 0.65 * w * pg); ctx.lineWidth = 1.5; ctx.strokeRect(-72, -72, 144, 144);
    ctx.strokeStyle = col(CYAN, 0.25 * w * pg);
    for (let i = -48; i <= 48; i += 24) { line(i, -72, i, 72); line(-72, i, 72, i); }
    ctx.fillStyle = col(ICE, 0.95 * w * pg); ctx.textAlign = "center";
    ctx.font = "700 20px 'Chakra Petch',ui-monospace,monospace"; ctx.fillText("GLITCHED", 0, -4);
    ctx.fillStyle = col(PINK, 0.95 * w * pg); ctx.font = "600 11px ui-monospace,Consolas,monospace"; ctx.fillText("NRL-CORE // G1", 0, 16);
    ctx.fillStyle = col(CYAN, (0.4 + 0.5 * pulse) * w * pg); ctx.beginPath(); ctx.arc(-54, -54, 3.4, 0, 7); ctx.fill();
    ctx.restore();
  }

  const gridImg = document.createElement("canvas"); gridImg.width = 1240; gridImg.height = 840;
  (function () { const g = gridImg.getContext("2d"); g.fillStyle = "rgb(" + CYAN + ")"; for (let x = 20; x <= 1240; x += 40) for (let y = 20; y <= 840; y += 40) g.fillRect(x, y, 1.6, 1.6); })();

  // ---------------------------------------------------------------- CODE
  const CODE = [
    [["import ", "k"], ["glitched", "t"]],
    [],
    [["class ", "k"], ["Car", "f"], ["(Robot):", "p"]],
    [["    def ", "k"], ["drive", "f"], ["(self, speed):", "p"]],
    [["        err = ", "p"], ["target", "t"], [" - self.sensor.read()", "p"]],
    [["        self.motors.", "p"], ["pid", "f"], ["(err)", "p"]],
    [],
    [["    def ", "k"], ["avoid", "f"], ["(self):", "p"]],
    [["        ", "p"], ["if ", "k"], ["self.dist < 20:", "p"]],
    [["            self.", "p"], ["turn", "f"], ["(90)", "p"]],
    [],
    [["car = ", "p"], ["Car", "f"], ["()", "p"]],
    [["car.", "p"], ["run", "f"], ["(", "p"], ['"autonomous"', "s"], [")", "p"]],
    [["# ", "c"], ["system ready", "c"]]
  ];
  const TOK = { k: PINK, f: CYAN, t: "154,215,255", s: "255,205,230", p: "207,230,245", c: "95,122,146" };
  const totalChars = CODE.reduce((n, l) => n + l.reduce((m, tk) => m + tk[0].length, 0), 0);
  const rain = []; for (let i = 0; i < 36; i++) rain.push({ x: Math.random(), sp: 0.15 + Math.random() * 0.5, off: Math.random(), len: 8 + Math.floor(Math.random() * 14), pink: Math.random() < 0.15 });
  const GLY = "01{}<>/;=()[]#$%";

  function drawCode(w, t) {
    // falling code rain
    if (w > 0.01) {
      const cw = Math.max(18, W / 52); ctx.font = (cw * 0.8) + "px ui-monospace,Consolas,monospace"; ctx.textAlign = "center";
      rain.forEach((c, i) => {
        const x = c.x * W, head = ((t * c.sp + c.off) % 1.4) * H * 1.3 - H * 0.1;
        for (let k = 0; k < c.len; k++) {
          const y = head - k * cw * 1.1; if (y < -20 || y > H + 20) continue;
          const a = (1 - k / c.len) * 0.22 * w * (k === 0 ? 2.2 : 1);
          ctx.fillStyle = col(c.pink && k < 2 ? PINK : CYAN, a);
          ctx.fillText(GLY[(i * 7 + k * 3 + Math.floor(t * 3 + k)) % GLY.length], x, y);
        }
      });
    }
    // terminal window
    const bw = Math.min(W * 0.88, 780), fs = Math.min(17, bw / (46 * 0.602)), lh = fs * 1.75;
    const bh = CODE.length * lh + fs * 4.2, bx = (W - bw) / 2, by = (H - bh) / 2;
    const k = smooth(T.codeIn[0], T.codeIn[1] + 0.4, t);
    const typed = Math.max(0, (t - 6.15) * 125);
    const showCaretMorph = t < 7.0;
    if (w > 0.01 && k > 0) {
      ctx.save(); ctx.globalAlpha = w * k;
      ctx.translate(0, (1 - k) * 14);
      ctx.fillStyle = "rgba(4,9,18,.88)"; ctx.strokeStyle = col(CYAN, 0.45); ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 8); ctx.fill(); ctx.stroke(); ctx.fillStyle = col(CYAN, 0.07); ctx.fillRect(bx, by, bw, fs * 2.4);
      ctx.strokeStyle = col(PINK, 0.7); line(bx, by + fs * 2.4, bx + bw * 0.25, by + fs * 2.4);
      [0, 1, 2].forEach(i => { ctx.fillStyle = col(i === 0 ? PINK : CYAN, 0.7); ctx.beginPath(); ctx.arc(bx + fs * (1.1 + i * 1.1), by + fs * 1.2, fs * 0.26, 0, 7); ctx.fill(); });
      ctx.font = fs * 0.8 + "px ui-monospace,Consolas,monospace"; ctx.textAlign = "left"; ctx.fillStyle = col("127,144,168", 1);
      ctx.fillText("drive.py  —  glitched", bx + fs * 4.8, by + fs * 1.5);
      ctx.font = fs + "px ui-monospace,Consolas,monospace";
      let n = 0, caretX = bx + fs * 3.4, caretY = by + fs * 3.9;
      for (let li = 0; li < CODE.length; li++) {
        const y = by + fs * 3.9 + li * lh;
        ctx.fillStyle = col("95,122,146", 0.5); ctx.textAlign = "right"; ctx.fillText(String(li + 1), bx + fs * 2.4, y); ctx.textAlign = "left";
        let x = bx + fs * 3.4; caretX = x; caretY = y;
        for (const [txt, key] of CODE[li]) {
          const room = Math.max(0, Math.min(txt.length, typed - n));
          if (room > 0) { const part = txt.slice(0, room); ctx.fillStyle = col(TOK[key], 1); ctx.fillText(part, x, y); x += ctx.measureText(part).width; caretX = x; caretY = y; }
          n += txt.length;
        }
        if (typed < n) break;
      }
      if (Math.floor(t * 2.4) % 2 === 0 || typed < totalChars) { ctx.fillStyle = col(PINK, 0.95); ctx.fillRect(caretX + 1, caretY - fs * 0.95, fs * 0.6, fs * 1.15); }
      ctx.restore();
    }
    // the chip package collapses into the cursor: continuity between scenes
    if (showCaretMorph) {
      const m = smooth(5.75, 6.75, t), cx0 = W / 2, cy0 = H / 2, cs0 = 236 * U;
      const tx = bx + fs * 3.4 + 1 + fs * 0.3, ty = by + fs * 3.9 - fs * 0.4;
      const rw = lerp(cs0, fs * 0.6, m), rh = lerp(cs0, fs * 1.15, m);
      const x = lerp(cx0, tx, m), y = lerp(cy0, ty, m);
      const fa = (1 - smooth(6.6, 7.0, t)) * smooth(5.6, 5.95, t);
      if (fa > 0) {
        ctx.save(); ctx.globalAlpha = fa; ctx.strokeStyle = col(PINK, 0.95); ctx.lineWidth = lerp(2.2, 1, m);
        ctx.fillStyle = col(PINK, m * m * 0.95); ctx.beginPath(); ctx.roundRect(x - rw / 2, y - rh / 2, rw, rh, lerp(14 * U, 1, m)); ctx.fill(); ctx.stroke(); ctx.restore();
      }
    }
  }

  // ---------------------------------------------------------------- main loop
  let done = false, finalShown = false, last = performance.now(), t = 0, t0 = 0, lastClk = 0, raf;
  const scenes = [[0, "01 / IGNITION"], [3.5, "02 / SILICON"], [6.1, "03 / SOURCE"], [8.9, "04 / READY"]];
  let sceneIdx = -1;
  function frame(now) {
    if (done) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now; t = (now - t0) / 1000;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const wE = smooth(0.05, 0.7, t) * (1 - smooth(T.engOut[0], T.engOut[1], t));
    const wC = smooth(T.chipIn[0], T.chipIn[1], t) * (1 - smooth(T.chipOut[0], T.chipOut[1], t));
    const wK = smooth(T.codeIn[0], T.codeIn[1], t) * (1 - smooth(T.codeOut[0], T.codeOut[1], t));
    drawEngine(wE, t, dt); drawChip(wC, t); drawCode(wK, t);
    // scanline sweep + vignette for a filmic feel
    const sy = (t * 0.35 % 1) * H, sg = ctx.createLinearGradient(0, sy - 60, 0, sy + 60);
    sg.addColorStop(0, "rgba(0,212,255,0)"); sg.addColorStop(0.5, "rgba(0,212,255,.045)"); sg.addColorStop(1, "rgba(0,212,255,0)");
    ctx.fillStyle = sg; ctx.fillRect(0, sy - 60, W, 120);
    // UI
    fill.style.transform = "scaleX(" + Math.min(1, t / DUR) + ")";
    let si = 0; scenes.forEach((s, i) => { if (t >= s[0]) si = i; });
    if (si !== sceneIdx) { sceneIdx = si; label.textContent = scenes[si][1]; }
    if (now - lastClk > 100) { clock.textContent = t.toFixed(1) + "s"; lastClk = now; }
    if (t > T.final && !finalShown) { finalShown = true; intro.classList.add("final"); }
    if (t >= DUR) return finish();
    raf = requestAnimationFrame(frame);
  }
  function finish() {
    if (done) return;
    done = true; cancelAnimationFrame(raf);
    document.body.classList.remove("film");
    intro.classList.add("open");
    try { sessionStorage.setItem("introSeen", "1"); } catch (e) {}
    setTimeout(() => { intro.remove(); document.body.classList.remove("locked"); }, 1100);
  }
  // ---- enter gate: nothing plays until the visitor clicks ":click enter" (or presses Enter)
  const gate = document.getElementById("gate"), enterBtn = document.getElementById("gateEnter"), subEl = document.getElementById("gateSub");
  let started = false;
  function begin() {
    if (started) return; started = true;
    removeEventListener("keydown", onGateKey);
    intro.classList.add("playing");
    last = performance.now();
    setTimeout(() => {                      // let the gate fade, then run the film
      last = t0 = performance.now(); raf = requestAnimationFrame(frame);
      setTimeout(() => ["click", "keydown"].forEach(ev => addEventListener(ev, finish, { once: true })), 400);
    }, 450);
  }
  function onGateKey(e) { if (e.key === "Enter") begin(); }
  if (!gate) { begin(); return; }
  enterBtn.addEventListener("click", begin);
  addEventListener("keydown", onGateKey);
  // type the subheading, then reveal the enter option
  const SUB = "GLITCHED-NRL";
  let k = 0;
  setTimeout(function typeSub() {
    subEl.textContent = SUB.slice(0, ++k);
    if (k < SUB.length) setTimeout(typeSub, 90);
    else setTimeout(() => { enterBtn.classList.add("show"); enterBtn.focus({ preventScroll: true }); }, 350);
  }, 900);
})();
