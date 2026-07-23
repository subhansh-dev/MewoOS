import { useState, useEffect, useRef } from 'react'

export default function Notes() {
  const [text, setText] = useState(() => {
    return localStorage.getItem('mewoos-notes') || ''
  })
  const [saved, setSaved] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      localStorage.setItem('mewoos-notes', text)
      setSaved(true)
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => setSaved(false), 1500)
    }, 400)
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [text])

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  return (
    <div className="app-notes">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottom: '1px solid var(--color-border)',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Quick Notes
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {saved && text.length > 0 && (
            <span style={{
              fontSize: 10, color: 'var(--color-mint)', fontWeight: 600,
              opacity: 1, transition: 'opacity 0.3s',
            }}>✓ Saved</span>
          )}
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            {wordCount} words
          </span>
        </div>
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Start typing your thoughts here... (◕ᴗ◕✿)"
        spellCheck={false}
      />
    </div>
  )
}
