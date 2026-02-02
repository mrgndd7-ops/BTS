'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Route, 
  ClipboardList, 
  Users, 
  ClipboardCheck,
  Award,
  AlertCircle,
  Map,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/stores/ui-store'
import { useAuth } from '@/lib/hooks/use-auth'
import { Button } from '@/components/ui/button'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: string[]
}

const adminNavItems: NavItem[] = [
  { title: 'Ana Sayfa', href: '/admin', icon: LayoutDashboard },
  { title: 'Rotalar', href: '/admin/routes', icon: Route },
  { title: 'Görevler', href: '/admin/tasks', icon: ClipboardList },
  { title: 'Personel', href: '/admin/personnel', icon: Users },
  { title: 'Ayarlar', href: '/admin/settings', icon: Settings },
]

const workerNavItems: NavItem[] = [
  { title: 'Ana Sayfa', href: '/worker', icon: LayoutDashboard },
  { title: 'Görevlerim', href: '/worker/my-tasks', icon: ClipboardList },
  { title: 'Rotam', href: '/worker/my-route', icon: Route },
  { title: 'Performansım', href: '/worker/performance', icon: Award },
  { title: 'Ayarlar', href: '/worker/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const { profile, logout } = useAuth()

  const navItems = profile?.role === 'personnel' ? workerNavItems : adminNavItems

  const handleLogout = async () => {
    try {
      console.log('🚪 Çıkış yapılıyor...')
      
      // 1. Logout (clears storage + cookies)
      await logout()
      
      console.log('✅ Logout başarılı')
      
      // 2. FORCE hard reload to clear ALL memory
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
        // Force full page reload (not SPA navigation)
        setTimeout(() => {
          window.location.reload()
        }, 100)
      }
    } catch (error) {
      console.error('❌ Logout error:', error)
      
      // Force redirect even on error
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
        setTimeout(() => {
          window.location.reload()
        }, 100)
      }
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 bg-slate-800 border-r border-slate-700 transition-transform duration-200 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-slate-700 px-6">
            <h1 className="text-xl font-bold text-white">BTS</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* User info */}
          <div className="border-b border-slate-700 p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {profile?.full_name || 'Kullanıcı'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {profile?.role === 'admin' && 'Yönetici'}
                  {profile?.role === 'supervisor' && 'Süpervizör'}
                  {profile?.role === 'personnel' && 'Personel'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    // Close sidebar on mobile after clicking
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false)
                    }
                  }}
                  className={cn(
                    'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-slate-700 p-4">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-start space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-4 z-30 lg:hidden rounded-md bg-slate-800 p-2 text-white"
      >
        <Menu className="h-6 w-6" />
      </button>
    </>
  )
}
