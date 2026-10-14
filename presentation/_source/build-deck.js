const pptxgen = require("pptxgenjs");
const { applyTheme } = require("./apply-theme.js");

const OUT = process.argv[2] || "../vibe-vs-verified.pptx";

// Xplor palette, lifted from "Fitness Boutique AI Metric.pptx".
const THEME = {
  name: "Xplor",
  headFontFace: "Calibri",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "282F35", lt1: "FFFFFF", dk2: "401F9F", lt2: "F1F6FA",
    accent1: "6923F4", accent2: "0FA3A4", accent3: "545D63",
    accent4: "3ACBCA", accent5: "BABEFC", accent6: "8C969F",
    hlink: "6923F4", folHlink: "401F9F",
  },
};
const HEX = THEME.colors;
const LINE = "EAF0F4";
const MONO = "Consolas";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.title = "Vibe vs. Verified";
pres.author = "Adam & Eugene";
pres.company = "Xplor";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;
const INK = C.text1, PURPLE = C.text2, WHITE = C.background1, MIST = C.background2;
const VIOLET = C.accent1, TEAL = C.accent2, SLATE = C.accent3, AQUA = C.accent4, LAV = C.accent5, MUTED = C.accent6;

// ---------- layouts ----------
// Classification footer, copied from the Xplor template's slide master:
// bottom-left, 10pt, black at 50% (white at 50% on the dark layouts so it stays legible).
const confidential = (dark) => ({ text: { text: "Xplor Technologies - CONFIDENTIAL", options: {
  x: 0.07, y: 7.26, w: 2.6, h: 0.17, fontSize: 10, margin: 0, color: dark ? "FFFFFF" : "000000", transparency: 50, objectName: "Classification footer" } } });
pres.defineSlideMaster({
  title: "TITLE_DARK",
  background: { color: VIOLET },
  objects: [
    confidential(true),
    { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 2.2, w: 11.5, h: 1.1, fontSize: 54, bold: true, color: WHITE, valign: "bottom", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "subtitle", type: "body", x: 0.8, y: 3.4, w: 11.5, h: 0.7, fontSize: 24, color: MIST, valign: "top", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "byline", type: "body", x: 0.8, y: 5.4, w: 11.5, h: 1.0, fontSize: 16, bold: true, color: AQUA, valign: "top", margin: 0 }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "DEMO_DARK",
  background: { color: PURPLE },
  objects: [
    confidential(true),
    { placeholder: { options: { name: "title", type: "title", x: 0.7, y: 0.95, w: 8.0, h: 0.8, fontSize: 36, bold: true, color: WHITE, valign: "top", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "subtitle", type: "body", x: 0.7, y: 1.75, w: 8.0, h: 0.45, fontSize: 16, color: LAV, valign: "top", margin: 0 }, text: "" } },
    { text: { text: "Vibe vs. Verified", options: { x: 0.7, y: 7.0, w: 4, h: 0.3, fontSize: 10, color: LAV, margin: 0 } } },
  ],
  slideNumber: { x: 12.15, y: 7.0, w: 0.5, h: 0.3, fontSize: 10, color: LAV, align: "right" },
});
pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: WHITE },
  objects: [
    confidential(false),
    { placeholder: { options: { name: "title", type: "title", x: 0.7, y: 0.45, w: 9.2, h: 0.7, fontSize: 30, bold: true, color: PURPLE, valign: "top", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "subtitle", type: "body", x: 0.7, y: 1.12, w: 11.9, h: 0.4, fontSize: 15, color: SLATE, valign: "top", margin: 0 }, text: "" } },
    { text: { text: "Vibe vs. Verified", options: { x: 0.7, y: 7.0, w: 4, h: 0.3, fontSize: 10, color: MUTED, margin: 0 } } },
  ],
  slideNumber: { x: 12.15, y: 7.0, w: 0.5, h: 0.3, fontSize: 10, color: MUTED, align: "right" },
});

// ---------- helpers ----------
let current;
function section(title) { current = title; pres.addSection({ title }); }
function slide(master) { return pres.addSlide({ masterName: master, sectionTitle: current }); }

function chip(s, text, dark = false) {
  s.addText(text, { x: 9.6, y: 0.5, w: 3.03, h: 0.3, fontSize: 11, bold: true, charSpacing: 1, color: dark ? AQUA : MUTED, align: "right", margin: 0, isTextBox: true, objectName: "block chip" });
}
function glyph(s, x, y, d, fill, g, size = 18) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill }, objectName: "glyph circle" });
  s.addText(g, { x, y, w: d, h: d, fontSize: size, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0, isTextBox: true });
}
function panel(s, x, y, w, h, color = MIST) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color }, line: { color }, objectName: "panel" });
}
function text(s, t, o) { s.addText(t, { margin: 0, isTextBox: true, valign: "top", color: INK, fontSize: 15, ...o }); }
// Leading spaces become non-breaking so PowerPoint keeps code indentation.
const nbsp = (t) => t.replace(/^ +/gm, (m) => " ".repeat(m.length));
function code(s, t, x, y, w, h, size = 14) {
  panel(s, x, y, w, h, INK);
  s.addText(nbsp(t), { x: x + 0.25, y: y + 0.18, w: w - 0.5, h: h - 0.36, fontFace: MONO, fontSize: size, color: MIST, valign: "top", margin: 0, isTextBox: true, objectName: "code" });
}
function bullets(items, o = {}) {
  return items.map((t, i) => ({ text: t, options: { bullet: { indent: 18 }, breakLine: i < items.length - 1, paraSpaceAfter: 6, ...o } }));
}
function note(s, t, y = 6.2, h = 0.6) {
  panel(s, 0.7, y, 11.9, h);
  text(s, t, { x: 0.95, y, w: 11.4, h, fontSize: 15, bold: true, color: PURPLE, valign: "middle" });
}

// =====================================================================
section("Open");
// 1 — title
{
  const s = slide("TITLE_DARK");
  s.addText("Vibe vs. Verified", { placeholder: "title" });
  s.addText("Token-efficient AI development with Claude Code (and Cursor)", { placeholder: "subtitle" });
  s.addText("Adam & Eugene  ·  60-minute live session", { placeholder: "byline" });
  s.addNotes("ADAM. Welcome. 60 minutes, no laptops needed - we drive, you watch and heckle. We alternate theory and live demos four times so nobody sits through 30 minutes of slides. Promise: every demo is live in the Claude Code CLI, and every habit works the same in Cursor - the Cursor equivalents are on the cheat sheet you get at the end.");
}

// 2 — the race
{
  const s = slide("CONTENT");
  chip(s, "OPEN · ADAM");
  s.addText("Two agents started racing when we said hello", { placeholder: "title" });
  s.addText("Same repository, same model, same four tasks. Only the way we prompt them differs.", { placeholder: "subtitle" });
  const lanes = [
    { y: 1.9, color: SLATE, g: "~", name: "Vibe lane", how: "One conversation · four one-line prompts · no files, no constraints, no test command" },
    { y: 3.65, color: TEAL, g: "✓", name: "Disciplined lane", how: "Fresh conversation per task · six-part prompts · plan first · narrowest test, then verify" },
  ];
  for (const l of lanes) {
    panel(s, 0.7, l.y, 11.9, 1.5);
    glyph(s, 0.95, l.y + 0.25, 0.5, l.color, l.g);
    text(s, l.name, { x: 1.65, y: l.y + 0.22, w: 4.2, h: 0.4, fontSize: 18, bold: true, color: l.color });
    text(s, l.how, { x: 1.65, y: l.y + 0.68, w: 4.4, h: 0.7, fontSize: 14, color: SLATE });
    // Tickets in the order the race sends them.
    ["Tax bug", "Free shipping", "Discount cap", "Retry limit"].forEach((t, i) => {
      const x = 6.2 + i * 1.6;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: l.y + 0.45, w: 1.45, h: 0.6, rectRadius: 0.08, fill: { color: WHITE }, line: { color: l.color, width: 1.25 }, objectName: "task chip" });
      text(s, t, { x, y: l.y + 0.45, w: 1.45, h: 0.6, fontSize: 13, bold: true, color: INK, align: "center", valign: "middle" });
    });
  }
  note(s, "Then a QA round: any failed check goes back to that lane once, like a real QA ticket. We read the scoreboard at minute 54.", 5.6, 0.7);
  s.addNotes("ADAM. [Eugene starts `node race.mjs` on the second screen/terminal NOW if not already running.] Before we explain anything, we've started two Claude Code agents on the same four tickets in this repo. One gets prompts the way we all write them at 4pm on a Thursday. The other gets the habits we're about to teach. Same model. When both finish, QA checks the work and sends any failures back once - same report to both - because in real life a wrong answer comes back to you. We'll come back at the end and see who was right, and what it cost including the rework.");
}

