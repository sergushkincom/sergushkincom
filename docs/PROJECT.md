# Profile README

This repository is the GitHub profile page: [github.com/sergushkincom](https://github.com/sergushkincom). GitHub renders `README.md` and strips JavaScript, so a filter has to be a `<details>` block, not a script.

The page is, in order: the banner, two sentences, the **This week** line, one image gallery, **Recently shipped**, the full list grouped by topic, the note on working with AI agents, **Ideas I want to try**, a short career list, and the links.

## This week

The sentence under the introduction is edited by hand. An HTML comment directly above it starts with `this-week` and is only a reminder. Do not put a `[DENYS: ...]` note back on that line. Do not add a GitHub Action for this line. The weekly Action rewrites Recently shipped and Ideas only, and it leaves this sentence alone.

On 21 Nov 2026 the line says, in first person: Redline Supply is live, agentic-ui got thirteen pieces for showing a running agent, a comment in Agentic UX Lab opens the exact moment in a session, and there is a CV page template for the site. The second sentence is the reason: show what the agent is doing and let a person step in, not just a chat box. The CV template has no public URL (`sergushkin.com/cv` redirects to `/about`, and the theme repository is not a public page), so the line does not link it.

## Recently shipped

The block under the gallery, between `<!-- SHIPPED:START -->` and `<!-- SHIPPED:END -->`, is rewritten by `scripts/update-readme-sections.mjs`. It lists the five most recently merged pull requests in the public repositories. Each line has the title, which links to the pull request, the repository, and the merge date in UTC. When one of those repositories has a homepage set to a web address, that address is listed under Live demos. A homepage that is only github.com, or only sergushkin.com, is left off. This repository's homepage is the personal site, so it is not a live demo. The script does not check that a homepage returns 200. The Live links in the gallery and in By topic still follow that rule.

The search is `is:pr is:merged author:sergushkincom user:sergushkincom`, on the public GitHub API, with `GITHUB_TOKEN`. If the token cannot read public search, the script tries once without it.

`.github/workflows/recently-shipped.yml` runs the script every Monday at 06:00 UTC, and when someone starts the workflow by hand. GitHub may start the scheduled run a few minutes late. The workflow commits `README.md` only when the generated text changed, as github-actions[bot]. It does not open a pull request, and it does not commit any other file.

Do not edit the text between the markers by hand. The next run replaces it. Keep the markers below the gallery. If a marker is missing, or a rewrite would change the This week line or the gallery table, the script stops and writes nothing.

## Ideas

The block before the career list, between `<!-- IDEAS:START -->` and `<!-- IDEAS:END -->`, is rewritten by the same script. It links up to six open issues, newest first, whose titles start with `Idea:`. The last line asks people to comment on the issue. Do not enable Discussions. An idea that is not an open issue with that title does not appear.

The Monday workflow updates this block together with Recently shipped. Pull requests run `.github/workflows/check-profile-sections.yml`, which runs `node scripts/update-readme-sections.mjs --dry-run`. The dry run fetches the same data, checks the markers, and does not write the file.

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

## Gallery

Six cells, two columns: World Parts, agentic-ui, Redline Supply, Because, Workflow canvas, Knowledge Atlas. Above the cards is the link "Browse all prototypes by topic", to https://projects-gallery.vercel.app. That page filters the prototypes. Keep the link. It is not a second image grid.

The pictures are 1280×640, two to one. Three columns made that ratio a thin strip, too short to read the type, so each row is two cells. Every image is `width="100%"`. The cards bring their own background, so the same files sit on GitHub's light page and dark page without a second set.

Still cards live in `assets/cards/card-<repo>.jpg`. Clips live in `assets/gifs/<repo>.gif`, inside a closed `<details>` whose summary is "Watch it move". The page opens on the still cards. The clip is there when someone asks for it.

World Parts keeps the earlier storeroom card. The unified yellow card is a room photo, and the 3D view is the stronger picture. The old file was 1200×840, so it is fitted into 1280×640 on the card's own pale background and saved as `assets/cards/card-world-parts.jpg`. Do not replace it with the yellow card.

The other five are the unified cards, already 1280×640, set in Red Hat Display, one colour each: `card-agentic-ui.jpg`, `card-redline-supply.jpg`, `card-battery-because.jpg`, `card-workflow-canvas.jpg`, `card-knowledge-atlas.jpg`. Copy the JPEG as it is. Do not scale it back to 1200×840.

### Regenerating a card

The unified set is drawn outside this repo. To refresh one, replace the file in `assets/cards/` and keep the name. If you add a project to the gallery, it needs a 1280×640 card in that folder or the row heights will not match. The old 1200×840 files are gone.

### Regenerating a clip

A clip is 3 to 5 seconds, looping, of the main interaction on the live demo. Record it in Chrome with Playwright, then encode with ffmpeg's palette and gifsicle. `scripts/record-gifs.mjs` does both. Keep each file under about 3MB, and the six together under 12MB. Around 800 pixels wide and 8 frames a second is enough at the size the profile shows them.

What each clip should show:

- World Parts: the storeroom, then the corridor button. Stay on Still. Live 3D fetches a large splat and the picture goes black, so leave that out.
- agentic-ui: the agent-run example, scrolled so the steps fill the frame.
- Redline: the RoHS review. Click a check that is already on screen, with the mouse, so the IBAN line asks for a second approver. A normal Playwright click scrolls the table and cuts the row labels off.
- Because: the "why revenue changed" page, from the moment the bridge starts drawing.
- Workflow canvas: open Triage support tickets, run Test run, and hold on the moment it stops and asks.
- Knowledge Atlas: Re-sort, so the graph moves and the note says the corrections stayed.

If a take is broken (blank view, a spinner that never finishes, labels cut off), do not ship it. Say which demo you left out.

You need Chrome, ffmpeg, and gifsicle. Install Playwright outside the repo and point Node at it:

```
npm install --prefix /tmp/giftools playwright
NODE_PATH=/tmp/giftools/node_modules node scripts/record-gifs.mjs
```

The script writes `assets/gifs/`. Pass a name (`world-parts`, `agentic-ui`, `redline-supply`, `battery-because`, `workflow-canvas`, `knowledge-atlas`) to redo one.

The banner is `assets/banner-light.svg` and `assets/banner-dark.svg`, inside `<picture>`. Use `<picture>` only when a light file and a dark file both exist. A product card does not need a dark twin. The clips are GIFs. GitHub plays those. An animated WebP often shows only the first frame, so do not switch.

No stats cards, streaks, trophies, visitor counters, snakes, or badge walls.

The employers in the career list stay as they are. Do not add others.
