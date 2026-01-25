import { z } from 'zod'

/**
 * Task işlemleri için validation schemas
 */

export const taskCreateSchema = z.object({
  route_id: z.string().uuid('Geçerli bir rota seçiniz'),
  assigned_personnel: z.string().uuid().optional().nullable(),
  scheduled_date: z.string().min(1, 'Görev tarihi gereklidir'),
  assigned_vehicle: z.string().optional().nullable(),
  scheduled_miles: z.number().positive().optional().nullable(),
  notes: z.string().max(500, 'Notlar en fazla 500 karakter olabilir').optional(),
})

export type TaskCreateInput = z.infer<typeof taskCreateSchema>

export const taskUpdateSchema = z.object({
  route_id: z.string().uuid().optional(),
  assigned_personnel: z.string().uuid().optional().nullable(),
  scheduled_date: z.string().optional(),
  status: z.enum(['beklemede', 'devam_ediyor', 'tamamlandi', 'iptal']).optional(),
  assigned_vehicle: z.string().optional().nullable(),
  scheduled_miles: z.number().positive().optional().nullable(),
  completed_miles: z.number().positive().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  weather_conditions: z.string().max(100).optional().nullable(),
  delay_reason: z.string().max(200).optional().nullable(),
  started_at: z.string().optional().nullable(),
  completed_at: z.string().optional().nullable(),
})

export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>

export const taskStatusUpdateSchema = z.object({
  status: z.enum(['beklemede', 'devam_ediyor', 'tamamlandi', 'iptal'], {
    required_error: 'Durum seçimi gereklidir',
  }),
})

export type TaskStatusUpdateInput = z.infer<typeof taskStatusUpdateSchema>

export const taskFilterSchema = z.object({
  status: z.enum(['beklemede', 'devam_ediyor', 'tamamlandi', 'iptal']).optional(),
  assigned_personnel: z.string().uuid().optional(),
  route_id: z.string().uuid().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

export type TaskFilterInput = z.infer<typeof taskFilterSchema>
