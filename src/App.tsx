import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useDesktopStore } from './store/desktopStore'
import BootScreen from './components/BootScreen'
import TopBar from './components/TopBar'
import Desktop from './components/Desktop'
import Dock from './components/Dock'
import Window from './components/Window'
import SystemUI from './components/SystemUI'
import DesktopPet from './components/DesktopPet'
import LockScreen from './components/LockScreen'
import SearchBar from './components/SearchBar'
import Widgets from './components/Widgets'
import MeoAssistant from './components/MeoAssistant'
import { useFileSystem } from './store/fileSystem'
import AboutMe from './apps/AboutMe'
import Terminal from './apps/Terminal'
import Notes from './apps/Notes'
import Calculator from './apps/Calculator'
import MusicPlayer from './apps/MusicPlayer'
import Gallery from './apps/Gallery'
import Browser from './apps/Browser'
import Doomscroll from './apps/Doomscroll'
import Settings from './apps/Settings'
import Guide from './apps/Guide'
import FileManager from './apps/FileManager'
import Store from './apps/Store'

const APP_COMPONENTS: Record<string, React.FC> = {
  about: AboutMe,
  terminal: Terminal,
  notes: Notes,
  calculator: Calculator,
  music: MusicPlayer,
  gallery: Gallery,
  browser: Browser,
  doomscroll: Doomscroll,
  settings: Settings,
  guide: Guide,
  files: FileManager,
  store: Store,
}

type BootPhase = 'waiting' | 'topbar' | 'desktop' | 'dock' | 'done'

export default function App() {
  const bootDone = useDesktopStore(s => s.bootDone)
  const windows = useDesktopStore(s => s.windows)
  const currentWorkspace = useDesktopStore(s => s.currentWorkspace)
  const switchWorkspace = useDesktopStore(s => s.switchWorkspace)
  const [bootPhase, setBootPhase] = useState<BootPhase>('waiting')
  const [showGuideHint, setShowGuideHint] = useState(false)

  // Initialize file system on boot
  const ensureFS = useFileSystem(s => s.ensureDefaultStructure)
  useEffect(() => { ensureFS().catch(() => {}) }, [ensureFS])

  // Workspace keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '4') {
        e.preventDefault()
        switchWorkspace(parseInt(e.key))
      }
      // Ctrl+Left/Right to cycle workspaces
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
        e.preventDefault()
        switchWorkspace(Math.max(1, currentWorkspace - 1))
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
        e.preventDefault()
        const max = useDesktopStore.getState().maxWorkspaces
        switchWorkspace(Math.min(max, currentWorkspace + 1))
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentWorkspace, switchWorkspace])

  // Staggered entrance after boot
  useEffect(() => {
    if (!bootDone) return
    const timers: ReturnType<typeof setTimeout>[] = []
    timers.push(setTimeout(() => setBootPhase('topbar'), 100))
    timers.push(setTimeout(() => setBootPhase('desktop'), 350))
    timers.push(setTimeout(() => setBootPhase('dock'), 600))
    timers.push(setTimeout(() => { setBootPhase('done'); setShowGuideHint(true) }, 900))
    timers.push(setTimeout(() => setShowGuideHint(false), 7000))
    return () => timers.forEach(clearTimeout)
  }, [bootDone])

  // Canvas-based cursor trail (no React re-renders)
  useEffect(() => {
    if (!bootDone) return
    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99998;'
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')!
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', onResize)
    const TRAIL_LEN = 12
    const trail: Array<{ x: number; y: number; t: number }> = Array.from({ length: TRAIL_LEN }, () => ({ x: -200, y: -200, t: 0 }))
    let mx = -200, my = -200, speed = 0
    let lastX = -200, lastY = -200
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      speed = Math.min(Math.sqrt(dx * dx + dy * dy) / 10, 1)
      mx = e.clientX; my = e.clientY
      lastX = mx; lastY = my
    }
    window.addEventListener('mousemove', onMove)
    let frame: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = TRAIL_LEN - 1; i > 0; i--) {
        trail[i] = { ...trail[i - 1], t: trail[i].t * 0.92 }
      }
      trail[0] = { x: mx, y: my, t: speed }
      for (let i = TRAIL_LEN - 1; i >= 0; i--) {
        const p = trail[i]
        p.t *= 0.95
        if (p.t < 0.01) continue
        const size = 20 - i * 1.2
        const alpha = p.t * 0.12
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size)
        grad.addColorStop(0, `rgba(184,196,208,${alpha})`)
        grad.addColorStop(0.4, `rgba(184,196,208,${alpha * 0.3})`)
        grad.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }
      speed *= 0.9
      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
      document.body.removeChild(canvas)
    }
  }, [bootDone])

  return (
    <>
      {!bootDone && <BootScreen />}
      {bootDone && (
        <>
          {bootPhase !== 'waiting' && (
            <motion.div
              initial={{ y: -34, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <TopBar />
            </motion.div>
          )}
          {['desktop', 'dock', 'done'].includes(bootPhase) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <Desktop />
            </motion.div>
          )}
          <AnimatePresence>
            {windows.filter(w => w.workspace === currentWorkspace).map(win => {
              const AppComponent = APP_COMPONENTS[win.appId]
              if (!AppComponent) return null
              return (
                <Window key={win.id} window={win}>
                  <AppComponent />
                </Window>
              )
            })}
          </AnimatePresence>
          {['dock', 'done'].includes(bootPhase) && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 250, damping: 22, delay: 0.1 }}
            >
              <Dock />
            </motion.div>
          )}
          <SearchBar />
          <SystemUI />
          <DesktopPet />
          <LockScreen />
          <Widgets />
          <MeoAssistant />

          {/* Guide hint */}
          <AnimatePresence>
            {showGuideHint && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{
                  position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
                  zIndex: 85, pointerEvents: 'none', textAlign: 'center',
                }}
              >
                <div style={{
                  fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)',
                  opacity: 0.6, whiteSpace: 'nowrap', letterSpacing: 0.5,
                }}>
                  We have a Guide app too, if you ever get lost ✨
                </div>
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ fontSize: 20, color: 'var(--color-sakura)', opacity: 0.5, marginTop: 6 }}
                >
                  ↓
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </>
  )
}
