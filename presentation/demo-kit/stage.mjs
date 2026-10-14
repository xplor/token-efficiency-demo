// Creates three clean, git-initialised copies of parcel-pilot for the live demos.
//
//   node stage.mjs [stage-root]
//
// Default stage root: a "parcel-pilot-stage" folder next to this repository, so the
// agent in each demo cannot see the presentation, the prompts, or the answers.
// Re-run it to reset every demo copy, or `git reset --hard workshop/start && git clean -fd`
// inside one copy to reset just that one.
import { join, resolve } from "node:path";
import { KIT_DIR, stageCopy } from "./lib.mjs";

const root = resolve(process.argv[2] ?? join(KIT_DIR, "..", "..", "..", "parcel-pilot-stage"));
const lanes = {
  "demo1-vibe": "Demo 1 - Eugene, Claude Code: the vibe-coding session",
  "demo2-disciplined": "Demo 2 - Adam, Claude Code: the disciplined loop",
  "demo3-notifications": "Demo 3 - Eugene, Claude Code: new goal, fresh context",
};

for (const [name, purpose] of Object.entries(lanes)) {
  const dir = join(root, name);
  process.stdout.write(`Staging ${dir} ... `);
  stageCopy(dir);
  console.log(`done  (${purpose})`);
}
console.log("\nOpen each folder as its own project. Expect exactly one failing test in each.");
