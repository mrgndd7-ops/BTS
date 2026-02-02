'use client'

import { NotificationBell } from '@/components/dashboard/notification-bell'

interface HeaderProps {
  title: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          {description && (
            <p className="text-sm text-slate-400">{description}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <NotificationBell />
        </div>
      </div>
    </header>
  )
}
