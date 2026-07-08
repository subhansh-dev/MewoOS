import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDesktopStore, useNotificationStore } from '../store/desktopStore'

// === Click Sounds (Web Audio API) ===
let audioCtx: AudioContext | null = null
function playClick(type: 'click' | 'open' | 'close' = 'click') {
  try {
    if (!audioCtx) audioCtx = new AudioContext()
    const ctx = audioCtx
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    if (type === 'click') {
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08)
      gain.gain.setValueAtTime(0.06, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.08)
    } else if (type === 'open') {
      osc.frequency.setValueAtTime(400, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.12)
      gain.gain.setValueAtTime(0.05, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.15)
    } else {
      osc.frequency.setValueAtTime(600, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1)
      gain.gain.setValueAtTime(0.05, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1)
    }
  } catch { /* Audio not available */ }
}

// Make click sounds globally available
(window as any).__mewoPlayClick = playClick

// === Konami Code ===
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']

function ConfettiCanvas({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth; canvas.height = window.innerHeight
    const colors = ['#E8829B','#7EDDD6','#C4B5FD','#FDBA74','#86EFAC','#93C5FD','#FFD93D']
    const particles = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height - canvas.height,
      vx: (Math.random() - 0.5) * 6, vy: Math.random() * 4 + 2,
      r: Math.random() * 6 + 3, color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 10,
    }))
    let frame: number; let ticks = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot * Math.PI / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6)
        ctx.restore()
        p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.rot += p.rotV
      })
      ticks++
      if (ticks < 180) frame = requestAnimationFrame(draw)
      else onDone()
    }
    draw()
    return () => cancelAnimationFrame(frame)
  }, [onDone])
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 99999, pointerEvents: 'none' }} />
}

export default function SystemUI() {
  const notifications = useNotificationStore(s => s.notifications)
  const removeNotif = useNotificationStore(s => s.remove)
  const openWindow = useDesktopStore(s => s.openWindow)
  const [spotlightOpen, setSpotlightOpen] = useState(false)
  const [spotQuery, setSpotQuery] = useState('')
  const [spotIdx, setSpotIdx] = useState(0)
  const [konamiActive, setKonamiActive] = useState(false)
  const konamiBuffer = useRef<string[]>([])

  // Konami code listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      konamiBuffer.current.push(e.key)
      if (konamiBuffer.current.length > 10) konamiBuffer.current.shift()
      if (konamiBuffer.current.join(',') === KONAMI.join(',')) {
        setKonamiActive(true)
        konamiBuffer.current = []
        playClick('open')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Spotlight (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSpotlightOpen(o => !o)
        setSpotQuery('')
        setSpotIdx(0)
      }
      if (e.key === 'Escape') setSpotlightOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Global click sounds
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('button') || target.closest('.dock-item') || target.closest('.context-menu-item') || target.closest('.top-bar-menu') || target.closest('.top-bar-logo')) {
        playClick('click')
      }
    }
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [])

  // Spotlight search results
  const APPS = [
    { id: 'about', title: 'About Me', kw: 'about profile subhansh' },
    { id: 'terminal', title: 'Terminal', kw: 'terminal shell console' },
    { id: 'notes', title: 'Notes', kw: 'notes text write' },
    { id: 'calculator', title: 'Calculator', kw: 'calculator math' },
    { id: 'music', title: 'Music Player', kw: 'music player songs' },
    { id: 'gallery', title: 'Gallery', kw: 'gallery images photos' },
    { id: 'browser', title: 'Browser', kw: 'browser web internet' },
    { id: 'doomscroll', title: 'Doomscroll', kw: 'doomscroll reels tiktok' },
    { id: 'settings', title: 'Settings', kw: 'settings preferences' },
  ]
  const filtered = spotQuery.trim()
    ? APPS.filter(a => `${a.title} ${a.kw}`.toLowerCase().includes(spotQuery.toLowerCase()))
    : APPS

  const handleSpotlightSelect = (id: string, title: string) => {
    openWindow(id, title, 600, 400)
    setSpotlightOpen(false)
    playClick('open')
  }

  const handleSpotlightKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSpotIdx(i => Math.min(i + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSpotIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && filtered[spotIdx]) {
      handleSpotlightSelect(filtered[spotIdx].id, filtered[spotIdx].title)
    }
  }

  return (
    <>
      {/* Notification toasts */}
      <div style={{ position: 'fixed', top: 42, right: 12, zIndex: 500, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => removeNotif(n.id)}
              style={{
                background: 'rgba(20,15,22,0.92)', backdropFilter: 'blur(20px)',
                borderRadius: 12, border: '1px solid rgba(232,130,155,0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)',
                maxWidth: 300, cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              <span>{n.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Spotlight search */}
      <AnimatePresence>
        {spotlightOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', paddingTop: '20vh' }}
            onClick={() => setSpotlightOpen(false)}
          >
            <motion.div
              initial={{ y: -20, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: 480, maxHeight: 400,
                background: 'linear-gradient(135deg, rgba(8,10,18,0.95) 0%, rgba(4,5,10,0.98) 100%)',
                backdropFilter: 'blur(40px)', borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
                overflow: 'hidden',
              }}
            >
              <input
                autoFocus
                value={spotQuery}
                onChange={e => { setSpotQuery(e.target.value); setSpotIdx(0) }}
                onKeyDown={handleSpotlightKey}
                placeholder="Search apps..."
                style={{
                  width: '100%', padding: '14px 18px', border: 'none', outline: 'none',
                  background: 'transparent', color: 'var(--color-text-primary)',
                  fontSize: 16, fontWeight: 500, fontFamily: 'var(--font-sans)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              />
              <div style={{ maxHeight: 300, overflowY: 'auto', padding: '4px' }}>
                {filtered.map((a, i) => (
                  <div
                    key={a.id}
                    onClick={() => handleSpotlightSelect(a.id, a.title)}
                    onMouseEnter={() => setSpotIdx(i)}
                    style={{
                      padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                      background: i === spotIdx ? 'rgba(232,130,155,0.1)' : 'transparent',
                      color: i === spotIdx ? 'var(--color-sakura)' : 'var(--color-text-secondary)',
                      fontSize: 14, fontWeight: i === spotIdx ? 600 : 400,
                      transition: 'background 0.1s, color 0.1s',
                    }}
                  >
                    {a.title}
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div style={{ padding: '12px 14px', color: 'var(--color-text-muted)', fontSize: 13 }}>
                    No results found
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Konami confetti */}
      {konamiActive && <ConfettiCanvas onDone={() => setKonamiActive(false)} />}
    </>
  )
}
