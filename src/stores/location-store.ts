import { create } from 'zustand'

interface LocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  speed: number | null
  heading: number | null
  timestamp: number | null
  isTracking: boolean
  error: string | null
  setLocation: (location: GeolocationPosition) => void
  setError: (error: string | null) => void
  setIsTracking: (isTracking: boolean) => void
  reset: () => void
}

export const useLocationStore = create<LocationState>((set) => ({
  latitude: null,
  longitude: null,
  accuracy: null,
  speed: null,
  heading: null,
  timestamp: null,
  isTracking: false,
  error: null,
  setLocation: (location) =>
    set({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      speed: location.coords.speed,
      heading: location.coords.heading,
      timestamp: location.timestamp,
      error: null,
    }),
  setError: (error) => set({ error }),
  setIsTracking: (isTracking) => set({ isTracking }),
  reset: () =>
    set({
      latitude: null,
      longitude: null,
      accuracy: null,
      speed: null,
      heading: null,
      timestamp: null,
      isTracking: false,
      error: null,
    }),
}))
