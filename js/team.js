// ===== EDIT YOUR TEAM HERE =====
// Add a photo by putting a file in /images and setting photo: "images/name.jpg".
// Leave photo empty ("") to show initials instead.
// The "details" block feeds each person's own page (member.html). Fill in what you have, leave the rest empty:
//   about          a paragraph about them
//   build          what they did on the robot / in the code
//   skills         a list of short tags, e.g. ["Python", "PID tuning"]
//   contributions  a list of things they built or fixed
//   links          a list like [{ label: "GitHub", url: "https://..." }]

// No mentor has been confirmed yet. To show a mentor card and profile, replace "null" with an object like:
// { id: "mentor", name: "Name", title: "Team Mentor", bio: "...", photo: "", details: { about: "", build: "", skills: [], contributions: [], links: [] } }
const mentor = null;

const team = [
  { name: "Pranjal", role: "Chief Executive Officer \u00b7 Team Lead", photo: "",
    bio: "Leads the team, the electronics and wiring, the autonomous code and the judge presentation.",
    details: {
      about: "Pranjal leads the electronics and wiring and the autonomous programming, and presents to the judges. He wrote the line-following routine in C++17 on PlatformIO and built the power and signal harness.",
      build: "Owns the electronics and wiring, the autonomous program and the judge presentation.",
      skills: ["C++17", "PlatformIO", "NRL SDK", "PID line following"],
      contributions: ["Wrote the line-following routine", "Built the power and signal harness", "Chose to keep 300 RPM motors over 600 RPM"],
      links: [{"label": "Instagram @_glitch_d", "url": "https://www.instagram.com/_glitch_d/"}, {"label": "YouTube @Glitched_NRL-190", "url": "https://www.youtube.com/@Glitched_NRL-190"}] } },
  { name: "Saanvi Kumar", role: "Director of Photography", photo: "",
    bio: "Owns the team's photo and video record, marketing and branding.",
    details: {
      about: "Saanvi owns the team's photo and video record and its marketing and branding. She documented every build session and leads the masked-identity content series.",
      build: "Owns the photo and video record of the build, and supports marketing and branding.",
      skills: ["Cinematography", "Shot planning", "Editing reels"],
      contributions: ["Documented every build session", "Leads the masked-identity content series", "Shot the team portraits"],
      links: [{"label": "Instagram @_glitch_d", "url": "https://www.instagram.com/_glitch_d/"}, {"label": "YouTube @Glitched_NRL-190", "url": "https://www.youtube.com/@Glitched_NRL-190"}] } },
  { name: "Abhijay", role: "Chief Technology Officer", photo: "",
    bio: "Leads robot design and assembly, and supports electronics and programming.",
    details: {
      about: "Abhijay leads the robot's design and mechanical assembly and supports the electronics and programming. He designed and assembled the chassis and fixed the infrared line-array detection fault.",
      build: "Owns robot design and mechanical assembly, and supports electronics and programming.",
      skills: ["Robot design", "Mechanical assembly", "ESP32-S3 Hub", "IR line array"],
      contributions: ["Designed and assembled the chassis", "Fixed the line-sensor detection fault by reflashing the Hub"],
      links: [{"label": "Instagram @_glitch_d", "url": "https://www.instagram.com/_glitch_d/"}, {"label": "YouTube @Glitched_NRL-190", "url": "https://www.youtube.com/@Glitched_NRL-190"}] } },
  { name: "Naomi", role: "Chief Marketing Officer", photo: "",
    bio: "Supports the engineering notebook and runs marketing and branding.",
    details: {
      about: "Naomi supports the engineering notebook and the marketing and branding work. She drafted the notebook and shapes how the team's story is published.",
      build: "Supports the engineering notebook, marketing and branding.",
      skills: ["Promotion strategy", "Content planning", "Campaigns"],
      contributions: ["Drafted the engineering notebook", "Planned the marketing plays"],
      links: [{"label": "Instagram @_glitch_d", "url": "https://www.instagram.com/_glitch_d/"}, {"label": "YouTube @Glitched_NRL-190", "url": "https://www.youtube.com/@Glitched_NRL-190"}] } },
  { name: "Neil", role: "Chief Pilot (Driver)", photo: "",
    bio: "Drives Pixel in matches, owns game strategy and the team website.",
    details: {
      about: "Neil drives Pixel in matches and owns game strategy, rules research and the team website. He turns the rulebook into a match plan for the driver-controlled period.",
      build: "Owns driving and match play, game strategy, rules research and the team website.",
      skills: ["TeleOp driving", "Controller mapping", "Game strategy", "Web development"],
      contributions: ["Built the team website", "Drives Pixel in matches", "Turns the rulebook into a match plan"],
      links: [{"label": "Instagram @_glitch_d", "url": "https://www.instagram.com/_glitch_d/"}, {"label": "YouTube @Glitched_NRL-190", "url": "https://www.youtube.com/@Glitched_NRL-190"}] } },
  { name: "Saanvi Lalwani", role: "Chief Operating Officer \u00b7 Team Manager", photo: "",
    bio: "Leads the engineering notebook, planning and deadlines.",
    details: {
      about: "Saanvi leads the engineering notebook and the planning and deadlines, and supports the judge presentation. She drew the first concept sketches and scheduled all eight build sessions.",
      build: "Owns the engineering notebook, planning and deadlines, and supports the judge presentation.",
      skills: ["Scheduling", "Game manual and rules", "Match timing"],
      contributions: ["Drew the first concept sketches", "Scheduled all eight build sessions"],
      links: [{"label": "Instagram @_glitch_d", "url": "https://www.instagram.com/_glitch_d/"}, {"label": "YouTube @Glitched_NRL-190", "url": "https://www.youtube.com/@Glitched_NRL-190"}] } },
  { name: "Rhea", role: "Managing Director", photo: "",
    bio: "Supports planning, deadlines and rules research.",
    details: {
      about: "Rhea supports planning, deadlines and rules research. She wrote the season plan and tracks every milestone.",
      build: "Supports planning, deadlines and rules research.",
      skills: ["Season planning", "Milestone tracking", "Rules research"],
      contributions: ["Wrote the season plan", "Tracks every milestone"],
      links: [{"label": "Instagram @_glitch_d", "url": "https://www.instagram.com/_glitch_d/"}, {"label": "YouTube @Glitched_NRL-190", "url": "https://www.youtube.com/@Glitched_NRL-190"}] } },
  { name: "Neha", role: "Editor-in-Chief", photo: "",
    bio: "Human Player on match day; designs the member posts and assembles the notebook.",
    details: {
      about: "Neha is the Human Player on match day and supports photo and video. She designed every member introduction post and assembles the notebook.",
      build: "Plays Human Player on match day, supports photo and video, and assembles the engineering notebook.",
      skills: ["Technical writing", "Editing", "Layout"],
      contributions: ["Designed every member introduction post", "Assembles the engineering notebook"],
      links: [{"label": "Instagram @_glitch_d", "url": "https://www.instagram.com/_glitch_d/"}, {"label": "YouTube @Glitched_NRL-190", "url": "https://www.youtube.com/@Glitched_NRL-190"}] } }
];
// ===== END OF EDITABLE AREA =====

