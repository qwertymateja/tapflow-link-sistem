'use client'

import { useDashboard } from './DashboardContext'

export const BUTTON_CLASSES: Record<string, string> = {
  pill: 'rounded-full',
  rounded: 'rounded-xl',
  square: 'rounded-none',
  shadow: 'rounded-xl',
}

export const FONT_FAMILIES: Record<string, string> = {
  inter: 'Inter, sans-serif',
  poppins: 'Poppins, sans-serif',
  playfair: '"Playfair Display", serif',
  montserrat: 'Montserrat, sans-serif',
  space_grotesk: '"Space Grotesk", sans-serif',
}

const NAME_SIZES: Record<string, string> = { small: '11px', medium: '13px', large: '15px', xl: '19px' }
const BIO_SIZES: Record<string, string> = { small: '9px', medium: '11px', large: '13px' }

export default function Preview() {
  const { profile, links } = useDashboard()

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
      ? `2px solid ${profile.button_border_color}`
      : undefined,
    boxShadow: profile.button_style === 'shadow' ? '0 4px 14px rgba(0,0,0,0.25)' : undefined,
    fontFamily,
  }

  const textColor = profile.text_color || '#ffffff'
  const nameSize = NAME_SIZES[profile.name_size || 'large'] ?? '15px'
  const bioSize = BIO_SIZES[profile.bio_size || 'medium'] ?? '11px'
  const nameBold = profile.name_bold !== false
  const bioBold = !!profile.bio_bold

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
        <div className="relative rounded-[36px] overflow-hidden" style={{ height: 520 }}>
          {/* Base bg */}
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

          {/* Content */}
          <div className="relative z-10 h-full overflow-y-auto px-4 pt-10 pb-5" style={{ fontFamily }}>
            <div className="text-center mb-5">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt=""
                  className="w-14 h-14 rounded-full object-cover border-2 border-white/20 mx-auto mb-2.5" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/20 flex items-center justify-center mx-auto mb-2.5 text-xl">👤</div>
              )}
              <p style={{ color: textColor, fontSize: nameSize, fontWeight: nameBold ? 'bold' : 'normal', lineHeight: 1.3 }}>
                {profile.display_name || profile.username}
              </p>
              {profile.bio && (
                <p className="mt-1 leading-relaxed opacity-80" style={{ color: textColor, fontSize: bioSize, fontWeight: bioBold ? 'bold' : 'normal' }}>
                  {profile.bio}
                </p>
              )}
            </div>

            <div className="space-y-2">
              {activeLinks.map(link => (
                <div key={link.id} className={`w-full py-2.5 px-3 text-xs font-medium ${btnClass} flex items-center justify-center gap-1.5`} style={btnStyle}>
                  {link.link_type === 'text' && (
                    <svg className="w-3 h-3 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h8" />
                    </svg>
                  )}
                  {link.link_type === 'image' && (
                    <svg className="w-3 h-3 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  {link.link_type === 'wifi' && (
                    <svg className="w-3 h-3 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                  )}
                  <span className="truncate">{link.title}</span>
                </div>
              ))}
              {activeLinks.length === 0 && (
                <p className="text-xs text-center opacity-40 py-4" style={{ color: textColor }}>
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
