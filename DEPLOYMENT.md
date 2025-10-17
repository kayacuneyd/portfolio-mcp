# Deployment Guide - GitHub & Vercel

## 🚀 GitHub'a Yükleme

### 1. Git Repository Oluşturun

```bash
# Git başlat
git init

# Dosyaları ekle
git add .

# İlk commit
git commit -m "Initial commit: Interactive Portfolio with AI chatbot"

# GitHub'da yeni bir repository oluşturun (portfolio-mcp)
# Sonra local'den remote'a bağlayın
git remote add origin https://github.com/KULLANICI_ADINIZ/portfolio-mcp.git
git branch -M main
git push -u origin main
```

### 2. GitHub Secrets Ekleyin

GitHub repository'nize gidin:
1. **Settings** > **Secrets and variables** > **Actions**
2. **New repository secret** butonuna tıklayın
3. Aşağıdaki secrets'ları ekleyin:

#### Gerekli Secrets:

**`OPENAI_API_KEY`**
```
sk-your-actual-openai-api-key-here
```

**E-posta için (opsiyonel):**
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `LEAD_MAIL_TO`

**Webhook için (opsiyonel):**
- `LEAD_WEBHOOK_URL`

## ☁️ Railway'e Deploy

### Railway CLI ile

```bash
# Railway CLI yükle
npm i -g @railway/cli

# Login
railway login

# Projeyi bağla (mevcut projeyi seç veya yeni oluştur)
railway link

# Build ve deploy
railway up
```

### Gerekli Ayarlar
- Environment Variables: `.env`'deki değerleri Railway Proje Ayarları > Variables bölümüne ekleyin.
- Start Command: `package.json`'daki `railway:start` komutunu kullanın veya "Start Command" alanına `npm run railway:start` yazın.
- Health Check: `railway.json` dosyasındaki `healthcheckPath` `/health` olarak ayarlı.

## 🔒 Güvenlik Kontrol Listesi

- [ ] `.env` dosyası `.gitignore`'da
- [ ] Tüm API keys GitHub Secrets'ta
- [ ] Production'da `NODE_ENV=production`
- [ ] CORS ayarları production domain için yapıldı
- [ ] Rate limiting aktif

## 📝 Environment Variables (Production)

### Zorunlu:
```env
OPENAI_API_KEY=sk-...
MODEL_DEFAULT=gpt-5-mini
NODE_ENV=production
```

### Opsiyonel:
```env
# E-posta
LEAD_MAIL_TO=info@example.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=user@gmail.com
SMTP_PASS=app-password

# Webhook
LEAD_WEBHOOK_URL=https://hooks.zapier.com/...

# Frontend
FRONTEND_URL=https://yourdomain.com
```

## 🌐 Custom Domain (Railway)

1. Railway Project > **Settings** > **Domains**
2. Domain ekleyin ve verilen DNS kayıtlarını sağlayıcınıza tanımlayın

## 📱 Test Etme

Deploy sonrası:
```bash
# Health check
curl https://your-domain.com/api/health

# Bootstrap check
curl https://your-domain.com/api/bootstrap
```

## 🔄 Güncelleme

```bash
# Değişiklikleri commit et
git add .
git commit -m "Update: feature description"

# GitHub'a push
git push origin main

# Vercel otomatik deploy edecek (GitHub Actions ile)
```

## ⚡ Performans İpuçları

1. **CDN**: Vercel otomatik CDN kullanır
2. **Caching**: API responses 5 dakika cache'lenir
3. **Compression**: Gzip/Brotli otomatik
4. **SSL**: Otomatik HTTPS

## 🆘 Sorun Giderme

### Deploy Hataları:
```bash
# Vercel logs
vercel logs

# Build test (local)
npm run build
npm start
```

### Environment Variables Eksik:
- Vercel Dashboard > Project > Settings > Environment Variables
- Her değişiklikten sonra **Redeploy** gerekli

### Domain Bağlanmıyor:
- DNS propagation 24-48 saat sürebilir
- `dig yourdomain.com` ile kontrol edin

---

**Başarılar!** 🎉

Her sorunuzda: [Vercel Docs](https://vercel.com/docs) | [GitHub Actions Docs](https://docs.github.com/actions)

