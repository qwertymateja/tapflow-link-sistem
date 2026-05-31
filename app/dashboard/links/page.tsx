'use client'

import { useState, useRef } from 'react'
import { useDashboard, type Link } from '../DashboardContext'

export default function LinksPage() {
  const { links, addLink, deleteLink, updateLink, toggleLink, reorderLinks } = useDashboard()
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  const handleAdd = async () => {
    if (!title.trim() || !url.trim()) return
    await addLink(title.trim(), url.trim())
    setTitle('')
    setUrl('')
  }

  const handleDragStart = (index: number) => setDragIndex(index)
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOver(index)
  }
  const handleDrop = async (index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null); setDragOver(null); return
    }
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
        onClick={() => { setTitle(''); setUrl(''); setEditingId('__new__') }}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-indigo-300 text-indigo-600 font-medium text-sm hover:border-indigo-500 hover:bg-indigo-50 transition-colors mb-6"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add link
      </button>

      {/* Inline add form */}
      {editingId === '__new__' && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-4 space-y-3">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
            autoFocus
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="URL (e.g. https://example.com)"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-2">
            <button
              onClick={async () => { await handleAdd(); setEditingId(null) }}
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
              onSave={async (t, u) => { await updateLink(link.id, t, u); setEditingId(null) }}
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
              <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 shrink-0" title="Drag to reorder">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 6a2 2 0 110-4 2 2 0 010 4zM8 14a2 2 0 110-4 2 2 0 010 4zM8 22a2 2 0 110-4 2 2 0 010 4zM16 6a2 2 0 110-4 2 2 0 010 4zM16 14a2 2 0 110-4 2 2 0 010 4zM16 22a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{link.title}</p>
                <p className="text-xs text-gray-400 truncate">{link.url}</p>
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

function LinkEditForm({
  link,
  onSave,
  onCancel,
}: {
  link: Link
  onSave: (title: string, url: string) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(link.title)
  const [url, setUrl] = useState(link.url)

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-3">
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        autoFocus
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <input
        type="text"
        value={url}
        onChange={e => setUrl(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSave(title, url)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="bg-white text-gray-600 px-4 py-2 rounded-xl text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