// 3 — agenda
{
  const s = slide("CONTENT");
  chip(s, "OPEN · ADAM");
  s.addText("Theory, demo, theory, demo", { placeholder: "title" });
  s.addText("Every idea gets shown live within ten minutes of being explained.", { placeholder: "subtitle" });
  const rows = [
    ["0:03", "THEORY", "How context actually works", "Adam"],
    ["0:09", "DEMO", "Vibe it: one prompt, no plan", "Eugene drives"],
    ["0:17", "THEORY", "Planning keeps agents on target", "Eugene"],
    ["0:27", "DEMO", "Plan, save, clear, build", "Adam drives"],
    ["0:38", "THEORY", "Managing context and progressive disclosure", "Adam"],
    ["0:46", "DEMO", "New goal, fresh context", "Eugene drives"],
    ["0:54", "DEMO", "Race results and takeaways", "Both"],
  ];
  rows.forEach((r, i) => {
    const y = 1.85 + i * 0.66;
    const demo = r[1] === "DEMO";
    text(s, r[0], { x: 0.7, y, w: 0.9, h: 0.5, fontSize: 16, bold: true, color: MUTED, valign: "middle" });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 1.7, y: y + 0.08, w: 1.3, h: 0.36, rectRadius: 0.08, fill: { color: demo ? TEAL : VIOLET }, line: { color: demo ? TEAL : VIOLET }, objectName: "block type" });
    text(s, r[1], { x: 1.7, y: y + 0.08, w: 1.3, h: 0.36, fontSize: 12, bold: true, charSpacing: 1, color: WHITE, align: "center", valign: "middle" });
    text(s, r[2], { x: 3.3, y, w: 6.5, h: 0.5, fontSize: 18, bold: true, valign: "middle" });
    text(s, r[3], { x: 9.9, y, w: 2.7, h: 0.5, fontSize: 15, color: SLATE, align: "right", valign: "middle" });
  });
  s.addNotes("ADAM. Quick shape of the hour. Purple is us talking, teal is a live demo. Two big themes: planning is how we keep an agent on target, and managing context is how we keep it cheap. Questions are welcome during demos - that's when the agent is thinking anyway.");
}

section("Theory 1 - Context");
// 4 — working set
{
  const s = slide("CONTENT");
  chip(s, "THEORY 1 · ADAM");
  s.addText("Context is a working set, not a warehouse", { placeholder: "title" });
  s.addText("Everything below shares one window, and the model re-reads all of it on every turn.", { placeholder: "subtitle" });
  const segs = [
    ["System + tools", 1.5, SLATE], ["Rules files", 1.3, PURPLE], ["Your prompt", 0.9, VIOLET],
    ["Files it read", 3.4, TEAL], ["Tool output", 2.4, AQUA], ["History", 2.4, LAV],
  ];
  let x = 0.7;
  for (const [label, w, color] of segs) {
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.85, w, h: 0.95, fill: { color }, line: { color: WHITE, width: 2 }, objectName: "window segment" });
    text(s, label, { x, y: 1.85, w, h: 0.95, fontSize: 14, bold: true, color: color === LAV || color === AQUA ? INK : WHITE, align: "center", valign: "middle" });
    x += w;
  }
  text(s, "One context window", { x: 0.7, y: 2.9, w: 6, h: 0.3, fontSize: 12, bold: true, charSpacing: 1, color: MUTED });
  const rows = [
    [VIOLET, "→", "It does not remember your repository", "Each turn starts from this window only. Whatever it had to discover, it pays to discover again next session."],
    [TEAL, "!", "Irrelevant material is not neutral", "Every extra file competes with the useful ones and invites the agent to explore further."],
    [PURPLE, "▲", "Each turn re-pays for everything before it", "A full test log on turn 3 is still in the window on turn 30. Long chats get slower, pricier and vaguer."],
  ];
  rows.forEach(([c, g, h, b], i) => {
    const y = 3.45 + i * 1.12;
    glyph(s, 0.7, y, 0.5, c, g);
    text(s, h, { x: 1.45, y: y - 0.04, w: 10.9, h: 0.38, fontSize: 17, bold: true });
    text(s, b, { x: 1.45, y: y + 0.36, w: 10.9, h: 0.6, fontSize: 15, color: SLATE });
  });
  s.addNotes("ADAM. The wrong mental model: the agent 'knows' my repo. The right one: a fixed-size working set, and everything competes for it. Your CLAUDE.md, every file it opened, every test log, every message so far. And it's re-read every single turn - that's where cost and quality both go. Mental model to keep: include what helps the NEXT decision, nothing else.");
}

// 5 — numbers
{
  const s = slide("CONTENT");
  chip(s, "THEORY 1 · ADAM");
  s.addText("What reading costs in today's demo repo", { placeholder: "title" });
  s.addText("parcel-pilot: a small TypeScript order-pricing service with 57 source files and about 120 tests.", { placeholder: "subtitle" });
  const stats = [
    ["~1.5k", "tokens", "One focused source file", TEAL],
    ["~30k", "tokens", "All 57 files under src/", VIOLET],
    ["~130k", "tokens", "One careless read of the analytics fixture", PURPLE],
    ["1", "line", "The actual fix for the tax bug", INK],
  ];
  stats.forEach(([n, unit, label, color], i) => {
    const x = 0.7 + i * 3.0;
    panel(s, x, 1.9, 2.8, 2.6);
    text(s, n, { x: x + 0.25, y: 2.1, w: 2.4, h: 1.0, fontSize: 54, bold: true, color });
    text(s, unit.toUpperCase(), { x: x + 0.25, y: 3.1, w: 2.4, h: 0.3, fontSize: 12, bold: true, charSpacing: 1, color: MUTED });
    text(s, label, { x: x + 0.25, y: 3.5, w: 2.4, h: 0.9, fontSize: 15, color: SLATE });
  });
  text(s, "Like any real codebase, some files look more relevant than they are", { x: 0.7, y: 4.85, w: 11.9, h: 0.4, fontSize: 18, bold: true });
  text(s, bullets([
    "archive/ holds retired pricing code that looks current - and is never compiled or tested",
    "tax-calculator.ts is the obvious suspect for a tax bug; the bug is somewhere else",
    "src/shipping/ has carrier-rates.ts and shipping-selector.ts: right-sounding, wrong for what the customer pays",
  ]), { x: 0.7, y: 5.3, w: 11.9, h: 1.5, fontSize: 15, color: SLATE });
  s.addNotes("ADAM. Make it concrete. One careless read of that analytics fixture costs more than the entire source tree - four times over. The demo bug needs ONE line changed in ONE file. And this repo is deliberately realistic: dead code that looks alive, files whose names lie. Your agent doesn't know which is which unless you tell it.");
}

