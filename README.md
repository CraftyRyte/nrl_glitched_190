# GLITCHED // Team 190

Website for GLITCHED, Team 190, National Public School, Bangalore. National Robotics League 2026, Hyperdrive.

It is a plain static site: HTML, one stylesheet and three small scripts. There is no build step and no dependency to install. Vercel serves the files as they are.

## Pages

| File | What it is |
|---|---|
| `index.html` | The home page: eleven chapters, from the opening to the closing credits |
| `robot.html` | Pixel: annotated view, specification, what we added to the kit |
| `engineering.html` | Mechanical, electrical, software and the driver controls |
| `build-log.html` | The engineering journal, in build order |
| `team.html` | The eight members and the responsibility matrix |
| `member.html?id=1` … `8` | One profile per member, filled in from `js/team.js` |
| `strategy.html` | Game plan, expected score and the planned autonomous route |

## Where to change things

- **People, roles, skills, the responsibility matrix:** `js/team.js`. The home page, team page, member pages and closing credits all read it.
- **Words on a page:** the page's own HTML file.
- **Colours, type and spacing:** the tokens at the top of `css/site.css`.
- **Navigation and footer:** the same block is repeated at the top and bottom of every HTML file. Change it in all seven.
- **Pictures:** `images/`. They were extracted from the engineering portfolio and saved as WebP.

## Accuracy rules

The engineering portfolio is the source of truth. A solid outline means something works today; a dashed outline means planned or not yet tested. Keep that distinction when you edit: P3 (encoders) is planned, the autonomous route is a plan, and the score is an expected score.

## Motion

`js/site.js` sets three CSS variables from the scroll position (`--scroll`, `--p`, `--pin`). The two pinned sequences on the home page (chapters 05 and 07) only switch on for wide screens, and never when the visitor asks for reduced motion. On phones everything is a normal page.

## Tests

```
python3 -m http.server 8777 &
pip install playwright && playwright install chromium
python3 tests/test_site.py
```

## Fonts

Big Shoulders Display, Instrument Sans and Martian Mono, self-hosted from `fonts/` under the SIL Open Font License.
