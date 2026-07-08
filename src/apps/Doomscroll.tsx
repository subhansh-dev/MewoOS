import { useState, useRef, useEffect } from 'react'
import { mediaUrl } from '../config'

// Dynamically load all reel files
const REEL_COUNT = 34
const REELS = Array.from({ length: REEL_COUNT }, (_, i) => mediaUrl(`/reels/reel-${i + 1}.mp4`))

const CREATOR_NAMES = [
  'moonlit.wav',
  'glass.heart',
  'soft.miku',
  'phantom.pix',
  'gothic.kitty',
  'neon.purr',
  'mewo_clips',
  'dreamy.clouds',
  'synth.wave',
  'vocaloid.exe',
  'rust.bunny',
  'ink.blot',
  'anime.daily',
  'starlight.fx',
  'dust.devil',
  'sugar.skull',
  'paper.crane',
  'echo.valley',
  'sakura.bloom',
  'kawaii.vibes',
  'piano.soul',
  'velvet.night',
  'gloomy.bear',
  'jazz.mood',
  'crystal.tear',
  'lofi.cat',
  'pastel_edits',
  'nightcore.wav',
  'chopin.fx',
  'cherry.bomb',
  'fog.machine',
  'dark.roses',
  'violin.heart',
  'retro.tape',
]

export default function Doomscroll() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [liked, setLiked] = useState<Set<number>>(new Set())
  const [showHeart, setShowHeart] = useState(false)
  const [heartPos, setHeartPos] = useState({ x: 50, y: 50 })
  const videoRef = useRef<HTMLVideoElement>(null)
  const touchStart = useRef(0)

  const creator = CREATOR_NAMES[currentIdx % CREATOR_NAMES.length]
  const reelSrc = REELS[currentIdx]

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.load()
      video.play().catch(() => {})
    }
  }, [currentIdx])

  const handleLike = (x?: number, y?: number) => {
    setLiked(prev => {
      const next = new Set(prev)
      if (next.has(currentIdx)) { next.delete(currentIdx) }
      else {
        next.add(currentIdx)
        setHeartPos({ x: x ?? 50, y: y ?? 50 })
        setShowHeart(true)
        setTimeout(() => setShowHeart(false), 800)
      }
      return next
    })
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    if (!liked.has(currentIdx)) handleLike(x, y)
  }

  const goNext = () => setCurrentIdx((currentIdx + 1) % REELS.length)
  const goPrev = () => setCurrentIdx((currentIdx - 1 + REELS.length) % REELS.length)

  return (
    <div
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown' || e.key === 'j') goNext()
        if (e.key === 'ArrowUp' || e.key === 'k') goPrev()
        if (e.key === 'l' || e.key === ' ') handleLike()
      }}
      onWheel={(e) => { if (e.deltaY > 30) goNext(); if (e.deltaY < -30) goPrev() }}
      onTouchStart={(e) => { touchStart.current = e.touches[0].clientY }}
      onTouchEnd={(e) => { const d = touchStart.current - e.changedTouches[0].clientY; if (d > 50) goNext(); if (d < -50) goPrev() }}
      style={{ height: '100%', width: '100%', background: '#000', position: 'relative', outline: 'none', overflow: 'hidden', display: 'flex' }}
    >
      {/* Video — fullscreen with audio */}
      <div style={{ position: 'absolute', inset: 0 }} onDoubleClick={handleDoubleClick}>
        <video
          ref={videoRef}
          key={reelSrc}
          src={reelSrc}
          autoPlay
          loop
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            // If this reel doesn't exist, skip to next
            const target = e.target as HTMLVideoElement
            if (target.error) goNext()
          }}
        />
      </div>

      {/* Heart animation */}
      {showHeart && (
        <div style={{
          position: 'absolute', top: heartPos.y + '%', left: heartPos.x + '%',
          transform: 'translate(-50%, -50%)',
          fontSize: 80, color: '#FF3B5C',
          animation: 'heart-pop 0.8s ease-out forwards',
          pointerEvents: 'none', zIndex: 20,
          textShadow: '0 0 20px rgba(255,59,92,0.5)',
        }}>&#x2665;</div>
      )}

      {/* Right sidebar */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 56,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'flex-end', gap: 18, padding: '0 8px 80px',
        background: 'linear-gradient(270deg, rgba(0,0,0,0.5) 0%, transparent 100%)',
        zIndex: 10,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'linear-gradient(135deg, #E8829B, #6B3FA0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 800, color: 'white', fontFamily: 'var(--font-mono)',
          border: '2px solid rgba(255,255,255,0.3)',
        }}>{creator[0].toUpperCase()}</div>

        <button onClick={() => handleLike()} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          background: 'none', border: 'none', cursor: 'pointer',
          color: liked.has(currentIdx) ? '#FF3B5C' : 'white',
        }}>
          <span style={{ fontSize: 28, lineHeight: 1 }}>{liked.has(currentIdx) ? '\u2665' : '\u2661'}</span>
          <span style={{ fontSize: 9, fontWeight: 600, opacity: 0.8 }}>{liked.has(currentIdx) ? 'Liked' : 'Like'}</span>
        </button>

        <div style={sideBtnStyle}><span style={{ fontSize: 24 }}>&#x25E7;</span><span style={{ fontSize: 9, fontWeight: 600 }}>Comment</span></div>
        <div style={sideBtnStyle}><span style={{ fontSize: 24 }}>&#x21F1;</span><span style={{ fontSize: 9, fontWeight: 600 }}>Share</span></div>
        <div style={sideBtnStyle}><span style={{ fontSize: 24 }}>&#x25A3;</span><span style={{ fontSize: 9, fontWeight: 600 }}>Save</span></div>
      </div>

      {/* Bottom info */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 56,
        padding: '40px 14px 12px',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
        pointerEvents: 'none', zIndex: 10,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 4 }}>@{creator}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>mewo vibes #kawaii #aesthetic</div>
      </div>

      {/* Counter */}
      <div style={{
        position: 'absolute', top: 10, right: 64, fontSize: 10,
        color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)',
        pointerEvents: 'none', zIndex: 10,
        background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: 10,
      }}>{currentIdx + 1}/{REELS.length}</div>

      {/* Nav */}
      <div style={{
        position: 'absolute', right: 60, top: '50%', transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', gap: 8, zIndex: 10,
      }}>
        <button onClick={goPrev} style={navBtnStyle}>&#x25B2;</button>
        <button onClick={goNext} style={navBtnStyle}>&#x25BC;</button>
      </div>
    </div>
  )
}

const sideBtnStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
  color: 'rgba(255,255,255,0.7)',
}

const navBtnStyle: React.CSSProperties = {
  width: 28, height: 28, borderRadius: '50%',
  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 12, backdropFilter: 'blur(4px)',
}
