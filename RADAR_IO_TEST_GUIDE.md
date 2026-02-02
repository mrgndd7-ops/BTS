# 🧪 RADAR.IO ENTEGRASYON TEST REHBERİ

## ✅ Kurulum Tamamlandı!

**Yapılanlar:**
- ✅ Radar.io SDK kuruldu (`npm install radar-sdk-js`)
- ✅ Environment variables eklendi (`.env.local`, `.env.production`)
- ✅ `src/lib/radar/client.ts` - SDK initialization service oluşturuldu
- ✅ `src/lib/hooks/use-gps-tracking.ts` - Radar.io entegrasyonu yapıldı
- ✅ Worker dashboard'a GPS tracking UI eklendi
- ✅ Admin live tracking map Realtime ile çalışıyor
- ✅ Linter hatası yok

---

## 🚀 Test Adımları

### 1. Development Server Başlat

```bash
npm run dev
```

Server `http://localhost:3000` adresinde başlayacak.

---

### 2. Worker Olarak Giriş Yap

1. **Login sayfasına git:** `http://localhost:3000/login`
2. **Worker hesabıyla giriş yap:**
   - Email: worker hesabı
   - Password: şifre
3. **Dashboard'a yönlendirileceksin:** `http://localhost:3000/worker`

---

### 3. GPS Tracking Başlat

**Worker Dashboard'da GPS Tracking Card'ını göreceksin:**

```
┌─────────────────────────────────────────────┐
│ 🧭 GPS Konum Takibi                        │
│                                             │
│ Pasif - GPS tracking başlatılmadı          │
│                                    [Başlat] │
└─────────────────────────────────────────────┘
```

**Adımlar:**

1. **"Başlat" butonuna tıkla**
2. **Browser konum izni popup'ı çıkacak:**
   - ✅ "Allow" / "İzin Ver" seç
3. **GPS tracking başlayacak:**
   ```
   ┌─────────────────────────────────────────────┐
   │ 🧭 GPS Konum Takibi              [Aktif]   │
   │                                             │
   │ Aktif - Konumunuz her 10 saniyede          │
   │ güncelleniyor (15m hassasiyet)    [Durdur] │
   └─────────────────────────────────────────────┘
   ```

**Console Log'larda göreceksin:**
```
✅ Radar.io SDK başarıyla initialize edildi
📍 Radar.io ile konum alınıyor...
✅ Konum alındı: { latitude: 41.0082, longitude: 28.9784, ... }
✅ GPS verisi Supabase'e kaydedildi
⏰ Periyodik konum güncellemesi... (her 10s)
```

---

### 4. Supabase'de Veri Kontrolü

**Supabase Dashboard → SQL Editor:**

```sql
-- Son GPS kayıtlarını gör
SELECT 
  id,
  user_id,
  device_id,
  latitude,
  longitude,
  accuracy,
  speed,
  recorded_at,
  created_at
FROM gps_locations
ORDER BY created_at DESC
LIMIT 10;
```

**Beklenen Sonuç:**
- ✅ Her 10 saniyede yeni kayıt ekleniyor
- ✅ `device_id`: `radar-web-{user_id_first_8_chars}`
- ✅ `user_id`: Worker'ın user ID'si
- ✅ `latitude`, `longitude`: Gerçek konumun
- ✅ `accuracy`: ~5-50m arası

---

### 5. Admin Live Tracking Map Test

**Yeni bir tarayıcı penceresi/sekme aç:**

1. **Admin hesabıyla giriş yap:** `http://localhost:3000/login`
2. **Admin dashboard'a git**
3. **Live Tracking sayfasına git** (eğer varsa)
   - VEYA manuel olarak map component'i kullanılan sayfaya git

**Beklenen:**
- ✅ Worker'ın konumu haritada marker olarak görünecek
- ✅ Her 10 saniyede marker güncellenecek (Realtime)
- ✅ Marker'a tıklayınca popup açılacak (isim, son güncelleme, vs.)

---

## 🧪 Test Senaryoları

### Senaryo 1: İlk Konum Alma
```
ADIMLAR:
1. GPS tracking başlat
2. "Allow" seç

BEKLENEN:
✅ 1-2 saniyede ilk konum alınır
✅ Console'da "Konum alındı" mesajı
✅ Supabase'e kayıt yapılır
✅ Badge "Aktif" olur
```

### Senaryo 2: Periyodik Güncelleme
```
ADIMLAR:
1. GPS tracking başlat
2. 30 saniye bekle

BEKLENEN:
✅ Her 10 saniyede console'da "Periyodik konum güncellemesi"
✅ Supabase'de 3 yeni kayıt
✅ Badge hep "Aktif"
```

