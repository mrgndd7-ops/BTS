-- =====================================================
-- SÜPER ADMİN TAMAMEN BAŞTAN KURULUM
-- =====================================================
-- Email: demo@bts-sunum.com
-- Password: 123456
-- Role: super_admin
-- =====================================================

-- =====================================================
-- 1. ADIM: ROLE CHECK CONSTRAINT'İ GÜNCELLE
-- =====================================================
-- super_admin role'ünü profiles tablosuna ekle

ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'supervisor', 'personnel', 'super_admin'));

-- =====================================================
-- 2. ADIM: SUPABASE DASHBOARD'DAN USER OLUŞTUR
-- =====================================================
-- ⚠️ MANUEL ADIM - Supabase Dashboard'da:
-- 
-- Authentication → Users → "Add User"
-- 
-- ✏️ Email: demo@bts-sunum.com
-- ✏️ Password: 123456
-- ✏️ Auto Confirm Email: YES (✅ işaretle)
-- 
-- "Create User" butonuna tıkla
-- 
-- User ID'yi kopyala (UUID formatında)
-- Örnek: b9e7143a-e3e3-4fb7-aaa0-5130eb80e4c1
-- 
-- ⬇️ Aşağıdaki INSERT statement'taki 'USER_ID_BURAYA' 
--    kısmını kopyaladığın ID ile değiştir!
-- =====================================================

-- =====================================================
-- 3. ADIM: PROFILE OLUŞTUR
-- =====================================================
-- ⚠️ USER_ID_BURAYA kısmını yukarıda oluşturduğun 
--    user'ın ID'si ile değiştir!

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
  'USER_ID_BURAYA', -- ⚠️ BURAYA USER ID YAPIŞTIRILACAK
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
-- 4. ADIM: KONTROL ET
-- =====================================================
-- ⚠️ USER_ID_BURAYA kısmını user ID'si ile değiştir!

SELECT 
  'Auth User:' as type,
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'demo@bts-sunum.com'

UNION ALL

SELECT 
  'Profile:' as type,
  id::text,
  email,
  created_at::timestamptz,
  updated_at
FROM public.profiles 
WHERE email = 'demo@bts-sunum.com';

-- =====================================================
-- SONUÇ BEKLENTISI:
-- =====================================================
-- ✅ Auth User bulundu
-- ✅ Email confirmed: YES
-- ✅ Profile role: super_admin
-- ✅ Municipality: NULL (Türkiye geneli)
-- ✅ Login: demo@bts-sunum.com / 123456
-- =====================================================

-- =====================================================
-- SUPER_ADMIN ÖZELLIKLERI:
-- =====================================================
-- ✅ municipality_id = NULL → TÜM Türkiye
-- ✅ Admin panelinde TÜM belediyelerin personellerini görür
-- ✅ Haritada TÜM personellerin konumlarını görür
-- ✅ Multi-tenant filtresi bypass edilir (kod tarafında)
-- =====================================================

-- =====================================================
-- NOT: Eğer email doğrulama istemiyorsan:
-- =====================================================
-- Supabase Dashboard → Authentication → Settings
-- → "Enable Email Confirmations" → KAPALI
-- 
-- Böylece yeni kayıtlar otomatik onaylı olur
-- =====================================================
