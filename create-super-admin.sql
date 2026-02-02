-- =====================================================
-- SUPER ADMIN HESABI OLUŞTURMA
-- Tüm Türkiye'deki tüm belediyelerin personellerini görebilir
-- =====================================================

-- 1. ✅ Auth user ZATEN MEVCUT
-- Email: (Mevcut kullanıcının email'i)
-- Password: 12345
-- User ID: 6ead77d3-3fd3-4f81-9945-5ccca5f95dc1

-- 2. ✅ Profile oluştur (READY TO RUN!)
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
  '6ead77d3-3fd3-4f81-9945-5ccca5f95dc1', -- ✅ Senin User ID
  'demo@bts-sunum.com',
  'Demo Super Admin',
  'super_admin', -- 🌟 SUPER ADMIN ROLE
  NULL, -- Municipality ID yok (tüm belediyeleri görür)
  'Türkiye',
  'Genel',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (id) 
DO UPDATE SET
  role = 'super_admin',
  municipality_id = NULL,
  city = 'Türkiye',
  district = 'Genel',
  updated_at = NOW();

-- =====================================================
-- KULLANIM ADIMLARI:
-- =====================================================
-- 1. ✅ User zaten mevcut!
--    - User ID: 6ead77d3-3fd3-4f81-9945-5ccca5f95dc1
--    - Password: 12345
--
-- 2. Supabase Dashboard → SQL Editor → New Query
--    - Yukarıdaki INSERT query'yi KOPYALA
--    - RUN yap (tek tık!)
--
-- 3. Login ol:
--    - Email: (Senin mevcut email)
--    - Password: 12345
--
-- 4. Admin panel:
--    ✅ Personel: TÜM Türkiye'deki personeller
--    ✅ Harita: TÜM Türkiye'deki canlı takip
--    ✅ Görevler: TÜM belediyelerin görevleri
--
-- NOT: Eğer profile zaten varsa, CONFLICT durumunda
--      role 'super_admin' olarak UPDATE edilir!
-- =====================================================

-- ÖNEMLİ NOTLAR:
-- - Super Admin municipality_id = NULL (tüm belediyeleri görür)
-- - Normal Admin municipality_id = 'xxx' (sadece kendi belediyesi)
-- - Personnel role = 'personnel' (normal personel)
-- - Admin role = 'admin' (belediye yöneticisi)
-- - Super Admin role = 'super_admin' (Türkiye geneli)

-- DEMO SONRASI ESKİ ROLE'E DÖNDÜRMEk İÇİN:
-- UPDATE public.profiles 
-- SET role = 'admin', municipality_id = 'ESKİ_MUNICIPALITY_ID' 
-- WHERE id = '6ead77d3-3fd3-4f81-9945-5ccca5f95dc1';
