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
  }, [user?.id]) // FIXED: Removed supabase from dependencies

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
    console.log('🚀 GPS Tracking başlatılıyor...')
    
    // ⚠️ HTTPS kontrolü
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setError('GPS tracking için HTTPS gereklidir. Lütfen Vercel URL\'inden test edin.')
      console.error('❌ HTTPS gerekli - şu anki protocol:', window.location.protocol)
      return false
    }

    // 1. ÖNCE: Browser Geolocation API ile izin kontrolü
    console.log('🔐 Step 1: Browser GPS izni kontrol ediliyor...')
    const hasPermission = await checkPermission()
    if (!hasPermission) {
      console.error('❌ GPS izni alınamadı')
      return false
    }
    
    console.log('✅ GPS izni verildi, Radar.io başlatılıyor...')

    // 2. SONRA: Radar.io'yu initialize et
    const initialized = await initializeRadar()
    if (!initialized) {
      setError('Radar.io başlatılamadı. Lütfen sayfayı yenileyin.')
      return false
    }

    // 3. İlk konumu Radar.io ile al
    console.log('📍 İlk konum Radar.io ile alınıyor...')
    const firstLocation = await trackOnce()
    if (!firstLocation) {
      console.error('❌ İlk GPS konumu alınamadı')
      setError('GPS konumu alınamadı. Lütfen cihazınızın GPS ayarlarını kontrol edin.')
      return false
    }

    // 4. Tracking başladı
    setIsTracking(true)
    setError(null)

    console.log('✅ GPS Tracking aktif - Her 5 saniyede güncelleme')

    // 5. Her 5 saniyede bir konum al (daha sık update için)
    trackingIntervalRef.current = setInterval(async () => {
      console.log('📍 GPS güncelleme zamanı...')
      await trackOnce()
    }, 5000) // 5 saniye

    return true
  }, [trackOnce, checkPermission])

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
   * Konum iznini kontrol et ve gerekirse iste
   * Browser Geolocation API kullanarak gerçek izin kontrolü
   */
  const checkPermission = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔐 GPS izni kontrol ediliyor...')
      
      // 1. Önce permission API ile durumu kontrol et
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
        console.log('📋 Permission state:', permission.state)
        
        if (permission.state === 'denied') {
          console.error('❌ GPS izni kalıcı olarak reddedilmiş')
          setPermissionStatus('denied')
          setError('GPS izni reddedildi. Lütfen tarayıcı ayarlarından konum iznini açın.')
          return false
        }
        
        setPermissionStatus(permission.state === 'granted' ? 'granted' : 'prompt')
      }
      
      // 2. Gerçek konum isteği ile izni test et
      return new Promise<boolean>((resolve) => {
        console.log('📍 Browser Geolocation API ile konum isteniyor...')
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('✅ GPS izni verildi:', {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy
            })
            setPermissionStatus('granted')
            setError(null)
            resolve(true)
          },
          (error) => {
            console.error('❌ GPS izin hatası:', error.code, error.message)
            
            if (error.code === 1) { // PERMISSION_DENIED
              setPermissionStatus('denied')
              setError('GPS izni reddedildi. Lütfen tarayıcı ayarlarından konum iznini açın.')
              resolve(false)
            } else if (error.code === 2) { // POSITION_UNAVAILABLE
              setError('GPS konumu alınamıyor. Lütfen cihazınızın GPS ayarlarını kontrol edin.')
              resolve(false)
            } else if (error.code === 3) { // TIMEOUT
              setError('GPS zaman aşımı. Lütfen tekrar deneyin.')
              resolve(false)
            } else {
              setError('GPS hatası: ' + error.message)
              resolve(false)
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        )
      })
    } catch (err) {
      console.error('❌ Permission check error:', err)
      return true // Safari ve eski tarayıcılar için fallback
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
