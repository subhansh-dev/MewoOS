import { useState, useEffect, useCallback } from 'react'
import { useDesktopStore } from '../store/desktopStore'

type AppCategory = 'all' | 'productivity' | 'creative' | 'games' | 'utilities'

interface StoreApp {
  id: string
  name: string
  category: AppCategory
  desc: string
  rating: number
  downloads: string
  size: string
  installable: boolean
  unavailable: boolean
  opensApp?: string
  gradient: string
  accentColor: string
}

const storeApps: StoreApp[] = [
  // --- Core (already in dock, always "installed") ---
  { id: 'notes', name: 'Notes', category: 'productivity', desc: 'Advanced note-taking with markdown support and folders', rating: 4.8, downloads: '12.4K', size: '0.3 MB', installable: false, unavailable: false, opensApp: 'notes', gradient: 'linear-gradient(135deg, #FDBA74, #FB923C)', accentColor: '#FDBA74' },
  { id: 'calculator', name: 'Calculator', category: 'utilities', desc: 'Scientific calculator with unit conversion', rating: 4.6, downloads: '8.2K', size: '0.1 MB', installable: false, unavailable: false, opensApp: 'calculator', gradient: 'linear-gradient(135deg, #C4B5FD, #A78BFA)', accentColor: '#C4B5FD' },
  { id: 'terminal', name: 'Terminal', category: 'utilities', desc: 'Enhanced terminal with syntax highlighting', rating: 4.9, downloads: '15.1K', size: '0.2 MB', installable: false, unavailable: false, opensApp: 'terminal', gradient: 'linear-gradient(135deg, #1a1a2e, #0d0d1a)', accentColor: '#7EDDD6' },
  { id: 'music', name: 'Music', category: 'creative', desc: 'Full music player with playlist and visualizer', rating: 4.7, downloads: '6.8K', size: '1.2 MB', installable: false, unavailable: false, opensApp: 'music', gradient: 'linear-gradient(135deg, #E8829B, #8B2252)', accentColor: '#E8829B' },

  // --- Installable (can be installed, adds to dock) ---
  { id: 'weather', name: 'Weather', category: 'utilities', desc: 'Beautiful weather with animated backgrounds', rating: 4.7, downloads: '11.2K', size: '0.6 MB', installable: true, unavailable: false, gradient: 'linear-gradient(135deg, #93C5FD, #3B82F6)', accentColor: '#93C5FD' },
  { id: 'kanban', name: 'Kanban Board', category: 'productivity', desc: 'Drag-and-drop task management', rating: 4.8, downloads: '8.5K', size: '0.3 MB', installable: true, unavailable: false, gradient: 'linear-gradient(135deg, #86EFAC, #4ADE80)', accentColor: '#86EFAC' },
  { id: 'timer', name: 'Focus Timer', category: 'productivity', desc: 'Pomodoro timer with ambient sounds', rating: 4.6, downloads: '6.1K', size: '0.2 MB', installable: true, unavailable: false, gradient: 'linear-gradient(135deg, #FDBA74, #F97316)', accentColor: '#FDBA74' },
  { id: 'typing-speed', name: 'Type Racer', category: 'productivity', desc: 'Test your typing speed and accuracy', rating: 4.7, downloads: '14.2K', size: '0.2 MB', installable: true, unavailable: false, gradient: 'linear-gradient(135deg, #C4B5FD, #8B5CF6)', accentColor: '#C4B5FD' },
  { id: 'paint-studio', name: 'Paint Studio', category: 'creative', desc: 'Painting app with layers and brushes', rating: 4.5, downloads: '9.3K', size: '0.8 MB', installable: true, unavailable: false, gradient: 'linear-gradient(135deg, #86EFAC, #22C55E)', accentColor: '#86EFAC' },
  { id: 'image-editor', name: 'Image Editor', category: 'creative', desc: 'Crop, resize, filters for images', rating: 4.4, downloads: '5.7K', size: '0.7 MB', installable: true, unavailable: false, gradient: 'linear-gradient(135deg, #E8829B, #EC4899)', accentColor: '#E8829B' },

  // --- Unavailable (coming soon) ---
  { id: 'flappy-cat', name: 'Flappy Cat', category: 'games', desc: 'Help the pixel cat fly through pipes', rating: 4.3, downloads: '5.1K', size: '0.4 MB', installable: false, unavailable: true, gradient: 'linear-gradient(135deg, #E8829B, #F472B6)', accentColor: '#E8829B' },
  { id: 'snake', name: 'Snake', category: 'games', desc: 'Classic snake with modern graphics', rating: 4.4, downloads: '7.6K', size: '0.2 MB', installable: false, unavailable: true, gradient: 'linear-gradient(135deg, #86EFAC, #34D399)', accentColor: '#86EFAC' },
  { id: 'sudoku', name: 'Sudoku', category: 'games', desc: 'Puzzle game with 4 difficulty levels', rating: 4.2, downloads: '3.2K', size: '0.1 MB', installable: false, unavailable: true, gradient: 'linear-gradient(135deg, #C4B5FD, #8B5CF6)', accentColor: '#C4B5FD' },
  { id: 'markdown', name: 'Markdown', category: 'productivity', desc: 'Live markdown preview with export', rating: 4.5, downloads: '4.9K', size: '0.2 MB', installable: false, unavailable: true, gradient: 'linear-gradient(135deg, #C4B5FD, #A78BFA)', accentColor: '#C4B5FD' },
  { id: 'color-lab', name: 'Color Lab', category: 'creative', desc: 'Generate and save color palettes', rating: 4.6, downloads: '3.8K', size: '0.1 MB', installable: false, unavailable: true, gradient: 'linear-gradient(135deg, #FDBA74, #F59E0B)', accentColor: '#FDBA74' },
]

