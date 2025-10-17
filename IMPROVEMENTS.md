# Improvement Suggestions — Portfolio MCP

Date: 2025-10-16

Bu dosya, müşteri kazanımı, güven ve dönüşüm odaklı önerileri, her bir önerinin neden faydalı olduğu, hızlı uygulanabilir adımları ve kabul kriterlerini içerir. Yarın bunlardan başlayarak adım adım uygulayacağız.

---

## 1) Vaka Çalışmaları (Case Studies)
- Neden: Potansiyel müşterilere iş sonuçlarınızı somut verilerle gösterir; güven oluşturur.
- Hızlı kazanç (2–4 saat): 2 adet vaka çalışması oluşturun; her biri: "Problem -> Yaklaşım -> Sonuç" formatında, 1–3 görsel ile.
- Uygulama notu:
  - `public/case-studies.html` sayfası veya anasayfada bir bölüm.
  - Her vaka için küçük bir grafik/screenshot ve 1-2 KPI (dönüşüm artışı, hız, maliyet tasarrufu).
- Kabul kriteri:
  - Her vaka en az bir ölçülebilir metrik içerir.
  - Vaka sayfalarından bir "İletişim/teklif iste" CTA'sı mevcuttur.

## 2) Müşteri Referansları ve Video Testimonial
- Neden: Sosyal kanıt, satın alma kararını hızlandırır.
- Hızlı kazanç (1–2 saat): 2-3 kısa alıntı ekleyin; tercihen profil ve link ile.
- Uygulama notu:
  - Anasayfaya küçük "Referanslar" bölümü.
  - Video varsa embed (YouTube/Vimeo). Yoksa metin + küçük avatar.
- Kabul kriteri:
  - En az 2 referans görünür.

## 3) Öne Çıkan İşler için Before/After Slider
- Neden: Görsel fark en hızlı ikna edendir.
- Hızlı kazanç (2–4 saat): 2 adet before/after slider ekleyin (CSS/JS). Mobil uyumlu olsun.
- Uygulama notu:
  - Basit CSS slider veya tiny JS lib (ör. no-dep) kullanın.
- Kabul kriteri:
  - Desktop & Mobile’da düzgün çalışmalı.

## 4) KPI Kartları (performans, dönüşüm, teslim süresi)
- Neden: Kısa ve güven verici; ziyaretçinin dikkatini çeker.
- Hızlı kazanç (1 saat): 3–4 KPI kutusu anasayfada.
- Uygulama notu:
  - `public/index.html` ana bölümüne ekleyin; ikon + sayı + kısa açıklama.
- Kabul kriteri:
  - Tüm KPI’ların kaynakları/bağlamı sağlanmalı (örn. % artış - 3 aylık proje).

## 5) Hızlı Teklif + Takvim (Calendly veya form)
- Neden: İletişim sürecini kısaltır ve lead dönüşümünü artırır.
- Hızlı kazanç (1–2 saat): Calendly butonu veya basit modal form ve mailto/`/api/lead` postu.
- Uygulama notu:
  - `index.html`’de CTA -> modal -> form; form backend’e POST eder.
- Kabul kriteri:
  - Form gönderildiğinde lead backend’e ulaşmalı ve onay mesajı görünmeli.

## 6) Fiyatlandırma Paketleri / Örnek Maliyet Aralığı
- Neden: Ziyaretçilerin bütçe ön elemesini yapmasını sağlar.
- Hızlı kazanç (1–3 saat): 3 paket (Basic / Standard / Premium) ekleyin.
- Uygulama notu:
  - Paket açıklamaları, tahmini süre ve starting price verin.
- Kabul kriteri:
  - Paketlerde nelerin dahil olduğu net olmalı.

## 7) Teknik Stack & Sertifikalar
- Neden: Kurumsal müşterilerin teknik uygunluğunu anlaması için faydalı.
- Hızlı kazanç (30dk): Footer veya Hakkında bölümüne stack ikonları ekleyin.

