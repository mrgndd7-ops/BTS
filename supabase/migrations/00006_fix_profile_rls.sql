-- Fix: Profile RLS policies to allow incomplete profiles

-- Drop existing profile policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view same municipality profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage municipality profiles" ON profiles;

-- Recreate with better logic

-- 1. Users can ALWAYS view their own profile (even if incomplete)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- 2. Users can view profiles in same municipality (only if they have municipality_id)
CREATE POLICY "Users can view same municipality profiles"
  ON profiles FOR SELECT
  USING (
    municipality_id IS NOT NULL 
    AND municipality_id = get_user_municipality_id()
  );

-- 3. Users can ALWAYS update their own profile (needed for profile completion)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 4. Admins can manage profiles in their municipality
CREATE POLICY "Admins can manage municipality profiles"
  ON profiles FOR ALL
  USING (
    municipality_id IS NOT NULL
    AND municipality_id = get_user_municipality_id()
    AND get_user_role() IN ('admin', 'supervisor')
  );

-- 5. Allow insert for new profiles (needed for trigger)
CREATE POLICY "Allow profile creation"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());
