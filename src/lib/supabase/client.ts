/**
 * Supabase Browser Client
 * Client-side (React Components) için kullanılır
 */

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  // Singleton pattern - aynı client'ı tekrar kullan (mobil için kritik)
  if (browserClient) {
    return browserClient
  }

  browserClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          // SSR safety check
          if (typeof document === 'undefined') return undefined
          
          const value = `; ${document.cookie}`
          const parts = value.split(`; ${name}=`)
          if (parts.length === 2) {
            const cookie = parts.pop()?.split(';').shift()
            return cookie
          }
          return undefined
        },
        set(name, value, options) {
          // SSR safety check
          if (typeof document === 'undefined') return
          
          let cookie = `${name}=${value}`
          
          if (options?.maxAge) {
            cookie += `; max-age=${options.maxAge}`
          }
          if (options?.domain) {
            cookie += `; domain=${options.domain}`
          }
          if (options?.path) {
            cookie += `; path=${options.path || '/'}`
          }
          if (options?.sameSite) {
            cookie += `; samesite=${options.sameSite}`
          }
          if (options?.secure) {
            cookie += '; secure'
          }
          
          document.cookie = cookie
        },
        remove(name, options) {
          // SSR safety check
          if (typeof document === 'undefined') return
          
          // Max-age=0 ile cookie'yi expire et
          let cookie = `${name}=; max-age=0`
          
          if (options?.path) {
            cookie += `; path=${options.path || '/'}`
          }
          if (options?.domain) {
            cookie += `; domain=${options.domain}`
          }
          
          document.cookie = cookie
        },
      },
      auth: {
        // Mobil için storage options
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce', // PKCE flow for better security on mobile
      },
    }
  )

  return browserClient
}
