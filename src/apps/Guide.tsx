import { useState } from 'react'

const sections = [
  {
    title: '🚀 Getting Started',
    items: [
      { label: 'Open Apps', desc: 'Click any icon in the dock at the bottom of the screen, or right-click the desktop for quick access to About Me, Terminal, Notes, and Settings.' },
      { label: 'Move Windows', desc: 'Drag windows by their title bar. Windows snap to screen edges — drag left/right for half-screen, drag to the top to maximize.' },
      { label: 'Resize Windows', desc: 'Grab any edge or corner of a window to resize it.' },
      { label: 'Window Controls', desc: 'Red = close, Yellow = minimize, Green = maximize. Double-click the title bar to toggle maximize.' },
      { label: 'Spotlight Search', desc: 'Press Cmd+K (or Ctrl+K) to open Spotlight. Type to search apps, use arrow keys to navigate, Enter to launch.' },
    ],
  },
  {
    title: '🖥️ Built-in Apps',
    items: [
      { label: 'About Me', desc: 'Profile card with links to GitHub, Discord, email, and portfolio.' },
      { label: 'Terminal', desc: 'A fake shell (mewosh) with 20+ commands. Try `help` to see them all.' },
      { label: 'Notes', desc: 'Quick notepad with auto-save to localStorage and a "✓ Saved" indicator.' },
      { label: 'Calculator', desc: 'Basic calculator with keyboard support. Type numbers and operators directly.' },
      { label: 'Music Player', desc: '27 tracks across anime, jazz, classical, and more. Has a visualizer that reacts to the music.' },
      { label: 'Gallery', desc: '11 images in a grid. Click to select, double-click for fullscreen lightbox with ‹/› navigation.' },
      { label: 'Browser', desc: 'Embedded web browser with proxy support. If a site blocks embedding, try Google Translate or Wayback Machine.' },
      { label: 'Doomscroll', desc: 'TikTok-style vertical video scroller. Scroll/swipe/arrow keys to navigate. Double-click to like with a heart animation.' },
      { label: 'Settings', desc: 'Change accent colors (6 options), background mode (solid/static/live wallpaper), and more.' },
    ],
  },
  {
    title: '💻 Terminal Commands',
    items: [
      { label: 'help', desc: 'Show all available commands.' },
      { label: 'whoami', desc: 'Who is Subhansh?' },
      { label: 'about', desc: 'About MewoOS.' },
      { label: 'skills', desc: 'Technical skills list.' },
      { label: 'projects', desc: 'Projects: RUMI, FRIDAY, Chronovisor, MewoOS.' },
      { label: 'contact', desc: 'Email, GitHub, Discord, Portfolio links.' },
      { label: 'neofetch', desc: 'System info with ASCII art.' },
      { label: 'kawaii', desc: 'Random kaomoji face.' },
      { label: 'date', desc: 'Current date and time.' },
      { label: 'echo [text]', desc: 'Echo text back.' },
      { label: 'clear', desc: 'Clear the terminal.' },
      { label: 'matrix', desc: 'Matrix rain effect.' },
      { label: 'party', desc: 'Disco emoji mode.' },
      { label: 'cat', desc: 'Random ASCII cat.' },
      { label: 'fortune', desc: 'Random fortune/quote.' },
      { label: 'weather', desc: 'Fake weather report for MewoOS City.' },
      { label: 'cowsay [text]', desc: 'A cow says your text.' },
      { label: 'sudo', desc: 'Try it and find out ;)' },
    ],
  },
  {
    title: '🥚 Easter Eggs',
    items: [
      { label: 'Konami Code', desc: 'Press ↑↑↓↓←→←→BA anywhere on the page. Confetti explosion!' },
      { label: 'Rainbow Mode', desc: 'Click the "MewoOS" logo in the top bar 10 times. The top bar turns rainbow for 5 seconds.' },
      { label: 'Desktop Pet', desc: 'A tiny ASCII cat follows your cursor. Click it for a ♡. It falls asleep after 15 seconds of no mouse movement.' },
      { label: 'sudo command', desc: 'Type `sudo` in the terminal for a funny permission denied message.' },
    ],
  },
  {
    title: '🎨 Visual & Audio',
    items: [
      { label: 'Glass Morphism', desc: 'All panels, dock, and windows use glassmorphism with blur, saturation, and subtle borders.' },
      { label: 'Boot Sequence', desc: 'Cinematic boot: logo reveal with blur → "Welcome" fade → terminal with BIOS/kernel/services → particle burst → desktop assembles piece by piece.' },
      { label: 'Boot Chime', desc: 'A C major chord plays when the system boots (Web Audio API).' },
      { label: 'Click Sounds', desc: 'Subtle audio feedback on every button click, dock click, and menu interaction.' },
      { label: 'Cursor Trail', desc: 'Sakura-colored dots follow your mouse with a comet tail effect (canvas-based, no lag).' },
      { label: 'Parallax Background', desc: 'The desktop background, glow orbs, and grid shift slightly as you move your mouse.' },
      { label: 'Launch Ripple', desc: 'A sakura ripple expands from the dock icon when you launch an app.' },
      { label: 'Dock Magnification', desc: 'macOS-style dock magnification — icons scale up based on mouse proximity.' },
      { label: 'Music Visualizer', desc: 'Frequency bars animate over the album art when music is playing.' },
      { label: 'Shimmer Effect', desc: 'Windows have a subtle light sweep animation every 20 seconds.' },
    ],
  },
  {
    title: '⚙️ System Features',
    items: [
      { label: 'Lock Screen', desc: 'After 5 minutes of inactivity, a lock screen appears with the time. Click or press any key to unlock.' },
      { label: 'Window Snapping', desc: 'Drag a window to the left/right edge for half-screen. Drag to the top to maximize.' },
      { label: 'Notifications', desc: 'Toast notifications appear in the top-right when launching apps or completing actions.' },
      { label: 'Accent Colors', desc: '6 accent colors in Settings: Sakura, Miku, Lavender, Mint, Peach, Rose. Transitions are smooth.' },
      { label: 'Wallpapers', desc: '3 modes in Settings: Solid (dark), Static (3 wallpapers), Live (3 video wallpapers with parallax).' },
      { label: 'Context Menu', desc: 'Right-click the desktop for quick access to apps and settings.' },
      { label: 'Persistent State', desc: 'Notes, settings, accent color, and wallpaper choices are saved to localStorage.' },
    ],
  },
  {
    title: '🎵 Music Player Tracks',
    items: [
      { label: 'Anime & Vocaloid', desc: 'Cruel Angel\'s Thesis, Idol (YOASOBI), Kaibutsu, Usseewa (Ado), Night Dancer, Young Girl A, Miku Expo, Renai Circulation, and more.' },
      { label: 'English & Jazz', desc: 'Fly Me to the Moon, Feeling Good, Sway, Until I Found You, Glue Song, and more.' },
      { label: 'Classical', desc: 'Chopin Ballade No.4, Waltz Op.64, Rachmaninoff Piano Concerto No.2, Paganini Caprice No.24.' },
    ],
  },
]

