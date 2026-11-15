import { appendFile } from 'node:fs/promises';
import { resolveCname, resolve4 } from 'node:dns/promises';

const base = process.env.ATLAS_SITE_ORIGIN ?? 'https://bicak-atlasi.pages.dev';
if (!/^https:\/\/[a-z0-9.-]+$/i.test(base)) throw new Error('Invalid ATLAS_SITE_ORIGIN');

const entries = [
  { name: 'Ana sayfa', url: base + '/', must: true, kind: 'html' },
  { name: 'Konu haritası', url: base + '/konular/', must: true, kind: 'html' },
  { name: 'Karşılaştırma', url: base + '/karsilastir/', must: true, kind: 'html' },
  { name: 'Yöntem', url: base + '/yontem/', must: true, kind: 'html' },
  { name: 'Örnek kaynak profili', url: base + '/siteler/ankaoutdoor/', must: true, kind: 'html' },
  { name: 'Site haritası', url: base + '/sitemap.xml', must: true, kind: 'sitemap' },
  { name: 'Robots', url: base + '/robots.txt', must: true, kind: 'robots' },
  { name: 'IndexNow dosyası', url: base + '/bicatlas2026c8a73e945612.txt', must: false, kind: 'indexnow' },
  { name: 'Cloudflare sürüm kimliği', url: base + '/atlas-build.txt', must: false, kind: 'build' },
  { name: 'Azure Static Web Apps yedek', url: 'https://yellow-grass-09592c910.4.azurestaticapps.net/', must: false, kind: 'mirror' },
  { name: 'Netlify yedek', url: 'https://bright-kulfi-073204.netlify.app/', must: false, kind: 'mirror' },
  { name: 'Firebase (ilk yayın bekleniyor)', url: 'https://bicak-atlasi.web.app/', must: false, kind: 'mirror' },
  { name: 'Render yedek', url: 'https://bicak-atlasi.onrender.com/', must: false, kind: 'mirror' },
  { name: 'Vercel mevcut Next.js', url: 'https://bicak-atlasi.vercel.app/', must: false, kind: 'mirror' },
  { name: 'GitLab Pages herkese açık erişim', url: 'https://bscak-atlass-91a525.gitlab.io/', must: false, kind: 'gitlab' }
];

async function one(entry) {
  let message = '';
  for (let attempt=0; attempt < (entry.must ? 3 : 1); attempt++) {
    try {
      const response = await fetch(entry.url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(14000),
        headers: { 'User-Agent': 'BicakAtlasiLiveCheck/1.0' }
      });
      const content = await response.text();
      const type = response.headers.get('content-type') ?? '';
      const robot = response.headers.get('x-robots-tag') ?? '';
      const okHttp = response.ok;
      let good = okHttp;
      if (entry.kind === 'html') good = okHttp && /<html\b/i.test(content);
      if (entry.kind === 'sitemap') {
        const urls = [...content.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
        good = okHttp && type.includes('xml') && urls.some(s=>s===base+'/konular/')
          && urls.some(s=>s===base+'/karsilastir/') && urls.length>=24;
        message = 'URLs=' + urls.length + ' topics=' + urls.includes(base+'/konular/')
          + ' comparison=' + urls.includes(base+'/karsilastir/');
      }
      if (entry.kind === 'robots') good = okHttp && content.includes('Sitemap:');
      if (entry.kind === 'indexnow') good = okHttp && content.trim() === 'bicatlas2026c8a73e945612';
      if (entry.kind === 'build') {
        good = okHttp && /^[a-f0-9]{40}$/i.test(content.trim());
        message = 'Deployed SHA=' + (good ? content.trim().slice(0,12) : 'unavailable');
      }
      if (entry.kind === 'gitlab') {
        const hasAtlas = /Bıçak Atlası|Bıcak Atlası|Bicak Atlasi/i.test(content);
        const isGitlabOrigin = new URL(response.url).hostname === 'bscak-atlass-91a525.gitlab.io';
        const robotsMeta = content.match(/<meta[^>]+name=["']robots["'][^>]*>/i)?.[0] ?? 'not seen';
        const canonical = content.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0] ?? 'not seen';
        good = okHttp && hasAtlas && isGitlabOrigin;
        message = 'Public=' + good + ', Final URL=' + response.url
          + ', robots meta=' + robotsMeta.slice(0,180)
          + ', X-Robots-Tag=' + (robot || 'not seen')
          + ', canonical=' + canonical.slice(0,180)
          + ', title=' + (content.match(/<title[^>]*>([^<]+)/i)?.[1] || 'not found');
      }
      if (entry.kind === 'mirror') {
        const hasAtlas = /Bıçak Atlası|Bıcak Atlası|Bicak Atlasi/i.test(content);
        good = okHttp && robot.toLowerCase().includes('noindex') && hasAtlas;
        const tag = content.match(/<link[^>]*rel=[\"']canonical[\"'][^>]*>/i)?.[0] ?? 'not seen';
        const canonicalPointsToPrimary = tag.includes('href="' + base + '/') ||
          tag.includes("href='" + base + '/');
        message = 'Atlas content=' + hasAtlas + ', X-Robots-Tag=' + (robot||'not seen') +
          ', canonicalPointsToPrimary=' + canonicalPointsToPrimary +
          ', canonical=' + tag.slice(0,170);
      }
      if (good || attempt===2 || !entry.must) {
        return { ...entry, ok:good, status:response.status, final:response.url, message };
      }
      message = 'HTTP ' + response.status;
    } catch (e) {
      message = String(e?.cause?.code ?? e?.message ?? e).slice(0,120);
      if (attempt === (entry.must ? 2 : 0)) break;
    }
    await new Promise(resolve=>setTimeout(resolve,5000));
  }
  return { ...entry, ok:false, status:0, final:'', message };
}

const results=[];
for (const entry of entries) {
  const r=await one(entry);
  results.push(r);
  console.log((r.ok?'PASS':'FAIL') + ' ' + r.name + ' -> ' + r.status + ' ' + r.url + ' ' + r.message);
}

let dnsStatus = 'Not checked';
try {
  const cnames = await resolveCname('atlas.ankaoutdoor.com').catch(()=>[]);
  const ipv4 = await resolve4('atlas.ankaoutdoor.com').catch(()=>[]);
  dnsStatus = 'CNAME: ' + (cnames.join(', ') || 'none') + '; IPv4: ' + (ipv4.join(', ') || 'none');
} catch (error) {
  dnsStatus = error.message;
}
console.log('Optional atlas.ankaoutdoor.com DNS lookup: ' + dnsStatus);

const lines=['## Bıçak Atlası – canlı yayın kontrolü',
  '',
  'Ana sürüm: ' + base,
  '',
  '| Adres | Sonuç | HTTP | Not |',
  '|---|---|---|---|'];
for(const r of results) {
  const note = (r.message || r.final).replaceAll('|','/');
  lines.push('| ' + r.name + ' | ' + (r.ok?'✅ Geçti':r.must?'❌ Eksik':'⚠️ Kontrol gerekli') +
    ' | '+r.status+' | '+note+' |');
}
lines.push('', 'Alt alan adı DNS gözlemi: '+dnsStatus,
  '', 'Başarılı GitHub CI kontrolü, GSC/Bing doğrulamasını veya alan adı sahipliğini kanıtlamaz.');
if(process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY,lines.join('\n')+'\n');
const failed=results.filter(x=>x.must && !x.ok);
if(failed.length) process.exitCode=1;
