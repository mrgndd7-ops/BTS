-- =====================================================
-- AUTH USER + PROFILE OLUŞTURMA (TEK ADIMDA)
-- =====================================================

-- 1. Auth tablosunu kullanarak user oluştur
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '6ead77d3-3fd3-4f81-9945-5ccca5f95dc1',
  'authenticated',
  'authenticated',
  'demo@bts-sunum.com',
  crypt('123456', gen_salt('bf')), -- Bcrypt hash
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;

-- 2. Constraint güncelle
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'supervisor', 'personnel', 'super_admin'));

-- 3. Profile oluştur
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
  NULL,
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

-- 4. KONTROL ET
SELECT 'Auth User:' as type, id, email FROM auth.users WHERE id = '6ead77d3-3fd3-4f81-9945-5ccca5f95dc1'
UNION ALL
SELECT 'Profile:' as type, id, email FROM public.profiles WHERE id = '6ead77d3-3fd3-4f81-9945-5ccca5f95dc1';

-- =====================================================
-- BEKLENTİ:
-- ✅ Auth User: demo@bts-sunum.com (password: 123456)
-- ✅ Profile: super_admin role
-- ✅ Login çalışacak!
-- =====================================================
