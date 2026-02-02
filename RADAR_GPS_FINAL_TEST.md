# 🗺️ Radar.io GPS Tracking - Final Test Guide

## ✅ Sistem Hazır - Test Adımları

---

## 📋 MANUEL KONTROL LİSTESİ (SEN YAPACAKSIN)

### 1. ⚠️ Vercel Environment Variables Kontrolü

**ZORUNLU - Deploy'dan önce:**

1. **Vercel Dashboard'a git:**
   - https://vercel.com/dashboard
   - Projeyi seç: `BTS`

2. **Settings → Environment Variables**
   
3. **Kontrol et:**
   ```
   Variable Name: NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY
   Value: prj_test_pk_2b44c47c6bf114b0c636ff7792263b00574348b1
   Environments: ✅ Production, ✅ Preview, ✅ Development
   ```

4. **Yoksa Ekle:**
   - Click: `Add New`
   - Name: `NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY`
   - Value: `prj_test_pk_2b44c47c6bf114b0c636ff7792263b00574348b1`
   - Select All Environments
   - Save

5. **Redeploy:**
   - Deployments sekmesi → Latest deployment → "Redeploy"

---

## 🧪 TEST SENARYOLARI

### Test 1: Worker Panel - GPS Tracking Başlatma

**Adımlar:**

1. **Deploy tamamlandıktan sonra uygulamaya giriş yap**
   - Role: `worker` (personel)

2. **Worker Dashboard'a git**
   - `/worker`

3. **GPS Konum Takibi kartını bul**
   - "GPS Konum Takibi" başlıklı card
   - Status badge: "PASIF" (kırmızı)

4. **"Başlat" butonuna tıkla**

5. **Browser konum izni iste**
   - Popup: "Allow location access?"
   - ✅ **İZİN VER (Allow)**

6. **Console'u aç (F12)**
   - Beklenen log'lar:
   ```
   Radar.io SDK basariyla initialize edildi
   GPS tracking baslatiliyor...
   Radar.io ile konum aliniyor...
   Konum alindi: {latitude: ..., longitude: ..., accuracy: ...}
   GPS verisi Supabase kaydedildi
   GPS tracking basariyla baslatildi (10s interval)
   ```

7. **UI Değişiklikleri:**
   - Status badge: "AKTİF" (yeşil)
   - Buton: "Durdur" (kırmızı)
   - Konum bilgisi görünür:
     - Latitude: `XX.XXXX`
     - Longitude: `YY.YYYY`
     - Accuracy: `~XX m`

8. **10 saniye bekle**
   - Console'da periyodik log:
   ```
   Periyodik konum guncellemesi...
   Konum alindi: ...
   GPS verisi Supabase kaydedildi
   ```

9. **"Durdur" butonuna tıkla**
   - Console: `GPS tracking durduruldu`
   - Status: "PASIF"

---

### Test 2: Admin Panel - Live Tracking Map

**Adımlar:**

1. **Admin hesabıyla giriş yap**
   - Role: `admin`

2. **Admin Dashboard → Live Tracking**
   - Sol menü: "Canlı Takip" veya `/admin/tracking`

3. **Harita yüklensin**
   - MapLibre haritası görünür
   - Varsayılan merkez: Türkiye

4. **Personel marker'ları kontrol et**
   - Worker panelde tracking başlattıysan:
   - Haritada MAVİ yuvarlak marker göreceksin
   - Marker'ın üzerine hover:
     - Personel adı
     - Son konum zamanı
     - Hız (varsa)

5. **Real-time güncelleme:**
   - Worker panelde konum güncellenirken
   - Admin haritada marker otomatik hareket eder
   - 10 saniyede bir güncelleme

6. **Marker'a tıkla:**
   - Popup açılır:
     - Personel bilgileri
     - Son konum zamanı
     - Koordinatlar

---

### Test 3: Supabase - GPS Verileri Kontrolü

**Adımlar:**

1. **Supabase Dashboard'a git**
   - https://supabase.com/dashboard/project/aulbsjlrumyekbuvxghx

2. **Table Editor → `gps_locations`**

