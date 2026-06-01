'use client'

import { useState, useRef } from 'react'
import { useDashboard, type Link, type UpdateLinkData } from '../DashboardContext'
import { createClient } from '@/lib/supabase/client'

type LinkType = 'link' | 'text' | 'image' | 'wifi'

const LINK_TYPE_OPTIONS: { key: LinkType; label: string; desc: string }[] = [
  { key: 'link', label: 'Link', desc: 'Opens a URL' },
  { key: 'text', label: 'Text', desc: 'Shows a text block' },
  { key: 'image', label: 'Image', desc: 'Shows an image' },
  { key: 'wifi', label: 'WiFi', desc: 'Shares WiFi credentials' },
]

export default function LinksPage() {
  const { links, addLink, deleteLink, updateLink, toggleLink, reorderLinks, userId } = useDashboard()
  const supabase = createClient()

  // Add form
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addType, setAddType] = useState<LinkType>('link')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [wifiSsid, setWifiSsid] = useState('')
  const [wifiPassword, setWifiPassword] = useState('')
  const [wifiQrUrl, setWifiQrUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const imageFileRef = useRef<HTMLInputElement>(null)
  const wifiQrFileRef = useRef<HTMLInputElement>(null)

  // Drag
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  const openAdd = () => {
    setTitle(''); setUrl(''); setContent(''); setImageUrl('')
    setWifiSsid(''); setWifiPassword(''); setWifiQrUrl('')
    setAddType('link')
    setEditingId('__new__')
  }

  const handleAdd = async () => {
    if (!title.trim()) return
    if (addType === 'link' && !url.trim()) return
    await addLink({
      title: title.trim(),
      link_type: addType,
      url: addType === 'link' ? url.trim() : '',
      content: addType === 'text' ? content : null,
      image_url: addType === 'image' ? imageUrl : null,
      wifi_ssid: addType === 'wifi' ? wifiSsid : null,
      wifi_password: addType === 'wifi' ? wifiPassword : null,
      wifi_qr_url: addType === 'wifi' ? wifiQrUrl || null : null,
    })
    setEditingId(null)
  }

  const uploadFile = async (file: File, folder: string, onUrl: (url: string) => void) => {
    setUploading(true)
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/${folder}/${Date.now()}.${ext}`
    let err = (await supabase.storage.from('backgrounds').upload(path, file, { upsert: true })).error
    const bucket = err ? 'avatars' : 'backgrounds'
    if (err) err = (await supabase.storage.from('avatars').upload(path, file, { upsert: true })).error
    if (!err) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      onUrl(`${data.publicUrl}?t=${Date.now()}`)
    }
    setUploading(false)
  }

  const handleDragStart = (index: number) => setDragIndex(index)
  const handleDragOver = (e: React.DragEvent, index: number) => { e.preventDefault(); setDragOver(index) }
  const handleDrop = async (index: number) => {
    if (dragIndex === null || dragIndex === index) { setDragIndex(null); setDragOver(null); return }
    const updated = [...links]
    const [moved] = updated.splice(dragIndex, 1)
    updated.splice(index, 0, moved)
    setDragIndex(null); setDragOver(null)
    await reorderLinks(updated)
  }
  const handleDragEnd = () => { setDragIndex(null); setDragOver(null) }

  return (
    <div className="max-w-lg">
      {/* Add button */}
      <button
        onClick={openAdd}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-indigo-300 text-indigo-600 font-medium text-sm hover:border-indigo-500 hover:bg-indigo-50 transition-colors mb-6"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add link
      </button>

      {/* Add form */}
      {editingId === '__new__' && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-4 space-y-3">
          {/* Type selector */}
          <div className="grid grid-cols-4 gap-1.5">
            {LINK_TYPE_OPTIONS.map(t => (
              <button key={t.key} onClick={() => setAddType(t.key)}
                className={`py-2 px-1 text-xs font-medium rounded-lg border transition-all ${
                  addType === t.key ? 'border-indigo-600 bg-white text-indigo-700 shadow-sm' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={addType === 'wifi' ? 'Title (e.g. "Home WiFi")' : 'Title'}
            autoFocus
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {addType === 'link' && (
            <input type="text" value={url} onChange={e => setUrl(e.target.value)}
              placeholder="URL (e.g. https://example.com)"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          )}

          {addType === 'text' && (
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="Text content…" rows={4}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          )}

          {addType === 'image' && (
            <div className="space-y-2">
              <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                placeholder="Image URL"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">or</span>
                <input ref={imageFileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, 'link-images', setImageUrl) }} />
                <button onClick={() => imageFileRef.current?.click()} disabled={uploading}
                  className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                  {uploading ? 'Uploading…' : 'Upload image'}
                </button>
              </div>
              {imageUrl && <img src={imageUrl} alt="" className="w-full h-28 object-cover rounded-xl border border-gray-200" />}
            </div>
          )}

          {addType === 'wifi' && (
            <div className="space-y-2">
              <input type="text" value={wifiSsid} onChange={e => setWifiSsid(e.target.value)}
                placeholder="Network name (SSID)"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="text" value={wifiPassword} onChange={e => setWifiPassword(e.target.value)}
                placeholder="Password"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <div>
                <p className="text-xs text-gray-500 mb-1.5">QR code image (optional)</p>
                <input type="url" value={wifiQrUrl} onChange={e => setWifiQrUrl(e.target.value)}
                  placeholder="QR code URL"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">or</span>
                  <input ref={wifiQrFileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, 'wifi-qr', setWifiQrUrl) }} />
                  <button onClick={() => wifiQrFileRef.current?.click()} disabled={uploading}
                    className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                    {uploading ? 'Uploading…' : 'Upload QR'}
                  </button>
                </div>
                {wifiQrUrl && <img src={wifiQrUrl} alt="" className="w-24 h-24 object-contain mt-2 rounded-lg border border-gray-200" />}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={async () => { await handleAdd() }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="bg-white text-gray-600 px-4 py-2 rounded-xl text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Link list */}
      <div className="space-y-2">
        {links.map((link, i) => (
          editingId === link.id ? (
            <LinkEditForm
              key={link.id}
              link={link}
              onSave={async (data) => { await updateLink(link.id, data); setEditingId(null) }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={link.id}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={e => handleDragOver(e, i)}
              onDrop={() => handleDrop(i)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 bg-white border rounded-2xl px-4 py-3 transition-all ${
                dragOver === i && dragIndex !== i ? 'border-indigo-400 shadow-md' : 'border-gray-100 shadow-sm'
              } ${!link.is_active ? 'opacity-50' : ''}`}
            >
              {/* Drag handle */}
              <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 6a2 2 0 110-4 2 2 0 010 4zM8 14a2 2 0 110-4 2 2 0 010 4zM8 22a2 2 0 110-4 2 2 0 010 4zM16 6a2 2 0 110-4 2 2 0 010 4zM16 14a2 2 0 110-4 2 2 0 010 4zM16 22a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">{link.title}</p>
                  <LinkTypeBadge type={link.link_type || 'link'} />
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {link.link_type === 'text' && (link.content ? link.content.slice(0, 60).replace(/\n/g, ' ') + (link.content.length > 60 ? '…' : '') : 'Text block')}
                  {link.link_type === 'image' && (link.image_url || 'Image')}
                  {link.link_type === 'wifi' && `WiFi: ${link.wifi_ssid || ''}`}
                  {(!link.link_type || link.link_type === 'link') && link.url}
                </p>
              </div>

              {/* Toggle */}
              <button
                onClick={() => toggleLink(link.id)}
                title={link.is_active ? 'Active — click to hide' : 'Hidden — click to show'}
                className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${link.is_active ? 'bg-indigo-600' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${link.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>

              {/* Edit */}
              <button
                onClick={() => setEditingId(link.id)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>

              {/* Delete */}
              <button
                onClick={() => deleteLink(link.id)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )
        ))}

        {links.length === 0 && editingId !== '__new__' && (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.1-1.1m-.758-4.9a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <p className="text-sm">No links yet. Add your first one above.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function LinkTypeBadge({ type }: { type: string }) {
  if (type === 'link' || !type) return null
  const map: Record<string, string> = {
    text: 'bg-blue-100 text-blue-700',
    image: 'bg-green-100 text-green-700',
    wifi: 'bg-purple-100 text-purple-700',
  }
  const labels: Record<string, string> = { text: 'Text', image: 'Image', wifi: 'WiFi' }
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${map[type] ?? 'bg-gray-100 text-gray-600'}`}>
      {labels[type] ?? type}
    </span>
  )
}

function LinkEditForm({
  link,
  onSave,
  onCancel,
}: {
  link: Link
  onSave: (data: UpdateLinkData) => void
  onCancel: () => void
}) {
  const type = link.link_type || 'link'
  const [title, setTitle] = useState(link.title)
  const [url, setUrl] = useState(link.url || '')
  const [content, setContent] = useState(link.content || '')
  const [imageUrl, setImageUrl] = useState(link.image_url || '')
  const [wifiSsid, setWifiSsid] = useState(link.wifi_ssid || '')
  const [wifiPassword, setWifiPassword] = useState(link.wifi_password || '')
  const [wifiQrUrl, setWifiQrUrl] = useState(link.wifi_qr_url || '')
  const [uploading, setUploading] = useState(false)
  const imageFileRef = useRef<HTMLInputElement>(null)
  const wifiQrFileRef = useRef<HTMLInputElement>(null)
  const { userId } = useDashboard()
  const supabase = createClient()

  const uploadFile = async (file: File, folder: string, onUrl: (url: string) => void) => {
    setUploading(true)
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/${folder}/${Date.now()}.${ext}`
    let err = (await supabase.storage.from('backgrounds').upload(path, file, { upsert: true })).error
    const bucket = err ? 'avatars' : 'backgrounds'
    if (err) err = (await supabase.storage.from('avatars').upload(path, file, { upsert: true })).error
    if (!err) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      onUrl(`${data.publicUrl}?t=${Date.now()}`)
    }
    setUploading(false)
  }

  const handleSave = () => {
    const data: UpdateLinkData = { title }
    if (type === 'link') data.url = url
    if (type === 'text') data.content = content
    if (type === 'image') data.image_url = imageUrl
    if (type === 'wifi') {
      data.wifi_ssid = wifiSsid
      data.wifi_password = wifiPassword
      data.wifi_qr_url = wifiQrUrl || null
    }
    onSave(data)
  }

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-3">
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} autoFocus
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />

      {type === 'link' && (
        <input type="text" value={url} onChange={e => setUrl(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      )}

      {type === 'text' && (
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={4}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
      )}

      {type === 'image' && (
        <div className="space-y-2">
          <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Image URL"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">or</span>
            <input ref={imageFileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, 'link-images', setImageUrl) }} />
            <button onClick={() => imageFileRef.current?.click()} disabled={uploading}
              className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              {uploading ? 'Uploading…' : 'Upload image'}
            </button>
          </div>
          {imageUrl && <img src={imageUrl} alt="" className="w-full h-28 object-cover rounded-xl border border-gray-200" />}
        </div>
      )}

      {type === 'wifi' && (
        <div className="space-y-2">
          <input type="text" value={wifiSsid} onChange={e => setWifiSsid(e.target.value)} placeholder="Network name (SSID)"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="text" value={wifiPassword} onChange={e => setWifiPassword(e.target.value)} placeholder="Password"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <div>
            <p className="text-xs text-gray-500 mb-1.5">QR code image (optional)</p>
            <input type="url" value={wifiQrUrl} onChange={e => setWifiQrUrl(e.target.value)} placeholder="QR code URL"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">or</span>
              <input ref={wifiQrFileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, 'wifi-qr', setWifiQrUrl) }} />
              <button onClick={() => wifiQrFileRef.current?.click()} disabled={uploading}
                className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                {uploading ? 'Uploading…' : 'Upload QR'}
              </button>
            </div>
            {wifiQrUrl && <img src={wifiQrUrl} alt="" className="w-24 h-24 object-contain mt-2 rounded-lg border border-gray-200" />}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={handleSave}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
          Save
        </button>
        <button onClick={onCancel}
          className="bg-white text-gray-600 px-4 py-2 rounded-xl text-sm border border-gray-200 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}