// 6 — four costs
{
  const s = slide("CONTENT");
  chip(s, "THEORY 1 · ADAM");
  s.addText("Tokens are the smallest of four costs", { placeholder: "title" });
  s.addText("We are not trying to minimise tokens. We are maximising verified progress per minute, per token and per prompt.", { placeholder: "subtitle" });
  const cards = [
    [TEAL, "◔", "Time", "Wall-clock minutes to a verified result - not to the first green tick."],
    [VIOLET, "◧", "Context", "How much of the window is used, and by what. Bloat makes answers worse, not just pricier."],
    [PURPLE, "↺", "Interaction", "Every corrective prompt you type: \"no, not that file\" is a cost you pay twice."],
    [SLATE, "✎", "Rework", "Changes to files that never needed to change - and the review time they burn."],
  ];
  cards.forEach(([c, g, h, b], i) => {
    const x = 0.7 + (i % 2) * 6.05, y = 1.9 + Math.floor(i / 2) * 1.95;
    panel(s, x, y, 5.85, 1.75);
    glyph(s, x + 0.3, y + 0.3, 0.6, c, g, 20);
    text(s, h, { x: x + 1.15, y: y + 0.28, w: 4.4, h: 0.4, fontSize: 20, bold: true });
    text(s, b, { x: x + 1.15, y: y + 0.75, w: 4.45, h: 0.85, fontSize: 15, color: SLATE });
  });
  note(s, "A cheap session that ships the wrong change is the most expensive outcome there is.", 6.0, 0.65);
  s.addNotes("ADAM. If you remember one slide from theory 1, it's this one. 'Token efficiency' is not about being stingy. A 20-cent session that edits the wrong file and passes review is the most expensive thing that can happen. So we measure four things, and tokens are the least painful of them.");
}

// 7 — keep score
{
  const s = slide("CONTENT");
  chip(s, "THEORY 1 · ADAM");
  s.addText("How we'll keep score in every demo", { placeholder: "title" });
  s.addText("Tool-neutral numbers you can count yourself, in Cursor or Claude Code.", { placeholder: "subtitle" });
  const hdr = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: PURPLE } } });
  const rows = [
    [hdr("Metric"), hdr("Why it matters")],
    ["Files read / files that mattered", "The single best signal of a wandering agent"],
    ["Prompts, and how many were corrections", "Corrections mean the first prompt left something out"],
    ["Full vs. focused test runs", "A full suite log sits in context for the rest of the chat"],
    ["Files changed that didn't need to", "Rework and review cost"],
    ["Peak context", "/context or the status line · Cursor: context % status line"],
    ["Hidden verification passed?", "Correctness - the cost that actually hurts"],
  ];
  s.addTable(rows, { x: 0.7, y: 1.85, w: 7.4, colW: [3.3, 4.1], fontSize: 14, color: INK, border: { type: "solid", pt: 1, color: LINE }, rowH: 0.56, valign: "middle", margin: [0.04, 0.12, 0.04, 0.12], objectName: "score table" });
  panel(s, 8.5, 1.85, 4.1, 3.92);
  text(s, "THE HEADLINE RATIO", { x: 8.8, y: 2.1, w: 3.5, h: 0.3, fontSize: 12, bold: true, charSpacing: 1, color: MUTED });
  text(s, "≥ 70%", { x: 8.8, y: 2.45, w: 3.5, h: 1.0, fontSize: 60, bold: true, color: TEAL });
  text(s, "relevant files read ÷ total files read", { x: 8.8, y: 3.55, w: 3.5, h: 0.7, fontSize: 17, bold: true });
  text(s, "If most of what the agent opened didn't matter, the prompt didn't say what you knew.", { x: 8.8, y: 4.35, w: 3.5, h: 1.2, fontSize: 15, color: SLATE });
  s.addNotes("ADAM. Here's the scorecard for every demo. Shout these out when you see them. The headline ratio: of the files it opened, how many mattered? Aim for 70% or better. Eugene, take it away - let's vibe.");
}

// =====================================================================
section("Demo 1 - Vibe");
// 8 — demo 1
{
  const s = slide("DEMO_DARK");
  chip(s, "LIVE DEMO 1 · EUGENE", true);
  s.addText("Demo 1 · Vibe it", { placeholder: "title" });
  s.addText("Claude Code · fresh session · no hints, no file names, no test command", { placeholder: "subtitle" });
  text(s, "THE PROMPTS", { x: 0.7, y: 2.5, w: 6.6, h: 0.3, fontSize: 12, bold: true, charSpacing: 1, color: AQUA });
  code(s, "An order with a percentage discount is\ncharged too much tax. Fix the bug and\nmake the tests pass.", 0.7, 2.85, 6.6, 1.55, 16);
  text(s, "then, in the same chat:", { x: 0.7, y: 4.55, w: 6.6, h: 0.3, fontSize: 14, color: LAV });
  code(s, "Also, make shipping free on orders\nover £100.", 0.7, 4.9, 6.6, 1.2, 16);
  panel(s, 7.75, 2.5, 4.85, 4.2, C.text1);
  text(s, "WATCH FOR", { x: 8.05, y: 2.75, w: 4.3, h: 0.3, fontSize: 12, bold: true, charSpacing: 1, color: AQUA });
  text(s, bullets([
    "How many files it opens (1 matters)",
    "archive/ or the 130k fixture",
    "Full test-suite runs",
    "Exactly £100: free, or still £5?",
    "Express: did it go free too?",
    "Hidden check, then context %",
  ], { paraSpaceAfter: 9 }), { x: 8.05, y: 3.15, w: 4.3, h: 3.4, fontSize: 16, color: WHITE });
  s.addNotes("EUGENE drives, ADAM narrates and tallies. Eugene: fresh Claude Code session in parcel-pilot-stage/demo1-vibe, status line visible. Paste prompt 1 - expect the tax fix to be right; say 'good docs and a failing test did our job for us'. Then prompt 2 in the SAME chat; ask the room if anyone sees a problem with the ticket. When it finishes, run the hidden check: node demo-kit/verify.mjs ../../parcel-pilot-stage/demo1-vibe 1 3. In rehearsal Task 3 failed every time: '> 10000' means exactly £100 still pays, and express went free too. Open shipping-price.ts and show the one if. Then /context. Adam: 'It did exactly what we asked. The bug is in the prompt.'");
}

// =====================================================================
section("Theory 2 - Planning");
// 9 — anti-patterns
{
  const s = slide("CONTENT");
  chip(s, "THEORY 2 · EUGENE");
  s.addText("It wasn't the model's fault", { placeholder: "title" });
  s.addText("Six vibe-coding habits that turn a one-line fix into an expensive session.", { placeholder: "subtitle" });
  const items = [
    ["\"Fix it\" prompts", "The agent has to rediscover what you already knew: the file, the rule, the test."],
    ["One chat for every goal", "Pricing context is still in the window while it works on notifications."],
    ["Attach the folder, just in case", "Attach a symbol before a file, a file before a folder, a folder almost never."],
    ["Full test suite every turn", "120 tests of output re-read on every later turn. Run the narrowest test first."],
    ["The correction spiral", "Five \"no, not that\" prompts cost more than one good first prompt."],
    ["Strongest model for everything", "Max mode on a rename is paying a surgeon to put on a plaster."],
  ];
  items.forEach(([h, b], i) => {
    const x = 0.7 + (i % 2) * 6.05, y = 1.85 + Math.floor(i / 2) * 1.45;
    panel(s, x, y, 5.85, 1.3);
    glyph(s, x + 0.25, y + 0.25, 0.45, SLATE, "✗", 16);
    text(s, h, { x: x + 0.95, y: y + 0.2, w: 4.7, h: 0.38, fontSize: 17, bold: true });
    text(s, b, { x: x + 0.95, y: y + 0.6, w: 4.7, h: 0.65, fontSize: 14, color: SLATE });
  });
  s.addNotes("EUGENE. Debrief what we just saw - tie each card to a moment in Demo 1 ('remember when it opened tax-calculator.ts?'). None of this is the model being dumb. It did exactly what we asked: find out everything, because we told it nothing.");
}

