'use client'

import { Header } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { TrackingMap } from '@/components/maps/tracking-map'
import { Plus } from 'lucide-react'

export default function RoutesPage() {
  // #region agent log
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7243/ingest/1ceb7883-60b4-41d0-86a3-72ad12f7f817',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'routes/page.tsx:8',message:'RoutesPage component RENDERED',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
  }
  // #endregion
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
