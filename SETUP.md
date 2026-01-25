# BTS Kurulum Rehberi

## 🚀 Hızlı Başlangıç

### 1. Supabase Projesi Oluşturma

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni bir proje oluşturun
3. Proje ayarlarından API anahtarlarını alın

### 2. Environment Değişkenleri

Proje ana dizininde `.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Veritabanı Schema'sını Oluşturma

Supabase Dashboard'da SQL Editor'ü açın ve sırasıyla şu dosyaları çalıştırın:

1. `supabase/migrations/00001_initial_schema.sql` - Tabloları oluşturur
2. `supabase/migrations/00002_rls_policies.sql` - RLS politikalarını ayarlar
3. `supabase/migrations/00003_functions.sql` - Database fonksiyonlarını ekler
4. `supabase/migrations/00004_seed_data.sql` - Örnek verileri ekler (opsiyonel)

### 4. Uygulamayı Çalıştırma

```bash
# Bağımlılıkları yükle (zaten yüklü)
npm install

# Development server'ı başlat
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacak.

## 📝 İlk Kullanım

### 1. Yönetici Hesabı Oluşturma

1. [http://localhost:3000/register](http://localhost:3000/register) adresine gidin
2. E-posta ve şifre girin
3. **Rol olarak "Yönetici"** seçin
4. Kayıt olduktan sonra profil tamamlama sayfasına yönlendirileceksiniz

### 2. Profili Tamamlama

1. Ad Soyad bilgilerinizi girin
2. Telefon numaranızı girin
3. İl ve İlçe seçin
4. Belediye seçin (seed data çalıştırdıysanız listede belediyeler görünecek)
5. İsteğe bağlı alanları doldurun
6. "Profili Tamamla" butonuna tıklayın

### 3. Dashboard'a Erişim

Profil tamamlandıktan sonra rolünüze göre yönlendirileceksiniz:

- **Yönetici/Süpervizör**: `/admin` dashboard
- **Personel**: `/worker` dashboard

## 🔧 Önemli Notlar

### Supabase Authentication

Supabase Auth otomatik olarak:
- Email verification gönderir (production'da)
- Password reset işlemlerini yönetir
- Session yönetimi yapar

Development ortamında email verification disabled olabilir. Production'da mutlaka aktif olmalı.

### Multi-Tenant İzolasyon

Her belediye (municipality) izole bir tenant'tır. RLS politikaları sayesinde:
- Kullanıcılar sadece kendi belediyelerinin verilerini görür
- Personel sadece kendine atanan görevleri görür
- Admin/Süpervizör kendi belediyesinin tüm verilerini yönetir

### GPS Permissions

Mobil cihazlarda GPS izinleri gereklidir:
- Tarayıcı konum izni iste
- Background tracking için ek izinler (PWA)
- iOS Safari özel handling gerektirir

## 📚 Geliştirme Komutları

```bash
# Development server
npm run dev

# Production build
npm run build

# Production server (build sonrası)
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

## 🗄 Database Backup

Supabase Dashboard'dan düzenli backup alın:
- Project Settings → Backups
- Automatic daily backups (Pro plan)
- Manual snapshot oluşturma

## 🔐 Güvenlik Kontrol Listesi

- [ ] `.env.local` dosyası `.gitignore`'da
- [ ] Supabase RLS tüm tablolarda aktif
- [ ] Service role key sadece server-side kullanımda
- [ ] CORS ayarları production URL'leri ile sınırlı
- [ ] Password policy güçlü (Supabase Auth settings)
- [ ] Rate limiting aktif (Supabase Pro)
- [ ] SSL certificate (production)
- [ ] Environment variables production'da güvenli

## 🐛 Sorun Giderme

### "Cannot find path" hatası

Windows'ta Türkçe karakter içeren path problemi. Çözüm:
- Projeyi İngilizce path'e taşı
- Örn: `C:\Users\username\projects\bts`

### Supabase bağlantı hatası

- `.env.local` dosyasını kontrol edin
- Supabase URL ve key'lerin doğruluğunu kontrol edin
- Supabase project'in active olduğundan emin olun

### RLS policy hatası

- Kullanıcının profile kaydının olduğundan emin olun
- `get_user_municipality_id()` fonksiyonunun çalıştığını kontrol edin
- Auth token'ın valid olduğunu kontrol edin

### TypeScript hatası

```bash
# node_modules'ı temizle ve yeniden yükle
rm -rf node_modules
npm install
```

## 📞 Destek

Sorunlarınız için:
- GitHub Issues
- Supabase Community
- Next.js Discussions

## 🎯 Sonraki Adımlar

1. GPS tracking service implement et
2. MapLibre harita entegrasyonu
3. Fotoğraf upload fonksiyonu
4. Push notifications
5. PWA manifest ve service worker
6. Performance optimization
7. Production deployment