const categories: { id: AppCategory; label: string }[] = [
  { id: 'all', label: 'All Apps' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'creative', label: 'Creative' },
  { id: 'games', label: 'Games' },
  { id: 'utilities', label: 'Utilities' },
]

// Premium dock-style icons (56x56 with gradients) — matches the Dock component
const DOCK_ICONS: Record<string, string> = {
  notes: `<svg viewBox="0 0 56 56"><defs><linearGradient id="s-notes" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FDBA74"/><stop offset="100%" stop-color="#FB923C"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#s-notes)"/><rect x="15" y="10" width="26" height="36" rx="3" fill="white" opacity="0.95"/><line x1="21" y1="20" x2="35" y2="20" stroke="#FB923C" stroke-width="2" stroke-linecap="round"/><line x1="21" y1="26" x2="35" y2="26" stroke="#FB923C" stroke-width="2" stroke-linecap="round"/><line x1="21" y1="32" x2="30" y2="32" stroke="#FB923C" stroke-width="2" stroke-linecap="round"/></svg>`,
  calculator: `<svg viewBox="0 0 56 56"><defs><linearGradient id="s-calc" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#C4B5FD"/><stop offset="100%" stop-color="#A78BFA"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#s-calc)"/><rect x="14" y="10" width="28" height="8" rx="2" fill="white" opacity="0.9"/><rect x="14" y="22" width="6" height="6" rx="1.5" fill="white" opacity="0.7"/><rect x="25" y="22" width="6" height="6" rx="1.5" fill="white" opacity="0.7"/><rect x="36" y="22" width="6" height="6" rx="1.5" fill="white" opacity="0.7"/><rect x="14" y="32" width="6" height="6" rx="1.5" fill="white" opacity="0.7"/><rect x="25" y="32" width="6" height="6" rx="1.5" fill="white" opacity="0.7"/><rect x="36" y="32" width="6" height="6" rx="1.5" fill="white" opacity="0.7"/><rect x="14" y="42" width="6" height="4" rx="1.5" fill="white" opacity="0.7"/><rect x="25" y="42" width="17" height="4" rx="1.5" fill="white" opacity="0.9"/></svg>`,
  terminal: `<svg viewBox="0 0 56 56"><defs><linearGradient id="s-term" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#1a1a2e"/><stop offset="100%" stop-color="#0d0d1a"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#s-term)"/><path d="M16 20l10 8-10 8" stroke="#7EDDD6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M30 38h12" stroke="#7EDDD6" stroke-width="3" stroke-linecap="round" fill="none"/></svg>`,
  music: `<svg viewBox="0 0 56 56"><defs><linearGradient id="s-music" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#E8829B"/><stop offset="100%" stop-color="#8B2252"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#s-music)"/><circle cx="21" cy="38" r="5" fill="white" opacity="0.95"/><circle cx="37" cy="34" r="5" fill="white" opacity="0.95"/><path d="M26 38V14l16-4v24" stroke="white" stroke-width="2.5" fill="none" opacity="0.95"/></svg>`,
  weather: `<svg viewBox="0 0 56 56"><defs><linearGradient id="s-weather" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#93C5FD"/><stop offset="100%" stop-color="#3B82F6"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#s-weather)"/><circle cx="30" cy="22" r="8" fill="white" opacity="0.9"/><path d="M18 32a8 8 0 0114-6 6 6 0 014 11H16a6 6 0 012-11z" fill="white" opacity="0.85"/></svg>`,
  kanban: `<svg viewBox="0 0 56 56"><defs><linearGradient id="s-kanban" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#86EFAC"/><stop offset="100%" stop-color="#4ADE80"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#s-kanban)"/><rect x="10" y="12" width="10" height="32" rx="3" fill="white" opacity="0.9"/><rect x="10" y="12" width="10" height="10" rx="3" fill="white" opacity="0.6"/><rect x="23" y="12" width="10" height="22" rx="3" fill="white" opacity="0.9"/><rect x="23" y="12" width="10" height="8" rx="3" fill="white" opacity="0.6"/><rect x="36" y="12" width="10" height="16" rx="3" fill="white" opacity="0.9"/><rect x="36" y="12" width="10" height="6" rx="3" fill="white" opacity="0.6"/></svg>`,
  timer: `<svg viewBox="0 0 56 56"><defs><linearGradient id="s-timer" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FDBA74"/><stop offset="100%" stop-color="#F97316"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#s-timer)"/><circle cx="28" cy="30" r="14" fill="none" stroke="white" stroke-width="2.5" opacity="0.9"/><path d="M28 20v10l7 4" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.9"/><rect x="24" y="8" width="8" height="4" rx="2" fill="white" opacity="0.8"/></svg>`,
  'typing-speed': `<svg viewBox="0 0 56 56"><defs><linearGradient id="s-typing" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#C4B5FD"/><stop offset="100%" stop-color="#8B5CF6"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#s-typing)"/><rect x="10" y="18" width="36" height="22" rx="4" fill="white" opacity="0.9"/><rect x="14" y="22" width="4" height="3" rx="1" fill="#8B5CF6" opacity="0.6"/><rect x="20" y="22" width="4" height="3" rx="1" fill="#8B5CF6" opacity="0.6"/><rect x="26" y="22" width="4" height="3" rx="1" fill="#8B5CF6" opacity="0.6"/><rect x="32" y="22" width="4" height="3" rx="1" fill="#8B5CF6" opacity="0.6"/><rect x="38" y="22" width="4" height="3" rx="1" fill="#8B5CF6" opacity="0.6"/><rect x="14" y="28" width="4" height="3" rx="1" fill="#8B5CF6" opacity="0.5"/><rect x="20" y="28" width="4" height="3" rx="1" fill="#8B5CF6" opacity="0.5"/><rect x="26" y="28" width="4" height="3" rx="1" fill="#8B5CF6" opacity="0.5"/><rect x="32" y="28" width="4" height="3" rx="1" fill="#8B5CF6" opacity="0.5"/><rect x="38" y="28" width="4" height="3" rx="1" fill="#8B5CF6" opacity="0.5"/><rect x="18" y="34" width="20" height="3" rx="1.5" fill="#8B5CF6" opacity="0.7"/><circle cx="42" cy="14" r="5" fill="white" opacity="0.8"/><text x="42" y="16.5" font-size="7" fill="#8B5CF6" text-anchor="middle" font-family="sans-serif" font-weight="bold">WPM</text></svg>`,
  'paint-studio': `<svg viewBox="0 0 56 56"><defs><linearGradient id="s-paint" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#86EFAC"/><stop offset="100%" stop-color="#22C55E"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#s-paint)"/><circle cx="22" cy="22" r="4" fill="white" opacity="0.9"/><circle cx="34" cy="18" r="3" fill="white" opacity="0.7"/><circle cx="18" cy="32" r="3.5" fill="white" opacity="0.8"/><circle cx="30" cy="28" r="2.5" fill="white" opacity="0.6"/><path d="M36 34l6 12-4-2-4 2 6-12z" fill="white" opacity="0.9"/></svg>`,
  'image-editor': `<svg viewBox="0 0 56 56"><defs><linearGradient id="s-img" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#E8829B"/><stop offset="100%" stop-color="#EC4899"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#s-img)"/><rect x="12" y="12" width="32" height="32" rx="4" fill="none" stroke="white" stroke-width="2" opacity="0.9"/><circle cx="22" cy="22" r="4" fill="white" opacity="0.85"/><path d="M12 38l10-10 7 7 5-5 10 10" fill="white" opacity="0.85"/></svg>`,
  'flappy-cat': `<svg viewBox="0 0 56 56"><defs><linearGradient id="s-flappy" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#E8829B"/><stop offset="100%" stop-color="#F472B6"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#s-flappy)"/><circle cx="24" cy="26" r="10" fill="white" opacity="0.9"/><circle cx="21" cy="24" r="2" fill="#E8829B" opacity="0.8"/><circle cx="27" cy="24" r="2" fill="#E8829B" opacity="0.8"/><path d="M20 29c2 2 4 2 6 0" stroke="#E8829B" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.7"/><path d="M34 20l8-4v8l-8-4z" fill="white" opacity="0.7"/><path d="M34 28l8-4v8l-8-4z" fill="white" opacity="0.5"/></svg>`,
  snake: `<svg viewBox="0 0 56 56"><defs><linearGradient id="s-snake" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#86EFAC"/><stop offset="100%" stop-color="#34D399"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#s-snake)"/><path d="M14 38h8v-8h8v-8h8v-8" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.9"/><circle cx="14" cy="38" r="3" fill="white" opacity="0.9"/><circle cx="42" cy="14" r="4" fill="white" opacity="0.9"/></svg>`,
  sudoku: `<svg viewBox="0 0 56 56"><defs><linearGradient id="s-sudoku" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#C4B5FD"/><stop offset="100%" stop-color="#8B5CF6"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#s-sudoku)"/><rect x="12" y="12" width="32" height="32" rx="2" fill="none" stroke="white" stroke-width="2" opacity="0.9"/><line x1="22.7" y1="12" x2="22.7" y2="44" stroke="white" stroke-width="1" opacity="0.5"/><line x1="33.3" y1="12" x2="33.3" y2="44" stroke="white" stroke-width="1" opacity="0.5"/><line x1="12" y1="22.7" x2="44" y2="22.7" stroke="white" stroke-width="1" opacity="0.5"/><line x1="12" y1="33.3" x2="44" y2="33.3" stroke="white" stroke-width="1" opacity="0.5"/><text x="17" y="20" font-size="8" fill="white" opacity="0.9" font-family="sans-serif">7</text><text x="30" y="32" font-size="8" fill="white" opacity="0.9" font-family="sans-serif">3</text><text x="37" y="42" font-size="8" fill="white" opacity="0.9" font-family="sans-serif">5</text></svg>`,
  markdown: `<svg viewBox="0 0 56 56"><defs><linearGradient id="s-md" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#C4B5FD"/><stop offset="100%" stop-color="#A78BFA"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#s-md)"/><rect x="12" y="12" width="32" height="32" rx="3" fill="white" opacity="0.9"/><path d="M18 36V24l5 6 5-6v12" stroke="#A78BFA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M33 36l5-6 5 6" stroke="#A78BFA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
  'color-lab': `<svg viewBox="0 0 56 56"><defs><linearGradient id="s-color" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FDBA74"/><stop offset="100%" stop-color="#F59E0B"/></linearGradient></defs><rect width="56" height="56" rx="14" fill="url(#s-color)"/><circle cx="28" cy="28" r="14" fill="none" stroke="white" stroke-width="2" opacity="0.9"/><circle cx="28" cy="16" r="4" fill="#FF6B6B" opacity="0.9"/><circle cx="38" cy="34" r="4" fill="#4ECDC4" opacity="0.9"/><circle cx="18" cy="34" r="4" fill="#45B7D1" opacity="0.9"/><circle cx="28" cy="28" r="4" fill="white" opacity="0.8"/></svg>`,
}

