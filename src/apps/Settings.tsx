import { useState, useEffect } from 'react'
import { mediaUrl } from '../config'

const ACCENTS: Record<string, { primary: string; dark: string }> = {
  sakura: { primary: '#E8829B', dark: '#C45A7C' },
  miku: { primary: '#7EDDD6', dark: '#39C5BB' },
  lavender: { primary: '#C4B5FD', dark: '#A78BFA' },
  mint: { primary: '#86EFAC', dark: '#4ADE80' },
  peach: { primary: '#FDBA74', dark: '#FB923C' },
  rose: { primary: '#E8829B', dark: '#8B2252' },
}

const WALLPAPERS = [
  { id: 'wall-1', src: mediaUrl('/images/wallpapers/wall-1.jpg') },
  { id: 'wall-2', src: mediaUrl('/images/wallpapers/wall-2.jpg') },
  { id: 'wall-3', src: mediaUrl('/images/wallpapers/wall-3.jpg') },
  { id: 'wall-4', src: mediaUrl('/images/wallpapers/wall-4.jpg') },
  { id: 'wall-5', src: mediaUrl('/images/wallpapers/wall-5.jpg') },
  { id: 'wall-6', src: mediaUrl('/images/wallpapers/wall-6.jpg') },
]

const LIVE_WALLS = [
  { id: 'live-1', label: 'Galaxy', src: mediaUrl('/video/live-1.mp4') },
  { id: 'live-2', label: 'Neon', src: mediaUrl('/video/live-2.mp4') },
  { id: 'live-3', label: 'Aesthetic', src: mediaUrl('/video/live-3.mp4') },
]

