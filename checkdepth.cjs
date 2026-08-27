const fs = require("fs");
const lines = fs.readFileSync("app/page.tsx", "utf8").split(/\r?\n/);
let depth = 0;
lines.forEach((l, i) => {
  const opens = (l.match(/<div(?![\w-])/g) || []).length;
  const closes = (l.match(/<\/div>/g) || []).length;
  const selfc = (l.match(/<div[^>]*\/>\s*$/g) || []).length;
  const eff = opens - selfc;
  if (eff - closes !== 0 && i > 200) {
    console.log(i + 1, "d+" + (eff - closes), l.trim().slice(0, 70));
  }
  depth += eff - closes;
});
console.log("final div depth", depth);
