import { z } from 'zod'

/**
 * Auth işlemleri için validation schemas
 */

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-posta adresi gereklidir')
    .email('Geçerli bir e-posta adresi giriniz'),
  password: z
    .string()
    .min(1, 'Şifre gereklidir')
    .min(6, 'Şifre en az 6 karakter olmalıdır'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'E-posta adresi gereklidir')
    .email('Geçerli bir e-posta adresi giriniz'),
  password: z
    .string()
    .min(1, 'Şifre gereklidir')
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
    .regex(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
    .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir'),
  confirmPassword: z.string().min(1, 'Şifre tekrarı gereklidir'),
  role: z.enum(['admin', 'personnel'], {
    required_error: 'Rol seçimi gereklidir',
  }),
  // Profil bilgileri
  full_name: z
    .string()
    .min(1, 'Ad Soyad gereklidir')
    .min(3, 'Ad Soyad en az 3 karakter olmalıdır')
    .max(100, 'Ad Soyad en fazla 100 karakter olabilir'),
  phone: z
    .string()
    .min(1, 'Telefon numarası gereklidir')
    .regex(/^(0|(\+90))?5[0-9]{9}$/, 'Geçerli bir Türkiye telefon numarası giriniz')
    .refine((val) => {
      // Sadece rakam say (+ ve 0 hariç)
      const digits = val.replace(/[^0-9]/g, '')
      // +90 veya 0 ile başlıyorsa 11 hane, yoksa 10 hane olmalı
      if (val.startsWith('+90')) return digits.length === 12 // +90 5XX XXX XX XX
      if (val.startsWith('0')) return digits.length === 11 // 0 5XX XXX XX XX
      return digits.length === 10 // 5XX XXX XX XX
    }, 'Telefon numarası 10 haneli olmalıdır (örn: 05XX XXX XX XX)'),
  city: z.string().min(1, 'İl seçimi gereklidir'),
  municipality_id: z.string().min(1, 'Belediye seçimi gereklidir'),
  department: z.string().optional(),
  employee_id: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
})

export type RegisterInput = z.infer<typeof registerSchema>

export const profileSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Ad Soyad gereklidir')
    .min(3, 'Ad Soyad en az 3 karakter olmalıdır')
    .max(100, 'Ad Soyad en fazla 100 karakter olabilir'),
  phone: z
    .string()
    .min(1, 'Telefon numarası gereklidir')
    .regex(/^(0|(\+90))?5[0-9]{9}$/, 'Geçerli bir Türkiye telefon numarası giriniz')
    .refine((val) => {
      const digits = val.replace(/[^0-9]/g, '')
      if (val.startsWith('+90')) return digits.length === 12
      if (val.startsWith('0')) return digits.length === 11
      return digits.length === 10
    }, 'Telefon numarası 10 haneli olmalıdır (örn: 05XX XXX XX XX)'),
  city: z.string().min(1, 'İl seçimi gereklidir'),
  municipality_id: z.string().min(1, 'Belediye seçimi gereklidir'),
  department: z.string().optional(),
  employee_id: z.string().optional(),
  unit: z.string().optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre gereklidir'),
  newPassword: z
    .string()
    .min(6, 'Yeni şifre en az 6 karakter olmalıdır')
    .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
    .regex(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
    .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir'),
  confirmPassword: z.string().min(1, 'Şifre tekrarı gereklidir'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
})

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'E-posta adresi gereklidir')
    .email('Geçerli bir e-posta adresi giriniz'),
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
