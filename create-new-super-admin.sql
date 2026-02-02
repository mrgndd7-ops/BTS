-- =====================================================
-- YENİ SÜPER ADMİN HESABI (Dashboard'dan oluştur)
-- =====================================================

-- ⚠️ ÖNCELİKLE:
-- 1. Supabase Dashboard → Authentication → Users → "Add User"
-- 2. Email: superadmin@demo.com
-- 3. Password: 123456
-- 4. User ID'yi kopyala ve aşağıdaki 'YOUR_USER_ID_HERE' yerine yapıştır

-- =====================================================
-- CONSTRAINT GÜNCELLEMESİ
-- =====================================================
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'supervisor', 'personnel', 'super_admin'));

-- =====================================================
-- PROFILE OLUŞTURMA
-- =====================================================
-- ⚠️ 'YOUR_USER_ID_HERE' yerine Dashboard'dan kopyaladığın ID'yi yapıştır!

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
  'YOUR_USER_ID_HERE', -- ⚠️ BURAYA USER ID YAPISTIR!
  'superadmin@demo.com',
  'Süper Admin',
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
  full_name = 'Süper Admin',
  email = 'superadmin@demo.com',
  updated_at = NOW();

-- =====================================================
-- KONTROL
-- =====================================================
-- Auth user kontrolü (manuel Dashboard'dan oluşturuldu)
-- Profile kontrolü:
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
WHERE email = 'superadmin@demo.com';

-- =====================================================
-- BEKLENTİ:
-- =====================================================
-- ✅ Email: superadmin@demo.com
-- ✅ Password: 123456
-- ✅ Role: super_admin
-- ✅ Municipality: NULL (Türkiye geneli)
-- ✅ Login çalışacak!
-- =====================================================

-- =====================================================
-- VEYA ESKİ HESABI KULLAN (b9e7143a-e3e3-4fb7-aaa0-5130eb80e4c1)
-- =====================================================
-- Eğer eski hesabı kullanmak istersen:
-- reset-super-admin-password.sql dosyasını çalıştır!
-- =====================================================
