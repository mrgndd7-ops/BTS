# BTS - Belediye Temizlik Sistemi

Türkiye belediyelerinin temizlik operasyonlarını dijitalleştiren multi-tenant SaaS platformu.

## 🚀 Özellikler

### Yöneticiler İçin
- 📊 **Dashboard**: Operasyonları anlık takip
- 🗺️ **GPS Takip**: Personeli canlı harita üzerinde izleme
- 📋 **Görev Yönetimi**: Görev oluşturma, atama ve takip
- 👥 **Personel Yönetimi**: Ekip yönetimi ve performans değerlendirme
- 📈 **Raporlama**: Detaylı performans ve operasyon raporları
- 🔔 **Bildirimler**: Anlık sistem bildirimleri

### Personel İçin
- 📱 **Mobil Uyumlu**: PWA desteği ile mobil kullanım
- ✅ **Görev Listesi**: Atanan görevleri görüntüleme
- 🗺️ **Rota Takibi**: GPS ile rota navigasyonu
- 📸 **İş Kanıtı**: Fotoğraf yükleme
- 📊 **Performans**: Kendi performansını izleme

## 🛠 Teknolojiler

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, PostgreSQL, Realtime, Storage)
- **Maps**: MapLibre GL JS
- **State Management**: Zustand
- **Form Management**: React Hook Form + Zod
- **Icons**: Lucide React

## 📦 Kurulum

### Gereksinimler

- Node.js 18+
- npm veya yarn
- Supabase hesabı

### Adımlar

1. **Bağımlılıkları yükleyin:**

```bash
npm install
```

2. **Environment değişkenlerini ayarlayın:**

`.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Supabase veritabanını oluşturun:**

Proje dökümanındaki SQL schema'ları Supabase SQL Editor'de çalıştırın.

4. **Geliştirme sunucusunu başlatın:**

```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde açılacaktır.

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth sayfaları (login, register)
│   ├── (dashboard)/       # Dashboard sayfaları
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Ana sayfa
├── components/
│   ├── ui/                # UI primitive componentleri
│   ├── forms/             # Form componentleri
│   ├── dashboard/         # Dashboard componentleri
│   └── layouts/           # Layout componentleri
├── lib/
│   ├── supabase/          # Supabase client'ları
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility fonksiyonlar
│   └── validations/       # Zod validation schemas
├── stores/                # Zustand stores
├── types/                 # TypeScript type definitions
└── styles/                # Global styles
```

## 🔐 Güvenlik

- Row Level Security (RLS) her tabloda aktif
- Multi-tenant izolasyon
- Secure cookie-based authentication
- Input validation (Zod)
- XSS ve SQL injection koruması

## 👥 Kullanıcı Rolleri

- **Admin**: Tam yetki
- **Supervisor**: Saha denetimi ve görev yönetimi
- **Personnel**: Kendi görevleri ve performans bilgisi

## 📱 PWA Desteği

Uygulama Progressive Web App olarak tasarlanmıştır:
- Offline çalışma
- Push notifications
- GPS background tracking
- Install prompt

## 🚧 Geliştirme Durumu

### ✅ Tamamlanan
- [x] Proje kurulumu
- [x] Auth sistemi (login, register, profile)
- [x] Dashboard layout ve navigation
- [x] UI component library
- [x] Type definitions
- [x] Validation schemas
- [x] Supabase integration

### 🔄 Devam Eden (Sprint 2)
- [ ] Task CRUD işlemleri
- [ ] Route yönetimi
- [ ] Personnel yönetimi
- [ ] Real-time notifications

### 📋 Planlanan (Sprint 3-5)
- [ ] GPS tracking service
- [ ] MapLibre integration
- [ ] Photo upload
- [ ] Performance scoring
- [ ] Reports
- [ ] PWA features

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'feat: Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Sorularınız için: [GitHub Issues](https://github.com/yourusername/bts/issues)

## 🙏 Teşekkürler

- Next.js team
- Supabase team
- Vercel
- Open source community
