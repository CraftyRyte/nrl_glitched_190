// Mobile menu
const nav = document.querySelector("nav");
const menuBtn = document.querySelector(".menu-btn");
const setOpen = open => { nav.classList.toggle("open", open); menuBtn.setAttribute("aria-expanded", String(open)); };
menuBtn.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
nav.addEventListener("click", () => setOpen(false));

// Copy-email button in the footer
document.querySelectorAll(".copy-email").forEach(btn => btn.addEventListener("click", async () => {
  const text = btn.dataset.copy;
  try { await navigator.clipboard.writeText(text); }
  catch (e) { const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); }
  btn.textContent = "COPIED"; btn.classList.add("done");
  setTimeout(() => { btn.textContent = "COPY"; btn.classList.remove("done"); }, 1600);
}));

// Terminal typing in the hero (edit the text here)
const line = "> booting robot... compiling... done.";
const out = document.getElementById("typed");
let i = 0;
(function type() {
  if (i <= line.length) { out.textContent = line.slice(0, i++); setTimeout(type, 45); }
})();

// Fade in sections and cards as they scroll into view
document.querySelectorAll(".wrap > *, .reveal").forEach(el => el.classList.add("reveal"));
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("show"); io.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

// Slide dots: click to jump, highlights the slide in view
const slides = [...document.querySelectorAll(".slide")];
const dots = document.createElement("div");
dots.className = "dots";
slides.forEach((s, i) => {
  const b = document.createElement("button");
  b.setAttribute("aria-label", "Go to slide " + (i + 1));
  b.onclick = () => s.scrollIntoView({ behavior: "smooth" });
  dots.appendChild(b);
});
document.body.appendChild(dots);
const so = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) [...dots.children].forEach((d, i) => d.classList.toggle("on", slides[i] === e.target));
  });
}, { rootMargin: "-50% 0px -50% 0px" });
slides.forEach(s => so.observe(s));

