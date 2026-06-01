'use client'

import { useState } from 'react'

export type PublicLink = {
  id: string
  title: string
  url: string | null
  link_type: string | null
  content: string | null
  image_url: string | null
  wifi_ssid: string | null
  wifi_password: string | null
  wifi_qr_url: string | null
  pdf_url: string | null
}

interface Props {
  links: PublicLink[]
  btnClass: string
  btnStyle: React.CSSProperties
}

export default function ProfileLinks({ links, btnClass, btnStyle }: Props) {
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<Record<string, boolean>>({})

  const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  const handlePdfClick = (link: PublicLink) => {
    if (isMobile()) {
      window.open(link.pdf_url || '', '_blank', 'noopener,noreferrer')
    } else {
      setActiveModal(link.id)
    }
  }

  const copyText = async (key: string, text: string) => {
    try { await navigator.clipboard.writeText(text) } catch { return }
    setCopied(prev => ({ ...prev, [key]: true }))
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000)
  }

  const activeLink = links.find(l => l.id === activeModal)

  // Primary modal button: full user style
  const modalBtnStyle: React.CSSProperties = { ...btnStyle, fontFamily: undefined }
  // Secondary modal button: same shape but 70% opacity
  const modalBtnSecondaryStyle: React.CSSProperties = { ...modalBtnStyle, opacity: 0.7 }

  return (
    <>
      <div className="space-y-3">
        {links.map(link => {
          const type = link.link_type || 'link'
          if (type === 'link') {
            return (
              <a
                key={link.id}
                href={link.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full text-center py-4 px-6 font-medium transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 min-h-[52px] flex items-center justify-center ${btnClass}`}
                style={btnStyle}
              >
                {link.title}
              </a>
            )
          }
          return (
            <button
              key={link.id}
              onClick={() => type === 'pdf' ? handlePdfClick(link) : setActiveModal(link.id)}
              className={`w-full text-center py-4 px-6 font-medium transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 min-h-[52px] flex items-center justify-center gap-2 ${btnClass}`}
              style={btnStyle}
            >
              {type === 'text' && (
                <svg className="w-4 h-4 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h8" />
                </svg>
              )}
              {type === 'image' && (
                <svg className="w-4 h-4 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
              {type === 'wifi' && (
                <svg className="w-4 h-4 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
              )}
              {type === 'pdf' && (
                <svg className="w-4 h-4 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              )}
              {link.title}
            </button>
          )
        })}
      </div>

      {/* Modal backdrop */}
      {activeModal && activeLink && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900 truncate pr-4">{activeLink.title}</h2>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 shrink-0"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-5">

              {/* Text block */}
              {activeLink.link_type === 'text' && (
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{activeLink.content}</p>
              )}

              {/* Image */}
              {activeLink.link_type === 'image' && activeLink.image_url && (
                <img
                  src={activeLink.image_url}
                  alt={activeLink.title}
                  className="w-full rounded-xl"
                  style={{ touchAction: 'manipulation' }}
                />
              )}

              {/* PDF */}
              {activeLink.link_type === 'pdf' && activeLink.pdf_url && (
                <div className="space-y-4">
                  <div className="w-full rounded-xl overflow-hidden border border-gray-200" style={{ height: '60vh' }}>
                    <iframe
                      src={activeLink.pdf_url}
                      className="w-full h-full"
                      title={activeLink.title}
                    />
                  </div>
                  <div className="flex gap-3">
                    <a
                      href={activeLink.pdf_url}
                      download
                      className={`flex-1 text-center py-3 font-medium transition-opacity hover:opacity-80 text-sm ${btnClass}`}
                      style={modalBtnSecondaryStyle}
                    >
                      Download
                    </a>
                    <a
                      href={activeLink.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 text-center py-3 font-medium transition-opacity hover:opacity-80 text-sm ${btnClass}`}
                      style={modalBtnStyle}
                    >
                      Open in new tab
                    </a>
                  </div>
                </div>
              )}

              {/* WiFi */}
              {activeLink.link_type === 'wifi' && (
                <div className="space-y-3">
                  {/* Network */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Network</p>
                      <p className="font-semibold text-gray-900 text-sm">{activeLink.wifi_ssid}</p>
                    </div>
                    <button
                      onClick={() => copyText(`ssid-${activeLink.id}`, activeLink.wifi_ssid || '')}
                      className={`px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80 shrink-0 ${btnClass}`}
                      style={modalBtnStyle}
                    >
                      {copied[`ssid-${activeLink.id}`] ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  {/* Password */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">Password</p>
                      <p className="font-semibold text-gray-900 text-sm font-mono break-all">
                        {showPassword[activeLink.id]
                          ? activeLink.wifi_password
                          : '•'.repeat(Math.min((activeLink.wifi_password || '').length, 14))}
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => setShowPassword(p => ({ ...p, [activeLink.id]: !p[activeLink.id] }))}
                        className={`px-2.5 py-1.5 text-xs font-medium transition-opacity hover:opacity-80 ${btnClass}`}
                        style={modalBtnSecondaryStyle}
                      >
                        {showPassword[activeLink.id] ? 'Hide' : 'Show'}
                      </button>
                      <button
                        onClick={() => copyText(`pwd-${activeLink.id}`, activeLink.wifi_password || '')}
                        className={`px-2.5 py-1.5 text-xs font-medium transition-opacity hover:opacity-80 ${btnClass}`}
                        style={modalBtnStyle}
                      >
                        {copied[`pwd-${activeLink.id}`] ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* QR code */}
                  {activeLink.wifi_qr_url && (
                    <div className="flex justify-center p-4 bg-gray-50 rounded-xl">
                      <img
                        src={activeLink.wifi_qr_url}
                        alt="WiFi QR code"
                        className="w-44 h-44 object-contain"
                      />
                    </div>
                  )}

                  {/* Copy Password button */}
                  <button
                    onClick={() => copyText(`pwd-main-${activeLink.id}`, activeLink.wifi_password || '')}
                    className={`w-full py-3 font-medium transition-opacity hover:opacity-80 text-sm ${btnClass}`}
                    style={modalBtnStyle}
                  >
                    {copied[`pwd-main-${activeLink.id}`] ? 'Copied!' : 'Copy Password'}
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  )
}
