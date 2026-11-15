import { readFile, mkdir, writeFile, readdir, cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
export const INDEXNOW_KEY = 'bicatlas2026c8a73e945612';

function escapeHtml(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

export async function extendAtlas({ target, origin, platform }) {
  const file = await readFile(path.join(directory, '../siteler.json'), 'utf8');
  const atlas = JSON.parse(file);
  if (!Array.isArray(atlas.sites) || atlas.sites.length !== 20) {
    throw new Error('Expected 20 Bıçak Atlası sources; update topic generation if source inventory changed');
  }

  const topics = [
    { id: 'celik', title: 'Bıçak çelikleri ve metalurji', summary: 'Çelik bileşimi, ısıl işlem, test sonuçları ve teknik kararlar için araştırma kaynaklarını karşılaştır.', tags: ['Çelik','Çelik tablosu','Metalurji','Isıl işlem','Test verisi'] },
    { id: 'edc', title: 'Günlük taşıma ve cep çakıları', summary: 'EDC, katlanır çakı, mekanizma ve pratik seçim rehberlerine ulaş.', tags: ['EDC','Cep çakısı','Çakı','Mekanizmalar','Seçim aracı'] },
    { id: 'kamp', title: 'Kamp, bushcraft ve outdoor', summary: 'Saha kullanımı, dayanıklılık, bakım ve kamp odaklı ekipmanları incele.', tags: ['Kamp','Bushcraft','Outdoor','Bakım','Bileme'] },
    { id: 'koleksiyon', title: 'Koleksiyon, markalar ve zanaat', summary: 'Özel seri, bıçak kültürü, üreticiler ve koleksiyon kaynaklarına göz at.', tags: ['Koleksiyon','Özel seri','Markalar','Üreticiler','Zanaat','Tarih'] },
    { id: 'haber', title: 'Haberler ve topluluklar', summary: 'Yeni ürün duyuruları, dergiler ve kullanıcı deneyimlerini farklı kaynaklardan takip et.', tags: ['Haber','Dergi','Forum','Topluluk','Yeni ürün','Yorum'] }
  ];

  const sections = topics.map(topic => {
    const matched = atlas.sites.filter(site => site.tags.some(tag => topic.tags.includes(tag)));
    const cards = matched.map(site => '<article class="card"><h3><a href="/siteler/' +
      encodeURIComponent(site.id) + '/">' + escapeHtml(site.name) + '</a></h3><p>' +
      escapeHtml(site.description) + '</p><small>' + escapeHtml(site.category) +
      ' · ' + escapeHtml(site.language) + '</small></article>').join('');
    return '<section class="topic" id="' + topic.id + '"><h2>' + escapeHtml(topic.title) +
      '</h2><p>' + escapeHtml(topic.summary) + '</p><div class="cards">' + cards +
      '</div></section>';
  }).join('');

  const nav = topics.map(topic => '<a href="#' + topic.id + '">' + escapeHtml(topic.title) + '</a>').join('');
  const html = [
    '<!doctype html><html lang="tr"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<title>Bıçak Atlası Konu Haritası | Çelik, EDC, Kamp ve Koleksiyon</title>',
    '<meta name="description" content="20 bıçak ve çakı kaynağını çelik bilimi, EDC, kamp, koleksiyon ve haberler konularına göre keşfet. Kaynakların karakterlerini karşılaştır.">',
    '<link rel="canonical" href="' + escapeHtml(origin) + '/konular/">',
    '<meta property="og:type" content="website">',
    '<meta property="og:title" content="Bıçak Atlası – Konulara Göre Kaynak Rehberi">',
    '<meta property="og:url" content="' + escapeHtml(origin) + '/konular/">',
    '<style>:root{--green:#143f32;--gold:#e6b91e;--text:#243630}',
    '*{box-sizing:border-box}body{margin:0;background:#f4f7f5;color:var(--text);font:16px/1.65 system-ui,Arial,sans-serif}',
    'a{color:#17634f}header{background:var(--green);color:#fff;padding:24px max(18px,calc((100% - 1080px)/2))}',
    'header a{color:#fff;margin-right:18px}main{max-width:1080px;margin:auto;padding:30px 18px 65px}',
    'h1{font-size:clamp(28px,4vw,42px);line-height:1.2;margin:0 0 10px}h2{color:var(--green);font-size:25px}',
    '.intro{background:#fff;border-left:5px solid var(--gold);border-radius:10px;padding:24px;margin-bottom:25px}',
    '.topic{padding:22px 0;border-bottom:1px solid #d9e1dd}.topic>p{max-width:760px}',
    '.jump{display:flex;gap:10px;flex-wrap:wrap;margin:20px 0}',
    '.jump a{border:1px solid #cbd9d1;border-radius:30px;padding:7px 12px;background:#fff;text-decoration:none}',
    '.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:13px}',
    '.card{background:white;border:1px solid #dae5df;border-radius:12px;padding:17px}',
    '.card h3{font-size:18px;margin:0 0 7px}.card p{margin:0 0 10px}',
    'small{color:#5c6c63}footer{margin-top:35px;color:#65736c;font-size:14px}</style></head><body>',
    '<header><strong>Bıçak Atlası</strong>　 <a href="/">Kaynak rehberi</a><a href="/karsilastir/">Karşılaştır</a><a href="/yontem/">Yöntem</a></header>',
    '<main><div class="intro"><h1>Konulara göre kaynak haritası</h1>',
    '<p>Her kaynak aynı konuda uzmanlaşmaz. Bıçak çelikleri, günlük taşıma, kamp, koleksiyon ve haberler için ilgili yayınları aşağıdan karşılaştır.',
    ' Kaynak profilleri editoryal değerlendirmedir; otomatik bir kalite sıralaması değildir.</p>',
    '<p><a href="/karsilastir/">Kendi ölçütlerinle karşılaştır →</a></p></div>',
    '<nav class="jump" aria-label="Konulara atla">' + nav + '</nav>',
    sections,
    '<footer>Kaynak envanteri: ' + atlas.sites.length + ' site. Araştırma notu: ' + escapeHtml(atlas.sourceChecked) + '. ',
    '<a href="/yontem/">Değerlendirme yöntemini incele</a>.</footer></main></body></html>'
  ].join('');
  const topicDir = path.join(target, 'konular');
  await mkdir(topicDir, { recursive: true });
  await writeFile(path.join(topicDir, 'index.html'), html);

  const sitemapFile = path.join(target, 'sitemap.xml');
  let sitemap = await readFile(sitemapFile, 'utf8');
  if (!sitemap.includes('</urlset>')) throw new Error('Unexpected sitemap format');
  for (const route of ['/karsilastir/', '/konular/']) {
    const loc = origin + route;
    if (!sitemap.includes('<loc>' + loc + '</loc>')) {
      sitemap = sitemap.replace('</urlset>', '<url><loc>' + loc + '</loc><lastmod>' + (route === '/konular/' ? '2026-11-15' : '2026-11-07') + '</lastmod></url>\n</urlset>');
    }
  }
  await writeFile(sitemapFile, sitemap);

  // IndexNow key is public by design. Publishing the key is not a URL submission.
  if (platform === 'cloudflare') {
    await writeFile(path.join(target, INDEXNOW_KEY + '.txt'), INDEXNOW_KEY);
    const cfCommit = process.env.CF_PAGES_COMMIT_SHA;
    if (cfCommit && /^[a-f0-9]{40}$/i.test(cfCommit)) {
      await writeFile(path.join(target, 'atlas-build.txt'), cfCommit.toLowerCase());
    }
    const verification = process.env.ATLAS_GOOGLE_SITE_VERIFICATION;
    if (verification) {
      if (!/^[A-Za-z0-9_-]{10,200}$/.test(verification)) {
        throw new Error('Invalid ATLAS_GOOGLE_SITE_VERIFICATION token');
      }
      const homePath = path.join(target, 'index.html');
      const home = await readFile(homePath, 'utf8');
      if (!home.includes('name="google-site-verification"')) {
        await writeFile(homePath, home.replace('<head>', '<head><meta name="google-site-verification" content="' + verification + '">'));
      }
    }
  }

  if (platform === 'azure') {
    await writeFile(path.join(target, 'staticwebapp.config.json'), JSON.stringify({
      globalHeaders: {
        'X-Robots-Tag': 'noindex, follow',
        'X-Content-Type-Options': 'nosniff'
      }
    }, null, 2));
  }
  const output = await readFile(path.join(target, 'sitemap.xml'), 'utf8');
  if (!output.includes(origin + '/karsilastir/') || !output.includes(origin + '/konular/')) {
    throw new Error('Sitemap is missing important routes');
  }
  console.log('Generated topic page and complete sitemap for ' + platform);
}
