# Görev G3: XSS + CSP Koruması

## 1. Uyguladığım Adımlar

1. **Test Ortamının Kurulması:** `bkimminich/juice-shop` Docker imajı hala arka planda çalışıyordu. `http://localhost:3000/#/search` arama sekmesine gittim.
2. **Juice Shop Üzerinde XSS:** Arama kutusuna `<iframe src="javascript:alert('XSS')">` (veya desteklenen başka bir payload) girildiğinde zafiyetin tetiklendiğini gördüm (Reflected/DOM XSS).
3. **Kendi Uygulamamı Yazma:** Express kullanan basit bir Node.js uygulaması oluşturdum (`app.js`).
4. **Zafiyetli Sürüm Testi:** Uygulamamın `/unsafe?name=<script>alert('XSS')</script>` ucuna istek attığımda script'in çalıştığını, ekrana bir popup bastığını teyit ettim.
5. **CSP ile Koruma (Savunma):** Uygulamanın `/safe` uzantılı diğer endpoint'ine `Content-Security-Policy: default-src 'self'; script-src 'self'` başlığını ekledim.
6. **Korumalı Sürüm Testi:** Aynı payload ile `/safe` ucuna tekrar istek attım. Tarayıcı script'i yüklemeyi reddetti (Inline script reddedildi) ve payload devreye girmedi.

## 2. Karşılaştığım Hatalar & Debug Sürecim
- Juice Shop'da saf `<script>alert('XSS')</script>` bazen Angular'ın temel filtrelerine takılabiliyor, bu yüzden `<iframe src="javascript:alert('xss')">` gibi alternatif DOM based xss payload'larını kullanarak atlatmak gerekti.
- CSP politikası yazarken başlangıçta sadece `default-src 'self'` yazdığımda bazı modern tarayıcılarda stillerin vs. bozulduğunu fark ettim. Gerçek bir senaryoda `script-src` kısımlarına `unsafe-inline` vermek zorunda kalınabiliyor ama zafiyeti kapatmak için bu kullanılmamalıdır.

## 3. Sonuç ve Ekran Görüntüsü
Tarayıcı DevTools Console'da görülen CSP Violation (İhlal) hatasının ve XSS alert kutusunun ekran görüntüleri alınmıştır.

📸 **Ekran Görüntüsü Yolları:** 
- `./ekran-goruntuleri/03-xss-alert.png` (Juice Shop XSS)
- `./ekran-goruntuleri/03-csp-violation.png` (Müdafaa / CSP Hatası)

## 4. Öğrendiğim 3 Şey

* **CSP (Content Security Policy) İkinci Bir Katmandır:** XSS için asıl çözüm kodlamada escape/sanitize etmek (örn: EJS, React otomatik yapar) olmalıdır. CSP, kod hatası yapılsa bile saldırıyı son anda engelleyen harika bir Fallback'tir.
* **Inline Scriptler Tehlikelidir:** CSP'nin temel gücü, saldırganın yolladığı `<script>` taglarını sayfadan bağlayamamasıdır. Bu da kodumuzda satır içi JavaScript (inline-script veya `onclick="..."` gibi) kullanmaktan kaçınmamız gerektiğini öğretir.
* **Reflected vs Stored XSS:** Parametreden okuyup anında ekrana bastığımız bu örnek Reflected XSS'tir. Eğer veritabanına kaydetseydik ve diğer kullanıcılar okurken çalışsaydı çok daha tehlikeli olan Stored XSS olurdu.
