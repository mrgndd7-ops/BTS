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

  // CRITICAL: Login sayfası mount olduğunda eski session'ı temizle
  useState(() => {
    if (typeof window !== 'undefined') {
      // Clear ALL Supabase cookies and storage
      const cookies = document.cookie.split(';')
      cookies.forEach(cookie => {
        const name = cookie.split('=')[0].trim()
        if (name.includes('sb-') || name.includes('auth') || name.includes('supabase')) {
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
          document.cookie = `${name}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        }
      })
      
      // Clear localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('sb-') || key.includes('auth') || key.includes('supabase')) {
          localStorage.removeItem(key)
        }
      })
      
      console.log('🧹 Login page: Old session cleaned')
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
      
      // Get user's profile to check role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', result.user?.id)
        .single<{ role: string }>()
      
      if (profileError) {
        throw new Error('Profil bilgisi yüklenemedi')
      }
      
      // Redirect based on role
      const redirect = searchParams.get('redirect')
      
      console.log('🔐 Login başarılı, role:', profileData?.role)
      
      // Eger redirect '/' veya bossa, role'e gore yonlendir
      if (redirect && redirect !== '/') {
        router.push(redirect)
      } else {
        // super_admin ve admin aynı panele gider
        const targetUrl = profileData?.role === 'personnel' ? '/worker' : '/admin'
        console.log('🎯 Yönlendirme:', targetUrl)
        router.push(targetUrl)
      }
      
      router.refresh()
    } catch (err) {
      console.error('Login error:', err)
      const message = err instanceof Error ? err.message : ''
      if (message.toLowerCase().includes('invalid login credentials')) {
        setError('E-posta veya şifre hatalı. Mobilde otomatik boşluk/büyük harf olup olmadığını kontrol edin.')
      } else {
        setError(message || 'Geçersiz kullanıcı adı veya şifre')
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
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
            >
              Giriş Yap
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
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
