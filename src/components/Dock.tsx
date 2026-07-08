import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useDesktopStore, useNotificationStore } from '../store/desktopStore'

interface DockItem {
  id: string
  label: string
  color: string
  icon: string
}

const dockItems: DockItem[] = [
  { id: 'about', label: 'About Me', color: 'var(--color-sakura)', icon: 'user' },
  { id: 'terminal', label: 'Terminal', color: 'var(--color-miku)', icon: 'terminal' },
  { id: 'notes', label: 'Notes', color: 'var(--color-peach)', icon: 'notes' },
  { id: 'calculator', label: 'Calculator', color: 'var(--color-lavender)', icon: 'calc' },
  { id: 'music', label: 'Music', color: 'var(--color-sakura)', icon: 'music' },
  { id: 'gallery', label: 'Gallery', color: 'var(--color-miku)', icon: 'gallery' },
  { id: 'browser', label: 'Browser', color: 'var(--color-sky)', icon: 'browser' },
  { id: 'doomscroll', label: 'Doomscroll', color: 'var(--color-peach)', icon: 'reels' },
  { id: 'files', label: 'Files', color: 'var(--color-sky)', icon: 'files' },
  { id: 'store', label: 'Store', color: 'var(--color-sakura)', icon: 'store' },
  { id: 'guide', label: 'Guide', color: 'var(--color-mint)', icon: 'guide' },
  { id: 'meo', label: 'Meo', color: 'var(--color-sakura)', icon: 'meo' },
  { id: 'settings', label: 'Settings', color: 'var(--color-text-secondary)', icon: 'settings' },
]

const appTitles: Record<string, string> = {
  about: 'About Me', terminal: 'Terminal', notes: 'Notes', calculator: 'Calculator',
  music: 'Music Player', gallery: 'Gallery', browser: 'Browser', doomscroll: 'Doomscroll',
  files: 'Files', guide: 'Guide', store: 'Mewo Store', settings: 'Settings',
}

const appSizes: Record<string, [number, number]> = {
  about: [480, 520], terminal: [600, 400], notes: [500, 450], calculator: [320, 460],
  music: [380, 520], gallery: [600, 480], browser: [800, 560], doomscroll: [420, 640],
  files: [640, 480], store: [420, 580], guide: [500, 560], settings: [450, 500],
}

