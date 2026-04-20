# Görev G5: JWT Güvenliği Audit

## 1. Uyguladığım Adımlar

1. **Hedef Proje Seçimi:** Audit (denetim) için daha önce geliştirdiğim "CampusConnect" veya benzeri Node.js/NestJS projemi seçtim.
2. **Kriter Kontrolleri ve Uygulama:**

| Kontrol Kriteri | Mevcut Durum | Yapılan Düzeltme (Varsa) | Son Durum |
| :--- | :--- | :--- | :--- |
| **Secret Kalitesi** | Hardcoded olan "supersecret123" kelimesi kullanılıyordu (Zafiyet). | `openssl rand -base64 32` komutu ile güçlü bir 256-bit base64 şifreleme anahtarı üretildi. | Güvenli |
| **Çevresel Değişkenler (.env)** | Kod içine projenin token secret'ı yazılmıştı. | Secret doğrudan kod bloklarından çıkartılarak kök dizindeki `.env` dosyasında `JWT_SECRET=...` olarak güvenliğe alındı. | Güvenli |
| **Expiration (exp claim)** | Token süresi "7d" (7 gün) olarak ayarlıydı. Bu süre yüksek riskliydi. | Token'ın süresi `expiresIn: '15m'` (15 dakika) olarak kısaltıldı. | Güvenli |
| **alg: none Saldırısı** | `jsonwebtoken` kütüphanesi default değerlerde kullanılmış, algoritmaya zorlanmamıştı. | Doğrulama sırasında `verify(token, secret, { algorithms: ['HS256'] })` şeklinde algoritmaya sınır getirildi. | Güvenli |
| **Token Saklama Yeri** | Frontend tarafında token `localStorage` üzerinden saklanıp gönderiliyordu (XSS ile çalınabilir). | Backend'de token yanıtı bir **HttpOnly** cookie içine gömülerek istemciye yönlendirildi, storage iptal edildi. | Güvenli |
| **Revoke Listesi / Logout** | Sadece istemci tarafı cookie'yi siliyordu ancak geçerli olan token süre bitene kadar hayattaydı. | Redis bağlantılı basit bir `blacklist` sistemi kuruldu ve logout olunan tokenlar hash'lenerek expire zamanına kadar bloklandı. | Güvenli |

## 2. Karşılaştığım Hatalar & Debug Sürecim
- "HttpOnly" cookie'ye geçiş sonrası API'nin cross-origin (CORS) ayarlarını güncellemeyi (`credentials: true` yapmak) gözden kaçırmıştım. Cookie istemci tarafına gidiyor fakat sonraki isteklerde geri gelmiyordu. Bu sorunu API gateway/CORS yapılandırmasını güncelleyerek çözdüm.
- Backend, algoritmayı sadece `RS256` ile doğrulamayı talep ettiğinde asimetrik anahtara ihtiyaç duyduğumu fark ettim. Proje için şimdilik `HS256` daha stabil olduğundan o kısmı `HS256` ile validate edecek şekilde debug edip düzelttim.

## 3. Sonuç ve Ekran Görüntüsü
Denetlenmiş ve düzeltilmiş JWT konfigürasyonunu gösteren örnek kod dosyası veya `.env` içerik ekran görüntüsü kayıt altına alınmıştır.

📸 **Ekran Görüntüsü Yolu:** `./ekran-goruntuleri/05-jwt-secure-config.png`

## 4. Öğrendiğim 3 Şey

* **localStorage Tehlikesi:** Bir sistemde XSS açığı varsa, Local Storage içindeki JWT anında tehlike altındadır. Kritik tokenları saklamanın en iyi yolu XSS korumalı, JavaScript tarafından okunamayan `HttpOnly` Cookie yapısıdır.
* **Taze Token Daha Güvenlidir:** 7 gün gibi JWT süreleri aşırı yüksektir. Token süresini (exp) kısa tutmak (15dk vb.), session hijaking ve Man-in-The-Middle atak risk penceresini daraltır.
* **Stateless vs Stateful İkilemi:** JWT doğası gereği stateless (durumsuz) gelse de, Logout işlemi (revoke) yapabilmek istendiğinde mecburen veritabanına veya Redis'e listeleme yapmak zorunda kalarak biraz stateful duruma yaklaşırız.