// Tiny inline icons for UI elements
const UI_ICONS: Record<string, string> = {
  back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="15 18 9 12 15 6"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25c.02-.11.03-.22.03-.33 0-1.11-.9-2-2-2H2c0-3.5 2.69-6.39 6.19-6.82.15-.46.47-.85.89-1.09.55-.2 1.14-.2 1.69 0 .42.24.74.63.89 1.09.43-.24.92-.24 1.34 0 .42.24.74.63.89 1.09.55-.2 1.14-.2 1.69 0 .42.24.74.63.89 1.09z"/></svg>`,
  starEmpty: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`,
  spark: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"/></svg>`,
  store: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l1.5-5h15L21 9"/><path d="M3 9h18v2a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><rect x="6" y="13" width="4" height="5" rx="0.5"/><rect x="14" y="13" width="4" height="5" rx="0.5"/><path d="M3 21h18"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>`,
  openExternal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: 10 }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, color: i <= Math.floor(rating) ? '#FDBA74' : 'rgba(255,255,255,0.1)' }} dangerouslySetInnerHTML={{ __html: i <= Math.floor(rating) ? UI_ICONS.star : UI_ICONS.starEmpty }} />
        </span>
      ))}
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginLeft: 4 }}>{rating}</span>
    </span>
  )
}

export default function Store() {
  const [activeCategory, setActiveCategory] = useState<AppCategory>('all')
  const [search, setSearch] = useState('')
  const [selectedApp, setSelectedApp] = useState<StoreApp | null>(null)
  const [installingId, setInstallingId] = useState<string | null>(null)
  const [installProgress, setInstallProgress] = useState(0)
  const openWindow = useDesktopStore(s => s.openWindow)
  const installedStoreApps = useDesktopStore(s => s.installedStoreApps)
  const installStoreApp = useDesktopStore(s => s.installStoreApp)
  const uninstallStoreApp = useDesktopStore(s => s.uninstallStoreApp)

  const isInstalled = useCallback((appId: string) => {
    return installedStoreApps.includes(appId)
  }, [installedStoreApps])

  const handleInstall = useCallback((app: StoreApp) => {
    if (installingId || app.unavailable) return
    setInstallingId(app.id)
    setInstallProgress(0)

    // Fake progress — takes ~1.8s
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 18 + 4
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setInstallProgress(100)
        setTimeout(() => {
          installStoreApp(app.id)
          setInstallingId(null)
          setInstallProgress(0)
        }, 400)
      } else {
        setInstallProgress(progress)
      }
    }, 120)
  }, [installingId, installStoreApp])

  const filteredApps = storeApps.filter(app => {
    const matchCategory = activeCategory === 'all' || app.category === activeCategory
    const matchSearch = !search || app.name.toLowerCase().includes(search.toLowerCase()) || app.desc.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  const coreCount = storeApps.filter(a => !a.installable && !a.unavailable).length
  const installedCount = storeApps.filter(a => (!a.installable && !a.unavailable) || isInstalled(a.id)).length

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(10,7,9,0.95)' }}>

      {/* Header */}
      <div style={{
        padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(232,130,155,0.04) 0%, transparent 100%)',
      }}>
        {selectedApp ? (
          <button onClick={() => setSelectedApp(null)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, flexShrink: 0, transition: 'background 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        ) : (
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #E8829B, #C45A7C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(232,130,155,0.25)',
          }}>
            <span dangerouslySetInnerHTML={{ __html: UI_ICONS.store }} style={{ width: 16, height: 16, display: 'flex', color: 'white' }} />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>
            {selectedApp ? selectedApp.name : 'Mewo Store'}
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)' }}>
            {selectedApp ? selectedApp.category : `${installedCount} installed · ${storeApps.length} available`}
          </div>
        </div>
      </div>

      {!selectedApp && (
        <>
          {/* Search */}
          <div style={{ padding: '10px 16px', flexShrink: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10,
            }}>
              <span style={{ width: 14, height: 14, display: 'flex', color: 'rgba(255,255,255,0.3)' }} dangerouslySetInnerHTML={{ __html: UI_ICONS.search }} />
              <input
                type="text"
                placeholder="Search apps..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.85)', fontSize: 12, fontFamily: 'var(--font-sans)', outline: 'none' }}
              />
            </div>
          </div>

          {/* Categories */}
          <div style={{ display: 'flex', gap: 6, padding: '0 16px 10px', overflowX: 'auto', flexShrink: 0 }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '5px 12px', borderRadius: 100,
                  border: '1px solid',
                  borderColor: activeCategory === cat.id ? 'rgba(232,130,155,0.3)' : 'rgba(255,255,255,0.06)',
                  background: activeCategory === cat.id ? 'rgba(232,130,155,0.1)' : 'transparent',
                  color: activeCategory === cat.id ? '#E8829B' : 'rgba(255,255,255,0.4)',
                  fontSize: 10, fontFamily: 'var(--font-mono)',
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: selectedApp ? '16px' : '0 16px 16px' }}>
        {selectedApp ? (
          <div style={{ animation: 'storeFadeIn 0.2s ease' }}>
            {/* App icon large — dock style */}
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16, overflow: 'hidden',
                boxShadow: `0 8px 24px ${selectedApp.accentColor}33`,
                flexShrink: 0,
              }} dangerouslySetInnerHTML={{ __html: DOCK_ICONS[selectedApp.id] || '' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'rgba(255,255,255,0.9)', marginBottom: 2 }}>{selectedApp.name}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)' }}>{selectedApp.category} · {selectedApp.size}</div>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RatingStars rating={selectedApp.rating} />
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>{selectedApp.downloads}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ padding: '14px 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>About</div>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(255,255,255,0.6)' }}>{selectedApp.desc}</p>
            </div>

            {/* Action button */}
            {selectedApp.unavailable ? (
              <div style={{
                width: '100%', padding: '10px 0', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)',
                color: 'rgba(255,255,255,0.2)',
                fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-sans)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                cursor: 'not-allowed',
              }}>
                <span style={{ width: 14, height: 14, display: 'flex' }} dangerouslySetInnerHTML={{ __html: UI_ICONS.lock }} />
                Coming Soon
              </div>
            ) : installingId === selectedApp.id ? (
              <div style={{ width: '100%' }}>
                <div style={{
                  width: '100%', height: 6, borderRadius: 3,
                  background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 8,
                }}>
                  <div style={{
                    width: `${installProgress}%`, height: '100%', borderRadius: 3,
                    background: 'linear-gradient(90deg, #E8829B, #C45A7C)',
                    transition: 'width 0.12s ease-out',
                    boxShadow: '0 0 12px rgba(232,130,155,0.4)',
                  }} />
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                  {installProgress < 100 ? `Installing... ${Math.round(installProgress)}%` : 'Installed!'}
                </div>
              </div>
            ) : isInstalled(selectedApp.id) ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => {
                    if (selectedApp.opensApp) openWindow(selectedApp.opensApp, selectedApp.name)
                  }}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <span style={{ width: 14, height: 14, display: 'flex' }} dangerouslySetInnerHTML={{ __html: UI_ICONS.openExternal }} />
                  Open
                </button>
                <button
                  onClick={() => {
                    uninstallStoreApp(selectedApp.id)
                    setSelectedApp(null)
                  }}
                  style={{
                    padding: '10px 14px', borderRadius: 10,
                    border: '1px solid rgba(239,68,68,0.15)',
                    background: 'rgba(239,68,68,0.06)',
                    color: 'rgba(239,68,68,0.7)',
                    fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.12)'; (e.currentTarget as HTMLElement).style.color = 'rgba(239,68,68,0.9)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)'; (e.currentTarget as HTMLElement).style.color = 'rgba(239,68,68,0.7)' }}
                >
                  <span style={{ width: 14, height: 14, display: 'flex' }} dangerouslySetInnerHTML={{ __html: UI_ICONS.trash }} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleInstall(selectedApp)}
                style={{
                  width: '100%', padding: '10px 0', borderRadius: 10, border: 'none',
                  background: `linear-gradient(135deg, ${selectedApp.accentColor}, ${selectedApp.accentColor}cc)`,
                  color: 'white',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  boxShadow: `0 4px 16px ${selectedApp.accentColor}33`,
                }}
              >
                <span style={{ width: 14, height: 14, display: 'flex' }} dangerouslySetInnerHTML={{ __html: UI_ICONS.download }} />
                Install
              </button>
            )}
          </div>
        ) : (
          /* App List */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {/* Featured banner */}
            {!search && activeCategory === 'all' && (
              <div style={{
                padding: '16px', marginBottom: 6, borderRadius: 14,
                background: 'linear-gradient(135deg, rgba(232,130,155,0.08), rgba(126,221,214,0.05))',
                border: '1px solid rgba(255,255,255,0.06)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 0, right: 0, width: 80, height: 80,
                  background: 'radial-gradient(circle, rgba(232,130,155,0.1) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 10, height: 10, display: 'flex', color: '#E8829B' }} dangerouslySetInnerHTML={{ __html: UI_ICONS.spark }} />
                  Featured
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.9)', marginBottom: 3 }}>Chat AI</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Your desktop AI assistant with voice and code generation</div>
              </div>
            )}

            {filteredApps.map(app => {
              const installed = !app.installable && !app.unavailable ? true : isInstalled(app.id)
              const installing = installingId === app.id
              const unavailable = app.unavailable

              return (
                <div
                  key={app.id}
                  onClick={() => !installing && setSelectedApp(app)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: 12, cursor: installing ? 'wait' : 'pointer',
                    transition: 'all 0.15s',
                    opacity: unavailable ? 0.5 : 1,
                  }}
                  onMouseEnter={e => { if (!unavailable) { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateX(2px)' } }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.transform = 'translateX(0)' }}
                >
                  {/* Premium dock-style icon */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 11, overflow: 'hidden',
                    boxShadow: `0 4px 12px ${app.accentColor}22`,
                    flexShrink: 0,
                  }} dangerouslySetInnerHTML={{ __html: DOCK_ICONS[app.id] || '' }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: 'rgba(255,255,255,0.85)', marginBottom: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {app.name}
                      {unavailable && (
                        <span style={{
                          fontSize: 8, fontFamily: 'var(--font-mono)',
                          padding: '1px 5px', borderRadius: 4,
                          background: 'rgba(255,255,255,0.06)',
                          color: 'rgba(255,255,255,0.25)',
                          letterSpacing: 0.5,
                        }}>SOON</span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.desc}</div>
                  </div>

                  <div style={{ flexShrink: 0, textAlign: 'right', minWidth: 52 }}>
                    {installing ? (
                      <div style={{ width: 48 }}>
                        <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                          <div style={{ width: `${installProgress}%`, height: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${app.accentColor}, ${app.accentColor}aa)`, transition: 'width 0.12s' }} />
                        </div>
                      </div>
                    ) : installed ? (
                      <div style={{
                        fontSize: 9, color: '#86EFAC', fontFamily: 'var(--font-mono)',
                        display: 'flex', alignItems: 'center', gap: 3,
                      }}>
                        <span style={{ width: 8, height: 8, display: 'flex' }} dangerouslySetInnerHTML={{ __html: UI_ICONS.check }} />
                        installed
                      </div>
                    ) : (
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono)' }}>{app.downloads}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes storeFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
