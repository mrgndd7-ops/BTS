'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

interface PersonnelLocation {
  id: string
  user_id: string
  task_id: string | null
  latitude: number
  longitude: number
  accuracy: number
  speed: number | null
  heading: number | null
  battery_level: number | null
  recorded_at: string
  profiles: {
    id: string
    full_name: string
    role: string
    avatar_url?: string
  }
  tasks?: {
    id: string
    status: string
    title: string
  } | null
}

interface LiveTrackingMapProps {
  className?: string
  center?: [number, number] // [lng, lat]
  zoom?: number
  municipalityId?: string
  showTrails?: boolean
  onPersonnelClick?: (personnelId: string) => void
}

export function LiveTrackingMap({
  className,
  center = [35.2433, 38.9637],
  zoom = 12,
  municipalityId,
  showTrails = true,
  onPersonnelClick
}: LiveTrackingMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const markers = useRef<Map<string, maplibregl.Marker>>(new Map())
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [personnelLocations, setPersonnelLocations] = useState<Map<string, PersonnelLocation>>(new Map())
  const supabase = createClient()

  // Create custom marker element with active task indication
  const createMarkerElement = useCallback((personnel: PersonnelLocation, isActiveTask: boolean = false) => {
    const el = document.createElement('div')
    el.className = 'personnel-marker'
    
    // Active task = Blue pulsing animation (görev aktif)
    // Inactive = Gray static (görev tamamlanmış/konum paylaşımı bitti)
    
    el.innerHTML = `
      <div class="relative cursor-pointer">
        ${isActiveTask ? `
          <!-- Outer pulse ring -->
          <div class="absolute -inset-3 bg-blue-400 rounded-full animate-ping opacity-40"></div>
          <!-- Middle pulse ring -->
          <div class="absolute -inset-2 bg-blue-500 rounded-full animate-pulse opacity-60"></div>
        ` : ''}
        <!-- Main marker -->
        <div class="relative w-14 h-14 ${isActiveTask ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-slate-600 to-slate-700'} rounded-full border-4 border-white shadow-2xl flex items-center justify-center transition-all duration-300">
          ${personnel.profiles.avatar_url 
            ? `<img src="${personnel.profiles.avatar_url}" alt="${personnel.profiles.full_name}" class="w-full h-full rounded-full object-cover" />`
            : `<span class="text-white text-base font-bold">${personnel.profiles.full_name.charAt(0)}</span>`
          }
        </div>
        ${isActiveTask ? `
          <!-- Active indicator badge -->
          <div class="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse">
            <div class="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
          </div>
        ` : `
          <!-- Inactive indicator -->
          <div class="absolute -top-1 -right-1 w-5 h-5 bg-slate-400 rounded-full border-2 border-white"></div>
        `}
      </div>
    `
    
    el.addEventListener('click', () => {
      if (onPersonnelClick) {
        onPersonnelClick(personnel.user_id)
      }
    })
    
    return el
  }, [onPersonnelClick])

  // Create popup content
  const createPopupContent = useCallback((personnel: PersonnelLocation) => {
    const lastUpdate = new Date(personnel.recorded_at)
    const now = new Date()
    const minutesAgo = Math.floor((now.getTime() - lastUpdate.getTime()) / 60000)
    
    return `
      <div class="p-2 min-w-[200px]">
        <div class="flex items-center gap-2 mb-2">
          <div class="font-bold text-slate-900">${personnel.profiles.full_name}</div>
        </div>
        <div class="text-xs text-slate-600 space-y-1">
          <div class="flex items-center justify-between">
            <span>Son güncelleme:</span>
            <span class="font-medium">${minutesAgo === 0 ? 'Şimdi' : `${minutesAgo} dk önce`}</span>
          </div>
          ${personnel.speed !== null ? `
            <div class="flex items-center justify-between">
              <span>Hız:</span>
              <span class="font-medium">${Math.round(personnel.speed * 3.6)} km/h</span>
            </div>
          ` : ''}
          ${personnel.battery_level !== null ? `
            <div class="flex items-center justify-between">
              <span>Batarya:</span>
              <span class="font-medium ${personnel.battery_level < 20 ? 'text-red-600' : ''}">${Math.round(personnel.battery_level)}%</span>
            </div>
          ` : ''}
          <div class="flex items-center justify-between">
            <span>Hassasiyet:</span>
            <span class="font-medium">${Math.round(personnel.accuracy)}m</span>
          </div>
        </div>
      </div>
    `
  }, [])

  // Update or create marker for personnel
  const updatePersonnelMarker = useCallback((personnel: PersonnelLocation) => {
    if (!map.current) return

    // Determine if task is active (in_progress status)
    const isActiveTask = !!(personnel.task_id && personnel.tasks?.status === 'in_progress')
    
    // DEBUG LOG
    console.log('📍 Update Marker:', {
      user: personnel.profiles?.full_name,
      task_id: personnel.task_id,
      task_status: personnel.tasks?.status,
      isActiveTask
    })

    const existingMarker = markers.current.get(personnel.user_id)
    
    if (existingMarker) {
      // Update existing marker position
      existingMarker.setLngLat([personnel.longitude, personnel.latitude])
      
      // Update popup content
      const popup = existingMarker.getPopup()
      if (popup) {
        popup.setHTML(createPopupContent(personnel))
      }
      
      // CRITICAL FIX: MapLibre doesn't have setElement()
      // We need to remove old marker and create new one to update visual state
      existingMarker.remove()
      markers.current.delete(personnel.user_id)
      
      // Create new marker with updated state (fall through to else block logic)
      const el = createMarkerElement(personnel, isActiveTask)
      const newPopup = new maplibregl.Popup({ 
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(createPopupContent(personnel))
      
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([personnel.longitude, personnel.latitude])
        .setPopup(newPopup)
        .addTo(map.current)
      
      markers.current.set(personnel.user_id, marker)
    } else {
      // Create new marker
      const el = createMarkerElement(personnel, isActiveTask)
      const popup = new maplibregl.Popup({ 
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(createPopupContent(personnel))
      
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([personnel.longitude, personnel.latitude])
        .setPopup(popup)
        .addTo(map.current)
      
      markers.current.set(personnel.user_id, marker)
    }
  }, [createMarkerElement, createPopupContent])

  // Draw trail for personnel
  const updatePersonnelTrail = useCallback(async (userId: string) => {
    if (!map.current || !showTrails) return

    // Fetch recent locations for trail (last 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    
    const { data: trailData } = await supabase
      .from('gps_locations')
      .select('latitude, longitude, recorded_at')
      .eq('user_id', userId)
      .gte('recorded_at', oneHourAgo)
      .order('recorded_at', { ascending: true })
      .limit(100)

    if (!trailData || trailData.length < 2) return

    const sourceId = `trail-${userId}`
    const layerId = `trail-layer-${userId}`

    const coordinates = trailData.map(point => [point.longitude, point.latitude])

    const geojsonData = {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates
      }
    }

    // Check if map is loaded and ready
    if (!map.current.loaded()) {
      console.warn('🗺️ Map not loaded yet, skipping trail update')
      return
    }

    // CRITICAL FIX: Safely check if source exists
    try {
      const existingSource = map.current.getSource(sourceId)
      if (existingSource) {
        // Update existing source
        const source = existingSource as maplibregl.GeoJSONSource
        source.setData(geojsonData)
        console.log('✅ Trail updated:', userId)
      } else {
        // Add new source and layer
        map.current.addSource(sourceId, {
          type: 'geojson',
          data: geojsonData
        })

        map.current.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': '#3b82f6',
            'line-width': 3,
            'line-opacity': 0.6,
            'line-dasharray': [2, 2]
          }
        })
        console.log('✅ Trail created:', userId)
      }
    } catch (error) {
      console.error('❌ Trail update error:', error)
    }
  }, [supabase, showTrails])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        name: 'BTS Live Tracking - Premium',
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: {
              'background-color': '#f8f9fa'
            }
          },
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
            paint: {
              'raster-opacity': 1.0,
              'raster-brightness-min': 0.0,
              'raster-brightness-max': 1.0,
              'raster-contrast': 0.1,
              'raster-saturation': 0.0,
              'raster-fade-duration': 0
            }
          }
        ]
      },
      center,
      zoom,
      maxZoom: 19,
      minZoom: 5,
      pitch: 0,
      bearing: 0,
      fadeDuration: 0,
      renderWorldCopies: false
    })

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right')

    map.current.on('load', () => {
      setIsLoaded(true)
      // Harita tamamen yüklendiğinde initializing'i kapat
      setTimeout(() => setIsInitializing(false), 500)
    })

    // Cleanup
    return () => {
      if (map.current) {
        const currentMarkers = markers.current
        currentMarkers.forEach(marker => marker.remove())
        currentMarkers.clear()
        map.current.remove()
        map.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Sadece ilk mount'ta çalış, center/zoom dependency'sini kaldır

  // Setup realtime subscription and initial load
  useEffect(() => {
    if (!isLoaded) return

    // Load initial personnel data
    ;(async () => {
      let query = supabase
        .from('gps_locations')
        .select(`
          id,
          user_id,
          task_id,
          latitude,
          longitude,
          accuracy,
          speed,
          heading,
          battery_level,
          recorded_at,
          profiles:user_id (
            id,
            full_name,
            role,
            avatar_url
          ),
          tasks:task_id (
            id,
            status,
            title
          )
        `)
        .order('recorded_at', { ascending: false })
      
      // Multi-tenant isolation: Filter by municipality if provided
      if (municipalityId) {
        query = query.eq('municipality_id', municipalityId)
      }
      
      const { data, error } = await query

      if (error || !data) return

      const latestLocations = new Map<string, PersonnelLocation>()
      data.forEach((location: any) => {
        // Skip if no user_id or no profile data
        if (!location.user_id || !location.profiles) return
        
        if (!latestLocations.has(location.user_id)) {
          latestLocations.set(location.user_id, location as PersonnelLocation)
        }
      })

      setPersonnelLocations(latestLocations)

      latestLocations.forEach(personnel => {
        updatePersonnelMarker(personnel)
        if (showTrails) {
          updatePersonnelTrail(personnel.user_id)
        }
      })

      if (latestLocations.size > 0 && map.current) {
        const bounds = new maplibregl.LngLatBounds()
        latestLocations.forEach(location => {
          bounds.extend([location.longitude, location.latitude])
        })
        map.current.fitBounds(bounds, { padding: 50, maxZoom: 15 })
      }
    })()

    const channel = supabase
      .channel('live-gps-tracking')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to ALL events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'gps_locations'
        },
        async (payload) => {
          console.log('🔔 Realtime Event:', payload.eventType, payload)
          
          const newLocation = payload.new as any

          // Eğer user_id yoksa (device mapping yok), skip et
          if (!newLocation.user_id) {
            return
          }

          // Multi-tenant isolation: Skip if different municipality
          if (municipalityId && newLocation.municipality_id !== municipalityId) {
            return
          }

          // Fetch profile and task data
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, role, avatar_url')
            .eq('id', newLocation.user_id)
            .single()

          if (!profile) {
            return
          }

          // Fetch task data if task_id exists
          let taskData = null
          if (newLocation.task_id) {
            const { data: task } = await supabase
              .from('tasks')
              .select('id, status, title')
              .eq('id', newLocation.task_id)
              .single()
            taskData = task
          }

          const personnelLocation: PersonnelLocation = {
            ...newLocation,
            profiles: profile,
            tasks: taskData
          }

          console.log('📍 Location güncelleniyor:', {
            user: profile.full_name,
            lat: newLocation.latitude,
            lng: newLocation.longitude,
            task_status: taskData?.status
          })

          // Update state
          setPersonnelLocations(prev => {
            const updated = new Map(prev)
            updated.set(newLocation.user_id, personnelLocation)
            return updated
          })

          // Update marker
          updatePersonnelMarker(personnelLocation)
          
          // Update trail
          if (showTrails) {
            console.log('🛤️ Trail güncelleniyor...')
            updatePersonnelTrail(newLocation.user_id)
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isLoaded]) // REMOVED: supabase, updatePersonnelMarker, updatePersonnelTrail, showTrails

  return (
    <div className={cn('relative', className)}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {/* Loading Overlay - daha smooth */}
      {isInitializing && (
        <div className="absolute inset-0 z-10 bg-slate-900/95 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-white text-sm font-medium">Harita yükleniyor...</p>
          </div>
        </div>
      )}
      
      {/* Personnel count badge */}
      {isLoaded && personnelLocations.size > 0 && (
        <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-white font-medium">
              {personnelLocations.size} Personel Aktif
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
