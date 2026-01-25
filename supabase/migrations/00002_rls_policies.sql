-- Row Level Security (RLS) Policies
-- Multi-tenant isolation

-- Enable RLS on all tables
ALTER TABLE municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper Functions
CREATE OR REPLACE FUNCTION get_user_municipality_id()
RETURNS UUID AS $$
  SELECT municipality_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can view same municipality profiles"
  ON profiles FOR SELECT
  USING (municipality_id = get_user_municipality_id());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can manage municipality profiles"
  ON profiles FOR ALL
  USING (
    municipality_id = get_user_municipality_id()
    AND get_user_role() IN ('admin', 'supervisor')
  );

-- MUNICIPALITIES POLICIES
CREATE POLICY "Users can view own municipality"
  ON municipalities FOR SELECT
  USING (id = get_user_municipality_id());

-- ROUTES POLICIES
CREATE POLICY "Users can view municipality routes"
  ON routes FOR SELECT
  USING (municipality_id = get_user_municipality_id());

CREATE POLICY "Admins can manage routes"
  ON routes FOR ALL
  USING (
    municipality_id = get_user_municipality_id()
    AND get_user_role() IN ('admin', 'supervisor')
  );

-- TASKS POLICIES
CREATE POLICY "Users can view municipality tasks"
  ON tasks FOR SELECT
  USING (municipality_id = get_user_municipality_id());

CREATE POLICY "Personnel can view assigned tasks"
  ON tasks FOR SELECT
  USING (assigned_personnel = auth.uid());

CREATE POLICY "Admins can manage tasks"
  ON tasks FOR ALL
  USING (
    municipality_id = get_user_municipality_id()
    AND get_user_role() IN ('admin', 'supervisor')
  );

CREATE POLICY "Personnel can update own tasks"
  ON tasks FOR UPDATE
  USING (
    assigned_personnel = auth.uid()
    AND get_user_role() = 'personnel'
  )
  WITH CHECK (assigned_personnel = auth.uid());

-- GPS_LOCATIONS POLICIES
CREATE POLICY "Users can insert own location"
  ON gps_locations FOR INSERT
  WITH CHECK (personnel_id = auth.uid());

CREATE POLICY "Admins can view municipality locations"
  ON gps_locations FOR SELECT
  USING (
    personnel_id IN (
      SELECT id FROM profiles WHERE municipality_id = get_user_municipality_id()
    )
    AND get_user_role() IN ('admin', 'supervisor')
  );

CREATE POLICY "Users can view own locations"
  ON gps_locations FOR SELECT
  USING (personnel_id = auth.uid());

-- GPS_TRACES POLICIES
CREATE POLICY "Users can view municipality traces"
  ON gps_traces FOR SELECT
  USING (municipality_id = get_user_municipality_id());

CREATE POLICY "Admins can manage traces"
  ON gps_traces FOR ALL
  USING (
    municipality_id = get_user_municipality_id()
    AND get_user_role() IN ('admin', 'supervisor')
  );

-- INSPECTIONS POLICIES
CREATE POLICY "Users can view municipality inspections"
  ON inspections FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE municipality_id = get_user_municipality_id()
    )
  );

CREATE POLICY "Admins can manage inspections"
  ON inspections FOR ALL
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE municipality_id = get_user_municipality_id()
    )
    AND get_user_role() IN ('admin', 'supervisor')
  );

-- PERSONNEL_SCORES POLICIES
CREATE POLICY "Users can view municipality scores"
  ON personnel_scores FOR SELECT
  USING (municipality_id = get_user_municipality_id());

CREATE POLICY "Users can view own scores"
  ON personnel_scores FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Admins can manage scores"
  ON personnel_scores FOR ALL
  USING (
    municipality_id = get_user_municipality_id()
    AND get_user_role() IN ('admin', 'supervisor')
  );

-- TICKETS POLICIES
CREATE POLICY "Users can view municipality tickets"
  ON tickets FOR SELECT
  USING (municipality_id = get_user_municipality_id());

CREATE POLICY "Admins can manage tickets"
  ON tickets FOR ALL
  USING (
    municipality_id = get_user_municipality_id()
    AND get_user_role() IN ('admin', 'supervisor')
  );

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- AUDIT_LOGS POLICIES
CREATE POLICY "Users can view municipality audit logs"
  ON audit_logs FOR SELECT
  USING (
    municipality_id = get_user_municipality_id()
    AND get_user_role() IN ('admin', 'supervisor')
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);
