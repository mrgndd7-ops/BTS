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
  const supabase = createClient()
  const { user } = useAuth()
  
  const [isTracking, setIsTracking] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const currentTaskIdRef = useRef<string | null>(taskId || null)

  // Update task ID ref when it changes
  useEffect(() => {
    currentTaskIdRef.current = taskId || null
  }, [taskId])

  /**
   * Konum verisini Supabase'e kaydet
   */
  const saveLocationToDatabase = useCallback(async (location: LocationData) => {
    if (!user?.id) {
      return
    }

    // GPS Hassasiyet kontrolü: 5-10m altında olmalı
    if (location.accuracy > 15) {
      console.warn('📍 GPS Hassasiyet düşük, kaydetme atlanıyor:', location.accuracy)
      return
    }

    try {
      // Device ID oluştur (user_id bazlı)
      const deviceId = `radar-web-${user.id.slice(0, 8)}`
      
      console.log('📍 GPS kaydet:', {
        task_id: currentTaskIdRef.current,
        accuracy: location.accuracy,
        lat: location.latitude,
        lng: location.longitude
      })
      
      await supabase
        .from('gps_locations')
        .insert({
          device_id: deviceId,
          user_id: user.id,
          task_id: currentTaskIdRef.current, // Task ID eklendi
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          speed: location.speed,
          heading: location.heading,
          altitude: location.altitude,
          recorded_at: new Date(location.timestamp).toISOString()
        })
      
      console.log('✅ GPS kaydedildi')
    } catch (err) {
      console.error('❌ GPS kaydetme hatası:', err)
    }
  }, [user?.id, supabase])

  /**
   * Radar.io ile tek seferlik konum al
   */
  const trackOnce = useCallback(async (): Promise<LocationData | null> => {
    const Radar = getRadar()
    if (!Radar) {
      setError('Radar.io SDK yüklenemedi')
      return null
    }

    try {
      setError(null)

      const result = await Radar.trackOnce()
      
      if (result.location) {
        const locationData: LocationData = {
          latitude: result.location.latitude,
          longitude: result.location.longitude,
          accuracy: result.location.accuracy || 0,
          timestamp: Date.now(),
          speed: result.location.speed || null,
          heading: result.location.course || null,
          altitude: result.location.altitude || null
        }

        setCurrentLocation(locationData)
        setPermissionStatus('granted')

        // Supabase'e kaydet
        await saveLocationToDatabase(locationData)

        return locationData
      } else {
        throw new Error('Konum verisi alınamadı')
      }
    } catch (err: any) {
      let errorMessage = 'Konum alınamadı'
      if (err.message?.includes('permission')) {
        errorMessage = 'Konum izni reddedildi. Lütfen tarayıcı ayarlarından konum iznini açın.'
        setPermissionStatus('denied')
      } else if (err.message?.includes('timeout')) {
        errorMessage = 'Konum tespiti zaman aşımına uğradı. Tekrar deneyin.'
      }
      
      setError(errorMessage)
      return null
    }
  }, [saveLocationToDatabase])

  /**
   * Periyodik GPS tracking başlat (her 5 saniyede bir - daha sık güncelleme)
   */
  const startTracking = useCallback(async (): Promise<boolean> => {
    // Radar.io'yu initialize et
    const initialized = initializeRadar()
    if (!initialized) {
      setError('Radar.io başlatılamadı. Lütfen sayfayı yenileyin.')
      return false
    }

    console.log('🚀 GPS Tracking başlatılıyor...')

    // İlk konumu hemen al
    const firstLocation = await trackOnce()
    if (!firstLocation) {
      return false
    }

    // Tracking başladı
    setIsTracking(true)
    setError(null)

    console.log('✅ GPS Tracking aktif - Her 5 saniyede güncelleme')

    // Her 5 saniyede bir konum al (daha sık update için)
    trackingIntervalRef.current = setInterval(async () => {
      console.log('📍 GPS güncelleme zamanı...')
      await trackOnce()
    }, 5000) // 5 saniye

    return true
  }, [trackOnce])

  /**
   * GPS tracking'i durdur
   */
  const stopTracking = useCallback(() => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current)
      trackingIntervalRef.current = null
    }
    setIsTracking(false)
    setCurrentLocation(null)
  }, [])

  /**
   * Konum iznini kontrol et
   */
  const checkPermission = useCallback(async (): Promise<boolean> => {
    try {
      if ('permissions' in navigator) {
        const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
        const newStatus = result.state === 'granted' ? 'granted' : result.state === 'denied' ? 'denied' : 'prompt'
        setPermissionStatus(newStatus)
        return result.state !== 'denied'
      }
      return true
    } catch {
      return true // Safari doesn't support permissions API fully
    }
  }, [])

  /**
   * Component unmount'ta tracking'i durdur
   */
  useEffect(() => {
    return () => {
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
    checkPermission
  }
}
