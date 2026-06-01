'use client'

import { useState, useRef } from 'react'
import { useDashboard } from '../DashboardContext'
import { createClient } from '@/lib/supabase/client'

type Section = 'theme' | 'header' | 'buttons' | 'background' | 'text' | 'colors'

const SECTIONS: { key: Section; label: string }[] = [
  { key: 'theme', label: 'Theme' },
  { key: 'header', label: 'Header' },
  { key: 'buttons', label: 'Buttons' },
  { key: 'background', label: 'Background' },
  { key: 'text', label: 'Text' },
  { key: 'colors', label: 'Colors' },
]

const THEMES = [
  { name: 'Violet', bg: '#7c3aed', btnColor: '#ffffff', btnText: '#3b0764', textColor: '#ffffff', btnStyle: 'pill' },
  { name: 'Ocean', bg: '#0284c7', btnColor: '#ffffff', btnText: '#082f49', textColor: '#ffffff', btnStyle: 'pill' },
  { name: 'Forest', bg: '#15803d', btnColor: '#ffffff', btnText: '#052e16', textColor: '#ffffff', btnStyle: 'rounded' },
  { name: 'Sunset', bg: '#ea580c', btnColor: '#fff7ed', btnText: '#7c2d12', textColor: '#ffffff', btnStyle: 'pill' },
  { name: 'Rose', bg: '#e11d48', btnColor: '#ffffff', btnText: '#4c0519', textColor: '#ffffff', btnStyle: 'pill' },
  { name: 'Night', bg: '#0f172a', btnColor: '#1e293b', btnText: '#f8fafc', textColor: '#f1f5f9', btnStyle: 'rounded' },
  { name: 'Sand', bg: '#b45309', btnColor: '#fef3c7', btnText: '#78350f', textColor: '#ffffff', btnStyle: 'rounded' },
  { name: 'Slate', bg: '#334155', btnColor: '#f8fafc', btnText: '#1e293b', textColor: '#f8fafc', btnStyle: 'pill' },
  { name: 'Pink', bg: '#be185d', btnColor: '#fdf2f8', btnText: '#500724', textColor: '#ffffff', btnStyle: 'pill' },
  { name: 'Teal', bg: '#0f766e', btnColor: '#f0fdfa', btnText: '#042f2e', textColor: '#ffffff', btnStyle: 'pill' },
  { name: 'Indigo', bg: '#4338ca', btnColor: '#eef2ff', btnText: '#1e1b4b', textColor: '#ffffff', btnStyle: 'rounded' },
  { name: 'Dark', bg: '#18181b', btnColor: '#27272a', btnText: '#f4f4f5', textColor: '#f4f4f5', btnStyle: 'rounded' },
]

