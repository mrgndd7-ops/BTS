import { Header } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function TasksPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Header title="Görevler" description="Temizlik görevlerini yönetin" />
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Görev
        </Button>
      </div>
      
      <div className="text-center py-12">
        <p className="text-slate-400">Görev listesi yakında eklenecek...</p>
      </div>
    </div>
  )
}
