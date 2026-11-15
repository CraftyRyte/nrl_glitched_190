/* Home page only: chapter rail, the pinned prototype sequence and the Under the hood counter. */
(function () {
  const $ = (s, c) => [...(c || document).querySelectorAll(s)];

  // Chapter rail: one tick per chapter, the current one shows its name.
  const chapters = $("[data-ch]"), rail = document.querySelector(".rail");
  if (rail && chapters.length) {
    rail.innerHTML = chapters.map(c => `<a href="#${c.id}"><b>${c.dataset.ch}</b><span>${c.dataset.title}</span></a>`).join("");
    const links = $("a", rail);
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) links.forEach((l, i) => { const on = chapters[i] === e.target; l.classList.toggle("is-on", on); if (on) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current"); });
      }), { rootMargin: "-50% 0px -50% 0px" });
      chapters.forEach(c => io.observe(c));
    }
  }

  // Prototype sequence: three stages share one pinned screen. Scroll position picks the stage,
  // then lights its five rows (objective, problem, alternatives, decision, result) one at a time.
  const proto = document.querySelector(".proto");
  if (proto) {
    const stages = $(".proto-stage", proto), railItems = $(".proto-rail li", proto);
    const rows = stages.map(s => $(".proto-chain div", s));
    let lastKey = "";
    proto.addEventListener("pin", e => {
      const { q, on } = e.detail;
      if (!on) { stages.forEach(s => s.classList.add("is-on")); rows.flat().forEach(r => r.classList.add("is-on")); railItems.forEach((r, i) => r.classList.toggle("is-on", i < stages.length)); lastKey = ""; return; }
      const f = Math.min(0.9999, q) * stages.length, i = Math.floor(f), t = f - i;
      const lit = Math.min(5, Math.floor(t * 7.2));
      const key = i + ":" + lit;
      if (key === lastKey) return; lastKey = key;
      stages.forEach((s, n) => s.classList.toggle("is-on", n === i));
      rows.forEach((set, n) => set.forEach((r, k) => r.classList.toggle("is-on", n === i && k <= lit)));
      railItems.forEach((r, n) => r.classList.toggle("is-on", n <= i && n < stages.length));
    });
  }

  // Under the hood: mark which of the three panels is on screen.
  const hood = document.querySelector(".hood");
  if (hood) {
    const counts = $(".hood-count li", hood);
    hood.addEventListener("pin", e => {
      const i = e.detail.on ? Math.min(2, Math.round(e.detail.q * 2)) : -1;
      counts.forEach((c, n) => c.classList.toggle("is-on", n === i));
    });
  }
})();
