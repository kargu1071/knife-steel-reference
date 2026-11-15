# Bıçak Atlası – DigitalOcean App Platform

Mevcut Bıçak Atlası projesini statik bir yedek site olarak DigitalOcean'a yayınlar. Ana URL: https://bicak-atlasi.pages.dev/ .

1. DigitalOcean > App Platform > Create App > GitHub > `kargu1071/knife-steel-reference`.
2. **Branch:** `main`. **Source directories:** boş (repo kökü). **Autodeploy:** açık.
3. Resources aşamasında component türü **Static Site** olmalı; **Web Service** seçilmemeli.
4. Build environment: **Node.js** (Node 22). Depodaki root `package.json` Node.js buildpack tanıması içindir; uygulamanın gerçek içeriğini değiştirmez.
5. **Build Command:** `npm run build:atlas-digitalocean` (alternatif `node bicak-atlasi/deploy/prepare.mjs digitalocean`).
6. **Output Directory:** `.atlas-dist` (repo köküne göre). **Source Directory:** boş. **Index Document:** `index.html`.
7. Site için başlangıç adı önerisi `bicak-atlasi-static`. Planı `Static Site / Free` olarak doğrula; ücretli Web Service veya ek veri tabanı oluşturma.
8. Son onaydan önce toplam maliyeti incele. Ücretsiz katman kullanım/sınır aşımı ücretlerine karşı plan ekranını kontrol et.
9. Yayından sonra DigitalOcean'ın verdiği gerçek URL'de ana sayfa, `/konular/`, `/karsilastir/`, `/yontem/`, `/sitemap.xml` sayfalarını kontrol et.
10. Bu yedek sürümün HTML başlıklarında `<meta name="robots" content="noindex, follow">` bulunmalıdır. Canonical adresi Cloudflare ana sürümüne işaret etmelidir. DigitalOcean'ın statik site başlıkları yapılandırması platforma göre değişebileceği için bu işlem build sırasında HTML meta etiketiyle yapılır.
11. Özel alan adı seçilmedikçe bu yedek siteyi GSC/Bing için ayrı bir mülk olarak ekleme.

İlgili teknik dosyalar: `package.json`, `bicak-atlasi/deploy/prepare.mjs`. Build, Next.js orijinal kaynak kodu yerine mevcut statik export üzerinden yapılır; Vercel Next.js projesi değiştirilmez.

**Önemli:** GitHub Actions içindeki doğrulama komutu tek başına DigitalOcean uygulaması oluşturmaz. Gerçek yayın ve faturalama onayı kullanıcı hesabında DigitalOcean arayüzünden yapılır.
