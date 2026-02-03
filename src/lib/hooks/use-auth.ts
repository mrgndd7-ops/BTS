/**
 * Auth işlemleri için custom hook
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import type { LoginInput, RegisterInput } from '@/lib/validations/auth'

export function useAuth() {
  const router = useRouter()
  const { user, profile, isLoading, setUser, setProfile, setIsLoading, reset } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    let isMounted = true
    
    // Initial session check
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (isMounted && session?.user) {
          setUser(session.user)
          
          // Fetch profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (isMounted && profileData) {
            setProfile(profileData)
          }
        } else if (isMounted) {
          // Session yoksa state'i temizle
          setIsLoading(false)
        }
      } catch (error) {
        if (isMounted) {
          console.error('Session check error:', error)
          setIsLoading(false)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return
        
        if (session?.user) {
          setUser(session.user)
          
          // Profile'i da guncelle
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (profileData && isMounted) {
            setProfile(profileData)
          }
        } else {
          reset()
        }
        setIsLoading(false)
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
    // FIXED: Remove unstable dependencies (supabase is singleton now)
  }, [setUser, setProfile, setIsLoading, reset])

  const login = async ({ email, password }: LoginInput) => {
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

      if (error) {
        throw error
      }

      return data
    } catch (err) {
      throw err
    }
  }

  const register = async ({ 
    email, 
    password, 
    role,
    full_name,
    phone,
    city,
    municipality_id,
    department,
    employee_id,
  }: RegisterInput) => {
    console.log('📝 Kayıt başlatılıyor:', { email, role, municipality_id })
    
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
        },
      },
    })

    if (authError) {
      console.error('❌ Auth signUp hatası:', authError)
      throw authError
    }
    if (!authData.user) {
      console.error('❌ User oluşturulamadı')
      throw new Error('Kullanici olusturulamadi')
    }

    console.log('✅ Auth user oluşturuldu:', authData.user.id)

    // 2. Get district from municipality
    const { data: municipalityData } = await supabase
      .from('municipalities')
      .select('district')
      .eq('id', municipality_id)
      .single<{ district: string }>()

    const district = municipalityData?.district || ''
    
    console.log('📍 Municipality bilgisi:', { municipality_id, district })

    // 3. Create profile immediately (don't rely on trigger)
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id,
        email,
        role,
        full_name,
        phone,
        city,
        district,
        municipality_id,
        department: department || null,
        employee_id: employee_id || null,
        status: 'active',
      }] as any)

    if (profileError) {
      console.error('❌ Profile creation error:', profileError)
      throw new Error('Profil olusturulamadi: ' + profileError.message)
    }

    console.log('✅ Profile oluşturuldu başarıyla!')
    console.log('📊 Kayıt tamamlandı:', {
      user_id: authData.user.id,
      email,
      role,
      municipality_id,
      full_name
    })

    return authData
  }

  const logout = async () => {
    // 1. Sign out from Supabase (clears server-side session)
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('SignOut hatasi:', error)
      throw error
    }

    // 2. Reset Zustand store
    reset()
    
    // 3. CRITICAL: NUCLEAR CLEANUP - Clear EVERYTHING
    if (typeof window !== 'undefined') {
      try {
        // Clear ALL localStorage (not just specific keys)
        const localStorageKeys = Object.keys(localStorage)
        localStorageKeys.forEach(key => {
          if (key.includes('sb-') || key.includes('auth') || key.includes('supabase')) {
            localStorage.removeItem(key)
          }
        })
        
        // Also clear Zustand store
        localStorage.removeItem('auth-storage')
        
        // Clear ALL sessionStorage
        sessionStorage.clear()
        
        // NUCLEAR: Clear ALL cookies (not just Supabase)
        document.cookie.split(';').forEach(cookie => {
          const name = cookie.split('=')[0].trim()
          if (name) {
            // Delete with all possible path/domain combinations
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
            document.cookie = `${name}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
            document.cookie = `${name}=; path=/; domain=.${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
          }
        })
      } catch (e) {
        console.error('Storage cleanup error:', e)
      }
    }
  }

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  }
}
