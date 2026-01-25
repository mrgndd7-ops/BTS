import { z } from 'zod'

/**
 * Route işlemleri için validation schemas
 */

export const routeCreateSchema = z.object({
  code: z
    .string()
    .min(1, 'Rota kodu gereklidir')
    .max(20, 'Rota kodu en fazla 20 karakter olabilir')
    .regex(/^[A-Z0-9-]+$/, 'Rota kodu sadece büyük harf, rakam ve tire içerebilir'),
  name: z
    .string()
    .min(1, 'Rota adı gereklidir')
    .min(3, 'Rota adı en az 3 karakter olmalıdır')
    .max(200, 'Rota adı en fazla 200 karakter olabilir'),
  description: z.string().max(500, 'Açıklama en fazla 500 karakter olabilir').optional(),
  district: z.string().optional(),
  length_km: z.number().positive('Uzunluk pozitif bir değer olmalıdır').optional(),
  estimated_duration_minutes: z.number().int().positive().optional(),
  scheduled_miles: z.number().positive().optional(),
  difficulty_level: z.enum(['kolay', 'orta', 'zor']).default('orta'),
  required_vehicle_type: z.string().max(50).optional(),
  geojson: z.record(z.unknown()).optional(),
  active: z.boolean().default(true),
})

export type RouteCreateInput = z.infer<typeof routeCreateSchema>

export const routeUpdateSchema = z.object({
  code: z
    .string()
    .max(20)
    .regex(/^[A-Z0-9-]+$/, 'Rota kodu sadece büyük harf, rakam ve tire içerebilir')
    .optional(),
  name: z.string().min(3).max(200).optional(),
  description: z.string().max(500).optional(),
  district: z.string().optional(),
  length_km: z.number().positive().optional(),
  estimated_duration_minutes: z.number().int().positive().optional(),
  scheduled_miles: z.number().positive().optional(),
  difficulty_level: z.enum(['kolay', 'orta', 'zor']).optional(),
  required_vehicle_type: z.string().max(50).optional(),
  geojson: z.record(z.unknown()).optional(),
  active: z.boolean().optional(),
})

export type RouteUpdateInput = z.infer<typeof routeUpdateSchema>
