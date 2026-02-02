# 🗑️ SUPABASE TRACCAR CLEANUP INSTRUCTIONS

## ⚠️ ÖNEMLİ UYARI

Bu migration **GERİ ALINAMAZ**! Traccar ile ilgili tüm database yapıları silinecek:
- ❌ `source` column (browser/traccar/hardware)
- ❌ `traccar_position_id` column
- ❌ `device_mappings` table
- ❌ `unmapped_devices` view
- ❌ 4 adet index

**Ancak GPS location verileri korunacak!** Sadece Traccar-specific metadata silinecek.

## 📋 Silinecek Database Objeleri

### 1. Columns (gps_locations table)
```sql
-- Bu kolonlar SİLİNECEK:
gps_locations.source              -- 'browser' | 'traccar' | 'hardware'
gps_locations.traccar_position_id -- Traccar position ID
```

### 2. Tables
```sql
-- Bu tablo SİLİNECEK (Traccar device → user mapping için kullanılıyordu):
device_mappings
  - device_id (varchar)
  - user_id (uuid)
  - municipality_id (uuid)
  - mapped_by (uuid)
  - is_active (boolean)
  - created_at (timestamp)
```

### 3. Views
```sql
-- Bu view SİLİNECEK (Unmapped devices listesi için):
unmapped_devices
```

### 4. Indexes
```sql
-- Bu index'ler SİLİNECEK:
idx_gps_source                    -- source column index
idx_gps_traccar_position          -- traccar_position_id index
idx_gps_traccar_position_unique   -- traccar_position_id unique constraint
idx_gps_unmapped_devices          -- unmapped devices index
```

## ✅ KORUNACAK Yapılar

```sql
-- Bu kolonlar KORUNACAK (Radar.io için gerekli):
gps_locations.id
gps_locations.device_id           -- ✅ RADAR.IO İÇİN GEREKLİ
gps_locations.user_id             -- ✅ Nullable (user mapping için)
gps_locations.municipality_id     -- ✅ Tenant isolation
gps_locations.latitude
gps_locations.longitude
gps_locations.accuracy
gps_locations.speed
gps_locations.heading
gps_locations.altitude
gps_locations.battery_level
gps_locations.recorded_at
gps_locations.created_at

-- Bu index'ler KORUNACAK:
idx_gps_device_latest             -- Device'ın son konumu için
idx_gps_user_recorded             -- User'ın GPS history için
idx_gps_municipality_recorded     -- Municipality GPS data için
```

## 🚀 Nasıl Çalıştırılır?

### Yöntem 1: Supabase Dashboard (ÖNERİLEN)

1. **Supabase Dashboard'a git:**
   ```
   https://supabase.com/dashboard/project/aulbsjlrumyekbuvxghx
   ```

2. **SQL Editor'ı aç:**
   - Sol menüden **SQL Editor** seç
   - **New Query** tıkla

3. **Migration'ı kopyala yapıştır:**
   ```sql
   -- supabase/migrations/00017_remove_traccar_fields.sql dosyasının tamamını kopyala
   ```

4. **Dikkatli incele ve çalıştır:**
   - ⚠️ Migration'ı OKU ve anladığından emin ol
   - ⚠️ Yedek aldığından emin ol (opsiyonel ama önerilen)
   - ▶️ **RUN** butonuna bas
   - ✅ Success mesajını bekle

5. **Doğrula:**
   ```sql
   -- Kolonların silindiğini kontrol et
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'gps_locations';
   
   -- 'source' ve 'traccar_position_id' OLMAMALI
   
   -- Table'ın silindiğini kontrol et
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_name = 'device_mappings';
   
   -- Sonuç: 0 rows
   
   -- View'ın silindiğini kontrol et
   SELECT table_name 
   FROM information_schema.views 
   WHERE table_name = 'unmapped_devices';
   
   -- Sonuç: 0 rows
   ```

### Yöntem 2: Supabase CLI (Gelişmiş)

```bash
# 1. Supabase CLI kur (eğer yoksa)
npm install -g supabase

# 2. Login ol
supabase login

# 3. Project'e bağlan
supabase link --project-ref aulbsjlrumyekbuvxghx

# 4. Migration'ı çalıştır
supabase db push

# 5. Doğrula
supabase db diff
```

## 🧪 Test Senaryosu

Migration'dan SONRA test et:

### 1. GPS API Hala Çalışıyor mu?

```bash
# Test 1: GPS location kaydet
curl "https://your-vercel-url.vercel.app/api/gps?id=test-device&lat=41.0082&lon=28.9784&timestamp=1738410000000"

# Beklenen: {"success":true,"location_id":"...","user_mapped":false}
```

### 2. Mevcut GPS Verileri Korundu mu?

```sql
-- Supabase SQL Editor'da çalıştır
SELECT COUNT(*) as total_locations, 
       COUNT(DISTINCT device_id) as unique_devices,
       COUNT(DISTINCT user_id) as unique_users
FROM gps_locations;

-- Beklenen: location sayısı AYNI, device ve user sayıları korunmuş
```

### 3. Map Widget Çalışıyor mu?

```
1. Admin dashboard'a git
2. Live Tracking Map'i aç
3. Personnel konumları gösteriliyor mu kontrol et
```

## ⏪ Geri Alma (Rollback)

⚠️ **BU MİGRATİON GERİ ALINAMAZ!** Çünkü:
- Kolonlar DROP ediliyor (veri kaybı)
- Table DROP ediliyor (veri kaybı)

Eğer GERİ ALMAK istersen:
1. Supabase backup'tan restore yap
2. VEYA: Kolonları/tabloları manuel oluştur (ama eski veri gitmez)

## 📊 Migration Sonrası Durum

```
✅ OLAN:
- GPS location data korundu
- device_id hala var (Radar.io için kullanılacak)
- user_id mapping korundu
- Map tracking çalışıyor
- API endpoint çalışıyor

❌ OLMAYAN:
- Traccar source field (artık gerek yok)
- Traccar position_id (deduplasyon - artık gerek yok)
- device_mappings table (Radar.io farklı sistem kullanacak)
- unmapped_devices view (admin UI'da kullanılmıyordu)
```

## 🎯 Sonraki Adım

Migration başarılı olduktan sonra:
1. ✅ Supabase'i temizledin
2. ✅ Kod zaten temiz (Traccar referansları yok)
3. 🚀 Radar.io entegrasyonu başlayabilir!

```bash
# Radar.io SDK kurulumu
npm install radar-sdk-js

# Environment variable ekle
NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY=prj_live_pk_...
```

---

## 🆘 Sorun mu Var?

**Error: column "source" does not exist**
- ✅ Normal! Kolon zaten silinmiş, migration başarılı.

**Error: relation "device_mappings" does not exist**
- ✅ Normal! Table zaten yok veya hiç oluşturulmamış.

**Error: view "unmapped_devices" does not exist**
- ✅ Normal! View zaten yok.

**GPS data kayboldu!**
- ❌ Bu OLMAMALI! Sadece `source` ve `traccar_position_id` kolonları silinmeli.
- 🔍 Kontrol et: `SELECT COUNT(*) FROM gps_locations;`
- 📞 Eğer veri kaybı varsa HEMEN backup'tan restore yap!

---

**Hazır mısın?** Supabase Dashboard'a git ve migration'ı çalıştır! 🚀
