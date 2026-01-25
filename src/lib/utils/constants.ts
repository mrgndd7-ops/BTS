/**
 * Uygulama genelinde kullanılan sabitler
 */

// Roller
export const ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  PERSONNEL: 'personnel',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

// Görev durumları
export const TASK_STATUS = {
  BEKLEMEDE: 'beklemede',
  DEVAM_EDIYOR: 'devam_ediyor',
  TAMAMLANDI: 'tamamlandi',
  IPTAL: 'iptal',
} as const

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS]

// Görev durumu etiketleri
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  beklemede: 'Beklemede',
  devam_ediyor: 'Devam Ediyor',
  tamamlandi: 'Tamamlandı',
  iptal: 'İptal',
}

// Görev durumu renkleri
export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  beklemede: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  devam_ediyor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  tamamlandi: 'bg-green-500/10 text-green-500 border-green-500/20',
  iptal: 'bg-red-500/10 text-red-500 border-red-500/20',
}

// Öncelik seviyeleri
export const PRIORITY_LEVELS = {
  DUSUK: 'dusuk',
  ORTA: 'orta',
  YUKSEK: 'yuksek',
  ACIL: 'acil',
} as const

export type PriorityLevel = (typeof PRIORITY_LEVELS)[keyof typeof PRIORITY_LEVELS]

// Öncelik etiketleri
export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  dusuk: 'Düşük',
  orta: 'Orta',
  yuksek: 'Yüksek',
  acil: 'Acil',
}

// Denetim notları
export const INSPECTION_GRADES = ['A', 'B', 'C', 'D'] as const
export type InspectionGrade = (typeof INSPECTION_GRADES)[number]

// Denetim not etiketleri
export const INSPECTION_GRADE_LABELS: Record<InspectionGrade, string> = {
  A: 'Mükemmel',
  B: 'İyi',
  C: 'Orta',
  D: 'Yetersiz',
}

// GPS ayarları
export const GPS_CONFIG = {
  UPDATE_INTERVAL: 30000, // 30 saniye
  MIN_ACCURACY: 50, // metre
  ENABLE_HIGH_ACCURACY: true,
  TIMEOUT: 10000,
  MAXIMUM_AGE: 5000,
}

// Sayfa başına kayıt sayısı
export const ITEMS_PER_PAGE = 20

// Maksimum dosya boyutları
export const MAX_FILE_SIZES = {
  AVATAR: 2 * 1024 * 1024, // 2MB
  PHOTO: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
}

// İzin verilen dosya tipleri
export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/webp'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
}

// Türkiye illeri (basitleştirilmiş liste - tam liste için API kullanılabilir)
export const TURKISH_CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara',
  'Antalya', 'Ardahan', 'Artvin', 'Aydın', 'Balıkesir', 'Bartın', 'Batman',
  'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale',
  'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan',
  'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay',
  'Iğdır', 'Isparta', 'İstanbul', 'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman',
  'Kars', 'Kastamonu', 'Kayseri', 'Kilis', 'Kırıkkale', 'Kırklareli', 'Kırşehir',
  'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla',
  'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun',
  'Şanlıurfa', 'Siirt', 'Sinop', 'Şırnak', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon',
  'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak',
].sort()
