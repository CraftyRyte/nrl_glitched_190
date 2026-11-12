// ===== EDIT YOUR TEAM HERE =====
// Add a photo by putting a file in /images and setting photo: "images/name.jpg".
// Leave photo empty ("") to show initials instead.
// The "details" block feeds each person's own page (member.html). Fill in what you have, leave the rest empty:
//   about          a paragraph about them
//   build          what they did on the robot / in the code
//   skills         a list of short tags, e.g. ["Python", "PID tuning"]
//   contributions  a list of things they built or fixed
//   links          a list like [{ label: "GitHub", url: "https://..." }]

const mentor = {
  id: "mentor",
  name: "Mentor Name",
  title: "Team Mentor",
  bio: "Short bio goes here: background, what they guide the team on, and why they mentor.",
  photo: "",
  details: { about: "", build: "", skills: [], contributions: [], links: [] }
};

const team = [
  { name: "Member One",   role: "Lead Programmer", bio: "One-line bio here.", photo: "" },
  { name: "Member Two",   role: "Driver",          bio: "One-line bio here.", photo: "" },
  { name: "Member Three", role: "Strategist",      bio: "One-line bio here.", photo: "" },
  { name: "Member Four",  role: "Sensor Engineer", bio: "One-line bio here.", photo: "" },
  { name: "Member Five",  role: "Debugger",        bio: "One-line bio here.", photo: "" },
  { name: "Member Six",   role: "Mechanical Lead", bio: "One-line bio here.", photo: "" },
  { name: "Member Seven", role: "Presenter",       bio: "One-line bio here.", photo: "" },
  { name: "Member Eight", role: "Documentation",   bio: "One-line bio here.", photo: "" }
];
// ===== END OF EDITABLE AREA =====

// ids 1..8 for members (member.html?id=1), "mentor" for the mentor; every member gets an empty details block
team.forEach((m, i) => { m.id = String(i + 1); m.details = Object.assign({ about: "", build: "", skills: [], contributions: [], links: [] }, m.details); });

function getPerson(id) {
  if (id === "mentor") return { p: mentor, role: mentor.title, prev: team[team.length - 1], next: team[0] };
  const i = team.findIndex(m => m.id === id);
  if (i < 0) return null;
  return { p: team[i], role: team[i].role, prev: i === 0 ? mentor : team[i - 1], next: i === team.length - 1 ? mentor : team[i + 1] };
}

function initials(name) { return name.split(" ").map(w => w[0]).join("").slice(0, 2); }
function avatar(p) {
  if (p.photo) return `<div class="avatar"><img src="${p.photo}" alt="${p.name}"></div>`;
  return `<div class="avatar">${initials(p.name)}</div>`;
}

// ---- home page: mentor card + vertical strips (only runs where those elements exist) ----
const mentorEl = document.getElementById("mentor");
if (mentorEl) {
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
