# GPS Tracking Kullanım Kılavuzu

## 🔒 HTTPS Gereksinimi

**ÖNEMLİ:** GPS tracking özelliği **sadece HTTPS** üzerinden çalışır!

### ✅ Çalışır:
- ✅ Vercel Production URL (https://your-app.vercel.app)
- ✅ Vercel Preview URL (https://your-app-xxx.vercel.app)
- ✅ localhost (http://localhost:3000) - Sadece geliştirme için

### ❌ Çalışmaz:
- ❌ HTTP üzerinden production
- ❌ IP adresi ile erişim (http://192.168.x.x)
- ❌ Custom domain HTTPS olmadan

## 🚀 Test Adımları

### 1. Vercel'den Test Et
```
https://your-production-url.vercel.app
```

### 2. Personel Olarak Giriş Yap
- Email: personel@example.com
- Password: şifreniz

### 3. Görev Başlat
1. Görevler sayfasına git
2. Atanmış görev bul
3. "Başlat" butonuna tıkla
4. **GPS izni iste popup'ı gelecek**

### 4. GPS İzni Ver
- Chrome: "Allow" / "İzin Ver"
- Safari: "Allow" / "İzin Ver"
- Firefox: "Allow" / "İzin Ver"

## 🔍 Debug Console Logları

F12 Console'da göreceğiniz loglar:

```
🚀 GPS Tracking başlatılıyor...
🔐 Step 1: Browser GPS izni kontrol ediliyor...
🔐 GPS izni kontrol ediliyor...
📋 Permission state: prompt
📍 Browser Geolocation API ile konum isteniyor...
✅ GPS izni verildi: { lat: 41.0, lng: 29.0, accuracy: 10 }
✅ GPS izni verildi, Radar.io başlatılıyor...
✅ Radar SDK initialize edildi
📍 İlk konum Radar.io ile alınıyor...
📍 GPS kaydet: { task_id: 'xxx', accuracy: 10, lat: 41.0, lng: 29.0 }
✅ GPS kaydedildi
✅ GPS Tracking aktif - Her 5 saniyede güncelleme
```

## ⚠️ Olası Hatalar

### "GPS izni reddedildi"
**Çözüm:**
1. Tarayıcı adres çubuğunda kilit ikonuna tıkla
2. Site ayarları > Konum > İzin Ver
3. Sayfayı yenile

### "HTTPS gerekli"
**Çözüm:**
- Localhost dışında HTTP kullanıyorsanız
- Vercel URL'inden test edin

### "GPS konumu alınamıyor"
**Çözüm:**
1. Cihazınızın GPS'i açık mı kontrol edin
2. Dışarıda veya pencere kenarında deneyin
3. Tarayıcıyı yenileyin

## 📱 Mobil Test

### Android Chrome
1. HTTPS URL'e git
2. İzin popup'ında "Allow"
3. GPS aktif olmalı

### iOS Safari
1. HTTPS URL'e git
2. İzin popup'ında "Allow"
3. Ayarlar > Safari > Konum Servisleri aktif olmalı

## 🗺️ Yönetici Panelinde Görüntüleme

### Super Admin / Admin
1. Ana sayfaya git
2. "Canlı Personel Takip" haritasını gör
3. Aktif personeller mavi marker ile görünür
4. Marker'a tıkla = Personel detayları

### Realtime Güncelleme
- Her 5 saniyede otomatik güncellenir
- Yeni GPS verisi geldiğinde marker anında güncellenir
- Harita otomatik zoom yapar

## 🔧 Teknik Detaylar

### GPS İzin Akışı
```
1. Browser Geolocation API ile izin kontrolü
   ↓
2. İzin verilirse Radar.io başlat
   ↓
3. Radar.trackOnce() ile ilk konum al
   ↓
4. Supabase'e kaydet
   ↓
5. Her 5 saniyede tekrarla
```

### Veri Akışı
```
Personel (Browser)
  ↓ GPS coordinates
Radar.io SDK
  ↓ Location data
Supabase (gps_locations table)
  ↓ Realtime subscription
Admin Dashboard (LiveTrackingMap)
  ↓ MapLibre markers
Harita Görüntüleme
```

## 📊 Supabase Veri Kontrolü

```sql
-- Son GPS kayıtlarını gör
SELECT 
  gl.user_id,
  p.full_name,
  gl.latitude,
  gl.longitude,
  gl.recorded_at,
  EXTRACT(EPOCH FROM (NOW() - gl.recorded_at))/60 as minutes_ago
FROM gps_locations gl
LEFT JOIN profiles p ON gl.user_id = p.id
ORDER BY gl.recorded_at DESC
LIMIT 10;
```

## 🎯 Başarı Kriterleri

✅ GPS izni verildi
✅ Console'da "GPS kaydedildi" logu var
✅ Supabase'de gps_locations tablosunda veri var
✅ Admin panelinde marker görünüyor
✅ Her 5 saniyede güncelleniyor

## 🆘 Destek

Sorun yaşarsanız:
1. F12 Console loglarını kontrol edin
2. Network tab'da Supabase isteklerini kontrol edin
3. HTTPS kullandığınızdan emin olun
4. GPS izni verildiğinden emin olun
