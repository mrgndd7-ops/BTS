'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { useAuth } from '@/lib/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { getCities } from '@/lib/utils/turkey-cities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

type Municipality = {
  id: string
  name: string
  city: string
  district: string
}

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const { register: registerUser } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [filteredMunicipalities, setFilteredMunicipalities] = useState<Municipality[]>([])
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const selectedCity = watch('city')

  // Get Turkey cities with custom sorting (Istanbul, Ankara, Izmir first)
  const cities = (() => {
    const allCities = getCities()
    const priority = ['İstanbul', 'Ankara', 'İzmir']
    const priorityCities = allCities.filter(c => priority.includes(c))
    const otherCities = allCities.filter(c => !priority.includes(c))
    return [...priorityCities, ...otherCities]
  })()

  // Fetch municipalities when city is selected
  useEffect(() => {
    const fetchMunicipalities = async () => {
      if (!selectedCity) {
        setFilteredMunicipalities([])
        return
      }

      setLoadingMunicipalities(true)
      try {
        console.log('🏢 Belediye aranıyor, il:', selectedCity)
        
        const { data, error } = await supabase
          .from('municipalities')
          .select('id, name, city, district')
          .eq('is_active', true)
          .eq('city', selectedCity)
          .order('name', { ascending: true })
        
        console.log('📊 Bulunan belediye sayısı:', data?.length || 0)
        console.log('📋 Belediyeler:', data)
        
        if (error) {
          console.error('❌ Belediye yükleme hatası:', error)
          setFilteredMunicipalities([])
        } else if (data && data.length > 0) {
          console.log('✅ Belediyeler yüklendi')
          setFilteredMunicipalities(data)
        } else {
          console.warn('⚠️ Bu ilde belediye bulunamadı:', selectedCity)
          setFilteredMunicipalities([])
        }
      } catch (err) {
        console.error('❌ Belediye fetch error:', err)
        setFilteredMunicipalities([])
      } finally {
        setLoadingMunicipalities(false)
      }
    }
    fetchMunicipalities()
  }, [selectedCity, supabase])

  const onSubmit = async (data: RegisterInput) => {
    try {
      setError(null)
      await registerUser(data)
      
      setSuccess(true)
      
      // Dashboard'a yönlendir (profil zaten tamamlandı)
      setTimeout(() => {
        if (data.role === 'personnel') {
          router.push('/worker')
        } else {
          router.push('/admin')
        }
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt başarısız oldu')
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Kayıt Başarılı!</CardTitle>
            <CardDescription className="text-center">
              Dashboard&apos;a yönlendiriliyorsunuz...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-3xl">Kayıt Ol</CardTitle>
          <CardDescription className="text-center">
            BTS hesabı oluşturun - Tüm bilgileri doldurun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {/* Hesap Bilgileri */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-200">Hesap Bilgileri</h3>
              
              <Input
                label="E-posta"
                type="email"
                placeholder="ornek@belediye.gov.tr"
                error={errors.email?.message}
                {...register('email')}
              />

              <Select
                label="Rol"
                options={[
                  { value: '', label: 'Rol seçiniz' },
                  { value: 'admin', label: 'Yönetici' },
                  { value: 'personnel', label: 'Personel' },
                ]}
                error={errors.role?.message}
                {...register('role')}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Şifre"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />

                <Input
                  label="Şifre Tekrar"
                  type="password"
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>

              <div className="text-xs text-slate-400 space-y-1 bg-slate-800/50 p-3 rounded-md">
                <p className="font-medium">Şifre gereksinimleri:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>En az 6 karakter</li>
                  <li>En az bir büyük harf</li>
                  <li>En az bir küçük harf</li>
                  <li>En az bir rakam</li>
                </ul>
              </div>
            </div>

            {/* Kişisel Bilgiler */}
            <div className="space-y-4 pt-4 border-t border-slate-700">
              <h3 className="text-lg font-semibold text-slate-200">Kişisel Bilgiler</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Ad Soyad"
                  type="text"
                  placeholder="Ahmet Yılmaz"
                  error={errors.full_name?.message}
                  {...register('full_name')}
                />

                <Input
                  label="Telefon"
                  type="tel"
                  placeholder="05551234567"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Sicil No (Opsiyonel)"
                  type="text"
                  placeholder="12345"
                  error={errors.employee_id?.message}
                  {...register('employee_id')}
                />

                <Input
                  label="Departman (Opsiyonel)"
                  type="text"
                  placeholder="Temizlik İşleri"
                  error={errors.department?.message}
                  {...register('department')}
                />
              </div>
            </div>

            {/* Belediye Bilgileri */}
            <div className="space-y-4 pt-4 border-t border-slate-700">
              <h3 className="text-lg font-semibold text-slate-200">Belediye Bilgileri</h3>
              
              <Select
                label="İl"
                options={[
                  { value: '', label: 'İl seçiniz' },
                  ...cities.map(city => ({ value: city, label: city }))
                ]}
                error={errors.city?.message}
                {...register('city')}
              />

              <Select
                label="Belediye"
                options={[
                  { 
                    value: '', 
                    label: loadingMunicipalities 
                      ? 'Yükleniyor...' 
                      : !selectedCity 
                        ? 'Önce il seçiniz' 
                        : filteredMunicipalities.length === 0
                          ? 'Bu ilde belediye bulunamadı'
                          : 'Belediye seçiniz'
                  },
                  ...filteredMunicipalities.map(m => ({ 
                    value: m.id, 
                    label: m.name 
                  }))
                ]}
                error={errors.municipality_id?.message}
                disabled={!selectedCity || loadingMunicipalities}
                {...register('municipality_id')}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
            >
              Kayıt Ol
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-center text-sm text-slate-400">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="text-blue-500 hover:underline">
              Giriş Yap
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
