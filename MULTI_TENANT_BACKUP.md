# MULTI-TENANT YEDEK - GELECEKTEKİ KULLANIM İÇİN

## 📋 ÖZET
Bu dosya multi-tenant (çok kiracılı) yapıyı içerir. Gelecekte her belediyenin sadece kendi verilerini görmesi gerektiğinde bu kodları geri aktif et.

---

## 🔒 MULTI-TENANT NEDİR?

**Multi-Tenant (Çok Kiracılı):** Her belediye (tenant) sadece kendi verilerini görür.

**Örnek:**
- İstanbul Kadıköy Admin → Sadece Kadıköy personelleri
- Ankara Çankaya Admin → Sadece Çankaya personelleri
- İzmir Konak Admin → Sadece Konak personelleri

**Avantajlar:**
- ✅ Veri güvenliği
- ✅ Gizlilik
- ✅ Her belediye izole
- ✅ Birbirinin verilerini göremez

**Dezavantajlar:**
- ❌ Merkezi yönetim yok
- ❌ Türkiye geneli rapor yok
- ❌ Demo'da tek hesapla her yer gösterilemez

---

## 📂 DEĞİŞTİRİLEN DOSYALAR

### 1. `src/app/(dashboard)/admin/personnel/page.tsx`

#### GERİ ALMAK İÇİN (Multi-Tenant Aktif):
```typescript
// Line ~43-60 civarı
const loadPersonnel = async () => {
  console.log('👥 Personel listesi yükleniyor...')
  console.log('🏢 Admin municipality_id:', profile?.municipality_id)
  
  // Build query with municipality filter
  let query = supabase
    .from('profiles')
    .select('*')
    .eq('role', 'personnel')
  
  // Multi-tenant isolation: Only show personnel from same municipality
  if (profile?.municipality_id) {
    console.log('🔒 Multi-tenant filter aktif:', profile.municipality_id)
    query = query.eq('municipality_id', profile.municipality_id)
  } else {
    console.warn('⚠️ Municipality ID yok! Tüm personeller gösterilecek!')
  }
  
  const { data: profilesData, error: personnelError } = await query.order('full_name')
  
  if (personnelError) {
    console.error('❌ Personel yükleme hatası:', personnelError)
  }
  
  console.log('📋 Bulunan personel sayısı:', profilesData?.length || 0)
  
  // ... rest of code
}
```

---

### 2. `src/components/maps/live-tracking-map.tsx`

#### GERİ ALMAK İÇİN (Multi-Tenant Aktif):

**Props Interface:**
```typescript
interface LiveTrackingMapProps {
  className?: string
  center?: [number, number]
  zoom?: number
  municipalityId?: string // ← Bu prop gerekli
  showTrails?: boolean
  onPersonnelClick?: (personnelId: string) => void
}
```

**Initial Load Query (Line ~360 civarı):**
```typescript
// Load initial personnel data
;(async () => {
  console.log('🗺️ Map: Loading personnel locations...')
  console.log('🏢 Municipality ID:', municipalityId)
  
  let query = supabase
    .from('gps_locations')
    .select(`
      id,
      user_id,
      task_id,
      latitude,
      longitude,
      accuracy,
      speed,
      heading,
      battery_level,
      recorded_at,
      profiles:user_id (
        id,
        full_name,
        role,
        avatar_url
      ),
      tasks:task_id (
        id,
        status,
        title
      )
    `)
    .order('recorded_at', { ascending: false })
  
  // Multi-tenant isolation: Filter by municipality if provided
  if (municipalityId) {
    console.log('🔒 Multi-tenant filter:', municipalityId)
    query = query.eq('municipality_id', municipalityId)
  }
  
  const { data, error } = await query
  // ... rest of code
})()
```

**Realtime Subscription (Line ~440 civarı):**
```typescript
.on(
  'postgres_changes',
  {
    event: '*',
    schema: 'public',
    table: 'gps_locations'
  },
  async (payload) => {
    console.log('🔔 Realtime Event:', payload.eventType, payload)
    
    const newLocation = payload.new as any

    // Eğer user_id yoksa (device mapping yok), skip et
    if (!newLocation.user_id) {
      return
    }

    // Multi-tenant isolation: Skip if different municipality
    if (municipalityId && newLocation.municipality_id !== municipalityId) {
      console.log('🔒 Farklı belediye, atlaniyor')
      return
    }
    
    // ... rest of code
  }
)
```

