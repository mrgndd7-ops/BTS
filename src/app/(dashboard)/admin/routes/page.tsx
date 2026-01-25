'use client'

import { Header } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { TrackingMap } from '@/components/maps/tracking-map'
import { Plus } from 'lucide-react'

export default function RoutesPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <Header 
            title="Rotalar & Personel Takibi" 
            description="Rotaları ve personeli canlı haritada izleyin" 
          />
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Rota
          </Button>
        </div>
      </div>
      
      <div className="flex-1">
        <TrackingMap />
      </div>
    </div>
  )
}
