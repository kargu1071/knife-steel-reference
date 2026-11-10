# Bıçak Atlası — yayın otomasyonu hazırlığı

Bu klasör, mevcut `kargu1071/knife-steel-reference` deposunun içindeki **Bıçak Atlası'nın önceden üretilmiş statik sayfalarını** kullanır. Depo kökündeki `index.html` (Bıçak Çelikleri Referansı GitHub Pages sitesi) **değiştirilmez**.

## Durum

- Bıçak Atlası'nın önceden oluşturulmuş dosyaları: `bicak-atlasi/render/public/`
- Statik yayın derleyicisi: `bicak-atlasi/deploy/prepare.mjs`
- CI/CD: `.github/workflows/bicak-atlasi-hosting.yml`
- Birincil canonical adresi: `https://bicak-atlasi.pages.dev`
- Netlify çıktısı: `X-Robots-Tag: noindex, follow` içerir.
- Mevcut Vercel `bicak-atlasi` Next.js projesi **değiştirilmez ve yeniden bağlanmaz**.

## Güvenli etkinleştirme sırası

1. GitHub PR'daki `verify` işini kontrol edip PR'ı birleştirin. Workflow iki yayını **başlangıçta kapalı** tutar.
2. Cloudflare > Workers & Pages > mevcut `bicak-atlasi.pages.dev` projesinde, projenin **Direct Upload mı Git entegre mi** olduğunu kontrol edin. Git üzerinden zaten otomatik dağıtılıyorsa aynı projede bu workflow'u ayrıca etkinleştirmeyin.
3. GitHub > Repository > Settings > Secrets and variables > Actions:
   - Secrets: `ATLAS_CF_API_TOKEN`, `ATLAS_CF_ACCOUNT_ID`
   - Variable: `ATLAS_CF_PROJECT` = Cloudflare kontrol panelindeki *doğrulanmış* mevcut Pages proje adı
   - Variable: `ATLAS_CLOUDFLARE_ENABLED` = `true` (yalnızca kontrol tamamlanınca)
4. Netlify > mevcut `bright-kulfi-073204` projesinin **Site ID** değerini bulun. Proje zaten Git'ten otomatik deploy ediyorsa birden fazla yayın yöntemi açmayın. GitHub Secrets alanına `ATLAS_NETLIFY_SITE_ID` ve `ATLAS_NETLIFY_AUTH_TOKEN` ekleyin. Ardından Variable `ATLAS_NETLIFY_ENABLED` = `true` yapın.
5. GitHub Actions > **Bicak Atlasi - Cloudflare and Netlify** > **Run workflow** ile ilk testi yapın.

**Güvenlik:** API tokenlarını veya Site ID/Account ID gibi yönetim kimliklerini kodun içine ya da sohbete koymayın. Secret alanlarını kullanın. `ATLAS_*_ENABLED` değişkenleri `true` olmadıkça hosting üzerinde değişiklik yapılmaz.

## Kaynakları güncellerken dikkat

`render/public` statik **build çıktısıdır**, orijinal Next.js kaynak kodunun yerini tutmaz. Kalıcı bakım için tam kaynak kod ayrı `src/`, `package.json` ve kilit dosyasıyla depoya alınmalı; daha sonra build adımı bu çıktıyı üretmelidir. Aksi halde mevcut statik dosyalar yayımlanabilir, ancak geliştirme otomatikleştirilmiş sayılmaz.

## Yerel doğrulama

```bash
node bicak-atlasi/deploy/prepare.mjs cloudflare
node bicak-atlasi/deploy/prepare.mjs netlify
```

Bu komutlar sadece `.atlas-dist/` altında yayın kopyası oluşturur; çalışan sitelere dokunmaz. Vercel Git bağlantısı ve mevcut Next.js projesi ancak orijinal kaynak kod doğrulandıktan sonra ayrı bir işlem olarak ele alınmalıdır.

## Cloudflare Git yapılandırması (10 Kasım 2026)

Cloudflare Pages kontrol panelinde bu deponun `main` dalından otomatik yayın ve `node bicak-atlasi/deploy/prepare.mjs cloudflare` komutu ile `.atlas-dist` yayın klasörü doğrulandı. Bu belgelendirme değişikliği, yeni build ayarlarıyla ilk Git tabanlı üretim dağıtımını tetiklemek için eklenmiştir. Vercel Next.js projesi bağımsız bırakılır.
