#!/usr/bin/env node
// Rewrites the Recently shipped and Ideas blocks in README.md.
// Reads public GitHub search results. Writes only the text between the markers.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const README_PATH = join(dirname(fileURLToPath(import.meta.url)), "..", "README.md");

const SHIPPED_START = "<!-- SHIPPED:START -->";
const SHIPPED_END = "<!-- SHIPPED:END -->";
const IDEAS_START = "<!-- IDEAS:START -->";
const IDEAS_END = "<!-- IDEAS:END -->";

const PR_QUERY = "is:pr is:merged author:sergushkincom user:sergushkincom";
const IDEA_QUERY = "is:issue is:open user:sergushkincom Idea in:title";
const PR_LIMIT = 5;
const IDEA_LIMIT = 6;
const PROFILE_REPO = "sergushkincom/sergushkincom";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function mdText(value) {
  const text = String(value).replace(/\s+/g, " ").replace(/[\[\]<>]/g, "").trim();
  return text || "Untitled";
}

function mdDestination(url) {
  return String(url).replace(/[() ]/g, (character) => encodeURIComponent(character));
}

function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Bad date from GitHub: ${iso}`);
  }
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function repoFullName(item) {
  const fullName = String(item.repository_url || "").split("/repos/")[1];
  if (!fullName || !/^[\w.-]+\/[\w.-]+$/.test(fullName)) {
    throw new Error("A search result had no repository name.");
  }
  return fullName;
}

function githubWebUrl(url, kind) {
  const pattern =
    kind === "pull"
      ? /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+$/
      : /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/issues\/\d+$/;
  if (!pattern.test(url)) {
    throw new Error(`Unexpected ${kind} link from GitHub.`);
  }
  return url;
}

function galleryBlock(source) {
  const start = source.indexOf("### Selected work");
  if (start < 0) {
    throw new Error("README is missing the gallery.");
  }
  const tableEnd = source.indexOf("</table>", start);
  if (tableEnd < 0) {
    throw new Error("README gallery table is not closed.");
  }
  return source.slice(start, tableEnd + "</table>".length);
}

function thisWeekBlock(source) {
  const comment = source.match(/^<!-- this-week:.*$/m);
  const line = source.match(/^\*\*This week\.\*\* .*$/m);
  if (!comment || !line) {
    throw new Error("README is missing the This week line.");
  }
  return `${comment[0]}\n${line[0]}`;
}

function assertMarkersBelowGallery(source) {
  const galleryEnd = source.indexOf(galleryBlock(source)) + galleryBlock(source).length;
  for (const marker of [SHIPPED_START, SHIPPED_END, IDEAS_START, IDEAS_END]) {
    const at = source.indexOf(marker);
    if (at < 0) {
      throw new Error(`README is missing ${marker}.`);
    }
    if (at < galleryEnd) {
      throw new Error("The generated sections have to stay below the gallery.");
    }
    if (galleryBlock(source).includes(marker) || thisWeekBlock(source).includes(marker)) {
      throw new Error("A marker is inside the gallery or the This week line.");
    }
  }
}

function replaceBlock(source, start, end, inner) {
  if (source.split(start).length !== 2 || source.split(end).length !== 2) {
    throw new Error(`Expected one ${start} and one ${end}.`);
  }
  const startAt = source.indexOf(start);
  const endAt = source.indexOf(end);
  if (endAt < startAt) {
    throw new Error(`${end} is above ${start}.`);
  }
  const body = inner.trim();
  if (!body || body.includes(start) || body.includes(end)) {
    throw new Error("Refusing to write an empty section or a section that contains a marker.");
  }
  return `${source.slice(0, startAt + start.length)}\n${body}\n${source.slice(endAt)}`;
}

function applySections(source, shippedBody, ideasBody) {
  assertMarkersBelowGallery(source);
  const week = thisWeekBlock(source);
  const gallery = galleryBlock(source);
  const next = replaceBlock(replaceBlock(source, SHIPPED_START, SHIPPED_END, shippedBody), IDEAS_START, IDEAS_END, ideasBody);
  if (thisWeekBlock(next) !== week) {
    throw new Error("Refusing to change the This week line.");
  }
  if (galleryBlock(next) !== gallery) {
    throw new Error("Refusing to change the gallery.");
  }
  return next;
}

function renderShipped(pulls, demos) {
  const lines =
    pulls.length === 0
      ? ["No merged pull request in the public repositories yet."]
      : pulls.map((pull) => {
          const repo = pull.repo.split("/")[1];
          return `- [${mdText(pull.title)}](${mdDestination(pull.url)}) · [${mdText(repo)}](https://github.com/${pull.repo}) · ${formatDate(pull.mergedAt)}`;
        });
  if (demos.length > 0) {
    const links = demos.map((demo) => `[${mdText(demo.name)}](${mdDestination(demo.homepage)})`);
    lines.push("", `Live demos: ${links.join(" · ")}`);
  }
  return lines.join("\n");
}

