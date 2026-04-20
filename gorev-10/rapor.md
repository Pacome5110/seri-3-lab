# Görev G10: Security Headers A+

## 1. Uyguladığım Adımlar

1. **Test Uygulaması:** Basit bir Express `hello world` uygulaması oluşturdum.
2. **İlk Tarama:** Uygulamayı canlıya (Railway/Render) aldım ve varsayılan haliyle `securityheaders.com` aracında tarama başlattım. Beklendiği üzere F skoru aldık, çünkü Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options gibi başlıkların hiçbiri yanıtta yoktu.
3. **Helmet Entegrasyonu:** Kod içerisine `npm install helmet` paketi dahil edildi. Express nesnesine bir middleware olarak `app.use(helmet(...))` bağlandı. Konfigürasyonla birlikte (özellikle HSTS için maxAge belirlenerek) güvenlik başlıkları sıkılaştırıldı.
4. **Tekrar Test:** Kod güncellendikten ve tekrar canlıya yüklendikten sonra `securityheaders.com` üzerinden yapılan teste A+ notu alınmıştır.

## 2. Karşılaştığım Hatalar & Debug Sürecim
- A skoru almak nispeten kolay olsa da A+ skorunu aldırabilmek için sadece `helmet()` kullanmak yetmiyor; özel olarak helmet ayarlarında `hsts` içeriğindeki `maxAge` süresini makul bir sınırın üzerine çekmek (örneğin 1 yıl) ve CSP başlıklarının dahil edilmesi gerekiyor.

## 3. Sonuç ve Ekran Görüntüsü
Helmet güvenlik başlıkları uygulandıktan sonra `securityheaders.com` üzerindeki A+ belgesi görüntülenmiştir.

📸 **Ekran Görüntüsü Yolu:** `./ekran-goruntuleri/10-security-headers-aplus.png`

## 4. Öğrendiğim 3 Şey

* **Helmet Çok Pratik:** Node.js ekosisteminde security header'ları manuel set etmek yerine `helmet` kütüphanesini tak-çalıştır formda araya eklemek mükemmel bir standart oluşturulmasını sağlar.
* **HTTP Headerları İlk Savunma Hattıdır:** Tarayıcılar (Chrome, Firefox vs.) bu başlıkları çok ciddiye alır. Geliştirici olarak siz backend'de bir hata yapsanız dahi tarayıcı XSS veya click-jacking'i header sayesinde yakalayıp durdurabilir.
* **HSTS (HTTP Strict Transport Security):** Sitenin bir kez HTTPS olarak ziyaret edilmesinden sonra, tarayıcının kullanıcı aksine siteye asla ve asla HTTP (güvenli olmayan) olarak gitmemesini dikte eden çok önemli bir yapılandırmadır. Man-in-The-Middle ataklarını ciddi ölçüde kırar.
