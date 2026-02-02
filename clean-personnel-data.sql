-- =====================================================
-- TÜM PERSONEL KULLANICILARI SİL VE TEMİZLE
-- =====================================================
-- ⚠️ UYARI: Bu script TÜM personnel role'üne sahip 
--           kullanıcıları ve onlara ait verileri siler!
-- =====================================================

-- 1. GPS verilerini sil (personnel'lere ait)
DELETE FROM public.gps_locations
WHERE user_id IN (
  SELECT id FROM public.profiles WHERE role = 'personnel'
);

-- 2. Görev atamalarını temizle (personnel'lere atanan)
UPDATE public.tasks
SET assigned_to = NULL
WHERE assigned_to IN (
  SELECT id FROM public.profiles WHERE role = 'personnel'
);

-- 3. Bildirimleri sil (personnel'lere ait)
DELETE FROM public.notifications
WHERE user_id IN (
  SELECT id FROM public.profiles WHERE role = 'personnel'
);

-- 4. Profile kayıtlarını sil
DELETE FROM public.profiles
WHERE role = 'personnel';

-- 5. Auth users'ları sil (personnel profiles'a ait)
-- ⚠️ NOT: Bu kısım Supabase Dashboard'dan manuel yapılmalı
-- Auth → Users → "personnel" role'üne sahip kullanıcıları tek tek sil

-- =====================================================
-- KONTROL SORULARI
-- =====================================================

-- Kalan personnel sayısı (0 olmalı)
SELECT COUNT(*) as personnel_count FROM public.profiles WHERE role = 'personnel';

-- Kalan GPS kayıtları (temizlenmişse 0, admin GPS'leri varsa onlar kalır)
SELECT COUNT(*) as gps_count FROM public.gps_locations;

-- Orphan (sahipsiz) görevler
SELECT COUNT(*) as orphan_tasks FROM public.tasks WHERE assigned_to IS NULL;

-- =====================================================
-- YENİ PERSONEL KAYIT ADIMLARI:
-- =====================================================
-- 1. Uygulamaya git: /register
-- 2. Yeni personel kaydı oluştur:
--    - Email: personel1@test.com
--    - Password: 123456 (minimum 6 karakter)
--    - Role: Personnel
--    - Şehir: İstanbul
--    - Belediye: Seçeneklerden birini seç
--    - Ad Soyad: Test Personel 1
--    - Telefon: 05551234567
-- 3. Kayıt tamamlandıktan sonra login ol
-- 4. Worker paneline erişebilmeli
-- =====================================================
