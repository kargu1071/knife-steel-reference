import { INDEXNOW_KEY } from './extend.mjs';

const site = new URL((process.env.ATLAS_INDEXNOW_ORIGIN || 'https://bicak-atlasi.pages.dev').replace(/\/$/, ''));
const wanted = process.env.GITHUB_SHA?.toLowerCase();
if (!wanted || !/^[a-f0-9]{40}$/.test(wanted)) {
  throw new Error('Expected a real 40-character GITHUB_SHA from GitHub Actions');
}
if (site.protocol !== 'https:' || site.pathname !== '/') {
  throw new Error('IndexNow requires a HTTPS site origin without path');
}

async function waitForCloudflare() {
  for (let attempt = 1; attempt <= 12; attempt += 1) {
    try {
      const response = await fetch(new URL('/atlas-build.txt', site), { cache: 'no-store' });
      const sha = response.ok ? (await response.text()).trim().toLowerCase() : '';
      if (sha === wanted) return;
      console.log('Cloudflare version not yet deployed: attempt ' + attempt + '/12');
    } catch (error) {
      console.log('Cloudflare still propagating: ' + error.message);
    }
    if (attempt !== 12) await new Promise(resolve => setTimeout(resolve, 20000));
  }
  throw new Error('Cloudflare has not published this exact GitHub commit yet; no IndexNow submission made');
}

await waitForCloudflare();

const keyLocation = new URL('/' + INDEXNOW_KEY + '.txt', site).href;
const keyResponse = await fetch(keyLocation, { cache: 'no-store' });
if (!keyResponse.ok || (await keyResponse.text()).trim() !== INDEXNOW_KEY) {
  throw new Error('IndexNow key file cannot be publicly verified; no URLs submitted');
}

const sitemapUrl = new URL('/sitemap.xml', site);
const response = await fetch(sitemapUrl, { cache: 'no-store' });
if (!response.ok) throw new Error('Public sitemap is unavailable; no URLs submitted');
const sitemap = await response.text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1].trim());
if (urls.length < 22 || urls.length > 1000) throw new Error('Unexpected sitemap URL count: ' + urls.length);
for (const value of urls) {
  const url = new URL(value);
  if (url.origin !== site.origin) throw new Error('Sitemap contains an off-domain URL');
}
if (!urls.some(url => url.endsWith('/konular/')) || !urls.some(url => url.endsWith('/karsilastir/'))) {
  throw new Error('Live sitemap lacks the new pages');
}
const submission = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: site.host,
    key: INDEXNOW_KEY,
    keyLocation,
    urlList: urls
  })
});
if (![200, 202].includes(submission.status)) {
  throw new Error('IndexNow rejected the submission: HTTP ' + submission.status + ' ' +
    (await submission.text()).slice(0, 300));
}
console.log('IndexNow accepted ' + urls.length + ' URLs; HTTP ' + submission.status);
