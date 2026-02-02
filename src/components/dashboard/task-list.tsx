'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/use-auth'
import { useGPSTracking } from '@/lib/hooks/use-gps-tracking'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Play, Square, Loader2 } from 'lucide-react'

interface Task {
  id: string
  title: string
  description?: string
  status: string
  created_at: string
}

export function TaskList() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [processingTask, setProcessingTask] = useState<string | null>(null)
  
  const { isTracking, startTracking, stopTracking } = useGPSTracking(activeTaskId)

  useEffect(() => {
    const loadTasks = async () => {
      console.log('📋 Görevler yükleniyor...')
      
      if (!user) {
        console.log('❌ User yok')
        setLoading(false)
        return
      }

      try {
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('assigned_to', user.id)
          .in('status', ['assigned', 'in_progress'])
          .order('created_at', { ascending: false })

        console.log('📊 Görevler:', { count: data?.length, error })

        if (error) {
          console.error('❌ Query error:', error)
          throw error
        }

        setTasks(data || [])
      } catch (err) {
        console.error('❌ Load error:', err)
        setTasks([])
      } finally {
        console.log('✅ Loading complete')
        setLoading(false)
      }
    }

    loadTasks()
  }, [user])

  const handleStartTask = async (taskId: string) => {
    setProcessingTask(taskId)
    try {
      console.log('🚀 Görev başlatılıyor:', taskId)
      
      // 1. GPS tracking başlat
      setActiveTaskId(taskId)
      const gpsStarted = await startTracking()
      
      if (!gpsStarted) {
        throw new Error('GPS izni reddedildi. Lütfen tarayıcı ayarlarından konum iznini açın.')
      }
      
      console.log('✅ GPS başlatıldı')
      
      // 2. Task status güncelle
      const supabase = createClient()
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'in_progress',
          started_at: new Date().toISOString() 
        })
        .eq('id', taskId)
      
      if (error) throw error
      
      console.log('✅ Task güncellendi')
      
      // 3. Local state güncelle
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'in_progress' } : t
      ))
      
    } catch (err: any) {
      console.error('❌ Görev başlatma hatası:', err)
      alert(err.message || 'Görev başlatılamadı')
      setActiveTaskId(null)
    } finally {
      setProcessingTask(null)
    }
  }

  const handleStopTask = async (taskId: string) => {
    setProcessingTask(taskId)
    try {
      console.log('🛑 Görev durduruluyor:', taskId)
      
      // 1. GPS durdur
      stopTracking()
      setActiveTaskId(null)
      
      console.log('✅ GPS durduruldu')
      
      // 2. Task status güncelle
      const supabase = createClient()
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString() 
        })
        .eq('id', taskId)
      
      if (error) throw error
      
      console.log('✅ Task tamamlandı')
      
      // 3. Task'ı listeden kaldır (completed görünmez)
      setTasks(prev => prev.filter(t => t.id !== taskId))
      
    } catch (err: any) {
      console.error('❌ Görev durdurma hatası:', err)
      alert(err.message || 'Görev durdurulamadı')
    } finally {
      setProcessingTask(null)
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
      <Card className="bg-slate-800/40">
        <CardContent className="p-12 text-center">
          <Clock className="h-12 w-12 mx-auto text-slate-500 mb-4" />
          <p className="text-slate-400">Size henüz görev atanmamış</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="bg-slate-800/40 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-white">{task.title}</h3>
                {task.description && (
                  <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                )}
              </div>
              <Badge variant={task.status === 'in_progress' ? 'default' : 'secondary'}>
                {task.status === 'in_progress' ? 'Devam Ediyor' : 'Bekliyor'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                {new Date(task.created_at).toLocaleString('tr-TR')}
              </p>
              
              {task.status === 'assigned' ? (
                <Button
                  size="sm"
                  onClick={() => handleStartTask(task.id)}
                  disabled={processingTask === task.id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processingTask === task.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Başlatılıyor...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Görevi Başlat
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleStopTask(task.id)}
                  disabled={processingTask === task.id}
                  variant="destructive"
                >
                  {processingTask === task.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Durduruluyor...
                    </>
                  ) : (
                    <>
                      <Square className="h-4 w-4 mr-2" />
                      Görevi Bitir
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
