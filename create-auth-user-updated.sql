-- =====================================================
-- AUTH USER + PROFILE OLUŞTURMA (GÜNCEL ID)
-- =====================================================
-- User ID: b9e7143a-e3e3-4fb7-aaa0-5130eb80e4c1
-- Password: 123456
-- =====================================================

-- 1. Constraint güncelle (super_admin role ekle)
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'supervisor', 'personnel', 'super_admin'));

-- 2. Profile oluştur/güncelle
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
  'b9e7143a-e3e3-4fb7-aaa0-5130eb80e4c1',
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
  id, 
  email, 
  full_name, 
  role, 
  municipality_id,
  city,
  district,
  status
FROM public.profiles 
WHERE id = 'b9e7143a-e3e3-4fb7-aaa0-5130eb80e4c1';

-- =====================================================
-- BEKLENTİ:
-- =====================================================
-- ✅ Email: demo@bts-sunum.com
-- ✅ Password: 123456 (Supabase Dashboard'dan oluşturuldu)
-- ✅ User ID: b9e7143a-e3e3-4fb7-aaa0-5130eb80e4c1
-- ✅ Role: super_admin
-- ✅ Municipality: NULL (Türkiye geneli erişim)
-- ✅ Tüm belediyelerdeki personelleri görebilir
-- =====================================================

-- ⚠️ NOT: Auth user zaten Supabase Dashboard'dan oluşturuldu!
-- Bu SQL sadece PROFILE kaydını oluşturur/günceller.