// 10 — the loop
{
  const s = slide("CONTENT");
  chip(s, "THEORY 2 · EUGENE");
  s.addText("The disciplined loop", { placeholder: "title" });
  s.addText("Five verbs. Each one replaces something the agent would otherwise pay to discover or repair.", { placeholder: "subtitle" });
  const steps = [
    ["1", "Aim", "Write a six-part prompt: goal, acceptance, files, constraints, plan?, verify.", VIOLET],
    ["2", "Plan", "Make its thinking visible. Review it; then it's the contract.", PURPLE],
    ["3", "Build", "Agent mode with the plan approved. No drive-by refactors.", TEAL],
    ["4", "Prove", "Narrowest test first, then typecheck, then the full suite once.", SLATE],
    ["5", "Reset", "New goal → /clear. Same goal, long chat → compact.", INK],
  ];
  steps.forEach(([n, h, b, c], i) => {
    const x = 0.7 + i * 2.42;
    panel(s, x, 1.95, 2.22, 3.5);
    glyph(s, x + 0.25, 2.2, 0.6, c, n, 22);
    text(s, h, { x: x + 0.25, y: 2.95, w: 1.8, h: 0.5, fontSize: 24, bold: true, color: c });
    text(s, b, { x: x + 0.25, y: 3.5, w: 1.8, h: 1.85, fontSize: 15, color: SLATE });
    if (i < steps.length - 1) text(s, "›", { x: x + 2.2, y: 3.35, w: 0.24, h: 0.5, fontSize: 26, bold: true, color: MUTED, align: "center" });
  });
  note(s, "Optimise for a short search, not a short prompt.", 5.85, 0.65);
  s.addNotes("EUGENE. This is the whole lesson on one slide - everything else is detail. Aim, Plan, Build, Prove, Reset. Notice that 'plan' is conditional and 'prove' is not.");
}

// 11 — six-part prompt
{
  const s = slide("CONTENT");
  chip(s, "THEORY 2 · EUGENE");
  s.addText("Aim: the six-part prompt", { placeholder: "title" });
  s.addText("Six lines, not six paragraphs. Example: the free-shipping ticket Demo 1 got wrong.", { placeholder: "subtitle" });
  const hdr = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: PURPLE } } });
  const b = (t) => ({ text: t, options: { bold: true } });
  const rows = [
    [hdr("Part"), hdr("Answers"), hdr("Example")],
    [b("Goal"), "What observable result exists afterwards?", "Free standard shipping from £100, after discount"],
    [b("Acceptance"), "How do we know it's right, edge cases included?", "Exactly £100 → free; express → never free"],
    [b("Context"), "Which files, symbols, tests, docs?", "shipping-price.ts, pricing-policy.ts; not src/shipping/"],
    [b("Constraints"), "What must not change?", "Method selection; no floats, no new literals"],
    [b("Plan?"), "Plan first, or straight to the edit?", "Plan in ≤ 8 lines, then wait for me"],
    [b("Verify"), "The exact command that proves it", "npm test -- tests/pricing && npm run typecheck"],
  ];
  s.addTable(rows, { x: 0.7, y: 1.85, w: 11.9, colW: [1.9, 4.6, 5.4], fontSize: 15, color: INK, border: { type: "solid", pt: 1, color: LINE }, rowH: 0.6, valign: "middle", margin: [0.04, 0.14, 0.04, 0.14], objectName: "six-part table" });
  note(s, "The acceptance row is the one that matters: both edge cases Demo 1 got wrong are in it.", 6.25, 0.6);
  s.addNotes("EUGENE. Walk the rows using the Demo 2 task - the same ticket Demo 1 failed. Point at the acceptance row: 'over £100' became '> 10000', so exactly £100 still paid; and nobody said express was excluded. Two facts we knew and never typed. And the context row says 'not src/shipping/' - because carrier-rates.ts and shipping-selector.ts are sitting there sounding perfect.");
}

// 12 — before / after
{
  const s = slide("CONTENT");
  chip(s, "THEORY 2 · EUGENE");
  s.addText("Longer prompt, shorter session", { placeholder: "title" });
  s.addText("The second prompt costs about 150 more tokens and saves the agent from reading the repository.", { placeholder: "subtitle" });
  text(s, "VIBE", { x: 0.7, y: 1.85, w: 4.3, h: 0.3, fontSize: 12, bold: true, charSpacing: 1, color: SLATE });
  code(s, "An order with a percentage\ndiscount is charged too much\ntax. Fix the bug and make\nthe tests pass.", 0.7, 2.2, 4.3, 2.1, 15);
  text(s, "Agent must discover: which file, which rule, what not to touch, how to check.", { x: 0.7, y: 4.5, w: 4.3, h: 1.0, fontSize: 15, color: SLATE });
  text(s, "DISCIPLINED", { x: 5.4, y: 1.85, w: 7.2, h: 0.3, fontSize: 12, bold: true, charSpacing: 1, color: TEAL });
  code(s, [
    "Fix the discounted-order tax calculation.",
    "",
    "Start with: src/pricing/calculate-order-total.ts",
    "  + its test, and docs/decisions/002-*.md",
    "Order: subtotal → discount → shipping → tax.",
    "Don't touch tax rates or public API types.",
    "Don't read archive/ or fixtures/.",
    "",
    "Verify: npm test -- tests/pricing/calculate-",
    "  order-total.test.ts && npm run typecheck",
  ].join("\n"), 5.4, 2.2, 7.2, 3.3, 14);
  note(s, "Counter-intuitive rule: don't optimise for a short prompt. Optimise for a short search.", 6.35, 0.55);
  s.addNotes("EUGENE. Same bug. The right-hand prompt is maybe 150 tokens longer. It removes a repository-wide search worth tens of thousands. Everything in it is something you, the engineer, already knew - you'd just never have typed it.");
}


// T2e — cheapest place to be wrong
{
  const s = slide("CONTENT");
  chip(s, "THEORY 2 · EUGENE");
  s.addText("The plan is the cheapest place to be wrong", { placeholder: "title" });
  s.addText("Every agent plans. The only question is whether it does it where you can see it.", { placeholder: "subtitle" });
  const stages = [
    [TEAL, "Caught in the plan", 1.0, "You read 8 lines and fix one. Nothing to undo; the window is still small."],
    [VIOLET, "Caught during the build", 2.0, "Corrections, re-reads, reverted edits. Every failed attempt stays in the context."],
    [PURPLE, "Caught in review or prod", 3.0, "PR churn, a new session to rediscover it all, maybe an incident."],
  ];
  stages.forEach(([c, h, bar, b], i) => {
    const x = 0.7 + i * 4.03;
    panel(s, x, 1.85, 3.83, 4.0);
    s.addShape(pres.shapes.RECTANGLE, { x: x + 0.3, y: 2.15 + (3.0 - bar) * 0.55, w: 0.55, h: bar * 0.55, fill: { color: c }, line: { color: c }, objectName: "cost bar" });
    text(s, "COST", { x: x + 1.05, y: 3.5, w: 2.5, h: 0.3, fontSize: 12, bold: true, charSpacing: 1, color: MUTED });
    text(s, ["low", "higher", "highest"][i], { x: x + 1.05, y: 3.05, w: 2.5, h: 0.45, fontSize: 22, bold: true, color: c });
    text(s, h, { x: x + 0.3, y: 4.0, w: 3.3, h: 0.45, fontSize: 18, bold: true });
    text(s, b, { x: x + 0.3, y: 4.5, w: 3.3, h: 1.2, fontSize: 15, color: SLATE });
  });
  note(s, "In Demo 1 the agent planned silently, inside its own head, where nobody could ask \"does exactly £100 count?\" before it was written.", 6.05, 0.75);
  s.addNotes("EUGENE. This is why we plan. The agent in Demo 1 DID plan - it just did it invisibly, between tool calls. Plan mode makes that thinking visible and reviewable before a single edit. A wrong assumption costs one line to fix in a plan, a correction spiral in the build, and a whole new session after review.");
}

