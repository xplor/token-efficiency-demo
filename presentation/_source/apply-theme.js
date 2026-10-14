// pptxgenjs writes Office's stock colour scheme into the theme, so scheme colours
// (accent1, tx2, ...) would render in Office blue/orange. This rewrites the deck's
// theme colours and name in place after pptxgenjs has saved the file.
const fs = require("fs");
const JSZip = require("jszip");

const SLOTS = ["dk1", "lt1", "dk2", "lt2", "accent1", "accent2", "accent3", "accent4", "accent5", "accent6", "hlink", "folHlink"];

async function applyTheme(file, theme) {
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const part = "ppt/theme/theme1.xml";
  let xml = await zip.file(part).async("string");
  for (const slot of SLOTS) {
    const hex = theme.colors[slot];
    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) throw new Error(`theme.colors.${slot} must be six hex digits`);
    xml = xml.replace(new RegExp(`<a:${slot}>[\\s\\S]*?</a:${slot}>`), `<a:${slot}><a:srgbClr val="${hex}"/></a:${slot}>`);
  }
  xml = xml.replace(/<a:clrScheme name="[^"]*"/, `<a:clrScheme name="${theme.name}"`);
  zip.file(part, xml);
  fs.writeFileSync(file, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}

module.exports = { applyTheme };
