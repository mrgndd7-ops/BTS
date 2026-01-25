-- Türkiye Belediyeleri - İstanbul (Büyükşehir İlçe Belediyeleri)
-- Mevcut 5 belediyenin üzerine ekleme yapıyor

INSERT INTO municipalities (name, code, city, district, is_active) VALUES
  -- İstanbul İlçe Belediyeleri (39 ilçe)
  ('Adalar Belediyesi', 'istanbul-adalar', 'İstanbul', 'Adalar', true),
  ('Arnavutköy Belediyesi', 'istanbul-arnavutkoy', 'İstanbul', 'Arnavutköy', true),
  ('Ataşehir Belediyesi', 'istanbul-atasehir', 'İstanbul', 'Ataşehir', true),
  ('Avcılar Belediyesi', 'istanbul-avcilar', 'İstanbul', 'Avcılar', true),
  ('Bağcılar Belediyesi', 'istanbul-bagcilar', 'İstanbul', 'Bağcılar', true),
  ('Bahçelievler Belediyesi', 'istanbul-bahcelievler', 'İstanbul', 'Bahçelievler', true),
  ('Bakırköy Belediyesi', 'istanbul-bakirkoy', 'İstanbul', 'Bakırköy', true),
  ('Başakşehir Belediyesi', 'istanbul-basaksehir', 'İstanbul', 'Başakşehir', true),
  ('Bayrampaşa Belediyesi', 'istanbul-bayrampasa', 'İstanbul', 'Bayrampaşa', true),
  ('Beykoz Belediyesi', 'istanbul-beykoz', 'İstanbul', 'Beykoz', true),
  ('Beylikdüzü Belediyesi', 'istanbul-beylikduzu', 'İstanbul', 'Beylikdüzü', true),
  ('Beyoğlu Belediyesi', 'istanbul-beyoglu', 'İstanbul', 'Beyoğlu', true),
  ('Büyükçekmece Belediyesi', 'istanbul-buyukcekmece', 'İstanbul', 'Büyükçekmece', true),
  ('Çatalca Belediyesi', 'istanbul-catalca', 'İstanbul', 'Çatalca', true),
  ('Çekmeköy Belediyesi', 'istanbul-cekmekoy', 'İstanbul', 'Çekmeköy', true),
  ('Esenler Belediyesi', 'istanbul-esenler', 'İstanbul', 'Esenler', true),
  ('Esenyurt Belediyesi', 'istanbul-esenyurt', 'İstanbul', 'Esenyurt', true),
  ('Eyüpsultan Belediyesi', 'istanbul-eyupsultan', 'İstanbul', 'Eyüpsultan', true),
  ('Fatih Belediyesi', 'istanbul-fatih', 'İstanbul', 'Fatih', true),
  ('Gaziosmanpaşa Belediyesi', 'istanbul-gaziosmanpasa', 'İstanbul', 'Gaziosmanpaşa', true),
  ('Güngören Belediyesi', 'istanbul-gungoren', 'İstanbul', 'Güngören', true),
  ('Kağıthane Belediyesi', 'istanbul-kagithane', 'İstanbul', 'Kağıthane', true),
  ('Kartal Belediyesi', 'istanbul-kartal', 'İstanbul', 'Kartal', true),
  ('Küçükçekmece Belediyesi', 'istanbul-kucukcekmece', 'İstanbul', 'Küçükçekmece', true),
  ('Maltepe Belediyesi', 'istanbul-maltepe', 'İstanbul', 'Maltepe', true),
  ('Pendik Belediyesi', 'istanbul-pendik', 'İstanbul', 'Pendik', true),
  ('Sancaktepe Belediyesi', 'istanbul-sancaktepe', 'İstanbul', 'Sancaktepe', true),
  ('Sarıyer Belediyesi', 'istanbul-sariyer', 'İstanbul', 'Sarıyer', true),
  ('Silivri Belediyesi', 'istanbul-silivri', 'İstanbul', 'Silivri', true),
  ('Sultanbeyli Belediyesi', 'istanbul-sultanbeyli', 'İstanbul', 'Sultanbeyli', true),
  ('Sultangazi Belediyesi', 'istanbul-sultangazi', 'İstanbul', 'Sultangazi', true),
  ('Şile Belediyesi', 'istanbul-sile', 'İstanbul', 'Şile', true),
  ('Şişli Belediyesi', 'istanbul-sisli', 'İstanbul', 'Şişli', true),
  ('Tuzla Belediyesi', 'istanbul-tuzla', 'İstanbul', 'Tuzla', true),
  ('Ümraniye Belediyesi', 'istanbul-umraniye', 'İstanbul', 'Ümraniye', true),
  ('Zeytinburnu Belediyesi', 'istanbul-zeytinburnu', 'İstanbul', 'Zeytinburnu', true)
ON CONFLICT (code) DO NOTHING;

-- İstatistik: Toplam kaç belediye eklendi
SELECT 
  city,
  COUNT(*) as belediye_sayisi
FROM municipalities
WHERE city = 'İstanbul'
GROUP BY city;
