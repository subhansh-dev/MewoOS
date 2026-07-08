import { useEffect, useRef, useCallback } from 'react'

const P: Record<number, string> = {
  0: 'transparent',
  1: '#1a1a24',
  2: '#B8C4D0',
  3: '#d0dae6',
  4: '#1a1a24',
  5: '#8899AA',
  6: '#e8c8d4',
  7: '#6B7B8D',
  8: '#dde4ec',
  9: '#4a5568',
}

const F = {
  idle1: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,7,1,0,0,1,7,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,3,2,2,1,1,2,2,3,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,2,2,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,8,4,2,2,2,2,4,8,3,1,0,0,0,0],
    [0,0,0,0,1,3,6,4,4,2,2,4,4,6,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,5,5,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,3,3,2,2,3,3,1,0,0,0,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,0,0,0],
    [0,0,0,1,2,3,8,8,8,8,8,8,8,8,3,2,1,0,0,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,0,0,0],
    [0,0,0,1,2,3,3,3,8,8,8,8,3,3,3,2,1,7,0,0],
    [0,0,0,1,2,2,3,3,3,3,3,3,3,3,2,2,1,7,7,0],
    [0,0,0,0,1,2,2,2,3,3,3,3,2,2,2,2,1,7,0,0],
    [0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0,0,0],
    [0,0,0,0,0,1,0,1,1,1,1,1,1,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  idle2: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,7,1,0,0,1,7,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,3,2,2,1,1,2,2,3,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,2,2,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,8,4,2,2,2,2,4,8,3,1,0,0,0,0],
    [0,0,0,0,1,3,6,4,4,2,2,4,4,6,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,5,5,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,3,3,2,2,3,3,1,0,0,0,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,0,0,0],
    [0,0,0,1,2,3,8,8,8,8,8,8,8,8,3,2,1,0,0,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,0,0,0],
    [0,0,0,1,2,3,3,3,8,8,8,8,3,3,3,2,1,0,7,0],
    [0,0,0,1,2,2,3,3,3,3,3,3,3,3,2,2,7,7,0,0],
    [0,0,0,0,1,2,2,2,3,3,3,3,2,2,2,2,1,0,0,0],
    [0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0,0,0],
    [0,0,0,0,0,1,0,1,1,1,1,1,1,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  walk1: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,7,1,0,0,1,7,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,3,2,2,1,1,2,2,3,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,2,2,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,8,4,2,2,2,2,4,8,3,1,0,0,0,0],
    [0,0,0,0,1,3,6,4,4,2,2,4,4,6,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,5,5,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,3,3,2,2,3,3,1,0,0,0,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,0,7,0],
    [0,0,0,1,2,3,8,8,8,8,8,8,8,8,3,2,1,7,7,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,0,0,0],
    [0,0,0,1,2,3,3,3,8,8,8,8,3,3,3,2,1,0,0,0],
    [0,0,0,0,1,2,2,3,3,3,3,3,3,2,2,1,0,0,0,0],
    [0,0,0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0,0,0],
    [0,0,0,0,1,0,1,0,1,1,1,1,0,1,0,1,0,0,0,0],
    [0,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  walk2: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,7,1,0,0,1,7,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,3,2,2,1,1,2,2,3,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,2,2,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,8,4,2,2,2,2,4,8,3,1,0,0,0,0],
    [0,0,0,0,1,3,6,4,4,2,2,4,4,6,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,5,5,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,3,3,2,2,3,3,1,0,0,0,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,0,7,0],
    [0,0,0,1,2,3,8,8,8,8,8,8,8,8,3,2,7,7,0,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,0,0,0],
    [0,0,0,1,2,3,3,3,8,8,8,8,3,3,3,2,1,0,0,0],
    [0,0,0,0,1,2,2,3,3,3,3,3,3,2,2,1,0,0,0,0],
    [0,0,0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,1,1,1,1,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  sleep1: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,7,1,0,0,1,7,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,3,2,2,1,1,2,2,3,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,2,2,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,8,1,1,1,1,1,1,8,3,1,0,0,0,0],
    [0,0,0,0,1,3,6,2,2,2,2,2,2,6,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,5,5,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,3,3,2,2,3,3,1,0,0,0,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,0,0,0],
    [0,0,0,1,2,3,8,8,8,8,8,8,8,8,3,2,1,7,0,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,7,7,0],
    [0,0,0,1,2,3,3,3,8,8,8,8,3,3,3,2,1,7,0,0],
    [0,0,0,1,2,2,3,3,3,3,3,3,3,3,2,2,1,0,0,0],
    [0,0,0,0,1,2,2,2,3,3,3,3,2,2,2,2,1,0,0,0],
    [0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  sleep2: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,7,1,0,0,1,7,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,3,2,2,1,1,2,2,3,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,2,2,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,8,1,1,1,1,1,1,8,3,1,0,0,0,0],
    [0,0,0,0,1,3,6,2,2,2,2,2,2,6,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,5,5,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,3,3,2,2,3,3,1,0,0,0,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,0,0,0],
    [0,0,0,1,2,3,8,8,8,8,8,8,8,8,3,2,1,0,7,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,7,7,0,0],
    [0,0,0,1,2,3,3,3,8,8,8,8,3,3,3,2,1,0,0,0],
    [0,0,0,1,2,2,3,3,3,3,3,3,3,3,2,2,1,0,0,0],
    [0,0,0,0,1,2,2,2,3,3,3,3,2,2,2,2,1,0,0,0],
    [0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  happy: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,7,1,0,0,1,7,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,3,2,2,1,1,2,2,3,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,2,2,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,7,4,2,2,2,2,4,7,3,1,0,0,0,0],
    [0,0,0,0,1,3,4,0,4,2,2,4,0,4,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,5,5,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,6,3,3,6,2,3,3,1,0,0,0,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,0,0,0],
    [0,0,0,1,2,3,8,8,8,8,8,8,8,8,3,2,1,0,0,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,0,0,0],
    [0,0,0,1,2,3,3,3,8,8,8,8,3,3,3,2,1,7,0,0],
    [0,0,0,1,2,2,3,3,3,3,3,3,3,3,2,2,1,7,7,0],
    [0,0,0,0,1,2,2,2,3,3,3,3,2,2,2,2,1,0,0,0],
    [0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0,0,0],
    [0,0,0,0,0,1,0,1,1,1,1,1,1,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  blink: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,7,1,0,0,1,7,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,3,2,2,1,1,2,2,3,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,2,2,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,8,1,1,1,1,1,1,8,3,1,0,0,0,0],
    [0,0,0,0,1,3,6,2,2,2,2,2,2,6,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,5,5,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,3,3,2,2,3,3,2,2,3,3,1,0,0,0,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,0,0,0],
    [0,0,0,1,2,3,8,8,8,8,8,8,8,8,3,2,1,7,0,0],
    [0,0,0,1,2,3,3,8,8,8,8,8,8,3,3,2,1,7,7,0],
    [0,0,0,1,2,3,3,3,8,8,8,8,3,3,3,2,1,0,0,0],
    [0,0,0,1,2,2,3,3,3,3,3,3,3,3,2,2,1,0,0,0],
    [0,0,0,0,1,2,2,2,3,3,3,3,2,2,2,2,1,0,0,0],
    [0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0,0,0],
    [0,0,0,0,0,1,0,1,1,1,1,1,1,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
}

