'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Smartphone, User, Link as LinkIcon, Unlink, Search, Save, Trash2 } from 'lucide-react'
import type { Database } from '@/types/database'

type GpsLocation = Database['public']['Tables']['gps_locations']['Row']

interface UnmappedDevice {
  device_id: string
  first_seen: string
  last_seen: string
  location_count: number
  last_location: {
    latitude: number
    longitude: number
    battery_level?: number
  }
  is_mapped?: boolean
  mapped_user_id?: string
}

interface Profile {
  id: string
  full_name: string
  email: string
  role: string
  status: string
  municipality_id?: string
}

export default function DevicesPage() {
  const supabase = createClient()
  const [unmappedDevices, setUnmappedDevices] = useState<UnmappedDevice[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [mappings, setMappings] = useState<Map<string, string>>(new Map()) // device_id -> user_id
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Load unmapped devices
  useEffect(() => {
    loadUnmappedDevices()
    loadProfiles()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadUnmappedDevices = async () => {
    // Get all GPS locations grouped by device_id
    const { data: gpsData } = await supabase
      .from('gps_locations')
      .select('device_id, recorded_at, latitude, longitude, battery_level')
      .not('device_id', 'is', null)
      .order('recorded_at', { ascending: false }) as { data: GpsLocation[] | null }

    if (!gpsData) return

    // Get existing device mappings
    const { data: existingMappings } = await supabase
      .from('device_mappings')
      .select('device_id, user_id, is_active')
      .eq('is_active', true)

    const mappingMap = new Map<string, string>()
    existingMappings?.forEach(m => {
      mappingMap.set(m.device_id, m.user_id)
    })

    // Group by device_id
    const deviceMap = new Map<string, { locations: any[] }>()
    
    gpsData.forEach(location => {
      if (!location.device_id) return
      
      if (!deviceMap.has(location.device_id)) {
        deviceMap.set(location.device_id, { locations: [] })
      }
      
      deviceMap.get(location.device_id)!.locations.push(location)
    })

    // Build devices list
    const devices: (UnmappedDevice & { is_mapped: boolean, mapped_user_id?: string })[] = []
    
    deviceMap.forEach((deviceData, deviceId) => {
      const sortedLocations = deviceData.locations.sort((a, b) => 
        new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
      )
      
      const latest = sortedLocations[0]
      const first = sortedLocations[sortedLocations.length - 1]
      const isMapped = mappingMap.has(deviceId)
      
      devices.push({
        device_id: deviceId,
        first_seen: first.recorded_at,
        last_seen: latest.recorded_at,
        location_count: deviceData.locations.length,
        last_location: {
          latitude: latest.latitude,
          longitude: latest.longitude,
          battery_level: latest.battery_level
        },
        is_mapped: isMapped,
        mapped_user_id: isMapped ? mappingMap.get(deviceId) : undefined
      })
    })

    // Sort: unmapped first, then by last seen
    const sorted = devices.sort((a, b) => {
      if (a.is_mapped !== b.is_mapped) {
        return a.is_mapped ? 1 : -1 // unmapped first
      }
      return new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime()
    })

    setUnmappedDevices(sorted as any)
  }

  const loadProfiles = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, status, municipality_id')
      .in('role', ['worker', 'driver'])
      .order('full_name')

    if (data) {
      setProfiles(data)
    }
  }

  const handleMapping = (deviceId: string, userId: string) => {
    setMappings(prev => {
      const updated = new Map(prev)
      if (userId === '') {
        updated.delete(deviceId)
      } else {
        updated.set(deviceId, userId)
      }
      return updated
    })
  }

  const saveMappings = async () => {
    setSaving(true)
    try {
      // Get current user profile for municipality_id
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('id, municipality_id')
        .eq('id', user.id)
        .single()

      if (!adminProfile) throw new Error('Profile not found')

      // Insert/Update device_mappings
      const mappingInserts = Array.from(mappings.entries()).map(([deviceId, userId]) => {
        // Get user's municipality_id
        const userProfile = profiles.find(p => p.id === userId)
        
        return supabase
          .from('device_mappings')
          .upsert({
            device_id: deviceId,
            user_id: userId,
            municipality_id: userProfile?.municipality_id || adminProfile.municipality_id,
            mapped_by: adminProfile.id,
            is_active: true
          }, {
            onConflict: 'device_id'
          })
      })

      await Promise.all(mappingInserts)

      // Reload data
      await loadProfiles()
      await loadUnmappedDevices()
      setMappings(new Map())

      alert('Cihaz eşleştirmeleri kaydedildi!')
    } catch (error) {
      console.error('Error saving mappings:', error)
      alert('Hata: Eşleştirmeler kaydedilemedi')
    } finally {
      setSaving(false)
    }
  }

  const unlinkDevice = async (deviceId: string) => {
    if (!confirm('Bu cihaz eşleştirmesini kaldırmak istediğinize emin misiniz?')) {
      return
    }

    try {
      // Set is_active = false in device_mappings
      await supabase
        .from('device_mappings')
        .update({ is_active: false })
        .eq('device_id', deviceId)

      await loadProfiles()
      await loadUnmappedDevices()
      alert('Cihaz eşleştirmesi kaldırıldı')
    } catch (error) {
      console.error('Error unlinking device:', error)
      alert('Hata: Eşleştirme kaldırılamadı')
    }
  }

  const filteredProfiles = profiles.filter(p => 
    searchTerm === '' || 
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const unmappedProfiles = profiles // All profiles available for mapping

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-800">
        <Header 
          title="Cihaz Yönetimi" 
          description="GPS cihazlarını kullanıcılara eşleştirin" 
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Stats */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{unmappedDevices.length}</p>
                  <p className="text-sm text-slate-400">Eşleştirilmemiş Cihaz</p>
                </div>
                <Smartphone className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{profiles.length}</p>
                  <p className="text-sm text-slate-400">Toplam Personel</p>
                </div>
                <User className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{mappings.size}</p>
                  <p className="text-sm text-slate-400">Bekleyen Eşleştirme</p>
                </div>
                <LinkIcon className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Unmapped Devices */}
          <Card>
            <CardHeader>
              <CardTitle>Eşleştirilmemiş Cihazlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {unmappedDevices.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    <Smartphone className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Tüm cihazlar eşleştirilmiş</p>
                  </div>
                ) : (
                  unmappedDevices.map(device => {
                    const isActive = (Date.now() - new Date(device.last_seen).getTime()) / 60000 < 10
                    const selectedUserId = mappings.get(device.device_id)
                    const mappedProfile = device.mapped_user_id ? profiles.find(p => p.id === device.mapped_user_id) : null

                    return (
                      <div 
                        key={device.device_id}
                        className={`p-4 rounded-lg border ${
                          device.is_mapped 
                            ? 'bg-green-500/5 border-green-500/20' 
                            : 'bg-slate-800/50 border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-slate-500'}`} />
                            <span className="font-mono text-sm text-white">{device.device_id}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={isActive ? 'success' : 'default'}>
                              {isActive ? 'Aktif' : 'Pasif'}
                            </Badge>
                            {device.is_mapped && (
                              <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                                <LinkIcon className="h-3 w-3 mr-1" />
                                Eşleştirilmiş
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="text-xs text-slate-400 space-y-1 mb-3">
                          <div>Son görülme: {new Date(device.last_seen).toLocaleString('tr-TR')}</div>
                          <div>{device.location_count} konum kaydı</div>
                          {device.last_location.battery_level && (
                            <div>Batarya: {Math.round(device.last_location.battery_level)}%</div>
                          )}
                          {mappedProfile && (
                            <div className="text-green-400 font-medium">
                              → {mappedProfile.full_name}
                            </div>
                          )}
                        </div>

                        {device.is_mapped ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => unlinkDevice(device.device_id)}
                            className="w-full text-red-400 border-red-500/30 hover:bg-red-500/10"
                          >
                            <Unlink className="mr-2 h-4 w-4" />
                            Eşleştirmeyi Kaldır
                          </Button>
                        ) : (
                          <select
                            value={selectedUserId || ''}
                            onChange={(e) => handleMapping(device.device_id, e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Personel seçin...</option>
                            {unmappedProfiles.map(profile => (
                              <option key={profile.id} value={profile.id}>
                                {profile.full_name} - {profile.role}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {mappings.size > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <Button 
                    onClick={saveMappings}
                    disabled={saving}
                    className="w-full"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Kaydediliyor...' : `${mappings.size} Eşleştirmeyi Kaydet`}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Personnel */}
          <Card>
            <CardHeader>
              <CardTitle>Personel Listesi</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Personel ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {filteredProfiles.map(profile => (
                  <div 
                    key={profile.id}
                    className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-white">{profile.full_name}</div>
                        <div className="text-xs text-slate-400">{profile.email}</div>
                      </div>
                      <Badge variant={profile.role === 'worker' ? 'default' : 'info'}>
                        {profile.role === 'worker' ? 'İşçi' : 'Sürücü'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Nasıl Kullanılır?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-400 space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">1</div>
              <div>
                <strong className="text-white">GPS Uygulama Kurulumu:</strong> Personelin telefonuna GPS tracking uygulamasını yükleyin (Radar.io SDK veya benzeri).
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">2</div>
              <div>
                <strong className="text-white">API Yapılandırması:</strong> GPS uygulamasında Server URL&apos;i şu şekilde ayarlayın: <code className="px-2 py-1 bg-slate-900 rounded text-xs">https://yourdomain.com/api/gps?id=DEVICE_ID</code>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">3</div>
              <div>
                <strong className="text-white">Device ID:</strong> Her cihaz için benzersiz bir ID girin (örn: telefon IMEI, çalışan numarası).
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">4</div>
              <div>
                <strong className="text-white">Eşleştirme:</strong> GPS cihazı konum göndermeye başladığında, cihaz bu sayfada görünecektir. Yukarıdaki listeden ilgili personeli seçip kaydedin.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">5</div>
              <div>
                <strong className="text-white">Takip:</strong> Eşleştirme sonrası, personelin konumu haritada gerçek zamanlı olarak görünecektir.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