### Senaryo 3: GPS Durdur
```
ADIMLAR:
1. GPS tracking başlat
2. 20 saniye bekle
3. "Durdur" butonuna tıkla

BEKLENEN:
✅ Console'da "GPS tracking durduruldu"
✅ Badge "Pasif" olur
✅ Yeni kayıt eklenmez
```

### Senaryo 4: Konum İzni Reddet
```
ADIMLAR:
1. GPS tracking başlat
2. "Block" / "Engelle" seç

BEKLENEN:
✅ Error mesajı: "Konum izni reddedildi..."
✅ Badge "Pasif" kalır
✅ Türkçe uyarı mesajı görünür
```

### Senaryo 5: Realtime Map Güncelleme
```
ADIMLAR:
1. Worker'da GPS başlat (Tarayıcı A)
2. Admin'de haritayı aç (Tarayıcı B)
3. Worker'ın hareket etmesini bekle (veya simüle et)

BEKLENEN:
✅ Admin haritada marker görünür
✅ Her 10s marker pozisyonu güncellenir
✅ Popup'ta "Son güncelleme: Şimdi" yazısı görünür
```

---

## 🐛 Troubleshooting

### Hata: "Radar.io SDK yüklenemedi"
**Sebep:** Environment variable eksik veya yanlış

**Çözüm:**
```bash
# .env.local dosyasını kontrol et
cat .env.local

# Şunu görmeli:
NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY=prj_test_pk_2b44c47c6bf114b0c636ff7792263b00574348b1

# Yoksa ekle ve server'ı yeniden başlat:
npm run dev
```

### Hata: "Konum izni reddedildi"
**Sebep:** Browser konum izni verilmemiş

**Çözüm:**
1. Chrome: Adres çubuğunun solundaki kilit ikonu → Site settings → Location → Allow
2. Firefox: Adres çubuğunun solundaki (i) ikonu → Permissions → Location → Allow
3. Sayfayı yenile (F5)
4. Tekrar "Başlat"

### Hata: Supabase'e kayıt yapılmıyor
**Sebep:** RLS policy veya user_id null

**Console Log:**
```
⚠️ User ID yok, konum kaydedilemedi
```

**Çözüm:**
- Worker olarak giriş yaptığından emin ol
- `useAuth()` hook'u user döndürüyor mu kontrol et
- Supabase'de user profile var mı kontrol et

### Hata: Haritada marker görünmüyor
**Sebep:** GPS data yok veya Realtime subscription çalışmıyor

**Kontrol:**
```sql
-- GPS data var mı?
SELECT COUNT(*) FROM gps_locations WHERE user_id IS NOT NULL;

-- Realtime açık mı? (Supabase Dashboard → Database → Replication)
-- gps_locations table için Realtime enabled olmalı
```

---

## 📊 Başarı Kriterleri

Entegrasyon başarılı sayılır eğer:

- ✅ Worker dashboard'da GPS başlatıldığında konum izni alınır
- ✅ Console'da "Radar.io SDK başarıyla initialize edildi" görünür
- ✅ Her 10 saniyede yeni konum alınır ve console'a yazılır
- ✅ Supabase gps_locations tablosuna kayıt yapılır
- ✅ Admin haritada worker'ın konumu görünür
- ✅ Realtime ile harita 10 saniyede bir güncellenir
- ✅ Konum hassasiyeti 5-50m arasında
- ✅ Türkçe hata mesajları düzgün çıkar

---

## 🎯 Sonraki Adımlar

Testler başarılı olduktan sonra:

1. **Vercel'e Deploy Et:**
   ```bash
   git add .
   git commit -m "feat: Add Radar.io GPS tracking integration"
   git push
   ```

2. **Vercel Environment Variables Ekle:**
   - Vercel Dashboard → Settings → Environment Variables
   - `NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY` ekle
   - Production, Preview, Development (hepsini seç)

3. **Production'da Test Et:**
   - Worker olarak giriş yap
   - GPS başlat
   - Supabase'de production database'i kontrol et
   - Admin haritada görün

4. **Gelişmiş Özellikler (İsteğe Bağlı):**
   - Geofencing ekle (rota sınırları)
   - Trip tracking (görev otomasyonu)
   - Battery optimization ayarları
   - Offline support

---

## 💡 İpuçları

- **Development'ta test etmek daha kolay:** HTTPS gerektirmez, localhost yeterli
- **Konum hassasiyeti:** Indoor: 10-50m, Outdoor: 5-20m
- **Battery impact:** 10s interval → düşük, 5s → orta, 1s → yüksek
- **Realtime subscription:** Postgres changes ile otomatik, manuel refresh gerekmez
- **Radar.io dashboard:** https://radar.com/dashboard - analytics ve debug için

---

**Testlere başla!** 🚀 Sorun olursa console log'ları ve bu guide'ı kontrol et.
