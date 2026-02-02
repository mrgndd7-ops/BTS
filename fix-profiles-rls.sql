-- FIX: Profiles RLS Policies
-- Bu SQL'i Supabase SQL Editor'da çalıştır

-- Step 1: Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view municipality profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles read access" ON profiles;

-- Step 2: CREATE NEW POLICIES

-- ✅ Herkes kendi profilini okuyabilir
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- ✅ Herkes kendi profilini güncelleyebilir
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ✅ Admin/Supervisor belediyesindeki tüm profilleri görebilir
CREATE POLICY "Admins can view municipality profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS viewer
      WHERE viewer.id = auth.uid()
        AND viewer.role IN ('admin', 'supervisor')
        AND viewer.municipality_id = profiles.municipality_id
    )
  );

-- Step 3: RLS'in açık olduğundan emin ol
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Comments
COMMENT ON POLICY "Users can view own profile" ON profiles 
IS 'Users can view their own profile data';

COMMENT ON POLICY "Users can update own profile" ON profiles 
IS 'Users can update their own profile data';

COMMENT ON POLICY "Admins can view municipality profiles" ON profiles 
IS 'Admins/Supervisors can view all profiles in their municipality';
