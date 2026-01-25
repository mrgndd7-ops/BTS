# 🔧 Görev Atama Hatası - Çözüm Adımları

## ❗ Sorun Nedir?

Görev oluşturma formu "Görev oluşturulamadı" hatası veriyor.

## 🎯 Muhtemel Nedenler

1. **Migration'lar çalıştırılmamış** (En olası ⚠️)
2. Supabase RLS politikaları eksik
3. Kullanıcı profili tamamlanmamış

## ✅ ÇÖZÜM 1: Migration'ları Çalıştır (MUTLAKA YAPILMALI)

### Adım 1: Supabase Dashboard'a Git
1. https://supabase.com/dashboard adresini aç
2. Projenizi seçin
3. Sol menüden **"SQL Editor"** sekmesine tıklayın

### Adım 2: İlk Migration'ı Çalıştır

**New Query** butonuna tıklayıp şu SQL'i yapıştırın ve **Run** deyin:

```sql
-- MIGRATION 1: Tasks tablosunu düzelt
ALTER TABLE tasks RENAME COLUMN assigned_personnel TO assigned_to;
ALTER TABLE tasks RENAME COLUMN scheduled_date TO scheduled_start;
ALTER TABLE tasks ALTER COLUMN scheduled_start TYPE TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
  CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled'));

UPDATE tasks SET status = 'assigned' WHERE status = 'beklemede';
UPDATE tasks SET status = 'in_progress' WHERE status = 'devam_ediyor';
UPDATE tasks SET status = 'completed' WHERE status = 'tamamlandi';
UPDATE tasks SET status = 'cancelled' WHERE status = 'iptal';

ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'assigned';
```

✅ Başarılı mesajı görürseniz → Adım 3'e geçin

### Adım 3: İkinci Migration'ı Çalıştır

Yeni bir query açıp şu SQL'i çalıştırın:

```sql
-- MIGRATION 2: GPS tablosunu düzelt
ALTER TABLE gps_locations RENAME COLUMN personnel_id TO user_id;

DROP INDEX IF EXISTS idx_gps_personnel_time;
CREATE INDEX idx_gps_user_time ON gps_locations(user_id, recorded_at DESC);
```

✅ Başarılı!

### Adım 4: Kontrol Et

```sql
-- Sütunların doğru olup olmadığını kontrol et
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'tasks';
```

Görmeli olduğunuz sütunlar:
- `id`
- `title` ✅
- `description` ✅
- `assigned_to` ✅ (assigned_personnel DEĞİL!)
- `scheduled_start` ✅ (scheduled_date DEĞİL!)
- `status`
- `municipality_id`
- `created_by`

## ✅ ÇÖZÜM 2: Kodda Yaptığım İyileştirmeler

### 1. Console.log Eklendi
Artık tarayıcı console'unda hatayı görebileceksiniz:
- F12 tuşuna basın
- Console sekmesine gidin
- Görev oluştururken ne hatası aldığınızı görün

### 2. Daha İyi Hata Mesajları
- "Belediye bilgisi bulunamadı" → Profil eksik
- "Görev oluşturulamadı: [detay]" → Database hatası

### 3. Bildirim Hatası Görev Oluşturmayı Engellemez
Bildirim oluşturulamazsa bile görev oluşturulur.

## 🧪 Test Adımları

### 1. Migration'ları çalıştırdınız mı? ✅
- Evet → Adım 2'ye geç
- Hayır → Yukarıdaki SQL'leri çalıştır

### 2. Uygulamayı Test Et
1. Uygulamayı yenileyin (Ctrl+F5)
2. F12 ile Console'u açın
3. Admin olarak giriş yapın
4. `/admin/tasks` sayfasına gidin
5. Görev oluşturun

### 3. Console'da Ne Görüyorsunuz?

#### Senaryo A: "Profile data: { municipality_id: '...' }"
✅ Profil OK! Migration kontrolüne geç.

#### Senaryo B: "Profile data: { municipality_id: null }"
❌ Profil tamamlanmamış!
**Çözüm**: `/complete-profile` sayfasına gidin ve profili tamamlayın.

#### Senaryo C: "Task error details: { code: '42703', message: 'column ... does not exist' }"
❌ Migration çalıştırılmamış!
**Çözüm**: Yukarıdaki SQL'leri Supabase'de çalıştırın.

## 📞 Sonuç Bildirimi

Migration'ları çalıştırdıktan sonra:
1. ✅ Başarılı olduysa → Harika! Diğer özelliklere geçebiliriz
2. ❌ Hala hata alıyorsanız → Console'daki TAMAMINI bana gönderin

## 🎁 Bonus: Vercel'e Deploy

Migration'lar Supabase'de çalıştığı için Vercel'e yeniden deploy etmeye gerek YOK!
Sadece kod değişikliklerini push edin:

```bash
git add .
git commit -m "fix: Görev atama hata ayıklama ve iyileştirmeler"
git push origin main
```
