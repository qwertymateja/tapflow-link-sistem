'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Profile {
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
}

interface Link {
  id: string
  user_id: string
  title: string
  url: string
  order: number
  is_active: boolean
}

interface Props {
  initialProfile: Profile
  initialLinks: Link[]
  userId: string
}

const BUTTON_CLASSES: Record<string, string> = {
  pill: 'rounded-full',
  rounded: 'rounded-xl',
  square: 'rounded-none',
}

export default function DashboardClient({ initialProfile, initialLinks, userId }: Props) {
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [links, setLinks] = useState<Link[]>(initialLinks)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [newLink, setNewLink] = useState({ title: '', url: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [avatarMode, setAvatarMode] = useState<'url' | 'upload'>('url')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const router = useRouter()

  const flashMsg = (msg: string) => {
    setSaveMsg(msg)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  const save = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        background_color: profile.background_color,
        button_style: profile.button_style,
        button_color: profile.button_color,
        button_text_color: profile.button_text_color,
      })
      .eq('user_id', userId)

    setSaving(false)
    flashMsg(error ? `Error: ${error.message}` : 'Saved!')
  }

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/avatar.${ext}`

    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      setProfile(p => ({ ...p, avatar_url: `${data.publicUrl}?t=${Date.now()}` }))
    }
    setUploading(false)
  }

  const addLink = async () => {
    const title = newLink.title.trim()
    const rawUrl = newLink.url.trim()
    if (!title || !rawUrl) return

    const url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`
    const order = links.length

    const { data, error } = await supabase
      .from('links')
      .insert({ user_id: userId, title, url, order, is_active: true })
      .select()
      .single()

    if (!error && data) {
      setLinks(l => [...l, data as Link])
      setNewLink({ title: '', url: '' })
    }
  }

  const deleteLink = async (id: string) => {
    await supabase.from('links').delete().eq('id', id)
    setLinks(l => l.filter(link => link.id !== id))
  }

  const moveLink = async (index: number, dir: 'up' | 'down') => {
    const to = dir === 'up' ? index - 1 : index + 1
    if (to < 0 || to >= links.length) return

    const updated = [...links]
    ;[updated[index], updated[to]] = [updated[to], updated[index]]
    const reordered = updated.map((l, i) => ({ ...l, order: i }))
    setLinks(reordered)

    await Promise.all(
      reordered.map(l => supabase.from('links').update({ order: l.order }).eq('id', l.id))
    )
  }

  const toggleLink = async (id: string) => {
    const link = links.find(l => l.id === id)
    if (!link) return
    const is_active = !link.is_active
    await supabase.from('links').update({ is_active }).eq('id', id)
    setLinks(l => l.map(lnk => lnk.id === id ? { ...lnk, is_active } : lnk))
  }

  const saveLink = async (id: string, title: string, url: string) => {
    const finalUrl = url.startsWith('http') ? url : `https://${url}`
    await supabase.from('links').update({ title, url: finalUrl }).eq('id', id)
    setLinks(l => l.map(lnk => lnk.id === id ? { ...lnk, title, url: finalUrl } : lnk))
    setEditingId(null)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const activeLinks = links.filter(l => l.is_active)
  const previewButtonClass = BUTTON_CLASSES[profile.button_style] ?? 'rounded-full'

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Sticky header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-bold text-gray-900 shrink-0">Dashboard</span>
            <a
              href={`/@${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 hover:underline truncate"
            >
              /@{profile.username} ↗
            </a>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {saveMsg && (
              <span className={`text-xs font-medium ${saveMsg.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
                {saveMsg}
              </span>
            )}
            <button
              onClick={save}
              disabled={saving}
              className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 lg:flex lg:gap-8 lg:items-start">

        {/* ── Left panel ── */}
        <div className="flex-1 space-y-5 min-w-0 lg:max-w-lg">

          {/* Profile */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Profile</h2>

            {/* Avatar */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-xl">
                      👤
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    {(['url', 'upload'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => setAvatarMode(m)}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                          avatarMode === m ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {m === 'url' ? 'URL' : 'Upload'}
                      </button>
                    ))}
                  </div>
                  {avatarMode === 'url' ? (
                    <input
                      type="url"
                      value={profile.avatar_url || ''}
                      onChange={e => setProfile(p => ({ ...p, avatar_url: e.target.value }))}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={uploadAvatar}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        {uploading ? 'Uploading…' : 'Choose file…'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Display name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Display name</label>
              <input
                type="text"
                value={profile.display_name || ''}
                onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={profile.bio || ''}
                onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </section>

          {/* Appearance */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Appearance</h2>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Background color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={profile.background_color}
                  onChange={e => setProfile(p => ({ ...p, background_color: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={profile.background_color}
                  onChange={e => setProfile(p => ({ ...p, background_color: e.target.value }))}
                  className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Button style</label>
              <div className="flex gap-2">
                {([['pill', 'Pill'], ['rounded', 'Rounded'], ['square', 'Square']] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setProfile(p => ({ ...p, button_style: val }))}
                    className={`flex-1 py-2 text-sm font-medium border transition-colors ${
                      profile.button_style === val
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    } ${BUTTON_CLASSES[val]}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Button color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={profile.button_color}
                  onChange={e => setProfile(p => ({ ...p, button_color: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={profile.button_color}
                  onChange={e => setProfile(p => ({ ...p, button_color: e.target.value }))}
                  className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button text color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={profile.button_text_color}
                  onChange={e => setProfile(p => ({ ...p, button_text_color: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={profile.button_text_color}
                  onChange={e => setProfile(p => ({ ...p, button_text_color: e.target.value }))}
                  className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </section>

          {/* Links */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Links</h2>

            <div className="space-y-2 mb-5">
              {links.map((link, i) =>
                editingId === link.id ? (
                  <LinkEditForm
                    key={link.id}
                    link={link}
                    onSave={saveLink}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <LinkRow
                    key={link.id}
                    link={link}
                    index={i}
                    total={links.length}
                    onEdit={() => setEditingId(link.id)}
                    onDelete={deleteLink}
                    onMove={moveLink}
                    onToggle={toggleLink}
                  />
                )
              )}
              {links.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-6">No links yet. Add one below.</p>
              )}
            </div>

            {/* Add link form */}
            <div className="border-t border-gray-100 pt-5">
              <p className="text-sm font-medium text-gray-700 mb-2">Add link</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLink.title}
                  onChange={e => setNewLink(l => ({ ...l, title: e.target.value }))}
                  placeholder="Title"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={newLink.url}
                  onChange={e => setNewLink(l => ({ ...l, url: e.target.value }))}
                  placeholder="URL"
                  onKeyDown={e => e.key === 'Enter' && addLink()}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={addLink}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shrink-0"
                >
                  Add
                </button>
              </div>
            </div>
          </section>

        </div>

        {/* ── Right panel — Live preview ── */}
        <div className="hidden lg:block w-72 xl:w-80 shrink-0">
          <div className="sticky top-20">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 text-center">
              Live Preview
            </p>

            {/* Phone frame */}
            <div className="relative mx-auto w-64 bg-gray-900 rounded-[44px] shadow-2xl p-2.5 border-4 border-gray-800">
              {/* Speaker */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-full z-10 flex items-center justify-center">
                <div className="w-10 h-1.5 bg-gray-700 rounded-full" />
              </div>

              {/* Screen */}
              <div
                className="rounded-[36px] overflow-hidden"
                style={{ height: 560, backgroundColor: profile.background_color }}
              >
                <div className="h-full overflow-y-auto px-5 pt-10 pb-6">
                  <div className="text-center mb-6">
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
                    <p className="text-white font-bold text-sm leading-tight">
                      {profile.display_name || profile.username}
                    </p>
                    {profile.bio && (
                      <p className="text-white/70 text-xs mt-1 leading-relaxed">{profile.bio}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    {activeLinks.map(link => (
                      <div
                        key={link.id}
                        className={`w-full text-center py-2.5 px-3 text-xs font-medium ${previewButtonClass}`}
                        style={{
                          backgroundColor: profile.button_color,
                          color: profile.button_text_color,
                        }}
                      >
                        {link.title}
                      </div>
                    ))}
                    {activeLinks.length === 0 && (
                      <p className="text-white/40 text-xs text-center py-4">No active links</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface LinkRowProps {
  link: Link
  index: number
  total: number
  onEdit: () => void
  onDelete: (id: string) => void
  onMove: (index: number, dir: 'up' | 'down') => void
  onToggle: (id: string) => void
}

function LinkRow({ link, index, total, onEdit, onDelete, onMove, onToggle }: LinkRowProps) {
  return (
    <div className={`flex items-center gap-2 p-3 rounded-xl transition-opacity ${link.is_active ? 'bg-gray-50' : 'bg-gray-50 opacity-50'}`}>
      {/* Reorder */}
      <div className="flex flex-col gap-0.5 shrink-0">
        <button
          onClick={() => onMove(index, 'up')}
          disabled={index === 0}
          className="text-gray-300 hover:text-gray-600 disabled:opacity-0 text-xs leading-none py-0.5 transition-colors"
        >▲</button>
        <button
          onClick={() => onMove(index, 'down')}
          disabled={index === total - 1}
          className="text-gray-300 hover:text-gray-600 disabled:opacity-0 text-xs leading-none py-0.5 transition-colors"
        >▼</button>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900 truncate">{link.title}</p>
        <p className="text-xs text-gray-400 truncate">{link.url}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Toggle */}
        <button
          onClick={() => onToggle(link.id)}
          title={link.is_active ? 'Visible' : 'Hidden'}
          className={`relative w-10 h-5 rounded-full transition-colors ${link.is_active ? 'bg-indigo-600' : 'bg-gray-200'}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
              link.is_active ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>

        <button
          onClick={onEdit}
          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors text-sm"
          title="Edit"
        >✏️</button>

        <button
          onClick={() => onDelete(link.id)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm"
          title="Delete"
        >🗑️</button>
      </div>
    </div>
  )
}

interface LinkEditFormProps {
  link: Link
  onSave: (id: string, title: string, url: string) => void
  onCancel: () => void
}

function LinkEditForm({ link, onSave, onCancel }: LinkEditFormProps) {
  const [title, setTitle] = useState(link.title)
  const [url, setUrl] = useState(link.url)

  return (
    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title"
        autoFocus
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
      />
      <input
        type="text"
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="URL"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSave(link.id, title, url)}
          className="bg-indigo-600 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="bg-white text-gray-600 text-xs px-4 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
