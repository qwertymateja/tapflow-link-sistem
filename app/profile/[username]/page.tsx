import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ProfileLinks from './ProfileLinks'

export const dynamic = 'force-dynamic'

interface Props { params: { username: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `@${params.username}` }
}

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

const NAME_SIZE_MAP: Record<string, string> = { small: '18px', medium: '22px', large: '28px', xl: '36px' }
const BIO_SIZE_MAP: Record<string, string> = { small: '12px', medium: '14px', large: '16px' }

export default async function ProfilePage({ params }: Props) {
  const supabase = createClient()

  const { data: profile } = await supabase
    .from('profiles').select('*')
    .eq('username', params.username.toLowerCase()).single()

  if (!profile) notFound()

  const { data: links } = await supabase
    .from('links').select('id, title, url, link_type, content, image_url, wifi_ssid, wifi_password, wifi_qr_url, pdf_url')
    .eq('user_id', profile.user_id).eq('is_active', true)
    .order('order', { ascending: true })

  const btnClass = BUTTON_CLASSES[profile.button_style as string] ?? 'rounded-full'
  const fontFamily = FONT_FAMILIES[profile.font_family as string] ?? 'Inter, sans-serif'

  const baseBgStyle: React.CSSProperties =
    profile.background_type === 'gradient'
      ? { backgroundImage: profile.background_gradient }
      : { backgroundColor: profile.background_color || '#7c3aed' }

  const imageUrl = profile.bg_image_url || profile.background_image_url
  const imageOpacity = ((profile.bg_image_opacity ?? 100) as number) / 100
  const overlayOpacity = ((profile.bg_image_overlay ?? 0) as number) / 100

  const textColor = profile.text_color || '#ffffff'

  const btnStyle: React.CSSProperties = {
    backgroundColor: profile.button_color || '#ffffff',
    color: profile.button_text_color || '#1f2937',
    border: profile.button_border_color && profile.button_border_color !== 'transparent'
      ? `2px solid ${profile.button_border_color}` : undefined,
    boxShadow: profile.button_style === 'shadow' ? '0 4px 14px rgba(0,0,0,0.25)' : undefined,
    fontFamily,
  }

  const nameSize = NAME_SIZE_MAP[(profile.name_size as string) || 'large'] ?? '28px'
  const bioSize = BIO_SIZE_MAP[(profile.bio_size as string) || 'medium'] ?? '14px'
  const nameBold = (profile.name_bold as boolean) !== false
  const bioBold = !!(profile.bio_bold as boolean)

  return (
    <main className="relative min-h-screen" style={baseBgStyle}>
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
      <div className="relative z-10 flex justify-center px-4 pt-[10vh] pb-12">
        <div className="w-full max-w-md" style={{ fontFamily }}>
          <div className="text-center mb-8">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name || profile.username}
                className="w-24 h-24 rounded-full object-cover border-4 border-white/20 shadow-xl mx-auto mb-4"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/20 shadow-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">👤</span>
              </div>
            )}
            <h1 className="mb-2" style={{ color: textColor, fontSize: nameSize, fontWeight: nameBold ? 'bold' : 'normal', lineHeight: 1.2 }}>
              {profile.display_name || profile.username}
            </h1>
            {profile.bio && (
              <p className="max-w-xs mx-auto opacity-80 leading-relaxed" style={{ color: textColor, fontSize: bioSize, fontWeight: bioBold ? 'bold' : 'normal' }}>
                {profile.bio}
              </p>
            )}
          </div>

          <ProfileLinks links={links || []} btnClass={btnClass} btnStyle={btnStyle} />
        </div>
      </div>
    </main>
  )
}
