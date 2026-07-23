import { useState, useEffect } from 'react'

export default function Calculator() {
  const [display, setDisplay] = useState('0')
  const [prev, setPrev] = useState<number | null>(null)
  const [op, setOp] = useState<string | null>(null)
  const [fresh, setFresh] = useState(true)

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleNum(e.key)
      else if (e.key === '.') handleNum('.')
      else if (e.key === '+') handleOp('+')
      else if (e.key === '-') handleOp('-')
      else if (e.key === '*') handleOp('*')
      else if (e.key === '/') { e.preventDefault(); handleOp('/') }
      else if (e.key === 'Enter' || e.key === '=') handleEquals()
      else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') handleClear()
      else if (e.key === '%') handlePercent()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [display, prev, op, fresh])

  const handleNum = (n: string) => {
    if (fresh) {
      setDisplay(n === '.' ? '0.' : n)
      setFresh(false)
    } else {
      if (n === '.' && display.includes('.')) return
      setDisplay(display + n)
    }
  }

  const handleOp = (nextOp: string) => {
    const current = parseFloat(display)
    if (prev !== null && op && !fresh) {
      const result = calc(prev, current, op)
      setDisplay(String(result))
      setPrev(result)
    } else {
      setPrev(current)
    }
    setOp(nextOp)
    setFresh(true)
  }

  const handleEquals = () => {
    if (prev === null || !op) return
    const current = parseFloat(display)
    const result = calc(prev, current, op)
    setDisplay(String(result))
    setPrev(null)
    setOp(null)
    setFresh(true)
  }

  const calc = (a: number, b: number, operator: string): number => {
    switch (operator) {
      case '+': return a + b
      case '-': return a - b
      case '*': return a * b
      case '/': return b === 0 ? 0 : a / b
      default: return b
    }
  }

  const handleClear = () => {
    setDisplay('0')
    setPrev(null)
    setOp(null)
    setFresh(true)
  }

  const handlePercent = () => {
    setDisplay(String(parseFloat(display) / 100))
  }

  const handleNegate = () => {
    setDisplay(String(-parseFloat(display)))
  }

  const buttons = [
    { label: 'AC', action: handleClear, className: '' },
    { label: '+/-', action: handleNegate, className: '' },
    { label: '%', action: handlePercent, className: '' },
    { label: '/', action: () => handleOp('/'), className: 'op' },
    { label: '7', action: () => handleNum('7'), className: '' },
    { label: '8', action: () => handleNum('8'), className: '' },
    { label: '9', action: () => handleNum('9'), className: '' },
    { label: '*', action: () => handleOp('*'), className: 'op' },
    { label: '4', action: () => handleNum('4'), className: '' },
    { label: '5', action: () => handleNum('5'), className: '' },
    { label: '6', action: () => handleNum('6'), className: '' },
    { label: '-', action: () => handleOp('-'), className: 'op' },
    { label: '1', action: () => handleNum('1'), className: '' },
    { label: '2', action: () => handleNum('2'), className: '' },
    { label: '3', action: () => handleNum('3'), className: '' },
    { label: '+', action: () => handleOp('+'), className: 'op' },
    { label: '0', action: () => handleNum('0'), className: '' },
    { label: '.', action: () => handleNum('.'), className: '' },
    { label: '=', action: handleEquals, className: 'equals' },
  ]

  return (
    <div className="app-calc">
      <div className="app-calc-display">
        {display.length > 12 ? parseFloat(display).toExponential(6) : display}
      </div>
      <div className="app-calc-grid">
        {buttons.map((btn, i) => (
          <button
            key={i}
            className={`app-calc-btn ${btn.className}`}
            onClick={btn.action}
            style={btn.label === '0' ? { gridColumn: 'span 1' } : undefined}
          >
            {btn.label === '*' ? '×' : btn.label === '/' ? '÷' : btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}
