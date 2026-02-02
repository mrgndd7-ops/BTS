-- =====================================================
-- SUPER_ADMIN ROLE'ÜNÜ DATABASE'E EKLEME
-- =====================================================

-- 1. Önce mevcut constraint'i kaldır
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Yeni constraint ekle (super_admin dahil)
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'supervisor', 'personnel', 'super_admin'));

-- 3. ŞIMDI profile'i oluştur/güncelle
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
  '6ead77d3-3fd3-4f81-9945-5ccca5f95dc1',
  'demo@bts-sunum.com',
  'Demo Super Admin',
  'super_admin', -- ✅ Artık geçerli
  NULL, -- TÜM Türkiye
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

-- =====================================================
-- KONTROL ET
-- =====================================================
SELECT 
  id, 
  email, 
  full_name, 
  role, 
  municipality_id,
  city,
  district
FROM public.profiles 
WHERE id = '6ead77d3-3fd3-4f81-9945-5ccca5f95dc1';

-- Sonuç:
-- ✅ role: super_admin
-- ✅ municipality_id: NULL
-- ✅ city: Türkiye
