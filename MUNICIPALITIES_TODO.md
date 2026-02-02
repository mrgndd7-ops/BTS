# 🏛️ Belediye Verisi Eksikliği

## ⚠️ ÖNEMLİ: Mevcut Durum

**Şu anda sadece ~180 belediye** kayıtlı:
- ✅ İstanbul (39 ilçe) - Tam
- ✅ Ankara (25 ilçe) - Tam  
- ✅ İzmir (30 ilçe) - Tam
- ⚠️ Adana, Adıyaman, Afyon - Kısmi
- ❌ **Diğer 74 il** - Eksik!

**Türkiye'de toplam ~970 belediye var!**

---

## 📋 Eksik Olan İller (78 il)

### Ege Bölgesi
- Aydın (17 ilçe)
- Denizli (19 ilçe)
- Manisa (17 ilçe)
- Muğla (13 ilçe)
- Uşak (6 ilçe)
- Kütahya (13 ilçe)

### Marmara Bölgesi
- Bursa (17 ilçe)
- Kocaeli (12 ilçe)
- Balıkesir (20 ilçe)
- Çanakkale (12 ilçe)
- Edirne (9 ilçe)
- Kırklareli (8 ilçe)
- Tekirdağ (11 ilçe)
- Yalova (6 ilçe)
- Bilecik (8 ilçe)
- Sakarya (16 ilçe)

### Karadeniz Bölgesi
- Samsun (17 ilçe)
- Trabzon (18 ilçe)
- Ordu (19 ilçe)
- Rize (12 ilçe)
- Giresun (16 ilçe)
- Artvin (8 ilçe)
- Gümüşhane (6 ilçe)
- Kastamonu (20 ilçe)
- Sinop (9 ilçe)
- Çorum (14 ilçe)
- Amasya (7 ilçe)
- Tokat (12 ilçe)
- Zonguldak (8 ilçe)
- Bartın (4 ilçe)
- Karabük (6 ilçe)
- Bolu (9 ilçe)
- Düzce (8 ilçe)
- Bayburt (3 ilçe)

### İç Anadolu Bölgesi
- Konya (31 ilçe)
- Kayseri (16 ilçe)
- Eskişehir (14 ilçe)
- Sivas (17 ilçe)
- Yozgat (14 ilçe)
- Nevşehir (8 ilçe)
- Kırıkkale (9 ilçe)
- Aksaray (8 ilçe)
- Niğde (6 ilçe)
- Kırşehir (7 ilçe)
- Karaman (6 ilçe)
- Çankırı (12 ilçe)

### Akdeniz Bölgesi
- Antalya (19 ilçe)
- Mersin (13 ilçe)
- Hatay (15 ilçe)
- Kahramanmaraş (11 ilçe)
- Osmaniye (7 ilçe)
- Isparta (13 ilçe)
- Burdur (11 ilçe)

### Doğu Anadolu Bölgesi
- Erzurum (20 ilçe)
- Malatya (13 ilçe)
- Elazığ (11 ilçe)
- Van (13 ilçe)
- Ağrı (8 ilçe)
- Muş (6 ilçe)
- Bingöl (8 ilçe)
- Tunceli (8 ilçe)
- Bitlis (7 ilçe)
- Hakkari (4 ilçe)
- Ardahan (6 ilçe)
- Iğdır (4 ilçe)
- Kars (8 ilçe)
- Erzincan (9 ilçe)

### Güneydoğu Anadolu Bölgesi
- Gaziantep (9 ilçe)
- Şanlıurfa (13 ilçe)
- Diyarbakır (17 ilçe)
- Mardin (10 ilçe)
- Batman (6 ilçe)
- Şırnak (7 ilçe)
- Siirt (7 ilçe)
- Kilis (4 ilçe)

---

## 🔧 Nasıl Düzeltilir?

### Yöntem 1: Manuel SQL (Önerilen)

1. **Supabase SQL Editor'ı Aç**
2. **Her il için** ilçeleri ekle:

```sql
INSERT INTO municipalities (name, code, city, district, is_active) VALUES
  ('İlçe1 Belediyesi', 'il-ilce1', 'İl', 'İlçe1', true),
  ('İlçe2 Belediyesi', 'il-ilce2', 'İl', 'İlçe2', true)
ON CONFLICT (code) DO NOTHING;
```

### Yöntem 2: Migration Dosyası

Eksik migration'ı çalıştır:
- `supabase/migrations/00018_add_all_turkey_municipalities_complete.sql`
- ⚠️ **NOT:** Bu dosya sadece yapıyı gösteriyor, tüm 970 belediyeyi içermiyor!

### Yöntem 3: API'den Çek (En Kolay)

İçişleri Bakanlığı veya TÜİK'den belediye listesini API ile çek ve otomatik ekle.

---

## 📊 İstatistik

```sql
-- Mevcut belediye sayısı
SELECT COUNT(*) FROM municipalities WHERE is_active = true;

-- İl başına belediye dağılımı
SELECT city, COUNT(*) as total 
FROM municipalities 
WHERE is_active = true 
GROUP BY city 
ORDER BY total DESC;
```

---

## ✅ Çözüm Sonrası

Tüm belediyeler eklendikten sonra:
- `/register` sayfasında tüm iller için belediye listesi görünecek
- `/complete-profile` sayfasında dropdown düzgün çalışacak
- Kullanıcılar belediyelerini seçebilecek

---

## 🚨 Acil Çözüm (Geçici)

Eğer hemen test etmek istiyorsan:

1. **Test için sadece 1 ili ekle** (örn: Bursa):
```sql
INSERT INTO municipalities (name, code, city, district, is_active) VALUES
  ('Osmangazi Belediyesi', 'bursa-osmangazi', 'Bursa', 'Osmangazi', true),
  ('Nilüfer Belediyesi', 'bursa-nilufer', 'Bursa', 'Nilüfer', true),
  ('Yıldırım Belediyesi', 'bursa-yildirim', 'Bursa', 'Yıldırım', true)
ON CONFLICT (code) DO NOTHING;
```

2. **Test kullanıcısı oluştururken Bursa'yı seç**
3. **Dropdown çalışacak!**

---

**Proje production'a çıkmadan önce TÜM belediyeleri eklemen gerekiyor!** 🏛️
