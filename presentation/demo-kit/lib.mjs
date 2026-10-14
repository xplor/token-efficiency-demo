// Shared helpers for stage.mjs, verify.mjs and race.mjs.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const KIT_DIR = dirname(fileURLToPath(import.meta.url));
export const REPO_DIR = resolve(KIT_DIR, "..", "..", "parcel-pilot");

// Folders the agent must not see during a demo: the workshop answers and the
// facilitator verification suite. verify/ is copied back in only to score a run.
const HIDDEN = new Set(["workshop", "verify", "coverage", ".git"]);

export function sh(cmd, cwd, { quiet = true } = {}) {
  const r = spawnSync(cmd, { cwd, shell: true, encoding: "utf8" });
  if (!quiet) process.stdout.write((r.stdout ?? "") + (r.stderr ?? ""));
  return { ok: r.status === 0, out: (r.stdout ?? "") + (r.stderr ?? "") };
}

/** Copy parcel-pilot into `dest` without the hidden folders, then commit it. */
export function stageCopy(dest) {
  if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  cpSync(REPO_DIR, dest, {
    recursive: true,
    filter: (src) => {
      // Windows hands the filter long-path ("\\?\D:\...") names; strip that prefix.
      const rel = relative(REPO_DIR, src.replace(/^\\\\\?\\/, ""));
      return !rel || !HIDDEN.has(rel.split(sep)[0]);
    },
  });
  if (!existsSync(join(dest, "node_modules"))) sh("npm install --no-audit --no-fund", dest);
  sh("git init -q", dest);
  sh("git add -A", dest);
  sh('git -c user.name=demo -c user.email=demo@example.com commit -qm "workshop start"', dest);
  sh("git tag workshop/start", dest);
}

/** Copy verify/ in, run one task's verification, remove it again. */
export function verifyTask(dir, task) {
  return verifyDetails(dir, task).ok;
}

/**
 * Like verifyTask, but also returns the titles of the checks that failed, so they
 * can be read back to an agent as a QA report. The JSON report goes to the temp
 * folder, not the demo copy, so it never shows up as a changed file.
 */
export function verifyDetails(dir, task) {
  const target = join(dir, "verify");
  const report = join(tmpdir(), `parcel-pilot-verify-${process.pid}-${task}.json`);
  cpSync(join(REPO_DIR, "verify"), target, { recursive: true });
  try {
    const { ok } = sh(
      `npx vitest run --config vitest.verify.config.ts verify/task-${task}.verify.test.ts`
        + ` --reporter=json --outputFile="${report}"`,
      dir,
    );
    let failed = [];
    if (existsSync(report)) {
      const json = JSON.parse(readFileSync(report, "utf8"));
      failed = json.testResults
        .flatMap((file) => file.assertionResults)
        .filter((a) => a.status !== "passed")
        .map((a) => a.title);
    }
    // A failed run with no failing assertions (e.g. a compile error) still counts as a failure.
    if (!ok && !failed.length) failed = ["the verification suite did not run (build or type error)"];
    return { ok, failed };
  } finally {
    rmSync(target, { recursive: true, force: true });
    rmSync(report, { force: true });
  }
}

/**
 * Every file that differs from the "workshop start" tag. Diffing against the tag,
 * not `git status`, still counts changes when the agent commits its own work.
 */
export function changedFiles(dir) {
  const lines = (cmd) => sh(cmd, dir).out.split("\n").map((l) => l.trim()).filter(Boolean);
  const tracked = lines("git diff --name-only workshop/start");
  const untracked = lines("git ls-files --others --exclude-standard");
  return [...new Set([...tracked, ...untracked])];
}
