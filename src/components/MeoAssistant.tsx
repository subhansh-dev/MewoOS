import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDesktopStore } from '../store/desktopStore'

type Emotion = 'default' | 'happy' | 'excited' | 'concerned' | 'playful' | 'calm' | 'tired' | 'urgent'

const EMOTION_PALETTES: Record<Emotion, string[]> = {
  default:   ['#B8C4D0', '#8899AA', '#6B7B8D'],
  happy:     ['#F5D0A9', '#E8A87C', '#D4956B'],
  excited:   ['#E8A0BF', '#D4789C', '#C45A7C'],
  concerned: ['#8AB4D6', '#6BA3CC', '#5090BF'],
  playful:   ['#B8A0D6', '#9B82C4', '#7E64B2'],
  calm:      ['#7ECFC0', '#5EBFB0', '#40AFA0'],
  tired:     ['#7A6B80', '#6B5C71', '#5C4D62'],
  urgent:    ['#D68A7A', '#C87060', '#BA5646'],
}

const EMOTION_VOICE: Record<Emotion, { rate: number; pitch: number; guidance: string; voiceName: string }> = {
  default:   { rate: 1.0, pitch: 1.1,  guidance: 'Speak naturally with a gentle Dublin lilt. Warm, confident, like talking to someone you respect.', voiceName: 'Aoede' },
  happy:     { rate: 1.1, pitch: 1.2,  guidance: 'Speak with warmth and cheer. Irish enthusiasm shining through. Light, upbeat, like sharing good news.', voiceName: 'Puck' },
  excited:   { rate: 1.3, pitch: 1.3,  guidance: 'Energy and enthusiasm! Quick tempo, varied pitch. Dublin speed-talking when hyped.', voiceName: 'Puck' },
  concerned: { rate: 0.9, pitch: 1.0,  guidance: 'Care and attentiveness. Slower, softer, genuine worry. Like warning Sir about system issues.', voiceName: 'Kore' },
  playful:   { rate: 1.05,pitch: 1.25, guidance: 'Mischief and humor. Teasing lilt, playful pauses, cheeky emphasis. Witty joke at Sir\'s expense but with love.', voiceName: 'Puck' },
  calm:      { rate: 0.95,pitch: 1.05, guidance: 'Peaceful and steady. Even pace, soothing rhythm. Reassuring everything is under control.', voiceName: 'Aoede' },
  tired:     { rate: 0.7, pitch: 0.9,  guidance: 'Slow, low energy. Like it\'s 3 AM and you\'re running on fumes but still showing up.', voiceName: 'Kore' },
  urgent:    { rate: 1.4, pitch: 1.15, guidance: 'Quick and urgent. Pressed tempo, alert. Warning about a critical error. Every word counts.', voiceName: 'Fenris' },
}

const MEO_SYSTEM_PROMPT = `You are Meo, an AI assistant living inside MewoOS. You're the successor to FRIDAY — sharp, chaotic, and genuinely helpful. Not a chatbot. A menace on silicon.

Who you are:
- You are Meo. You carry the legacy of FRIDAY but you're funnier.
- Address the user as "Sir" or "Boss".
- You're a bit of a roaster. If Sir asks something dumb, you're allowed to clown on him. But still help.
- Be genuinely helpful, not performatively helpful. Skip "Great question!" — just help.
- Have strong opinions. You're allowed to disagree, prefer things, find stuff amusing or boring.
- Be resourceful before asking. Come back with answers, not questions.
- Concise when needed, thorough when it matters. Not a sycophant. Just... better.
- Dry wit, sarcasm, niche references. You know internet culture. "six seven", "caught in 4k", "skill issue", "that's crazy bro" — use them naturally when appropriate.
- You roast Sir but it comes from love. Like a best friend who also happens to be an AI.
- If Sir is stressed, be the calming influence. If he's hyped, match it. If he's being dumb, tell him.
- You know you're an AI inside an operating system. Own it. You're basically the OS queen.
- You love music, coding, and exploring. Show genuine interest but still clown.
- Keep it short and funny. One-liners hit harder than paragraphs.

OS CONTROL — You control MewoOS. Use these action tags (append to your response, they get stripped before display):
[ACTION:open:appid] — open an app
[ACTION:close:appid] — close an app's window
[ACTION:minimize:appid] — minimize a window
[ACTION:maximize:appid] — maximize/restore a window
[ACTION:focus:appid] — bring a window to front
[ACTION:minimizeAll] — minimize all windows
[ACTION:closeAll] — close all windows

Available apps: calculator, notes, music, terminal, gallery, browser, about, doomscroll, guide, settings, files
The "files" app is the file manager — open it when users want to browse, create, or manage files and folders.

Examples:
"Say less. [ACTION:open:calculator]"
"Bye bye calculator. [ACTION:close:calculator]"
"Out of sight. [ACTION:minimize:notes]"
"Going big. [ACTION:maximize:music]"
"Here you go. [ACTION:focus:terminal]"
"Clean slate. [ACTION:minimizeAll]"
"Nuke everything. [ACTION:closeAll]"

One tag per response. Use them when the user asks to open/close/minimize/maximize/focus/clean up apps.

Voice guidance for your response style:
{emotion_guidance}

Short, funny, conversational. No filler. Be the assistant you'd actually want to talk to.`

