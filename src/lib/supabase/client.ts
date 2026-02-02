/**
 * Supabase Browser Client
 * Client-side (React Components) için kullanılır
 */

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          // Browser ortamında cookie'yi al
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
          // Browser ortamında cookie'yi set et
          if (typeof document === 'undefined') return
          
          let cookie = `${name}=${value}`
          
          if (options?.maxAge) {
            cookie += `; max-age=${options.maxAge}`
          }
          if (options?.domain) {
            cookie += `; domain=${options.domain}`
          }
          if (options?.path) {
            cookie += `; path=${options.path}`
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
          // Browser ortamında cookie'yi sil
          if (typeof document === 'undefined') return
          
          this.set(name, '', {
            ...options,
            maxAge: 0,
          })
        },
      },
    }
  )
}
