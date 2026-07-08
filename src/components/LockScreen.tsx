import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const IDLE_TIMEOUT = 5 * 60 * 1000 // 5 minutes

export default function LockScreen() {
  const [locked, setLocked] = useState(false)
  const [time, setTime] = useState(new Date())
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Update clock
  useEffect(() => {
    if (!locked) return
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [locked])

  // Idle detection
  useEffect(() => {
    const resetIdle = () => {
      if (locked) return // Don't reset while locked
      if (idleTimer.current) clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => setLocked(true), IDLE_TIMEOUT)
    }
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, resetIdle))
    resetIdle()
    return () => {
      events.forEach(e => window.removeEventListener(e, resetIdle))
      if (idleTimer.current) clearTimeout(idleTimer.current)
    }
  }, [locked])

  const unlock = () => {
    setLocked(false)
    // Reset idle timer
    if (idleTimer.current) clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => setLocked(true), IDLE_TIMEOUT)
  }

  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <AnimatePresence>
      {locked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={unlock}
          onKeyDown={unlock}
          tabIndex={0}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'linear-gradient(180deg, #020204 0%, #0a0709 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', outline: 'none',
          }}
        >
          {/* Background orbs */}
          <div style={{
            position: 'absolute', width: 500, height: 500, top: '20%', left: '20%',
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,130,155,0.03) 0%, transparent 70%)',
            filter: 'blur(80px)', pointerEvents: 'none',
          }} />

          {/* Time */}
          <div style={{
            fontSize: 96, fontWeight: 700, color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-mono)', letterSpacing: -4,
            textShadow: '0 0 60px rgba(232,130,155,0.1)',
          }}>
            {formatTime(time)}
          </div>

          {/* Date */}
          <div style={{
            fontSize: 18, fontWeight: 500, color: 'var(--color-text-secondary)',
            marginTop: 8, letterSpacing: 1,
          }}>
            {formatDate(time)}
          </div>

          {/* Unlock hint */}
          <div style={{
            marginTop: 60, fontSize: 13, color: 'var(--color-text-muted)',
            letterSpacing: 2, textTransform: 'uppercase',
            animation: 'glow-pulse 2s ease-in-out infinite',
          }}>
            Click anywhere to unlock
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