// T2f — plan anatomy and contract
{
  const s = slide("CONTENT");
  chip(s, "THEORY 2 · EUGENE");
  s.addText("A plan that keeps the agent on target", { placeholder: "title" });
  s.addText("Ask for these sections, read them, then treat the approved plan as the contract.", { placeholder: "subtitle" });
  text(s, "ASK THE PLAN FOR", { x: 0.7, y: 1.85, w: 6.6, h: 0.3, fontSize: 12, bold: true, charSpacing: 1, color: MUTED });
  code(s, [
    "Goal         one line, in your words",
    "Change       shipping-price.ts,",
    "             pricing-policy.ts",
    "Don't touch  src/shipping/, price-breakdown",
    "Approach     >= threshold, after discount,",
    "             standard method only",
    "Tests        £99.99 / £100 / £150; express;",
    "             £120 - 20% = £96 still pays",
    "Verify       npm test -- tests/pricing",
    "Open Qs      anything it had to guess",
  ].join("\n"), 0.7, 2.2, 6.6, 3.2, 14);
  panel(s, 7.65, 1.85, 4.95, 3.55);
  glyph(s, 7.95, 2.1, 0.5, TEAL, "✓");
  text(s, "Then it's the contract", { x: 8.6, y: 2.12, w: 3.8, h: 0.45, fontSize: 18, bold: true, color: PURPLE });
  text(s, bullets([
    "Approve only what you've read",
    "Build only what's in the plan",
    "New evidence? Stop and re-plan; don't patch around it",
    "\"Don't touch\" is what stops the drive-by refactor",
    "Skip planning when the fix is one obvious line",
  ], { paraSpaceAfter: 8 }), { x: 7.95, y: 2.75, w: 4.45, h: 2.6, fontSize: 15 });
  note(s, "A plan that just restates your prompt cost tokens and bought nothing. A good plan says something you didn't.", 5.7, 0.6);
  s.addNotes("EUGENE. The sections that matter most are the two people skip: 'don't touch' and 'open questions'. 'Don't touch' is what keeps the agent from wandering into src/shipping/ or refactoring the pipeline. 'Open questions' is where it tells you what it guessed - 'does exactly £100 count? express too?' is where both of Demo 1's bugs would have surfaced. Once approved, the plan is the contract: if the agent finds something that breaks the plan, the right move is to stop and re-plan, not let it improvise.");
}

// T2g — plan, save, clear, build
{
  const s = slide("CONTENT");
  chip(s, "THEORY 2 · EUGENE");
  s.addText("Plan, save, clear, build", { placeholder: "title" });
  s.addText("Exploring is expensive and noisy. Keep the conclusion, throw away the search.", { placeholder: "subtitle" });
  const steps = [
    ["1", "Plan", "Plan mode. The agent reads and explores; the window fills with search results.", 0.55, VIOLET],
    ["2", "Save", "Write the approved plan to plans/<task>.md. It's the compressed knowledge.", 0.6, PURPLE],
    ["3", "Clear", "/clear. The exploration noise is gone; the plan file and the repo remain.", 0.08, TEAL],
    ["4", "Build", "\"Implement plans/<task>.md.\" A fresh window holding only what matters.", 0.2, SLATE],
  ];
  steps.forEach(([n, h, b, fillPct, c], i) => {
    const x = 0.7 + i * 3.02;
    panel(s, x, 1.85, 2.82, 4.05);
    glyph(s, x + 0.25, 2.1, 0.55, c, n, 18);
    text(s, h, { x: x + 0.95, y: 2.15, w: 1.7, h: 0.45, fontSize: 22, bold: true, color: c });
    text(s, b, { x: x + 0.25, y: 2.85, w: 2.35, h: 1.6, fontSize: 15, color: SLATE });
    text(s, "CONTEXT USED", { x: x + 0.25, y: 4.75, w: 2.3, h: 0.25, fontSize: 10, bold: true, charSpacing: 1, color: MUTED });
    s.addShape(pres.shapes.RECTANGLE, { x: x + 0.25, y: 5.05, w: 2.3, h: 0.35, fill: { color: WHITE }, line: { color: LAV, width: 1 }, objectName: "context bar frame" });
    s.addShape(pres.shapes.RECTANGLE, { x: x + 0.25, y: 5.05, w: 2.3 * fillPct, h: 0.35, fill: { color: c }, line: { color: c }, objectName: "context bar fill" });
    if (i < steps.length - 1) text(s, "›", { x: x + 2.8, y: 3.4, w: 0.24, h: 0.5, fontSize: 26, bold: true, color: MUTED, align: "center" });
  });
  text(s, "Bars are illustrative.", { x: 0.7, y: 5.95, w: 4, h: 0.25, fontSize: 10, color: MUTED });
  note(s, "The plan file doubles as your handoff: a teammate, a fresh session or tomorrow-you can start from it.", 6.25, 0.6);
  s.addNotes("EUGENE. This is where planning and context management meet. Planning is the expensive, exploratory part - it fills the window with search results and dead ends. Once you have a plan you trust, save it to a file and clear. The build then starts from a clean window containing the plan and the files it names - nothing else. Same tools in both CLIs: plan mode via Shift+Tab, then /clear. Adam will do exactly this in the next demo.");
}

section("Demo 2 - Disciplined");
// 15 — demo 2
{
  const s = slide("DEMO_DARK");
  chip(s, "LIVE DEMO 2 · ADAM", true);
  s.addText("Demo 2 · Plan, save, clear, build", { placeholder: "title" });
  s.addText("Claude Code CLI · the same tickets as Demo 1, done with a plan", { placeholder: "subtitle" });
  const steps = [
    ["1", "Tax bug: six-part prompt, no plan (it's one line). Then /context."],
    ["2", "/clear. Shift+Tab into plan mode. Six-part prompt for free shipping."],
    ["3", "Review the plan out loud: at least £100? after discount? express excluded?"],
    ["4", "Save it to plans/free-shipping.md. /context, then /clear."],
    ["5", "\"Implement plans/free-shipping.md.\" Narrow test, hidden check, /context."],
  ];
  steps.forEach(([n, t], i) => {
    const y = 2.5 + i * 0.86;
    glyph(s, 0.7, y, 0.5, TEAL, n, 18);
    text(s, t, { x: 1.4, y: y + 0.02, w: 6.0, h: 0.75, fontSize: 16, color: WHITE });
  });
  panel(s, 7.75, 2.5, 4.85, 4.2, C.text1);
  text(s, "WATCH FOR", { x: 8.05, y: 2.75, w: 4.3, h: 0.3, fontSize: 12, bold: true, charSpacing: 1, color: AQUA });
  text(s, bullets([
    "Files read ≈ files named",
    "Edge cases in the plan, before any edit",
    "Context drop after /clear",
    "Build reads the plan + named files",
    "One focused test run",
    "Task 3: PASS here, FAIL in Demo 1",
  ], { paraSpaceAfter: 9 }), { x: 8.05, y: 3.15, w: 4.3, h: 3.4, fontSize: 16, color: WHITE });
  s.addNotes("ADAM drives the Claude Code CLI in parcel-pilot-stage/demo2-disciplined, EUGENE narrates and keeps the same tally as Demo 1. Prompts: demo-kit/prompts.md (disciplined-1, disciplined-3, save-plan, build-from-plan). Step 2: 'same ticket Demo 1 got wrong - this time we say the two things we knew.' At step 3 ask the room 'what would you change in this plan?'. At step 4, read /context before and after /clear as numbers - a fresh session still holds the system prompt and CLAUDE.md, so the floor isn't zero. Step 5: run verify.mjs ... 1 3 - Task 3 passes here and failed in Demo 1.");
}

