-- BTS (Belediye Temizlik Sistemi) Initial Schema
-- Multi-tenant SaaS for municipality cleaning operations

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Municipalities (Tenants)
CREATE TABLE municipalities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  city TEXT,
  district TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  subscription_plan TEXT DEFAULT 'basic',
  is_active BOOLEAN DEFAULT true,
  contact_person VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles (User Profiles)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'supervisor', 'personnel')),
  municipality_id UUID REFERENCES municipalities(id),
  city VARCHAR(50),
  district VARCHAR(100),
  department VARCHAR(100),
  employee_id VARCHAR(50),
  phone VARCHAR(20),
  unit TEXT,
  status VARCHAR(20) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Routes
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipality_id UUID REFERENCES municipalities(id),
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  geojson JSONB,
  length_km NUMERIC(10,2),
  estimated_duration_minutes INTEGER,
  scheduled_miles NUMERIC,
  difficulty_level VARCHAR(20) DEFAULT 'orta',
  required_vehicle_type VARCHAR(50),
  district VARCHAR(100),
  active BOOLEAN DEFAULT true,
  last_cleaned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipality_id UUID REFERENCES municipalities(id),
  route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
  assigned_personnel UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  status TEXT DEFAULT 'beklemede' CHECK (status IN ('beklemede', 'devam_ediyor', 'tamamlandi', 'iptal')),
  assigned_vehicle TEXT,
  scheduled_miles NUMERIC,
  completed_miles NUMERIC,
  notes TEXT,
  weather_conditions VARCHAR(50),
  delay_reason TEXT,
  photo_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GPS Locations (Real-time)
CREATE TABLE gps_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  personnel_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  accuracy NUMERIC(6,2),
  speed NUMERIC(5,2),
  heading NUMERIC(5,2),
  altitude NUMERIC(7,2),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GPS Traces (Completed tasks)
CREATE TABLE gps_traces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipality_id UUID REFERENCES municipalities(id),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  vehicle TEXT,
  points JSONB NOT NULL,
  miles NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inspections
CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  inspector_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  grade TEXT NOT NULL CHECK (grade IN ('A', 'B', 'C', 'D')),
  litter_count INTEGER,
  notes TEXT,
  photos JSONB,
  signed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personnel Scores
CREATE TABLE personnel_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id),
  municipality_id UUID NOT NULL REFERENCES municipalities(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  tasks_completed INTEGER DEFAULT 0,
  tasks_on_time INTEGER DEFAULT 0,
  inspection_avg_grade NUMERIC,
  total_km NUMERIC DEFAULT 0,
  bonus_points INTEGER DEFAULT 0,
  penalty_points INTEGER DEFAULT 0,
  final_score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets (Support Requests)
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipality_id UUID REFERENCES municipalities(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'acik' CHECK (status IN ('acik', 'atandi', 'kapali')),
  priority TEXT DEFAULT 'orta' CHECK (priority IN ('dusuk', 'orta', 'yuksek', 'acil')),
  reported_by_unit TEXT,
  channel TEXT,
  geo JSONB,
  location_lat NUMERIC(10,7),
  location_lng NUMERIC(10,7),
  district VARCHAR(100),
  reporter_name VARCHAR(255),
  reporter_phone VARCHAR(20),
  photo_urls TEXT[],
  related_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  municipality_id UUID NOT NULL REFERENCES municipalities(id),
  title TEXT NOT NULL,
  body TEXT,
  type TEXT NOT NULL CHECK (type IN ('task_assigned', 'task_reminder', 'inspection_result', 'system', 'ticket_update')),
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipality_id UUID REFERENCES municipalities(id),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  before JSONB,
  after JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_municipality ON profiles(municipality_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_routes_municipality ON routes(municipality_id);
CREATE INDEX idx_routes_active ON routes(active);
CREATE INDEX idx_tasks_municipality ON tasks(municipality_id);
CREATE INDEX idx_tasks_assigned_personnel ON tasks(assigned_personnel);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_scheduled_date ON tasks(scheduled_date);
CREATE INDEX idx_gps_personnel_time ON gps_locations(personnel_id, recorded_at DESC);
CREATE INDEX idx_gps_task_time ON gps_locations(task_id, recorded_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_audit_logs_municipality ON audit_logs(municipality_id, created_at DESC);
