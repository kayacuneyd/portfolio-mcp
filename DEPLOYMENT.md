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

## ☁️ Vercel'e Deploy

### Yöntem 1: Vercel CLI (Hızlı)

```bash
# Vercel CLI yükle
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deploy
vercel --prod
```

### Yöntem 2: Vercel Dashboard (Tavsiye edilen)

1. [vercel.com](https://vercel.com) 'a gidin
2. **Import Project** tıklayın
3. GitHub repository'nizi seçin
4. **Environment Variables** ekleyin:
   - `OPENAI_API_KEY`: OpenAI API key'iniz
   - `MODEL_DEFAULT`: `gpt-4o-mini`
   - `NODE_ENV`: `production`
   - (Opsiyonel) E-posta ayarları

5. **Deploy** tıklayın

### Yöntem 3: GitHub Actions ile Otomatik Deploy

#### Vercel Token Alın:
1. Vercel Dashboard > **Settings** > **Tokens**
2. **Create Token** 
3. Token'ı kopyalayın

#### GitHub'da Vercel Secrets Ekleyin:
```
VERCEL_TOKEN: <your-vercel-token>
VERCEL_ORG_ID: <your-org-id>
VERCEL_PROJECT_ID: <your-project-id>
```

**Org ID ve Project ID'yi bulmak için:**
```bash
vercel link
cat .vercel/project.json
```

#### Her Push'da Otomatik Deploy:
`.github/workflows/deploy.yml` dosyası hazır! Her `main` branch'e push'da otomatik deploy olacak.

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
MODEL_DEFAULT=gpt-4o-mini
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

## 🌐 Custom Domain (Vercel)

1. Vercel Dashboard > **Settings** > **Domains**
2. Domain adınızı ekleyin
3. DNS kayıtlarını güncelleyin:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

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

