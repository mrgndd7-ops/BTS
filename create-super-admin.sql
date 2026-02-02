-- =====================================================
-- SUPER ADMIN HESABI OLUŞTURMA
-- Tüm Türkiye'deki tüm belediyelerin personellerini görebilir
-- =====================================================

-- 1. Auth user oluştur (Supabase Dashboard'dan)
-- Email: demo@bts-sunum.com
-- Password: BTS2026Demo!
-- Veya istediğin email/password

-- 2. User ID'yi al (Supabase Dashboard → Authentication → Users)
-- Örnek: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'

-- 3. Profile oluştur (USER_ID'yi değiştir!)
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  municipality_id,
  city,
  district,
  status,
  created_at,
  updated_at
) VALUES (
  'USER_ID_BURAYA_YAZ', -- Supabase'den aldığın user ID
  'demo@bts-sunum.com',
  'Demo Super Admin',
  'super_admin', -- 🌟 SUPER ADMIN ROLE
  NULL, -- Municipality ID yok (tüm belediyeleri görür)
  'Türkiye',
  'Genel',
  'active',
  NOW(),
  NOW()
);

-- =====================================================
-- KULLANIM ADIMLARI:
-- =====================================================
-- 1. Supabase Dashboard → Authentication → Add User
--    - Email: demo@bts-sunum.com
--    - Password: BTS2026Demo!
--    - Auto Confirm User: ✅ (email confirmation atlansın)
--
-- 2. User oluşturulduktan sonra ID'sini kopyala
--
-- 3. Supabase Dashboard → SQL Editor → New Query
--    - Yukarıdaki INSERT query'yi yapıştır
--    - 'USER_ID_BURAYA_YAZ' kısmını kopyaladığın ID ile değiştir
--    - Run query
--
-- 4. Login ol:
--    - Email: demo@bts-sunum.com
--    - Password: BTS2026Demo!
--
-- 5. Admin panel:
--    ✅ Personel: TÜM Türkiye'deki personeller
--    ✅ Harita: TÜM Türkiye'deki canlı takip
--    ✅ Görevler: TÜM belediyelerin görevleri
-- =====================================================

-- ÖNEMLİ NOTLAR:
-- - Super Admin municipality_id = NULL (tüm belediyeleri görür)
-- - Normal Admin municipality_id = 'xxx' (sadece kendi belediyesi)
-- - Personnel role = 'personnel' (normal personel)
-- - Admin role = 'admin' (belediye yöneticisi)
-- - Super Admin role = 'super_admin' (Türkiye geneli)

-- DEMO SONRASI SİLMEK İÇİN:
-- DELETE FROM public.profiles WHERE email = 'demo@bts-sunum.com';
-- Supabase Dashboard → Authentication → Users → Delete user
