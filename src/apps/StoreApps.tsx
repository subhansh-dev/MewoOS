import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Weather ────────────────────────────────────────────────────────────
const WEATHER_DATA = [
  { city: 'Tokyo', temp: 28, condition: 'Partly Cloudy', humidity: 62, wind: 12, icon: '⛅', high: 31, low: 24 },
  { city: 'London', temp: 16, condition: 'Rainy', humidity: 84, wind: 22, icon: '🌧️', high: 18, low: 12 },
  { city: 'New York', temp: 22, condition: 'Sunny', humidity: 45, wind: 8, icon: '☀️', high: 25, low: 18 },
  { city: 'Dublin', temp: 14, condition: 'Overcast', humidity: 78, wind: 28, icon: '☁️', high: 16, low: 10 },
  { city: 'Mumbai', temp: 33, condition: 'Humid', humidity: 88, wind: 6, icon: '🌤️', high: 35, low: 27 },
]

const FORECAST = [
  { day: 'Mon', icon: '☀️', high: 26, low: 18 },
  { day: 'Tue', icon: '⛅', high: 24, low: 17 },
  { day: 'Wed', icon: '🌧️', high: 19, low: 14 },
  { day: 'Thu', icon: '⛈️', high: 17, low: 13 },
  { day: 'Fri', icon: '🌤️', high: 22, low: 16 },
  { day: 'Sat', icon: '☀️', high: 27, low: 19 },
  { day: 'Sun', icon: '⛅', high: 25, low: 17 },
]

