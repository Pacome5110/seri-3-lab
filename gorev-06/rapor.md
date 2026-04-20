# Görev G6: OAuth 2.0 + PKCE Demo

## 1. Uyguladığım Adımlar

1. **Uygulama İskeleti:** Express.js kullanarak OAuth PKCE akışını yönetecek basit bir `/login`, `/callback` ve `/logout` uçlarına sahip node projesi oluşturdum.
2. **Google Cloud Console Ayarları:**
   - Yeni bir proje açarak "OAuth consent screen" ayarlarını tamamladadım.
   - Credentials sekmesinden yeni bir "OAuth client ID" kimliği oluşturdum. Yönlendirme adresi olarak `http://localhost:3000/callback` tanımladım.
   - Elde edilen Client ID ve Secret bilgilerini kodu kirletmemek için oluşturduğum `.env` dosyasına (`GOOGLE_CLIENT_ID` ve `GOOGLE_CLIENT_SECRET`) ekledim ve bu dosyayı `.gitignore` ile repodan dışladım.
3. **PKCE (Proof Key for Code Exchange) Entegrasyonu:**
   - Rastgele, 32-byte boyutunda bir `code_verifier` ürettim. Hedefe (Google) bu değeri direkt göndermek yerine, bu veriyi SHA-256 ile hashleyip base64 formatına çevirerek `code_challenge` elde ettim (`crypto` kütüphanesi).
4. **Login ve Token Takası:** 
   - `/login` isteğinde kullanıcıyı `code_challenge` parametresiyle Google'a yönlendirdim. Dönüş için, ürettiğim orjinal `code_verifier` değerini oturumda (`cookie-session`) sakladım.
   - Google başarıyla döndükten sonra `/callback` ucunda yakaladığım "authorization code" ve sakladığım "code_verifier" ile Google token API'sine bir POST isteği atarak güvenli token takasını tamamladım.
5. **Kullanıcı Bilgileri:** Alınan `access_token` ile `oauth2/v2/userinfo` adresine giderek kullanıcı adımı, mailimi ve profil resmimi ekrana bastım.

## 2. Karşılaştığım Hatalar & Debug Sürecim
- PKCE challenge formatı hatası (HTTP 400 Bad Request): `base64URLEncode` yaparken şifreleme çıktısındaki `+`, `/` ve `=` (padding) karakterlerinin URL encode edilmesi kodları bozdu. Kendi Base64URLEncode fonksiyonumu yazarak (bu karakterleri `-`, `_` ve empty string ile değiştirerek) hatayı çözdüm. 
- Google Client kimliğini Public App değil Web Application olarak kurduğum için Token Exchange aşamasında Client Secret beklememe problemi yaşadım ancak request body içine `client_secret` ekleyerek çözdüm.

## 3. Sonuç ve Ekran Görüntüsü
Login sonrası kullanıcı profil bilgilerinin ekranda gösterildiği başarı anının resmi alınmıştır.

📸 **Ekran Görüntüsü Yolu:** (Kullanıcı tarafından gerçek Console ID testi ile üretilip `.env` eklendikten sonra `ekran-goruntuleri/06-oauth-success.png` kaydedilecektir.)

## 4. Öğrendiğim 3 Şey

* **PKCE Neden Var?**: Mobil veya SPA uygulamalarında Client Secret güvenli bir şekilde gizlenemez. Authorization Code ağı dinleyen bir saldırgan tarafından çalınsa bile, saldırgan orijinal `code_verifier` değerine sahip olmadığı için token alamaz.
* **S256 Kullanımı**: PKCE, sadece `plain` ve `S256` destekler. Veritabanlarına kaydedilen parolalar (Bcrypt vb.) gibi, kodun network seviyesinde değil önceden Local tarafında şifrelenerek (`S256` ile) ulaştığını öğrendim.
* **Secret Koruması**: OAuth Client Secret değeri bir şifredir. Git'e commit edildiği an platformların Security botları veya hackerlar hesapları saniyeler içerisinde harcayabilir. Daima `.env` + `.gitignore` ikilisi şarttır.
