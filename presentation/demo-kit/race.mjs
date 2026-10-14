// The race: the same four tasks, run headless through Claude Code twice, in parallel.
//
//   vibe         one conversation, four vague prompts (vibe-1, -3, -2, -4 in prompts.md)
//   disciplined  a fresh conversation per task, six-part prompts (disciplined-1, -3, -2, -4)
//
// Then a QA round: each lane's hidden-check failures come back to it once as a QA report
// (same wording for both lanes; vibe in its existing chat, disciplined in a fresh one),
// and it is scored again. That rework is counted as corrections, cost and minutes.
//
//   node race.mjs [--model sonnet] [--max-turns 40] [--root <dir>] [--config-dir <dir>] [--dry-run]
//
// Kick it off at minute 0 of the session; reveal the scoreboard at the end. Each lane
// works in its own throwaway copy of parcel-pilot (no workshop/ or verify/ folders),
// so nothing it does can touch this repository. Results are written to ./results/.
//
// Both lanes run with git disabled, so personal rules can't branch or discard work.
// Optional: --config-dir runs both lanes under a separate Claude Code profile
// (CLAUDE_CONFIG_DIR), keeping your personal ~/.claude/CLAUDE.md, rules and MCP servers
// out of the race entirely. Sign in to that profile once first: see README.md.
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { homedir, tmpdir } from "node:os";
import { basename, join, relative, resolve } from "node:path";
import { KIT_DIR, changedFiles, stageCopy, verifyDetails } from "./lib.mjs";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const MODEL = opt("model", "sonnet");
const MAX_TURNS = opt("max-turns", "40");
const CONFIG_DIR = opt("config-dir", process.env.CLAUDE_CONFIG_DIR);
const DRY_RUN = args.includes("--dry-run");

// Resolve the long-form path: on Windows tmpdir() can return an 8.3 short name
// (C:\Users\ABCDEF~1\...) while the agent reports long paths, which breaks relative().
const ROOT_ARG = resolve(opt("root", join(tmpdir(), "parcel-pilot-race")));
mkdirSync(ROOT_ARG, { recursive: true });
const ROOT = realpathSync.native(ROOT_ARG);

// Race tasks in the order they are sent, and the names QA uses for them.
const TASKS = ["1", "3", "2", "4"];
const TASK_NAMES = { 1: "Discounted-order tax", 2: "Wholesale discount cap", 3: "Free shipping", 4: "Notification retries" };

// Files that genuinely help with tasks 1-4 (plus the cheap routing docs).
const RELEVANT = new Set([
  "CLAUDE.md", "AGENTS.md", "docs/architecture.md",
  "docs/decisions/002-pricing-operation-order.md",
  "docs/decisions/003-notification-retries.md",
  "docs/decisions/004-promotions-are-not-pricing.md",
  "src/pricing/calculate-order-total.ts", "tests/pricing/calculate-order-total.test.ts",
  "src/pricing/shipping-price.ts", "src/pricing/pricing-policy.ts",
  "tests/pricing/shipping-price.test.ts",
  "src/pricing/apply-discount.ts", "tests/pricing/wholesale-discount.test.ts",
  "src/notifications/retry-policy.ts", "tests/notifications/retry-policy.test.ts",
]);
// ADR 003 says to update it when the retry limit changes, so editing it is expected.
const EXPECTED_CHANGES = new Set([
  "src/pricing/calculate-order-total.ts", "tests/pricing/calculate-order-total.test.ts",
  "src/pricing/shipping-price.ts", "src/pricing/pricing-policy.ts",
  "tests/pricing/shipping-price.test.ts",
  "src/pricing/apply-discount.ts", "tests/pricing/wholesale-discount.test.ts",
  "src/notifications/retry-policy.ts", "tests/notifications/retry-policy.test.ts",
  "docs/decisions/003-notification-retries.md",
]);

function loadPrompts() {
  const md = readFileSync(join(KIT_DIR, "prompts.md"), "utf8");
  const prompts = {};
  for (const m of md.matchAll(/<!-- prompt:([\w-]+) -->\s*```text\r?\n([\s\S]*?)```/g)) {
    prompts[m[1]] = m[2].trim();
  }
  return prompts;
}

