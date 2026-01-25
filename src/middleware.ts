/**
 * Next.js Middleware
 * Auth kontrolü ve route protection
 */

import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Auth gerektirmeyen public route'lar
const PUBLIC_ROUTES = ['/login', '/register']

// Role bazlı route'lar
const ADMIN_ROUTES = ['/admin']
const PERSONNEL_ROUTES = ['/worker']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Supabase session'ı güncelle
  const response = await updateSession(request)

  // Public route'larda middleware'i atla
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return response
  }

  // Session kontrolü - Supabase cookie pattern'i
  const hasSbToken = request.cookies.getAll().some(cookie => 
    cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')
  )

  // Auth gerektiren route'larda session yoksa login'e yönlendir
  if (!hasSbToken && !PUBLIC_ROUTES.includes(pathname)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // TODO: Role-based access control
  // Bu kısım profil bilgisi çekildikten sonra implement edilecek

  return response
}

export const config = {
  matcher: []  // Middleware'i geçici olarak devre dışı bırak
}
