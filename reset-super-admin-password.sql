-- =====================================================
-- SÜPER ADMIN ŞİFRESİNİ SIFIRLA
-- =====================================================
-- User ID: b9e7143a-e3e3-4fb7-aaa0-5130eb80e4c1
-- Yeni Şifre: 123456
-- =====================================================

-- 1. Auth user'ın şifresini güncelle
UPDATE auth.users
SET 
  encrypted_password = crypt('123456', gen_salt('bf')),
  updated_at = NOW()
WHERE id = 'b9e7143a-e3e3-4fb7-aaa0-5130eb80e4c1';

-- 2. Email confirmed olduğundan emin ol
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  confirmation_token = ''
WHERE id = 'b9e7143a-e3e3-4fb7-aaa0-5130eb80e4c1'
  AND email_confirmed_at IS NULL;

-- 3. KONTROL ET
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  CASE 
    WHEN encrypted_password IS NOT NULL THEN '✅ Şifre var'
    ELSE '❌ Şifre yok'
  END as password_status
FROM auth.users 
WHERE id = 'b9e7143a-e3e3-4fb7-aaa0-5130eb80e4c1';

-- 4. Profile kontrolü
SELECT 
  'Profile:' as type,
  id, 
  email, 
  full_name, 
  role, 
  municipality_id,
  status
FROM public.profiles 
WHERE id = 'b9e7143a-e3e3-4fb7-aaa0-5130eb80e4c1';

-- =====================================================
-- BEKLENTİ:
-- =====================================================
-- ✅ Auth user: demo@bts-sunum.com
-- ✅ Password: 123456 (bcrypt hash)
-- ✅ Email confirmed: YES
-- ✅ Profile: super_admin
-- ✅ Login çalışacak!
-- =====================================================
