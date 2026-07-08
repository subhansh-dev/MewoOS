import { useState } from 'react'

type AppCategory = 'all' | 'productivity' | 'creative' | 'games' | 'utilities'

interface StoreApp {
  id: string
  name: string
  icon: string
  color: string
  category: AppCategory
  desc: string
  rating: number
  downloads: string
  size: string
  installed: boolean
  onInstall?: () => void
}

const storeApps: StoreApp[] = [
  { id: 'notes-pro', name: 'Notes Pro', icon: '📝', color: '#E8829B', category: 'productivity', desc: 'Advanced note-taking with markdown support, tags, and folders', rating: 4.8, downloads: '12.4K', size: '0.3 MB', installed: true },
  { id: 'calc-scientific', name: 'Calc+', icon: '🔢', color: '#7EDDD6', category: 'utilities', desc: 'Scientific calculator with unit conversion and constants', rating: 4.6, downloads: '8.2K', size: '0.1 MB', installed: true },
  { id: 'terminal-x', name: 'Terminal X', icon: '⬛', color: '#C4B5FD', category: 'utilities', desc: 'Enhanced terminal with syntax highlighting and auto-complete', rating: 4.9, downloads: '15.1K', size: '0.2 MB', installed: true },
  { id: 'piano-app', name: 'Piano', icon: '🎹', color: '#FDBA74', category: 'creative', desc: 'Virtual piano with 88 keys, recording, and multiple sound fonts', rating: 4.7, downloads: '6.8K', size: '1.2 MB', installed: false },
  { id: 'paint-studio', name: 'Paint Studio', icon: '🎨', color: '#86EFAC', category: 'creative', desc: 'Full painting app with layers, brushes, and color mixer', rating: 4.5, downloads: '9.3K', size: '0.8 MB', installed: false },
  { id: 'chat-ai', name: 'Chat AI', icon: '🤖', color: '#93C5FD', category: 'productivity', desc: 'AI assistant with conversation memory and code generation', rating: 4.9, downloads: '21.7K', size: '0.5 MB', installed: false },
  { id: 'flappy-cat', name: 'Flappy Cat', icon: '🐱', color: '#E8829B', category: 'games', desc: 'Help the pixel cat fly through pipes. Addictive!', rating: 4.3, downloads: '5.1K', size: '0.4 MB', installed: false },
  { id: 'snake-retro', name: 'Snake', icon: '🐍', color: '#86EFAC', category: 'games', desc: 'Classic snake game with modern graphics and power-ups', rating: 4.4, downloads: '7.6K', size: '0.2 MB', installed: false },
  { id: 'weather-pro', name: 'Weather', icon: '🌤️', color: '#93C5FD', category: 'utilities', desc: 'Beautiful weather forecasts with animated backgrounds', rating: 4.7, downloads: '11.2K', size: '0.6 MB', installed: false },
  { id: 'markdown-viewer', name: 'Markdown', icon: '📄', color: '#C4B5FD', category: 'productivity', desc: 'Live markdown preview with export to HTML and PDF', rating: 4.5, downloads: '4.9K', size: '0.2 MB', installed: false },
  { id: 'color-palette', name: 'Color Lab', icon: '🎯', color: '#FDBA74', category: 'creative', desc: 'Generate, explore, and save color palettes with contrast checker', rating: 4.6, downloads: '3.8K', size: '0.1 MB', installed: false },
  { id: 'todo-kanban', name: 'Kanban Board', icon: '📋', color: '#86EFAC', category: 'productivity', desc: 'Drag-and-drop kanban board with due dates and labels', rating: 4.8, downloads: '8.5K', size: '0.3 MB', installed: false },
  { id: 'sudoku', name: 'Sudoku', icon: '🔢', color: '#C4B5FD', category: 'games', desc: 'Puzzle game with 4 difficulty levels and hint system', rating: 4.2, downloads: '3.2K', size: '0.1 MB', installed: false },
  { id: 'timer-app', name: 'Focus Timer', icon: '⏰', color: '#FDBA74', category: 'productivity', desc: 'Pomodoro timer with ambient sounds and break reminders', rating: 4.6, downloads: '6.1K', size: '0.2 MB', installed: false },
  { id: 'image-editor', name: 'Image Editor', icon: '🖼️', color: '#E8829B', category: 'creative', desc: 'Crop, resize, filters, and text overlay for images', rating: 4.4, downloads: '5.7K', size: '0.7 MB', installed: false },
]

