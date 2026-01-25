/**
 * API response ve request type'ları
 */

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
}

// GPS Location Types
export interface GpsLocationCreate {
  personnel_id: string
  task_id?: string
  latitude: number
  longitude: number
  accuracy?: number
  speed?: number
  heading?: number
  altitude?: number
  recorded_at?: string
}

export interface GpsPoint {
  lat: number
  lng: number
  timestamp: string
  accuracy?: number
  speed?: number
}

// Task Types
export interface TaskWithRelations {
  id: string
  route_id: string | null
  assigned_personnel: string | null
  scheduled_date: string
  status: 'beklemede' | 'devam_ediyor' | 'tamamlandi' | 'iptal'
  route?: {
    id: string
    name: string
    code: string
  }
  personnel?: {
    id: string
    full_name: string
    avatar_url: string | null
  }
}

export interface TaskCreateInput {
  route_id: string
  assigned_personnel?: string
  scheduled_date: string
  assigned_vehicle?: string
  notes?: string
}

export interface TaskUpdateInput {
  status?: 'beklemede' | 'devam_ediyor' | 'tamamlandi' | 'iptal'
  assigned_personnel?: string
  assigned_vehicle?: string
  completed_miles?: number
  notes?: string
  started_at?: string
  completed_at?: string
}

// Notification Types
export interface NotificationData {
  task_id?: string
  route_id?: string
  inspection_id?: string
  ticket_id?: string
  [key: string]: unknown
}
