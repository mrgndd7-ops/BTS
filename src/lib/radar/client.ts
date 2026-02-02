/**
 * Radar.io Client SDK
 * GPS tracking için Radar.io SDK initialization
 * 🔥 CRITICAL: Dynamic import to prevent SSR errors
 */

let Radar: any = null
let isInitialized = false

/**
 * Radar SDK'yı dynamic import ile yükle
 * Sadece browser'da çalışır (SSR safe)
 */
export async function initializeRadar(): Promise<boolean> {
  // Server-side rendering check
  if (typeof window === 'undefined') {
    return false
  }

  // Zaten initialize edilmişse tekrar yapma
  if (isInitialized && Radar) {
    return true
  }

  // Environment variable kontrolü
  const publishableKey = process.env.NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY

  if (!publishableKey) {
    console.error('❌ NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY bulunamadı')
    return false
  }

  try {
    // 🔥 Dynamic import - SSR'da yüklenmez
    if (!Radar) {
      const radarModule = await import('radar-sdk-js')
      Radar = radarModule.default
      console.log('✅ Radar SDK dinamik olarak yüklendi')
    }

    // Radar.io SDK'yi başlat
    Radar.initialize(publishableKey)
    isInitialized = true
    console.log('✅ Radar SDK initialize edildi')
    return true
  } catch (error) {
    console.error('❌ Radar SDK yüklenemedi:', error)
    return false
  }
}

/**
 * Radar SDK'nın initialize durumunu kontrol et
 */
export function isRadarInitialized(): boolean {
  return isInitialized && Radar !== null
}

/**
 * Radar SDK instance'ını döndür
 * NOT: initializeRadar()'ı await ile çağırın
 */
export function getRadar(): any | null {
  if (typeof window === 'undefined') {
    return null
  }

  return Radar
}