const categories: { id: AppCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'All Apps', icon: 'grid' },
  { id: 'productivity', label: 'Productivity', icon: 'briefcase' },
  { id: 'creative', label: 'Creative', icon: 'palette' },
  { id: 'games', label: 'Games', icon: 'gamepad' },
  { id: 'utilities', label: 'Utilities', icon: 'wrench' },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ color: '#FDBA74', fontSize: 10, letterSpacing: 1 }}>
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))} {rating}
    </span>
  )
}

export default function Store() {
  const [activeCategory, setActiveCategory] = useState<AppCategory>('all')
  const [search, setSearch] = useState('')
  const [selectedApp, setSelectedApp] = useState<StoreApp | null>(null)

  const filteredApps = storeApps.filter(app => {
    const matchCategory = activeCategory === 'all' || app.category === activeCategory
    const matchSearch = !search || app.name.toLowerCase().includes(search.toLowerCase()) || app.desc.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  const installedCount = storeApps.filter(a => a.installed).length

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(10,7,9,0.95)', fontFamily: 'var(--font-sans)', color: 'var(--color-text)' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #E8829B, #7EDDD6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(232,130,155,0.3)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Mewo Store</div>
          <div style={{ fontSize: 9, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{installedCount} installed · {storeApps.length} available</div>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '10px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Search apps..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--color-text)', fontSize: 12, fontFamily: 'var(--font-sans)', outline: 'none' }}
          />
        </div>
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', gap: 6, padding: '0 16px 10px', overflowX: 'auto', flexShrink: 0 }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '5px 12px',
              borderRadius: 100,
              border: '1px solid',
              borderColor: activeCategory === cat.id ? 'rgba(232,130,155,0.4)' : 'rgba(255,255,255,0.06)',
              background: activeCategory === cat.id ? 'rgba(232,130,155,0.12)' : 'rgba(255,255,255,0.03)',
              color: activeCategory === cat.id ? '#E8829B' : 'var(--color-text-muted)',
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* App List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
        {selectedApp ? (
          /* App Detail View */
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <button onClick={() => setSelectedApp(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: 11, cursor: 'pointer', marginBottom: 12, fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 4 }}>
              ← Back to Store
            </button>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg, ${selectedApp.color}33, ${selectedApp.color}11)`, border: `1px solid ${selectedApp.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                {selectedApp.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{selectedApp.name}</div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{selectedApp.category} · {selectedApp.size}</div>
                <div style={{ marginTop: 6 }}><StarRating rating={selectedApp.rating} /> <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>· {selectedApp.downloads} downloads</span></div>
              </div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-muted)', marginBottom: 16 }}>{selectedApp.desc}</p>
            <button
              onClick={() => {
                if (!selectedApp.installed) {
                  const idx = storeApps.findIndex(a => a.id === selectedApp.id)
                  if (idx >= 0) storeApps[idx].installed = true
                  setSelectedApp({ ...selectedApp, installed: true })
                }
              }}
              style={{
                width: '100%',
                padding: '10px 0',
                borderRadius: 10,
                border: 'none',
                background: selectedApp.installed ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #E8829B, #D4789C)',
                color: selectedApp.installed ? 'var(--color-text-muted)' : 'white',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {selectedApp.installed ? 'Open' : 'Install'}
            </button>
          </div>
        ) : (
          /* App Grid */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filteredApps.map(app => (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)' }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${app.color}33, ${app.color}11)`, border: `1px solid ${app.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {app.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 2 }}>{app.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.desc}</div>
                  <div style={{ marginTop: 3 }}><StarRating rating={app.rating} /> <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>· {app.downloads}</span></div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const idx = storeApps.findIndex(a => a.id === app.id)
                    if (idx >= 0) storeApps[idx].installed = !storeApps[idx].installed
                    setSelectedApp(null)
                  }}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 8,
                    border: 'none',
                    background: app.installed ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg, ${app.color}, ${app.color}cc)`,
                    color: app.installed ? 'var(--color-text-muted)' : 'white',
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    flexShrink: 0,
                  }}
                >
                  {app.installed ? 'Open' : 'Get'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Featured Banner */}
      {!selectedApp && (
        <div style={{ margin: '0 16px 12px', padding: '14px 16px', background: 'linear-gradient(135deg, rgba(232,130,155,0.12), rgba(126,221,214,0.08))', border: '1px solid rgba(232,130,155,0.15)', borderRadius: 14 }}>
          <div style={{ fontSize: 9, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 6 }}>FEATURED</div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Chat AI — Your Desktop Assistant</div>
          <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Now with voice input and code generation. Rated 4.9 ★</div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
