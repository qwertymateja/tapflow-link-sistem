'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Profile {
  id: string
  user_id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  background_color: string
  button_style: string
  button_color: string
  button_text_color: string
  font_family: string
  background_type: string
  background_gradient: string
  background_image_url: string
  button_border_color: string
  text_color: string
  bg_image_url: string | null
  bg_image_opacity: number
  bg_image_overlay: number
}

export interface Link {
  id: string
  user_id: string
  title: string
  url: string
  order: number
  is_active: boolean
}

const PROFILE_DEFAULTS: Partial<Profile> = {
  font_family: 'inter',
  background_type: 'solid',
  background_gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  background_image_url: '',
  button_border_color: 'transparent',
  text_color: '#ffffff',
  bg_image_url: null,
  bg_image_opacity: 100,
  bg_image_overlay: 0,
}

interface DashboardContextValue {
  profile: Profile
  links: Link[]
  saving: boolean
  saveMsg: string
  userId: string
  updateProfile: (partial: Partial<Profile>) => void
  save: () => Promise<void>
  addLink: (title: string, url: string) => Promise<void>
  deleteLink: (id: string) => Promise<void>
  updateLink: (id: string, title: string, url: string) => Promise<void>
  toggleLink: (id: string) => Promise<void>
  reorderLinks: (newLinks: Link[]) => Promise<void>
  uploadAvatar: (file: File) => Promise<void>
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used inside DashboardProvider')
  return ctx
}

interface ProviderProps {
  initialProfile: Profile
  initialLinks: Link[]
  userId: string
  children: ReactNode
}

export function DashboardProvider({ initialProfile, initialLinks, userId, children }: ProviderProps) {
  const [profile, setProfile] = useState<Profile>({ ...PROFILE_DEFAULTS, ...initialProfile } as Profile)
  const [links, setLinks] = useState<Link[]>(initialLinks)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const supabase = createClient()

  const flashMsg = (msg: string) => {
    setSaveMsg(msg)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  const updateProfile = (partial: Partial<Profile>) =>
    setProfile(p => ({ ...p, ...partial }))

  const save = async () => {
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      display_name: profile.display_name,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      background_color: profile.background_color,
      button_style: profile.button_style,
      button_color: profile.button_color,
      button_text_color: profile.button_text_color,
      font_family: profile.font_family,
      background_type: profile.background_type,
      background_gradient: profile.background_gradient,
      background_image_url: profile.background_image_url,
      button_border_color: profile.button_border_color,
      text_color: profile.text_color,
      bg_image_url: profile.bg_image_url,
      bg_image_opacity: profile.bg_image_opacity,
      bg_image_overlay: profile.bg_image_overlay,
    }).eq('user_id', userId)
    setSaving(false)
    flashMsg(error ? `Error: ${error.message}` : 'Saved!')
  }

  const uploadAvatar = async (file: File) => {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/avatar.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) { flashMsg(`Upload error: ${error.message}`); return }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const url = `${data.publicUrl}?t=${Date.now()}`
    setProfile(p => ({ ...p, avatar_url: url }))
    await supabase.from('profiles').update({ avatar_url: url }).eq('user_id', userId)
    flashMsg('Avatar updated!')
  }

  const addLink = async (title: string, rawUrl: string) => {
    const url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`
    const order = links.length
    const { data, error } = await supabase
      .from('links').insert({ user_id: userId, title, url, order, is_active: true })
      .select().single()
    if (!error && data) setLinks(l => [...l, data as Link])
  }

  const deleteLink = async (id: string) => {
    await supabase.from('links').delete().eq('id', id)
    setLinks(l => l.filter(lnk => lnk.id !== id))
  }

  const updateLink = async (id: string, title: string, rawUrl: string) => {
    const url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`
    await supabase.from('links').update({ title, url }).eq('id', id)
    setLinks(l => l.map(lnk => lnk.id === id ? { ...lnk, title, url } : lnk))
  }

  const toggleLink = async (id: string) => {
    const link = links.find(l => l.id === id)
    if (!link) return
    const is_active = !link.is_active
    await supabase.from('links').update({ is_active }).eq('id', id)
    setLinks(l => l.map(lnk => lnk.id === id ? { ...lnk, is_active } : lnk))
  }

  const reorderLinks = async (newLinks: Link[]) => {
    const reordered = newLinks.map((l, i) => ({ ...l, order: i }))
    setLinks(reordered)
    await Promise.all(
      reordered.map(l => supabase.from('links').update({ order: l.order }).eq('id', l.id))
    )
  }

  return (
    <DashboardContext.Provider value={{
      profile, links, saving, saveMsg, userId,
      updateProfile, save, addLink, deleteLink,
      updateLink, toggleLink, reorderLinks, uploadAvatar,
    }}>
      {children}
    </DashboardContext.Provider>
  )
}
