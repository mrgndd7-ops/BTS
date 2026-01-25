-- Seed Data for Development

-- Insert sample municipalities
INSERT INTO municipalities (name, code, city, district, is_active) VALUES
  ('Kadıköy Belediyesi', 'kadikoy', 'İstanbul', 'Kadıköy', true),
  ('Beşiktaş Belediyesi', 'besiktas', 'İstanbul', 'Beşiktaş', true),
  ('Üsküdar Belediyesi', 'uskudar', 'İstanbul', 'Üsküdar', true),
  ('Çankaya Belediyesi', 'cankaya', 'Ankara', 'Çankaya', true),
  ('Konak Belediyesi', 'konak', 'İzmir', 'Konak', true)
ON CONFLICT (code) DO NOTHING;

-- Note: Actual user profiles will be created via the application
-- after authentication through Supabase Auth

-- Sample Routes (for Kadıköy Municipality)
INSERT INTO routes (
  municipality_id,
  code,
  name,
  description,
  length_km,
  estimated_duration_minutes,
  difficulty_level,
  district,
  active
) 
SELECT 
  m.id,
  'R-' || LPAD(seq::TEXT, 3, '0'),
  'Kadıköy Rota ' || seq,
  'Kadıköy merkez temizlik rotası ' || seq,
  (RANDOM() * 10 + 5)::NUMERIC(10,2),
  (RANDOM() * 120 + 60)::INTEGER,
  (ARRAY['kolay', 'orta', 'zor'])[FLOOR(RANDOM() * 3 + 1)],
  'Kadıköy',
  true
FROM municipalities m
CROSS JOIN generate_series(1, 10) AS seq
WHERE m.code = 'kadikoy'
ON CONFLICT (code) DO NOTHING;

-- Note: Tasks, GPS locations, and other operational data
-- will be created through the application interface
