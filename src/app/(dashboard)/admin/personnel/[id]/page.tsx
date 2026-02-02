'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/dashboard/header'
import { MapContainer } from '@/components/maps/map-container'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, MapPin, Clock, Phone, Mail } from 'lucide-react'
import maplibregl from 'maplibre-gl'

interface PersonnelDetail {
  id: string
  full_name: string
  email: string
  phone: string
  role: string
  status: string
  avatar_url?: string
}

interface GPSLocation {
  latitude: number
  longitude: number
  accuracy: number
  recorded_at: string
}

export default function PersonnelDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [personnel, setPersonnel] = useState<PersonnelDetail | null>(null)
  const [locations, setLocations] = useState<GPSLocation[]>([])
  const [map, setMap] = useState<maplibregl.Map | null>(null)

  const personnelId = params.id as string

  // Personel bilgilerini yükle
  useEffect(() => {
    const loadPersonnel = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', personnelId)
        .single()

      if (data) {
        setPersonnel(data)
      }
    }

    loadPersonnel()
  }, [personnelId])

  // GPS lokasyonlarını yükle
  useEffect(() => {
    const loadLocations = async () => {
      const { data } = await supabase
        .from('gps_locations')
        .select('latitude, longitude, accuracy, recorded_at')
        .eq('user_id', personnelId)
        .order('recorded_at', { ascending: false })
        .limit(100) // Son 100 konum

      if (data) {
        setLocations(data)
      }
    }

    loadLocations()

    // Real-time subscription
    const channel = supabase
      .channel(`personnel-${personnelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'gps_locations',
          filter: `user_id=eq.${personnelId}`
        },
        (payload) => {
          const newLocation = payload.new as GPSLocation
          setLocations((prev) => [newLocation, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [personnelId])

  // Haritaya lokasyonları çiz
  useEffect(() => {
    // 🔥 CRITICAL: Map instance ve loaded kontrolü
    if (!map || !map.loaded || !map.loaded() || locations.length === 0) return

    console.log('🗺️ Drawing personnel locations on map...')

    const latestLocation = locations[0]

    // 🔥 CRITICAL: Wait for map to be fully loaded before adding sources/layers
    const drawOnMap = () => {
      // Double check map is still valid
      if (!map || !map.getSource) {
        console.warn('⚠️ Map not ready, skipping draw')
        return
      }

      // Personel marker'ı
      const el = document.createElement('div')
      el.innerHTML = `
        <div class="relative">
          <div class="absolute -inset-1 bg-blue-500 rounded-full animate-ping opacity-75"></div>
          <div class="relative w-12 h-12 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
            <span class="text-white text-sm font-bold">${personnel?.full_name.charAt(0)}</span>
          </div>
        </div>
      `

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div class="text-sm">
          <p class="font-bold">${personnel?.full_name}</p>
          <p class="text-xs text-slate-400">
            Son güncelleme: ${new Date(latestLocation.recorded_at).toLocaleString('tr-TR')}
          </p>
          <p class="text-xs text-slate-400">
            Hassasiyet: ${Math.round(latestLocation.accuracy)}m
          </p>
        </div>
      `)

      new maplibregl.Marker({ element: el })
        .setLngLat([latestLocation.longitude, latestLocation.latitude])
        .setPopup(popup)
        .addTo(map)

      // Rota çizgisi (son 50 konum)
      if (locations.length > 1) {
        const routeCoordinates = locations
          .slice(0, 50)
          .map((loc) => [loc.longitude, loc.latitude])
          .reverse()

        // 🔥 CRITICAL: Check if getSource exists before calling
        if (map.getSource && !map.getSource('personnel-trail')) {
          map.addSource('personnel-trail', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: routeCoordinates
              }
            }
          })

          map.addLayer({
            id: 'personnel-trail-layer',
            type: 'line',
            source: 'personnel-trail',
            paint: {
              'line-color': '#3b82f6',
              'line-width': 3,
              'line-opacity': 0.6
            }
          })
        }
      }

      // Konuma zoom
      map.flyTo({
        center: [latestLocation.longitude, latestLocation.latitude],
        zoom: 15
      })
    }

    // 🔥 CRITICAL: If map is already loaded, draw immediately. Otherwise wait for load event.
    if (map.loaded && map.loaded()) {
      drawOnMap()
    } else {
      map.on('load', drawOnMap)
    }

    // Cleanup
    return () => {
      if (map && map.off) {
        map.off('load', drawOnMap)
      }
    }
  }, [map, locations, personnel])

  if (!personnel) {
    return <div className="p-6">Yükleniyor...</div>
  }

  const latestLocation = locations[0]

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-800 space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Header 
            title={personnel.full_name} 
            description="Personel detayları ve konum takibi" 
          />
        </div>

        {/* Personnel Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {personnel.full_name.charAt(0)}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{personnel.full_name}</h3>
                  <Badge variant={personnel.status === 'active' ? 'success' : 'default'}>
                    {personnel.status === 'active' ? 'Aktif' : 'Pasif'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {personnel.email && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Mail className="h-4 w-4" />
                      {personnel.email}
                    </div>
                  )}
                  {personnel.phone && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone className="h-4 w-4" />
                      {personnel.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Latest Location */}
        {latestLocation && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-white">Son Konum</p>
                    <p className="text-sm text-slate-400">
                      {new Date(latestLocation.recorded_at).toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>
                <Badge variant="info">
                  {Math.round(latestLocation.accuracy)}m hassasiyet
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Location Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{locations.length}</p>
                <p className="text-xs text-slate-400">Konum Kaydı</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <Clock className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                <p className="text-xs text-slate-400">
                  {latestLocation 
                    ? new Date(latestLocation.recorded_at).toLocaleTimeString('tr-TR')
                    : 'Veri yok'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <MapPin className="h-5 w-5 text-green-500 mx-auto mb-1" />
                <p className="text-xs text-slate-400">
                  {latestLocation ? 'Takipte' : 'GPS Kapalı'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex-1">
        {latestLocation ? (
          <MapContainer
            className="h-full"
            center={[latestLocation.longitude, latestLocation.latitude]}
            zoom={15}
            onLoad={setMap}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">GPS verisi bulunamadı</p>
              <p className="text-sm text-slate-500 mt-2">
                Personel GPS takibini henüz başlatmamış
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
