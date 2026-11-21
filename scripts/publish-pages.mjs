#!/usr/bin/env node
// Publishes a built site into the gh-pages branch, which GitHub Pages serves (Settings → Pages → Deploy from a branch,
// gh-pages / root). The main site lives at the branch root; each pull request's preview lives under
// pr-preview/pr-<n>/ (see .github/workflows/pages.yml and pr-preview.yml). Git only, no third-party action.
//
//   node scripts/publish-pages.mjs --dir _site --to . --keep pr-preview      # the main site, keeping the previews
//   node scripts/publish-pages.mjs --dir _site --to pr-preview/pr-5          # one PR's preview
//   node scripts/publish-pages.mjs --to pr-preview/pr-5 --remove             # remove it when the PR closes
//
// Options: --remote (default origin), --branch (default gh-pages), --message.
// The branch is kept to a single commit (each publish is a fresh root commit holding the whole site), so screenshots
// don't pile up in its history. The push uses --force-with-lease against the commit it started from; if someone else
// published in between, it fetches again, reapplies the change and retries (4 tries).
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, normalize, resolve } from "node:path";

const argv = process.argv.slice(2);
const opt = (name, fallback) => { const i = argv.indexOf("--" + name); return i >= 0 ? argv[i + 1] : fallback; };
const flag = (name) => argv.includes("--" + name);
const dir = opt("dir");
const to = normalize(opt("to", ".")).replace(/\/+$/, "") || ".";
const keep = opt("keep");
const remove = flag("remove");
const remote = opt("remote", "origin");
const branch = opt("branch", "gh-pages");
const message = opt("message", remove ? `Remove ${to}` : `Publish ${to === "." ? "the site" : to}`);
if (to.startsWith("..") || to.startsWith("/")) throw new Error(`--to must stay inside the branch: ${to}`);
if (!remove && (!dir || !existsSync(dir))) throw new Error(`--dir is missing or doesn't exist: ${dir}`);
if (remove && to === ".") throw new Error("refusing to remove the whole site");

const git = (args, cwd) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const tryGit = (args, cwd) => { try { return git(args, cwd); } catch { return null; } };
const sleep = (s) => execFileSync("sleep", [String(s)]);
const BOT = ["-c", "user.name=github-actions[bot]", "-c", "user.email=41898282+github-actions[bot]@users.noreply.github.com"];

function attempt() {
  // The branch as it is now (null if it doesn't exist yet).
  const base = tryGit(["fetch", "--depth=1", remote, `+refs/heads/${branch}:refs/remotes/${remote}/${branch}`]) !== null
    ? git(["rev-parse", `refs/remotes/${remote}/${branch}`]) : null;
  const work = mkdtempSync(join(tmpdir(), "pages-"));
  const temp = `publish-pages-${process.pid}-${Date.now()}`;
  try {
    git(["worktree", "add", "--detach", work, base ?? "HEAD"]);
    git(["checkout", "--quiet", "--orphan", temp], work);
    if (!base) git(["rm", "-rf", "--quiet", "."], work);
    // Apply the change to the working tree.
    const target = resolve(work, to);
    if (to === ".") {
      for (const f of readdirSync(work)) if (f !== ".git" && f !== keep) rmSync(join(work, f), { recursive: true, force: true });
    } else {
      rmSync(target, { recursive: true, force: true });
    }
    if (!remove) cpSync(resolve(dir), target, { recursive: true });
    writeFileSync(join(work, ".nojekyll"), ""); // serve files as they are (no Jekyll build)
    git(["add", "-A", "."], work);
    if (base && tryGit(["diff", "--cached", "--quiet", base], work) !== null) {
      console.log(`publish-pages: ${to} is already up to date`);
      return true;
    }
    git([...BOT, "commit", "--quiet", "-m", message], work);
    const sha = git(["rev-parse", "HEAD"], work);
    // Push from the repository itself (it shares the worktree's objects), so a relative remote URL still resolves.
    const lease = `--force-with-lease=refs/heads/${branch}:${base ?? ""}`;
    try { git(["push", lease, remote, `${sha}:refs/heads/${branch}`]); } catch (e) {
      console.log(`publish-pages: push rejected: ${String(e.stderr || e.message).trim().split("\n").slice(-2).join(" ")}`);
      return false;
    }
    console.log(`publish-pages: ${remove ? "removed" : "published"} ${to} on ${branch} (${sha.slice(0, 7)})`);
    return true;
  } finally {
    tryGit(["worktree", "remove", "--force", work]);
    rmSync(work, { recursive: true, force: true });
    tryGit(["branch", "-D", temp]);
  }
}

for (let i = 1; ; i++) {
  if (attempt()) break;
  if (i === 4) throw new Error(`publish-pages: push to ${branch} was rejected 4 times`);
  console.log(`publish-pages: ${branch} moved while publishing; trying again (${i + 1} of 4)`);
  sleep(2 ** i);
}
