import { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Municipality = Database['public']['Tables']['municipalities']['Row']

export type UserRole = 'admin' | 'supervisor' | 'personnel'

export interface AuthUser {
  id: string
  email: string
  profile: Profile | null
}

export interface Session {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export interface ProfileFormData {
  full_name: string
  phone: string
  city: string
  district: string
  municipality_id: string
  department?: string
  employee_id?: string
  unit?: string
}