const GRADIENTS = [
  { name: 'Purple Dream', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Sunset', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Ocean', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { name: 'Fire', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { name: 'Night', value: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
  { name: 'Candy', value: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { name: 'Peach', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
]

const GRADIENT_DIRECTIONS = [
  { label: 'Top → Bottom', value: 'to bottom' },
  { label: 'Left → Right', value: 'to right' },
  { label: 'Diagonal ↘', value: '135deg' },
  { label: 'Diagonal ↙', value: '225deg' },
]

const FONTS = [
  { key: 'inter', label: 'Inter', preview: 'Aa' },
  { key: 'poppins', label: 'Poppins', preview: 'Aa', style: 'Poppins, sans-serif' },
  { key: 'playfair', label: 'Playfair', preview: 'Aa', style: '"Playfair Display", serif' },
  { key: 'montserrat', label: 'Montserrat', preview: 'Aa', style: 'Montserrat, sans-serif' },
  { key: 'space_grotesk', label: 'Space Grotesk', preview: 'Aa', style: '"Space Grotesk", sans-serif' },
]

const COLOR_PALETTES = [
  { name: 'Berry', bg: '#6d28d9', btn: '#ffffff', text: '#6d28d9' },
  { name: 'Coral', bg: '#ef4444', btn: '#ffffff', text: '#ef4444' },
  { name: 'Mint', bg: '#059669', btn: '#ffffff', text: '#059669' },
  { name: 'Sky', bg: '#0ea5e9', btn: '#ffffff', text: '#0ea5e9' },
  { name: 'Amber', bg: '#d97706', btn: '#ffffff', text: '#d97706' },
  { name: 'Ink', bg: '#1e293b', btn: '#f8fafc', text: '#1e293b' },
]

export default function DesignPage() {
  const [section, setSection] = useState<Section>('theme')
  const { profile, updateProfile, uploadAvatar, userId } = useDashboard()
  const [avatarMode, setAvatarMode] = useState<'url' | 'upload'>('url')
  const [uploading, setUploading] = useState(false)
  const [bgImgUploading, setBgImgUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const bgImgRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const isCustomGradient = !GRADIENTS.some(g => g.value === profile.background_gradient)

  const updateCustomGradient = (start: string, end: string, direction: string) => {
    updateProfile({
      gradient_start: start,
      gradient_end: end,
      gradient_direction: direction,
      background_gradient: `linear-gradient(${direction}, ${start}, ${end})`,
    })
  }

  const activateCustomGradient = () => {
    const s = profile.gradient_start || '#833ab4'
    const e = profile.gradient_end || '#fd1d1d'
    const d = profile.gradient_direction || 'to bottom'
    updateProfile({
      gradient_start: s,
      gradient_end: e,
      gradient_direction: d,
      background_gradient: `linear-gradient(${d}, ${s}, ${e})`,
    })
  }

  const handleAvatarUpload = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0]
    if (!file) return
    setUploading(true)
    await uploadAvatar(file)
    setUploading(false)
  }

  const handleBgImageUpload = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0]
    if (!file) return
    setBgImgUploading(true)
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/bg.${ext}`
    let uploadError = (await supabase.storage.from('backgrounds').upload(path, file, { upsert: true })).error
    const bucket = uploadError ? 'avatars' : 'backgrounds'
    if (uploadError) {
      uploadError = (await supabase.storage.from('avatars').upload(path, file, { upsert: true })).error
    }
    if (!uploadError) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      updateProfile({ bg_image_url: `${data.publicUrl}?t=${Date.now()}`, background_type: 'image' })
    }
    setBgImgUploading(false)
  }

  return (
    <div className="max-w-2xl">
      {/* Horizontal scroll tabs — mobile only */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 md:hidden" style={{ scrollbarWidth: 'none' }}>
        {SECTIONS.map(s => (
          <button key={s.key} onClick={() => setSection(s.key)}
            className={`shrink-0 px-4 min-h-[40px] rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              section === s.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="md:flex md:gap-6">
        {/* Section submenu — desktop only */}
        <div className="hidden md:block w-36 shrink-0">
          <div className="space-y-1">
            {SECTIONS.map(s => (
              <button
                key={s.key}
                onClick={() => setSection(s.key)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  section === s.key
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section content */}
        <div className="flex-1 min-w-0">

          {/* ── THEME ── */}
          {section === 'theme' && (
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Choose a theme</h2>
              <div className="grid grid-cols-3 gap-3">
                {THEMES.map(theme => (
                  <button
                    key={theme.name}
                    onClick={() => updateProfile({
                      background_color: theme.bg,
                      button_color: theme.btnColor,
                      button_text_color: theme.btnText,
                      text_color: theme.textColor,
                      button_style: theme.btnStyle,
                      background_type: 'solid',
                    })}
                    className="group rounded-xl overflow-hidden border-2 border-transparent hover:border-indigo-400 transition-all"
                    title={theme.name}
                  >
                    <div className="h-20 flex flex-col items-center justify-center gap-1.5 p-2" style={{ backgroundColor: theme.bg }}>
                      <div className="w-12 h-2 rounded-full opacity-80" style={{ backgroundColor: theme.btnColor }} />
                      <div className="w-12 h-2 rounded-full opacity-80" style={{ backgroundColor: theme.btnColor }} />
                      <div className="w-8 h-2 rounded-full opacity-80" style={{ backgroundColor: theme.btnColor }} />
                    </div>
                    <div className="bg-white py-1 text-center">
                      <span className="text-xs text-gray-600">{theme.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── HEADER ── */}
          {section === 'header' && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold text-gray-900">Header</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-2xl">👤</div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      {(['url', 'upload'] as const).map(m => (
                        <button key={m} onClick={() => setAvatarMode(m)}
                          className={`text-xs px-3 py-1 rounded-full font-medium ${avatarMode === m ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                          {m === 'url' ? 'URL' : 'Upload'}
                        </button>
                      ))}
                    </div>
                    {avatarMode === 'url' ? (
                      <input type="url" value={profile.avatar_url || ''} placeholder="https://example.com/photo.jpg"
                        onChange={e => updateProfile({ avatar_url: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    ) : (
                      <>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                        <button onClick={() => fileRef.current?.click()} disabled={uploading}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                          {uploading ? 'Uploading…' : 'Choose file…'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display name</label>
                <input type="text" value={profile.display_name || ''}
                  onChange={e => updateProfile({ display_name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea value={profile.bio || ''} rows={3}
                  onChange={e => updateProfile({ bio: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
            </div>
          )}

          {/* ── BUTTONS ── */}
          {section === 'buttons' && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold text-gray-900">Buttons</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    ['pill', 'Pill', 'rounded-full'],
                    ['rounded', 'Rounded', 'rounded-xl'],
                    ['square', 'Square', 'rounded-none'],
                    ['shadow', 'Shadow', 'rounded-xl shadow-lg'],
                  ] as const).map(([val, label, cls]) => (
                    <button key={val} onClick={() => updateProfile({ button_style: val })}
                      className={`py-3 text-sm font-medium border-2 transition-all ${
                        profile.button_style === val ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      } ${cls}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <ColorRow label="Button color" value={profile.button_color} onChange={v => updateProfile({ button_color: v })} />
              <ColorRow label="Text color" value={profile.button_text_color} onChange={v => updateProfile({ button_text_color: v })} />
              <ColorRow label="Border color" value={profile.button_border_color} onChange={v => updateProfile({ button_border_color: v })} />
            </div>
          )}

          {/* ── BACKGROUND ── */}
          {section === 'background' && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold text-gray-900">Background</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="flex gap-2">
                  {(['solid', 'gradient', 'image'] as const).map(t => (
                    <button key={t} onClick={() => updateProfile({ background_type: t })}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors capitalize ${
                        profile.background_type === t ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {profile.background_type === 'solid' && (
                <ColorRow label="Background color" value={profile.background_color} onChange={v => updateProfile({ background_color: v })} />
              )}

              {profile.background_type === 'gradient' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Preset gradients</label>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {GRADIENTS.map(g => (
                      <button key={g.name} onClick={() => updateProfile({ background_gradient: g.value })}
                        title={g.name}
                        className={`h-12 rounded-xl border-2 transition-all ${profile.background_gradient === g.value ? 'border-indigo-600 scale-95' : 'border-transparent hover:border-gray-300'}`}
                        style={{ backgroundImage: g.value }} />
                    ))}
                    {/* Custom gradient option */}
                    <button
                      onClick={activateCustomGradient}
                      title="Custom"
                      className={`h-12 rounded-xl border-2 transition-all relative overflow-hidden ${isCustomGradient ? 'border-indigo-600 scale-95' : 'border-transparent hover:border-gray-300'}`}
                      style={{ backgroundImage: `linear-gradient(135deg, ${profile.gradient_start || '#833ab4'}, ${profile.gradient_end || '#fd1d1d'})` }}
                    >
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white drop-shadow">Custom</span>
                    </button>
                  </div>

                  {isCustomGradient && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">Start color</label>
                          <div className="flex items-center gap-2">
                            <input type="color"
                              value={(profile.gradient_start || '#833ab4').startsWith('#') ? (profile.gradient_start || '#833ab4') : '#833ab4'}
                              onChange={e => updateCustomGradient(e.target.value, profile.gradient_end || '#fd1d1d', profile.gradient_direction || 'to bottom')}
                              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                            <input type="text" value={profile.gradient_start || '#833ab4'}
                              onChange={e => updateCustomGradient(e.target.value, profile.gradient_end || '#fd1d1d', profile.gradient_direction || 'to bottom')}
                              className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">End color</label>
                          <div className="flex items-center gap-2">
                            <input type="color"
                              value={(profile.gradient_end || '#fd1d1d').startsWith('#') ? (profile.gradient_end || '#fd1d1d') : '#fd1d1d'}
                              onChange={e => updateCustomGradient(profile.gradient_start || '#833ab4', e.target.value, profile.gradient_direction || 'to bottom')}
                              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                            <input type="text" value={profile.gradient_end || '#fd1d1d'}
                              onChange={e => updateCustomGradient(profile.gradient_start || '#833ab4', e.target.value, profile.gradient_direction || 'to bottom')}
                              className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Direction</label>
                        <div className="grid grid-cols-2 gap-2">
                          {GRADIENT_DIRECTIONS.map(d => (
                            <button key={d.value}
                              onClick={() => updateCustomGradient(profile.gradient_start || '#833ab4', profile.gradient_end || '#fd1d1d', d.value)}
                              className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                                (profile.gradient_direction || 'to bottom') === d.value
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                              }`}>
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {profile.background_type === 'image' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background image</label>
                    {(profile.bg_image_url || profile.background_image_url) && (
                      <img
                        src={profile.bg_image_url || profile.background_image_url}
                        alt=""
                        className="w-full h-32 object-cover rounded-xl mb-3 border border-gray-200"
                        style={{ opacity: (profile.bg_image_opacity ?? 100) / 100 }}
                      />
                    )}
                    <div className="flex gap-2 mb-3">
                      <input ref={bgImgRef} type="file" accept="image/*" onChange={handleBgImageUpload} className="hidden" />
                      <button onClick={() => bgImgRef.current?.click()} disabled={bgImgUploading}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 min-h-[44px]">
                        {bgImgUploading ? 'Uploading…' : 'Upload image'}
                      </button>
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Or paste URL</label>
                    <input type="url" value={profile.bg_image_url || ''} placeholder="https://example.com/bg.jpg"
                      onChange={e => updateProfile({ bg_image_url: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-gray-700">Image opacity</label>
                      <span className="text-sm text-gray-500 tabular-nums">{profile.bg_image_opacity ?? 100}%</span>
                    </div>
                    <input
                      type="range" min={0} max={100} step={1}
                      value={profile.bg_image_opacity ?? 100}
                      onChange={e => updateProfile({ bg_image_opacity: Number(e.target.value) })}
                      className="w-full h-2 accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                      <span>0%</span><span>100%</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-gray-700">Darkness overlay</label>
                      <span className="text-sm text-gray-500 tabular-nums">{profile.bg_image_overlay ?? 0}%</span>
                    </div>
                    <input
                      type="range" min={0} max={80} step={1}
                      value={profile.bg_image_overlay ?? 0}
                      onChange={e => updateProfile({ bg_image_overlay: Number(e.target.value) })}
                      className="w-full h-2 accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                      <span>None</span><span>80% dark</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Helps text stay readable over bright images.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TEXT ── */}
          {section === 'text' && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold text-gray-900">Text</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Font</label>
                <div className="grid grid-cols-1 gap-2">
                  {FONTS.map(f => (
                    <button key={f.key} onClick={() => updateProfile({ font_family: f.key })}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                        profile.font_family === f.key ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <span className="text-2xl font-bold text-gray-700 w-10" style={{ fontFamily: f.style }}>{f.preview}</span>
                      <span className={`text-sm font-medium ${profile.font_family === f.key ? 'text-indigo-700' : 'text-gray-700'}`}>{f.label}</span>
                      {profile.font_family === f.key && (
                        <svg className="w-4 h-4 text-indigo-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <ColorRow label="Text color" value={profile.text_color} onChange={v => updateProfile({ text_color: v })} />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display name size</label>
                <div className="flex gap-1">
                  {(['small', 'medium', 'large', 'xl'] as const).map(size => (
                    <button key={size} onClick={() => updateProfile({ name_size: size })}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${
                        (profile.name_size || 'large') === size
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}>
                      {size === 'xl' ? 'XL' : size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio size</label>
                <div className="flex gap-1">
                  {(['small', 'medium', 'large'] as const).map(size => (
                    <button key={size} onClick={() => updateProfile({ bio_size: size })}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${
                        (profile.bio_size || 'medium') === size
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}>
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <ToggleRow label="Display name bold" checked={profile.name_bold !== false} onChange={v => updateProfile({ name_bold: v })} />
              <ToggleRow label="Bio bold" checked={!!profile.bio_bold} onChange={v => updateProfile({ bio_bold: v })} />
            </div>
          )}

          {/* ── COLORS ── */}
          {section === 'colors' && (
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Color palettes</h2>
              <div className="grid grid-cols-2 gap-3">
                {COLOR_PALETTES.map(palette => (
                  <button key={palette.name} onClick={() => updateProfile({
                    background_color: palette.bg,
                    button_color: palette.btn,
                    button_text_color: palette.text,
                    background_type: 'solid',
                  })}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left">
                    <div className="flex gap-1 shrink-0">
                      <div className="w-6 h-6 rounded-full border border-white shadow-sm" style={{ backgroundColor: palette.bg }} />
                      <div className="w-6 h-6 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: palette.btn }} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{palette.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <input type="color" value={value.startsWith('#') ? value : '#000000'}
          onChange={e => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
        <input type="text" value={value}
          onChange={e => onChange(e.target.value)}
          className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
    </div>
  )
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}
