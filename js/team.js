// ===== THE TEAM: edit people here. Every page that shows the team reads this file. =====
// Source: engineering portfolio, p. 3 (Team Introduction and responsibility matrix).
// photo     file in /images. Portraits are the masked ones from the portfolio.
// owns      work areas this person leads         supports  areas they back up
// skills    short tags                           does      what they actually did this season
window.GLITCHED = (function () {
  const team = [
    { id: "1", name: "Pranjal", role: "Chief Executive Officer · Team Lead", photo: "images/member-1.webp",
      owns: ["Electronics and wiring", "Programming and autonomy", "Judge presentation"], supports: ["Robot design", "Mechanical assembly", "Game strategy", "Driving and match play"],
      skills: ["C++17", "PlatformIO", "NRL SDK", "PID control", "Harness build"],
      does: ["Wrote the autonomous routine", "Built the power and signal harness"] },
    { id: "2", name: "Saanvi Kumar", role: "Director of Photography", photo: "images/member-2.webp",
      owns: ["Photo and video", "Marketing and branding"], supports: [],
      skills: ["Cinematography", "Shot planning", "Video editing", "Campaign content"],
      does: ["Documented every build session", "Leads the four-channel campaign"] },
    { id: "3", name: "Abhijay", role: "Chief Technology Officer", photo: "images/member-3.webp",
      owns: ["Robot design", "Mechanical assembly"], supports: ["Electronics and wiring", "Programming and autonomy", "Website"],
      skills: ["Mechanical design", "ESP32-S3 firmware flashing", "Servo actuation", "Wiring"],
      does: ["Designed and assembled the chassis", "Fixed the infrared array detection fault"] },
    { id: "4", name: "Naomi", role: "Chief Marketing Officer", photo: "images/member-4.webp",
      owns: [], supports: ["Engineering notebook", "Marketing and branding"],
      skills: ["Campaign planning", "Content strategy", "Audience engagement"],
      does: ["Drafted the engineering notebook", "Shapes the published content"] },
    { id: "5", name: "Neil", role: "Chief Pilot (Driver)", photo: "images/member-5.webp",
      owns: ["Driving and match play", "Game strategy", "Rules research", "Website"], supports: [],
      skills: ["Teleoperated driving", "Rule analysis", "Match strategy", "Web development"],
      does: ["Drives Pixel in every match", "Built nrlglitched190.vercel.app"] },
    { id: "6", name: "Saanvi Lalwani", role: "Chief Operating Officer · Team Manager", photo: "images/member-6.webp",
      owns: ["Engineering notebook", "Planning and deadlines"], supports: ["Presentation to judges"],
      skills: ["Project scheduling", "Technical documentation", "Concept sketching"],
      does: ["Drew the first concept sketches", "Scheduled all 8 build sessions"] },
    { id: "7", name: "Rhea", role: "Managing Director", photo: "images/member-7.webp",
      owns: [], supports: ["Planning and deadlines", "Rules research"],
      skills: ["Project scheduling", "Milestone tracking", "Technical documentation"],
      does: ["Wrote the season plan", "Tracks every milestone"] },
    { id: "8", name: "Neha", role: "Editor-in-Chief", photo: "images/member-8.webp",
      owns: ["Human Player on match day"], supports: ["Photo and video"],
      skills: ["Technical writing", "Editing", "Layout design", "Match-day operations"],
      does: ["Designed every member introduction post", "Feeds the Source Zone on match day"] }
  ];

  // Responsibility matrix: [work area, lead, support]
  const matrix = [
    ["Robot design", "Abhijay", "Pranjal"], ["Mechanical assembly", "Abhijay", "Pranjal"],
    ["Electronics and wiring", "Pranjal", "Abhijay"], ["Programming and autonomy", "Pranjal", "Abhijay"],
    ["Game strategy", "Neil", "Pranjal"], ["Rules research", "Neil", "Rhea"],
    ["Driving and match play", "Neil", "Pranjal"], ["Human Player (match day)", "Neha", ""],
    ["Engineering notebook", "Saanvi Lalwani", "Naomi"], ["Presentation to judges", "Pranjal", "Saanvi Lalwani"],
    ["Planning and deadlines", "Saanvi Lalwani", "Rhea"], ["Photo and video", "Saanvi Kumar", "Neha"],
    ["Marketing and branding", "Saanvi Kumar", "Naomi"], ["Website", "Neil", "Abhijay"]
  ];
  // ===== END OF EDITABLE AREA =====

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pad = n => String(n).padStart(2, "0");
  const href = m => "member.html?id=" + m.id;
  function getPerson(id) {
    const i = team.findIndex(m => m.id === String(id));
    if (i < 0) return null;
    return { person: team[i], index: i, prev: team[(i + team.length - 1) % team.length], next: team[(i + 1) % team.length] };
  }

  // Home page: eight portrait slats
  const slats = document.getElementById("slats");
  if (slats) {
    slats.innerHTML = team.map((m, i) => `
      <a class="slat${i === 0 ? " is-on" : ""}" href="${href(m)}">
        <img src="${esc(m.photo)}" alt="${esc(m.name)}, masked portrait" width="337" height="521" loading="lazy" decoding="async">
        <span class="slat-n">${pad(i + 1)}</span>
        <div class="slat-t"><h3>${esc(m.name)}</h3><p>${esc(m.role)}</p></div>
      </a>`).join("");
    const all = [...slats.children];
    const on = el => all.forEach(s => s.classList.toggle("is-on", s === el));
    all.forEach(s => { s.addEventListener("mouseenter", () => on(s)); s.addEventListener("focus", () => on(s)); });
  }

  // Team page: roster and responsibility matrix
  const roster = document.getElementById("roster");
  if (roster) {
    roster.innerHTML = team.map((m, i) => `
      <li><a href="${href(m)}">
        <div class="frame"><img src="${esc(m.photo)}" alt="${esc(m.name)}, masked portrait" width="337" height="521" loading="${i < 4 ? "eager" : "lazy"}" decoding="async"></div>
        <h3 class="d4"><i>${pad(i + 1)}</i> ${esc(m.name)}</h3>
        <p class="mono">${esc(m.role)}</p>
      </a></li>`).join("");
  }
  const mx = document.getElementById("matrix");
  if (mx) mx.innerHTML = matrix.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td class="mute">${esc(r[2] || "None listed")}</td></tr>`).join("");

  // Closing credits on the home page: the lead for each work area
  const credits = document.getElementById("credits");
  if (credits) credits.innerHTML = matrix.map(r => `<div><dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd></div>`).join("");

  // Member page (member.html?id=1 … 8)
  const root = document.getElementById("member");
  if (root) {
    const found = getPerson(new URLSearchParams(location.search).get("id"));
    if (!found) {
      document.title = "Profile not found | GLITCHED // Team 190";
      root.innerHTML = `<section class="ph"><div class="wrap"><p class="tag">Team</p><h1 class="d1">No such profile</h1>
        <p class="lede">There are eight members, numbered 1 to 8. Pick one from the team page.</p>
        <p style="margin-top:2rem"><a class="link" href="team.html">See the team</a></p></div></section>`;
    } else {
      const { person: m, index: i, prev, next } = found;
      document.title = m.name + " | GLITCHED // Team 190";
      const list = (a, empty) => a.length ? `<ul class="ticks">${a.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : `<p class="mute">${empty}</p>`;
      root.innerHTML = `
      <section class="ph"><div class="wrap">
        <p class="tag"><a class="inline" href="team.html">Team</a> <b>/ ${pad(i + 1)} of ${pad(team.length)}</b></p>
        <div class="m-hero" style="margin-top:2.2rem">
          <div class="frame"><img src="${esc(m.photo)}" alt="${esc(m.name)}, masked portrait" width="337" height="521"></div>
          <div>
            <p class="num" aria-hidden="true">${pad(i + 1)}</p>
            <h1 class="d2">${esc(m.name)}</h1>
            <p class="mono">${esc(m.role)}</p>
            <p class="lede" style="margin-top:1.6rem">${esc(m.does.join(". "))}.</p>
          </div>
        </div>
      </div></section>
      <section class="sec"><div class="wrap cols">
        <div class="c4"><h2 class="d4" style="margin-bottom:1rem">Leads</h2>${list(m.owns, "Leads no work area. Supports the ones listed next.")}</div>
        <div class="c4"><h2 class="d4" style="margin-bottom:1rem">Supports</h2>${list(m.supports, "No support areas listed.")}</div>
        <div class="c4"><h2 class="d4" style="margin-bottom:1rem">Skills</h2><ul class="chips">${m.skills.map(s => `<li>${esc(s)}</li>`).join("")}</ul></div>
        <div class="c12"><h2 class="d4" style="margin-bottom:1rem">This season</h2>${list(m.does, "")}</div>
        <nav class="m-nav c12" aria-label="Other members">
          <a href="${href(prev)}"><small>Previous</small>${esc(prev.name)}</a>
          <a class="mid mono" href="team.html">All eight</a>
          <a href="${href(next)}"><small>Next</small>${esc(next.name)}</a>
        </nav>
      </div></section>`;
    }
  }
  return { team, matrix, getPerson };
})();