export default function Settings() {
  const [accent, setAccent] = useState(() => localStorage.getItem('mewoos-accent') || 'sakura')
  const [bgMode, setBgMode] = useState<'dark' | 'static' | 'live'>(() => (localStorage.getItem('mewoos-bg') as any) || 'dark')
  const [selectedWallpaper, setSelectedWallpaper] = useState(() => localStorage.getItem('mewoos-wallpaper') || 'wall-1')
  const [selectedLiveWall, setSelectedLiveWall] = useState(() => localStorage.getItem('mewoos-live-wall') || 'live-1')
  const [widgets, setWidgets] = useState(() => localStorage.getItem('mewoos-widgets') !== 'off')

  useEffect(() => {
    localStorage.setItem('mewoos-accent', accent)
    const colors = ACCENTS[accent]
    if (colors) {
      document.body.classList.add('accent-transition')
      document.documentElement.style.setProperty('--color-sakura', colors.primary)
      document.documentElement.style.setProperty('--color-sakura-deep', colors.dark)
      setTimeout(() => document.body.classList.remove('accent-transition'), 600)
    }
  }, [accent])

  useEffect(() => {
    localStorage.setItem('mewoos-bg', bgMode)
    window.dispatchEvent(new CustomEvent('mewoos-bg-change', { detail: { mode: bgMode, wallpaper: selectedWallpaper, liveWall: selectedLiveWall } }))
  }, [bgMode, selectedWallpaper, selectedLiveWall])

  useEffect(() => { localStorage.setItem('mewoos-wallpaper', selectedWallpaper) }, [selectedWallpaper])
  useEffect(() => { localStorage.setItem('mewoos-live-wall', selectedLiveWall) }, [selectedLiveWall])
  useEffect(() => { localStorage.setItem('mewoos-widgets', widgets ? 'on' : 'off') }, [widgets])

  return (
    <div style={{ padding: 20, overflow: 'auto', height: '100%' }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, color: 'var(--color-text-primary)' }}>Settings</div>

      {/* Background Mode */}
      <Section title="Background">
        <div style={{ display: 'flex', gap: 6 }}>
          {[{ id: 'dark', label: 'Solid' }, { id: 'static', label: 'Static' }, { id: 'live', label: 'Live' }].map(m => (
            <button key={m.id} onClick={() => setBgMode(m.id as any)} style={{
              padding: '7px 14px', borderRadius: 8,
              background: bgMode === m.id ? 'rgba(232,130,155,0.12)' : 'rgba(255,255,255,0.03)',
              border: bgMode === m.id ? '1px solid rgba(232,130,155,0.2)' : '1px solid rgba(255,255,255,0.05)',
              cursor: 'pointer', color: 'var(--color-text-primary)', fontSize: 12,
              fontWeight: bgMode === m.id ? 700 : 500, fontFamily: 'var(--font-sans)',
            }}>{m.label}</button>
          ))}
        </div>
      </Section>

      {/* Static wallpaper picker */}
      {bgMode === 'static' && (
        <Section title="Choose Wallpaper">
          <div style={{ display: 'flex', gap: 8 }}>
            {WALLPAPERS.map(w => (
              <div key={w.id} onClick={() => setSelectedWallpaper(w.id)} style={{
                width: 80, height: 50, borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                border: selectedWallpaper === w.id ? '2px solid var(--color-sakura)' : '2px solid rgba(255,255,255,0.05)',
              }}>
                <img src={w.src} alt={w.id} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Live wallpaper picker */}
      {bgMode === 'live' && (
        <Section title="Choose Live Wallpaper">
          <div style={{ display: 'flex', gap: 8 }}>
            {LIVE_WALLS.map(l => (
              <div key={l.id} onClick={() => setSelectedLiveWall(l.id)} style={{
                width: 80, height: 50, borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                border: selectedLiveWall === l.id ? '2px solid var(--color-sakura)' : '2px solid rgba(255,255,255,0.05)',
                position: 'relative',
              }}>
                <video src={l.src} muted loop autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute', bottom: 2, left: 2, right: 2,
                  fontSize: 8, color: 'white', fontWeight: 700,
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                  textAlign: 'center',
                }}>{l.label}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Accent Color */}
      <Section title="Accent Color">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(ACCENTS).map(([id, c]) => (
            <button key={id} onClick={() => setAccent(id)} style={{
              width: 32, height: 32, borderRadius: '50%', background: c.primary,
              border: accent === id ? '3px solid var(--color-text-primary)' : '3px solid transparent',
              cursor: 'pointer', transition: 'all 0.15s',
            }} title={id} />
          ))}
        </div>
      </Section>

      <Section title="Widgets">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Desktop Widgets</span>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>Clock & Calendar</div>
          </div>
          <button onClick={() => setWidgets(w => !w)} style={{
            width: 44, height: 24, borderRadius: 12, border: 'none',
            background: widgets ? 'var(--color-sakura)' : 'rgba(255,255,255,0.08)',
            cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%', background: 'white',
              position: 'absolute', top: 3, left: widgets ? 23 : 3,
              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
          </button>
        </div>
      </Section>

      <Section title="Meo Assistant">
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Gemini API Key</span>
          <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>Required for Meo AI responses. Get one at aistudio.google.com</div>
        </div>
        <input
          type="password"
          defaultValue={localStorage.getItem('mewo-gemini-key') || 'AIzaSyDxvt3A5saNeoG9FeAFqNcQmL-wmqXokJ0'}
          onBlur={(e) => localStorage.setItem('mewo-gemini-key', e.target.value)}
          placeholder="Paste your Gemini API key..."
          style={{
            width: '100%', padding: '8px 12px', borderRadius: 8,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--color-text-primary)', fontSize: 12,
            fontFamily: 'var(--font-mono)', outline: 'none',
          }}
        />
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--color-text-muted)' }}>
          Ctrl+M to toggle Meo · Click the orb to talk
        </div>
      </Section>

      <Section title="About">
        <InfoRow label="Version" value="MewoOS 1.0.0" />
        <InfoRow label="Made by" value="Subhansh" />
      </Section>

      <div style={{
        marginTop: 16, padding: 12,
        background: 'rgba(232,130,155,0.03)', backdropFilter: 'blur(12px)',
        borderRadius: 10, fontSize: 11, color: 'var(--color-text-muted)',
        textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)',
      }}>Made for Hack Club Stardance Jam</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--color-text-muted)', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{value}</span>
    </div>
  )
}
