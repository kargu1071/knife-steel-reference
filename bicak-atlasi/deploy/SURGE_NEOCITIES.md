# Bıçak Atlası — Surge.sh ve Neocities yedek yayınları

Ana yayın: https://bicak-atlasi.pages.dev/ . Surge ve Neocities sadece **yedek kopyadır**. Yayın çıktısı her HTML sayfasına `<meta name="robots" content="noindex, follow">` ekler; canonical ana Cloudflare adresini gösterir. İçerikler tek GitHub deposundan üretilir: `kargu1071/knife-steel-reference`.

## 1. Neocities (arayüzden başlamak kolay)

1. https://neocities.org/ adresinde **ayrı bir Bıçak Atlası sitesi** aç. Uygun değilse farklı bir site adı seç; mevcut başka bir Neocities sitesini yanlışlıkla kullanma.
2. Site Settings içindeki **API key** bölümünden anahtarı al. Anahtarı sohbet mesajına veya ekran görüntüsüne koyma.
3. GitHub > Repository > Settings > Secrets and variables > Actions > **Secrets** altında `ATLAS_NEOCITIES_API_KEY` adlı repository secret oluştur; değer API key olsun.
4. Aynı bölümde **Variables** altında `ATLAS_NEOCITIES_ENABLED=true` repository variable oluştur.
5. GitHub Actions içindeki **Bicak Atlasi - Surge and Neocities** iş akışını `main` dalında **Run workflow** ile başlat.
6. `verify` ve `neocities` işleri başarıyla bitince, Neocities'in senin hesabına verdiği **gerçek URL** üzerinden ana sayfa, `/konular/`, `/karsilastir/` ve noindex meta etiketini kontrol et.

Neocities ücretsiz hesaplarda web dosyaları (HTML, CSS, JS, JSON, XML, görseller vb.) yüklenebilir. Yayın GitHub Actions'ta `bcomnes/deploy-to-neocities@v3` ile hazırlanır; `cleanup: false` olduğu için uzak taraftaki alakasız dosyalar otomatik silinmez. Yayın yalnızca değişen dosyaları göndermeye çalışır. API erişimi olmadan henüz Neocities'de bir site oluşturulmuş veya yayın yapılmış **sayılmaz**.

## 2. Surge.sh (CLI gerekir)

1. https://surge.sh/ üzerindeki güncel yönergelerle Surge hesabını aç ve **e-postayı doğrula**.
2. Önce mevcut/uygun bir `<seçtiğin-ad>.surge.sh` alt alan adının sana ait olduğunu doğrula. Adı GitHub'da tahmin ederek yazma; uygunluk ve sahiplik yayından önce doğrulanmalıdır.
3. Yerel terminalde `npm install --global surge` ve `surge login` komutlarını kullan. Gerekirse ilk yayını hesabınla yaparak alan adını oluştur. Ardından `surge tokens add --domain <gerçek-alan-adın>.surge.sh -m "Bicak Atlasi GitHub Actions"` komutuyla **alan adına sınırlandırılmış** token oluştur.
4. GitHub Actions **Secrets** altında `ATLAS_SURGE_TOKEN` secret'ına tokenı kaydet. Tokenı sohbet veya commit içine koyma.
5. GitHub Actions **Variables** altında `ATLAS_SURGE_DOMAIN=<gerçek-alan-adın>.surge.sh` ve `ATLAS_SURGE_ENABLED=true` oluştur.
6. Aynı **Bicak Atlasi - Surge and Neocities** iş akışını `main` dalında çalıştır. `verify` ve `surge` işlerinin başarı durumunu kontrol et. **Run workflow** ilk yayımdan önce hesabı ve alan adını oluşturmaz.

Her iki platformda da gizli anahtarlar kullanıcı tarafından GitHub Settings üzerinden eklenir. `*_ENABLED` değişkenleri varsayılan olarak kapalıdır: CI testi geçse bile kimlik bilgileri hazır olmadan yayın denenmez.

## Kontrol ve kaynaklar

- Surge https://surge.sh/docs/guides/github-actions ve https://surge.sh/docs/cli/reference
- Neocities https://neocities.org/api ve https://github.com/bcomnes/deploy-to-neocities
- İş akışı: `.github/workflows/bicak-atlasi-extra-hosts.yml`
- Dağıtım üreticisi: `bicak-atlasi/deploy/prepare.mjs surge` veya `neocities`

**Not:** Surge ile Neocities'in sağladığı URL'ler henüz doğrulanmamıştır; canlı yayındaymış gibi duyurulmamalıdır.