const ICONS: Record<string, string> = {
  user: `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-user" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#E8829B"/><stop offset="100%" stop-color="#C45A7C"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-user)"/><circle cx="28" cy="21" r="8" fill="white" opacity="0.95"/><path d="M14 44c0-7.7 6.3-14 14-14s14 6.3 14 14" fill="white" opacity="0.95"/></svg>`,
  terminal: `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-term" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#1a1a2e"/><stop offset="100%" stop-color="#0d0d1a"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-term)"/><path d="M16 20l10 8-10 8" stroke="#7EDDD6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M30 38h12" stroke="#7EDDD6" stroke-width="3" stroke-linecap="round" fill="none"/></svg>`,
  notes: `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-notes" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FDBA74"/><stop offset="100%" stop-color="#FB923C"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-notes)"/><rect x="15" y="10" width="26" height="36" rx="3" fill="white" opacity="0.95"/><line x1="21" y1="20" x2="35" y2="20" stroke="#FB923C" stroke-width="2" stroke-linecap="round"/><line x1="21" y1="26" x2="35" y2="26" stroke="#FB923C" stroke-width="2" stroke-linecap="round"/><line x1="21" y1="32" x2="30" y2="32" stroke="#FB923C" stroke-width="2" stroke-linecap="round"/></svg>`,
  calc: `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-calc" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#C4B5FD"/><stop offset="100%" stop-color="#A78BFA"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-calc)"/><rect x="14" y="10" width="28" height="8" rx="2" fill="white" opacity="0.9"/><rect x="14" y="22" width="6" height="6" rx="1.5" fill="white" opacity="0.7"/><rect x="25" y="22" width="6" height="6" rx="1.5" fill="white" opacity="0.7"/><rect x="36" y="22" width="6" height="6" rx="1.5" fill="white" opacity="0.7"/><rect x="14" y="32" width="6" height="6" rx="1.5" fill="white" opacity="0.7"/><rect x="25" y="32" width="6" height="6" rx="1.5" fill="white" opacity="0.7"/><rect x="36" y="32" width="6" height="6" rx="1.5" fill="white" opacity="0.7"/><rect x="14" y="42" width="6" height="4" rx="1.5" fill="white" opacity="0.7"/><rect x="25" y="42" width="17" height="4" rx="1.5" fill="white" opacity="0.9"/></svg>`,
  music: `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-music" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#E8829B"/><stop offset="100%" stop-color="#8B2252"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-music)"/><circle cx="21" cy="38" r="5" fill="white" opacity="0.95"/><circle cx="37" cy="34" r="5" fill="white" opacity="0.95"/><path d="M26 38V14l16-4v24" stroke="white" stroke-width="2.5" fill="none" opacity="0.95"/></svg>`,
  gallery: `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-gallery" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#7EDDD6"/><stop offset="100%" stop-color="#39C5BB"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-gallery)"/><rect x="10" y="10" width="36" height="36" rx="4" fill="none" stroke="white" stroke-width="2" opacity="0.9"/><circle cx="21" cy="21" r="4" fill="white" opacity="0.85"/><path d="M10 38l12-12 8 8 6-6 10 10" fill="white" opacity="0.85"/></svg>`,
  browser: `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-browser" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#93C5FD"/><stop offset="100%" stop-color="#3B82F6"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-browser)"/><circle cx="28" cy="28" r="14" fill="none" stroke="white" stroke-width="2" opacity="0.9"/><ellipse cx="28" cy="28" rx="7" ry="14" fill="none" stroke="white" stroke-width="1.5" opacity="0.7"/><line x1="14" y1="28" x2="42" y2="28" stroke="white" stroke-width="1.5" opacity="0.7"/></svg>`,
  reels: `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-reels" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FDBA74"/><stop offset="100%" stop-color="#F97316"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-reels)"/><rect x="14" y="10" width="28" height="36" rx="4" fill="white" opacity="0.15"/><polygon points="24,20 24,36 38,28" fill="white" opacity="0.95"/></svg>`,
  guide: `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-guide" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#86EFAC"/><stop offset="100%" stop-color="#4ADE80"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-guide)"/><path d="M16 12h24a2 2 0 012 2v28a2 2 0 01-2 2H16a2 2 0 01-2-2V14a2 2 0 012-2z" fill="white" opacity="0.9"/><path d="M20 20h16M20 26h16M20 32h10" stroke="#4ADE80" stroke-width="2" stroke-linecap="round"/><circle cx="38" cy="38" r="8" fill="#4ADE80" opacity="0.9"/><path d="M36 35v6M36 35l-3 3M36 35l3 3" stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>`,
  settings: `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-settings" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#6B7280"/><stop offset="100%" stop-color="#374151"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-settings)"/><circle cx="28" cy="28" r="6" fill="none" stroke="white" stroke-width="2.5" opacity="0.9"/><path d="M28 14v4M28 38v4M14 28h4M38 28h4M18.2 18.2l2.8 2.8M35 35l2.8 2.8M37.8 18.2l-2.8 2.8M21 35l-2.8 2.8" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/></svg>`,
  meo: `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-meo" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#B8C4D0"/><stop offset="50%" stop-color="#8899AA"/><stop offset="100%" stop-color="#6B7B8D"/></linearGradient><radialGradient id="g-meo-core" cx="45%" cy="40%"><stop offset="0%" stop-color="white" stop-opacity="0.95"/><stop offset="100%" stop-color="white" stop-opacity="0.3"/></radialGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-meo)"/><circle cx="28" cy="28" r="14" fill="url(#g-meo-core)" opacity="0.9"/><circle cx="28" cy="28" r="10" fill="none" stroke="white" stroke-width="1.5" opacity="0.4"/><circle cx="28" cy="28" r="6" fill="white" opacity="0.5"/><circle cx="24" cy="24" r="3" fill="white" opacity="0.8"/></svg>`,
  files: `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-files" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#93C5FD"/><stop offset="100%" stop-color="#60A5FA"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-files)"/><path d="M14 12h12l4 4h12a2 2 0 012 2v22a2 2 0 01-2 2H14a2 2 0 01-2-2V14a2 2 0 012-2z" fill="white" opacity="0.9"/><rect x="16" y="22" width="24" height="3" rx="1.5" fill="#60A5FA" opacity="0.5"/><rect x="16" y="29" width="18" height="3" rx="1.5" fill="#60A5FA" opacity="0.35"/><rect x="16" y="36" width="22" height="3" rx="1.5" fill="#60A5FA" opacity="0.25"/></svg>`,
  store: `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-store" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#E8829B"/><stop offset="100%" stop-color="#7EDDD6"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-store)"/><path d="M12 18l4-6h24l4 6" stroke="white" stroke-width="2.5" fill="none" opacity="0.9"/><rect x="10" y="18" width="36" height="26" rx="2" fill="white" opacity="0.15"/><path d="M12 18v24" stroke="white" stroke-width="2" opacity="0.7"/><path d="M44 18v24" stroke="white" stroke-width="2" opacity="0.7"/><rect x="18" y="24" width="8" height="8" rx="2" fill="white" opacity="0.9"/><rect x="30" y="24" width="8" height="8" rx="2" fill="white" opacity="0.9"/><rect x="18" y="36" width="8" height="4" rx="1.5" fill="white" opacity="0.7"/><rect x="30" y="36" width="8" height="4" rx="1.5" fill="white" opacity="0.7"/></svg>`,
}

