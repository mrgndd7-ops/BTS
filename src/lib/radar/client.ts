/**
 * Radar.io Client SDK
 * GPS tracking için Radar.io SDK initialization
 */

import Radar from 'radar-sdk-js'

let isInitialized = false

/**
 * Radar SDK'yı başlat
 * Sadece browser'da çalışır (SSR safe)
 */
export function initializeRadar(): boolean {
  // Server-side rendering check
  if (typeof window === 'undefined') {
    console.warn('Radar.io sadece browser ortaminda calisir')
    return false
  }

  // Zaten initialize edilmişse tekrar yapma
  if (isInitialized) {
    return true
  }

  // Environment variable kontrolü
  const publishableKey = process.env.NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY

  if (!publishableKey) {
    console.error('NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY environment variable bulunamadi!')
    return false
  }

  try {
    // Radar.io SDK'yi baslat
    Radar.initialize(publishableKey)
    isInitialized = true
    console.log('Radar.io SDK basariyla initialize edildi')
    return true
  } catch (error) {
    console.error('Radar.io SDK initialization hatasi:', error)
    return false
  }
}

/**
 * Radar SDK'nın initialize durumunu kontrol et
 */
export function isRadarInitialized(): boolean {
  return isInitialized
}

/**
 * Radar SDK instance'ını döndür
 * Otomatik initialize eder
 */
export function getRadar(): typeof Radar | null {
  if (typeof window === 'undefined') {
    return null
  }

  if (!isInitialized) {
    const success = initializeRadar()
    if (!success) {
      return null
    }
  }

  return Radar
}

export default Radar