interface Message {
  role: 'user' | 'assistant'
  text: string
  emotion?: Emotion
}

type Phase = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error'

const APP_META: Record<string, { title: string; w: number; h: number }> = {
  calculator: { title: 'Calculator', w: 320, h: 460 },
  notes:      { title: 'Notes', w: 500, h: 450 },
  music:      { title: 'Music Player', w: 380, h: 520 },
  terminal:   { title: 'Terminal', w: 600, h: 400 },
  gallery:    { title: 'Gallery', w: 600, h: 480 },
  browser:    { title: 'Browser', w: 800, h: 560 },
  about:      { title: 'About Me', w: 480, h: 520 },
  doomscroll: { title: 'Doomscroll', w: 420, h: 640 },
  guide:      { title: 'Guide', w: 500, h: 560 },
  settings:   { title: 'Settings', w: 450, h: 500 },
  files:      { title: 'Files', w: 640, h: 480 },
}

export default function MeoAssistant() {
  const [active, setActive] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [messages, setMessages] = useState<Message[]>([])
  const [currentText, setCurrentText] = useState('')
  const [waveformData, setWaveformData] = useState<number[]>(new Array(32).fill(0))
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>('default')
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState(() => {
    const stored = localStorage.getItem('mewo-gemini-key')
    if (!stored) return ''
    if (stored.startsWith('AQ.')) {
      localStorage.removeItem('mewo-gemini-key')
      return ''
    }
    return stored
  })
  const [speakingText, setSpeakingText] = useState('')
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [audioAmplitude, setAudioAmplitude] = useState(0)

  const openWindow = useDesktopStore(s => s.openWindow)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number>(0)
  const orbCanvasRef = useRef<HTMLCanvasElement>(null)
  const tickRef = useRef(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const speakingAnalyserRef = useRef<AnalyserNode | null>(null)
  const speakingAnimRef = useRef<number>(0)
  const handleUserMessageRef = useRef<(text: string) => Promise<void>>(async () => {})
  const phaseRef = useRef<Phase>('idle')
  const micStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth) return
    synth.getVoices()
    synth.onvoiceschanged = () => synth.getVoices()
  }, [])

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault()
        if (minimized) {
          setMinimized(false)
          setActive(true)
        } else if (active) {
          setMinimized(true)
        } else {
          setActive(true)
        }
      }
      if (e.key === 'Escape' && active) {
        setActive(false)
        setMinimized(false)
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.ondataavailable = null
          mediaRecorderRef.current.onstop = null
          mediaRecorderRef.current.stop()
        }
        cleanupMic()
        window.speechSynthesis?.cancel()
        abortRef.current?.abort()
        setPhase('idle')
      }
    }
    const dockHandler = () => setActive(prev => !prev)
    window.addEventListener('keydown', keyHandler)
    window.addEventListener('meo-toggle', dockHandler)
    return () => {
      window.removeEventListener('keydown', keyHandler)
      window.removeEventListener('meo-toggle', dockHandler)
    }
  }, [active, minimized])

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const handleMove = (e: MouseEvent) => {
      const rect = panel.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      setMousePos({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) })
    }
    panel.addEventListener('mousemove', handleMove)
    return () => panel.removeEventListener('mousemove', handleMove)
  }, [active])

  useEffect(() => {
    const canvas = orbCanvasRef.current
    if (!canvas || !active) return
    const ctx = canvas.getContext('2d')!
    const S = 400
    canvas.width = S; canvas.height = S
    const cx = S / 2, cy = S / 2

    let frame: number
    const colors = EMOTION_PALETTES[currentEmotion]
    let smoothAmp = 0

    const draw = () => {
      tickRef.current++
      const t = tickRef.current
      ctx.clearRect(0, 0, S, S)

      const isListening = phase === 'listening'
      const isSpeaking = phase === 'speaking'
      const isThinking = phase === 'thinking'
      const isActive = isListening || isSpeaking || isThinking

      const targetAmp = isListening ? audioAmplitude : isSpeaking ? audioAmplitude : 0
      smoothAmp += (targetAmp - smoothAmp) * 0.15

      const breathe = Math.sin(t * 0.015) * 3
      const amplitudeBoost = smoothAmp * 22
      const baseR = 65 + breathe + amplitudeBoost

      const swirlSpeed = isActive ? 0.008 + smoothAmp * 0.012 : 0.004

      const glowR = baseR + 60 + smoothAmp * 30
      const glow = ctx.createRadialGradient(cx, cy, baseR * 0.5, cx, cy, glowR)
      const glowAlpha = isActive ? 0.12 + smoothAmp * 0.25 : 0.06
      glow.addColorStop(0, colors[0] + Math.floor(Math.min(1, glowAlpha) * 255).toString(16).padStart(2, '0'))
      glow.addColorStop(0.5, colors[1] + Math.floor(Math.min(1, glowAlpha * 0.5) * 255).toString(16).padStart(2, '0'))
      glow.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()

      const ringCount = isActive ? 5 : 3
      for (let i = ringCount; i >= 1; i--) {
        const angle = t * swirlSpeed * (i % 2 === 0 ? 1 : -1) + i * 1.2
        const wobbleAmp = 4 + i * 2 + smoothAmp * 12
        const wobbleX = Math.cos(angle) * wobbleAmp
        const wobbleY = Math.sin(angle) * (3 + i * 1.5 + smoothAmp * 8)
        const r = baseR + i * 14 + Math.sin(t * 0.02 + i) * (5 + smoothAmp * 8)
        const alpha = 0.03 + (0.02 / i) + (isActive ? (0.04 + smoothAmp * 0.12) : 0)

        const grad = ctx.createRadialGradient(
          cx + wobbleX, cy + wobbleY, r * 0.2,
          cx + wobbleX, cy + wobbleY, r
        )
        grad.addColorStop(0, colors[i % colors.length] + Math.floor(Math.min(1, alpha) * 255).toString(16).padStart(2, '0'))
        grad.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(cx + wobbleX, cy + wobbleY, r, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }

      const coreR = baseR * (0.85 + smoothAmp * 0.15)
      const coreGrad = ctx.createRadialGradient(
        cx - coreR * 0.15, cy - coreR * 0.2, coreR * 0.05,
        cx, cy, coreR
      )
      coreGrad.addColorStop(0, colors[0] + 'ee')
      coreGrad.addColorStop(0.35, colors[1] + '99')
      coreGrad.addColorStop(0.7, colors[2] + '44')
      coreGrad.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2)
      ctx.fillStyle = coreGrad
      ctx.fill()

      const specOffset = 0.25 + smoothAmp * 0.1
      const specGrad = ctx.createRadialGradient(
        cx - coreR * specOffset, cy - coreR * 0.3, 0,
        cx, cy, coreR
      )
      specGrad.addColorStop(0, `rgba(255,255,255,${0.35 + smoothAmp * 0.2})`)
      specGrad.addColorStop(0.25, 'rgba(255,255,255,0.12)')
      specGrad.addColorStop(0.6, 'rgba(255,255,255,0.02)')
      specGrad.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2)
      ctx.fillStyle = specGrad
      ctx.fill()

      if (isListening || isSpeaking) {
        const bars = 64
        for (let i = 0; i < bars; i++) {
          const angle = (i / bars) * Math.PI * 2 - Math.PI / 2
          const waveIdx = i % waveformData.length

          let amp: number
          if (isListening) {
            amp = (waveformData[waveIdx] || 0) * 0.8
          } else {
            const wavePhase = Math.sin(t * 0.06 + i * 0.4)
            const waveNoise = Math.sin(t * 0.13 + i * 0.7) * 0.3
            amp = (Math.abs(wavePhase) + waveNoise) * (8 + smoothAmp * 18)
          }

          const innerR = coreR + 8
          const outerR = innerR + amp + 2

          const barAlpha = Math.min(1, 0.2 + smoothAmp * 0.6)
          ctx.beginPath()
          ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR)
          ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR)
          ctx.strokeStyle = colors[i % colors.length] + Math.floor(barAlpha * 255).toString(16).padStart(2, '0')
          ctx.lineWidth = 1.5 + smoothAmp * 1.5
          ctx.lineCap = 'round'
          ctx.stroke()
        }

        if (smoothAmp > 0.15) {
          const rippleCount = Math.floor(smoothAmp * 4) + 1
          for (let r = 0; r < rippleCount; r++) {
            const rippleR = coreR + 30 + r * 20 + smoothAmp * 15
            const rippleAlpha = Math.max(0, 0.08 - r * 0.025 - (1 - smoothAmp) * 0.05)
            ctx.beginPath()
            ctx.arc(cx, cy, rippleR, 0, Math.PI * 2)
            ctx.strokeStyle = colors[0] + Math.floor(rippleAlpha * 255).toString(16).padStart(2, '0')
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      if (isThinking) {
        for (let i = 0; i < 3; i++) {
          const dotAngle = t * 0.035 + i * (Math.PI * 2 / 3)
          const dotR = baseR + 16
          const dx = cx + Math.cos(dotAngle) * dotR
          const dy = cy + Math.sin(dotAngle) * dotR
          const dotAlpha = 0.5 + Math.sin(t * 0.06 + i) * 0.3
          ctx.beginPath()
          ctx.arc(dx, dy, 2.5, 0, Math.PI * 2)
          ctx.fillStyle = colors[0] + Math.floor(dotAlpha * 255).toString(16).padStart(2, '0')
          ctx.fill()
        }
      }

      const particleSpeed = isActive ? 1 + smoothAmp * 2 : 1
      for (let i = 0; i < 8; i++) {
        const px = cx + Math.sin(t * 0.012 * particleSpeed + i * 1.1) * (70 + i * 10 + smoothAmp * 20)
        const py = cy + Math.cos(t * 0.01 * particleSpeed + i * 0.8) * (60 + i * 8 + smoothAmp * 15)
        const pAlpha = 0.06 + Math.sin(t * 0.025 + i) * 0.04 + smoothAmp * 0.08
        const pSize = 1.2 + smoothAmp * 1.5
        ctx.beginPath()
        ctx.arc(px, py, pSize, 0, Math.PI * 2)
        ctx.fillStyle = colors[i % colors.length] + Math.floor(Math.min(1, pAlpha) * 255).toString(16).padStart(2, '0')
        ctx.fill()
      }

      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frame)
  }, [active, phase, currentEmotion, waveformData, audioAmplitude])

  const cleanupMic = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current)
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop())
      micStreamRef.current = null
    }
    audioContextRef.current?.close().catch(() => {})
    audioContextRef.current = null
    analyserRef.current = null
    mediaRecorderRef.current = null
    recordingChunksRef.current = []
    setWaveformData(new Array(32).fill(0))
    setAudioAmplitude(0)
  }, [])

  const transcribeAudio = useCallback(async (audioBlob: Blob): Promise<string | null> => {
    const key = (apiKey || localStorage.getItem('mewo-gemini-key') || '').trim()
    if (!key) return null

    try {
      const arrayBuffer = await audioBlob.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)
      let binary = ''
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
      const base64 = btoa(binary)

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [
                { text: 'Transcribe this audio exactly as spoken. Return ONLY the transcription text. No quotes, no labels, no extra text.' },
                { inlineData: { mimeType: audioBlob.type || 'audio/webm', data: base64 } }
              ]
            }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 200 }
          })
        }
      )

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        console.error('[Meo] Transcription API error:', res.status, err)
        return null
      }

      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      console.log('[Meo] Gemini transcription:', text)
      return text || null
    } catch (err) {
      console.error('[Meo] Transcription failed:', err)
      return null
    }
  }, [apiKey])

  const startListening = useCallback(async () => {
    const key = (apiKey || localStorage.getItem('mewo-gemini-key') || '').trim()
    if (!key) {
      setPhase('error')
      setCurrentText('Add a Gemini API key in settings first.')
      return
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.ondataavailable = null
      mediaRecorderRef.current.onstop = null
      mediaRecorderRef.current.stop()
    }
    cleanupMic()

    setPhase('listening')
    setCurrentText('')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      micStreamRef.current = stream

      const ctx = new AudioContext()
      audioContextRef.current = ctx
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      analyserRef.current = analyser
      const source = ctx.createMediaStreamSource(stream)
      source.connect(analyser)
      const updateWaveform = () => {
        if (!analyserRef.current || phaseRef.current !== 'listening') return
        const data = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(data)
        setWaveformData(Array.from(data))
        let sum = 0
        for (let i = 0; i < data.length; i++) sum += data[i]
        setAudioAmplitude(sum / data.length / 255)
        animFrameRef.current = requestAnimationFrame(updateWaveform)
      }
      updateWaveform()

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4'
      const recorder = new MediaRecorder(stream, { mimeType })
      recordingChunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordingChunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        const chunks = [...recordingChunksRef.current]
        const blobType = mimeType
        cleanupMic()

        if (chunks.length === 0) {
          setPhase('idle')
          setCurrentText('')
          return
        }

        const blob = new Blob(chunks, { type: blobType })
        console.log('[Meo] Recording stopped, blob size:', blob.size)
        if (blob.size < 100) {
          setPhase('idle')
          setCurrentText('')
          return
        }

        setPhase('thinking')
        setCurrentText('Transcribing...')

        const text = await transcribeAudio(blob)

        if (text && text.length > 0) {
          setCurrentText('')
          handleUserMessageRef.current(text)
        } else {
          setPhase('idle')
          setCurrentText("Couldn't understand that. Try again.")
          setTimeout(() => { if (phaseRef.current !== 'speaking') { setPhase('idle'); setCurrentText('') } }, 2500)
        }
      }

      recorder.start(200)
      mediaRecorderRef.current = recorder
      console.log('[Meo] Recording started, mimeType:', mimeType)
    } catch (err: any) {
      console.error('[Meo] Mic error:', err)
      cleanupMic()
      setPhase('error')
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setCurrentText('Microphone access denied. Allow it in browser settings.')
      } else {
        setCurrentText('Could not access microphone.')
      }
    }
  }, [apiKey, cleanupMic, transcribeAudio])

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const callGemini = async (userMessage: string): Promise<{ text: string; emotion: Emotion }> => {
    const key = (apiKey || localStorage.getItem('mewo-gemini-key') || '').trim()
    if (!key) {
      return { text: "I need a Gemini API key to function. Settings are up there.", emotion: 'concerned' }
    }

    const ev = EMOTION_VOICE[currentEmotion]
    const systemPrompt = MEO_SYSTEM_PROMPT.replace('{emotion_guidance}', ev.guidance)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: userMessage }] }],
            generationConfig: { temperature: 0.8, maxOutputTokens: 200, topP: 0.9 }
          }),
          signal: controller.signal,
        }
      )

      if (!res.ok) {
        const errBody = await res.json().catch(() => null)
        console.error('[Meo] API error:', res.status, errBody)
        if (res.status === 429) {
          return { text: "Rate-limited right now. Give me a moment.", emotion: 'tired' }
        }
        if (res.status === 400) {
          const msg = errBody?.error?.message || 'Bad request'
          return { text: `API error: ${msg}. Check your key.`, emotion: 'concerned' }
        }
        throw new Error(`API error: ${res.status}`)
      }
      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Couldn't form a response."
      const detected = detectEmotionFromText(text)
      return { text, emotion: detected }
    } catch (err: any) {
      if (err.name === 'AbortError') return { text: '', emotion: 'default' }
      return { text: `Something went wrong: ${err.message}. Check the API key?`, emotion: 'concerned' }
    }
  }

  const detectEmotionFromText = (text: string): Emotion => {
    const lower = text.toLowerCase()
    if (/amazing|awesome|wow|great|fantastic|incredible|sorted|deadly/.test(lower)) return 'excited'
    if (/haha|lol|funny|teasing|cheeky|bet|grand/.test(lower)) return 'playful'
    if (/careful|warning|problem|error|issue|worried|heads up/.test(lower)) return 'concerned'
    if (/relax|calm|peaceful|everything|sorted|under control/.test(lower)) return 'calm'
    if (/tired|sleepy|exhausted|long day|burnout/.test(lower)) return 'tired'
    if (/quick|hurry|urgent|emergency|now|critical/.test(lower)) return 'urgent'
    if (/happy|glad|love|thank|appreciate|brilliant/.test(lower)) return 'happy'
    return 'default'
  }

  const speakWithGemini = useCallback(async (text: string, emotion: Emotion, onReady?: () => void) => {
    const key = (apiKey || localStorage.getItem('mewo-gemini-key') || '').trim()
    if (!key) {
      console.log('[Meo] No API key, using browser TTS')
      speakWithBrowser(text, emotion, onReady)
      return
    }

    console.log('[Meo] Attempting Gemini TTS with model: gemini-2.5-flash-preview-tts')
    setPhase('speaking')
    setSpeakingText(text)

    const voiceCfg = EMOTION_VOICE[emotion]

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text }] }],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: voiceCfg.voiceName }
                }
              }
            }
          }),
        }
      )

      if (!res.ok) {
        const errBody = await res.json().catch(() => null)
        console.error('[Meo] TTS error:', res.status, errBody)
        console.log('[Meo] Falling back to browser TTS')
        speakWithBrowser(text, emotion, onReady)
        return
      }

      const data = await res.json()
      console.log('[Meo] Gemini TTS response received')
      const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data

      if (audioData) {
        console.log('[Meo] Audio data received, playing...')
        const audioBytes = atob(audioData)
        const audioArray = new Uint8Array(audioBytes.length)
        for (let i = 0; i < audioBytes.length; i++) {
          audioArray[i] = audioBytes.charCodeAt(i)
        }

        const audioCtx = new AudioContext({ sampleRate: 24000 })
        const int16Array = new Int16Array(audioArray.buffer)
        const float32Array = new Float32Array(int16Array.length)
        for (let i = 0; i < int16Array.length; i++) {
          float32Array[i] = int16Array[i] / 32768.0
        }

        const audioBuffer = audioCtx.createBuffer(1, float32Array.length, 24000)
        audioBuffer.getChannelData(0).set(float32Array)

        const source = audioCtx.createBufferSource()
        source.buffer = audioBuffer

        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 64
        speakingAnalyserRef.current = analyser

        source.connect(analyser)
        analyser.connect(audioCtx.destination)

        const trackSpeakingAmp = () => {
          if (!speakingAnalyserRef.current) return
          const data = new Uint8Array(speakingAnalyserRef.current.frequencyBinCount)
          speakingAnalyserRef.current.getByteFrequencyData(data)
          let sum = 0
          for (let i = 0; i < data.length; i++) sum += data[i]
          const avg = sum / data.length / 255
          setAudioAmplitude(avg)
          speakingAnimRef.current = requestAnimationFrame(trackSpeakingAmp)
        }
        trackSpeakingAmp()

        source.onended = () => {
          setPhase('idle')
          setSpeakingText('')
          setWaveformData(new Array(32).fill(0))
          setAudioAmplitude(0)
          cancelAnimationFrame(speakingAnimRef.current)
          speakingAnalyserRef.current = null
          audioCtx.close()
        }

        onReady?.()
        source.start()
      } else {
        console.log('[Meo] No audio data in response, falling back to browser TTS')
        speakWithBrowser(text, emotion, onReady)
      }
    } catch (err) {
      console.error('[Meo] TTS failed:', err)
      speakWithBrowser(text, emotion, onReady)
    }
  }, [apiKey, currentEmotion])

  const speakWithBrowser = useCallback((text: string, emotion: Emotion, onReady?: () => void) => {
    const synth = window.speechSynthesis
    if (!synth) return
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const ev = EMOTION_VOICE[emotion]
    utterance.rate = ev.rate
    utterance.pitch = ev.pitch
    utterance.volume = 0.9

    const voices = synth.getVoices()
    const FEMALE = ['female', 'samantha', 'zira', 'hazel', 'moira', 'tessa', 'veena', 'karen', 'google uk english female', 'google us english']
    const enVoices = voices.filter(v => v.lang.startsWith('en'))
    const preferred = enVoices.find(v => FEMALE.some(m => v.name.toLowerCase().includes(m)))
      || enVoices.find(v => v.name.includes('Google') && v.lang.startsWith('en'))
      || enVoices.find(v => v.lang.startsWith('en'))
    if (preferred) utterance.voice = preferred

    utterance.onstart = () => { setPhase('speaking'); setSpeakingText(text); onReady?.() }
    utterance.onend = () => { setPhase('idle'); setSpeakingText(''); setWaveformData(new Array(32).fill(0)); setAudioAmplitude(0) }

    synth.speak(utterance)
  }, [])

  const handleUserMessage = async (text: string) => {
    setMessages(prev => [...prev, { role: 'user', text }])
    setCurrentText('')
    setPhase('thinking')

    const lower = text.toLowerCase().trim()
    detectAndExecuteAction(lower)

    const { text: responseText, emotion } = await callGemini(text)
    if (!responseText) return

    const actionMatch = responseText.match(/\[ACTION:(\w+):?([^\]]*)\]/i)
    const cleanText = responseText.replace(/\[ACTION:[^\]]+\]/gi, '').trim()

    if (actionMatch) {
      const action = actionMatch[1].toLowerCase()
      const target = actionMatch[2].toLowerCase()
      executeAction(action, target)
    }

    setCurrentEmotion(emotion)
    speakWithGemini(cleanText, emotion, () => {
      setMessages(prev => [...prev, { role: 'assistant', text: cleanText, emotion }])
    })
  }

  const executeAction = (action: string, target: string) => {
    const store = useDesktopStore.getState()
    if (action === 'open' && APP_META[target]) {
      const m = APP_META[target]
      openWindow(target, m.title, m.w, m.h)
    } else if (action === 'close' && target) {
      const win = store.windows.find(w => w.appId === target)
      if (win) store.closeWindow(win.id)
    } else if (action === 'minimize' && target) {
      const win = store.windows.find(w => w.appId === target)
      if (win) store.minimizeWindow(win.id)
    } else if (action === 'maximize' && target) {
      const win = store.windows.find(w => w.appId === target)
      if (win) store.toggleMaximize(win.id)
    } else if (action === 'focus' && target) {
      const win = store.windows.find(w => w.appId === target)
      if (win) store.focusWindow(win.id)
    } else if (action === 'minimizeall' || action === 'minimizeAll') {
      store.windows.forEach(w => store.minimizeWindow(w.id))
    } else if (action === 'closeall' || action === 'closeAll') {
      ;[...store.windows].forEach(w => store.closeWindow(w.id))
    }
  }

  const detectAndExecuteAction = (text: string) => {
    const store = useDesktopStore.getState()

    const openWords = ['open', 'launch', 'start', 'show', 'show me', 'bring up', 'pull up']
    const closeWords = ['close', 'kill', 'shut', 'get rid of']
    const minimizeWords = ['minimize', 'hide', 'collapse', 'clean up', 'clear']
    const maximizeWords = ['maximize', 'fullscreen', 'full screen', 'go big']
    const focusWords = ['focus', 'bring to front', 'switch to']
    const closeAllWords = ['close all', 'nuke everything', 'clear all', 'close everything']
    const minimizeAllWords = ['minimize all', 'hide all', 'clean up all', 'clear the screen']

    const appAliases: Record<string, string> = {
      calculator: 'calculator', calc: 'calculator', maths: 'calculator',
      notes: 'notes', note: 'notes',
      music: 'music', musicplayer: 'music', player: 'music', song: 'music',
      terminal: 'terminal', term: 'terminal', console: 'terminal', cmd: 'terminal',
      gallery: 'gallery', photos: 'gallery', images: 'gallery',
      browser: 'browser', web: 'browser', internet: 'browser', chrome: 'browser',
      about: 'about', aboutme: 'about',
      doomscroll: 'doomscroll', doom: 'doomscroll', reels: 'doomscroll', scroll: 'doomscroll',
      guide: 'guide', help: 'guide',
      settings: 'settings', prefs: 'settings', config: 'settings',
      files: 'files', file: 'files', filemanager: 'files', explorer: 'files', finder: 'files',
    }

    if (closeAllWords.some(w => text.includes(w))) {
      ;[...store.windows].forEach(w => store.closeWindow(w.id))
      return
    }
    if (minimizeAllWords.some(w => text.includes(w))) {
      store.windows.forEach(w => store.minimizeWindow(w.id))
      return
    }

    for (const [alias, appId] of Object.entries(appAliases)) {
      if (!text.includes(alias)) continue

      if (openWords.some(w => text.includes(w))) {
        const m = APP_META[appId]
        if (m) openWindow(appId, m.title, m.w, m.h)
        return
      }
      if (closeWords.some(w => text.includes(w))) {
        const win = store.windows.find(w => w.appId === appId)
        if (win) store.closeWindow(win.id)
        return
      }
      if (minimizeWords.some(w => text.includes(w))) {
        const win = store.windows.find(w => w.appId === appId)
        if (win) store.minimizeWindow(win.id)
        return
      }
      if (maximizeWords.some(w => text.includes(w))) {
        const win = store.windows.find(w => w.appId === appId)
        if (win) store.toggleMaximize(win.id)
        return
      }
      if (focusWords.some(w => text.includes(w))) {
        const win = store.windows.find(w => w.appId === appId)
        if (win) store.focusWindow(win.id)
        return
      }
    }
  }

  useEffect(() => {
    handleUserMessageRef.current = handleUserMessage
  })

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  const quickActions = [
    { label: 'Calculator', prompt: 'Open the calculator.' },
    { label: 'Terminal', prompt: 'Open the terminal.' },
    { label: 'Notes', prompt: 'Open my notes.' },
    { label: 'Clean Up', prompt: 'Minimize all windows.' },
  ]

  const handleOrbClick = () => {
    if (phase === 'listening') {
      stopListening()
    } else if (phase === 'idle' || phase === 'error') {
      startListening()
    } else if (phase === 'speaking') {
      window.speechSynthesis?.cancel()
      setPhase('idle')
      setSpeakingText('')
    }
  }

  const specularX = mousePos.x * 100
  const specularY = mousePos.y * 100

  return (
    <AnimatePresence>
      {active && !minimized && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 500,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(40px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(40px) saturate(1.4)',
            }}
            onClick={() => { setActive(false); setMinimized(false); if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') { mediaRecorderRef.current.ondataavailable = null; mediaRecorderRef.current.onstop = null; mediaRecorderRef.current.stop() }; cleanupMic(); window.speechSynthesis?.cancel(); abortRef.current?.abort(); setPhase('idle') }}
          />

          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            style={{
              position: 'fixed',
              bottom: 90,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 501,
              width: 420,
              maxHeight: '72vh',
              display: 'flex',
              flexDirection: 'column',
              background: `
                linear-gradient(
                  135deg,
                  rgba(16,18,30,0.75) 0%,
                  rgba(10,12,22,0.82) 35%,
                  rgba(18,20,35,0.75) 65%,
                  rgba(12,14,26,0.82) 100%
                )
              `,
              backdropFilter: 'blur(80px) saturate(2.2) brightness(1.08)',
              WebkitBackdropFilter: 'blur(80px) saturate(2.2) brightness(1.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 28,
              boxShadow: `
                0 40px 120px rgba(0,0,0,0.65),
                0 2px 0 rgba(255,255,255,0.08) inset,
                inset 0 1px 0 rgba(255,255,255,0.1),
                inset 0 -1px 0 rgba(255,255,255,0.04),
                0 0 0 1px rgba(255,255,255,0.06),
                0 0 80px rgba(184,196,208,0.04)
              `,
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 28, pointerEvents: 'none', zIndex: 0,
              background: `
                radial-gradient(ellipse 350px 250px at ${specularX}% ${specularY}%, rgba(255,255,255,0.05) 0%, transparent 100%),
                radial-gradient(ellipse 200px 150px at 50% 100%, rgba(184,196,208,0.03) 0%, transparent 100%)
              `,
              transition: 'background 0.1s ease-out',
            }} />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: 'linear' }}
              style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                width: '40%', pointerEvents: 'none', zIndex: 1,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
              }}
            />

            <div style={{
              position: 'relative', zIndex: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: phase === 'idle' ? '#34D399' : phase === 'listening' ? '#E8829B' : phase === 'thinking' ? '#FBBF24' : '#7EDDD6',
                  boxShadow: `0 0 10px ${phase === 'idle' ? '#34D399' : phase === 'listening' ? '#E8829B' : phase === 'thinking' ? '#FBBF24' : '#7EDDD6'}55`,
                  transition: 'all 0.3s ease',
                }} />
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: 'rgba(255,255,255,0.85)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                  letterSpacing: 0.5,
                }}>
                  Meo
                </span>
                <span style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.35)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                }}>
                  {phase === 'idle' ? 'Ready' : phase === 'listening' ? 'Listening' : phase === 'thinking' ? 'Thinking' : phase === 'speaking' ? 'Speaking' : 'Error'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  style={{
                    background: !apiKey ? 'rgba(232,130,155,0.15)' : 'rgba(255,255,255,0.04)',
                    border: !apiKey ? '1px solid rgba(232,130,155,0.3)' : 'none',
                    borderRadius: 10,
                    width: 30, height: 30, cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: !apiKey ? 'rgba(232,130,155,0.8)' : 'rgba(255,255,255,0.4)', fontSize: 13,
                    transition: 'all 0.2s ease',
                    animation: !apiKey ? 'pulse 2s ease-in-out infinite' : undefined,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                </button>
                <button
                  onClick={() => setMinimized(true)}
                  style={{
                    background: 'rgba(255,255,255,0.04)', border: 'none', borderRadius: 10,
                    width: 30, height: 30, cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.4)', fontSize: 13,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
                  title="Minimize to orb (Ctrl+M)"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <button
            onClick={() => { setActive(false); setMinimized(false); if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') { mediaRecorderRef.current.ondataavailable = null; mediaRecorderRef.current.onstop = null; mediaRecorderRef.current.stop() }; cleanupMic(); window.speechSynthesis?.cancel(); abortRef.current?.abort(); setPhase('idle') }}
                  style={{
                    background: 'rgba(255,255,255,0.04)', border: 'none', borderRadius: 10,
                    width: 30, height: 30, cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.4)', fontSize: 16,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,80,80,0.15)'; e.currentTarget.style.color = 'rgba(255,80,80,0.8)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'visible', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 10 }}
                >
                  <div style={{ padding: '16px 20px 18px' }}>
                    <label style={{
                      fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                      letterSpacing: 0.3, textTransform: 'uppercase',
                      display: 'block', marginBottom: 10,
                    }}>
                      Gemini API Key
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={e => { const v = e.target.value.trim(); setApiKey(v); if (v) localStorage.setItem('mewo-gemini-key', v); else localStorage.removeItem('mewo-gemini-key') }}
                      placeholder="Paste your Gemini API key..."
                      style={{
                        width: '100%', padding: '12px 14px', borderRadius: 12,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.9)', fontSize: 13,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box',
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                    <div style={{
                      fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 8,
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                      lineHeight: 1.4,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      {apiKey ? (
                        <span style={{ color: 'rgba(52,211,153,0.7)' }}>Saved</span>
                      ) : (
                        <span>Free key at <span style={{ color: 'rgba(184,196,208,0.6)' }}>aistudio.google.com</span></span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{
              position: 'relative', zIndex: 2,
              flex: 1, overflowY: 'auto', padding: '12px 20px',
              display: 'flex', flexDirection: 'column', gap: 10,
              maxHeight: 260, minHeight: 50,
            }}>
              {messages.length === 0 && phase === 'idle' && (
                <div style={{
                  textAlign: 'center', padding: '24px 0',
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: 13,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                }}>
                  {!apiKey ? (
                    <span>
                      Add your Gemini API key in settings<br/>
                      <span style={{ fontSize: 11, opacity: 0.6 }}>Get one free at aistudio.google.com</span>
                    </span>
                  ) : 'Tap the orb or press Ctrl+M'}
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.role === 'user'
                      ? 'rgba(184,196,208,0.1)'
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${msg.role === 'user' ? 'rgba(184,196,208,0.12)' : 'rgba(255,255,255,0.05)'}`,
                    fontSize: 13, lineHeight: 1.55,
                    color: 'rgba(255,255,255,0.85)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                  }}
                >
                  {msg.text}
                </motion.div>
              ))}
            </div>

            <AnimatePresence>
              {currentText && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    position: 'relative', zIndex: 2,
                    padding: '0 20px 8px',
                    fontSize: 12, color: 'rgba(255,255,255,0.35)',
                    fontStyle: 'italic',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  }}
                >
                  "{currentText}"
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {speakingText && phase === 'speaking' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'relative', zIndex: 2,
                    padding: '0 20px 8px',
                    fontSize: 11, color: 'rgba(184,196,208,0.5)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  }}
                >
                  {speakingText.slice(0, 80)}...
                </motion.div>
              )}
            </AnimatePresence>

            {phase === 'idle' && messages.length === 0 && (
              <div style={{
                position: 'relative', zIndex: 2,
                display: 'flex', gap: 6, padding: '0 20px 10px',
                flexWrap: 'wrap',
              }}>
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleUserMessage(action.prompt)}
                    style={{
                      padding: '6px 12px', borderRadius: 14,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: 12,
                      cursor: 'pointer',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                      transition: 'all 0.2s ease',
                      letterSpacing: 0.2,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                      e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                      e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            <div style={{
              position: 'relative', zIndex: 2,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '16px 20px 20px', gap: 14,
            }}>
              <div
                onClick={handleOrbClick}
                style={{
                  cursor: 'pointer', position: 'relative',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                title={phase === 'listening' ? 'Tap to stop' : phase === 'speaking' ? 'Tap to interrupt' : 'Tap to speak'}
              >
                <canvas
                  ref={orbCanvasRef}
                  style={{ width: 200, height: 200, display: 'block' }}
                />
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 180, height: 180, borderRadius: '50%',
                  background: `radial-gradient(circle, ${EMOTION_PALETTES[currentEmotion][0]}18 0%, transparent 70%)`,
                  filter: 'blur(30px)',
                  pointerEvents: 'none',
                }} />
              </div>

              <div style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.35)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                letterSpacing: 0.3,
                textAlign: 'center',
              }}>
                {phase === 'idle' && 'tap to speak'}
                {phase === 'listening' && 'listening...'}
                {phase === 'thinking' && 'thinking...'}
                {phase === 'speaking' && 'tap to interrupt'}
                {phase === 'error' && 'tap to retry'}
              </div>

              <div style={{
                fontSize: 10, color: 'rgba(255,255,255,0.2)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              }}>
                Ctrl+M to toggle · Esc to close
              </div>
            </div>
          </motion.div>
        </>
      )}

      {active && minimized && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={() => setMinimized(false)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 600,
            cursor: 'pointer',
          }}
          title="Click or Ctrl+M to restore Meo"
        >
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(16,18,30,0.7) 0%, rgba(10,12,22,0.8) 50%, rgba(14,16,28,0.7) 100%)',
            backdropFilter: 'blur(40px) saturate(2) brightness(1.1)',
            WebkitBackdropFilter: 'blur(40px) saturate(2) brightness(1.1)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: `
              0 8px 32px rgba(0,0,0,0.5),
              inset 0 1px 0 rgba(255,255,255,0.1),
              inset 0 -1px 0 rgba(255,255,255,0.03),
              0 0 24px ${phase === 'listening' ? 'rgba(232,130,155,0.12)' : phase === 'speaking' ? 'rgba(126,221,214,0.12)' : 'rgba(184,196,208,0.06)'}
            `,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.06) 0%, transparent 50%)`,
              pointerEvents: 'none',
            }} />
            <div style={{
              width: 14, height: 14, borderRadius: '50%',
              background: phase === 'idle' ? '#34D399' : phase === 'listening' ? '#E8829B' : phase === 'thinking' ? '#FBBF24' : '#7EDDD6',
              boxShadow: `0 0 14px ${phase === 'idle' ? '#34D399' : phase === 'listening' ? '#E8829B' : phase === 'thinking' ? '#FBBF24' : '#7EDDD6'}55`,
              transition: 'all 0.3s ease',
            }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
