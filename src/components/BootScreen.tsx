import { useState, useEffect, useRef } from 'react'
import { useDesktopStore } from '../store/desktopStore'
import { mediaUrl } from '../config'

const BOOT_LINES = [
  { text: 'MewoOS BIOS v2.1.0', color: '#E8829B' },
  { text: 'Copyright (c) 2026 Mewo Systems', color: '#6B5070' },
  { text: '', color: '' },
  { text: 'Detecting hardware...', color: '#CDD6F4' },
  { text: '  CPU: Neural Engine v17.0 ............ OK', color: '#86EFAC' },
  { text: '  GPU: Sakura Renderer 4.0 ........... OK', color: '#86EFAC' },
  { text: '  RAM: 16384 MB DDR5 ................. OK', color: '#86EFAC' },
  { text: '  SSD: Cloud Storage 256 GB .......... OK', color: '#86EFAC' },
  { text: '  NET: Kawaii Network Interface ....... OK', color: '#86EFAC' },
  { text: '', color: '' },
  { text: 'All hardware checks passed.', color: '#86EFAC' },
  { text: '', color: '' },
  { text: '[  0.000000] MewoOS kernel 6.9.0-kawaii booting', color: '#93C5FD' },
  { text: '[  0.001203] Memory: 16384MB available', color: '#93C5FD' },
  { text: '[  0.002441] CPU: 8 cores online', color: '#93C5FD' },
  { text: '[  0.003892] Loading /boot/initramfs...', color: '#93C5FD' },
  { text: '[  0.012044] Mounting filesystems... done', color: '#93C5FD' },
  { text: '[  0.018331] Starting udev daemon...', color: '#93C5FD' },
  { text: '[  0.024102] Initializing display server...', color: '#93C5FD' },
  { text: '[  0.031556] Loading theme: gothic-kawaii-dark', color: '#93C5FD' },
  { text: '[  0.038921] Starting window manager...', color: '#93C5FD' },
  { text: '[  0.045203] Initializing audio subsystem...', color: '#93C5FD' },
  { text: '', color: '' },
  { text: '[  0.051332] Starting mewo-display-manager.service', color: '#C4B5FD' },
  { text: '[  0.057441] Starting mewo-network.service', color: '#C4B5FD' },
  { text: '[  0.062103] Starting mewo-audio.service', color: '#C4B5FD' },
  { text: '[  0.068992] Starting mewo-dock.service', color: '#C4B5FD' },
  { text: '[  0.074210] Starting mewo-panel.service', color: '#C4B5FD' },
  { text: '[  0.080331] Starting mewo-window-manager.service', color: '#C4B5FD' },
  { text: '[  0.086442] All services started successfully', color: '#86EFAC' },
  { text: '', color: '' },
  { text: 'System ready. Launching desktop environment...', color: '#E8829B' },
]

type BootPhase = 'logo' | 'welcome' | 'terminal' | 'fadeout' | 'done'

function getTerminalPhase(idx: number) {
  if (idx <= 11) return 'POST'
  if (idx <= 22) return 'KERNEL'
  if (idx <= 31) return 'SERVICES'
  return 'READY'
}

function playBootChime() {
  try {
    const ctx = new AudioContext()
    const master = ctx.createGain()
    master.gain.setValueAtTime(0.1, ctx.currentTime)
    master.connect(ctx.destination)
    const freqs = [523.25, 659.25, 783.99, 1046.5]
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15)
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + i * 0.15 + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 1.2)
      osc.connect(gain)
      gain.connect(master)
      osc.start(ctx.currentTime + i * 0.15)
      osc.stop(ctx.currentTime + i * 0.15 + 1.5)
    })
  } catch { /* Audio not available */ }
}