export function WeatherApp() {
  const [selected, setSelected] = useState(0)
  const w = WEATHER_DATA[selected]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(10,7,9,0.95)', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', background: 'linear-gradient(180deg, rgba(147,197,253,0.08) 0%, transparent 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Mewo Weather</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 42 }}>{w.icon}</span>
          <div>
            <div style={{ fontSize: 36, fontWeight: 700, color: 'rgba(255,255,255,0.9)', lineHeight: 1 }}>{w.temp}°</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{w.condition}</div>
          </div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>{w.city}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)' }}>H:{w.high}° L:{w.low}°</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 1, padding: '12px 16px', flexShrink: 0 }}>
        {[
          { label: 'Humidity', value: `${w.humidity}%`, icon: '💧' },
          { label: 'Wind', value: `${w.wind} km/h`, icon: '💨' },
          { label: 'Feels Like', value: `${w.temp - 2}°`, icon: '🌡️' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, padding: '10px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 14, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{s.value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* 7-day forecast */}
      <div style={{ padding: '0 16px 12px', flex: 1 }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>7-Day Forecast</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {FORECAST.map(f => (
            <div key={f.day} style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, gap: 10 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', width: 32, fontFamily: 'var(--font-mono)' }}>{f.day}</span>
              <span style={{ fontSize: 16 }}>{f.icon}</span>
              <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: `${((f.low - 10) / 25) * 100}%`, right: `${100 - ((f.high - 10) / 25) * 100}%`, height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #93C5FD, #FDBA74)' }} />
              </div>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', width: 50, textAlign: 'right' }}>{f.low}° / {f.high}°</span>
            </div>
          ))}
        </div>
      </div>

      {/* City selector */}
      <div style={{ display: 'flex', gap: 4, padding: '0 16px 12px', overflowX: 'auto', flexShrink: 0 }}>
        {WEATHER_DATA.map((c, i) => (
          <button key={c.city} onClick={() => setSelected(i)} style={{
            padding: '5px 10px', borderRadius: 8, border: 'none', fontSize: 10, fontFamily: 'var(--font-mono)', cursor: 'pointer', whiteSpace: 'nowrap',
            background: i === selected ? 'rgba(147,197,253,0.15)' : 'rgba(255,255,255,0.03)',
            color: i === selected ? '#93C5FD' : 'rgba(255,255,255,0.35)',
          }}>{c.city}</button>
        ))}
      </div>
    </div>
  )
}

// ─── Kanban Board ───────────────────────────────────────────────────────
interface KanbanTask { id: number; title: string; tag: string; tagColor: string }

const INITIAL_TASKS: Record<string, KanbanTask[]> = {
  todo: [
    { id: 1, title: 'Design new landing page', tag: 'Design', tagColor: '#E8829B' },
    { id: 2, title: 'Write API documentation', tag: 'Docs', tagColor: '#93C5FD' },
    { id: 3, title: 'Set up CI/CD pipeline', tag: 'DevOps', tagColor: '#86EFAC' },
  ],
  doing: [
    { id: 4, title: 'Build auth module', tag: 'Backend', tagColor: '#C4B5FD' },
    { id: 5, title: 'Fix memory leak in renderer', tag: 'Bug', tagColor: '#FDBA74' },
  ],
  done: [
    { id: 6, title: 'Project kickoff meeting', tag: 'Meta', tagColor: '#7EDDD6' },
    { id: 7, title: 'Set up repo & linting', tag: 'DevOps', tagColor: '#86EFAC' },
  ],
}

export function KanbanApp() {
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const columns = [
    { id: 'todo', label: 'TO DO', color: '#FDBA74', count: tasks.todo.length },
    { id: 'doing', label: 'IN PROGRESS', color: '#93C5FD', count: tasks.doing.length },
    { id: 'done', label: 'DONE', color: '#86EFAC', count: tasks.done.length },
  ]

  const handleDragStart = (e: React.DragEvent, taskId: number, from: string) => {
    e.dataTransfer.setData('taskId', String(taskId))
    e.dataTransfer.setData('from', from)
  }

  const handleDrop = (e: React.DragEvent, to: string) => {
    e.preventDefault()
    const taskId = parseInt(e.dataTransfer.getData('taskId'))
    const from = e.dataTransfer.getData('from')
    if (from === to) return
    setTasks(prev => {
      const task = prev[from].find(t => t.id === taskId)
      if (!task) return prev
      return { ...prev, [from]: prev[from].filter(t => t.id !== taskId), [to]: [...prev[to], task] }
    })
    setDragOver(null)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(10,7,9,0.95)' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>Kanban Board</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>{tasks.todo.length + tasks.doing.length + tasks.done.length} tasks</div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', gap: 8, padding: 12, overflow: 'auto' }}>
        {columns.map(col => (
          <div key={col.id} style={{ flex: 1, minWidth: 140, display: 'flex', flexDirection: 'column', gap: 6 }}
            onDragOver={e => { e.preventDefault(); setDragOver(col.id) }}
            onDragLeave={() => setDragOver(null)}
            onDrop={e => handleDrop(e, col.id)}
          >
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: col.color, letterSpacing: 1, fontWeight: 600, padding: '0 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: col.color }} />
              {col.label}
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>{col.count}</span>
            </div>
            <div style={{ flex: 1, borderRadius: 10, padding: 4, display: 'flex', flexDirection: 'column', gap: 4, background: dragOver === col.id ? 'rgba(255,255,255,0.04)' : 'transparent', transition: 'background 0.15s' }}>
              {tasks[col.id].map(task => (
                <div key={task.id} draggable onDragStart={e => handleDragStart(e, task.id, col.id)}
                  style={{ padding: '10px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, cursor: 'grab', fontSize: 11, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4, transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)' }}
                >
                  {task.title}
                  <div style={{ marginTop: 6 }}>
                    <span style={{ fontSize: 8, padding: '2px 6px', borderRadius: 4, background: `${task.tagColor}18`, color: task.tagColor, fontFamily: 'var(--font-mono)' }}>{task.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Focus Timer ────────────────────────────────────────────────────────
export function TimerApp() {
  const [seconds, setSeconds] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [mode, setMode] = useState<'work' | 'short' | 'long'>('work')
  const intervalRef = useRef<number | null>(null)

  const modes = { work: 25 * 60, short: 5 * 60, long: 15 * 60 }
  const modeColors = { work: '#E8829B', short: '#86EFAC', long: '#93C5FD' }

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) { setRunning(false); return 0 }
          return prev - 1
        })
      }, 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const switchMode = (m: typeof mode) => { setMode(m); setSeconds(modes[m]); setRunning(false) }
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')
  const progress = 1 - seconds / modes[mode]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,7,9,0.95)', gap: 24 }}>
      {/* Mode switcher */}
      <div style={{ display: 'flex', gap: 6 }}>
        {(['work', 'short', 'long'] as const).map(m => (
          <button key={m} onClick={() => switchMode(m)} style={{
            padding: '5px 14px', borderRadius: 8, border: 'none', fontSize: 10, fontFamily: 'var(--font-mono)', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5,
            background: mode === m ? `${modeColors[m]}20` : 'rgba(255,255,255,0.03)',
            color: mode === m ? modeColors[m] : 'rgba(255,255,255,0.3)',
          }}>{m === 'work' ? 'Focus' : m === 'short' ? 'Short' : 'Long'}</button>
        ))}
      </div>

      {/* Timer ring */}
      <div style={{ position: 'relative', width: 180, height: 180 }}>
        <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <circle cx="90" cy="90" r="80" fill="none" stroke={modeColors[mode]} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 80}`}
            strokeDashoffset={`${2 * Math.PI * 80 * (1 - progress)}`}
            style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease', filter: `drop-shadow(0 0 8px ${modeColors[mode]}40)` }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 40, fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: 'var(--font-mono)', letterSpacing: 2 }}>{mins}:{secs}</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 1 }}>{mode === 'work' ? 'Focus Time' : 'Break'}</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => setRunning(!running)} style={{
          padding: '10px 32px', borderRadius: 10, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)',
          background: running ? 'rgba(255,255,255,0.06)' : `${modeColors[mode]}`,
          color: running ? 'rgba(255,255,255,0.5)' : 'white',
          boxShadow: running ? 'none' : `0 4px 16px ${modeColors[mode]}33`,
        }}>{running ? 'Pause' : 'Start'}</button>
        <button onClick={() => { setSeconds(modes[mode]); setRunning(false) }} style={{
          padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer',
        }}>Reset</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        {[{ label: 'Sessions', val: '4' }, { label: 'Total Focus', val: '1h 40m' }, { label: 'Streak', val: '3 days' }].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{s.val}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Type Racer ─────────────────────────────────────────────────────────
const TYPING_TEXTS = [
  "the quick brown fox jumps over the lazy dog near the riverbank",
  "pack my box with five dozen liquor jugs how quickly can you type",
  "amazingly few discotheques provide jukeboxes with quality music",
  "crazy frederick bought many very exquisite opal jewels from india",
  "the five boxing wizards jump quickly at the old abandoned warehouse",
  "two driven jocks help fax my big quiz to the remote island village",
  "jived fox nymph grabs quick waltz as the moon rises above the sea",
  "my girl wove six dozen plaid jackets before she quit sewing totally",
]

export function TypingSpeedApp() {
  const [text, setText] = useState(TYPING_TEXTS[0])
  const [input, setInput] = useState('')
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [time, setTime] = useState(0)
  const [wpm, setWpm] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (started && !finished) {
      timerRef.current = window.setInterval(() => setTime(t => t + 1), 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [started, finished])

  const start = () => {
    setText(TYPING_TEXTS[Math.floor(Math.random() * TYPING_TEXTS.length)])
    setInput('')
    setStarted(true)
    setFinished(false)
    setTime(0)
    setWpm(0)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleInput = (val: string) => {
    if (!started || finished) return
    setInput(val)
    if (val === text) {
      if (timerRef.current) clearInterval(timerRef.current)
      const minutes = time / 60
      const words = text.split(' ').length
      setWpm(Math.round(words / Math.max(minutes, 0.1)))
      setFinished(true)
    }
  }

  const getCharClass = (i: number) => {
    if (i >= input.length) return 'pending'
    return input[i] === text[i] ? 'correct' : 'wrong'
  }

  const charColors: Record<string, string> = {
    pending: 'rgba(255,255,255,0.25)',
    correct: '#86EFAC',
    wrong: '#EF4444',
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(10,7,9,0.95)', padding: 20, gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>Type Racer</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>Test your typing speed</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#C4B5FD', fontFamily: 'var(--font-mono)' }}>{time}s</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Time</div>
          </div>
          {finished && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#86EFAC', fontFamily: 'var(--font-mono)' }}>{wpm}</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>WPM</div>
            </div>
          )}
        </div>
      </div>

      {/* Text display */}
      <div style={{
        padding: '16px', borderRadius: 12,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        fontSize: 16, lineHeight: 1.8, letterSpacing: 0.3,
        fontFamily: 'var(--font-mono)',
        minHeight: 80,
      }}>
        {text.split('').map((char, i) => (
          <span key={i} style={{ color: charColors[getCharClass(i)], transition: 'color 0.05s', fontWeight: getCharClass(i) === 'wrong' ? 700 : 400 }}>{char}</span>
        ))}
      </div>

      {/* Input */}
      {!finished ? (
        <input ref={inputRef} value={input} onChange={e => handleInput(e.target.value)}
          placeholder={started ? 'Start typing...' : 'Press Start to begin'}
          disabled={!started}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.85)', fontSize: 14,
            outline: 'none', fontFamily: 'var(--font-mono)',
            opacity: started ? 1 : 0.5,
          }}
        />
      ) : (
        <div style={{
          padding: '16px', borderRadius: 12,
          background: 'rgba(134,239,172,0.06)',
          border: '1px solid rgba(134,239,172,0.15)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>RACE COMPLETE</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#86EFAC', fontFamily: 'var(--font-mono)' }}>{wpm} WPM</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{time} seconds · {text.length} characters</div>
        </div>
      )}

      {/* Start / Restart */}
      <button onClick={start} style={{
        width: '100%', padding: '10px 0', borderRadius: 10, border: 'none',
        background: finished ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #C4B5FD, #8B5CF6)',
        color: finished ? 'rgba(255,255,255,0.5)' : 'white',
        fontSize: 12, fontWeight: 600, cursor: 'pointer',
        boxShadow: finished ? 'none' : '0 4px 16px rgba(139,92,246,0.25)',
      }}>{finished ? 'Try Again' : 'Start'}</button>
    </div>
  )
}

// ─── Paint Studio ───────────────────────────────────────────────────────
export function PaintApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [color, setColor] = useState('#E8829B')
  const [brushSize, setBrushSize] = useState(3)
  const lastPos = useRef({ x: 0, y: 0 })

  const colors = ['#E8829B', '#C4B5FD', '#7EDDD6', '#FDBA74', '#86EFAC', '#93C5FD', '#FF6B6B', '#FFFFFF']

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = rect.height * 2
    ctx.scale(2, 2)
    ctx.fillStyle = 'rgba(10,7,9,1)'
    ctx.fillRect(0, 0, rect.width, rect.height)
  }, [])

  const getPos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startDraw = (e: React.MouseEvent) => {
    setDrawing(true)
    lastPos.current = getPos(e)
  }

  const draw = (e: React.MouseEvent) => {
    if (!drawing) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = color
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    lastPos.current = pos
  }

  const clear = () => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = 'rgba(10,7,9,1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(10,7,9,0.95)' }}>
      {/* Toolbar */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {colors.map(c => (
            <button key={c} onClick={() => setColor(c)} style={{
              width: 18, height: 18, borderRadius: '50%', border: color === c ? '2px solid white' : '2px solid transparent',
              background: c, cursor: 'pointer', transition: 'all 0.15s',
            }} />
          ))}
        </div>
        <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.08)' }} />
        <input type="range" min="1" max="20" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))}
          style={{ width: 60, accentColor: color }} />
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>{brushSize}px</span>
        <div style={{ flex: 1 }} />
        <button onClick={clear} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.4)', fontSize: 10, cursor: 'pointer' }}>Clear</button>
      </div>
      {/* Canvas */}
      <div style={{ flex: 1, overflow: 'hidden', cursor: 'crosshair' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={() => setDrawing(false)} onMouseLeave={() => setDrawing(false)} />
      </div>
    </div>
  )
}

// ─── Image Editor ───────────────────────────────────────────────────────
export function ImageEditorApp() {
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [hue, setHue] = useState(0)
  const [blur, setBlur] = useState(0)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const filters = [
    { name: 'Original', b: 100, c: 100, s: 100, h: 0, bl: 0 },
    { name: 'Warm', b: 105, c: 110, s: 120, h: 15, bl: 0 },
    { name: 'Cool', b: 95, c: 105, s: 90, h: -20, bl: 0 },
    { name: 'B&W', b: 100, c: 120, s: 0, h: 0, bl: 0 },
    { name: 'Vintage', b: 90, c: 85, s: 80, h: 10, bl: 0.5 },
    { name: 'Vivid', b: 110, c: 130, s: 150, h: 0, bl: 0 },
    { name: 'Fade', b: 115, c: 80, s: 70, h: 0, bl: 0 },
    { name: 'Noir', b: 80, c: 140, s: 0, h: 0, bl: 0 },
  ]

  const applyFilter = (f: typeof filters[0]) => {
    setBrightness(f.b); setContrast(f.c); setSaturation(f.s); setHue(f.h); setBlur(f.bl); setActiveFilter(f.name)
  }

  const filterStr = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg) blur(${blur}px)`

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(10,7,9,0.95)' }}>
      {/* Preview */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflow: 'hidden' }}>
        <div style={{
          width: '100%', maxWidth: 320, aspectRatio: '4/3', borderRadius: 12, overflow: 'hidden',
          filter: filterStr, transition: 'filter 0.3s',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <img src="/images/gallery-new/gallery-2.jpg" alt="Editing" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Filters</div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {filters.map(f => (
            <button key={f.name} onClick={() => applyFilter(f)} style={{
              padding: '6px 12px', borderRadius: 8, border: 'none', fontSize: 10, cursor: 'pointer', whiteSpace: 'nowrap',
              background: activeFilter === f.name ? 'rgba(232,130,155,0.15)' : 'rgba(255,255,255,0.03)',
              color: activeFilter === f.name ? '#E8829B' : 'rgba(255,255,255,0.4)',
            }}>{f.name}</button>
          ))}
        </div>
      </div>

      {/* Adjustments */}
      <div style={{ padding: '8px 12px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        {[
          { label: 'Brightness', val: brightness, set: setBrightness, max: 200 },
          { label: 'Contrast', val: contrast, set: setContrast, max: 200 },
          { label: 'Saturation', val: saturation, set: setSaturation, max: 200 },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)', width: 60 }}>{s.label}</span>
            <input type="range" min="0" max={s.max} value={s.val} onChange={e => s.set(Number(e.target.value))} style={{ flex: 1, accentColor: '#E8829B' }} />
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono)', width: 28, textAlign: 'right' }}>{s.val}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
