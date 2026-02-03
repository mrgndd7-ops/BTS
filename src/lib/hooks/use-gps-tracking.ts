'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getRadar, initializeRadar } from '@/lib/radar/client'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './use-auth'

export interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
  speed?: number | null
  heading?: number | null
  altitude?: number | null
}

export function useGPSTracking(taskId?: string | null) {
  const [isClient, setIsClient] = useState(false)

  const supabase = createClient()
  const { user } = useAuth()

  const [isTracking, setIsTracking] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt')

  // 20s fallback timer (getCurrentPosition)
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  // watchPosition id
  const watchIdRef = useRef<number | null>(null)
  const currentTaskIdRef = useRef<string | null>(taskId || null)

  // Stale detection refs
  const lastPositionRef = useRef<{ latitude: number; longitude: number } | null>(null)
  const lastMovementAtRef = useRef<number>(Date.now())
  const lastWatcherRestartAtRef = useRef<number>(0)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    currentTaskIdRef.current = taskId || null
  }, [taskId])

  const saveLocationToDatabase = useCallback(
    async (location: LocationData) => {
      if (!user?.id) {
        console.error('User ID bulunamadi, GPS kaydedilemiyor')
        return
      }

      try {
        const deviceId = `radar-web-${user.id.slice(0, 8)}`

        await supabase.from('gps_locations').insert({
          device_id: deviceId,
          user_id: user.id,
          task_id: currentTaskIdRef.current,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          speed: location.speed,
          heading: location.heading,
          altitude: location.altitude,
          recorded_at: new Date(location.timestamp).toISOString(),
        })
      } catch (err) {
        console.error('GPS kaydetme hatasi:', err)
      }
    },
    [user?.id]
  )

  const checkPermission = useCallback(async (): Promise<boolean> => {
    if (!isClient || typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false
    }

    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
        if (permission.state === 'denied') {
          setPermissionStatus('denied')
          setError('GPS izni reddedildi. Lutfen tarayici ayarlarindan konum iznini acin.')
          return false
        }
        setPermissionStatus(permission.state === 'granted' ? 'granted' : 'prompt')
      }

      return await new Promise<boolean>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => {
            setPermissionStatus('granted')
            setError(null)
            resolve(true)
          },
          (geoError) => {
            if (geoError.code === 1) {
              setPermissionStatus('denied')
              setError('GPS izni reddedildi. Lutfen tarayici ayarlarindan konum iznini acin.')
            } else if (geoError.code === 2) {
              setError('GPS konumu alinamiyor. Lutfen cihaz GPS ayarlarini kontrol edin.')
            } else if (geoError.code === 3) {
              setError('GPS zaman asimi. Lutfen tekrar deneyin.')
            } else {
              setError('GPS hatasi: ' + geoError.message)
            }
            resolve(false)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        )
      })
    } catch (err) {
      console.error('Permission check error:', err)
      return true
    }
  }, [isClient])

  const trackOnce = useCallback(async (): Promise<LocationData | null> => {
    if (!isClient || typeof window === 'undefined') {
      return null
    }

    try {
      const Radar = getRadar()
      if (!Radar) {
        setError('Radar.io SDK yuklenemedi')
        return null
      }

      const result = await Radar.trackOnce()
      if (!result.location) {
        throw new Error('Konum verisi alinamadi')
      }

      const locationData: LocationData = {
        latitude: result.location.latitude,
        longitude: result.location.longitude,
        accuracy: result.location.accuracy || 0,
        timestamp: Date.now(),
        speed: result.location.speed || null,
        heading: result.location.course || null,
        altitude: result.location.altitude || null,
      }

      setCurrentLocation(locationData)
      setPermissionStatus('granted')
      await saveLocationToDatabase(locationData)
      return locationData
    } catch (err: any) {
      let message = 'Konum alinamadi'
      if (err.message?.includes('permission')) {
        message = 'Konum izni reddedildi. Lutfen tarayici ayarlarindan konum iznini acin.'
        setPermissionStatus('denied')
      } else if (err.message?.includes('timeout')) {
        message = 'Konum tespiti zaman asimina ugradi. Tekrar deneyin.'
      }
      setError(message)
      return null
    }
  }, [isClient, saveLocationToDatabase])

  const startTracking = useCallback(async (): Promise<boolean> => {
    if (!isClient || typeof window === 'undefined') {
      return false
    }

    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setError("GPS tracking icin HTTPS gereklidir. Lutfen Vercel URL'inden test edin.")
      return false
    }

    const hasPermission = await checkPermission()
    if (!hasPermission) {
      return false
    }

    const initialized = await initializeRadar()
    if (!initialized) {
      setError('Radar.io baslatilamadi. Lutfen sayfayi yenileyin.')
      return false
    }

    if (!navigator.geolocation) {
      setError('Bu cihazda Geolocation API desteklenmiyor.')
      return false
    }

    const handlePosition = async (position: GeolocationPosition) => {
      const latitude = position.coords.latitude
      const longitude = position.coords.longitude
      const now = Date.now()

      const prev = lastPositionRef.current
      if (!prev) {
        lastMovementAtRef.current = now
      } else {
        const moved =
          Math.abs(prev.latitude - latitude) > 0.00001 ||
          Math.abs(prev.longitude - longitude) > 0.00001
        if (moved) {
          lastMovementAtRef.current = now
        }
      }
      lastPositionRef.current = { latitude, longitude }

      const locationData: LocationData = {
        latitude,
        longitude,
        accuracy: position.coords.accuracy || 0,
        timestamp: position.timestamp || now,
        speed: position.coords.speed ?? null,
        heading: position.coords.heading ?? null,
        altitude: position.coords.altitude ?? null,
      }

      setCurrentLocation(locationData)
      setPermissionStatus('granted')
      await saveLocationToDatabase(locationData)
    }

    const startWatcher = () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          await handlePosition(position)
        },
        (geoError) => {
          console.error('watchPosition error:', geoError.code, geoError.message)
          if (geoError.code === 1) {
            setPermissionStatus('denied')
            setError('Konum izni reddedildi. Lutfen tarayici ayarlarindan izin verin.')
          } else {
            setError('Canli konum alinamiyor. Lutfen GPS ayarlarini kontrol edin.')
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      )
    }

    startWatcher()

    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current)
      trackingIntervalRef.current = null
    }

    // 20s fallback + 30s stale restart
    trackingIntervalRef.current = setInterval(() => {
      const now = Date.now()

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await handlePosition(position)

          const staleFor = now - lastMovementAtRef.current
          if (staleFor > 30000 && now - lastWatcherRestartAtRef.current > 25000) {
            console.warn('GPS stale tespit edildi, watcher yeniden baslatiliyor...')
            lastWatcherRestartAtRef.current = now
            startWatcher()
          }
        },
        (geoError) => {
          console.warn('Fallback getCurrentPosition error:', geoError.code, geoError.message)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    }, 20000)

    setIsTracking(true)
    setError(null)
    return true
  }, [isClient, checkPermission, saveLocationToDatabase])

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current)
      trackingIntervalRef.current = null
    }

    lastPositionRef.current = null
    lastMovementAtRef.current = Date.now()
    lastWatcherRestartAtRef.current = 0

    setIsTracking(false)
    setCurrentLocation(null)
  }, [])

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current)
      }
    }
  }, [])

  return {
    isTracking,
    currentLocation,
    error,
    permissionStatus,
    startTracking,
    stopTracking,
    trackOnce,
    checkPermission,
  }
}

