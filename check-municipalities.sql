-- =====================================================
-- BELEDİYE KONTROL VE TEST
-- =====================================================

-- 1. Kaç belediye var?
SELECT 
  city,
  COUNT(*) as belediye_sayisi,
  COUNT(*) FILTER (WHERE is_active = true) as aktif_belediye
FROM municipalities
GROUP BY city
ORDER BY belediye_sayisi DESC
LIMIT 20;

-- 2. İstanbul'da belediye var mı?
SELECT * FROM municipalities 
WHERE city = 'İstanbul' 
AND is_active = true
ORDER BY name;

-- 3. Eğer İstanbul yoksa, hangi iller var?
SELECT DISTINCT city 
FROM municipalities 
WHERE is_active = true
ORDER BY city;

-- =====================================================
-- EĞER İSTANBUL YOKSA EKLEYELİM (ÖRNEKLERİ)
-- =====================================================

-- Test için bazı İstanbul belediyeleri ekle:
INSERT INTO municipalities (name, city, district, is_active, created_at, updated_at)
VALUES 
  ('Kadıköy Belediyesi', 'İstanbul', 'Kadıköy', true, NOW(), NOW()),
  ('Beşiktaş Belediyesi', 'İstanbul', 'Beşiktaş', true, NOW(), NOW()),
  ('Üsküdar Belediyesi', 'İstanbul', 'Üsküdar', true, NOW(), NOW()),
  ('Beyoğlu Belediyesi', 'İstanbul', 'Beyoğlu', true, NOW(), NOW()),
  ('Şişli Belediyesi', 'İstanbul', 'Şişli', true, NOW(), NOW())
ON CONFLICT (name, city, district) DO NOTHING;

-- VEYA TÜM TÜRKİYE BELEDİYELERİ:
-- (Daha önce 00008_add_istanbul_municipalities.sql ve 
--  00009_add_all_turkey_municipalities.sql migration'ları çalıştırıldı mı?)

-- Kontrol:
SELECT * FROM municipalities 
WHERE city = 'İstanbul'
ORDER BY name;
