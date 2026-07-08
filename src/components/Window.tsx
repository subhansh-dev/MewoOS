import { useRef, useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useDesktopStore } from '../store/desktopStore'
import type { WindowState } from '../store/desktopStore'

interface WindowProps {
  window: WindowState
  children: React.ReactNode
}

const APP_SHADOW_COLORS: Record<string, string> = {
  about: 'rgba(232,130,155,0.12)',
  terminal: 'rgba(126,221,214,0.12)',
  notes: 'rgba(253,186,116,0.10)',
  calculator: 'rgba(196,181,253,0.12)',
  music: 'rgba(232,130,155,0.15)',
  gallery: 'rgba(126,221,214,0.10)',
  browser: 'rgba(147,197,253,0.12)',
  doomscroll: 'rgba(253,186,116,0.12)',
  files: 'rgba(147,197,253,0.12)',
  settings: 'rgba(155,136,158,0.10)',
  weather: 'rgba(147,197,253,0.12)',
  kanban: 'rgba(134,239,172,0.10)',
  timer: 'rgba(253,186,116,0.12)',
  'typing-speed': 'rgba(196,181,253,0.12)',
  'paint-studio': 'rgba(134,239,172,0.12)',
  'image-editor': 'rgba(232,130,155,0.12)',
}

export default function Window({ window: win, children }: WindowProps) {
  const { closeWindow, focusWindow, minimizeWindow, toggleMaximize, updateWindowPosition, updateWindowSize } = useDesktopStore()
  const activeWindowId = useDesktopStore(s => s.activeWindowId)
  const isActive = activeWindowId === win.id
  const winRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState<string | null>(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, wx: 0, wy: 0 })
  const velocity = useRef({ x: 0, y: 0 })
  const lastPos = useRef({ x: 0, y: 0 })
  const dragPos = useRef({ x: 0, y: 0 })

  const accentColor = APP_SHADOW_COLORS[win.appId] || 'rgba(232,130,155,0.08)'

  // Drag — direct DOM manipulation, zero store updates during drag
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (win.maximized) return
    e.preventDefault()
    setDragging(true)
    dragOffset.current = { x: e.clientX - win.x, y: e.clientY - win.y }
    dragPos.current = { x: win.x, y: win.y }
    lastPos.current = { x: e.clientX, y: e.clientY }
    velocity.current = { x: 0, y: 0 }
    focusWindow(win.id)
  }, [win.x, win.y, win.maximized, win.id, focusWindow])

  useEffect(() => {
    if (!dragging) return
    const el = winRef.current
    if (!el) return
    el.style.transition = 'none'
    const onMove = (e: MouseEvent) => {
      velocity.current = { x: e.clientX - lastPos.current.x, y: e.clientY - lastPos.current.y }
      lastPos.current = { x: e.clientX, y: e.clientY }
      const newX = e.clientX - dragOffset.current.x
      const newY = Math.max(32, e.clientY - dragOffset.current.y)
      dragPos.current = { x: newX, y: newY }
      el.style.left = newX + 'px'
      el.style.top = newY + 'px'
    }
    const onUp = () => {
      setDragging(false)
      // Window snapping
      const el = winRef.current
      if (el) {
        const x = dragPos.current.x
        const y = dragPos.current.y
        const screenW = window.innerWidth
        const screenH = window.innerHeight - 32
        const SNAP_THRESHOLD = 20
        let snapped = false

        // Snap to left half
        if (x <= SNAP_THRESHOLD) {
          updateWindowPosition(win.id, 0, 32)
          updateWindowSize(win.id, screenW / 2, screenH)
          snapped = true
        }
        // Snap to right half
        else if (x + win.width >= screenW - SNAP_THRESHOLD) {
          updateWindowPosition(win.id, screenW / 2, 32)
          updateWindowSize(win.id, screenW / 2, screenH)
          snapped = true
        }
        // Snap to top = maximize
        else if (y <= SNAP_THRESHOLD) {
          toggleMaximize(win.id)
          snapped = true
        }

        if (!snapped) {
          updateWindowPosition(win.id, x, y)
        }
      }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging, win.id, updateWindowPosition])

  // Resize — direct DOM manipulation
  const onResizeStart = useCallback((e: React.MouseEvent, handle: string) => {
    e.preventDefault(); e.stopPropagation()
    setResizing(handle)
    resizeStart.current = { x: e.clientX, y: e.clientY, w: win.width, h: win.height, wx: win.x, wy: win.y }
    focusWindow(win.id)
  }, [win.width, win.height, win.x, win.y, win.id, focusWindow])

  useEffect(() => {
    if (!resizing) return
    const el = winRef.current
    if (!el) return
    el.style.transition = 'none'
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - resizeStart.current.x
      const dy = e.clientY - resizeStart.current.y
      let newW = resizeStart.current.w, newH = resizeStart.current.h
      let newX = resizeStart.current.wx, newY = resizeStart.current.wy
      if (resizing.includes('e')) newW = Math.max(320, resizeStart.current.w + dx)
      if (resizing.includes('w')) { newW = Math.max(320, resizeStart.current.w - dx); newX = resizeStart.current.wx + dx }
      if (resizing.includes('s')) newH = Math.max(200, resizeStart.current.h + dy)
      if (resizing.includes('n')) { newH = Math.max(200, resizeStart.current.h - dy); newY = Math.max(32, resizeStart.current.wy + dy) }
      el.style.width = newW + 'px'
      el.style.height = newH + 'px'
      if (resizing.includes('w') || resizing.includes('n')) {
        el.style.left = newX + 'px'
        el.style.top = newY + 'px'
      }
    }
    const onUp = () => {
      setResizing(null)
      // Sync final size/position to store
      const el2 = winRef.current
      if (el2) {
        updateWindowSize(win.id, parseInt(el2.style.width), parseInt(el2.style.height))
        if (el2.style.left) updateWindowPosition(win.id, parseInt(el2.style.left), parseInt(el2.style.top))
      }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [resizing, win.id, updateWindowSize, updateWindowPosition])

  if (win.minimized) return null

  const shadow = isActive
    ? `0 16px 48px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.08) inset, inset 2px 2px 1px rgba(255,255,255,0.08), inset -1px -1px 1px rgba(255,255,255,0.03), 0 0 0 1px ${accentColor.replace(/[\d.]+\)$/, '0.25)')}, 0 0 40px ${accentColor}`
    : `0 8px 40px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.06) inset, inset 2px 2px 1px rgba(255,255,255,0.06), inset -1px -1px 1px rgba(255,255,255,0.02), 0 0 0 1px rgba(255,255,255,0.08)`

  const originX = win.origin ? win.origin.x - (win.x + win.width / 2) : 0
  const originY = win.origin ? win.origin.y - (win.y + win.height / 2) : 0

  return (
    <motion.div
      ref={winRef}
      className={`window ${isActive ? 'active' : ''} ${win.maximized ? 'maximized' : ''}`}
      style={{
        left: win.maximized ? 0 : win.x,
        top: win.maximized ? 32 : win.y,
        width: win.maximized ? '100vw' : win.width,
        height: win.maximized ? 'calc(100vh - 32px)' : win.height,
        zIndex: win.zIndex,
        boxShadow: shadow,
      }}
      initial={{
        x: originX,
        y: originY,
        scale: win.origin ? 0.5 : 0.95,
        opacity: 0,
      }}
      animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      exit={{
        x: originX,
        y: originY,
        scale: 0.5,
        opacity: 0,
        transition: { duration: 0.15 },
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onMouseDown={() => focusWindow(win.id)}
    >
      <div
        className="window-header"
        onMouseDown={onMouseDown}
        onDoubleClick={() => toggleMaximize(win.id)}
      >
        <div className="window-traffic-lights">
          <button className="traffic-light close" onClick={(e) => { e.stopPropagation(); closeWindow(win.id) }} style={{ borderRadius: 4, width: 14, height: 14 }}>
            <svg viewBox="0 0 7 7"><path d="M1.5 1.5l4 4M5.5 1.5l-4 4" stroke="rgba(0,0,0,0.35)" strokeWidth="1.3" fill="none"/></svg>
          </button>
          <button className="traffic-light minimize" onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id) }} style={{ borderRadius: 4, width: 14, height: 14 }}>
            <svg viewBox="0 0 7 7"><path d="M1.5 3.5h4" stroke="rgba(0,0,0,0.35)" strokeWidth="1.3" fill="none"/></svg>
          </button>
          <button className="traffic-light maximize" onClick={(e) => { e.stopPropagation(); toggleMaximize(win.id) }} style={{ borderRadius: 4, width: 14, height: 14 }}>
            <svg viewBox="0 0 7 7"><path d="M1.5 1.5h4v4h-4z" stroke="rgba(0,0,0,0.35)" strokeWidth="1.3" fill="none"/></svg>
          </button>
        </div>
        <div className="window-title">{win.title}</div>
      </div>
      <div className="window-content">{children}</div>

      {/* Resize handles */}
      {!win.maximized && (
        <>
          <div className="resize-handle resize-handle-e" onMouseDown={e => onResizeStart(e, 'e')} />
          <div className="resize-handle resize-handle-s" onMouseDown={e => onResizeStart(e, 's')} />
          <div className="resize-handle resize-handle-se" onMouseDown={e => onResizeStart(e, 'se')} />
          <div className="resize-handle resize-handle-w" onMouseDown={e => onResizeStart(e, 'w')} />
          <div className="resize-handle resize-handle-n" onMouseDown={e => onResizeStart(e, 'n')} />
          <div className="resize-handle resize-handle-sw" onMouseDown={e => onResizeStart(e, 'sw')} />
          <div className="resize-handle resize-handle-ne" onMouseDown={e => onResizeStart(e, 'ne')} />
          <div className="resize-handle resize-handle-nw" onMouseDown={e => onResizeStart(e, 'nw')} />
        </>
      )}
    </motion.div>
  )
}
