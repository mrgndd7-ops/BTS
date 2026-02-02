-- =====================================================
-- SÜPER ADMIN HESABI OLUŞTURMA (ŞİFRE: 123456)
-- =====================================================

-- ⚠️ ÖNCE MANUEL ADIM:
-- Supabase Dashboard → Authentication → Users → "Create New User"
-- Email: demo@bts-sunum.com
-- Password: 123456
-- User ID: 6ead77d3-3fd3-4f81-9945-5ccca5f95dc1

-- Veya SQL ile (eğer manuel oluşturulmazsa):
-- NOT: Auth user zaten varsa bu adımı ATLA!

-- =====================================================
-- 1. Constraint Güncelle (super_admin role ekle)
-- =====================================================
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'supervisor', 'personnel', 'super_admin'));

-- =====================================================
-- 2. Profile Oluştur/Güncelle
-- =====================================================
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

-- =====================================================
-- 3. KONTROL ET
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

-- =====================================================
-- BEKLENTİ:
-- =====================================================
-- ✅ Email: demo@bts-sunum.com
-- ✅ Password: 123456 (6 karakter, minimum şifre gereksinimi)
-- ✅ Role: super_admin
-- ✅ Municipality: NULL (Türkiye geneli erişim)
-- ✅ Tüm belediyelerdeki personelleri görebilir
-- =====================================================
