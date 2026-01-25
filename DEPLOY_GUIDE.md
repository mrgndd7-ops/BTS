# Vercel Deploy Guide

## Hızlı Deploy (5 dakika)

1. **GitHub'a push et:**
   ```bash
   git add .
   git commit -m "feat: GPS tracking and personnel management"
   git push origin main
   ```

2. **Vercel'e git:** https://vercel.com
   - GitHub ile giriş yap
   - "Import Project" → GitHub repo seç
   - "Deploy" tıkla

3. **Environment Variables ekle:**
   - Vercel Dashboard → Settings → Environment Variables
   - `.env.local` dosyasındaki tüm değişkenleri ekle:
     ```
     NEXT_PUBLIC_SUPABASE_URL=...
     NEXT_PUBLIC_SUPABASE_ANON_KEY=...
     SUPABASE_SERVICE_ROLE_KEY=...
     NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
     ```

4. **Deploy tamamlandı!**
   - `https://bts-belediye.vercel.app` gibi bir URL alacaksın
   - iPhone'dan bu URL'yi aç → HTTPS olduğu için GPS izni çalışır!

## Alternatif: Netlify

Aynı şekilde çalışır, sadece platform farklı.

## Local Test İçin HTTPS (Geçici)

Eğer local'de test etmek istersen:

```bash
# Terminal 1 - Next.js dev server
npm run dev

# Terminal 2 - HTTPS proxy
npx local-ssl-proxy --source 3001 --target 3000

# Artık: https://localhost:3001 HTTPS'li!
```

## iPhone Test

1. **Production:** `https://your-app.vercel.app` aç
2. **GPS izni:** Safari otomatik soracak
3. **PWA:** Paylaş → Ana Ekrana Ekle → Native app gibi çalışır!
