# 🧪 LOCAL TEST TALİMATLARI

## ⚠️ EPERM Hatası Çözümü

Terminal'de `EPERM` hatası alıyorsun. Bu Windows permission sorunudur.

### Çözüm Seçenekleri:

---

## ✅ YÖNTEM 1: VSCode Terminal (ÖNERİLEN)

1. **VSCode'u Kapat** (tamamen)
2. **VSCode'u Administrator Olarak Aç:**
   - Start → Visual Studio Code'a sağ tık
   - "Run as administrator" seç
3. **Terminal aç** (Ctrl + `)
4. **Şu komutu çalıştır:**
   ```bash
   npm run dev
   ```

**Beklenen Çıktı:**
```
> bts@0.1.0 dev
> next dev

  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

✓ Starting...
✓ Ready in 2.5s
```

---

## ✅ YÖNTEM 2: PowerShell (Administrator)

1. **PowerShell'i Administrator Olarak Aç:**
   - Start → PowerShell'e sağ tık
   - "Run as administrator" seç

2. **Proje klasörüne git:**
   ```powershell
   cd "C:\Users\mrgnd\OneDrive\Masaüstü\Belediye"
   ```

3. **Server başlat:**
   ```powershell
   npm run dev
   ```

---

## ✅ YÖNTEM 3: Port Değiştir

Eğer port 3000 meşgulse:

```bash
# Port 3001'de başlat
npm run dev -- -p 3001

# VEYA
npx next dev -p 3001
```

Tarayıcıda: `http://localhost:3001`

---

## 📋 Test Adımları (Server Başladıktan Sonra)

### 1. Browser'da Aç
```
http://localhost:3000
```

### 2. Worker Hesabıyla Giriş Yap

**Test hesabı varsa:**
- Email: worker@test.com (veya mevcut hesap)
- Password: ******

**Hesap yoksa:**
1. Register sayfasına git
2. Worker rolü seç
3. Kayıt ol
4. Complete profile

### 3. GPS Tracking Test Et

**Worker Dashboard'da:**

1. **GPS Tracking Card'ını gör:**
   ```
   🧭 GPS Konum Takibi     [Pasif] [Başlat]
   ```

2. **"Başlat" butonuna tıkla**

3. **Browser konum izni popup'ı çıkacak:**
   - ✅ "Allow" / "İzin Ver" seç

4. **GPS aktif olacak:**
   ```
   🧭 GPS Konum Takibi     [Aktif] [Durdur]
   Aktif - Konumunuz her 10 saniyede güncelleniyor
   (15m hassasiyet)
   ```

5. **Console'u aç (F12):**
   ```
   ✅ Radar.io SDK başarıyla initialize edildi
   📍 Radar.io ile konum alınıyor...
   ✅ Konum alındı: { latitude: 41.0082, ... }
   ✅ GPS verisi Supabase'e kaydedildi
   ⏰ Periyodik konum güncellemesi...
   ```

6. **30 saniye bekle**
   - Console'da 3 kez "Periyodik konum güncellemesi" göreceksin

### 4. Supabase'de Kontrol Et

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
  recorded_at
FROM gps_locations
WHERE device_id LIKE 'radar-web-%'
ORDER BY created_at DESC
LIMIT 10;
```

**Beklenen:**
- ✅ 3 yeni kayıt var
- ✅ `device_id`: `radar-web-{user_id_ilk_8_karakter}`
- ✅ `latitude`, `longitude`: Gerçek konumun
- ✅ `recorded_at`: Son 1 dakika içinde

### 5. Admin Map Test (Opsiyonel)

**Yeni tarayıcı tab'ı aç:**

1. **Admin hesabıyla giriş yap**
2. **Live Tracking Map'e git**
3. **Worker'ın marker'ını gör**
4. **Marker'a tıkla → Popup açılır**

---

## ✅ Başarı Kriterleri

Test başarılı sayılır eğer:

- ✅ Worker dashboard'da GPS başlatılabiliyor
- ✅ Console'da "Radar.io SDK başarıyla initialize edildi"
- ✅ Her 10 saniyede "Periyodik konum güncellemesi"
- ✅ Supabase'e kayıt yapılıyor
- ✅ Konum hassasiyeti 5-50m arası
- ✅ Hata mesajı yok (console'da error yok)

---

## 🐛 Sorun Giderme

### Problem: "Radar.io SDK yüklenemedi"

**Console'da:**
```
❌ NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY environment variable bulunamadı!
```

**Çözüm:**
1. `.env.local` dosyası var mı kontrol et
2. İçinde şu satır olmalı:
   ```
   NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY=prj_test_pk_2b44c47c6bf114b0c636ff7792263b00574348b1
   ```
3. Server'ı yeniden başlat (Ctrl+C sonra `npm run dev`)

---

### Problem: "Konum izni reddedildi"

**Console'da:**
```
❌ Konum izni reddedildi. Lütfen tarayıcı ayarlarından konum iznini açın.
```

**Çözüm:**

**Chrome:**
1. Adres çubuğunun solundaki kilit ikonu
2. Site settings
3. Location → Allow
4. Sayfayı yenile (F5)

**Firefox:**
1. Adres çubuğunun solundaki (i) ikonu
2. Permissions → Location
3. Allow seç
4. Sayfayı yenile

**Edge:**
1. Adres çubuğunun solundaki kilit ikonu
2. Permissions for this site
3. Location → Allow
4. Sayfayı yenile

---

### Problem: Supabase'e kayıt yapılmıyor

**Console'da:**
```
⚠️ User ID yok, konum kaydedilemedi
```

**Çözüm:**
1. Worker olarak giriş yaptığından emin ol
2. Profile complete edilmiş mi kontrol et
3. Console'da şunu çalıştır:
   ```javascript
   // F12 → Console
   localStorage.getItem('sb-aulbsjlrumyekbuvxghx-auth-token')
   ```
4. Null dönüyorsa logout → login yap

---

### Problem: Server başlamıyor (EPERM)

**Çözüm:**
1. **VSCode'u Administrator olarak çalıştır** (Yöntem 1)
2. VEYA: **Antivirüs'ü geçici kapat** (bazen block ediyor)
3. VEYA: **Windows Defender'da exception ekle:**
   - Settings → Virus & threat protection
   - Manage settings → Add exclusion
   - Proje klasörünü ekle: `C:\Users\mrgnd\OneDrive\Masaüstü\Belediye`

---

## 🚀 Test Başarılı Olduktan Sonra

### 1. GPS Tracking'i Durdur
```
[Durdur] butonuna tıkla
```

### 2. Server'ı Durdur
```
Terminal'de Ctrl+C
```

### 3. Vercel'e Deploy Et
```bash
git add .
git commit -m "feat: Add Radar.io GPS tracking integration"
git push
```

### 4. Vercel'de Environment Variables Ekle

**Vercel Dashboard → Project → Settings → Environment Variables:**

```
Name: NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY
Value: prj_test_pk_2b44c47c6bf114b0c636ff7792263b00574348b1
Environments: Production, Preview, Development (hepsini seç)
```

### 5. Deploy Tamamlanınca Production Test Et
```
https://your-app.vercel.app
```

---

## 📞 Yardım

Sorun devam ediyorsa:

1. **Console log'larını kopyala** (F12 → Console → sağ tık → Save as)
2. **Hata mesajını tam olarak not et**
3. **Hangi adımda takıldığını belirt**

---

## 🎯 Özet

```bash
# 1. VSCode'u Administrator olarak aç
# 2. Terminal'de:
npm run dev

# 3. Browser'da:
http://localhost:3000

# 4. Worker giriş yap → GPS başlat → 30s bekle

# 5. Supabase'de kontrol et:
SELECT * FROM gps_locations ORDER BY created_at DESC LIMIT 5;

# 6. Başarılı! ✅
```

**İyi testler!** 🚀
