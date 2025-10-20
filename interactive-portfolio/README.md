### Interactive Portfolio (AI destekli, mobil-first)

- **Amaç**: Tek sayfalık AI portföy asistanı. Mobil-öncelikli, minimalist tasarım. Meslek/kişi bazlı içerik ve ayarlar config dosyalarından.
- **Stack**: Vanilla HTML/CSS/JS (frontend) + Node.js/Express (TypeScript) backend. OpenAI `gpt-4o-mini` varsayılan.

### Kurulum

1) Depoyu klonla veya klasöre geç:
```bash
cd interactive-portfolio
cp .env.example .env
# .env içindeki OPENAI_API_KEY ve mail ayarlarını doldurun
```

2) Bağımlılıklar:
```bash
npm install
```

3) Geliştirme:
```bash
npm run dev
# http://localhost:3000
```

4) Prod build ve çalıştırma:
```bash
npm run build
npm start
```

### .env
- `OPENAI_API_KEY`: Sunucunun OpenAI anahtarı (FRONTEND'E KOYMAYIN).
- `LEAD_MAIL_TO`: Lead iletilecek e-posta.
- `SMTP_*`: Nodemailer SMTP bilgileri.
- `LEAD_WEBHOOK_URL`: (Opsiyonel) Google Sheet / webhook.
- `MODEL_DEFAULT`: `gpt-4o-mini` veya `gpt-4o`.

### API
- `GET /api/health` — sağlık kontrolü
- `GET /api/bootstrap` — `{ profile, prompts, theme }`
- `POST /api/ask` — `{ text, lang?, model? }` → `{ text, leadRequested? }`

### Güvenlik
- API anahtarını asla frontende koymayın.
- IP başına 30 req/10 dk rate-limit.
- Minimal küfür/PII filtresi.
- Loglarda PII maskeleyin.

### Dağıtım Notları
- Vercel: Node.js Serverless için `server/index.ts` Express handler’ı ayrıştırmak gerekebilir; bu repo Node server olarak uygundur. Node destekli barındırmalarda (Hostinger, Render, Railway) doğrudan çalışır.
- Statik dosyalar `public/` klasöründen servis edilir.

### Dosya Yapısı
```
public/ (index.html, styles.css, app.js, logo.svg)
server/ (index.ts, router.ts, openai.ts, guards.ts, lead.ts, schema.ts, config.ts)
data/ (profile.yaml, faq.md)
config/ (prompts.json, theme.json)
```

### Notlar
- Çok dilli yanıt: Kullanıcı hangi dilde yazdıysa o dilde cevaplanır.
- Uzun yanıtlar için "Devamını göster" bağlantısı oluşturulur.
- `faq.md` ileride RAG için paragraflara bölünebilir.
