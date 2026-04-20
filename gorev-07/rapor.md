# Görev G7: Nmap + ZAP Taraması

## 1. Uyguladığım Adımlar

1. **Nmap Taraması:** Yerelde 3000 portunda çalışan Juice Shop uygulamasının servis türünü ve versiyon bilgisini almak adına şu komutu çalıştırdım:
   `docker run --rm instrumentisto/nmap -sV -p 3000 host.docker.internal`
2. **OWASP ZAP Baseline Taraması:** Web uygulamasının güvenlik başlıklarını (headers), cookie ayarlarını ve temel güvenlik açıklarını taramak için ZAP Baseline komutunu (Docker üzerinden) başlattım. Taramayı doğrudan `/zap/wrk/` klasörüne mount ederek `zap-report.html` çıktısını projeye taşıdım.
3. **HTML Rapor İncelemesi:** Elde edilen raporu açarak bulguları filtreledim.

## 2. Karşılaştığım Hatalar & Debug Sürecim
- Docker konteynerinden local (host) ağında çalışan diğer konteynere (Nmap -> Juice Shop) veya ZAP -> Juice Shop taraması yaparken `localhost` yerine `host.docker.internal` DNS çözümlemesini kullanmam gerekti; zira `localhost` bağlanmaya çalışan konteynerin kendisi oluyordu.

## 3. Bulunan Bulgular ve OWASP Kategorileri

* Nmap Sonucu: `3000/tcp open http Node.js Express framework` (A05:2021-Security Misconfiguration - Framework/Versiyon sızıntısı)

ZAP High/Medium Bulguları:
1. **CSP: Wildcard Directive** (Medium Risk): `Content-Security-Policy` içerisinde zayıf ayarlar var. XSS riskini artırır. -> *A05:2021-Security Misconfiguration*
2. **Missing Anti-clickjacking Header** (Medium Risk): Uygulamada `X-Frame-Options` yok. -> *A05:2021-Security Misconfiguration*
3. **Cross-Domain JavaScript Source File Inclusion** (Low/Medium Risk) -> *A08:2021-Software and Data Integrity Failures*

## 4. Düzeltme Önerisi ("Bu Nasıl Düzeltilir?")

**Missing Anti-clickjacking Header (X-Frame-Options) Nasıl Kapatılır?**
Bu zafiyet, saldırganların bizim sitemizi görünmez bir iframe içerisine alıp (Clickjacking) kullanıcının haberi olmadan işlem yaptırmasına yol açar.
Düzeltmek için HTTP Headerlarına `X-Frame-Options: DENY` veya `SAMEORIGIN` eklenmelidir. Node.js (Express) ortamında `helmet` kütüphanesi en güvenli yaklaşımdır:

```javascript
const helmet = require('helmet');
// Bu satır X-Frame-Options dahil birçok güvenlik başlığını set eder.
app.use(helmet()); 
```

## 5. Öğrendiğim 3 Şey

* **DAST Otomasyonu Kolaydır:** ZAP Baseline Scan gibi Docker scriptlerini CI/CD pipeline'ına çok rahat entegre edebiliriz, developer hatalarını yakalamak için ideal bir bekçidir.
* **Versiyon Sızıntısı:** Nmap gibi port scannerlar `X-Powered-By: Express` veya `Server` gibi header'ları okuyarak uygulamanın Node.js arkasında çalıştığını ifşa edebilir. Framework kimliğini gizlemek saldırganın exploit seçimini zorlaştırır.
* **Baseline Yeterli Değildir:** ZAP'ın passif taraması (baseline), spesifik business logic zafiyetlerini veya yetki tırmanmasını (RLS/Auth) göremez. Yalnızca düşük asılı meyveleri (header vb.) toplar.