const BG_IMAGES = [
  { src: mediaUrl('/images/gallery-new/gallery-1.jpg'), top: '4%', right: '2%', w: 190, h: 130, rot: 6 },
  { src: mediaUrl('/images/gallery-new/gallery-2.jpg'), bottom: '6%', left: '3%', w: 170, h: 110, rot: -5 },
  { src: mediaUrl('/images/gallery-new/gallery-3.jpg'), top: '55%', right: '6%', w: 150, h: 100, rot: 10 },
  { src: mediaUrl('/images/gallery-new/gallery-4.jpg'), top: '12%', left: '55%', w: 130, h: 90, rot: -7 },
  { src: mediaUrl('/images/gallery-new/gallery-5.jpg'), bottom: '20%', right: '55%', w: 140, h: 95, rot: 4 },
  { src: mediaUrl('/images/gallery-new/gallery-6.jpg'), top: '35%', left: '2%', w: 120, h: 80, rot: -12 },
  { src: mediaUrl('/images/gallery-new/gallery-7.jpg'), top: '75%', right: '15%', w: 160, h: 105, rot: 8 },
  { src: mediaUrl('/images/gallery-new/gallery-8.jpg'), top: '5%', left: '30%', w: 110, h: 75, rot: -3 },
  { src: mediaUrl('/images/gallery-new/gallery-9.jpg'), bottom: '40%', left: '12%', w: 135, h: 90, rot: 5 },
  { src: mediaUrl('/images/gallery-new/gallery-10.jpg'), top: '45%', right: '25%', w: 115, h: 80, rot: -9 },
]

