/**
 * Coğrafi hesaplamalar için utility fonksiyonları
 */

export interface Coordinates {
  latitude: number
  longitude: number
}

/**
 * İki koordinat arasındaki mesafeyi Haversine formülü ile hesaplar
 * @returns Mesafe (kilometre)
 */
export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  const R = 6371 // Dünya'nın yarıçapı (km)
  
  const dLat = toRadians(point2.latitude - point1.latitude)
  const dLon = toRadians(point2.longitude - point1.longitude)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) *
      Math.cos(toRadians(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
  return R * c
}

/**
 * Derece cinsinden açıyı radyana çevirir
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Radyan cinsinden açıyı dereceye çevirir
 */
function toDegrees(radians: number): number {
  return radians * (180 / Math.PI)
}

/**
 * İki nokta arasındaki yön açısını hesaplar
 * @returns Açı (derece, 0-360)
 */
export function calculateBearing(
  point1: Coordinates,
  point2: Coordinates
): number {
  const dLon = toRadians(point2.longitude - point1.longitude)
  const lat1 = toRadians(point1.latitude)
  const lat2 = toRadians(point2.latitude)
  
  const y = Math.sin(dLon) * Math.cos(lat2)
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
  
  const bearing = toDegrees(Math.atan2(y, x))
  
  return (bearing + 360) % 360
}

/**
 * Koordinatların geçerli olup olmadığını kontrol eder
 */
export function isValidCoordinates(coords: Coordinates): boolean {
  return (
    coords.latitude >= -90 &&
    coords.latitude <= 90 &&
    coords.longitude >= -180 &&
    coords.longitude <= 180
  )
}

/**
 * Bir noktanın poligon içinde olup olmadığını kontrol eder (Ray Casting Algorithm)
 */
export function isPointInPolygon(
  point: Coordinates,
  polygon: Coordinates[]
): boolean {
  let inside = false
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].longitude
    const yi = polygon[i].latitude
    const xj = polygon[j].longitude
    const yj = polygon[j].latitude
    
    const intersect =
      yi > point.latitude !== yj > point.latitude &&
      point.longitude < ((xj - xi) * (point.latitude - yi)) / (yj - yi) + xi
    
    if (intersect) inside = !inside
  }
  
  return inside
}

/**
 * Koordinat dizisinden toplam mesafe hesaplar
 */
export function calculateTotalDistance(coordinates: Coordinates[]): number {
  if (coordinates.length < 2) return 0
  
  let totalDistance = 0
  
  for (let i = 0; i < coordinates.length - 1; i++) {
    totalDistance += calculateDistance(coordinates[i], coordinates[i + 1])
  }
  
  return totalDistance
}

/**
 * Merkez noktayı hesaplar (centroid)
 */
export function calculateCenter(coordinates: Coordinates[]): Coordinates {
  if (coordinates.length === 0) {
    return { latitude: 0, longitude: 0 }
  }
  
  let totalLat = 0
  let totalLng = 0
  
  coordinates.forEach(coord => {
    totalLat += coord.latitude
    totalLng += coord.longitude
  })
  
  return {
    latitude: totalLat / coordinates.length,
    longitude: totalLng / coordinates.length,
  }
}

/**
 * Türkiye sınırları içinde mi kontrol eder
 */
export function isInTurkey(coords: Coordinates): boolean {
  // Türkiye yaklaşık sınırları
  return (
    coords.latitude >= 36 &&
    coords.latitude <= 42 &&
    coords.longitude >= 26 &&
    coords.longitude <= 45
  )
}
