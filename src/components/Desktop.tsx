import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDesktopStore } from '../store/desktopStore'
import { mediaUrl } from '../config'

export default function Desktop() {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [bgMode, setBgMode] = useState<'dark' | 'static' | 'live'>(() => (localStorage.getItem('mewoos-bg') as any) || 'dark')
  const [wallpaper, setWallpaper] = useState(() => localStorage.getItem('mewoos-wallpaper') || 'wall-1')
  const [liveWall, setLiveWall] = useState(() => localStorage.getItem('mewoos-live-wall') || 'live-1')
  const openWindow = useDesktopStore(s => s.openWindow)
  const desktopRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const orb1Ref = useRef<HTMLDivElement>(null)
  const orb2Ref = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.mode) setBgMode(detail.mode)
      if (detail?.wallpaper) setWallpaper(detail.wallpaper)
      if (detail?.liveWall) setLiveWall(detail.liveWall)
    }
    window.addEventListener('mewoos-bg-change', handler)
    return () => window.removeEventListener('mewoos-bg-change', handler)
  }, [])

  // Parallax via direct DOM manipulation (no React re-renders)
  useEffect(() => {
    const el = desktopRef.current
    if (!el) return
    let raf = 0
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const nx = ((e.clientX - rect.left) / rect.width - 0.5) * -10
        const ny = ((e.clientY - rect.top) / rect.height - 0.5) * -10
        if (bgRef.current) bgRef.current.style.transform = `translate(${nx}px, ${ny}px)`
        if (orb1Ref.current) orb1Ref.current.style.transform = `translate(${nx * 2}px, ${ny * 2}px)`
        if (orb2Ref.current) orb2Ref.current.style.transform = `translate(${nx * 1.5}px, ${ny * 1.5}px)`
        if (glowRef.current) {
          glowRef.current.style.left = `${e.clientX}px`
          glowRef.current.style.top = `${e.clientY}px`
        }
      })
    }
    el.addEventListener('mousemove', onMove)
    return () => { el.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  const handleContextMenu = (e: React.MouseEvent) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY }) }
  const handleClick = () => setContextMenu(null)

  const menuItems = [
    { label: 'About Me', action: () => openWindow('about', 'About Me', 480, 520) },
    { label: 'Terminal', action: () => openWindow('terminal', 'Terminal', 600, 400) },
    { label: 'Notes', action: () => openWindow('notes', 'Notes', 500, 450) },
    { divider: true },
    { label: 'Settings', action: () => openWindow('settings', 'Settings', 450, 500) },
  ]

  return (
    <div ref={desktopRef} className="desktop" onContextMenu={handleContextMenu} onClick={handleClick}>
      {/* Live video */}
      {bgMode === 'live' && (
        <video key={liveWall} autoPlay loop muted playsInline ref={bgRef as any} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', zIndex: 0, opacity: 0.75, transition: 'transform 0.3s ease-out',
        }}>
          <source src={mediaUrl(`/video/${liveWall}.mp4`)} type="video/mp4" />
        </video>
      )}

      {/* Static wallpaper */}
      {bgMode === 'static' && (
        <div ref={bgRef} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          zIndex: 0,
          backgroundImage: `url(${mediaUrl(`/images/wallpapers/${wallpaper}.jpg`)})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.7, transition: 'transform 0.3s ease-out',
        }} />
      )}

      {(bgMode === 'live' || bgMode === 'static') && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(180deg, rgba(5,5,8,0.2) 0%, rgba(5,5,8,0.35) 100%)',
          pointerEvents: 'none',
        }} />
      )}

      <div className="desktop-pattern" />

      {/* Glow orbs with parallax (ref-driven) */}
      <div ref={orb1Ref} style={{
        position: 'absolute', top: '10%', right: '15%', width: 350, height: 350,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,130,155,0.04) 0%, rgba(107,63,160,0.02) 40%, transparent 70%)',
        pointerEvents: 'none', filter: 'blur(40px)', transition: 'transform 0.4s ease-out',
      }} />
      <div ref={orb2Ref} style={{
        position: 'absolute', bottom: '20%', left: '10%', width: 300, height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(126,221,214,0.02) 0%, rgba(107,63,160,0.01) 40%, transparent 70%)',
        pointerEvents: 'none', filter: 'blur(50px)', transition: 'transform 0.5s ease-out',
      }} />

      {/* Cursor-reactive glow (ref-driven) */}
      <div ref={glowRef} style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 1,
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,130,155,0.015) 0%, transparent 60%)',
        transform: 'translate(-50%, -50%)', transition: 'left 0.15s ease-out, top 0.15s ease-out',
      }} />

      {/* Glass reflection */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.008) 0%, transparent 50%)',
      }} />

      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(232,130,155,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(232,130,155,0.015) 1px, transparent 1px)',
        backgroundSize: '80px 80px', pointerEvents: 'none',
      }} />

      {/* Center greeting */}
      <div style={{
        position: 'absolute', top: '32%', left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center', pointerEvents: 'none', userSelect: 'none',
      }}>
        <div style={{
          fontSize: 56, fontWeight: 800, color: 'var(--color-text-primary)',
          letterSpacing: '-2px', lineHeight: 1,
          textShadow: '0 0 60px rgba(232,130,155,0.12)',
        }}>MewoOS</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 16, letterSpacing: 2 }}>
          right-click anywhere to begin
        </div>
      </div>

      {/* Context Menu with staggered animation */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            className="context-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {menuItems.map((item, i) => {
              if ('divider' in item) return <motion.div key={i} className="context-menu-divider" />
              return (
                <motion.div
                  key={i}
                  className="context-menu-item"
                  onClick={() => { item.action(); setContextMenu(null) }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.15 }}
                >
                  {item.label}
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
