# Profile README

Read [docs/PROJECT.md](docs/PROJECT.md) before editing `README.md`. This file is the short version.

- Keep the banner and the section "How I work with AI agents".
- One image gallery. Do not add a second grid of the same projects.
- The full list is the four `<details>` groups under "By topic". GitHub strips JavaScript, so do not add a script, a filter widget, or an Action to maintain them. The weekly Action rewrites only the marked Recently shipped and Ideas blocks.
- A Live link stays only after you have seen HTTP 200 yourself, following redirects. Use the homepage set on the GitHub repository when it returns 200.
- Keyword Tracker is `https://keyword-tracker-nine.vercel.app` unless that homepage changes and the new one returns 200.
- Do not link healthcare-ui.
- Do not link a repository or page that 404s when signed out. On 21 Nov 2026 that included the site theme and clia-prototype.
- "This week" is one or two sentences in his own words. Keep the HTML comment that starts with `this-week`. Do not put a `[DENYS: ...]` note on that line. The weekly Action does not edit that line.
- Recently shipped and Ideas I want to try are generated. Leave the text between `<!-- SHIPPED:START -->` and `<!-- SHIPPED:END -->`, and between `<!-- IDEAS:START -->` and `<!-- IDEAS:END -->`, to `scripts/update-readme-sections.mjs`. Both blocks stay below the gallery.
- The Recently shipped Action runs Monday at 06:00 UTC and when someone starts it by hand. It uses `GITHUB_TOKEN` and the public search API, and it commits `README.md` as github-actions[bot] only when the generated text changed.
- Pull requests run the same script with `--dry-run`. That checks the markers and does not write the file.
- Ideas are open issues titled `Idea:`, up to six. Do not enable Discussions.
- Gallery cards are 1280×640 in `assets/cards/`. Two columns, not three. World Parts stays the 3D storeroom card, fitted to that size. The clips are GIFs in `assets/gifs/`, under "Watch it move". How to regenerate either one is in [docs/PROJECT.md](docs/PROJECT.md).
- Above the cards, keep the link "Browse all prototypes by topic" to https://projects-gallery.vercel.app.
- Use `<picture>` only when the light and dark files differ.
- Plain sentences. No stats widgets.
- Do not name employers that are not already in the career list.
- Commit as `Denys Sergushkin <sergushkincom@users.noreply.github.com>`. No trailer on the commit or the pull request.
