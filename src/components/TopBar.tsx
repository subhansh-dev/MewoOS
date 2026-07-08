import { useState, useEffect, useRef } from 'react'
import { Wifi, Battery, Volume2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDesktopStore } from '../store/desktopStore'

export default function TopBar() {
  const [time, setTime] = useState(new Date())
  const [menuOpen, setMenuOpen] = useState<'logo' | 'app' | null>(null)
  const [logoClicks, setLogoClicks] = useState(0)
  const [rainbow, setRainbow] = useState(false)
  const activeWindowId = useDesktopStore(s => s.activeWindowId)
  const windows = useDesktopStore(s => s.windows)
  const openWindow = useDesktopStore(s => s.openWindow)
  const currentWorkspace = useDesktopStore(s => s.currentWorkspace)
  const maxWorkspaces = useDesktopStore(s => s.maxWorkspaces)
  const switchWorkspace = useDesktopStore(s => s.switchWorkspace)
  const activeWin = windows.find(w => w.id === activeWindowId)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const appName = activeWin?.title || 'MewoOS'

  const logoMenuItems = [
    { label: 'About MewoOS', action: () => { openWindow('about', 'About Me', 480, 520); setMenuOpen(null) } },
    { label: 'Settings', action: () => { openWindow('settings', 'Settings', 450, 500); setMenuOpen(null) } },
    { divider: true },
    { label: 'Terminal', action: () => { openWindow('terminal', 'Terminal', 600, 400); setMenuOpen(null) } },
  ]

  return (
    <div className="top-bar" ref={menuRef} style={rainbow ? { background: 'linear-gradient(90deg, #ff0000, #ff7700, #ffff00, #00ff00, #0077ff, #7700ff, #ff0000)', backgroundSize: '400% 100%', animation: 'rainbow-slide 2s linear infinite' } : undefined}>
      <div className="top-bar-left" style={{ position: 'relative' }}>
        <span
          className="top-bar-logo"
          style={{ cursor: 'pointer', padding: '2px 6px', borderRadius: 6, transition: 'background 0.15s' }}
          onClick={() => {
            setMenuOpen(menuOpen === 'logo' ? null : 'logo')
            const next = logoClicks + 1
            setLogoClicks(next)
            if (next >= 10) {
              setRainbow(true)
              setLogoClicks(0)
              setTimeout(() => setRainbow(false), 5000)
            }
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,130,155,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          MewoOS
        </span>

        {/* Logo dropdown */}
        <AnimatePresence>
          {menuOpen === 'logo' && (
            <motion.div
              className="topbar-dropdown"
              initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{ transformOrigin: 'top left' }}
            >
              {logoMenuItems.map((item, i) => {
                if ('divider' in item) return <div key={i} className="topbar-dropdown-divider" />
                return (
                  <div key={i} className="topbar-dropdown-item" onClick={item.action}>
                    {item.label}
                  </div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ position: 'relative' }}>
          <span className="top-bar-menu" style={{ fontWeight: 700 }}>{appName}</span>
          {/* Active app underline */}
          <div style={{
            position: 'absolute', bottom: -2, left: 0, right: 0, height: 2,
            background: 'var(--color-sakura)', borderRadius: 1,
            boxShadow: '0 0 8px rgba(232,130,155,0.3)',
            transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          }} />
        </div>
      </div>

      <div className="top-bar-right">
        {/* Workspace indicator */}
        <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginRight: 12, padding: '0 4px' }}>
          {Array.from({ length: maxWorkspaces }, (_, i) => i + 1).map(ws => {
            const hasWindows = windows.some(w => w.workspace === ws)
            return (
              <button key={ws} onClick={() => switchWorkspace(ws)} title={`Workspace ${ws} (Ctrl+${ws})`} style={{
                width: ws === currentWorkspace ? 22 : 8,
                height: 8,
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer',
                background: ws === currentWorkspace
                  ? 'var(--color-sakura)'
                  : hasWindows
                    ? 'rgba(232,130,155,0.25)'
                    : 'rgba(255,255,255,0.1)',
                boxShadow: ws === currentWorkspace ? '0 0 8px rgba(232,130,155,0.4)' : 'none',
                transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                padding: 0,
              }}
                onMouseEnter={e => { if (ws !== currentWorkspace) e.currentTarget.style.background = 'rgba(232,130,155,0.35)' }}
                onMouseLeave={e => { if (ws !== currentWorkspace) e.currentTarget.style.background = hasWindows ? 'rgba(232,130,155,0.25)' : 'rgba(255,255,255,0.1)' }}
              />
            )
          })}
        </div>

        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Battery size={14} />
        </motion.div>
        <motion.div
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Wifi size={14} />
        </motion.div>
        <Volume2 size={14} />
        <span>{formatDate(time)}</span>
        <motion.span
          key={time.getMinutes()}
          style={{ fontWeight: 600 }}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {formatTime(time)}
        </motion.span>
      </div>
    </div>
  )
}
