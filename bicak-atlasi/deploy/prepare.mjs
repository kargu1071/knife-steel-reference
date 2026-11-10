import { cp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(here, '../render/public');
const target = path.resolve(process.cwd(), '.atlas-dist');
const platform = process.argv[2] ?? 'cloudflare';
const origin = (process.env.ATLAS_CANONICAL_ORIGIN ?? 'https://bicak-atlasi.pages.dev').replace(/\/$/, '');
const marker = 'https://render-origin.bicak-atlasi.invalid';

if (!['cloudflare', 'netlify'].includes(platform)) {
  throw new Error('Platform must be cloudflare or netlify');
}
if (!/^https:\/\/[\w.-]+(?::\d+)?$/.test(origin)) {
  throw new Error('ATLAS_CANONICAL_ORIGIN must be an HTTPS origin without a path');
}

await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });
let replacedFiles = 0;
async function visit(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await visit(full);
      continue;
    }
    if (!/\.(html|xml|txt|json|js|css)$/i.test(entry.name)) continue;
    const oldText = await readFile(full, 'utf8');
    if (!oldText.includes(marker)) continue;
    await writeFile(full, oldText.replaceAll(marker, origin));
    replacedFiles += 1;
  }
}
await visit(target);
if (replacedFiles === 0) {
  throw new Error('No placeholder canonical URLs were found; source may have changed');
}
const home = await readFile(path.join(target, 'index.html'), 'utf8');
if (!home.includes(origin) || home.includes(marker)) {
  throw new Error('Primary index.html canonical replacement failed');
}
await readFile(path.join(target, 'karsilastir/index.html'));
await readFile(path.join(target, 'sitemap.xml'));
if (platform === 'netlify') {
  await writeFile(path.join(target, '_headers'), '/*\n  X-Robots-Tag: noindex, follow\n');
}
console.log('Validated ' + platform + ' output in .atlas-dist; replaced canonical in ' + replacedFiles + ' files');