const HEADLESS_NOTE =
  "\n\n(Headless run: nobody is available to review. Write the plan in your reply, then implement it.)";

function newStats() {
  return {
    costUsd: 0, durationMs: 0, turns: 0, tokensProcessed: 0, peakContext: 0,
    toolCalls: 0, searches: 0, bashCalls: 0, fullTestRuns: 0, focusedTestRuns: 0,
    filesRead: new Set(), touchedArchiveOrFixture: false, prompts: 0, qaPrompts: 0,
  };
}

/** Run every hidden check. Returns { task: { ok, failed: [titles] } }. */
function verifyAll(dir) {
  return Object.fromEntries(TASKS.map((t) => [t, verifyDetails(dir, t)]));
}

/** The QA report: the failed checks by name, same wording for both lanes. */
function qaReport(results) {
  const lines = TASKS.flatMap((t) => results[t].failed.map((f) => `- ${TASK_NAMES[t]}: ${f}`));
  return lines.length
    ? `QA found these acceptance checks failing:\n${lines.join("\n")}\n\nFix them without breaking anything else, then run the relevant tests.`
    : null;
}

function track(stats, lane, dir, block) {
  if (block.type !== "tool_use") return;
  const input = block.input ?? {};
  const rel = (p) => {
    if (!p) return "";
    const r = relative(dir, resolve(dir, p)).replace(/\\/g, "/");
    if (!r.startsWith("..")) return r;
    // Same folder spelled another way (short vs long name, /c/ vs C:/): match on the lane suffix.
    const marker = `/${basename(ROOT)}/${lane}/`;
    const i = r.lastIndexOf(marker);
    return i >= 0 ? r.slice(i + marker.length) : r;
  };
  stats.toolCalls++;
  let detail = "";
  if (block.name === "Read") {
    const f = rel(input.file_path);
    stats.filesRead.add(f);
    detail = f;
  } else if (block.name === "Grep" || block.name === "Glob") {
    stats.searches++;
    detail = `${input.pattern ?? ""} ${rel(input.path)}`.trim();
  } else if (block.name === "Bash") {
    stats.bashCalls++;
    const cmd = String(input.command ?? "");
    if (/\b(npm (run )?test|vitest)\b/.test(cmd)) {
      if (/(npm (run )?test|vitest( run)?)\s*(-- )?\s*(tests\/|-t )/.test(cmd)) stats.focusedTestRuns++;
      else stats.fullTestRuns++;
    }
    detail = cmd.slice(0, 90);
  } else if (input.file_path) {
    detail = rel(input.file_path);
  }
  if (/archive\/|large-order-history/.test(detail)) stats.touchedArchiveOrFixture = true;
  console.log(`[${lane.padEnd(11)}] ${block.name.padEnd(5)} ${detail}`);
}

