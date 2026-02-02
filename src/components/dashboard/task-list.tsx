'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/use-auth'
import { useGPSTracking } from '@/lib/hooks/use-gps-tracking'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, Clock, Play, Info, MapPin, Navigation } from 'lucide-react'

interface Task {
  id: string
  title: string
  description?: string
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  scheduled_start?: string
  started_at?: string
  completed_at?: string
  created_at: string
}

export function TaskList() {
  const supabase = createClient()
  const { user } = useAuth()
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const { isTracking, startTracking, stopTracking, currentLocation } = useGPSTracking(activeTaskId)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [startingTask, setStartingTask] = useState<string | null>(null)

  // Görevleri yükle
  useEffect(() => {
    if (!user) return

    const loadTasks = async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', user.id)
        .in('status', ['assigned', 'in_progress'])
        .order('created_at', { ascending: false })

      if (data) {
        setTasks(data)
      }
      setLoading(false)
    }

    loadTasks()

    // Real-time görev güncellemeleri
    const channel = supabase
      .channel('task-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `assigned_to=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => [payload.new as Task, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) =>
              prev.map((task) =>
                task.id === (payload.new as Task).id ? (payload.new as Task) : task
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((task) => task.id !== (payload.old as Task).id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  // Görevi başlat ve GPS tracking'i otomatik başlat
  const handleStartTask = async (taskId: string) => {
    console.log('Gorev baslatma basladi, Task ID:', taskId)
    setStartingTask(taskId)

    try {
      // 1. GPS Tracking'i başlat
      console.log('GPS tracking baslatiliyor...')
      const trackingStarted = await startTracking()
      
      if (!trackingStarted) {
        throw new Error('GPS tracking baslatılamadi. Lutfen konum iznini kontrol edin.')
      }

      console.log('GPS tracking baslatildi, gorev durumu guncelleniyor...')
      
      // 2. Görev durumunu güncelle
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          status: 'in_progress',
          started_at: new Date().toISOString() 
        })
        .eq('id', taskId)
        .select()
        .single()
      
      console.log('Gorev guncelleme sonucu:', { data, error })
      
      if (error) throw error

      // 3. Aktif görev olarak kaydet
      setActiveTaskId(taskId)
      
      console.log('Gorev basariyla baslatildi! GPS tracking aktif.')
    } catch (err: any) {
      console.error('Gorev baslatma hatasi:', err)
      alert(err.message || 'Gorev baslatilamadi. Lutfen tekrar deneyin.')
      
      // Hata durumunda GPS tracking'i durdur
      if (isTracking) {
        stopTracking()
      }
    } finally {
      setStartingTask(null)
    }
  }

  // Görevi tamamla ve GPS tracking'i durdur
  const handleCompleteTask = async (taskId: string) => {
    const confirmed = confirm('Bu gorevi tamamladiniz mi? GPS tracking durdurul acak.')
    if (!confirmed) return

    try {
      console.log('Gorev tamamlaniyor, Task ID:', taskId)
      
      // 1. GPS Tracking'i durdur
      if (isTracking) {
        console.log('GPS tracking durduruluyor...')
        stopTracking()
      }

      // 2. Görev durumunu güncelle
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString() 
        })
        .eq('id', taskId)

      if (error) throw error

      // 3. Aktif görev ID'sini temizle
      setActiveTaskId(null)
      
      console.log('Gorev basariyla tamamlandi! GPS tracking durduruldu.')
      
      // TODO: GPS trace oluştur
      // Bu göreve ait tüm gps_locations kayıtlarını al
      // gps_traces tablosuna özet olarak kaydet
      
    } catch (err) {
      console.error('Gorev tamamlama hatasi:', err)
      alert('Gorev tamamlanamadi')
    }
  }

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'assigned':
        return <Badge variant="default">Atandı</Badge>
      case 'in_progress':
        return <Badge variant="info">Devam Ediyor</Badge>
      case 'completed':
        return <Badge variant="success">Tamamlandı</Badge>
      case 'cancelled':
        return <Badge variant="error">İptal Edildi</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">Henüz atanmış görev yok</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* GPS Tracking Durumu */}
      <Card className={`border ${isTracking ? 'border-green-500/20 bg-green-500/5' : 'border-blue-500/20 bg-blue-500/5'}`}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            {isTracking ? (
              <Navigation className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5 animate-pulse" />
            ) : (
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium ${isTracking ? 'text-green-400' : 'text-blue-400'}`}>
                {isTracking ? 'GPS Tracking Aktif' : 'GPS Tracking Hazir'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {isTracking ? (
                  <>
                    Konumunuz her 10 saniyede bir kaydediliyor.
                    {currentLocation && (
                      <span className="ml-2 text-green-400">
                        Hassasiyet: ~{currentLocation.accuracy.toFixed(0)}m
                      </span>
                    )}
                  </>
                ) : (
                  'Gorev baslattiginizda GPS tracking otomatik olarak baslayacak.'
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {tasks.map((task) => (
        <Card key={task.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{task.title}</CardTitle>
                {task.description && (
                  <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                )}
              </div>
              {getStatusBadge(task.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-slate-400">
              {task.scheduled_start && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {new Date(task.scheduled_start).toLocaleString('tr-TR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
              {task.started_at && (
                <div className="flex items-center gap-1">
                  <Play className="h-4 w-4" />
                  <span>
                    Başladı: {new Date(task.started_at).toLocaleTimeString('tr-TR')}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {task.status === 'assigned' && (
                <Button
                  onClick={() => handleStartTask(task.id)}
                  className="flex-1"
                  isLoading={startingTask === task.id}
                  disabled={!!startingTask}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Görevi Başlat
                </Button>
              )}
              {task.status === 'in_progress' && (
                <Button
                  onClick={() => handleCompleteTask(task.id)}
                  className="flex-1"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Tamamla
                </Button>
              )}
            </div>

            {task.status === 'assigned' && (
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Gorev baslatildiginda GPS tracking otomatik baslar
              </p>
            )}
            {task.status === 'in_progress' && activeTaskId === task.id && isTracking && (
              <p className="text-xs text-green-400 flex items-center gap-1">
                <Navigation className="h-3 w-3 animate-pulse" />
                GPS tracking aktif - Konumunuz kaydediliyor
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
