import { z } from 'zod'

/**
 * Task işlemleri için validation schemas
 */

export const taskCreateSchema = z.object({
  route_id: z.string().uuid('Geçerli bir rota seçiniz').optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(), // FIXED: assigned_personnel -> assigned_to
  scheduled_start: z.string().min(1, 'Görev tarihi gereklidir').optional(), // FIXED: scheduled_date -> scheduled_start
  assigned_vehicle: z.string().optional().nullable(),
  scheduled_miles: z.number().positive().optional().nullable(),
  notes: z.string().max(500, 'Notlar en fazla 500 karakter olabilir').optional(),
})

export type TaskCreateInput = z.infer<typeof taskCreateSchema>

export const taskUpdateSchema = z.object({
  route_id: z.string().uuid().optional(),
  assigned_to: z.string().uuid().optional().nullable(), // FIXED: assigned_personnel -> assigned_to
  scheduled_start: z.string().optional(), // FIXED: scheduled_date -> scheduled_start
  status: z.enum(['assigned', 'in_progress', 'completed', 'cancelled']).optional(), // FIXED: English values
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
  status: z.enum(['assigned', 'in_progress', 'completed', 'cancelled'], { // FIXED: English values
    required_error: 'Durum seçimi gereklidir',
  }),
})

export type TaskStatusUpdateInput = z.infer<typeof taskStatusUpdateSchema>

export const taskFilterSchema = z.object({
  status: z.enum(['assigned', 'in_progress', 'completed', 'cancelled']).optional(), // FIXED: English values
  assigned_to: z.string().uuid().optional(), // FIXED: assigned_personnel -> assigned_to
  route_id: z.string().uuid().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

export type TaskFilterInput = z.infer<typeof taskFilterSchema>