export default function BootScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const setBootDone = useDesktopStore(s => s.setBootDone)
  const [bootPhase, setBootPhase] = useState<BootPhase>('logo')
  const [logoSharp, setLogoSharp] = useState(false)
  const [lines, setLines] = useState(0)
  const [glitch, setGlitch] = useState(false)
  const termRef = useRef<HTMLDivElement>(null)
  const burstParticles = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; r: number; c: string }>>([])

  // Canvas particles
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const colors = ['rgba(232,130,155,', 'rgba(196,181,253,', 'rgba(126,221,214,', 'rgba(107,63,160,']
    const pts = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 0.5, o: Math.random() * 0.15 + 0.03,
      c: colors[Math.floor(Math.random() * colors.length)],
      p: Math.random() * Math.PI * 2, ps: Math.random() * 0.02 + 0.005,
    }))
    let frame: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.sqrt((pts[i].x - pts[j].x) ** 2 + (pts[i].y - pts[j].y) ** 2)
          if (d < 150) {
            ctx.strokeStyle = `rgba(232,130,155,${(1 - d / 150) * 0.04})`
            ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke()
          }
        }
      }
      for (const pt of pts) {
        pt.p += pt.ps; const a = pt.o + Math.sin(pt.p) * 0.03
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); ctx.fillStyle = `${pt.c}${a})`; ctx.fill()
        const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.r * 6)
        g.addColorStop(0, `${pt.c}${a * 0.5})`); g.addColorStop(1, `${pt.c}0)`)
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r * 6, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill()
        pt.x += pt.vx; pt.y += pt.vy
        if (pt.x < 0 || pt.x > canvas.width) pt.vx *= -1
        if (pt.y < 0 || pt.y > canvas.height) pt.vy *= -1
      }
      if (burstParticles.current.length > 0) {
        burstParticles.current = burstParticles.current.filter(bp => {
          bp.x += bp.vx; bp.y += bp.vy; bp.vx *= 0.97; bp.vy *= 0.97; bp.life -= 0.015
          if (bp.life <= 0) return false
          ctx.beginPath(); ctx.arc(bp.x, bp.y, bp.r * bp.life, 0, Math.PI * 2)
          ctx.fillStyle = `${bp.c}${bp.life * 0.6})`; ctx.fill()
          return true
        })
      }
      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize) }
  }, [])

  // Single sequential boot controller
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    // Phase 1: Logo (0 → 2s)
    timers.push(setTimeout(() => setLogoSharp(true), 100))
    timers.push(setTimeout(() => setBootPhase('welcome'), 2000))

    // Phase 2: Welcome (2s → 4s)
    timers.push(setTimeout(() => {
      playBootChime()
      setBootPhase('welcome')
    }, 2000))
    timers.push(setTimeout(() => setBootPhase('terminal'), 4000))

    return () => timers.forEach(clearTimeout)
  }, [])

  // Phase 3: Terminal lines (only runs when phase === 'terminal')
  useEffect(() => {
    if (bootPhase !== 'terminal') return
    let idx = 0
    let timer: ReturnType<typeof setTimeout>
    const next = () => {
      const prevPhase = idx > 0 ? getTerminalPhase(idx - 1) : ''
      const nextPhase = getTerminalPhase(idx)
      if (prevPhase !== nextPhase && idx > 0) {
        setGlitch(true)
        setTimeout(() => setGlitch(false), 300)
      }
      if (idx < BOOT_LINES.length) {
        idx++
        setLines(idx)
        timer = setTimeout(next, idx <= 11 ? 120 : idx <= 22 ? 80 : 100)
      } else {
        playBootChime()
        const canvas = canvasRef.current
        if (canvas) {
          const cx = canvas.width / 2, cy = canvas.height / 2
          const bColors = ['rgba(232,130,155,', 'rgba(196,181,253,', 'rgba(126,221,214,', 'rgba(134,239,172,']
          burstParticles.current = Array.from({ length: 60 }, () => ({
            x: cx, y: cy,
            vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8,
            life: 1, r: Math.random() * 3 + 1,
            c: bColors[Math.floor(Math.random() * bColors.length)],
          }))
        }
        timer = setTimeout(() => setBootPhase('fadeout'), 1200)
      }
    }
    timer = setTimeout(next, 300)
    return () => clearTimeout(timer)
  }, [bootPhase])

  // Phase 4: Fadeout → done
  useEffect(() => {
    if (bootPhase !== 'fadeout') return
    const t = setTimeout(() => setBootDone(true), 1000)
    return () => clearTimeout(t)
  }, [bootPhase, setBootDone])

  useEffect(() => { termRef.current?.scrollTo({ top: termRef.current.scrollHeight }) }, [lines])

  const progress = Math.min(100, (lines / BOOT_LINES.length) * 100)
  const R = 52, C = 2 * Math.PI * R, offset = C * (1 - progress / 100)
  const terminalPhase = getTerminalPhase(lines)

  if (bootPhase === 'done') return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#030305', overflow: 'hidden', fontFamily: 'var(--font-mono)', opacity: bootPhase === 'fadeout' ? 0 : 1, transition: 'opacity 0.8s ease-in-out' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.6 }} />

      {/* Gallery images as background patches */}
      {BG_IMAGES.map((img, i) => (
        <div key={i} style={{
          position: 'absolute', top: img.top, bottom: img.bottom, left: img.left, right: img.right,
          width: img.w, height: img.h, overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
          opacity: 0.04, transform: `rotate(${img.rot}deg)`, filter: 'blur(1px) saturate(0.5)',
        }}>
          <img src={img.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        </div>
      ))}

      {/* Glow orbs */}
      <div style={{ position: 'absolute', width: 400, height: 400, top: '10%', left: '15%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,130,155,0.06) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'slow-drift 20s ease-in-out infinite, glow-pulse 4s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 350, height: 350, bottom: '15%', right: '20%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(126,221,214,0.04) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'slow-drift 25s ease-in-out infinite reverse, glow-pulse 5s ease-in-out infinite', pointerEvents: 'none' }} />

      {/* Grid */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(232,130,155,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(232,130,155,0.015) 1px, transparent 1px)', backgroundSize: '60px 60px', opacity: 0.5 }} />

      {/* Scanlines */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)', zIndex: 1 }} />

      {/* Glitch overlay */}
      {glitch && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(232,130,155,0.03) 2px, rgba(232,130,155,0.03) 4px)', animation: 'glitch-1 0.3s linear' }} />
      )}

      {/* Logo phase */}
      {bootPhase === 'logo' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <div style={{
            fontSize: 52, fontWeight: 700, color: '#E8D5E0', letterSpacing: -1,
            textShadow: '0 0 40px rgba(232,130,155,0.2), 0 0 80px rgba(232,130,155,0.1)',
            filter: logoSharp ? 'blur(0)' : 'blur(12px)', opacity: logoSharp ? 1 : 0,
            transition: 'filter 0.8s ease, opacity 0.6s ease',
          }}>
            MewoOS
          </div>
          <div style={{
            fontSize: 11, color: '#6B5070', letterSpacing: 3, fontWeight: 600,
            opacity: logoSharp ? 0.6 : 0, transition: 'opacity 0.8s ease 0.3s',
          }}>
            LOADING SYSTEM
          </div>
        </div>
      )}

      {/* Welcome phase */}
      {bootPhase === 'welcome' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{
            fontSize: 42, fontWeight: 700, color: '#E8D5E0', letterSpacing: -1,
            textShadow: '0 0 40px rgba(232,130,155,0.15), 0 0 80px rgba(196,181,253,0.08)',
            animation: 'welcome-fade 2s ease-in-out forwards',
          }}>
            Welcome
          </div>
        </div>
      )}

      {/* Terminal phase */}
      {bootPhase === 'terminal' && (
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, height: '100%', padding: 40 }}>
          <div style={{ width: 560, maxHeight: '70vh', background: 'linear-gradient(135deg, rgba(8,10,18,0.85) 0%, rgba(4,5,10,0.9) 50%, rgba(10,12,20,0.85) 100%)', backdropFilter: 'blur(20px) saturate(1.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.06) inset, inset 2px 2px 1px rgba(255,255,255,0.08), inset -1px -1px 1px rgba(255,255,255,0.03)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 32, display: 'flex', alignItems: 'center', padding: '0 12px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: '#FF6B6B' }} />
                <span style={{ width: 10, height: 10, borderRadius: 3, background: '#FFD93D' }} />
                <span style={{ width: 10, height: 10, borderRadius: 3, background: '#6BCB77' }} />
              </div>
              <span style={{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#6B5070', letterSpacing: 1, textTransform: 'uppercase' }}>system boot</span>
            </div>
            <div ref={termRef} style={{ flex: 1, padding: 16, overflowY: 'auto', fontSize: 12, lineHeight: 1.7, color: '#CDD6F4', maxHeight: '55vh' }}>
              {BOOT_LINES.slice(0, lines).map((line, i) => {
                const isTransition = i === 12 || i === 23
                return (
                  <div key={i} className={isTransition ? 'glitch-active' : ''} data-text={line.text}
                    style={{ whiteSpace: 'pre', color: line.color || '#CDD6F4', animation: 'line-in 0.15s ease-out' }}>
                    {line.text || '\u00A0'}
                  </div>
                )
              })}
              <span style={{ color: '#E8829B', fontWeight: 700, animation: 'cursor-blink 0.8s step-end infinite' }}>_</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            <div style={{ width: 160, height: 160 }}>
              <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 20px rgba(232,130,155,0.15))' }}>
                <defs>
                  <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E8829B" /><stop offset="50%" stopColor="#C4B5FD" /><stop offset="100%" stopColor="#7EDDD6" />
                  </linearGradient>
                  <filter id="rglow"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#E8829B" floodOpacity="0.4" /></filter>
                </defs>
                <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
                <circle cx="60" cy="60" r={R} fill="none" stroke="url(#rg)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset} transform="rotate(-90 60 60)" filter="url(#rglow)" style={{ transition: 'stroke-dashoffset 0.3s ease-out' }} />
                <text x="60" y="56" textAnchor="middle" style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, fill: '#E8D5E0' }}>{Math.round(progress)}%</text>
                <text x="60" y="72" textAnchor="middle" style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 600, fill: '#6B5070', letterSpacing: 2 }}>{terminalPhase}</text>
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 200 }}>
              {[['OS', 'MewoOS 1.0.0'], ['KERNEL', '6.9.0-kawaii'], ['THEME', 'gothic-kawaii-dark'], ['WM', 'framer-motion']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.03)' }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#6B5070', letterSpacing: 1 }}>{k}</span>
                  <span style={{ fontSize: 9, fontWeight: 500, color: '#9B889E' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['POST', 'KERNEL', 'SERVICES', 'READY'].map((p, i) => {
                const curIdx = ['POST', 'KERNEL', 'SERVICES', 'READY'].indexOf(terminalPhase)
                return <div key={p} style={{ width: 6, height: 6, borderRadius: '50%', background: terminalPhase === p ? '#E8829B' : curIdx > i ? 'rgba(232,130,155,0.3)' : 'rgba(255,255,255,0.08)', boxShadow: terminalPhase === p ? '0 0 8px rgba(232,130,155,0.5)' : 'none', transform: terminalPhase === p ? 'scale(1.3)' : 'scale(1)', transition: 'all 0.3s ease' }} />
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
