'use client'

import { useState, useEffect, useRef } from 'react'

interface Link {
  id: string
  title: string
  url: string
}

interface Profile {
  name: string
  bio: string
  photo: string
  links: Link[]
}

export default function AdminPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [newLink, setNewLink] = useState({ title: '', url: '' })
  const [photoMode, setPhotoMode] = useState<'url' | 'upload'>('url')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => { setProfile(data); setLoading(false) })
  }, [])

  const flash = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  const save = async () => {
    if (!profile) return
    setSaving(true)
    await Promise.all([
      fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name, bio: profile.bio, photo: profile.photo }),
      }),
      fetch('/api/links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links: profile.links }),
      }),
    ])
    setSaving(false)
    flash('Saved!')
  }

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('photo', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const { url } = await res.json()
    setProfile(p => p ? { ...p, photo: url } : p)
    flash('Photo uploaded!')
  }

  const addLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) return
    const url = newLink.url.startsWith('http') ? newLink.url : `https://${newLink.url}`
    setProfile(p => p ? { ...p, links: [...p.links, { id: Date.now().toString(), title: newLink.title, url }] } : p)
    setNewLink({ title: '', url: '' })
  }

  const removeLink = (id: string) =>
    setProfile(p => p ? { ...p, links: p.links.filter(l => l.id !== id) } : p)

  const moveLink = (index: number, dir: 'up' | 'down') => {
    if (!profile) return
    const links = [...profile.links]
    const to = dir === 'up' ? index - 1 : index + 1
    if (to < 0 || to >= links.length) return
    ;[links[index], links[to]] = [links[to], links[index]]
    setProfile({ ...profile, links })
  }

  const updateLink = (id: string, field: 'title' | 'url', value: string) =>
    setProfile(p => p ? { ...p, links: p.links.map(l => l.id === id ? { ...l, [field]: value } : l) } : p)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading…</div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
            <a href="/" className="text-sm text-indigo-600 hover:underline">← View public page</a>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        {message && (
          <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
            {message}
          </div>
        )}

        {/* Profile */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Profile</h2>

          {/* Photo */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {profile.photo ? (
                  <img src={profile.photo} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-2xl">👤</div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  {(['url', 'upload'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setPhotoMode(mode)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${photoMode === mode ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {mode === 'url' ? 'URL' : 'Upload'}
                    </button>
                  ))}
                </div>
                {photoMode === 'url' ? (
                  <input
                    type="url"
                    value={profile.photo}
                    onChange={e => setProfile({ ...profile, photo: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadPhoto} className="hidden" />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Choose file…
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={profile.bio}
              onChange={e => setProfile({ ...profile, bio: e.target.value })}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>

        {/* Links */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Links</h2>

          <div className="space-y-2 mb-5">
            {profile.links.map((link, i) => (
              <div key={link.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveLink(i, 'up')}
                    disabled={i === 0}
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-xs leading-none py-0.5"
                    title="Move up"
                  >▲</button>
                  <button
                    onClick={() => moveLink(i, 'down')}
                    disabled={i === profile.links.length - 1}
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-xs leading-none py-0.5"
                    title="Move down"
                  >▼</button>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={link.title}
                    onChange={e => updateLink(link.id, 'title', e.target.value)}
                    placeholder="Title"
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={e => updateLink(link.id, 'url', e.target.value)}
                    placeholder="URL"
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <button
                  onClick={() => removeLink(link.id)}
                  className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-lg leading-none"
                  title="Remove"
                >×</button>
              </div>
            ))}
            {profile.links.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-6">No links yet.</p>
            )}
          </div>

          {/* Add link */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-medium text-gray-700 mb-2">Add link</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLink.title}
                onChange={e => setNewLink({ ...newLink, title: e.target.value })}
                placeholder="Title"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={newLink.url}
                onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                placeholder="URL"
                onKeyDown={e => e.key === 'Enter' && addLink()}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={addLink}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
