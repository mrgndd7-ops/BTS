'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'

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
            <div className="flex items-start justify-between mb-2">
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
            <p className="text-xs text-slate-500">
              {new Date(task.created_at).toLocaleString('tr-TR')}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