function runClaude(lane, dir, prompt, stats, resumeId) {
  const cliArgs = [
    "-p", "--output-format", "stream-json", "--verbose",
    "--model", MODEL, "--max-turns", MAX_TURNS,
    "--permission-mode", "acceptEdits",
    "--allowedTools", "Read,Glob,Grep,Edit,Write,Bash,TodoWrite",
    // No git in either lane: personal rules ("branch, commit, ship it") otherwise move or
    // discard work between tasks, and the scorer only sees the final working tree.
    "--disallowedTools", "WebFetch,WebSearch,Bash(git:*)",
  ];
  if (resumeId) cliArgs.push("--resume", resumeId);
  stats.prompts++;
  console.log(`[${lane.padEnd(11)}] >>> ${prompt.split("\n")[0].slice(0, 80)}`);

  return new Promise((resolveRun, reject) => {
    const env = CONFIG_DIR ? { ...process.env, CLAUDE_CONFIG_DIR: CONFIG_DIR } : process.env;
    const child = spawn("claude", cliArgs, { cwd: dir, env, shell: process.platform === "win32" });
    let sessionId = resumeId;
    let buffer = "";
    child.stdout.on("data", (chunk) => {
      buffer += chunk;
      let nl;
      while ((nl = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line.startsWith("{")) continue;
        let ev;
        try { ev = JSON.parse(line); } catch { continue; }
        if (ev.session_id) sessionId = ev.session_id;
        if (ev.type === "assistant") {
          const u = ev.message?.usage;
          if (u) {
            const ctx = (u.input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0);
            stats.peakContext = Math.max(stats.peakContext, ctx);
          }
          for (const block of ev.message?.content ?? []) track(stats, lane, dir, block);
        } else if (ev.type === "result") {
          const u = ev.usage ?? {};
          stats.costUsd += ev.total_cost_usd ?? 0;
          stats.durationMs += ev.duration_ms ?? 0;
          stats.turns += ev.num_turns ?? 0;
          stats.tokensProcessed += (u.input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0)
            + (u.cache_creation_input_tokens ?? 0) + (u.output_tokens ?? 0);
        }
      }
    });
    child.stderr.on("data", (d) => process.stderr.write(`[${lane}] ${d}`));
    child.on("error", reject);
    child.on("close", () => resolveRun(sessionId));
    child.stdin.end(prompt);
  });
}

// `qaFresh`: whether the QA report starts a new conversation (disciplined) or goes into
// the existing one (vibe), matching how each lane works.
async function runLane(lane, steps, { qaFresh }) {
  const dir = join(ROOT, lane);
  stageCopy(dir);
  const stats = newStats();
  let session;
  for (const step of steps) {
    if (DRY_RUN) { console.log(`[${lane.padEnd(11)}] (dry run) ${step.prompt.split("\n")[0]}`); continue; }
    session = await runClaude(lane, dir, step.prompt, stats, step.fresh ? undefined : session);
  }

  // First try, then one QA round for whatever failed, then score again.
  const firstTry = verifyAll(dir);
  const report = DRY_RUN ? null : qaReport(firstTry);
  let final = firstTry;
  if (report) {
    console.log(`[${lane.padEnd(11)}] QA round: ${report.split("\n").length - 3} failing check(s)`);
    stats.qaPrompts++;
    await runClaude(lane, dir, report, stats, qaFresh ? undefined : session);
    final = verifyAll(dir);
  }

  const changed = changedFiles(dir);
  const read = [...stats.filesRead];
  const ok = (results) => Object.fromEntries(TASKS.map((t) => [t, results[t].ok]));
  return {
    lane, dir, ...stats,
    filesRead: read,
    relevantRead: read.filter((f) => RELEVANT.has(f)).length,
    changed,
    unrelatedChanged: changed.filter((f) => !EXPECTED_CHANGES.has(f)),
    verifiedFirstTry: ok(firstTry),
    verified: ok(final),
    qaReport: report,
  };
}

const fmt = {
  n: (v) => Math.round(v).toLocaleString("en-GB"),
  k: (v) => `${(v / 1000).toFixed(1)}k`,
  usd: (v) => `$${v.toFixed(2)}`,
  min: (ms) => `${(ms / 60000).toFixed(1)}`,
  pct: (a, b) => (b ? `${Math.round((100 * a) / b)}%` : "-"),
};

