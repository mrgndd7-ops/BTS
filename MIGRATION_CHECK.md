# ⚠️ ÖNEMLİ: Migration Kontrolü

## Hatanın Muhtemel Nedeni

Görev oluşturma hatası muhtemelen **migration'ların çalıştırılmaması**ndan kaynaklanıyor.

## ✅ Supabase'de Çalıştırmanız Gereken SQL'ler

### 1️⃣ İlk Migration (00010_fix_tasks_schema.sql)

Supabase Dashboard → SQL Editor'a gidin ve şunu çalıştırın:

```sql
-- Fix tasks table schema to match code expectations

-- 1. Rename columns
ALTER TABLE tasks RENAME COLUMN assigned_personnel TO assigned_to;
ALTER TABLE tasks RENAME COLUMN scheduled_date TO scheduled_start;

-- 2. Change scheduled_start type from DATE to TIMESTAMPTZ
ALTER TABLE tasks ALTER COLUMN scheduled_start TYPE TIMESTAMPTZ;

-- 3. Add missing columns
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT;

-- 4. Update status constraint to match code values
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
  CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled'));

-- 5. Update existing status values
UPDATE tasks SET status = 'assigned' WHERE status = 'beklemede';
UPDATE tasks SET status = 'in_progress' WHERE status = 'devam_ediyor';
UPDATE tasks SET status = 'completed' WHERE status = 'tamamlandi';
UPDATE tasks SET status = 'cancelled' WHERE status = 'iptal';

-- 6. Change default status
ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'assigned';
```

### 2️⃣ İkinci Migration (00011_fix_gps_column_name.sql)

```sql
-- Fix gps_locations table column name to match code expectations
-- Change personnel_id to user_id for consistency

ALTER TABLE gps_locations RENAME COLUMN personnel_id TO user_id;

-- Update index to use new column name
DROP INDEX IF EXISTS idx_gps_personnel_time;
CREATE INDEX idx_gps_user_time ON gps_locations(user_id, recorded_at DESC);
```

## 🔍 Test Etmek İçin

Migration'ları çalıştırdıktan sonra Supabase SQL Editor'de şunu çalıştırın:

```sql
-- Tasks tablosunun sütunlarını kontrol et
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;
```

Eğer `assigned_to`, `title`, `description` sütunları varsa migration başarılı! ✅

## 🐛 Hata Ayıklama

Tarayıcının Console'unu açın (F12) ve görev oluştururken hata mesajlarını kontrol edin.

## 📞 Sonuç

Migration'ları çalıştırdıktan sonra:
1. Sayfayı yenileyin (Ctrl+F5)
2. Tekrar görev oluşturmayı deneyin
3. Console'da hata var mı kontrol edin
4. Bana sonucu bildirin!
