/* Subtle "something is happening" layer. Cheap: transform/opacity only, short one-shot bursts, max 3 tags,
   nothing runs while the intro plays or the tab is hidden. */
(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const box = document.createElement("div");
  box.id = "ambient"; box.setAttribute("aria-hidden", "true");
  box.innerHTML = '<div class="amb-sweep"></div><div class="amb-read"></div>';
  document.body.appendChild(box);
  const sweep = box.querySelector(".amb-sweep"), read = box.querySelector(".amb-read");
  const idle = () => document.hidden || document.body.classList.contains("film") || document.body.classList.contains("locked");
  const rnd = (a, b) => a + Math.random() * (b - a);

  // drifting telemetry tags in the side margins
  const TAGS = ["sensor.front = ok", "pid.kp = 0.82", "motor.L  1480rpm", "motor.R  1476rpm", "heading 071.4°",
    "loop 60hz", "lap_time 00:41.2", "battery 7.9v", "build passing", "git push origin main", "uplink stable",
    "dist.avg(5) = 18cm", "pilot ready", "// no bugs, only features"];
  const COLS = ["#00c8ff", "#ff2d95", "#ffb02e"];
  let live = 0;
  (function spawn() {
    if (!idle() && live < 3) {
      const t = document.createElement("span");
      t.className = "amb-tag";
      t.textContent = TAGS[(Math.random() * TAGS.length) | 0];
      t.style.color = COLS[(Math.random() * COLS.length) | 0];
      const left = Math.random() < 0.5;
      t.style[left ? "left" : "right"] = rnd(1.5, 9) + "%";
      t.style.top = rnd(14, 84) + "%";
      box.appendChild(t); live++;
      t.addEventListener("animationend", () => { t.remove(); live--; });
    }
    setTimeout(spawn, rnd(2200, 4500));
  })();

  // a thin scan line crosses the screen now and then
  (function go() {
    if (!idle()) {
      sweep.classList.remove("go"); void sweep.offsetWidth; sweep.classList.add("go");
    }
    setTimeout(go, rnd(11000, 18000));
  })();

  // depth readout follows the scroll
  let last = "", ticking = false;
  const STATE = ["SYS NOMINAL", "LINK STABLE", "SCANNING", "TELEMETRY OK"];
  function upd() {
    ticking = false;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const p = Math.round(Math.min(1, scrollY / max) * 100);
    const txt = "DEPTH <b>" + String(p).padStart(3, "0") + "%</b> · " + STATE[Math.min(3, (p / 26) | 0)];
    if (txt !== last) { read.innerHTML = txt; last = txt; }
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
  upd();

  // first time a slide is seen, its heading node pings once
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && !idle()) { e.target.classList.add("seen"); io.unobserve(e.target); }
    }), { threshold: 0.35 });
    document.querySelectorAll(".slide").forEach(s => io.observe(s));
  }
})();
