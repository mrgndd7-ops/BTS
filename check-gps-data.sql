-- ============================================
-- GPS VERİSİ KONTROL SORGUSU
-- ============================================
-- Bu sorguyu Supabase SQL Editor'de çalıştır
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- 1. SON 10 GPS KAYDINI GÖSTER
SELECT 
  id,
  user_id,
  task_id,
  device_id,
  latitude,
  longitude,
  accuracy,
  speed,
  recorded_at,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - recorded_at)) / 60 as minutes_ago
FROM gps_locations
ORDER BY recorded_at DESC
LIMIT 10;

-- 2. USER BAZINDA SON GPS VERİSİ (PROFILE İLE BİRLEŞTİR)
SELECT 
  p.full_name,
  p.role,
  g.latitude,
  g.longitude,
  g.accuracy,
  g.task_id,
  g.recorded_at,
  EXTRACT(EPOCH FROM (NOW() - g.recorded_at)) / 60 as minutes_ago
FROM gps_locations g
INNER JOIN profiles p ON g.user_id = p.id
WHERE g.id IN (
  SELECT DISTINCT ON (user_id) id
  FROM gps_locations
  ORDER BY user_id, recorded_at DESC
)
ORDER BY g.recorded_at DESC;

-- 3. TASK BAZINDA GPS KAYITLARI
SELECT 
  t.title as task_name,
  p.full_name as personnel_name,
  COUNT(g.id) as gps_count,
  MAX(g.recorded_at) as last_gps_time,
  EXTRACT(EPOCH FROM (NOW() - MAX(g.recorded_at))) / 60 as minutes_since_last
FROM tasks t
INNER JOIN profiles p ON t.assigned_to = p.id
LEFT JOIN gps_locations g ON g.task_id = t.id
WHERE t.status = 'in_progress'
GROUP BY t.id, t.title, p.full_name
ORDER BY last_gps_time DESC;

-- 4. TOPLAM İSTATİSTİKLER
SELECT 
  COUNT(*) as total_gps_records,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT task_id) as tasks_with_gps,
  MIN(recorded_at) as first_record,
  MAX(recorded_at) as latest_record,
  EXTRACT(EPOCH FROM (NOW() - MAX(recorded_at))) / 60 as minutes_since_last_record
FROM gps_locations;

-- 5. SON 5 DAKİKADA GELEN GPS VERİSİ
SELECT 
  p.full_name,
  g.latitude,
  g.longitude,
  g.accuracy,
  g.recorded_at,
  EXTRACT(EPOCH FROM (NOW() - g.recorded_at)) as seconds_ago
FROM gps_locations g
INNER JOIN profiles p ON g.user_id = p.id
WHERE g.recorded_at > NOW() - INTERVAL '5 minutes'
ORDER BY g.recorded_at DESC;

-- 6. GPS KAYIT SIKLIĞI (SON 1 SAAT)
SELECT 
  user_id,
  p.full_name,
  COUNT(*) as gps_count,
  MIN(recorded_at) as first_record,
  MAX(recorded_at) as last_record,
  EXTRACT(EPOCH FROM (MAX(recorded_at) - MIN(recorded_at))) / 60 as tracking_duration_minutes
FROM gps_locations g
INNER JOIN profiles p ON g.user_id = p.id
WHERE g.recorded_at > NOW() - INTERVAL '1 hour'
GROUP BY user_id, p.full_name
ORDER BY last_record DESC;