export default function Guide() {
  const [openSection, setOpenSection] = useState<number | null>(0)

  return (
    <div style={{ padding: 20, height: '100%', overflow: 'auto' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 4 }}>
          📖 MewoOS Guide
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          Everything you need to know about MewoOS — features, commands, easter eggs, and more.
        </div>
      </div>

      {sections.map((section, si) => (
        <div key={si} style={{ marginBottom: 8 }}>
          <button
            onClick={() => setOpenSection(openSection === si ? null : si)}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 10,
              background: openSection === si ? 'rgba(232,130,155,0.08)' : 'rgba(255,255,255,0.02)',
              border: '1px solid ' + (openSection === si ? 'rgba(232,130,155,0.15)' : 'rgba(255,255,255,0.04)'),
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              color: openSection === si ? 'var(--color-sakura)' : 'var(--color-text-primary)',
              fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-sans)',
              transition: 'all 0.15s',
            }}
          >
            <span>{section.title}</span>
            <span style={{ fontSize: 12, opacity: 0.5 }}>{openSection === si ? '−' : '+'}</span>
          </button>

          {openSection === si && (
            <div style={{
              marginTop: 4, padding: '8px 6px',
              background: 'rgba(0,0,0,0.15)', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.03)',
            }}>
              {section.items.map((item, ii) => (
                <div key={ii} style={{
                  padding: '8px 10px', borderRadius: 8,
                  marginBottom: ii < section.items.length - 1 ? 2 : 0,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-sakura)', marginBottom: 2 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div style={{
        marginTop: 20, padding: 14, borderRadius: 12,
        background: 'rgba(232,130,155,0.03)', border: '1px solid rgba(255,255,255,0.04)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
          Made by Subhansh and caffeine for the Hack Club Stardance Jam
        </div>
      </div>
    </div>
  )
}
