# ⚡ VERCEL 404 SORUNU - HIZLI ÇÖZÜM

## 🎯 Sorun
`/api/gps` endpoint'i 404 veriyor çünkü:
1. En son commit Vercel'de deploy edilmemiş VEYA
2. Environment variables eksik

## ✅ ÇÖZÜM - 3 ADIM

### ADIM 1: Vercel Dashboard'a Git
https://vercel.com/dashboard

### ADIM 2: Environment Variables Ekle (ÖNEMLİ!)

1. BTS projesini aç
2. **Settings** → **Environment Variables**
3. Şu 3 variable'ı ekle:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://aulbsjlrumyekbuvxghx.supabase.co
Environment: Production, Preview, Development (HEPSİNİ SEÇ)
```

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY  
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1bGJzamxydW15ZWtidXZ4Z2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1NDU3MzksImV4cCI6MjA1MzEyMTczOX0.yKSnoPWsuBkGuJXA4v03xA_fv8bvjK8zQ-Nkfji6kV8
Environment: Production, Preview, Development (HEPSİNİ SEÇ)
```

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1bGJzamxydW15ZWtidXZ4Z2h4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzU0NTczOSwiZXhwIjoyMDUzMTIxNzM5fQ.1TA9RGQM9xMceIInTtIi4g_c6JJaGtozGI6p8dWaWo4
Environment: Production, Preview, Development (HEPSİNİ SEÇ)
```

4. **Save** tıkla

### ADIM 3: Redeploy Yap

1. **Deployments** sekmesine git
2. En üstteki deployment'ı bul
3. Sağ tarafta **⋯** (üç nokta) → **Redeploy**
4. **Redeploy** confirm et

## ⏳ Bekleme (1-2 dakika)

Deployment durumu:
- Building... → Bekle
- Ready ✓ → TEST ET!

## 🧪 TEST

Bu linki aç:
```
https://bts-lemon.vercel.app/api/gps?id=test&lat=41&lon=28&timestamp=1738152000000
```

**Başarılı:**
```json
{"success":true,"location_id":"...","user_mapped":false}
```

**Hala 404:** 
- Redeploy tamamlandı mı kontrol et
- Variables kayıtlı mı kontrol et
- Hard refresh yap (Ctrl+Shift+R)

## 🎯 Traccar Client Ayarları

Başarılı olduktan sonra:
```
Server URL: https://bts-lemon.vercel.app/api/gps
Device ID: test001
```