// ids 1..8 for members (member.html?id=1), "mentor" for the mentor; every member gets an empty details block
team.forEach((m, i) => { m.id = String(i + 1); m.details = Object.assign({ about: "", build: "", skills: [], contributions: [], links: [] }, m.details); });

function getPerson(id) {
  if (id === "mentor") return !mentor ? null : { p: mentor, role: mentor.title, prev: team[team.length - 1], next: team[0] };
  const i = team.findIndex(m => m.id === id);
  if (i < 0) return null;
  return { p: team[i], role: team[i].role, prev: i === 0 ? (mentor || team[team.length - 1]) : team[i - 1], next: i === team.length - 1 ? (mentor || team[0]) : team[i + 1] };
}

function initials(name) { return name.split(" ").map(w => w[0]).join("").slice(0, 2); }
function avatar(p) {
  if (p.photo) return `<div class="avatar"><img src="${p.photo}" alt="${p.name}"></div>`;
  return `<div class="avatar">${initials(p.name)}</div>`;
}

// ---- home page: mentor card + vertical strips (only runs where those elements exist) ----
const mentorEl = document.getElementById("mentor");
if (mentorEl && mentor) {
  mentorEl.innerHTML = `
  <a class="mentor" href="member.html?id=mentor" aria-label="Open ${mentor.name}">
    ${avatar(mentor)}
    <div>
      <h3>${mentor.name}</h3>
      <p class="role dim">${mentor.title}</p>
      <p>${mentor.bio}</p>
      <span class="go">View profile &rarr;</span>
    </div>
  </a>`;
}
const membersEl = document.getElementById("members");
if (membersEl) {
  membersEl.innerHTML = team.map((m, i) => `
  <a class="strip${i === 0 ? " active" : ""}" href="member.html?id=${m.id}" aria-label="Open ${m.name}">
    <span class="idx">${String(i + 1).padStart(2, "0")}</span>
    <span class="vtext">${m.name}</span>
    <div class="full">
      ${avatar(m)}
      <h3>${m.name}</h3>
      <p class="role">${m.role}</p>
      <p class="bio">${m.bio}</p>
      <span class="go">View profile &rarr;</span>
    </div>
  </a>`).join("");
  const strips = [...membersEl.children];
  const activate = el => strips.forEach(s => s.classList.toggle("active", s === el));
  strips.forEach(s => { s.addEventListener("mouseenter", () => activate(s)); s.addEventListener("focus", () => activate(s)); });
}