function renderIdeas(ideas) {
  const lines =
    ideas.length === 0
      ? ["No open issue is titled Idea: yet."]
      : ideas.map((idea) => {
          const repo = idea.repo.split("/")[1];
          return `- [${mdText(idea.title)}](${mdDestination(idea.url)}) · [${mdText(repo)}](https://github.com/${idea.repo})`;
        });
  lines.push("", "Comment on an issue if you want to talk about it.");
  return lines.join("\n");
}

function token() {
  return process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
}

async function github(pathname, allowAnonymousRetry = true) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "sergushkincom-profile-readme",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const auth = token();
  if (auth && allowAnonymousRetry) {
    headers.Authorization = `Bearer ${auth}`;
  }
  const response = await fetch(`https://api.github.com${pathname}`, {
    headers,
    signal: AbortSignal.timeout(20000),
  });
  if (allowAnonymousRetry && auth && (response.status === 401 || response.status === 403)) {
    console.error("GitHub refused the token for this request. Retrying in public.");
    return github(pathname, false);
  }
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 240).replace(/\s+/g, " ");
    throw new Error(`GitHub API ${response.status} for ${pathname.split("?")[0]}: ${detail}`);
  }
  return response.json();
}

async function searchIssues(query) {
  const params = new URLSearchParams({
    q: query,
    sort: "updated",
    order: "desc",
    per_page: "100",
  });
  const payload = await github(`/search/issues?${params}`);
  if (!Array.isArray(payload.items)) {
    throw new Error("GitHub search returned no items.");
  }
  if (payload.incomplete_results) {
    console.error("GitHub search marked the result as incomplete. Using what came back.");
  }
  return payload.items;
}

function isLiveHomepage(homepage) {
  const value = String(homepage || "").trim();
  if (!/^https?:\/\//i.test(value)) return false;
  if (/^https?:\/\/(www\.)?github\.com(\/|$)/i.test(value)) return false;
  if (/^https?:\/\/(www\.)?sergushkin\.com\/?$/i.test(value)) return false;
  return true;
}

async function liveDemosFor(pulls) {
  const demos = [];
  const seen = new Set();
  for (const pull of pulls) {
    if (seen.has(pull.repo) || pull.repo === PROFILE_REPO) continue;
    seen.add(pull.repo);
    const repo = await github(`/repos/${pull.repo}`);
    if (!isLiveHomepage(repo.homepage)) continue;
    demos.push({ name: pull.repo.split("/")[1], homepage: String(repo.homepage).trim() });
  }
  return demos;
}

async function recentPulls() {
  const items = await searchIssues(PR_QUERY);
  return items
    .filter((item) => item.pull_request && item.pull_request.merged_at)
    .map((item) => ({
      title: item.title,
      url: githubWebUrl(item.html_url, "pull"),
      repo: repoFullName(item),
      mergedAt: item.pull_request.merged_at,
    }))
    .sort((a, b) => b.mergedAt.localeCompare(a.mergedAt) || a.url.localeCompare(b.url))
    .slice(0, PR_LIMIT);
}

async function openIdeas() {
  const items = await searchIssues(IDEA_QUERY);
  return items
    .filter((item) => !item.pull_request && /^Idea:\s*\S/.test(item.title || ""))
    .map((item) => ({
      title: item.title,
      url: githubWebUrl(item.html_url, "issue"),
      repo: repoFullName(item),
      createdAt: item.created_at || "",
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.url.localeCompare(b.url))
    .slice(0, IDEA_LIMIT);
}

function usage() {
  console.error("Usage: node scripts/update-readme-sections.mjs [--dry-run]");
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--dry-run")) {
    usage();
    process.exitCode = 1;
    return;
  }
  const dryRun = args.includes("--dry-run");
  const source = readFileSync(README_PATH, "utf8");
  const pulls = await recentPulls();
  const demos = await liveDemosFor(pulls);
  const ideas = await openIdeas();
  const next = applySections(source, renderShipped(pulls, demos), renderIdeas(ideas));
  const changed = next !== source;
  console.log(`Recently shipped: ${pulls.length} pull request${pulls.length === 1 ? "" : "s"}, ${demos.length} live demo${demos.length === 1 ? "" : "s"}.`);
  console.log(`Ideas: ${ideas.length}.`);
  if (dryRun) {
    console.log(changed ? "Dry run. README.md would change." : "Dry run. README.md already matches.");
    return;
  }
  if (!changed) {
    console.log("README.md already matches.");
    return;
  }
  writeFileSync(README_PATH, next);
  console.log("Wrote README.md.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
