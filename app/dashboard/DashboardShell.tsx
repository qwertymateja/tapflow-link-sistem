'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { DashboardProvider, useDashboard, type Profile, type Link as LinkType } from './DashboardContext'
import { createClient } from '@/lib/supabase/client'
import Preview from './Preview'

interface ShellProps {
  initialProfile: Profile
  initialLinks: LinkType[]
  userId: string
  children: ReactNode
}

export default function DashboardShell({ initialProfile, initialLinks, userId, children }: ShellProps) {
  return (
    <DashboardProvider initialProfile={initialProfile} initialLinks={initialLinks} userId={userId}>
      <ShellInner>{children}</ShellInner>
    </DashboardProvider>
  )
}

const LinkIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.1-1.1m-.758-4.9a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
)

const DesignIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const ExternalIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
)

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

function ShellInner({ children }: { children: ReactNode }) {
  const { profile, saving, saveMsg, save } = useDashboard()
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navItems = [
    { href: '/dashboard/links', label: 'Links', icon: <LinkIcon /> },
    { href: '/dashboard/design', label: 'Design', icon: <DesignIcon /> },
  ]

  const pageTitle = pathname.includes('/design') ? 'Design' : 'Links'

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ── Sidebar (tablet+, hidden on mobile) ── */}
      <aside className="hidden md:flex w-56 shrink-0 bg-white border-r border-gray-100 sticky top-0 h-screen flex-col">
        {/* User */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                {(profile.display_name || profile.username)?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{profile.display_name || profile.username}</p>
              <p className="text-xs text-gray-400 truncate">@{profile.username}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const active = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}>
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-gray-100 space-y-1">
          <a href={`/@${profile.username}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <ExternalIcon />
            View page
          </a>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <LogoutIcon />
            Log out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 md:px-6 h-14 flex items-center justify-between gap-3">
          <h1 className="text-sm font-semibold text-gray-900">{pageTitle}</h1>
          <div className="flex items-center gap-2 md:gap-3">
            {saveMsg && (
              <span className={`text-xs font-medium hidden sm:block ${saveMsg.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>
                {saveMsg}
              </span>
            )}
            <button onClick={save} disabled={saving}
              className="bg-indigo-600 text-white px-4 min-h-[40px] rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors whitespace-nowrap">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {/* Page content — extra bottom padding on mobile for bottom nav */}
        <div className="p-4 md:p-6 pb-24 md:pb-6">
          {children}
        </div>
      </main>

      {/* ── Preview panel (large desktop only) ── */}
      <div className="hidden xl:flex w-80 shrink-0 border-l border-gray-100 bg-white sticky top-0 h-screen items-start justify-center pt-8 overflow-y-auto">
        <Preview />
      </div>

      {/* ── Bottom navigation (mobile only) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 md:hidden bg-white border-t border-gray-100 safe-area-bottom">
        <div className="flex items-stretch">
          {navItems.map(item => {
            const active = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}
                className={`flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] py-2 transition-colors ${
                  active ? 'text-indigo-600' : 'text-gray-500'
                }`}>
                {item.icon}
                <span className="text-[11px] font-medium">{item.label}</span>
              </Link>
            )
          })}

          <a href={`/@${profile.username}`} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] py-2 text-gray-500">
            <ExternalIcon />
            <span className="text-[11px] font-medium">View</span>
          </a>

          <button onClick={logout}
            className="flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] py-2 text-gray-500">
            <LogoutIcon />
            <span className="text-[11px] font-medium">Log out</span>
          </button>
        </div>
      </nav>

    </div>
  )
}
