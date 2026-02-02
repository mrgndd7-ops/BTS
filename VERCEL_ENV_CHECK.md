# ⚙️ Vercel Environment Variables - Kontrol Listesi

## 🚨 DEPLOY ÖNCESI ZORUNLU KONTROL

**Bu adımları tamamlamadan deploy YAPMA!**

---

## 📋 Gerekli Environment Variables

### 1. Supabase (✅ Zaten var)

```
NEXT_PUBLIC_SUPABASE_URL=https://aulbsjlrumyekbuvxghx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Radar.io (⚠️ KONTROL ET!)

```
NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY=prj_test_pk_2b44c47c6bf114b0c636ff7792263b00574348b1
```

---

## 🔍 Vercel'de Kontrol Et

### Adım 1: Vercel Dashboard

1. https://vercel.com/dashboard aç
2. **BTS** projesini seç
3. Üst menüden **Settings** sekmesi
4. Sol menüden **Environment Variables**

### Adım 2: Radar.io Key'i Kontrol Et

Aşağıdaki değişken **VARSA** ✅, **YOKSA** ❌:

```
Name: NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY
Value: prj_test_pk_2b44c47c6bf114b0c636ff7792263b00574348b1
```

**Environments:**
- ✅ Production
- ✅ Preview
- ✅ Development

---

## ➕ Yoksa Nasıl Eklenir?

### Adım 1: Add New Variable

1. **Environment Variables** sayfasında
2. Sağ üstte **"Add New"** butonuna tıkla

### Adım 2: Bilgileri Gir

**Key:**
```
NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY
```

**Value:**
```
prj_test_pk_2b44c47c6bf114b0c636ff7792263b00574348b1
```

**Environments:** (HEPSİNİ SEÇ ✅)
- [x] Production
- [x] Preview
- [x] Development

### Adım 3: Save

- **Save** butonuna tıkla

---

## 🔄 Redeploy Gerekli Mi?

**EVET!** Environment variable ekledikten sonra:

1. **Deployments** sekmesine git
2. **En son deployment'ı bul**
3. Sağdaki **3 nokta** menüsüne tıkla
4. **"Redeploy"** seç
5. **"Redeploy"** butonuna tekrar tıkla (confirm)

**Süre:** ~1-2 dakika

---

## ✅ Doğrulama

Deploy tamamlandıktan sonra:

1. **Uygulamayı aç** (production URL)
2. **F12** → Console
3. **Worker panelde "Başlat"** butonuna tıkla
4. **Beklenen log:**
   ```
   Radar.io SDK basariyla initialize edildi
   ```

5. **HATA GÖRÜRSEN:**
   ```
   NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY environment variable bulunamadi!
   ```
   → Environment variable eklemedin veya redeploy yapmadın!

---

## 📸 Ekran Görüntüsü Örneği

**Vercel Environment Variables sayfası şöyle görünmeli:**

```
┌─────────────────────────────────────────────────────┐
│ Environment Variables                               │
├─────────────────────────────────────────────────────┤
│ NEXT_PUBLIC_SUPABASE_URL                           │
│ Value: https://aulbsjlrumyekbuvxghx.supabase.co   │
│ Environments: Production, Preview, Development      │
├─────────────────────────────────────────────────────┤
│ NEXT_PUBLIC_SUPABASE_ANON_KEY                      │
│ Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...     │
│ Environments: Production, Preview, Development      │
├─────────────────────────────────────────────────────┤
│ NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY                  │ ← BU OLMALI!
│ Value: prj_test_pk_2b44c47c6bf114b0c636ff7...      │
│ Environments: Production, Preview, Development      │
├─────────────────────────────────────────────────────┤
│ SUPABASE_SERVICE_ROLE_KEY                          │
│ Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...     │
│ Environments: Production, Preview, Development      │
└─────────────────────────────────────────────────────┘
```

---

## 🚨 Sık Yapılan Hatalar

### Hata 1: Sadece Production'a ekleme
❌ Sadece Production seçili
✅ Production + Preview + Development hepsi seçili olmalı

### Hata 2: Redeploy yapmama
❌ Environment variable ekledim ama redeploy yapmadım
✅ Ekledikten sonra MUTLAKA redeploy yap

### Hata 3: Yanlış key ismi
❌ `RADAR_PUBLISHABLE_KEY` (NEXT_PUBLIC_ prefix yok)
❌ `NEXT_PUBLIC_RADAR_KEY` (yanlış isim)
✅ `NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY` (DOĞRU!)

### Hata 4: Yanlış key value
❌ `prj_live_pk_...` (production key, henüz test modundayız)
✅ `prj_test_pk_2b44c47c6bf114b0c636ff7792263b00574348b1` (test key)

---

## 📞 Sorun Yaşarsan

1. **Vercel Environment Variables ekran görüntüsünü paylaş**
2. **Console'daki hata mesajını paylaş**
3. **Deployment log'larını kontrol et:**
   - Vercel Dashboard → Deployments
   - En son deployment'a tıkla
   - "Building" log'larını oku
   - Hata var mı kontrol et

---

**Hazır olduğunda bana "Vercel env check tamam" yaz, deploy edelim!** 🚀
