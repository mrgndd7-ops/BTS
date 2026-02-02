# 🧪 GPS TRACKING TEST AKIŞI

## ✅ ADIM 1: PERSONEL PANELİNDE TEST

### 1.1 Personel Login
```
URL: https://bts-psi.vercel.app/login
Email: personel kullanıcısının emaili
Password: personel kullanıcısının şifresi
```

### 1.2 Console Aç (F12)
```
Chrome/Safari → F12 → Console tab
```

### 1.3 Görevlerim Sayfasına Git
```
URL: /worker/my-tasks
```

### 1.4 "Görevi Başlat" Butonuna Bas
```
1. Yeşil "Görevi Başlat" butonuna tıkla
2. Tarayıcı konum izni popup'ı çıkacak
3. "İzin Ver" / "Allow" seçeneğini seç
```

### 1.5 Console'da Görmem Gerekenler:
```javascript
✅ Radar SDK dinamik olarak yüklendi
✅ Radar SDK initialize edildi
🚀 GPS Tracking başlatılıyor...
✅ GPS Tracking aktif - Her 5 saniyede güncelleme
📍 GPS kaydet: {task_id: "xxx-xxx", accuracy: 5, lat: 41.xxx, lng: 29.xxx}
✅ GPS kaydedildi
📍 GPS güncelleme zamanı...
📍 GPS kaydet: {task_id: "xxx-xxx", accuracy: 4, lat: 41.xxx, lng: 29.xxx}
✅ GPS kaydedildi
... (her 5 saniyede bir tekrar)
```

### 1.6 Eğer Hata Görürsen:
```javascript
❌ "GPS Hassasiyet düşük, kaydetme atlanıyor: 20"
   → SORUN YOK! accuracy > 15m ise atlanır, daha iyi sinyal bekle

❌ "GPS konumu alınamadı"
   → Konum servislerini kontrol et (Telefon ayarları → Konum)

❌ "GPS izni reddedildi"
   → Tarayıcı ayarları → Site ayarları → Konum → İzin ver
```

---

## ✅ ADIM 2: SUPABASE'DE KONTROL

### 2.1 Supabase Dashboard Aç
```
URL: https://supabase.com/dashboard/project/aulbsjlrumyekbuvxghx
SQL Editor → New Query
```

### 2.2 Bu Sorguyu Çalıştır:
```sql
-- SON 10 GPS KAYDINI GÖSTER
SELECT 
  id,
  user_id,
  task_id,
  latitude,
  longitude,
  accuracy,
  recorded_at,
  EXTRACT(EPOCH FROM (NOW() - recorded_at)) / 60 as minutes_ago
FROM gps_locations
ORDER BY recorded_at DESC
LIMIT 10;
```

### 2.3 Beklenen Sonuç:
```
✅ En az 1 satır olmalı
✅ user_id: Personelin user ID'si
✅ task_id: Başlattığın görevin ID'si
✅ latitude/longitude: Konumun (41.xxx, 29.xxx)
✅ accuracy: 5-15 arasında (metre)
✅ minutes_ago: 0-1 dakika önce
```

### 2.4 Eğer VERİ YOKSA:
```
❌ GPS verileri Supabase'e gitmiyor!
   → Personel console'unda "✅ GPS kaydedildi" görüyor musun?
   → RLS policy'leri kontrol et (gps_locations tablosu)
```

---

## ✅ ADIM 3: ADMIN PANELİNDE KONTROL

### 3.1 Admin Login
```
URL: https://bts-psi.vercel.app/login
Email: admin@bts.com
Password: 123456
```

### 3.2 Console Aç (F12)
```
Chrome → F12 → Console tab
```

### 3.3 Ana Sayfa (Dashboard)
```
URL: /admin
Haritayı görmeli ve "X Personel Aktif" badge'i olmalı
```

### 3.4 Console'da Görmem Gerekenler:
```javascript
🚀 Initializing GPS tracking map...
📊 Initial locations loaded: 1 (veya daha fazla)
📡 Realtime status: SUBSCRIBED
🔔 GPS Insert Event: {...}
📍 Marker güncelleniyor: {user: "Personel Adı", lat: 41.xxx, lng: 29.xxx}
📍 Update Marker: {user: "...", task_id: "xxx", isActiveTask: true}
```

### 3.5 Haritada Görmem Gerekenler:
```
✅ Harita yüklendi (OpenStreetMap tiles)
✅ MAVİ PULSE MARKER (parlayan mavi halka animasyonu)
✅ Marker üzerinde personelin baş harfi
✅ Marker'a tıklayınca popup açılmalı
✅ 5 saniyede bir marker hareket etmeli
```

### 3.6 Eğer Marker YOKSA:
```javascript
// Console'da kontrol et:
📊 Initial locations loaded: 0  ← SORUN BURADA!

// Supabase'de veri var mı kontrol et:
SELECT COUNT(*) FROM gps_locations WHERE recorded_at > NOW() - INTERVAL '5 minutes';

// Eğer veri varsa ama marker yoksa:
→ Realtime subscription çalışmıyor
→ Console'da "📡 Realtime status: CLOSED" görüyor musun?
→ Sayfa yenile (Ctrl+Shift+R)
```

---

## 🔧 HIZLI DEBUG

### Personel Tarafında:
```javascript
// Console'da bu komutu çalıştır:
localStorage.getItem('sb-aulbsjlrumyekbuvxghx-auth-token')
// Output: token varsa login başarılı
```

### Admin Tarafında:
```javascript
// Console'da bu komutu çalıştır:
document.querySelectorAll('.personnel-marker').length
// Output: Kaç marker var (0 ise sorun var!)
```

### Supabase Realtime Test:
```sql
-- Manuel INSERT yap, admin'de görünmeli:
INSERT INTO gps_locations (user_id, task_id, latitude, longitude, accuracy, recorded_at)
VALUES (
  'PERSONEL_USER_ID',  -- Gerçek user ID'yi yaz
  'TASK_ID',           -- Gerçek task ID'yi yaz
  41.0082,             -- İstanbul koordinatları
  28.9784,
  5.0,
  NOW()
);
-- Admin haritasında ANINDA marker görünmeli!
```

---

## 📝 SONUÇ RAPORU

### GPS Tracking Çalışıyor mu?
```
[ ] Personel "Görevi Başlat" butonu çalışıyor
[ ] Console'da "✅ GPS kaydedildi" görünüyor
[ ] Supabase'de gps_locations tablosunda veri var
[ ] Admin haritasında marker görünüyor
[ ] Marker mavi pulse animasyonu yapıyor
[ ] 5 saniyede bir marker güncelleniyor
```

### Eğer Hepsi ✅ İse:
```
🎉 GPS TRACKING TAM ÇALIŞIYOR! SUNUM HAZIR!
```

### Eğer Bir Adım ❌ İse:
```
🔍 Hangi adımda sorun var bana söyle, hemen düzeltelim!
```
