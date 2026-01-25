import { Header } from '@/components/dashboard/header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { ClipboardList, Users, Route, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <Header 
        title="Ana Sayfa" 
        description="Belediye temizlik operasyonlarına genel bakış"
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Aktif Görevler"
          value={12}
          description="Devam eden temizlik görevleri"
          icon={ClipboardList}
          trend={{ value: 8, label: 'Bu hafta' }}
        />
        <StatsCard
          title="Aktif Personel"
          value={24}
          description="Sahadaki personel sayısı"
          icon={Users}
        />
        <StatsCard
          title="Rotalar"
          value={45}
          description="Toplam temizlik rotası"
          icon={Route}
        />
        <StatsCard
          title="Tamamlanan Görevler"
          value={156}
          description="Bu ay tamamlanan"
          icon={CheckCircle}
          trend={{ value: 12, label: 'Geçen aya göre' }}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Son Görevler</CardTitle>
            <CardDescription>En son oluşturulan görevler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Kadıköy Rota 1</p>
                  <p className="text-xs text-slate-400">Ahmet Yılmaz - Devam Ediyor</p>
                </div>
                <span className="text-xs text-blue-500">2 saat önce</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Beşiktaş Rota 3</p>
                  <p className="text-xs text-slate-400">Mehmet Demir - Tamamlandı</p>
                </div>
                <span className="text-xs text-green-500">4 saat önce</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Üsküdar Rota 2</p>
                  <p className="text-xs text-slate-400">Ayşe Kaya - Beklemede</p>
                </div>
                <span className="text-xs text-yellow-500">1 gün önce</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sistem Bildirimleri</CardTitle>
            <CardDescription>Önemli sistem olayları</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm text-white">Yeni personel eklendi</p>
                  <p className="text-xs text-slate-400">Ali Veli sisteme kaydedildi</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm text-white">Rota güncellendi</p>
                  <p className="text-xs text-slate-400">Kadıköy Rota 5 güncellendi</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm text-white">Denetim tamamlandı</p>
                  <p className="text-xs text-slate-400">15 görev denetlendi</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
