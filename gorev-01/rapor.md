# Görev G1: OWASP Top 10 Haritalama

## 1. Uyguladığım Adımlar

1. **Açık Kaynak Proje Seçimi:** Analiz için "Supabase" (Açık kaynak Firebase alternatifi) projesini seçtim. Orta/büyük ölçekli ve popüler olduğu için güvenlik pratikleri oldukça iyi belgelenmiş.
2. **Tech Stack:** Projenin tech stack'ini inceledim: PostgreSQL (veri tabanı), Go (GoTrue / Auth servisi), Haskell (PostgREST), ve TypeScript (istemci kütüphaneleri, edge functions).
3. **OWASP Top 10 Analizi:** Supabase yapısında öne çıkan 5 OWASP 2021 kategorisini seçerek platformun bunları nasıl engellediğini haritalandırdım:

| OWASP Kategorisi | Supabase Tedbiri / Koruma Yöntemi |
|:---|:---|
| **A01:2021 - Broken Access Control** | PostgreSQL'in yerleşik **Row Level Security (RLS)** mekanizmasını kullanıyor. Kullanıcılar yalnızca policy'de izin verilen kayıtlara erişebiliyor. RLS etkinleştirilmediğinde uyarı veriliyor. |
| **A02:2021 - Cryptographic Failures** | Tüm parolalar GoTrue servisinde bcrypt ile hashleniyor. Hassas veriler (tokenlar, keyler) `pgsodium` eklentisi kullanılarak transparent encryption (şifreleme) ile korunuyor. |
| **A03:2021 - Injection** | SQL Injection'ı engellemek için doğrudan SQL yazmak yerine REST API üzerinden (PostgREST) strict tip kontrollü veri alınıyor ve arka planda **parametreleştirilmiş sorgular (parameterized queries)** kullanılıyor. İstemci SDK'larında string birleştirme yapılamıyor. |
| **A04:2021 - Insecure Design** | Projenin auth yapısında "Secure by Default" prensibi gözetilmiş. Projeyi oluşturduğunuzda auth modülü dışa kapalı varsayılanlarla gelir. |
| **A07:2021 - Identification and Authentication Failures** | Supabase Auth (GoTrue), auth state'lerini yönetmek için PKCE desteğine sahip OAuth flowları kullanıyor, Brute-force saldırılarına karşı auth API'sinde rate-limiting mekanizması aktif. |

4. **Eksik veya İyileştirilebilecek Konu Tespiti:** 
Büyük platformlarda sıkça rastlanan eksiklerden biri: **API Endpoints üzerinde granular Rate Limiting eksikliği (A04: Insecure Design & DoS Riski)**. Supabase auth üzerinde basic bir rate limiting sunsa da, standart kullanıcının oluşturduğu tablolara ait REST API uçlarında varsayılan bir rate limiting konfigürasyonunu zorunlu kılmamaktadır. Kullanıcı bunu bir middleware veya external gateway tarafında yönetmek zorundadır.

**Kod / Konfigürasyon Alıntısı (RLS kullanımı):**
```sql
-- Normalde tabloya herkes erişebilirken, aşağıdaki RLS ile
-- sadece otantikasyon olmuş kullanıcı POST oluşturabilir:
CREATE POLICY "Sadece giriş yapanlar insert edebilir" 
ON public.posts 
FOR INSERT TO authenticated 
WITH CHECK (true);
```

## 2. Karşılaştığım Hatalar & Debug Sürecim
- GitHub repolarının Security veya Dependabot sayfasına yetkimiz olmadığı için tam listeyi görmek zor oldu. Bunun yerine Supabase'in resmi güvenlik dokümantasyonunu ve geçmiş commit raporlarını incelemek zorunda kaldım.
- Supabase'in birçok servisi olduğu için (storage, auth, db), OWASP analizi yaparken sadece Auth (GoTrue) servisine veya DB'ye odaklanmak yerine tüm sistemi değerlendirmeye karar verdim.

## 3. Sonuç ve Ekran Görüntüsü
Supabase reposunun Security politikalarının analiz sonucunu içeren bir tablo oluşturulmuştur. Ekran görüntüsü klasörüne GitHub "Security" tablosu ve RLS politika ekranının resmi eklenmiştir (Lütfen repo detayını ekran görüntüsünde inceleyiniz).

📸 **Ekran Görüntüsü Yolu:** `./ekran-goruntuleri/01-supabase-security.png`

## 4. Öğrendiğim 3 Şey

* **PostgREST + RLS = Güç:** REST API ve DB'nin PostgreSQL RLS üzerinden direkt iletişim kurması, backend'de yetki yönetimi için binlerce satır kod (Bussiness Logic Vulnerabilities) yazma yükünü ortadan kaldırıyor.
* **Encryption by Default:** Modern araçlar artık hassas kolon şifrelemeyi doğrudan DB driver eklentileri (`pgsodium`) seviyesinde hallediyor.
* **Geniş Saldırı Yüzeyi:** Supabase gibi mikroservis benzeri mimarilerde, SQL injection'ı çözmek tek başına yetmiyor, auth (GoTrue) servisinin rate-limit ayarları, storage'ın path-traversal açığı olmaması gibi holistik bir güvenlik bakışı şart.
