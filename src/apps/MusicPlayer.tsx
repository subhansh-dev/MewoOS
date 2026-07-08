import { useState, useRef, useEffect, useCallback } from 'react'
import { mediaUrl } from '../config'

interface Track {
  title: string
  artist: string
  src: string
  cover: string
}

const TRACKS: Track[] = [
  // Anime / Vocaloid
  { title: "Cruel Angel's Thesis", artist: 'Evangelion', src: mediaUrl('/audio/cruel-angels-thesis.mp3'), cover: mediaUrl('/images/covers/cruel-angels.jpg') },
  { title: 'Idol', artist: 'YOASOBI', src: mediaUrl('/audio/yoasobi-idol.mp3'), cover: mediaUrl('/images/covers/yoasobi.jpg') },
  { title: 'Kaibutsu', artist: 'YOASOBI', src: mediaUrl('/audio/kaibutsu.mp3'), cover: mediaUrl('/images/covers/kaibutsu.jpg') },
  { title: 'Usseewa', artist: 'Ado', src: mediaUrl('/audio/ado-usseewa.mp3'), cover: mediaUrl('/images/covers/ado.jpg') },
  { title: 'Night Dancer', artist: 'imase', src: mediaUrl('/audio/night-dancer.mp3'), cover: mediaUrl('/images/covers/night-dancer.jpg') },
  { title: 'Young Girl A', artist: 'Siinamota', src: mediaUrl('/audio/young-girl-a.webm'), cover: mediaUrl('/images/covers/young-girl-a.jpg') },
  { title: 'Miku Expo', artist: 'Hatsune Miku', src: mediaUrl('/audio/miku-expo.webm'), cover: mediaUrl('/images/covers/miku-expo.jpg') },
  { title: 'Renai Circulation', artist: 'Rainych', src: mediaUrl('/audio/renai-circulation.webm'), cover: mediaUrl('/images/covers/renai-circulation.jpg') },
  { title: 'Kamisama Hajimemashita', artist: 'Hanae', src: mediaUrl('/audio/kamisama.webm'), cover: mediaUrl('/images/covers/kamisama.jpg') },
  { title: 'Stay With Me', artist: 'Miki Matsubara', src: mediaUrl('/audio/stay-with-me.webm'), cover: mediaUrl('/images/covers/stay-with-me.jpg') },
  { title: "I Can't Stop the Loneliness", artist: 'Anri', src: mediaUrl('/audio/cant-stop-loneliness.webm'), cover: mediaUrl('/images/covers/cant-stop-loneliness.jpg') },
  { title: 'Babydoll', artist: 'Dominic Fike', src: mediaUrl('/audio/babydoll-dom-fike.mp3'), cover: mediaUrl('/images/covers/babydoll.jpg') },
  { title: 'The Moon is Beautiful', artist: 'JP Cover', src: mediaUrl('/audio/moon-is-beautiful.webm'), cover: mediaUrl('/images/covers/moon-beautiful.jpg') },
  { title: 'Mori no Chisana Restaurant', artist: 'Aoi Tenshima', src: mediaUrl('/audio/mori-no-restaurant.mp3'), cover: mediaUrl('/images/covers/mori-no-restaurant.jpg') },
  // English / Jazz / Pop
  { title: 'Fly Me to the Moon', artist: 'Frank Sinatra', src: mediaUrl('/audio/fly-me-to-the-moon.mp3'), cover: mediaUrl('/images/covers/fly-me-to-the-moon.jpg') },
  { title: 'Feeling Good', artist: 'Michael Bublé', src: mediaUrl('/audio/feeling-good.mp3'), cover: mediaUrl('/images/covers/feeling-good.jpg') },
  { title: 'Sway', artist: 'Michael Bublé', src: mediaUrl('/audio/sway.webm'), cover: mediaUrl('/images/covers/sway.jpg') },
  { title: 'If I Give My Heart to You', artist: 'Doris Day', src: mediaUrl('/audio/if-i-give-my-heart.webm'), cover: mediaUrl('/images/covers/if-i-give-my-heart.jpg') },
  { title: 'Put Your Head on My Shoulder', artist: 'Paul Anka', src: mediaUrl('/audio/put-your-head.webm'), cover: mediaUrl('/images/covers/put-your-head.jpg') },
  { title: 'Until I Found You', artist: 'Stephen Sanchez', src: mediaUrl('/audio/until-i-found-you.webm'), cover: mediaUrl('/images/covers/until-i-found-you.jpg') },
  { title: 'Glue Song', artist: 'beabadoobee', src: mediaUrl('/audio/glue-song.webm'), cover: mediaUrl('/images/covers/glue-song.jpg') },
  // Classical
  { title: 'Ballade No.1 in G minor', artist: 'Chopin', src: mediaUrl('/audio/chopin-ballade-1.mp3'), cover: mediaUrl('/images/covers/chopin.jpg') },
  { title: 'Waltz Op.64 No.2', artist: 'Chopin', src: mediaUrl('/audio/waltz-op64.mp3'), cover: mediaUrl('/images/covers/waltz.jpg') },
  { title: 'Piano Concerto No.2', artist: 'Rachmaninoff', src: mediaUrl('/audio/rachmaninoff-2.mp3'), cover: mediaUrl('/images/covers/rachmaninoff.jpg') },
  { title: 'Caprice No.24', artist: 'Paganini', src: mediaUrl('/audio/paganini-caprice-24.mp3'), cover: mediaUrl('/images/covers/paganini.jpg') },
  // Extra
  { title: 'Rise to the Moon', artist: 'Anime OST', src: mediaUrl('/audio/rise-to-the-moon.webm'), cover: mediaUrl('/images/covers/rise-to-the-moon.jpg') },
  { title: 'Fly', artist: 'Spectrum', src: mediaUrl('/audio/fly-spectrum.mp3'), cover: mediaUrl('/images/covers/fly-spectrum.jpg') },
  { title: 'Remember Summer Days', artist: 'Anri', src: mediaUrl('/audio/remember-summer-days.mp3'), cover: mediaUrl('/images/covers/remember-summer-day.jpg') },
  { title: 'Sunset Road', artist: 'Reina', src: mediaUrl('/audio/sunset-road.mp3'), cover: mediaUrl('/images/covers/sunset-road.jpg') },
  { title: 'Summertime', artist: 'Cinnamons × Evening Cinema', src: mediaUrl('/audio/summertime.mp3'), cover: mediaUrl('/images/covers/summertime.jpg') },
]

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false)
  const [trackIdx, setTrackIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const frameRef = useRef<number>(0)

  // Setup audio analyser for visualizer
  const setupAnalyser = useCallback(() => {
    if (analyserRef.current || !audioRef.current) return
    try {
      const ctx = new AudioContext()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      const source = ctx.createMediaElementSource(audioRef.current)
      source.connect(analyser)
      analyser.connect(ctx.destination)
      analyserRef.current = analyser
      audioCtxRef.current = ctx
    } catch { /* Audio API not available */ }
  }, [])

  // Visualizer draw loop
  useEffect(() => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) return
    const ctx = canvas.getContext('2d')!
    const data = new Uint8Array(analyser.frequencyBinCount)
    const draw = () => {
      analyser.getByteFrequencyData(data)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const barCount = 24
      const barW = canvas.width / barCount - 2
      for (let i = 0; i < barCount; i++) {
        const val = data[i] || 0
        const barH = (val / 255) * canvas.height * 0.8
        const x = i * (barW + 2)
        const y = canvas.height - barH
        const gradient = ctx.createLinearGradient(x, y, x, canvas.height)
        gradient.addColorStop(0, 'rgba(232,130,155,0.8)')
        gradient.addColorStop(1, 'rgba(196,181,253,0.3)')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(x, y, barW, barH, 2)
        ctx.fill()
      }
      frameRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frameRef.current)
  }, [playing])

  const track = TRACKS[trackIdx]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.src = track.src
    audio.load()
    const onLoaded = () => setDuration(audio.duration)
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100)
    }
    const onEnded = () => { setPlaying(false); setProgress(0); setCurrentTime(0) }
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
    }
  }, [trackIdx])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      setupAnalyser()
      if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume()
      audio.play().catch(() => setPlaying(false))
    } else audio.pause()
  }, [playing, setupAnalyser])

  const nextTrack = () => { setPlaying(false); setTrackIdx((trackIdx + 1) % TRACKS.length); setProgress(0); setCurrentTime(0) }
  const prevTrack = () => {
    setPlaying(false)
    if (currentTime > 3) { if (audioRef.current) audioRef.current.currentTime = 0; setProgress(0); setCurrentTime(0) }
    else { setTrackIdx((trackIdx - 1 + TRACKS.length) % TRACKS.length); setProgress(0); setCurrentTime(0) }
  }

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60); const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, height: '100%',
      background: 'linear-gradient(180deg, rgba(232,130,155,0.03) 0%, transparent 100%)' }}>
      <audio ref={audioRef} preload="metadata" crossOrigin="anonymous" />
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--color-text-muted)' }}>Now Playing</div>

      {/* Album art */}
      <div style={{ width: 120, height: 120, borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
        <img src={track.cover} alt={track.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { (e.target as HTMLImageElement).src = '/images/covers/chopin.jpg' }} />
        {/* Visualizer overlay */}
        <canvas ref={canvasRef} width={120} height={120} style={{
          position: 'absolute', inset: 0, opacity: playing ? 0.7 : 0,
          transition: 'opacity 0.3s',
        }} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{track.title}</div>
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 1 }}>{track.artist}</div>
      </div>

      {/* Progress */}
      <div style={{ width: '100%' }}>
        <div className="app-music-progress"><div className="app-music-progress-fill" style={{ width: `${progress}%` }} /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, fontSize: 10, color: 'var(--color-text-muted)' }}>
          <span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={prevTrack} style={ctrlBtn}>|</button>
        <button onClick={() => setPlaying(!playing)} style={{ ...ctrlBtn, width: 44, height: 44, background: 'var(--color-sakura)', color: 'white', fontSize: 16, fontWeight: 700,
          boxShadow: '0 4px 20px rgba(232,130,155,0.3)' }}>{playing ? '||' : '>'}</button>
        <button onClick={nextTrack} style={ctrlBtn}>|</button>
      </div>

      {/* Playlist */}
      <div style={{ width: '100%', marginTop: 'auto', overflow: 'auto', flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 2 }}>Playlist ({TRACKS.length})</div>
        {TRACKS.map((t, i) => (
          <div key={i} onClick={() => { setTrackIdx(i); setProgress(0); setCurrentTime(0); setPlaying(true) }}
            style={{ padding: '5px 8px', borderRadius: 7, cursor: 'pointer',
              background: i === trackIdx ? 'rgba(232,130,155,0.08)' : 'transparent',
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, transition: 'background 0.15s' }}>
            <div style={{ width: 28, height: 28, borderRadius: 5, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.04)' }}>
              <img src={t.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: i === trackIdx ? 700 : 500, color: i === trackIdx ? 'var(--color-sakura)' : 'var(--color-text-secondary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {i === trackIdx && playing ? '> ' : ''}{t.title}
              </div>
              <div style={{ fontSize: 9, color: 'var(--color-text-muted)', opacity: 0.6 }}>{t.artist}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const ctrlBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: '50%',
  background: 'rgba(232,130,155,0.06)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 13, color: 'var(--color-text-secondary)',
  border: '1px solid rgba(255,255,255,0.06)',
}
