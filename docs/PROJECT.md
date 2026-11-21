# Profile README

This repository is the GitHub profile page: [github.com/sergushkincom](https://github.com/sergushkincom). GitHub renders `README.md` and strips JavaScript, so a filter has to be a `<details>` block, not a script.

The page is, in order: the banner, two sentences, the **This week** line, one image gallery, the full list grouped by topic, the note on working with AI agents, a short career list, and the links.

## This week

The sentence under the introduction is edited by hand. An HTML comment directly above it starts with `this-week`. Rewrite the sentence. Leave the comment, including the `[DENYS: ...]` note, until the sentence is in your own words. After that, the comment can shrink to the one-line reminder. Do not add a GitHub Action.

What that sentence said on 21 Nov 2026, and how it was checked:

- Redline Supply is live. `https://redline-supply-seven.vercel.app` returned 200.
- The CV page template shipped in the site theme (the template commit, then a pass that left blanks to fill in). `https://sergushkin.com/cv` redirects to `/about`, so the profile does not link it. The theme repository is not a public page, so it is not linked either.
- agentic-ui's changelog entry for 21 Nov 2026, "Steps in a run", lists 13 components. `https://agentic-ui-docs.vercel.app/changelog` returned 200.

## By topic

Four groups: Agentic UI & AI agents, 3D & spatial, ERP & B2B tools, Small tools & experiments.

Each row is the name, one plain sentence, a Live link, and a Repo link.

- Add a Live link only after a request to that URL returns 200. A redirect that ends on 200 counts. If it does not, leave the live link off.
- Prefer the homepage set on the GitHub repository when that homepage returns 200. Keyword Tracker is `https://keyword-tracker-nine.vercel.app`. `https://denys-keyword-tracker.vercel.app` also returned 200 on 21 Nov 2026; the profile uses the homepage so the two do not drift.
- The gallery may open the screen in the picture. The topic row opens the repository homepage. Both have to return 200. On 21 Nov 2026 the gallery deep links were the Redline review table and the Because "why revenue changed" page.
- A Repo link has to be a public GitHub page. If it 404s while signed out, do not link it.
- Design engineering shelf has no separate demo. The row links the repository only.
- DX Grid Inspector is a contribution. The row links that repository and the pull request. It is not labelled Live.
- Do not link healthcare-ui. It is a stub.
- On 21 Nov 2026 the site theme and clia-prototype were not public GitHub pages. Clia's demo returned 200 and the app is marked noindex. Neither is on the profile until the repository is public and you decide it belongs here.

To add a project, copy a `<tr>` into the group it belongs to. Keep the sentence to one line. Do not add a second image grid for the same projects.

## Gallery images

Six cells: World Parts, agentic-ui, Redline Supply, Because, Workflow canvas, Knowledge Atlas.

Files live in `assets/card-*.jpg`. The older cards are 1200×840. New shots are 1600×1120, the same proportions, so a row stays even. Capture with a 1600×1120 viewport, light colour scheme, reduced motion, then save a progressive JPEG around quality 76. Redline is the review table. Because is the revenue bridge. If those routes move, shoot the screen that still shows a value with its source and a decision, or a number with the reason beside it.

`assets/card-agentic-ux-lab.jpg` and `assets/card-permission-rings.jpg` are spare. Swap one into the gallery by editing the cell. Keep the project in its topic group either way.

The banner is `assets/banner-light.svg` and `assets/banner-dark.svg`, inside `<picture>`. Use `<picture>` only when a light file and a dark file both exist. A product screenshot does not need a dark twin unless you actually captured one.

No stats cards, streaks, trophies, visitor counters, snakes, or badge walls.

The employers in the career list stay as they are. Do not add others.