// =====================================================================
section("Theory 3 - Context");
// 16 — continue compact clear
{
  const s = slide("CONTENT");
  chip(s, "THEORY 3 · ADAM");
  s.addText("Continue, compact or clear?", { placeholder: "title" });
  s.addText("Decide before you type the next prompt. Each option keeps a different amount of the past.", { placeholder: "subtitle" });
  const cards = [
    [TEAL, "→", "Continue", "Same goal, context still small.", "KEEPS: everything", "Just keep going."],
    [VIOLET, "◧", "Compact / summarize", "Same goal, chat getting long.", "KEEPS: a summary you steer", "/compact <what to keep> · /summarize"],
    [PURPLE, "↻", "Clear", "New goal, or the chat went wrong.", "KEEPS: the repo + your plan file", "/clear in both CLIs"],
  ];
  cards.forEach(([c, g, h, when, keeps, how], i) => {
    const x = 0.7 + i * 4.03;
    panel(s, x, 1.85, 3.83, 3.15);
    glyph(s, x + 0.3, 2.1, 0.6, c, g, 20);
    text(s, h, { x: x + 0.3, y: 2.85, w: 3.3, h: 0.5, fontSize: 22, bold: true, color: c });
    text(s, when, { x: x + 0.3, y: 3.38, w: 3.3, h: 0.4, fontSize: 16, bold: true });
    text(s, keeps, { x: x + 0.3, y: 3.85, w: 3.3, h: 0.3, fontSize: 12, bold: true, charSpacing: 1, color: MUTED });
    text(s, how, { x: x + 0.3, y: 4.25, w: 3.3, h: 0.6, fontSize: 14, color: SLATE });
  });
  panel(s, 0.7, 5.25, 11.9, 1.45);
  glyph(s, 0.95, 5.5, 0.5, TEAL, "✓");
  text(s, "Clearing is not losing work", { x: 1.65, y: 5.45, w: 10.7, h: 0.4, fontSize: 18, bold: true, color: PURPLE });
  text(s, "Code, tests, docs, git and your plan file are the durable memory. The transcript is scaffolding.", { x: 1.65, y: 5.9, w: 10.7, h: 0.6, fontSize: 15, color: SLATE });
  s.addNotes("ADAM. Three options, and the difference is what survives. Continue keeps everything, including the noise. Compact (Claude Code) or summarize (Cursor CLI) replaces the transcript with a summary - it's lossy, so tell it what to keep. Clear keeps nothing but the repo - which is fine when the plan or handoff is in a file. 'Keep context under 20%' is a smoke alarm, not a law.");
}

// T3b — signals and compacting well
{
  const s = slide("CONTENT");
  chip(s, "THEORY 3 · ADAM");
  s.addText("When to reset, and how to compact well", { placeholder: "title" });
  s.addText("Context rot is gradual. These are the signs, and the habits that keep a long session sharp.", { placeholder: "subtitle" });
  const cols = [
    [PURPLE, "!", "Time to reset when…", [
      "The goal changed, even slightly",
      "It forgets a constraint you gave earlier",
      "It retries a fix that already failed",
      "Old logs and searches no longer matter",
      "Context passes ~50% and you're mid-task",
    ]],
    [TEAL, "✓", "Compact well", [
      "At a boundary (after the plan, after a sub-task), not mid-edit",
      "Say what to keep: \"/compact keep the plan, decisions, failing tests\"",
      "Restate the key constraint in one line afterwards",
      "Went the wrong way? Rewind (Esc Esc · /rewind) - don't argue with it",
      "Don't wait for auto-compact; it chooses what you lose",
    ]],
  ];
  cols.forEach(([c, g, h, items], i) => {
    const x = 0.7 + i * 6.05;
    panel(s, x, 1.85, 5.85, 4.85);
    glyph(s, x + 0.3, 2.1, 0.5, c, g, 18);
    text(s, h, { x: x + 1.0, y: 2.13, w: 4.6, h: 0.45, fontSize: 19, bold: true, color: c });
    text(s, bullets(items, { paraSpaceAfter: 10 }), { x: x + 0.35, y: 2.85, w: 5.25, h: 3.7, fontSize: 15 });
  });
  s.addNotes("ADAM. Left: the signals. The big one is the agent forgetting something you told it - that means the instruction has been buried by everything since. Right: compacting is a summary written by the model, so steer it. Compact at a natural boundary, say what matters, and restate the one constraint that must not be lost. And if the agent went down a wrong path, rewind to before it - arguing with it leaves the wrong path in context forever.");
}

// T3c — progressive disclosure layers
{
  const s = slide("CONTENT");
  chip(s, "THEORY 3 · ADAM");
  s.addText("Progressive disclosure for agent docs", { placeholder: "title" });
  s.addText("Load knowledge in layers. The agent pays only for the layer the current step needs.", { placeholder: "subtitle" });
  const layers = [
    ["0", "Always loaded", "CLAUDE.md / AGENTS.md: commands, non-negotiables, pointers", "every turn · ~1 screen", PURPLE, 4.6],
    ["1", "Routing map", "docs/architecture.md: which file owns what", "when locating code", VIOLET, 5.7],
    ["2", "Scoped rules", ".claude/rules + paths · nested CLAUDE.md · .cursor/rules", "when matching files are touched", TEAL, 6.8],
    ["3", "Deep docs", "Decision records, runbooks, skills, specs", "only when changing that rule", SLATE, 7.9],
  ];
  layers.forEach(([n, h, what, when, c, w], i) => {
    const y = 1.85 + i * 1.08;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.7, y, w, h: 0.92, rectRadius: 0.08, fill: { color: c }, line: { color: c }, objectName: "layer" });
    text(s, `${n}  ${h}`, { x: 0.95, y: y + 0.1, w: w - 0.4, h: 0.38, fontSize: 17, bold: true, color: WHITE });
    text(s, what, { x: 0.95, y: y + 0.48, w: w - 0.4, h: 0.38, fontSize: 13, color: WHITE });
    text(s, when, { x: w + 0.95, y: y + 0.25, w: 12.6 - w - 0.95, h: 0.45, fontSize: 14, bold: true, color: c, valign: "middle" });
  });
  note(s, "Skills and description-based rules work the same way: a one-line description is always loaded; the body loads only when it's relevant.", 6.25, 0.6);
  s.addNotes("ADAM. Progressive disclosure is the single biggest structural win for agent docs. Layer 0 is the only thing paid on every turn, so it's tiny and mostly pointers. Layer 1 is a routing map the agent reads when it needs to find code. Layer 2 is scoped rules that load only when the agent touches matching files. Layer 3 is the deep stuff - ADRs, runbooks, skills - pulled only when changing that specific rule. parcel-pilot is built exactly like this, which is partly why the disciplined runs stay small.");
}

// T3d — pointers not paragraphs
{
  const s = slide("CONTENT");
  chip(s, "THEORY 3 · ADAM");
  s.addText("Pointers, not paragraphs", { placeholder: "title" });
  s.addText("Layer 0 should tell the agent where to look, not everything it might need to know.", { placeholder: "subtitle" });
  text(s, "PARCEL-PILOT'S CLAUDE.md (ABRIDGED)", { x: 0.7, y: 1.85, w: 5.8, h: 0.3, fontSize: 12, bold: true, charSpacing: 1, color: TEAL });
  code(s, [
    "- Test one file: npm test -- <path>",
    "- Money is integer minor units.",
    "- archive/ is historical; never use it.",
    "",
    "Run the narrowest test before the full",
    "suite.",
    "",
    "Read docs/architecture.md only when you",
    "need to locate code.",
    "Read the relevant docs/decisions/ record",
    "only when changing a business rule.",
  ].join("\n"), 0.7, 2.2, 5.8, 3.85, 14);
  text(s, "THE BLOATED VERSION", { x: 6.8, y: 1.85, w: 5.8, h: 0.3, fontSize: 12, bold: true, charSpacing: 1, color: SLATE });
  code(s, [
    "## Pricing",
    "Discounts apply before tax. Shipping is",
    "taxable. Wholesale tiers get... (40 lines)",
    "## Notifications",
    "Retries are... backoff is... (30 lines)",
    "## Promotions  (25 lines)",
    "## History",
    "In 2024 we migrated... (60 lines)",
    "## Things that went wrong once",
    "...",
  ].join("\n"), 6.8, 2.2, 5.8, 3.85, 14);
  note(s, "Every line in an always-loaded file should earn its place on every task - including the ones that never touch pricing.", 6.25, 0.6);
  s.addNotes("ADAM. Left is real - it's this repo's CLAUDE.md. Short facts that apply to every task, then pointers with a condition: read X only when Y. Right is what most CLAUDE.md files become after a year: every lesson, every incident, every subsystem, paid for on every turn of every session, including the ones fixing a typo in notifications.");
}

