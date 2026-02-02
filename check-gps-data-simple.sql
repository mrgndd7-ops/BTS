-- GPS Locations Veri Kontrolü
-- RLS pasif olduğu için direkt sorgu

-- 1. Toplam GPS kayıt sayısı
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT device_id) as unique_devices,
  MIN(recorded_at) as oldest_record,
  MAX(recorded_at) as newest_record
FROM gps_locations;

-- 2. Son 10 GPS kaydı (detaylı)
SELECT 
  gl.id,
  gl.user_id,
  gl.device_id,
  gl.latitude,
  gl.longitude,
  gl.accuracy,
  gl.recorded_at,
  gl.task_id,
  p.full_name,
  p.role,
  t.title as task_title,
  t.status as task_status
FROM gps_locations gl
LEFT JOIN profiles p ON gl.user_id = p.id
LEFT JOIN tasks t ON gl.task_id = t.id
ORDER BY gl.recorded_at DESC
LIMIT 10;

-- 3. Kullanıcı bazında son konum
SELECT DISTINCT ON (gl.user_id)
  gl.user_id,
  p.full_name,
  p.role,
  gl.latitude,
  gl.longitude,
  gl.recorded_at,
  gl.task_id,
  t.status as task_status,
  EXTRACT(EPOCH FROM (NOW() - gl.recorded_at))/60 as minutes_ago
FROM gps_locations gl
LEFT JOIN profiles p ON gl.user_id = p.id
LEFT JOIN tasks t ON gl.task_id = t.id
WHERE gl.user_id IS NOT NULL
ORDER BY gl.user_id, gl.recorded_at DESC;

-- 4. Profile olmayan GPS kayıtları (bunlar haritada görünmez)
SELECT 
  COUNT(*) as orphaned_gps_records
FROM gps_locations gl
WHERE gl.user_id IS NULL 
   OR NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = gl.user_id);

-- 5. Bugünkü GPS kayıtları
SELECT 
  COUNT(*) as today_records,
  COUNT(DISTINCT user_id) as active_users_today
FROM gps_locations
WHERE recorded_at >= CURRENT_DATE;
