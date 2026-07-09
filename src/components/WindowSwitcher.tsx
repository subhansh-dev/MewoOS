import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDesktopStore } from '../store/desktopStore'

const APP_ICONS: Record<string, string> = {
  about: '👤', terminal: '💻', notes: '📝', calculator: '🧮',
  music: '🎵', gallery: '🖼', browser: '🌐', doomscroll: '📱',
  guide: '📖', settings: '⚙️', files: '📁', store: '🛍️',
  weather: '🌤️', kanban: '📋', timer: '⏱️', 'typing-speed': '⌨️',
  'paint-studio': '🎨', 'image-editor': '🖼️',
}

export default function WindowSwitcher() {
  const [active, setActive] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const windows = useDesktopStore(s => s.windows)
  const currentWorkspace = useDesktopStore(s => s.currentWorkspace)
  const focusWindow = useDesktopStore(s => s.focusWindow)

  const visibleWindows = windows.filter(w => w.workspace === currentWorkspace && !w.minimized)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Alt' && !e.repeat) {
      e.preventDefault()
      if (visibleWindows.length > 1) {
        setActive(true)
        setSelectedIdx(0)
      }
    }
    if (active && e.key === 'Tab') {
      e.preventDefault()
      const dir = e.shiftKey ? -1 : 1
      setSelectedIdx(i => (i + dir + visibleWindows.length) % visibleWindows.length)
    }
  }, [active, visibleWindows.length])

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Alt' && active) {
      e.preventDefault()
      const win = visibleWindows[selectedIdx]
      if (win) focusWindow(win.id)
      setActive(false)
      setSelectedIdx(0)
    }
  }, [active, selectedIdx, visibleWindows, focusWindow])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  return (
    <AnimatePresence>
      {active && visibleWindows.length > 0 && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9000,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)',
            }}
          />

          {/* Switcher panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9001,
              display: 'flex', gap: 8, padding: 12,
              background: 'rgba(16, 18, 30, 0.92)',
              backdropFilter: 'blur(40px) saturate(1.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            {visibleWindows.map((win, i) => (
              <motion.div
                key={win.id}
                layout
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                  background: i === selectedIdx ? 'rgba(232,130,155,0.12)' : 'transparent',
                  border: i === selectedIdx ? '1px solid rgba(232,130,155,0.25)' : '1px solid transparent',
                  transition: 'all 0.12s ease',
                  minWidth: 90,
                }}
                onClick={() => { focusWindow(win.id); setActive(false) }}
                onMouseEnter={() => setSelectedIdx(i)}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                  border: `1px solid ${i === selectedIdx ? 'rgba(232,130,155,0.2)' : 'rgba(255,255,255,0.05)'}`,
                  transition: 'all 0.12s ease',
                }}>
                  {APP_ICONS[win.appId] || '📄'}
                </div>
                <div style={{
                  fontSize: 11, color: i === selectedIdx ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
                  fontWeight: i === selectedIdx ? 600 : 400,
                  textAlign: 'center', maxWidth: 80,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  transition: 'color 0.12s ease',
                }}>
                  {win.title}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Shortcut hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', bottom: 60, left: '50%', transform: 'translateX(-50%)',
              zIndex: 9001, fontSize: 11, color: 'rgba(255,255,255,0.3)',
              fontFamily: 'var(--font-mono)', pointerEvents: 'none',
            }}
          >
            Release Alt to switch · Tab to cycle
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