## 8) Canlı Demo / Prototype Embed
- Neden: "Göster" yaklaşımı, ikna edicidir.
- Uygulama notu:
  - CodeSandbox veya Netlify demo embed linki koyun.

## 9) Güvenlik & GDPR/KVKK Kısa Beyanı
- Neden: Kurumsal ve kişisel veri işleyen müşteriler için kritik.
- Hızlı kazanç (30–60dk): Footer’da kısa madde + ayrıntılı PDF sayfası.

## 10) Tiny UX Polishing (CTA, Hero, Microcopy)
- Neden: Küçük metin değişimleri dönüşümü artırır.
- Hızlı kazanç:
  - Net single-sentence hero.
  - Birincil CTA ("Teklif Al") + ikincil CTA ("Örnek İşler").

### Tiny UX Polishing — Uygulama Planı (Kısa To‑Do)

Aşağıdaki 8 maddelik hızlı uygulama listesini hazırladım; her madde kısa kabul kriteri içerir. Bu listeyi proje takviminde takip edebilirsiniz.

- 1) Hero & CTA Audit
  - İnceleme: `public/index.html`, `public/styles.css`, `public/app.js` — Copy, görünürlük, sıra, kontrast, mobil.
  - Kabul: 5 somut iyileştirme önerisi (satır/ref ile) ve mobil screenshot notu.

- 2) Hero Copy + CTA Varyantları
  - Üret: 2–3 tek cümlelik hero alternatifi + 2 CTA (birincil/ikincil) — Türkçe ve İngilizce.
  - Kabul: 3 copy seçeneği dosyada kaydedilmiş.

- 3) Microcopy Sweep (Formlar & Butonlar)
  - Yapılacak: Form etiketleri, placeholderlar, button metinleri, success/error mesajları sadeleştirilecek.
  - Kabul: Tüm formlar net etikete, inline validasyona ve dostça success mesajına sahip.

- 4) Accessibility & Contrast Check
  - Yapılacak: Kontrast, alt-attributeler, keyboard focus, aria-label kontrolleri.
  - Kabul: Lighthouse accessibility >= 90 veya belgeleyerek muafiyet.

- 5) Mobile Spacing ve Touch Targets
  - Yapılacak: Boşluklar, font-boyutları ve buton hedefleri (min 44x44px) optimize edilecek.
  - Kabul: Mobilde overflow yok, butonlar kolay erişilebilir.

- 6) Form UX: Loading, Hata & Başarı
  - Yapılacak: Submit sırasında loading, submit disable, inline hata gösterimi, success toast.
  - Kabul: Double-submit engellenmiş, başarılı gönderimde görünür onay ve `/api/lead` POST tetiklenmiş.

- 7) İnce Dokunuşlar: Micro‑Animasyonlar & Focus States
  - Yapılacak: 100–200ms hafif hover/focus animasyonları, prefers-reduced-motion desteği.
  - Kabul: Animasyonlar sade ve erişilebilir.

- 8) Instrumentation & Basit A/B Test Planı
  - Yapılacak: CTA tıklamaları ve form submitleri izlenecek; 1 haftalık A/B testi hipotezi hazırlanacak.
  - Kabul: Analitik eventleri mevcut ve test hipotezi belgelenmiş.

---

### Uygulama Önceliği (ilk 3)
1. Vaka Çalışmaları + Referanslar
2. Hızlı Teklif + Takvim
3. Before/After demo + KPI kartları

---

### Next steps (quick wins)
- Yarın: Ben 1) Vaka çalışmaları şablonunu (HTML + CSS) oluştururum, 2) Anasayfaya küçük "Referanslar" bölümü eklerim, 3) Hızlı teklif modalı (Calendly butonu veya form) eklerim.
- Lütfen paylaşmak istediğiniz 2 vaka çalışması için kısa metin ve görsel verin (varsa). Ayrıca kullanacağımız e-posta adresini onaylayın.