export default function Dock() {
  const openWindow = useDesktopStore(s => s.openWindow)
  const openApps = useDesktopStore(s => s.openApps)
  const addNotif = useNotificationStore(s => s.add)
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const [bouncing, setBouncing] = useState<string | null>(null)
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null)

  // Magnification via direct DOM manipulation (no React re-renders)
  const handleMouseMove = (e: React.MouseEvent) => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const itemSize = 48, gap = 6
    itemRefs.current.forEach((el, i) => {
      if (!el) return
      const center = 14 + i * (itemSize + gap) + itemSize / 2
      const dist = Math.abs(mouseX - center)
      const scale = 1 + Math.max(0, 0.35 * (1 - dist / (itemSize * 1.8)))
      el.style.transform = `scale(${scale})`
    })
  }

  const handleMouseLeave = () => {
    itemRefs.current.forEach(el => { if (el) el.style.transform = 'scale(1)' })
  }

  const handleClick = (item: DockItem, e: React.MouseEvent) => {
    // Meo is a special voice assistant, not a window app
    if (item.id === 'meo') {
      window.dispatchEvent(new CustomEvent('meo-toggle'))
      setBouncing(item.id)
      setTimeout(() => setBouncing(null), 600)
      return
    }
    const [w, h] = appSizes[item.id] || [600, 400]
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    openWindow(item.id, appTitles[item.id] || item.label, w, h, origin)
    setBouncing(item.id)
    setTimeout(() => setBouncing(null), 600)
    // Launch ripple
    setRipple({ x: origin.x, y: origin.y })
    setTimeout(() => setRipple(null), 800)
    // Play open sound
    try { (window as any).__mewoPlayClick?.('open') } catch {}
    // Notification
    addNotif(`${item.label} launched`, item.icon === 'user' ? '👤' : item.icon === 'terminal' ? '💻' : item.icon === 'notes' ? '📝' : item.icon === 'calc' ? '🧮' : item.icon === 'music' ? '🎵' : item.icon === 'gallery' ? '🖼' : item.icon === 'browser' ? '🌐' : item.icon === 'reels' ? '📱' : item.icon === 'files' ? '📁' : item.icon === 'store' ? '🛍️' : '⚙️', 2000)
  }

  return (
    <>
    <motion.div
      ref={containerRef}
      className="dock-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {dockItems.map((item, i) => (
        <motion.div
          key={item.id}
          ref={el => { itemRefs.current[i] = el }}
          className="dock-item"
          style={{
            background: 'transparent',
            border: 'none',
            backdropFilter: 'none',
            padding: 0,
          }}
          onClick={(e) => handleClick(item, e)}
          animate={bouncing === item.id ? {
            y: [0, -12, 0, -6, 0],
            transition: { duration: 0.4, ease: 'easeOut' }
          } : {}}
        >
          <div style={{ width: 48, height: 48, borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}
            dangerouslySetInnerHTML={{ __html: ICONS[item.icon] }} />
          <motion.div
            className="dock-tooltip"
            initial={false}
            animate={{ opacity: 0, y: 5 }}
            whileHover={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            {item.label}
          </motion.div>
          {openApps.includes(item.id) && (
            <motion.div
              className="dock-item-dot"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            />
          )}
        </motion.div>
      ))}
    </motion.div>

    {/* Launch ripple */}
    {ripple && (
      <div style={{
        position: 'fixed', left: ripple.x, top: ripple.y,
        width: 20, height: 20, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,130,155,0.3) 0%, transparent 70%)',
        transform: 'translate(-50%, -50%)',
        animation: 'launch-ripple 0.8s ease-out forwards',
        pointerEvents: 'none', zIndex: 95,
      }} />
    )}
    </>
  )
}
