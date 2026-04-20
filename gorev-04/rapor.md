# Görev G4: CSRF Token Sistemi

## 1. Uyguladığım Adımlar

1. **Uygulama İskeleti:** `express`, `cookie-parser` ve `ejs` kütüphanelerini kullanarak GET ve POST uçlarına sahip yerel bir `/transfer` sayfası hazırladım. GET isteği bir HTML form render ederken, POST isteği işlemi yapıyordu.
2. **Zaafiyet Simülasyonu (Zararlı Site):** Form üzerinde CSRF Token olmadan `app.js` çalıştırıldı. Ayrı bir HTML dosyası (`evil-form.html`) oluşturdum. Bu dosya tamamen farklı bir domaine aitmiş gibi çalıştı.
3. **Saldırı Testi:** Hedef oturumu (cookie) açıkken `evil-form.html` üzerindeki butona tıklandığında, işlem `http://localhost:3000/transfer` adresine yönlendi ve arka planda kullanıcının çerezleri gönderildiği için saldırgan hesabına başarıyla 500TL transfer edildi.
4. **Savunma Entegrasyonu:** `npm install csurf` ile CSRF paketini projeye dahil edip, middleware olarak (`app.use(csrf({cookie: true}))`) uygulamaya ekledim.
5. **Token Dağıtımı:** GET `/transfer` endpoint'inde üretilen `req.csrfToken()`'ı `transfer.ejs` formuna hidden input (`name="_csrf"`) olarak yerleştirdim.
6. **Yama Testi:** Tekrar `evil-form.html` dosyası üzerinden saldırı denendiğinde, csurf middleware'i token doğrulaması (veya eksik token tespit ettiği) yapamadığı için saldırıyı blokladı ve `403 Forbidden` (`EBADCSRFTOKEN`) hatasını başarıyla döndürdü.

## 2. Karşılaştığım Hatalar & Debug Sürecim
- `csurf` paketini kullanırken "throw err" tarzında raw bir node hatası eksiği fark ettim. Kullanıcının kötü bir ekranla karşılaşmaması için CSRF hatasını özel olarak Express Error Handler katmanında (`if (err.code === 'EBADCSRFTOKEN') ...`) yakalayıp düzgün bir HTTP 403 Forbidden mesajına çevirdim.
- İlk denememde Node tarafında `cookie-parser` middleware'ini eklemediğim için CSRF token kaydedilememişti. Sıralamasını düzelttikten sonra çalıştı.

## 3. Sonuç ve Ekran Görüntüsü
Gerek form ekranı, gerekse engellenen saldırı anındaki 403 Forbidden mesajının ekran görüntüleri eklenmiştir.

📸 **Ekran Görüntüsü Yolları:** 
- `./ekran-goruntuleri/04-csrf-blocked.png` (403 Forbidden ekranı)

## 4. Öğrendiğim 3 Şey

* **Cookiler Otomatik Gider:** Bir websitesi başka bir websitesine POST atarken mevcut cookieleri (Session ID dahil) tarayıcı yüzünden ekler. CSRF açığı buradan doğar.
* **Token'ın İşlevi:** Gizli olan CSRF token değeri, sadece formun asıl bulunduğu DOM üzerinde (yani birinci el kaynakta) JavaScript ya da HTML render edilerek bulunur. Zararlı site bu tokeni asla okuyamaz/bilemez (Same-Origin-Policy).
* **SameSite Özelliği:** Modern tarayıcılarda cookie'lere `SameSite=Lax` veya `SameSite=Strict` eklemek ekstra ve bedava bir CSRF koruması sağlar.
