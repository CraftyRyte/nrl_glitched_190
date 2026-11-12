// Glitch bursts: the glitch effect (CSS class body.g-on) plays for half a second every few seconds,
// instead of running constantly. This keeps the browser idle between bursts.
(function burst() {
  document.body.classList.add("g-on");
  setTimeout(() => document.body.classList.remove("g-on"), 520);
  setTimeout(burst, 3200 + Math.random() * 3200);
})();

// Pause looping animations (floating logo, scroll hint, blinking cursor) while they are off-screen
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle("paused", !e.isIntersecting)));
  document.querySelectorAll(".logo-hud, .scroll-hint, .boot").forEach(el => io.observe(el));
}
