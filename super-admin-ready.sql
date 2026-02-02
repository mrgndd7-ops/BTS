-- =====================================================
-- SÜPER ADMİN PROFİLE OLUŞTURMA (HAZIR)
-- =====================================================
-- User ID: fcb042e6-09d3-4fd3-8bf4-af3d91e8f118
-- Email: demo@bts-sunum.com
-- Password: 123456 (Auth'da zaten mevcut)
-- Role: super_admin
-- =====================================================

-- 1. CONSTRAINT GÜNCELLE (super_admin role ekle)
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'supervisor', 'personnel', 'super_admin'));

-- 2. PROFILE OLUŞTUR/GÜNCELLE
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
  'fcb042e6-09d3-4fd3-8bf4-af3d91e8f118',
  'demo@bts-sunum.com',
  'Demo Super Admin',
  'super_admin',
  NULL, -- TÜM Türkiye erişimi
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
  full_name = 'Demo Super Admin',
  email = 'demo@bts-sunum.com',
  updated_at = NOW();

-- 3. KONTROL ET
SELECT 
  'Auth User:' as type,
  id::text,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE id = 'fcb042e6-09d3-4fd3-8bf4-af3d91e8f118'

UNION ALL

SELECT 
  'Profile:' as type,
  id::text,
  email,
  created_at::timestamptz,
  updated_at
FROM public.profiles 
WHERE id = 'fcb042e6-09d3-4fd3-8bf4-af3d91e8f118';

-- 4. ROLE KONTROLÜ
SELECT 
  id,
  email,
  full_name,
  role,
  municipality_id,
  city,
  district,
  status
FROM public.profiles 
WHERE id = 'fcb042e6-09d3-4fd3-8bf4-af3d91e8f118';

-- =====================================================
-- SONUÇ BEKLENTİSİ:
-- =====================================================
-- ✅ Auth User: demo@bts-sunum.com
-- ✅ Email confirmed: YES
-- ✅ Profile role: super_admin
-- ✅ Municipality: NULL (Türkiye geneli)
-- ✅ Status: active
-- =====================================================

-- =====================================================
-- LOGİN BİLGİLERİ:
-- =====================================================
-- Email: demo@bts-sunum.com
-- Password: 123456
-- =====================================================

-- =====================================================
-- SUPER_ADMIN YETKİLERİ:
-- =====================================================
-- ✅ TÜM Türkiye personellerini görür
-- ✅ TÜM belediyelerin GPS verilerini görür
-- ✅ Multi-tenant filtresi bypass edilir
-- ✅ Admin panelinde tüm veriler görünür
-- =====================================================