// 17 — knowledge routing
{
  const s = slide("CONTENT");
  chip(s, "THEORY 3 · ADAM");
  s.addText("Put each lesson at the narrowest layer", { placeholder: "title" });
  s.addText("Whatever loads automatically is paid for on every turn of every session, by everyone on the team.", { placeholder: "subtitle" });
  panel(s, 0.7, 1.85, 4.6, 3.75);
  text(s, "PAID ON EVERY TURN", { x: 1.0, y: 2.1, w: 4.0, h: 0.3, fontSize: 12, bold: true, charSpacing: 1, color: MUTED });
  text(s, bullets([
    "CLAUDE.md and AGENTS.md",
    "Cursor rules with alwaysApply",
    "MCP servers' tool definitions",
    "Every message already in the chat",
  ]), { x: 1.0, y: 2.5, w: 4.0, h: 2.0, fontSize: 16 });
  text(s, "Keep layer 0 to about one screen. Disable MCP servers you aren't using in this task.", { x: 1.0, y: 4.2, w: 4.0, h: 1.2, fontSize: 15, bold: true, color: PURPLE });
  const hdr = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: PURPLE } } });
  const rows = [
    [hdr("Lesson learned"), hdr("Where it belongs")],
    ["Money is integer minor units", "Layer 0 - one line"],
    ["Pricing operation order", "Layer 2 rule + layer 3 ADR"],
    ["Free shipping starts at £100", "Policy constant + test"],
    ["A retry excludes attempt 1", "Layer 2 notifications rule"],
    ["\"Task 1 took three prompts\"", "Nowhere. Let it go."],
  ];
  s.addTable(rows, { x: 5.6, y: 1.85, w: 7.0, colW: [3.4, 3.6], fontSize: 15, color: INK, border: { type: "solid", pt: 1, color: LINE }, rowH: 0.62, valign: "middle", margin: [0.04, 0.14, 0.04, 0.14], objectName: "knowledge table" });
  text(s, "After a bad session, resist \"add it to CLAUDE.md\". Find the narrowest layer where it will still be found.", { x: 5.6, y: 5.8, w: 7.0, h: 0.6, fontSize: 15, color: SLATE });
  s.addNotes("ADAM. The instinct after a bad session is 'add it to CLAUDE.md'. Do that for a year and every prompt carries thousands of tokens of folklore. Use the layers. Eugene's going to show the whole thing: a new goal, a fresh context, and a lesson saved as a scoped rule.");
}

// =====================================================================
section("Demo 3 - Fresh context");
// 19 — demo 3
{
  const s = slide("DEMO_DARK");
  chip(s, "LIVE DEMO 3 · EUGENE", true);
  s.addText("Demo 3 · New goal, fresh context", { placeholder: "title" });
  s.addText("Claude Code CLI · the subject changes from pricing to notifications", { placeholder: "subtitle" });
  const steps = [
    ["1", "New goal, so /clear. Show CLAUDE.md: short, and nothing about notifications."],
    ["2", "Shift+Tab into plan mode. @ the retry policy and its test; the prompt points at ADR 003."],
    ["3", "Spot the trap: two retries means three attempts. Did the plan get it right?"],
    ["4", "Build. Narrow test, typecheck, hidden verification. /compact if it got long."],
    ["5", "Save the lesson at layer 2: a path-scoped rule, not CLAUDE.md."],
  ];
  steps.forEach(([n, t], i) => {
    const y = 2.5 + i * 0.86;
    glyph(s, 0.7, y, 0.5, TEAL, n, 18);
    text(s, t, { x: 1.4, y: y + 0.02, w: 6.0, h: 0.75, fontSize: 16, color: WHITE });
  });
  panel(s, 7.75, 2.5, 4.85, 4.2, C.text1);
  text(s, ".claude/rules/notifications.md", { x: 8.05, y: 2.75, w: 4.3, h: 0.3, fontSize: 12, bold: true, color: AQUA });
  text(s, [
    "---",
    "paths:",
    "  - \"src/notifications/**\"",
    "  - \"tests/notifications/**\"",
    "---",
    "- A retry is an attempt AFTER",
    "  the initial one: N retries",
    "  = N + 1 attempts (ADR 003)",
  ].join("\n").replace(/^ +/gm, (m) => " ".repeat(m.length)), { x: 8.05, y: 3.15, w: 4.3, h: 3.4, fontFace: MONO, fontSize: 14, color: MIST });
  s.addNotes("EUGENE drives the Claude Code CLI in parcel-pilot-stage/demo3-notifications, ADAM narrates. Step 1: cat CLAUDE.md so the room sees layer 0 is short and says nothing about notifications. Step 2: point out the agent reads ADR 003 because the prompt pointed at it - progressive disclosure on demand, not preloaded. The decoys: delivery-queue.ts (when to retry) and notification-log.ts (audit). The trap: the constant is named maxRetries but holds the attempt count - changing it to 2 gives ONE retry. Step 5: create .claude/rules/notifications.md (copy from demo-kit/claude-rule-example if short on time). The paths: frontmatter means Claude loads it only when it reads or edits a matching file. Cursor users: same idea as .cursor/rules/*.mdc with globs. Then: 'Adam, how's the race?'");
}

// =====================================================================
section("Close");
// 20 — results
{
  const s = slide("CONTENT");
  chip(s, "RESULTS · BOTH");
  s.addText("The race results", { placeholder: "title" });
  s.addText("Same model, same repo, same four tasks, then one QA round. Live numbers from the race terminal; rehearsal numbers below.", { placeholder: "subtitle" });
  const hdr = (t, c) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: c }, align: "center" } });
  const b = (t) => ({ text: t, options: { bold: true } });
  const v = (t) => ({ text: t, options: { align: "center" } });
  const rows = [
    [{ text: "Metric", options: { bold: true, color: WHITE, fill: { color: PURPLE } } }, hdr("Vibe", SLATE), hdr("Disciplined", TEAL)],
    // Rehearsal: race.mjs, Sonnet, 13 Oct 2026 (results/race-2026-10-13T23-58-45.md).
    // The six slide-7 scorecard measures (correctness first), then cost including rework.
    [b("Hidden verification passed, first try"), v("3 / 4"), v("4 / 4")],
    [b("...after one QA round"), v("4 / 4"), v("4 / 4")],
    [b("Files read / files that mattered"), v("9 / 9"), v("11 / 10")],
    [b("Prompts (corrections)"), v("5 (1)"), v("4 (0)")],
    [b("Full / focused test runs"), v("5 / 1"), v("0 / 4")],
    [b("Files changed that didn't need to"), v("0"), v("0")],
    [b("Peak context"), v("68.7k"), v("49.2k")],
    [b("Cost, incl. rework"), v("$1.50"), v("$0.72")],
    [b("Agent minutes"), v("3.0"), v("2.1")],
  ];
  s.addTable(rows, { x: 0.7, y: 1.85, w: 8.2, colW: [4.2, 2.0, 2.0], fontSize: 14, color: INK, border: { type: "solid", pt: 1, color: LINE }, rowH: 0.46, valign: "middle", margin: [0.04, 0.14, 0.04, 0.14], objectName: "results table" });
  text(s, "Files read is even: good docs kept both lanes on the right files (Theory 3).", { x: 0.7, y: 6.5, w: 8.2, h: 0.3, fontSize: 12, italic: true, color: MUTED });
  panel(s, 9.2, 1.85, 3.4, 4.5);
  glyph(s, 9.5, 2.1, 0.5, TEAL, "✓");
  text(s, "Read correctness first", { x: 9.5, y: 2.75, w: 2.85, h: 0.75, fontSize: 18, bold: true, color: PURPLE });
  text(s, "A lane that is cheaper but wrong lost. A lane that is right and cheaper won twice.", { x: 9.5, y: 3.55, w: 2.85, h: 1.6, fontSize: 15, color: SLATE });
  text(s, "The fix was one line either way. The rest was the cost of not saying what we knew.", { x: 9.5, y: 5.05, w: 2.85, h: 1.2, fontSize: 15, bold: true });
  s.addNotes("BOTH. Eugene switches to the race terminal - the scoreboard prints when both lanes finish (results also saved in demo-kit/results/). Adam reads the rows top-down: they are slide 7's six scorecard measures, correctness first, then cost. The numbers on this slide are from a rehearsal run - the fallback if the live race hasn't finished; say so if you use them. The failed vibe task is free shipping: 'over £100' became '> 10000' and express went free too. Then the QA round: the same failing-check report goes to both lanes; disciplined had nothing to fix, vibe needed a correction in its already-long chat. That rework is in the cost: about twice the spend and 40% more peak context for the same four tickets. Files read is even - good docs kept both lanes on the right files, which is Theory 3 working. Own it; it makes the rest credible.");
}

