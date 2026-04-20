# Görev G2: SQL Injection Lab

## 1. Uyguladığım Adımlar

1. **Test Ortamının Kurulması:** İlk olarak zafiyetli web uygulaması olan **OWASP Juice Shop**'ı Docker üzerinden ayağa kaldırdım:
   `docker run --rm -p 3000:3000 bkimminich/juice-shop`
2. **Kullanıcı Giriş Sayfasına Yönelme:** Uygulamanın `/login` sayfasına gittim.
3. **Bypass Payload'ı Deneme:** E-posta adres alanına bilinen SQL Injection payload'larından olan `' OR 1=1 --` ifadesini yazdım. Şifre alanına ise herhangi bir rastgele karakter (örneğin "123") yazdım.
4. **Admin Olarak Giriş:** Veritabanındaki ilk kullanıcı genellikle admin olduğu ve OR sorgusu tüm hesaplar için true döneceği için, payload çalıştı ve sisteme "Admin" kullanıcısı (admin@juice-sh.op) olarak başarılı bir şekilde giriş yapıldı.
5. **Farklı Payload'lar Deneme:** Time-based blind ve Union based payloadlarını test ettim (liste `saldiri.txt` içinde).
6. **Savunma Mekanizması:** Zafiyetin kod seviyesindeki nedeni ve bu açığı kapatacak modern çözüm (Parameterized queries) `savunma.js` dosyasına eklendi.

## 2. Karşılaştığım Hatalar & Debug Sürecim
- Payload'lardan bazılarını denerken, Juice Shop SQLite kullandığı için MySQL özelindeki payload'lar (örneğin `WAITFOR DELAY`) hata verdi. SQLite özel payload'larına (örnek: random() generator fonksiyonunu çok fazla çalıştırtarak gecikme yaratma) geçiş yapmam gerekti.

## 3. Sonuç ve Ekran Görüntüsü
Login işleminde SQL Injection payload'u sonrası başarılı giriş olduğuna dair ekran görüntüsü alınmıştır.

📸 **Ekran Görüntüsü Yolu:** `./ekran-goruntuleri/02-sqli-success.png`

## 4. Öğrendiğim 3 Şey

* **Never Trust User Input:** Girdiler her zaman validate veya sanitize edilmelidir.
* **ORM Hayat Kurtarır:** Modern ORM'ler (Prisma, Sequelize vb.) default olarak Parameterized Query (Hazırlanan İfade) altyapısını kullanarak SQL Injection riskini minimuma indirir.
* **Payload Çeşitliliği:** Bir payload her DB'de çalışmaz; SQL diyalektiğini bilmek ve ona göre sızma testi yapmak çok daha etkilidir (Örn. SQLite vs PostgreSQL).
