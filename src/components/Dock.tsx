import { useRef, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useDesktopStore, useNotificationStore } from '../store/desktopStore'

interface DockItem {
  id: string
  label: string
  color: string
  icon: string
}

const coreDockItems: DockItem[] = [
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

// Store apps that appear in dock when installed
const storeDockApps: Record<string, DockItem> = {
  weather: { id: 'weather', label: 'Weather', color: '#93C5FD', icon: 'dock-weather' },
  kanban: { id: 'kanban', label: 'Kanban', color: '#86EFAC', icon: 'dock-kanban' },
  timer: { id: 'timer', label: 'Timer', color: '#FDBA74', icon: 'dock-timer' },
  'typing-speed': { id: 'typing-speed', label: 'Type Racer', color: '#C4B5FD', icon: 'dock-typing' },
  'paint-studio': { id: 'paint-studio', label: 'Paint', color: '#86EFAC', icon: 'dock-paint' },
  'image-editor': { id: 'image-editor', label: 'Images', color: '#E8829B', icon: 'dock-image' },
}

const appTitles: Record<string, string> = {
  about: 'About Me', terminal: 'Terminal', notes: 'Notes', calculator: 'Calculator',
  music: 'Music Player', gallery: 'Gallery', browser: 'Browser', doomscroll: 'Doomscroll',
  files: 'Files', guide: 'Guide', store: 'Mewo Store', settings: 'Settings',
  weather: 'Weather', kanban: 'Kanban Board', timer: 'Focus Timer',
  'typing-speed': 'Type Racer', 'paint-studio': 'Paint Studio', 'image-editor': 'Image Editor',
}

const appSizes: Record<string, [number, number]> = {
  about: [480, 520], terminal: [600, 400], notes: [500, 450], calculator: [320, 460],
  music: [380, 520], gallery: [600, 480], browser: [800, 560], doomscroll: [420, 640],
  files: [640, 480], store: [420, 580], guide: [500, 560], settings: [450, 500],
  weather: [360, 420], kanban: [520, 440], timer: [340, 520],
  'typing-speed': [480, 420], 'paint-studio': [560, 480], 'image-editor': [520, 460],
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
  store: `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-store" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#E8829B"/><stop offset="100%" stop-color="#C45A7C"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-store)"/><rect x="12" y="20" width="32" height="24" rx="3" fill="white" opacity="0.15"/><path d="M12 20h32" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/><path d="M16 20l3-5h18l3 5" stroke="white" stroke-width="2" fill="none" opacity="0.8"/><rect x="17" y="26" width="9" height="8" rx="2" fill="white" opacity="0.85"/><rect x="30" y="26" width="9" height="8" rx="2" fill="white" opacity="0.85"/><rect x="17" y="37" width="9" height="4" rx="1.5" fill="white" opacity="0.6"/><rect x="30" y="37" width="9" height="4" rx="1.5" fill="white" opacity="0.6"/></svg>`,
  // Store-installed app icons — premium dock style
  'dock-weather': `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-weather" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#93C5FD"/><stop offset="100%" stop-color="#3B82F6"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-weather)"/><circle cx="30" cy="20" r="8" fill="white" opacity="0.9"/><path d="M16 32a9 9 0 0116-7 7 7 0 015 12H14a7 7 0 012-12z" fill="white" opacity="0.85"/></svg>`,
  'dock-kanban': `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-kanban" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#86EFAC"/><stop offset="100%" stop-color="#4ADE80"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-kanban)"/><rect x="10" y="12" width="10" height="32" rx="3" fill="white" opacity="0.9"/><rect x="10" y="12" width="10" height="10" rx="3" fill="white" opacity="0.55"/><rect x="23" y="12" width="10" height="22" rx="3" fill="white" opacity="0.9"/><rect x="23" y="12" width="10" height="8" rx="3" fill="white" opacity="0.55"/><rect x="36" y="12" width="10" height="16" rx="3" fill="white" opacity="0.9"/><rect x="36" y="12" width="10" height="6" rx="3" fill="white" opacity="0.55"/></svg>`,
  'dock-timer': `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-timer" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FDBA74"/><stop offset="100%" stop-color="#F97316"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-timer)"/><circle cx="28" cy="30" r="14" fill="none" stroke="white" stroke-width="2.5" opacity="0.9"/><path d="M28 20v10l7 4" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.9"/><rect x="24" y="8" width="8" height="4" rx="2" fill="white" opacity="0.8"/></svg>`,
  'dock-typing': `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-typing" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#C4B5FD"/><stop offset="100%" stop-color="#8B5CF6"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-typing)"/><rect x="10" y="18" width="36" height="22" rx="4" fill="white" opacity="0.9"/><rect x="14" y="22" width="4" height="3" rx="1" fill="#8B5CF6" opacity="0.6"/><rect x="20" y="22" width="4" height="3" rx="1" fill="#8B5CF6" opacity="0.6"/><rect x="26" y="22" width="4" height="3" rx="1" fill="#8B5CF6" opacity="0.6"/><rect x="32" y="22" width="4" height="3" rx="1" fill="#8B5CF6" opacity="0.6"/><rect x="38" y="22" width="4" height="3" rx="1" fill="#8B5CF6" opacity="0.6"/><rect x="14" y="28" width="4" height="3" rx="1" fill="#8B5CF6" opacity="0.5"/><rect x="20" y="28" width="4" height="3" rx="1" fill="#8B5CF6" opacity="0.5"/><rect x="26" y="28" width="4" height="3" rx="1" fill="#8B5CF6" opacity="0.5"/><rect x="32" y="28" width="4" height="3" rx="1" fill="#8B5CF6" opacity="0.5"/><rect x="38" y="28" width="4" height="3" rx="1" fill="#8B5CF6" opacity="0.5"/><rect x="18" y="34" width="20" height="3" rx="1.5" fill="#8B5CF6" opacity="0.7"/><circle cx="42" cy="14" r="5" fill="white" opacity="0.8"/><text x="42" y="16.5" font-size="7" fill="#8B5CF6" text-anchor="middle" font-family="sans-serif" font-weight="bold">WPM</text></svg>`,
  'dock-paint': `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-paint" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#86EFAC"/><stop offset="100%" stop-color="#22C55E"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-paint)"/><circle cx="22" cy="22" r="4" fill="white" opacity="0.9"/><circle cx="34" cy="18" r="3" fill="white" opacity="0.7"/><circle cx="18" cy="32" r="3.5" fill="white" opacity="0.8"/><circle cx="30" cy="28" r="2.5" fill="white" opacity="0.6"/><path d="M36 34l6 12-4-2-4 2 6-12z" fill="white" opacity="0.9"/></svg>`,
  'dock-image': `<svg viewBox="0 0 56 56"><defs><linearGradient id="g-img" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#E8829B"/><stop offset="100%" stop-color="#EC4899"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#g-img)"/><rect x="12" y="12" width="32" height="32" rx="4" fill="none" stroke="white" stroke-width="2" opacity="0.9"/><circle cx="22" cy="22" r="4" fill="white" opacity="0.85"/><path d="M12 38l10-10 7 7 5-5 10 10" fill="white" opacity="0.85"/></svg>`,
}

export default function Dock() {
  const openWindow = useDesktopStore(s => s.openWindow)
  const openApps = useDesktopStore(s => s.openApps)
  const installedStoreApps = useDesktopStore(s => s.installedStoreApps)
  const addNotif = useNotificationStore(s => s.add)
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const [bouncing, setBouncing] = useState<string | null>(null)
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null)

  // Merge core dock items with installed store apps
  const dockItems = useMemo(() => {
    const installed = installedStoreApps
      .filter(id => storeDockApps[id])
      .map(id => storeDockApps[id])
    return [...coreDockItems, ...installed]
  }, [installedStoreApps])

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
    setRipple({ x: origin.x, y: origin.y })
    setTimeout(() => setRipple(null), 800)
    try { (window as any).__mewoPlayClick?.('open') } catch {}
    addNotif(`${item.label} launched`, '🚀', 2000)
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
          layout
          transition={{ layout: { type: 'spring', stiffness: 400, damping: 30 } }}
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
