// Script: generate a branded multi-size favicon.ico from the PlaceDesk mark.
// Renders app/icon.svg -> PNGs at 16/32/48/64 px -> assembles an ICO container.
// Run: node scripts/make-favicon.mjs
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = join(root, "app", "icon.svg");
const outPath = join(root, "app", "favicon.ico");
const svg = await readFile(svgPath);

const SIZES = [16, 32, 48, 64];
const pngs = [];
for (const size of SIZES) {
  const png = await sharp(svg, { density: 96 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
  pngs.push(png);
}

/** Assemble a Windows ICO file from an array of PNG buffers (32-bit entries). */
function buildIco(pngBuffers) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngBuffers.length, 4);

  const dirSize = pngBuffers.length * 16;
  const entries = [];
  let offset = 6 + dirSize;
  const dir = Buffer.alloc(dirSize);

  pngBuffers.forEach((png, i) => {
    const e = Buffer.alloc(16);
    const dim = SIZES[i];
    e.writeUInt8(dim >= 256 ? 0 : dim, 0); // width
    e.writeUInt8(dim >= 256 ? 0 : dim, 1); // height
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(png.length, 8); // size
    e.writeUInt32LE(offset, 12); // offset
    entries.push(e);
    offset += png.length;
  });

  return Buffer.concat([header, Buffer.concat(entries), ...pngBuffers]);
}

await writeFile(outPath, buildIco(pngs));
console.log("Wrote", outPath, `(${SIZES.length} sizes)`);