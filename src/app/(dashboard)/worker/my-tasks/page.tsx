import { Header } from '@/components/dashboard/header'

export default function MyTasksPage() {
  return (
    <div className="space-y-6 p-6">
      <Header title="Görevlerim" description="Size atanan görevler" />
      
      <div className="text-center py-12">
        <p className="text-slate-400">Görevler listesi yakında eklenecek...</p>
      </div>
    </div>
  )
}