3. **Son kayıtları görüntüle:**
   ```sql
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

4. **Beklenen sonuç:**
   - `device_id`: `radar-web-XXXXXXXX`
   - `user_id`: Worker user ID'si
   - `latitude`, `longitude`: Gerçek koordinatlar
   - `accuracy`: ~10-50 metre
   - `speed`: null veya sayı (m/s)
   - `recorded_at`: Her 10 saniyede yeni kayıt

5. **RLS kontrolü:**
   - Admin kullanıcısı: TÜM kayıtları görebilir
   - Worker kullanıcısı: Sadece kendi kayıtlarını görebilir

---

## 🚨 HATA SENARYOLARI VE ÇÖZÜMLERİ

### Hata 1: "Radar.io SDK yuklenemedi"

**Console:**
```
NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY environment variable bulunamadi!
```

**Çözüm:**
1. Vercel Environment Variables kontrol et
2. Değişkeni ekle
3. Redeploy

---

### Hata 2: "Konum izni reddedildi"

**Console:**
```
Konum izni reddedildi. Lutfen tarayici ayarlarindan konum iznini acin.
```

**Çözüm:**
1. Browser ayarları → Privacy → Location
2. Site için izin ver
3. Sayfayı yenile
4. Tekrar "Başlat" butonuna tıkla

---

### Hata 3: Haritada marker görünmüyor

**Olası sebepler:**

1. **GPS tracking başlatılmamış:**
   - Worker panelde "Başlat" butonuna tıkla

2. **Supabase'de veri yok:**
   - SQL sorgusu ile kontrol et
   - RLS policy'leri kontrol et

3. **Realtime subscription hatası:**
   - Console'da `WebSocket` hataları var mı?
   - Supabase Realtime enabled mı?

**Çözüm:**
```sql
-- Supabase SQL Editor'da çalıştır
-- Realtime'ı enable et
ALTER PUBLICATION supabase_realtime ADD TABLE gps_locations;
```

---

### Hata 4: "GPS veri kaydetme hatasi"

**Console:**
```
GPS veri kaydetme hatasi: {code: '42501', message: 'permission denied'}
```

**Çözüm:**
- RLS policy'leri kontrol et:
```sql
-- gps_locations INSERT policy
SELECT * FROM pg_policies 
WHERE tablename = 'gps_locations' 
AND cmd = 'INSERT';
```

- Policy yoksa ekle (00002_rls_policies.sql migration'ı çalıştır)

---

## 📊 BAŞARILI TEST KRİTERLERİ

✅ **Worker Panel:**
- [ ] GPS tracking başlatılabiliyor
- [ ] Konum UI'da görünüyor
- [ ] 10 saniyede bir güncelleniyor
- [ ] "Durdur" buton çalışıyor

✅ **Admin Panel:**
- [ ] Harita yükleniyor
- [ ] Personel marker'ları görünüyor
- [ ] Real-time güncellemeler çalışıyor
- [ ] Marker'a tıklayınca popup açılıyor

✅ **Supabase:**
- [ ] `gps_locations` tablosuna veri kaydediliyor
- [ ] Her 10 saniyede yeni kayıt
- [ ] RLS policy'leri çalışıyor

✅ **Console:**
- [ ] Radar.io SDK başarıyla initialize
- [ ] Konum log'ları görünüyor
- [ ] Hata yok

---

## 🎯 PRODUCTİON ÖNCESİ CHECKLIST

- [ ] Vercel Environment Variables set
- [ ] Radar.io Test Key çalışıyor
- [ ] GPS tracking test edildi
- [ ] Admin harita test edildi
- [ ] Supabase RLS policies aktif
- [ ] Hata senaryoları test edildi
- [ ] Mobile responsive test edildi

---

## 📱 MOBİLE TEST (Opsiyonel)

**Desktop'tan farklı olarak:**

1. **Mobile browser'da aç (Chrome/Safari)**
2. **GPS izni iste**
   - Mobile'da daha hassas konum
   - Accuracy: ~5-20 metre
3. **Background tracking test et:**
   - App'i minimize et
   - 1-2 dakika bekle
   - Tekrar aç
   - Tracking hala aktif mi?

**Not:** Background tracking browser'da sınırlıdır. Mobile app gerektirir.

---

## 🚀 SONRAKİ ADIMLAR

1. **Production Radar.io Key:**
   - Test key: `prj_test_pk_...`
   - Production key: `prj_live_pk_...`
   - Vercel'de güncelle

2. **Optimizasyon:**
   - Tracking interval: 10s → 30s (battery save)
   - Geofencing ekle (belirli alan dışına çıkarsa alarm)
   - Offline mode (internet yoksa cache)

3. **Raporlama:**
   - Günlük konum raporu
   - Personel yol haritası
   - Çalışma süreleri analizi

---

## 📞 DESTEK

**Radar.io Dokümantasyon:**
- https://radar.com/documentation/sdk/web

**Supabase Realtime:**
- https://supabase.com/docs/guides/realtime

**MapLibre GL JS:**
- https://maplibre.org/maplibre-gl-js-docs/

---

**Test başarılı olursa production'a hazırsınız!** 🎉
