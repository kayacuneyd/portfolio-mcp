# GitHub Setup - Adım Adım Rehber

## ✅ Local Commit Tamamlandı!

Git repository başlatıldı ve tüm dosyalar commit edildi.

## 📝 Sıradaki Adımlar

### 1. GitHub'da Yeni Repository Oluşturun

1. **GitHub'a gidin:** https://github.com/new
2. **Repository ayarları:**
   - **Repository name:** `portfolio-mcp` (veya istediğiniz isim)
   - **Description:** "AI-powered interactive portfolio with chatbot"
   - **Public** veya **Private** seçin
   - ⚠️ **README, .gitignore veya license EKLEMEYIN** (zaten var)
3. **Create repository** tıklayın

### 2. Remote Bağlantısını Kurun

GitHub repo oluşturduktan sonra, aşağıdaki komutları terminalinizde çalıştırın:

```bash
# GitHub username'inizi buraya yazın
git remote add origin https://github.com/KULLANICI_ADINIZ/portfolio-mcp.git

# Branch adını main olarak ayarla
git branch -M main

# GitHub'a push et
git push -u origin main
```

**Örnek (sizin username'iniz):**
```bash
git remote add origin https://github.com/kayacuneyt/portfolio-mcp.git
git branch -M main
git push -u origin main
```

### 3. GitHub Secrets Ekleyin (Zorunlu!)

Repository'niz GitHub'a yüklendikten sonra:

1. **GitHub repo sayfasına gidin**
2. **Settings** > **Secrets and variables** > **Actions** tıklayın
3. **New repository secret** butonuna tıklayın

#### Eklenecek Secrets:

##### ⚠️ ZORUNLU SECRET:

**Secret name:** `OPENAI_API_KEY`  
**Value:** `sk-proj-your-actual-openai-api-key-here`

---

##### 📧 E-POSTA SECRETLERİ (Opsiyonel):

Lead bildirimleri için e-posta göndermek istiyorsanız:

**1. LEAD_MAIL_TO**  
**Value:** `info@kayacuneyt.com`

**2. SMTP_HOST**  
**Value:** `smtp.gmail.com` (Gmail kullanıyorsanız)

**3. SMTP_PORT**  
**Value:** `587`

**4. SMTP_USER**  
**Value:** `your-email@gmail.com`

**5. SMTP_PASS**  
**Value:** `your-gmail-app-password` (Gmail App Password - normal şifre değil!)

> 📌 **Gmail App Password Nasıl Alınır:**
> 1. Google Account > Security
> 2. 2-Step Verification aktif olmalı
> 3. App passwords > Select app: Mail
> 4. Generate edip 16 haneli kodu kullanın

---

##### 🔗 WEBHOOK SECRET (Opsiyonel):

Google Sheets veya Zapier gibi servislere lead göndermek için:

**Secret name:** `LEAD_WEBHOOK_URL`  
**Value:** `https://hooks.zapier.com/hooks/catch/your-webhook-url`

---

### 4. Vercel'e Deploy Edin

#### Yöntem A: Vercel Dashboard (Kolay)

1. **https://vercel.com** adresine gidin
2. **Import Project** tıklayın
3. GitHub repository'nizi seçin: `portfolio-mcp`
4. **Environment Variables** ekleyin:
   - `OPENAI_API_KEY`: OpenAI key'iniz
   - `MODEL_DEFAULT`: `gpt-4o-mini`
   - `NODE_ENV`: `production`
   - (Opsiyonel) E-posta ayarları
5. **Deploy** tıklayın
6. 2-3 dakika içinde yayında!

#### Yöntem B: Vercel CLI

```bash
# Vercel CLI yükle (ilk kez kullanıyorsanız)
npm i -g vercel

# Login
vercel login

# Production deploy
vercel --prod
```

---

### 5. GitHub Actions ile Otomatik Deploy (Opsiyonel)

Her `main` branch'e push'da otomatik deploy için:

1. **Vercel Token alın:**
   - Vercel Dashboard > Settings > Tokens
   - Create Token > Kopyalayın

2. **GitHub Secrets'a ekleyin:**
   - `VERCEL_TOKEN`: Vercel token'ınız
   - `VERCEL_ORG_ID`: Vercel org ID
   - `VERCEL_PROJECT_ID`: Project ID

> Org ID ve Project ID bulmak için:
> ```bash
> vercel link
> cat .vercel/project.json
> ```

---

## 🔍 Kontrol Listesi

- [ ] GitHub'da repo oluşturdunuz
- [ ] Local'den GitHub'a push ettiniz
- [ ] `OPENAI_API_KEY` secret'ını eklediniz
- [ ] (Opsiyonel) E-posta secrets eklediniz
- [ ] Vercel'e deploy ettiniz
- [ ] Deployment çalışıyor mu test ettiniz

---

## 🧪 Test Etme

Deploy sonrası:

```bash
# Health check
curl https://your-vercel-domain.vercel.app/api/health

# Bootstrap
curl https://your-vercel-domain.vercel.app/api/bootstrap
```

Tarayıcıda: `https://your-vercel-domain.vercel.app`

---

## ❓ Sorun mu Var?

### "Permission denied" hatası:
```bash
# SSH key ekleyin veya HTTPS kullanın
git remote set-url origin https://github.com/USERNAME/portfolio-mcp.git
```

### "Repository not found" hatası:
- GitHub'da repo'yu public olarak oluşturdunuz mu?
- Username doğru mu?

### Vercel deployment hatası:
- Environment variables eklediniz mi?
- `OPENAI_API_KEY` doğru mu?

---

## 🎉 Başarılar!

Deployment tamamlandığında:
- Siteniz `https://portfolio-mcp.vercel.app` gibi bir adreste yayında
- Custom domain bağlayabilirsiniz (Vercel Dashboard > Domains)
- Her push otomatik deploy olur (GitHub Actions ile)

---

**İhtiyacınız olursa:**
- DEPLOYMENT.md - Detaylı deployment rehberi
- README.md - Genel dokümantasyon
- SETUP_NOTES.md - Kurulum notları

