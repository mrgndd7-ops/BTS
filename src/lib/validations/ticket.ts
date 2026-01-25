import { z } from 'zod'

/**
 * Ticket işlemleri için validation schemas
 */

export const ticketCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'Başlık gereklidir')
    .min(5, 'Başlık en az 5 karakter olmalıdır')
    .max(200, 'Başlık en fazla 200 karakter olabilir'),
  description: z
    .string()
    .min(10, 'Açıklama en az 10 karakter olmalıdır')
    .max(1000, 'Açıklama en fazla 1000 karakter olabilir')
    .optional(),
  priority: z.enum(['dusuk', 'orta', 'yuksek', 'acil']).default('orta'),
  district: z.string().optional(),
  location_lat: z.number().min(-90).max(90).optional(),
  location_lng: z.number().min(-180).max(180).optional(),
  reporter_name: z.string().max(100).optional(),
  reporter_phone: z.string().max(20).optional(),
  reported_by_unit: z.string().max(100).optional(),
  channel: z.enum(['phone', 'app', 'web', 'email']).optional(),
})

export type TicketCreateInput = z.infer<typeof ticketCreateSchema>

export const ticketUpdateSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(10).max(1000).optional(),
  status: z.enum(['acik', 'atandi', 'kapali']).optional(),
  priority: z.enum(['dusuk', 'orta', 'yuksek', 'acil']).optional(),
  assigned_to: z.string().uuid().optional().nullable(),
  related_task_id: z.string().uuid().optional().nullable(),
})

export type TicketUpdateInput = z.infer<typeof ticketUpdateSchema>
