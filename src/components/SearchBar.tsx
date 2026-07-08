import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDesktopStore } from '../store/desktopStore'

const APPS = [
  { id: 'about', title: 'About Me', kw: 'about profile subhansh', icon: '👤' },
  { id: 'terminal', title: 'Terminal', kw: 'terminal shell console', icon: '💻' },
  { id: 'notes', title: 'Notes', kw: 'notes text write', icon: '📝' },
  { id: 'calculator', title: 'Calculator', kw: 'calculator math', icon: '🧮' },
  { id: 'music', title: 'Music Player', kw: 'music player songs', icon: '🎵' },
  { id: 'gallery', title: 'Gallery', kw: 'gallery images photos', icon: '🖼' },
  { id: 'browser', title: 'Browser', kw: 'browser web internet', icon: '🌐' },
  { id: 'doomscroll', title: 'Doomscroll', kw: 'doomscroll reels tiktok', icon: '📱' },
  { id: 'guide', title: 'Guide', kw: 'guide help features', icon: '📖' },
  { id: 'settings', title: 'Settings', kw: 'settings preferences accent', icon: '⚙️' },
]

export default function SearchBar() {
  const openWindow = useDesktopStore(s => s.openWindow)
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = query.trim()
    ? APPS.filter(a => `${a.title} ${a.kw}`.toLowerCase().includes(query.toLowerCase()))
    : APPS

  // Close on outside click
  useEffect(() => {
    if (!focused) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setFocused(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [focused])

  // Global shortcut to focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setFocused(true)
      }
      if (e.key === 'Escape') { setFocused(false); setQuery(''); inputRef.current?.blur() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && filtered[selectedIdx]) {
      openWindow(filtered[selectedIdx].id, filtered[selectedIdx].title)
      setFocused(false); setQuery('')
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'fixed', top: 48, left: '50%', transform: 'translateX(-50%)', zIndex: 110, width: focused ? 640 : 480, transition: 'width 0.3s cubic-bezier(0.22, 1, 0.36, 1)' }}>
      {/* Search input */}
      <div style={{
        background: focused
          ? 'linear-gradient(135deg, rgba(8,10,20,0.7) 0%, rgba(4,5,12,0.8) 50%, rgba(10,12,22,0.7) 100%)'
          : 'linear-gradient(135deg, rgba(8,10,20,0.45) 0%, rgba(4,5,12,0.5) 50%, rgba(10,12,22,0.45) 100%)',
        backdropFilter: focused ? 'blur(40px) saturate(2) brightness(1.2)' : 'blur(24px) saturate(1.5) brightness(1.1)',
        borderRadius: focused ? 14 : 20,
        border: focused ? '1px solid rgba(232,130,155,0.15)' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: focused
          ? '0 12px 48px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.08) inset, 0 0 40px rgba(232,130,155,0.04)'
          : '0 4px 20px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.05) inset',
        transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Shimmer sweep */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.02) 42%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.02) 58%, transparent 65%)',
          animation: 'shimmer-sweep 20s ease-in-out infinite',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', padding: '11px 16px', gap: 10 }}>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIdx(0) }}
            onFocus={() => setFocused(true)}
            onKeyDown={handleKey}
            placeholder="Search apps..."
            spellCheck={false}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--color-text-primary)', fontSize: 13, fontWeight: 500,
              fontFamily: 'var(--font-sans)', caretColor: 'var(--color-sakura)',
            }}
          />
          <span style={{
            fontSize: 9, fontWeight: 700, color: 'var(--color-text-muted)',
            background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.06)', letterSpacing: 0.5, flexShrink: 0,
          }}>
            ⌘K
          </span>
        </div>

        {/* Results dropdown */}
        <AnimatePresence>
          {focused && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '4px', maxHeight: 280, overflowY: 'auto' }}>
                {filtered.map((a, i) => (
                  <div
                    key={a.id}
                    onClick={() => { openWindow(a.id, a.title); setFocused(false); setQuery('') }}
                    onMouseEnter={() => setSelectedIdx(i)}
                    style={{
                      padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
                      background: i === selectedIdx ? 'rgba(232,130,155,0.1)' : 'transparent',
                      display: 'flex', alignItems: 'center', gap: 10,
                      transition: 'background 0.1s',
                    }}
                  >
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{a.icon}</span>
                    <span style={{
                      fontSize: 13, fontWeight: i === selectedIdx ? 600 : 400,
                      color: i === selectedIdx ? 'var(--color-sakura)' : 'var(--color-text-secondary)',
                    }}>{a.title}</span>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div style={{ padding: '10px', color: 'var(--color-text-muted)', fontSize: 12, textAlign: 'center' }}>
                    No apps found
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