---

### 3. `src/app/(dashboard)/admin/page.tsx`

#### GERİ ALMAK İÇİN (Multi-Tenant Aktif):

**Stats Query'leri (Line ~54-89 civarı):**
```typescript
const loadDashboardData = async () => {
  const municipalityId = profile?.municipality_id
  
  // Aktif görevler
  let tasksQuery = supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .in('status', ['assigned', 'in_progress'])
  if (municipalityId) tasksQuery = tasksQuery.eq('municipality_id', municipalityId)
  const { count: activeTasks } = await tasksQuery

  // Aktif personel
  let personnelQuery = supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'personnel')
    .eq('status', 'active')
  if (municipalityId) personnelQuery = personnelQuery.eq('municipality_id', municipalityId)
  const { count: activePersonnel } = await personnelQuery

  // Toplam rotalar
  let routesQuery = supabase
    .from('routes')
    .select('*', { count: 'exact', head: true })
    .eq('active', true)
  if (municipalityId) routesQuery = routesQuery.eq('municipality_id', municipalityId)
  const { count: totalRoutes } = await routesQuery

  // Bu ay tamamlanan görevler
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  let completedQuery = supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .gte('completed_at', startOfMonth.toISOString())
  if (municipalityId) completedQuery = completedQuery.eq('municipality_id', municipalityId)
  const { count: completedThisMonth } = await completedQuery
  
  // ... rest of code
}
```

**Live Map Props (Line ~231-236 civarı):**
```typescript
<LiveTrackingMap 
  className="w-full h-[600px]" 
  center={[29.0, 41.0]}
  zoom={11}
  municipalityId={profile?.municipality_id || undefined}
  showTrails={true}
  onPersonnelClick={async (userId) => {
    // ...
  }}
/>
```

---

### 4. `src/app/(dashboard)/admin/tasks/page.tsx` (Eğer varsa)

#### GERİ ALMAK İÇİN:
```typescript
let query = supabase
  .from('tasks')
  .select('*, profiles!tasks_assigned_to_fkey(*)')
  .order('created_at', { ascending: false })

// Multi-tenant filter
if (profile?.municipality_id) {
  query = query.eq('municipality_id', profile.municipality_id)
}
```

---

### 5. `src/app/(dashboard)/admin/routes/page.tsx` (Eğer varsa)

#### GERİ ALMAK İÇİN:
```typescript
let query = supabase
  .from('routes')
  .select('*')
  .order('name')

// Multi-tenant filter
if (profile?.municipality_id) {
  query = query.eq('municipality_id', profile.municipality_id)
}
```

---

## 🔄 AKTİF ETME ADIMLARI

### 1. Personnel Page
```typescript
// EKLE:
if (profile?.municipality_id) {
  query = query.eq('municipality_id', profile.municipality_id)
}
```

### 2. Live Tracking Map
```typescript
// EKLE (Initial load):
if (municipalityId) {
  query = query.eq('municipality_id', municipalityId)
}

// EKLE (Realtime):
if (municipalityId && newLocation.municipality_id !== municipalityId) {
  return
}
```

### 3. Admin Dashboard Stats
```typescript
// HER QUERY'E EKLE:
if (municipalityId) {
  query = query.eq('municipality_id', municipalityId)
}
```

### 4. Git Commit
```bash
git add .
git commit -m "feat: Re-enable multi-tenant isolation for production"
git push origin main
```

---

## ⚠️ ÖNEMLİ NOTLAR

1. **RLS Policies**: Supabase RLS policy'leri de kontrol et
2. **Testing**: Multi-tenant aktifken farklı belediyelerle test et
3. **Super Admin**: `super_admin` role'ü multi-tenant bypass eder
4. **Null Municipality**: `municipality_id = NULL` ise tüm veriler görünür

---

## 📞 DESTEK

Gelecekte multi-tenant'ı aktif ederken sorun yaşarsan:
1. Bu dosyayı aç
2. Kodları ilgili dosyalara kopyala
3. Test et
4. Deploy et

---

**Yedekleme Tarihi:** 2026-02-02
**Proje:** BTS - Belediye Temizlik Sistemi
**Durum:** Multi-tenant ŞU AN DEVREDİŞI (Türkiye geneli görünüm için)
