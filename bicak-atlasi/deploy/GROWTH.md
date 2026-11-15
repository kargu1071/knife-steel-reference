# Bıçak Atlası – Google/Bing, özel alan adı, yeni konu haritası, Firebase ve Azure

Bütün yayınlar için tek GitHub deposu: https://github.com/kargu1071/knife-steel-reference. **Ana sürüm**: https://bicak-atlasi.pages.dev. Cloudflare Pages git bağlantısı hazır; Netlify ve Render mevcut, Vercel Next.js ayrı ve korunur. Bu dosyalar mevcut projeleri yeniden oluşturmaz.

## 1. Google Search Console

1. https://search.google.com/search-console adresinde **URL-prefix** seçin. URL olarak tam `https://bicak-atlasi.pages.dev/` girin. `pages.dev` üzerinde DNS doğrulaması yerine URL-prefix + HTML etiketini kullanın.
2. Google'ın verdiği `<meta name="google-site-verification" content="TOKEN">` etiketinden yalnızca `TOKEN` değerini alın.
3. Cloudflare > Workers & Pages > `bicak-atlasi` > Settings > Variables and Secrets bölümünde production **build-time** ortam değişkeni `ATLAS_GOOGLE_SITE_VERIFICATION` ekleyin. Değeri yalnızca `TOKEN` olsun, etiketin tamamı değil.
4. Cloudflare'de yeni üretim dağıtımı yapın; yayımlanmış HTML kaynak kodunda meta etiketi göründükten sonra Search Console **Verify** düğmesine basın.
5. Search Console > Sitemaps kısmına `sitemap.xml` gönderin. Beklenen sayfalar: ana sayfa, 20 profil, yöntem, karşılaştırma ve konu haritası (toplam 24).
6. GSC'de Indexing, Pages ve URL Inspection sonuçlarını gözlemleyin. Sitemap gönderimi indekslemeyi garanti etmez.

**Yalnızca ana sürüm** GSC mülkü olsun. Netlify, Firebase, Render, Azure ve Vercel kopyalarını ayrıca indeksletmeyin.

## 2. Bing Webmaster Tools ve IndexNow

1. https://www.bing.com/webmasters/ adresine giriş yapın.
2. Google Search Console'da doğrulanmış olan `https://bicak-atlasi.pages.dev/` mülkünü **Import from Google Search Console** ile içeri alın. Bu mümkün olmazsa URL mülkünü manuel doğrulayın.
3. `https://bicak-atlasi.pages.dev/sitemap.xml` adresini Bing Sitemaps bölümüne ekleyin.
4. IndexNow yayın anahtarı site kökünde **herkese açık** dosya olarak yayınlanır: `bicatlas2026c8a73e945612.txt`. Anahtar dosyası yalnızca Cloudflare build'de oluşturulur.
5. İlk Cloudflare dağıtımı tamamlandıktan ve `https://bicak-atlasi.pages.dev/bicatlas2026c8a73e945612.txt` adresi aynı anahtarı döndürdükten sonra GitHub > Settings > Secrets and variables > Actions > **Variables** alanında `ATLAS_INDEXNOW_ENABLED` = `true` ekleyin.
6. GitHub Actions > **Bicak Atlasi - Bing IndexNow** > Run workflow. İş akışı, Cloudflare'deki gerçek `atlas-build.txt` commit SHA değerini GitHub SHA ile karşılaştırır; eşleşmeden IndexNow'a istek göndermez. Sonraki ilgili `main` güncellemelerinde de çalışır.

IndexNow **Google'a doğrudan gönderim değildir** ve indeks garantisi vermez; Bing ve IndexNow katılımcısı arama motorlarına bildirir.

## 3. Özel alan adı ve canonical

**Alan adı kullanıcı tarafından kararlaştırılmadan ve satın alınmadan DNS'e dokunmayın.**

Cloudflare > Workers & Pages > bicak-atlasi > Custom domains > Set up a domain. Örneğin sahibi olduğunuz bir alan adı ya da `atlas.ankaoutdoor.com` gibi bir alt alan adı kullanılabilir. Cloudflare'ın verdiği DNS talimatlarını izleyin. Özel alan adı HTTPS ve 200 yanıtıyla açılmadan yönlendirme yapmayın.

Alan adı doğrulandıktan sonra:

- Cloudflare production build ortam değişkeni: `ATLAS_CANONICAL_ORIGIN=https://GERCEK-ALAN-ADI` (sonunda `/` yok). Deploy tetikleyin.
- Netlify ve Render'daki ikincil sürümlerde canonical, aynı ana alan adını göstermelidir. Netlify build ortam değişkeni `ATLAS_CANONICAL_ORIGIN` desteklenir; Render'ın eski hazırlama betiği ayrıca güncellenmelidir.
- Azure/Firebase/Netlify GitHub Actions işlerinde yeni alan adı otomatik olarak GitHub Actions variable `ATLAS_CANONICAL_ORIGIN` üzerinden okunur. Aynı değişkeni depo Variables alanına gerçek tam HTTPS adresiyle kaydedin.
- GSC için yeni alan adının uygun mülkünü doğrulayın; sitemap URL'sini yeni alan adına göre güncelleyin.
- GitHub Actions değişkeni `ATLAS_CANONICAL_ORIGIN` IndexNow işine `ATLAS_INDEXNOW_ORIGIN` olarak aktarılır; anahtar dosyasının yeni alan adında yayınlandığını ve `atlas-build.txt` sürüm kontrolünü doğrulayın. Anahtar dosyası yeni alan adının kökünden de erişilebilir olmalı.
- Eski URL'lerin yeni adrese 301 yönlendirilmesini, bütün geçiş kontrolleri tamamlandıktan sonra yapın. Canonical değişimi, yönlendirme ve GSC mülkiyet geçişini tek seferde test edin.

