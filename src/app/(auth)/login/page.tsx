'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { useAuth } from '@/lib/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  // Login page mount: clear old sessions/cookies that may break mobile auth flow
  useState(() => {
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';')
      cookies.forEach(cookie => {
        const name = cookie.split('=')[0].trim()
        if (name.includes('sb-') || name.includes('auth') || name.includes('supabase')) {
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
          document.cookie = `${name}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        }
      })

      Object.keys(localStorage).forEach(key => {
        if (key.includes('sb-') || key.includes('auth') || key.includes('supabase')) {
          localStorage.removeItem(key)
        }
      })
    }
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    try {
      setError(null)
      const normalizedEmail = data.email.trim().toLowerCase()

      const result = await login({
        ...data,
        email: normalizedEmail,
      })

      const userId = result.user?.id
      if (!userId) {
        throw new Error('Giris basarili gorunuyor ama kullanici bilgisi alinamadi')
      }

      // Retry profile fetch for mobile timing issues
      let profileRole: string | null = null
      let lastProfileError: string | null = null

      for (let attempt = 1; attempt <= 3; attempt++) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle<{ role: string }>()

        if (profileData?.role) {
          profileRole = profileData.role
          break
        }

        lastProfileError = profileError?.message || 'Profil bilgisi henuz hazir degil'
        await new Promise((resolve) => setTimeout(resolve, 250))
      }

      // Last fallback: role from auth metadata
      if (!profileRole) {
        const metadataRole = result.user?.user_metadata?.role
        if (typeof metadataRole === 'string' && metadataRole.length > 0) {
          profileRole = metadataRole
        }
      }

      if (!profileRole) {
        throw new Error(lastProfileError || 'Profil bilgisi yuklenemedi')
      }

      const redirect = searchParams.get('redirect')
      if (redirect && redirect !== '/') {
        router.push(redirect)
      } else {
        const isWorkerRole = ['personnel', 'worker', 'driver'].includes(profileRole)
        router.push(isWorkerRole ? '/worker' : '/admin')
      }

      router.refresh()
    } catch (err) {
      console.error('Login error:', err)
      const message = err instanceof Error ? err.message : ''
      if (message.toLowerCase().includes('invalid login credentials')) {
        setError('E-posta veya sifre hatali. Mobilde bosluk/buyuk harf kontrol edin.')
      } else {
        setError(message || 'Gecersiz kullanici adi veya sifre')
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-3xl">BTS</CardTitle>
          <CardDescription className="text-center">
            Belediye Temizlik Sistemine Hos Geldiniz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <Input
              label="E-posta"
              type="email"
              placeholder="ornek@belediye.gov.tr"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Sifre"
              type="password"
              placeholder="********"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
            >
              Giris Yap
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-center text-sm text-slate-400">
            Hesabiniz yok mu?{' '}
            <Link href="/register" className="text-blue-500 hover:underline">
              Kayit Ol
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}

