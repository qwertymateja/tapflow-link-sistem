'use client'

import { type ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { DashboardProvider, useDashboard, type Profile, type Link as LinkType } from './DashboardContext'
import { createClient } from '@/lib/supabase/client'
import Preview, { BUTTON_CLASSES, FONT_FAMILIES } from './Preview'

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
  const { profile, links, saving, saveMsg, save } = useDashboard()
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [showPreview, setShowPreview] = useState(false)

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
            {/* Preview button — hidden on xl where preview panel is always visible */}
            <button
              onClick={() => setShowPreview(true)}
              className="xl:hidden flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 min-h-[40px] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="hidden sm:inline">Preview</span>
            </button>
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

      {/* ── Full-screen preview modal ── */}
      {showPreview && <PreviewModal onClose={() => setShowPreview(false)} profile={profile} links={links} />}

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

// ── Full-screen preview modal ─────────────────────────────────────────────────

interface PreviewModalProps {
  onClose: () => void
  profile: import('./DashboardContext').Profile
  links: import('./DashboardContext').Link[]
}

function PreviewModal({ onClose, profile, links }: PreviewModalProps) {
  const activeLinks = links.filter(l => l.is_active)
  const btnClass = BUTTON_CLASSES[profile.button_style] ?? 'rounded-full'
  const fontFamily = FONT_FAMILIES[profile.font_family] ?? 'Inter, sans-serif'

  const baseBgStyle: React.CSSProperties =
    profile.background_type === 'gradient'
      ? { backgroundImage: profile.background_gradient }
      : { backgroundColor: profile.background_color }

  const imageUrl = profile.bg_image_url || profile.background_image_url
  const imageOpacity = (profile.bg_image_opacity ?? 100) / 100
  const overlayOpacity = (profile.bg_image_overlay ?? 0) / 100

  const btnStyle: React.CSSProperties = {
    backgroundColor: profile.button_color,
    color: profile.button_text_color,
    border: profile.button_border_color && profile.button_border_color !== 'transparent'
      ? `2px solid ${profile.button_border_color}` : undefined,
    boxShadow: profile.button_style === 'shadow' ? '0 4px 14px rgba(0,0,0,0.25)' : undefined,
    fontFamily,
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Base background */}
      <div className="absolute inset-0" style={baseBgStyle} />

      {/* Background image layer */}
      {imageUrl && (
        <div className="absolute inset-0" style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: imageOpacity,
        }} />
      )}

      {/* Dark overlay */}
      {overlayOpacity > 0 && (
        <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }} />
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-50 w-11 h-11 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
        aria-label="Close preview"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-4 pt-[10vh] pb-10 min-h-screen" style={{ fontFamily }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt=""
                className="w-24 h-24 rounded-full object-cover border-4 border-white/20 shadow-xl mx-auto mb-4" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/20 shadow-xl flex items-center justify-center mx-auto mb-4 text-4xl">👤</div>
            )}
            <h1 className="text-2xl font-bold mb-2" style={{ color: profile.text_color || '#ffffff' }}>
              {profile.display_name || profile.username}
            </h1>
            {profile.bio && (
              <p className="text-sm leading-relaxed max-w-xs mx-auto opacity-80" style={{ color: profile.text_color || '#ffffff' }}>
                {profile.bio}
              </p>
            )}
          </div>

          <div className="space-y-3">
            {activeLinks.map(link => (
              <div key={link.id}
                className={`w-full text-center py-4 px-6 font-medium min-h-[52px] flex items-center justify-center ${btnClass}`}
                style={btnStyle}
              >
                {link.title}
              </div>
            ))}
            {activeLinks.length === 0 && (
              <p className="text-center opacity-50 text-sm" style={{ color: profile.text_color || '#ffffff' }}>
                No active links
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
