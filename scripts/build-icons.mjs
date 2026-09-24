// Builds the site's logo files from data/logo-source.png (the brand mark:
// gold with white parts, transparent background).
//   public/logo-mark.png  → header (shown on an ink tile, the white parts need it)
//   app/icon.png          → browser tab (ink rounded tile)
//   app/apple-icon.png    → phone home screen (ink square, the phone rounds it)
//   node scripts/build-icons.mjs
import sharp from "sharp";

const INK = "#121212";
const mark = await sharp("data/logo-source.png").trim().png().toBuffer();

async function tile(size, { radius, pad }) {
  const inner = Math.round(size * (1 - 2 * pad));
  const logo = await sharp(mark).resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const bg = Buffer.from(
    `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${INK}"/></svg>`
  );
  return sharp(bg).composite([{ input: logo, gravity: "center" }]).png().toBuffer();
}

await sharp(mark).resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile("public/logo-mark.png");
await sharp(await tile(512, { radius: 112, pad: 0.16 })).toFile("app/icon.png");
await sharp(await tile(180, { radius: 0, pad: 0.18 })).toFile("app/apple-icon.png");
console.log("icons written");
