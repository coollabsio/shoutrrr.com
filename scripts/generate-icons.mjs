// Regenerate the favicon / PWA icon set and the OG share image from the brand
// mark in public/favicon.svg (green #84cc16 stroke, transparent, ~10% padding).
// Run with: npm run icons
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pngToIco from 'png-to-ico';
import sharp from 'sharp';

const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const svg = await readFile(join(pub, 'favicon.svg'));

const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

// Render the source SVG to a square transparent PNG buffer at `size`px.
const render = (size) =>
  sharp(svg, { density: 512 })
    .resize(size, size, { fit: 'contain', background: transparent })
    .png()
    .toBuffer();

// Standard transparent square icons.
const icons = {
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'favicon-48x48.png': 48,
  'apple-touch-icon.png': 180,
  'android-chrome-192x192.png': 192,
  'android-chrome-512x512.png': 512,
  'icon-16.png': 16,
  'icon-32.png': 32,
  'icon-48.png': 48,
  'icon-64.png': 64,
  'icon-96.png': 96,
  'icon-128.png': 128,
  'icon-180.png': 180,
  'icon-192.png': 192,
  'icon-512.png': 512,
  'mstile-150x150.png': 150,
};

for (const [name, size] of Object.entries(icons)) {
  await writeFile(join(pub, name), await render(size));
  console.log(`✓ ${name} (${size}×${size})`);
}

// Multi-resolution favicon.ico (16/32/48).
const ico = await pngToIco(await Promise.all([16, 32, 48].map(render)));
await writeFile(join(pub, 'favicon.ico'), ico);
console.log('✓ favicon.ico (16/32/48)');

// OG / social share image — green mark centered on the standard dark surface.
const mark = await render(360);
const og = await sharp({
  create: { width: 1200, height: 630, channels: 4, background: '#101010' },
})
  .composite([{ input: mark, gravity: 'center' }])
  .png()
  .toBuffer();
await writeFile(join(pub, 'og-image.png'), og);
console.log('✓ og-image.png (1200×630 on #101010)');