type Mood = 'idle' | 'walk' | 'sleep' | 'happy' | 'blink'
interface Particle { x: number; y: number; vx: number; vy: number; life: number; type: 'zz' | 'sparkle' }

export default function DesktopPet() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pos = useRef({ x: window.innerWidth - 80, y: window.innerHeight - 120 })
  const target = useRef({ x: window.innerWidth - 80, y: window.innerHeight - 120 })
  const facing = useRef<'left' | 'right'>('left')
  const mood = useRef<Mood>('idle')
  const pinned = useRef(false)
  const tick = useRef(0)
  const lastMouseMove = useRef(Date.now())
  const particles = useRef<Particle[]>([])
  const frameCache = useRef<Map<string, ImageData>>(new Map())
  const idleBounce = useRef(0)

  const renderFrame = useCallback((frameName: string): ImageData => {
    if (frameCache.current.has(frameName)) return frameCache.current.get(frameName)!
    const frameData = F[frameName as keyof typeof F]
    if (!frameData) return new ImageData(1, 1)
    const size = 20
    const scale = 3
    const canvas = document.createElement('canvas')
    canvas.width = size * scale
    canvas.height = size * scale
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = false
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const colorIdx = frameData[y]?.[x] ?? 0
        if (colorIdx === 0) continue
        ctx.fillStyle = P[colorIdx]
        ctx.fillRect(x * scale, y * scale, scale, scale)
      }
    }
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    frameCache.current.set(frameName, imageData)
    return imageData
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = 80, H = 80
    canvas.width = W
    canvas.height = H

    const onMove = (e: MouseEvent) => {
      if (pinned.current) return
      target.current = { x: e.clientX + 16, y: e.clientY + 24 }
      lastMouseMove.current = Date.now()
      if (mood.current === 'sleep') mood.current = 'idle'
    }
    window.addEventListener('mousemove', onMove)

    let frame: number
    const draw = () => {
      tick.current++
      ctx.clearRect(0, 0, W, H)
      ctx.imageSmoothingEnabled = false

      const dx = target.current.x - pos.current.x
      const dy = target.current.y - pos.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const isMoving = dist > 3

      if (isMoving && !pinned.current) {
        const speed = Math.min(dist * 0.08, 4)
        pos.current.x += (dx / dist) * speed
        pos.current.y += (dy / dist) * speed
        facing.current = dx > 0 ? 'right' : 'left'
        mood.current = 'walk'
        lastMouseMove.current = Date.now()
      } else if (mood.current === 'walk') {
        mood.current = 'idle'
      }

      if (!pinned.current && Date.now() - lastMouseMove.current > 15000 && mood.current !== 'happy') {
        mood.current = 'sleep'
      }

      if (mood.current === 'idle' && tick.current % 180 < 8) {
        mood.current = 'blink'
      } else if (mood.current === 'blink' && tick.current % 180 >= 8) {
        mood.current = 'idle'
      }

      let frameName: string
      const animTick = Math.floor(tick.current / 12) % 2
      switch (mood.current) {
        case 'walk': frameName = animTick === 0 ? 'walk1' : 'walk2'; break
        case 'sleep': frameName = animTick === 0 ? 'sleep1' : 'sleep2'; break
        case 'happy': frameName = 'happy'; break
        case 'blink': frameName = 'blink'; break
        default: frameName = animTick === 0 ? 'idle1' : 'idle2'; break
      }

      if (mood.current === 'idle' || mood.current === 'blink') {
        idleBounce.current = Math.sin(tick.current * 0.04) * 1.5
      } else {
        idleBounce.current *= 0.9
      }

      ctx.save()
      ctx.fillStyle = 'rgba(0,0,0,0.12)'
      ctx.beginPath()
      ctx.ellipse(W / 2, H - 4, 16, 4, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      const imgData = renderFrame(frameName)
      const spriteW = 60, spriteH = 60
      const drawX = (W - spriteW) / 2
      const drawY = (H - spriteH) / 2 + idleBounce.current

      ctx.save()
      if (facing.current === 'left') {
        ctx.translate(W, 0)
        ctx.scale(-1, 1)
        ctx.putImageData(imgData, W - drawX - spriteW, drawY)
      } else {
        ctx.putImageData(imgData, drawX, drawY)
      }
      ctx.restore()

      if (mood.current === 'sleep' && tick.current % 60 === 0) {
        particles.current.push({
          x: W / 2 + 10, y: H / 2 - 10,
          vx: 0.3 + Math.random() * 0.3, vy: -0.6 - Math.random() * 0.3,
          life: 1, type: 'zz',
        })
      }
      if (mood.current === 'happy' && tick.current % 20 === 0) {
        particles.current.push({
          x: W / 2 + (Math.random() - 0.5) * 20, y: H / 2 - 12,
          vx: (Math.random() - 0.5) * 1, vy: -0.8 - Math.random() * 0.5,
          life: 1, type: 'sparkle',
        })
      }

      particles.current = particles.current.filter(p => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.012
        if (p.life <= 0) return false
        ctx.save()
        ctx.globalAlpha = p.life
        if (p.type === 'zz') {
          ctx.fillStyle = '#C4B5FD'
          ctx.font = 'bold 10px -apple-system, monospace'
          ctx.fillText('z', p.x, p.y)
        } else {
          ctx.fillStyle = '#F5D0A9'
          ctx.font = '8px serif'
          ctx.fillText('✦', p.x, p.y)
        }
        ctx.restore()
        return true
      })

      if (pinned.current) {
        ctx.save()
        ctx.globalAlpha = 0.3 + Math.sin(tick.current * 0.06) * 0.15
        ctx.fillStyle = '#B8C4D0'
        ctx.font = '8px -apple-system, sans-serif'
        ctx.fillText('·', W / 2 - 2, 8)
        ctx.restore()
      }

      const container = canvas.parentElement
      if (container) {
        container.style.left = pos.current.x + 'px'
        container.style.top = pos.current.y + 'px'
      }

      frame = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('mousemove', onMove)
    }
  }, [renderFrame])

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    pinned.current = !pinned.current
    if (pinned.current) {
      for (let i = 0; i < 4; i++) {
        particles.current.push({
          x: 40 + (Math.random() - 0.5) * 16, y: 30 + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 1.2, vy: -0.8 - Math.random() * 0.8,
          life: 1, type: 'sparkle',
        })
      }
    } else {
      target.current = { x: pos.current.x, y: pos.current.y }
      lastMouseMove.current = Date.now()
    }
    mood.current = 'happy'
    setTimeout(() => { mood.current = 'idle' }, 1500)
    try { (window as any).__mewoPlayClick?.('click') } catch {}
  }, [])

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed',
        left: pos.current.x,
        top: pos.current.y,
        zIndex: 80,
        cursor: 'pointer',
        userSelect: 'none',
        pointerEvents: 'auto',
        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.35))',
      }}
      title={pinned.current ? 'Click to follow cursor' : 'Click to pin'}
    >
      <canvas
        ref={canvasRef}
        style={{ width: 80, height: 80, imageRendering: 'pixelated' }}
      />
    </div>
  )
}
