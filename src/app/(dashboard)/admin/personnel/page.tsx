'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/dashboard/header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/use-auth'
import { Users, MapPin, Phone, Mail } from 'lucide-react'

interface Personnel {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  department: string | null
  status: string
  city: string | null
  district: string | null
}

export default function PersonnelPage() {
  const supabase = createClient()
  const { user } = useAuth()
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPersonnel = async () => {
      try {
        console.log('👥 Personel yükleniyor...')
        
        if (!user) {
          console.log('❌ User yok')
          setLoading(false)
          return
        }

        // BASİT QUERY - TÜM PERSONELLER
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone, department, status, city, district')
          .eq('role', 'personnel')
          .order('full_name')

        console.log('📊 Query sonucu:', { count: data?.length, error })

        if (error) {
          console.error('❌ Query error:', error)
          throw error
        }

        setPersonnel(data || [])
      } catch (err) {
        console.error('❌ Load error:', err)
        setPersonnel([])
      } finally {
        console.log('✅ Loading complete')
        setLoading(false)
      }
    }

    loadPersonnel()
  }, [user])

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Header title="Personel" description="Personel yönetimi" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <Header 
        title="Personel" 
        description={`${personnel.length} personel kayıtlı`} 
      />

      {personnel.length === 0 ? (
        <Card className="bg-slate-800/40">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-slate-500 mb-4" />
            <p className="text-slate-400">Henüz personel kaydı yok</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personnel.map((person) => (
            <Card key={person.id} className="bg-slate-800/40 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{person.full_name}</h3>
                    {person.department && (
                      <p className="text-sm text-slate-400">{person.department}</p>
                    )}
                  </div>
                  <Badge 
                    variant={person.status === 'active' ? 'success' : 'default'}
                    className="text-xs"
                  >
                    {person.status === 'active' ? 'Aktif' : 'Pasif'}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  {person.email && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{person.email}</span>
                    </div>
                  )}
                  
                  {person.phone && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone className="h-4 w-4" />
                      <span>{person.phone}</span>
                    </div>
                  )}
                  
                  {person.city && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="h-4 w-4" />
                      <span>{person.city} / {person.district}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
