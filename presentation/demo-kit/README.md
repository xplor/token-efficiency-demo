# Demo kit

Everything the presenters need to run the three live demos and the race.
Requires Node 20+, git, and the `claude` CLI signed in. Run `npm install` in
`parcel-pilot/` once first.

| File | What it is for |
|---|---|
| `stage.mjs` | Creates three clean demo copies in `../../../parcel-pilot-stage/` (one per demo). Re-run to reset. |
| `prompts.md` | Every prompt used in the session, vibe and disciplined. Copy-paste from here. |
| `race.mjs` | Runs the vibe lane and the disciplined lane headless through Claude Code, in parallel, and prints a scoreboard. |
| `verify.mjs` | Scores any demo copy: PASS/FAIL per task plus every file changed. |
| `claude-rule-example/notifications.md` | The path-scoped rule Eugene saves to `.claude/rules/` at the end of Demo 3, if typing it live is too slow. |
| `results/` | Created by `race.mjs`: one `.md` scoreboard and one `.json` per run. |

The demos use tasks 1 (tax bug), 3 (free shipping) and 4 (retry limit) from
`parcel-pilot/workshop/tasks`; the race adds task 2 (wholesale discount cap) so the
vibe chat carries four tickets. Task 3 is the one that separates the lanes on
correctness: "free on orders over £100" is a normal ticket, and it hides two rules
a vague prompt never states (exactly £100 qualifies; express is never free).

After the four tickets, the race runs a **QA round**: each lane's failing hidden
checks come back to it once as a QA report (same wording for both), and it is
scored again. The scoreboard shows first-try and after-QA results; the rework shows
up as corrections, cost and minutes. A full race costs roughly $1.50–$2.50.

## Why the demo copies are separate

The demo copies leave out `workshop/` (the answers) and `verify/` (the hidden
checks), and live outside this repository, so the agent cannot find the
solutions or these prompts. `verify.mjs` and `race.mjs` copy `verify/` in only
for scoring, then remove it.

## Personal Claude Code config

Your personal `~/.claude/CLAUDE.md`, rules, plugins and MCP servers load into
every session, including the demos and both race lanes. In rehearsal, git rules
made agents create branches, commit, and once discard a correct fix as an
"unrelated change", which corrupted the scoreboard.

`race.mjs` blocks git in both lanes (`Bash(git:*)`), so that can't happen in the
race. In a live demo it only shows up as git chatter; say so and move on.

Optional, for a fully clean run: a separate profile that holds nothing but a login.
Sign in once from a normal terminal (not a `!` command, it needs to be interactive):

```powershell
$env:CLAUDE_CONFIG_DIR = "$HOME\.claude-demo"
claude        # run /login in this window, then /exit
```

Then use the same `$env:CLAUDE_CONFIG_DIR` in the demo terminals and pass
`--config-dir ~/.claude-demo` to the race.

## Commands

```bash
node stage.mjs
```

```bash
node race.mjs --model sonnet
```

```bash
node verify.mjs ../../../parcel-pilot-stage/demo1-vibe 1 3
```

```bash
node race.mjs --dry-run
```

The dry run stages, scores and prints an empty scoreboard without calling Claude:
use it to check the machine before the session.

`race.mjs` runs Claude Code with `--permission-mode acceptEdits` and Bash allowed,
but only inside its throwaway copies under your temp folder. Each run spends
real usage (the scoreboard reports the cost); both lanes always use the same
model so the comparison is fair. Files changed are counted against the
`workshop/start` tag, so they're still counted if an agent commits its own work.
