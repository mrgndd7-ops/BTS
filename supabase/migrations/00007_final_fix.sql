-- Final Fix: Disable trigger and fix RLS for manual profile creation

-- 1. Drop the trigger (we create profiles manually now)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop existing profile policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view same municipality profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage municipality profiles" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;

-- 3. Create simple, working policies

-- Allow users to view their own profile (always)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Allow users to view profiles in same municipality
CREATE POLICY "Users can view same municipality profiles"
  ON profiles FOR SELECT
  USING (
    municipality_id IS NOT NULL 
    AND municipality_id = (SELECT municipality_id FROM profiles WHERE id = auth.uid())
  );

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow authenticated users to insert their own profile (for registration)
CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Allow admins to manage profiles in their municipality
CREATE POLICY "Admins can manage profiles"
  ON profiles FOR ALL
  USING (
    municipality_id IS NOT NULL
    AND municipality_id = (SELECT municipality_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'supervisor')
  );

-- 4. Ensure municipalities are readable by authenticated users
DROP POLICY IF EXISTS "Users can view own municipality" ON municipalities;
DROP POLICY IF EXISTS "Admins can manage own municipality" ON municipalities;

CREATE POLICY "Authenticated users can view municipalities"
  ON municipalities FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage own municipality"
  ON municipalities FOR ALL
  USING (
    id = (SELECT municipality_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'supervisor')
  );
