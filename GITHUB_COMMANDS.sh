#!/bin/bash
# GitHub'a Push Komutları
# KULLANICI_ADINIZ'ı kendi GitHub username'iniz ile değiştirin

echo "🚀 GitHub'a Push Başlıyor..."
echo ""

# Remote ekle (sadece ilk kez)
echo "📡 Remote bağlantısı ekleniyor..."
git remote add origin https://github.com/KULLANICI_ADINIZ/portfolio-mcp.git

# Branch main olarak ayarla
echo "🌿 Branch main olarak ayarlanıyor..."
git branch -M main

# GitHub'a push et
echo "⬆️  GitHub'a push ediliyor..."
git push -u origin main

echo ""
echo "✅ Tamamlandı!"
echo ""
echo "📝 Sonraki adım:"
echo "   GitHub'da Settings > Secrets > Actions'a gidin"
echo "   OPENAI_API_KEY secret'ını ekleyin"
echo ""
echo "🌐 Sonra Vercel'e deploy edin:"
echo "   https://vercel.com"
