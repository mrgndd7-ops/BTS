'use client'

import { Header } from '@/components/dashboard/header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { GPSTrackingWidget } from '@/components/dashboard/gps-tracking-widget'
import { ClipboardList, CheckCircle, Clock, Award } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function WorkerDashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <Header 
        title="Ana Sayfa" 
        description="Hoş geldiniz! Günlük görevlerinizi buradan takip edebilirsiniz."
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Bekleyen Görevler"
          value={3}
          description="Size atanan görevler"
          icon={Clock}
        />
        <StatsCard
          title="Devam Eden"
          value={1}
          description="Şu anda üzerinde çalıştığınız"
          icon={ClipboardList}
        />
        <StatsCard
          title="Bu Ay Tamamlanan"
          value={18}
          description="Başarıyla tamamladınız"
          icon={CheckCircle}
        />
        <StatsCard
          title="Performans Skoru"
          value={92}
          description="Bu ay ortalama puanınız"
          icon={Award}
          trend={{ value: 5, label: 'Geçen aya göre' }}
        />
      </div>

      {/* GPS Tracking Widget */}
      <GPSTrackingWidget />

      {/* Today's Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Bugünün Görevleri</CardTitle>
          <CardDescription>Size atanan günlük görevler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-700 p-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-white">Kadıköy Rota 1</p>
                  <Badge variant="info">Devam Ediyor</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  Başlangıç: 08:00 • Tahmini Süre: 4 saat
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Araç: TR-34-ABC-123 • 12.5 km
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-blue-500">%65 Tamamlandı</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-700 p-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-white">Kadıköy Rota 2</p>
                  <Badge variant="warning">Beklemede</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  Başlangıç: 13:00 • Tahmini Süre: 3 saat
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Araç: TR-34-ABC-456 • 8.2 km
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-700 p-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-white">Kadıköy Rota 5</p>
                  <Badge variant="warning">Beklemede</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  Başlangıç: 16:00 • Tahmini Süre: 2.5 saat
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Araç: TR-34-ABC-789 • 6.8 km
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <button className="flex flex-col items-center justify-center rounded-lg border border-slate-700 p-6 transition-colors hover:border-blue-500 hover:bg-slate-800">
              <ClipboardList className="h-8 w-8 text-blue-500" />
              <span className="mt-2 text-sm font-medium text-white">Görevlerim</span>
            </button>
            <button className="flex flex-col items-center justify-center rounded-lg border border-slate-700 p-6 transition-colors hover:border-blue-500 hover:bg-slate-800">
              <Award className="h-8 w-8 text-blue-500" />
              <span className="mt-2 text-sm font-medium text-white">Performansım</span>
            </button>
            <button className="flex flex-col items-center justify-center rounded-lg border border-slate-700 p-6 transition-colors hover:border-blue-500 hover:bg-slate-800">
              <Clock className="h-8 w-8 text-blue-500" />
              <span className="mt-2 text-sm font-medium text-white">Geçmiş</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
