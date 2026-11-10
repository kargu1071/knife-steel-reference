# Bıçak Atlası — Firebase Hosting (isteğe bağlı, güvenli başlangıç)

Bu yapılandırma yalnızca mevcut `kargu1071/knife-steel-reference` GitHub deposundaki Bıçak Atlası statik dosyalarını Firebase Hosting'e yayımlar. **Mevcut Cloudflare Pages, Netlify, Render, GitHub Pages ve Vercel Next.js projelerine dokunmaz.**

## Dosyalar

- `firebase.json`: yayın klasörü `.atlas-dist`, bütün yanıtlar için `X-Robots-Tag: noindex, follow`. Canonical, ana site olan `https://bicak-atlasi.pages.dev` adresini işaret eder.
- `.github/workflows/bicak-atlasi-firebase.yml`: PR üzerinde sadece doğrulama; `main` güncellemelerinde yayın ancak etkinleştirme değişkeni `true` ise.
- `bicak-atlasi/deploy/prepare.mjs cloudflare`: mevcut statik kaynağı, canonical URL düzeltilmiş biçimde geçici `.atlas-dist` klasörüne kopyalar.

## Firebase hesabında bir kerelik işlemler

1. https://console.firebase.google.com/ adresinde bir Firebase projesi oluşturun veya **var olan doğru projeyi** seçin; Hosting'i etkinleştirin.
2. Projenin **Project ID** (görünür proje adı değil) değerini Firebase > Project settings altında bulun.
3. GitHub deposunda https://github.com/kargu1071/knife-steel-reference/settings/secrets/actions > **New repository secret**: `ATLAS_FIREBASE_SERVICE_ACCOUNT`. Değer, sadece bu Firebase projesinin Hosting yayını için yetkilendirilmiş hizmet hesabının JSON anahtarıdır. **Sohbete veya kaynak koda yapıştırmayın.**
4. GitHub > Settings > Secrets and variables > Actions > Variables: `ATLAS_FIREBASE_PROJECT_ID` = Firebase Project ID.
5. Önce GitHub Actions'ta `verify` başarılı olduğundan ve Firebase Hosting hedefinin doğru olduğundan emin olun. Sonra Variables alanına `ATLAS_FIREBASE_ENABLED` = `true` koyun.
6. GitHub > Actions > `Bicak Atlasi - Firebase Hosting` > **Run workflow** ile ilk dağıtımı başlatın.

**Not:** Firebase projesinde varsayılan Hosting site hedeflenir. Başka bir projeyi veya siteyi yanlışlıkla güncellememek için ilk yayından önce Firebase Project ID ve Hosting site adını kontrol edin. Var olan başka bir Firebase sitesini kullanmayın.

Firebase service account secret'ı oluşturma hakkında resmi dökümantasyon: https://github.com/FirebaseExtended/action-hosting-deploy/blob/main/docs/service-account.md

Sitenin ilk başarılı yayından sonraki adresi, Firebase projesinin gerçek kimliğine göre Firebase panelinde gösterilir. Henüz gerçek proje ID'si doğrulanmadığı için burada adres uydurulmaz.

Bu yöntem statik dosyaları eşler; kaynak kodu Next.js'ten yeniden derlemez. Vercel'deki mevcut Next.js projesi bilerek bağımsız tutulur.