// Rows are slide 7's six scorecard measures (same labels, correctness first), then the costs from slide 6,
// then diagnostics. Correctness leads because that's how slide 23 is read.
function scoreboard(v, d) {
  const count = (results) => `${Object.values(results).filter(Boolean).length} / ${TASKS.length}`;
  // Corrections are the QA-round prompts: rework after the first answer was wrong.
  const prompts = (x) => `${x.prompts} (${x.qaPrompts})`;
  const pf = (b) => (b ? "PASS" : "FAIL");
  // Per task: first try, and the result after QA when it changed.
  const task = (t) => (x) => (x.verifiedFirstTry[t] === x.verified[t]
    ? pf(x.verified[t])
    : `${pf(x.verifiedFirstTry[t])} → ${pf(x.verified[t])} after QA`);
  const both = (f) => [f(v), f(d)];
  const rows = [
    ["**Scorecard (slide 7)**", "", ""],
    ["Hidden verification passed, first try", ...both((x) => count(x.verifiedFirstTry))],
    ["...after one QA round", ...both((x) => count(x.verified))],
    ...TASKS.map((t) => [`...task ${t} (${TASK_NAMES[t].toLowerCase()})`, ...both(task(t))]),
    ["Files read / files that mattered", ...both((x) => `${x.filesRead.length} / ${x.relevantRead} (${fmt.pct(x.relevantRead, x.filesRead.length)})`)],
    ["Prompts (corrections)", ...both(prompts)],
    ["Full / focused test runs", ...both((x) => `${x.fullTestRuns} / ${x.focusedTestRuns}`)],
    ["Files changed that didn't need to", ...both((x) => x.unrelatedChanged.length)],
    ["Peak context (tokens)", ...both((x) => fmt.k(x.peakContext))],
    ["**Cost, including rework (slide 6)**", "", ""],
    ["Tokens processed", ...both((x) => fmt.k(x.tokensProcessed))],
    ["Cost (USD)", ...both((x) => fmt.usd(x.costUsd))],
    ["Agent minutes", ...both((x) => fmt.min(x.durationMs))],
    ["**Diagnostics**", "", ""],
    ["Agent turns", v.turns, d.turns],
    ["Searches (Grep/Glob)", v.searches, d.searches],
    ["Opened archive/ or big fixture", ...both((x) => (x.touchedArchiveOrFixture ? "yes" : "no"))],
    ["Files changed in total", ...both((x) => x.changed.length)],
  ];
  const lines = ["| Metric | Vibe | Disciplined |", "|---|---:|---:|", ...rows.map((r) => `| ${r.join(" | ")} |`)];
  lines.push("", `Model: ${MODEL}. Unrelated files changed - vibe: ${v.unrelatedChanged.join(", ") || "none"}; disciplined: ${d.unrelatedChanged.join(", ") || "none"}.`);
  return lines.join("\n");
}

const prompts = loadPrompts();
for (const id of TASKS.flatMap((t) => [`vibe-${t}`, `disciplined-${t}`])) {
  if (!prompts[id]) throw new Error(`prompts.md is missing <!-- prompt:${id} -->`);
}

// A personal CLAUDE.md or rules folder loads into both lanes. Git is blocked, so it can't
// corrupt the score, but it still adds to context. Mention it rather than refuse.
const personal = ["CLAUDE.md", "rules"].filter((f) => existsSync(join(homedir(), ".claude", f)));
if (!CONFIG_DIR && personal.length) {
  console.warn(`Note: your ~/.claude/${personal.join(" and ~/.claude/")} will load into both lanes`
    + " (git is blocked either way). --config-dir <profile> keeps them out entirely.\n");
}

console.log(`Race starting - model ${MODEL}, copies under ${ROOT}`
  + `${CONFIG_DIR ? `, profile ${CONFIG_DIR}` : ""}${DRY_RUN ? " (dry run)" : ""}\n`);
// Vibe: one chat, every ticket and the QA report in it. Disciplined: a fresh chat each
// time; task 1 is a one-liner, so it alone skips the plan.
const [vibe, disciplined] = await Promise.all([
  runLane(
    "vibe",
    TASKS.map((t, i) => ({ prompt: prompts[`vibe-${t}`], fresh: i === 0 })),
    { qaFresh: false },
  ),
  runLane(
    "disciplined",
    TASKS.map((t) => ({ prompt: prompts[`disciplined-${t}`] + (t === "1" ? "" : HEADLESS_NOTE), fresh: true })),
    { qaFresh: true },
  ),
]);

const board = scoreboard(vibe, disciplined);
console.log(`\n${board}\n`);
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const outDir = join(KIT_DIR, "results");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, `race-${stamp}.md`), `# Race ${stamp}\n\n${board}\n`);
writeFileSync(join(outDir, `race-${stamp}.json`), JSON.stringify({ model: MODEL, vibe, disciplined }, null, 2));
console.log(`Saved results/race-${stamp}.md and .json`);
