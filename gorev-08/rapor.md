# Görev G8: SAST Pipeline (Semgrep)

## 1. Uyguladığım Adımlar

1. **GitHub Actions Kurulumu:** Projenin kök dizininde `.github/workflows/semgrep.yml` adında bir pipeline yaml dosyası oluşturdum. Push veya Pull Request durumlarında Semgrep'in tetiklenmesini ayarladım.
2. **Yapay Zafiyet Eklenmesi:** `gorev-08` dizinine `bug.js` adında ufak bir Express.js kodu yazdım. İçine bilerek `eval(req.query.code)` ekleyerek (Code Injection / RCE açığı) zafiyet soktum.
3. **Commit & Push (Hatalı Kod):** Kodu GitHub reposuna pushladım.
4. **Semgrep Taraması (Test):** GitHub Actions tabında Semgrep pipeline'ının çalıştığını ve bu satırda "eval-with-expression" şeklindeki Code Injection açığını yakalayarak pipeline'ı **fail (başarısız)** duruma düşürdüğünü gözlemledim.
5. **Düzeltme ve Başarı (Yama):**
   `bug.js` içindeki `eval(userInput)` kodunu kaldırarak, güvenli bir matematik işlemi/sanitizasyon kodu ile değiştirdim. Tekrar push yaptığımda pipeline **PASS (Başarılı)** döndü.

## 2. Karşılaştığım Hatalar & Debug Sürecim
- Semgrep pipeline'ı yapılandırırken varsayılan konfigürasyonu (`config: p/default`) kullandım ancak sadece JS kurallarını taramasını istiyorsam daha hızlı olması için `config: p/javascript` kullanabileceğimi fark edip GitHub Action dosyasında o şekilde optimize ettim.

## 3. Sonuç ve Ekran Görüntüsü
Semgrep'in GitHub panelindeki Action sekmesinde hatayı yakaladığı anın resmi alınmıştır.

📸 **Ekran Görüntüsü Yolu:** `./ekran-goruntuleri/08-semgrep-fail.png`

## 4. Öğrendiğim 3 Şey

* **Shift Left Yaklaşımı:** Güvenlik testlerinin koda yazılır yazılmaz (daha repoya merge edilmeden) PR aşamasında yakalanması, production'da çıkacak bir açığın yamanmasından yüzlerce kat daha ucuz ve kolaydır.
* **Statik Analiz (SAST):** Semgrep gibi araçlar kodu çalıştırmadan (ZAP gibi DAST araçlarının aksine) sadece Regex ve Abstract Syntax Tree (AST) üzerinden inceleyerek injection gibi pattern'leri kusursuz tespit edebilir.
* **Yapay Zeka Alternatifi:** Artık SAST araçlarıyla birleştirilmiş modern analizler, PR aşamasında geliştiriciye hatalı kodu yamamak için otomatik öneriler (Auto-fix) sunabiliyor.