## 4. Yeni site özelliği: konulara göre kaynak keşfi

`bicak-atlasi/deploy/extend.mjs` yayımlama sırasında mevcut `bicak-atlasi/siteler.json` dosyasındaki 20 doğrulanmış profilden **/konular/** adresini oluşturur. Çelik, EDC, kamp/bushcraft, koleksiyon/markalar ve haberler/topluluk konuları işlenir. Profil bağlantıları mevcut Bıçak Atlası profillerine yönlenir.

Aynı işlem site haritasına **/karsilastir/** ve **/konular/** adreslerini ekler. 22 kayıtlı eski sitemap 24 URL'ye çıkar. Çıktı statiktir; mevcut Next.js uygulamasının kaynak kodunu yeniden derlemez ve mevcut Vercel projesini değiştirmez. Ana sayfa navigasyonunda konu haritası bağlantısı, **orijinal Next.js kaynak kodu** güvenle depoya alınınca entegre edilmelidir.

## 5. Firebase Hosting

Firebase projesi: `bicak-atlasi`. Hosting adresleri: `https://bicak-atlasi.web.app` ve `https://bicak-atlasi.firebaseapp.com` (ilk dağıtım henüz doğrulanmadı).

Yayın hizmet hesabı: `bicak-atlasi-github-deploy@bicak-atlasi.iam.gserviceaccount.com`.

Google Cloud IAM'de bu hesaba **Firebase Hosting Admin** ve **API Keys Viewer** rollerini verin. Owner, Editor veya genel Admin rolü vermeyin. Son ekranda bu hizmet hesabı IAM listesinde görünmüyordu; yalnızca oluşturulmuş hesap ve sonradan kaldırılmış geniş yetki biliniyor.

Google Cloud > IAM & Admin > Service Accounts > yukarıdaki hesap > Keys > Add key > Create new key > JSON. İndirilen JSON dosyasını **asla GitHub'a commit etmeyin veya sohbette paylaşmayın**. GitHub > Repository Settings > Secrets and variables > Actions:

- Secret: `ATLAS_FIREBASE_SERVICE_ACCOUNT` → JSON'un eksiksiz içeriği.
- Variable: `ATLAS_FIREBASE_PROJECT_ID` → `bicak-atlasi`.
- Variable: `ATLAS_FIREBASE_ENABLED` → ancak proje ve yetki onayı sonrası `true`.

Ardından Actions > **Bicak Atlasi - Firebase Hosting** > Run workflow. Firebase ikincil sürümünde `X-Robots-Tag: noindex, follow` kalmalıdır.

## 6. Azure Static Web Apps (isteğe bağlı yedek)

1. https://portal.azure.com/#create/Microsoft.StaticApp adresini açın. **Static Web Apps**, ad `bicak-atlasi`, mümkünse **Free** planı seçin.
2. Source için **Other** seçin; böylece GitHub'da otomatik oluşan ikinci bir Azure workflow ile çakışma önlenir. Azure izin/abonelik gerektirir.
3. Azure Static Web App oluşturulduktan sonra **Manage deployment token** bölümünde token alın. Tokenı yalnızca GitHub Repository Secret `ATLAS_AZURE_STATIC_WEB_APPS_TOKEN` alanına yapıştırın.
4. Deployment authorization policy **Deployment token** olmalı. GitHub Actions Variables > `ATLAS_AZURE_ENABLED=true`.
5. GitHub Actions > **Bicak Atlasi - Azure Static Web Apps** > Run workflow.

Azure yayını `.atlas-dist` çıktısından yapılır. Çıktıdaki `staticwebapp.config.json` bütün sayfalara **X-Robots-Tag: noindex, follow** ekler. Azure'da yeni oluşturulan sitenin adresi oluşturma sonrası görülecek, burada tahmin edilmez.

## 7. Cloudflare Web Analytics ve yayın izlemesi

Cloudflare Pages projesinde **Metrics > Web Analytics > Enable** seçeneğini açın. Cloudflare, geçerli HTML sayfalarına izleme betiğini sonraki yayında otomatik ekler; ayrıca HTML'ye elle analitik kodu yazmayın. Bu ölçüm Cloudflare ana sürümünün sayfa görüntülemelerini ve performansını izlemek içindir. https://developers.cloudflare.com/pages/how-to/web-analytics/

GitHub > Actions ekranında Cloudflare/Netlify, Firebase, Azure ve IndexNow işlerinin **verify**, **skipped** ve **success** statülerini ayrı yorumlayın. `verify: success` derlemenin doğrulandığını, dağıtım job'u `skipped` ise ilgili platforma **yayın yapılmadığını** gösterir.

## Genel güvenlik ve kalite kontrolü

- Yalnızca Cloudflare Pages ana sürümü indekslenecek.
- Vercel Next.js `bicak-atlasi` projesine mevcut statik çıktıları üzerine yazmayın.
- Her platform için üretilen sitemap, bağlantılar, `/konular/`, `/karsilastir/` ve HTTP başlıklarını ayrı kontrol edin.
- Gizli anahtarları yalnızca GitHub Secrets'a girin.
- Buradaki iş akışlarında Firebase, Azure ve IndexNow **varsayılan olarak kapalıdır**; manuel hesap işlemleri tamamlanmadan canlı yayın yapılmaz.
- Google Search Console'da mülk doğrulaması ve Bing içe aktarması henüz yapılmış olarak kabul edilmemelidir.