// 21 — checklist
{
  const s = slide("CONTENT");
  chip(s, "CLOSE · EUGENE");
  s.addText("Take it back to your desk", { placeholder: "title" });
  s.addText("The pocket checklist. It's also on the cheat sheet.", { placeholder: "subtitle" });
  const rows = [
    [VIOLET, "Before", "One goal · acceptance criteria · name the files · plan if anything is uncertain · note context %"],
    [TEAL, "During", "Build only what the plan says · narrowest test first · re-plan when evidence changes"],
    [PURPLE, "Switching", "Save the plan or a handoff to a file · same goal → compact · new goal → /clear"],
    [SLATE, "After", "Verify · nothing unrelated changed · lessons go to the narrowest doc layer"],
  ];
  rows.forEach(([c, h, b], i) => {
    const y = 1.9 + i * 1.18;
    panel(s, 0.7, y, 11.9, 1.0);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.95, y: y + 0.24, w: 1.8, h: 0.52, rectRadius: 0.08, fill: { color: c }, line: { color: c }, objectName: "phase" });
    text(s, h.toUpperCase(), { x: 0.95, y: y + 0.24, w: 1.8, h: 0.52, fontSize: 14, bold: true, charSpacing: 1, color: WHITE, align: "center", valign: "middle" });
    text(s, b, { x: 3.05, y, w: 9.3, h: 1.0, fontSize: 17, valign: "middle" });
  });
  s.addNotes("EUGENE. Read it, don't explain it - they've seen every line live. Ask the room for one habit each they'll try tomorrow (take two answers, max 1 minute).");
}

// 22 — close
{
  const s = slide("TITLE_DARK");
  s.addText("Say what you know.\nProve what you changed.", { placeholder: "title", fontSize: 44, h: 1.75, y: 1.6 });
  s.addText("Reset when the goal changes.", { placeholder: "subtitle", y: 3.45, fontSize: 28 });
  s.addText([
    { text: "Cheat sheet and practice repo: parcel-pilot", options: { breakLine: true } },
    { text: "Homework: tasks 2, 5, 6 and 7 in workshop/tasks  ·  Questions?", options: { color: MIST, bold: false } },
  ], { placeholder: "byline" });
  s.addNotes("ADAM. Close on the three lines. Point to the cheat sheet (shared in the channel / handed out) and the repo for self-paced practice. Q&A for the remaining minutes.");
}


// =====================================================================
section("Backup");
// B1 — tool map
{
  const s = slide("CONTENT");
  chip(s, "BACKUP");
  s.addText("Same habits, two CLIs", { placeholder: "title" });
  s.addText("We demo in claude. If you use Cursor, every move has an equivalent.", { placeholder: "subtitle" });
  const hdr = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: PURPLE } } });
  const b = (t) => ({ text: t, options: { bold: true } });
  const m = (t) => ({ text: t, options: { fontFace: MONO } });
  const rows = [
    [hdr("Habit"), hdr("Claude Code · claude"), hdr("Cursor CLI · agent")],
    [b("Plan before editing"), "Shift+Tab → plan mode", "Shift+Tab → Plan or Ask · /plan · /ask"],
    [b("Point at the code"), m("@src/pricing/apply-discount.ts"), m("@src/pricing/apply-discount.ts")],
    [b("See what you spend"), m("/context · /statusline · /usage"), "Context % status line · cursor.com dashboard"],
    [b("Same goal, long chat"), m("/compact keep the decisions"), m("/summarize")],
    [b("New goal"), m("/clear"), m("/clear  (/new-chat)")],
    [b("Undo a wrong turn"), "Esc Esc · /rewind", "/rewind · Ctrl+R to review changes"],
    [b("Right model for the job"), m("/model"), m("/model")],
    [b("Keep lessons, scoped"), m(".claude/rules/*.md + paths:"), m(".cursor/rules/*.mdc + globs")],
  ];
  s.addTable(rows, { x: 0.7, y: 1.8, w: 11.9, colW: [3.1, 4.2, 4.6], fontSize: 14, color: INK, border: { type: "solid", pt: 1, color: LINE }, rowH: 0.52, valign: "middle", margin: [0.03, 0.14, 0.03, 0.14], objectName: "tool map" });
  s.addNotes("EUGENE. This table is on the cheat sheet, so don't photograph it. Point out: both tools have plan mode, both have mentions, both have compaction and a reset. We demo in Claude Code; if you use Cursor, every move we made has a column here.");
}

// =====================================================================

// B2 — model choice
{
  const s = slide("CONTENT");
  chip(s, "BACKUP");
  s.addText("Match the model and mode to the task", { placeholder: "title" });
  s.addText("\"Always use the strongest model\" is not a strategy. Escalate on evidence.", { placeholder: "subtitle" });
  const cards = [
    [TEAL, "1", "Mechanical", "Rename a helper in one test file.", "Fast model · inline edit · one file attached · no plan"],
    [VIOLET, "2", "Known, multi-file", "Expose an existing estimate in an API response.", "Default model · short plan · then agent mode"],
    [PURPLE, "3", "Unknown root cause", "Duplicate emails after a timeout, sometimes.", "Strongest model · plan or ask first · logs, not folders"],
  ];
  cards.forEach(([c, g, h, ex, how], i) => {
    const x = 0.7 + i * 4.03;
    panel(s, x, 1.85, 3.83, 3.35);
    glyph(s, x + 0.3, 2.1, 0.55, c, g, 18);
    text(s, h, { x: x + 0.3, y: 2.8, w: 3.3, h: 0.45, fontSize: 20, bold: true, color: c });
    text(s, ex, { x: x + 0.3, y: 3.3, w: 3.3, h: 0.7, fontSize: 15, italic: true, color: SLATE });
    text(s, how, { x: x + 0.3, y: 4.1, w: 3.3, h: 0.95, fontSize: 15, bold: true });
  });
  note(s, "Escalate when you have two failed attempts or can't form a hypothesis - not when it \"feels hard\". Send broad exploration to a subagent so your main chat stays lean.", 5.5, 1.0);
  s.addNotes("ADAM. Last theory slide. Three scenarios, three different setups. The line people skip is the escalation condition. Backup slide: use in Q&A if model choice comes up.");
}


(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
