// Scores a demo copy against the hidden verification suite.
//
//   node verify.mjs <demo-copy-dir> [task ...]      e.g. node verify.mjs ../../../parcel-pilot-stage/demo1-vibe 1 3
//
// Prints PASS/FAIL per task and every file that changed since "workshop start".
import { resolve } from "node:path";
import { changedFiles, verifyTask } from "./lib.mjs";

const [dirArg, ...taskArgs] = process.argv.slice(2);
if (!dirArg) {
  console.error("usage: node verify.mjs <demo-copy-dir> [task ...]");
  process.exit(1);
}
const dir = resolve(dirArg);
const tasks = taskArgs.length ? taskArgs : ["1", "2", "3", "4"];

for (const t of tasks) console.log(`Task ${t}: ${verifyTask(dir, t) ? "PASS" : "FAIL"}`);
const files = changedFiles(dir);
console.log(`\nFiles changed (${files.length}):`);
for (const f of files) console.log(`  ${f}`);
