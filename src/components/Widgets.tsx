import { useState, useEffect, useRef } from 'react'

export default function Widgets() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem('mewoos-widgets') !== 'off')
  const [time, setTime] = useState(new Date())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const handler = () => setEnabled(localStorage.getItem('mewoos-widgets') !== 'off')
    window.addEventListener('storage', handler)
    const interval = setInterval(handler, 500)
    return () => { window.removeEventListener('storage', handler); clearInterval(interval) }
  }, [])

  // Clock tick
  useEffect(() => {
    if (!enabled) return
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [enabled])

  // Draw analog clock
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !enabled) return
    const ctx = canvas.getContext('2d')!
    const size = 140
    canvas.width = size; canvas.height = size
    const cx = size / 2, cy = size / 2, r = size / 2 - 8

    let frame: number
    const draw = () => {
      const now = new Date()
      const h = now.getHours() % 12, m = now.getMinutes(), s = now.getSeconds()
      ctx.clearRect(0, 0, size, size)

      // Clock face
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.03)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.1)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Hour markers
      for (let i = 0; i < 12; i++) {
        const angle = (i * 30 - 90) * Math.PI / 180
        const inner = i % 3 === 0 ? r - 14 : r - 10
        const outer = r - 4
        ctx.beginPath()
        ctx.moveTo(cx + inner * Math.cos(angle), cy + inner * Math.sin(angle))
        ctx.lineTo(cx + outer * Math.cos(angle), cy + outer * Math.sin(angle))
        ctx.strokeStyle = i % 3 === 0 ? 'rgba(232,130,155,0.6)' : 'rgba(255,255,255,0.15)'
        ctx.lineWidth = i % 3 === 0 ? 2.5 : 1.5
        ctx.stroke()
      }

      // Hour hand
      const hAngle = ((h + m / 60) * 30 - 90) * Math.PI / 180
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + (r - 30) * Math.cos(hAngle), cy + (r - 30) * Math.sin(hAngle))
      ctx.strokeStyle = 'var(--color-text-primary)'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.stroke()

      // Minute hand
      const mAngle = ((m + s / 60) * 6 - 90) * Math.PI / 180
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + (r - 18) * Math.cos(mAngle), cy + (r - 18) * Math.sin(mAngle))
      ctx.strokeStyle = 'var(--color-text-primary)'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.stroke()

      // Second hand
      const sAngle = (s * 6 - 90) * Math.PI / 180
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + (r - 12) * Math.cos(sAngle), cy + (r - 12) * Math.sin(sAngle))
      ctx.strokeStyle = 'var(--color-sakura)'
      ctx.lineWidth = 1
      ctx.lineCap = 'round'
      ctx.stroke()

      // Center dot
      ctx.beginPath()
      ctx.arc(cx, cy, 3, 0, Math.PI * 2)
      ctx.fillStyle = 'var(--color-sakura)'
      ctx.fill()

      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frame)
  }, [enabled])

  if (!enabled) return null

  // Calendar data
  const today = new Date()
  const isCurrentMonth = calMonth === today.getMonth() && calYear === today.getFullYear()
  const firstDay = new Date(calYear, calMonth, 1).getDay()
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const monthName = new Date(calYear, calMonth).toLocaleDateString('en-US', { month: 'long' })
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d)

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  const glassStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(8,10,20,0.55) 0%, rgba(4,5,12,0.65) 50%, rgba(10,12,22,0.55) 100%)',
    backdropFilter: 'blur(40px) saturate(2) brightness(1.15)',
    borderRadius: 18,
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 12px 48px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.08) inset',
    padding: 16,
    position: 'relative',
  }

  return (
    <div style={{ position: 'fixed', top: 80, right: 16, zIndex: 80, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'auto' }}>
      {/* Analog clock */}
      <div style={{ ...glassStyle, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <canvas ref={canvasRef} style={{ width: 140, height: 140 }} />
        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>
          {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
        </div>
      </div>

      {/* Calendar */}
      <div style={{ ...glassStyle, minWidth: 220 }}>
        {/* Header with nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 14, padding: '0 4px' }}>‹</button>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {monthName} {calYear}
          </div>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 14, padding: '0 4px' }}>›</button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 4 }}>
          {days.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, color: 'var(--color-text-muted)', padding: '2px 0' }}>{d}</div>
          ))}
        </div>

        {/* Date grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
          {calendarDays.map((d, i) => {
            const isToday = d === today.getDate() && isCurrentMonth
            return (
              <div key={i} style={{
                textAlign: 'center', fontSize: 11, fontWeight: isToday ? 700 : 400,
                color: isToday ? 'white' : d ? 'var(--color-text-secondary)' : 'transparent',
                background: isToday ? 'var(--color-sakura)' : 'transparent',
                borderRadius: 6, width: 26, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto', cursor: d ? 'default' : 'default',
              }}>
                {d || ''}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
