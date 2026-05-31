'use client'

import { useDashboard } from './DashboardContext'

const BUTTON_CLASSES: Record<string, string> = {
  pill: 'rounded-full',
  rounded: 'rounded-xl',
  square: 'rounded-none',
  shadow: 'rounded-xl',
}

const FONT_FAMILIES: Record<string, string> = {
  inter: 'Inter, sans-serif',
  poppins: 'Poppins, sans-serif',
  playfair: '"Playfair Display", serif',
  montserrat: 'Montserrat, sans-serif',
  space_grotesk: '"Space Grotesk", sans-serif',
}

export default function Preview() {
  const { profile, links } = useDashboard()

  const activeLinks = links.filter(l => l.is_active)
  const btnClass = BUTTON_CLASSES[profile.button_style] ?? 'rounded-full'
  const fontFamily = FONT_FAMILIES[profile.font_family] ?? 'Inter, sans-serif'

  const bgStyle: React.CSSProperties = (() => {
    if (profile.background_type === 'gradient') {
      return { backgroundImage: profile.background_gradient }
    }
    if (profile.background_type === 'image' && profile.background_image_url) {
      return {
        backgroundImage: `url(${profile.background_image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    }
    return { backgroundColor: profile.background_color }
  })()

  const btnStyle: React.CSSProperties = {
    backgroundColor: profile.button_color,
    color: profile.button_text_color,
    border: profile.button_border_color && profile.button_border_color !== 'transparent'
      ? `2px solid ${profile.button_border_color}`
      : undefined,
    boxShadow: profile.button_style === 'shadow' ? '0 4px 14px rgba(0,0,0,0.25)' : undefined,
    fontFamily,
  }

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Preview</p>

      {/* Phone frame */}
      <div className="relative w-60 bg-gray-900 rounded-[44px] shadow-2xl p-2.5 border-4 border-gray-800">
        {/* Speaker notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-full z-10 flex items-center justify-center">
          <div className="w-10 h-1.5 bg-gray-700 rounded-full" />
        </div>

        {/* Screen */}
        <div className="rounded-[36px] overflow-hidden" style={{ height: 520, ...bgStyle }}>
          <div className="h-full overflow-y-auto px-4 pt-10 pb-5" style={{ fontFamily }}>
            <div className="text-center mb-5">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="w-14 h-14 rounded-full object-cover border-2 border-white/20 mx-auto mb-2.5"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/20 flex items-center justify-center mx-auto mb-2.5 text-xl">
                  👤
                </div>
              )}
              <p
                className="font-bold text-sm leading-tight"
                style={{ color: profile.text_color || '#ffffff' }}
              >
                {profile.display_name || profile.username}
              </p>
              {profile.bio && (
                <p
                  className="text-xs mt-1 leading-relaxed opacity-80"
                  style={{ color: profile.text_color || '#ffffff' }}
                >
                  {profile.bio}
                </p>
              )}
            </div>

            <div className="space-y-2">
              {activeLinks.map(link => (
                <div
                  key={link.id}
                  className={`w-full text-center py-2.5 px-3 text-xs font-medium ${btnClass}`}
                  style={btnStyle}
                >
                  {link.title}
                </div>
              ))}
              {activeLinks.length === 0 && (
                <p className="text-xs text-center opacity-40 py-4" style={{ color: profile.text_color || '#ffffff' }}>
                  No active links
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
