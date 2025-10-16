# Interactive Portfolio

AI destekli, mobil-first, uyarlanabilir portföy şablonu. OpenAI ile entegre chatbot asistanı ile ziyaretçilerinizle etkileşim kurun ve lead toplama sistemi ile potansiyel müşterilerinizi yakalayın.

## 🚀 Özellikler

- **Mobil-First Tasarım**: 360-430px genişlikte optimize edilmiş arayüz
- **AI Chatbot**: OpenAI GPT-5-mini ile akıllı asistan
- **Lead Toplama**: Function calling ile otomatik lead oluşturma
- **Uyarlanabilir İçerik**: YAML/JSON konfigürasyon dosyaları
- **Çok Dilli Destek**: TR/EN/DE dil desteği
- **Güvenlik**: Rate limiting, input validation, CORS koruması
- **Responsive**: Dark/Light tema desteği
- **Modern Stack**: Node.js + TypeScript + Express

## 📁 Proje Yapısı

```
interactive-portfolio/
├── public/                 # Frontend dosyaları
│   ├── index.html         # Ana HTML sayfası
│   ├── styles.css         # CSS stilleri
│   └── app.js            # Frontend JavaScript
├── server/               # Backend TypeScript dosyaları
│   ├── index.ts          # Ana server dosyası
│   ├── router.ts         # API rotaları
│   ├── openai.ts         # OpenAI entegrasyonu
│   ├── guards.ts         # Güvenlik kontrolleri
│   ├── lead.ts           # Lead yönetimi
│   ├── config.ts         # Konfigürasyon yükleme
│   └── schema.ts         # TypeScript tipleri
├── data/                 # İçerik dosyaları
│   ├── profile.yaml      # Profil bilgileri
│   └── faq.md           # Sık sorulan sorular
├── config/              # Konfigürasyon dosyaları
│   ├── prompts.json     # Önerilen komutlar
│   └── theme.json       # Tema ayarları
├── package.json         # NPM bağımlılıkları
├── tsconfig.json        # TypeScript konfigürasyonu
└── env.example          # Çevre değişkenleri örneği
```

## 🛠️ Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Çevre Değişkenlerini Ayarlayın

```bash
cp env.example .env
```

`.env` dosyasını düzenleyin:

```env
# Zorunlu
OPENAI_API_KEY=sk-your-openai-api-key-here

# E-posta bildirimleri için (opsiyonel)
LEAD_MAIL_TO=info@example.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Webhook için (opsiyonel)
LEAD_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/your-webhook-url
```

### 3. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## 📝 Konfigürasyon

### Profil Bilgileri (`data/profile.yaml`)

```yaml
name: "Adınız Soyadınız"
title: "Meslek Unvanınız"
location: "Şehir, Ülke"
languages: ["tr", "en", "de"]
services:
  - name: "Hizmet Adı"
    description: "Hizmet açıklaması"
work_hours: "Hafta içi 10:00–18:00 CET"
min_budget_eur: 800
allowed_topics:
  - "hizmet"
  - "ücret"
  - "randevu"
```

### Önerilen Komutlar (`config/prompts.json`)

```json
[
  "Hangi hizmetleri veriyorsun?",
  "Bütçem ~1500€ — neler yapabiliriz?",
  "Randevu için uygun olduğun saatler?"
]
```

### Tema Ayarları (`config/theme.json`)

```json
{
  "colors": {
    "accent-color": "#3b82f6",
    "success-color": "#10b981"
  }
}
```

## 🚀 Dağıtım

### Vercel (Önerilen)

1. Vercel CLI'yi yükleyin:
```bash
npm i -g vercel
```

2. Projeyi dağıtın:
```bash
vercel
```

3. Çevre değişkenlerini Vercel dashboard'dan ekleyin.

### Hostinger veya Diğer Node.js Hosting

1. Projeyi build edin:
```bash
npm run build
```

2. `dist/` klasörünü ve `public/` klasörünü sunucuya yükleyin.

3. Çevre değişkenlerini sunucuda ayarlayın.

4. PM2 ile çalıştırın:
```bash
pm2 start dist/index.js --name "interactive-portfolio"
```

## 🔧 API Endpoints

### `GET /api/bootstrap`
Uygulama başlangıç verilerini döndürür.

### `POST /api/ask`
Chatbot ile etkileşim kurar.

```json
{
  "text": "Mesajınız",
  "lang": "tr",
  "model": "gpt-5-mini"
}
```

### `POST /api/lead`
Lead oluşturur.

```json
{
  "name": "Ad Soyad",
  "email": "email@example.com",
  "topic": "Konu",
  "message": "Mesaj"
}
```

### `GET /api/health`
Sağlık kontrolü.

## 🔒 Güvenlik

- **Rate Limiting**: IP başına 30 istek/10 dakika
- **Input Validation**: Tüm girişler doğrulanır ve sanitize edilir
- **CORS**: Sadece izin verilen domainlerden erişim
- **Helmet**: HTTP güvenlik başlıkları
- **PII Protection**: Kişisel bilgi sızıntısına karşı koruma

## 📱 Mobil Optimizasyon

- **Viewport**: Meta viewport ile mobil uyumlu
- **Touch**: Touch-friendly butonlar ve etkileşimler
- **Safe Area**: iOS safe area desteği
- **Responsive**: 360-430px genişlik optimizasyonu
- **Performance**: Hızlı yükleme ve smooth animasyonlar

## 🌐 Çok Dilli Destek

Uygulama otomatik olarak kullanıcının dilini algılar ve yanıtları o desteklenen dillerde verir:
- Türkçe (TR)
- İngilizce (EN) 
- Almanca (DE)

## 🔄 Lead Yönetimi

### E-posta Bildirimleri
Lead oluşturulduğunda otomatik e-posta gönderilir:
- HTML formatında detaylı bilgi
- Teknik bilgiler (IP, tarih)
- Güvenli SMTP konfigürasyonu

### Webhook Entegrasyonu
Google Sheets, Zapier veya diğer servislere JSON POST:
```json
{
  "type": "lead",
  "data": {
    "name": "Ad Soyad",
    "email": "email@example.com",
    "topic": "Konu",
    "timestamp": "2024-01-01T10:00:00.000Z"
  }
}
```

## 🛠️ Geliştirme

### Kod Yapısı
- **TypeScript**: Tip güvenliği
- **Modüler**: Ayrılmış sorumluluklar
- **Error Handling**: Kapsamlı hata yönetimi
- **Logging**: Detaylı log kayıtları

### Test Etme
```bash
# Geliştirme modunda çalıştır
npm run dev

# Build test et
npm run build

# Health check
curl http://localhost:3000/api/health
```

## 📋 Kabul Kriterleri

✅ Mobilde 360-430px genişlikte sorunsuz çalışır  
✅ Sticky composer ve kaydırılabilir chip'ler  
✅ GET /api/bootstrap UI'yı doldurur  
✅ POST /api/ask OpenAI yanıtı döndürür  
✅ Kapsam dışı soru uyarısı verir  
✅ Lead oluşturma tool call çalışır  
✅ Konfigürasyon dosyaları 5dk cache ile yenilenir  
✅ Tip güvenliği ve güvenlik kontrolleri  
✅ Tek komutla çalışır: `npm install && npm run dev`  

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🆘 Destek

Sorularınız için:
- GitHub Issues kullanın
- E-posta: info@kayacuneyt.com
- Dokümantasyon: Bu README dosyası

---

**Interactive Portfolio** - AI destekli, modern portföy çözümü 🚀