import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
  }
  className?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
            {description && (
              <p className="mt-1 text-xs text-slate-400">{description}</p>
            )}
            {trend && (
              <div className="mt-2 flex items-center text-sm">
                <span
                  className={cn(
                    'font-medium',
                    trend.value > 0 ? 'text-green-500' : 'text-red-500'
                  )}
                >
                  {trend.value > 0 ? '+' : ''}
                  {trend.value}%
                </span>
                <span className="ml-2 text-slate-400">{trend.label}</span>
              </div>
            )}
          </div>
          <div className="rounded-full bg-blue-500/10 p-3">
            <Icon className="h-6 w-6 text-blue-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
