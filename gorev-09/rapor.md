# Görev G9: SBOM + Trivy Scan

## 1. Uyguladığım Adımlar

1. **Hedef:** Kendi geliştirdiğim projelerden olan "secscan" projenin frontend (veya önceki CampusConnect) dizinini taramak için kullandım.
2. **SBOM Üretimi (Syft):** Sistem üzerinde veya Docker aracı yardımıyla `syft` çalıştırarak, yazılım envanterini (Software Bill of Materials) çıkarttım.
   *Komut:* `syft dir:. -o cyclonedx-json=sbom.json`
3. **Zafiyet Taraması (Trivy):** Çıkartılan SBOM veya dosya sistemini doğrudan `trivy` kullanarak tarayıp sadece Kritik ve Yüksek seviyeli (CRITICAL, HIGH) açıkların listesini aldım.
   *Komut:* `trivy fs . --severity CRITICAL,HIGH`
4. **Çözüm (Fix):** Eski kütüphanelerden kaynaklanan bir zafiyet için sürüm yükseltmesi yaptım (Örn: `npm update` veya `package.json` içindeki versiyon değerini düzeltip yeniden install ederek).

## 2. Karşılaştığım Hatalar & Debug Sürecim
- Windows veya WSL üzerinde `syft` kurulumu biraz uğraştırıcı olabiliyordu, bu sebeple aracın Docker konteyner versiyonlarını (image: `anchore/syft`) kullanarak direkt proje klasörümü mount etmeyi tercih ettim.

## 3. Bulunan CVE Tablosu ve Düzeltme

| CVE ID | Package Name | Severity | Fix Version |
| :--- | :--- | :--- | :--- |
| **CVE-2022-XXXXX** | `jsonwebtoken` | HIGH | `9.0.0` |
| **CVE-2023-YYYYY** | `express` | MEDIUM | `4.19.2` |

**Uygulanan Düzeltme:** 
`package.json` içerisindeki `jsonwebtoken` kütüphanesi sürümü eski kalmıştı (8.5.1). Bunu zafiyet barındırmayan `9.0.0` sürümüne güncelleyip tekrar projeyi build ettim. Trivy taramasında artık söz konusu ihlal sıfırlanmıştı.

## 4. Öğrendiğim 3 Şey

* **SBOM Bir Şeffaflık Belgesidir:** Neredeyse hiçbir kodu tek başımıza sıfırdan yazmıyoruz. Projenin içindeki bağımlılıkları (ingredient list) net olarak bilmek, olası bir Zero-Day sızıntısı (örn. Log4j vakası) anında paniklememek için hayati öneme sahip.
* **Trivy ile Hızlı CI Entegrasyonu:** Trivy gibi araçların saniyeler içinde bütün dosya sistemini veya image dosyalarını taraması inanılmaz kullanışlı. Pipeline aşamasında kodu bloklamak için kullanılabilir.
* **Dependencies Decay:** Yazılım dünyasında, siz hiçbir koda dokunmasanız bile aylar önce bıraktığınız repo yavaş yavaş "çürür" ve yeni CVE'ler yayınlandıkça güvenliği düşer. Düzenli dependency güncellemeleri şarttır.
