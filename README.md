<div align="center">

# MewoOS

**A web-based desktop environment that runs in your browser**

Built for the [Hack Club Stardance](https://hackclub.com) and [Hack Club Beest](https://hackclub.com) WebOS Jam

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

</div>

---

## About

MewoOS is a fully client-side desktop environment that runs in your browser. It features a windowing system, 10 built-in apps, a cinematic boot sequence, an animated pixel cat pet, glassmorphism UI, and hidden easter eggs — all rendered with React, Framer Motion, and Canvas.

Everything is self-contained. No backend, no database, no API calls. Notes, settings, and preferences persist in localStorage.

---

## Features

### Desktop Environment
- **Windowing system** — drag, resize (8 directions), minimize, maximize, close with macOS-style traffic lights
- **Dock** — macOS-style magnification, bounce animations, launch ripple effects, open-app indicators
- **Top bar** — clock, battery/wifi/volume icons, logo dropdown menu, active app indicator
- **Context menu** — right-click anywhere for quick app access
- **Spotlight search** — press `Cmd+K` / `Ctrl+K` to search and launch apps
- **Lock screen** — auto-locks after 5 minutes of inactivity, click to unlock
- **Desktop widgets** — analog clock (canvas-drawn) and calendar, toggleable from Settings
- **Notifications** — toast notifications for app launches and actions

### Pixel Cat Pet
- 16x16 pixel art sprite rendered on canvas at 3x scale
- **Walk cycle** — animated legs when following cursor
- **Idle** — gentle bounce, tail swish between frames
- **Sleep** — eyes closed, "z" particles float up after 15s of no mouse movement
- **Happy** — heart eyes, floating heart particles on click
- **Blink** — periodic eye-close animation
- **Pin/unpin** — click to pin in place, click again to resume following cursor

### Visual Design
- **Dark gothic-kawaii palette** — deep blacks, sakura pink, miku teal, lavender, mint, peach
- **Glassmorphism** — blur, saturation, and subtle borders on every panel
- **Cursor trail** — sakura-colored comet tail (canvas-based, zero lag)
- **Parallax background** — glow orbs shift with mouse movement
- **Shimmer effect** — subtle light sweep on windows every 20 seconds
- **Boot sequence** — logo reveal with blur → welcome fade → terminal with BIOS/kernel/services → particle burst → staggered desktop assembly
- **Boot chime** — C major chord via Web Audio API

### Easter Eggs
- **Konami Code** — press `↑↑↓↓←→←→BA` anywhere for a confetti explosion
- **Rainbow mode** — click the "MewoOS" logo 10 times for a rainbow top bar
- **Desktop pet** — the ASCII-turned-pixel cat follows your cursor
- **Terminal `sudo`** — try it and find out ;)

---

## Built-in Apps

| App | Description |
|-----|-------------|
| **About Me** | Profile card with avatar, bio, tags, and social links |
| **Terminal** | Fake shell (`mewosh`) with 20+ commands including `neofetch`, `cowsay`, `matrix`, `fortune`, and more |
| **Notes** | Text editor with auto-save to localStorage and word count |
| **Calculator** | Basic calculator with keyboard support |
| **Music Player** | 27-track playlist (anime, jazz, classical, pop) with Web Audio API visualizer |
| **Gallery** | 11-image grid with lightbox viewer and keyboard navigation |
| **Browser** | Embedded web browser with Google Translate and Wayback Machine proxy fallback |
| **Doomscroll** | TikTok-style vertical video scroller with 34 reels, double-tap to like |
| **Settings** | Accent colors (6 options), background mode (solid/static/live wallpaper), widget toggle |
| **Guide** | Accordion-style guide covering every feature, command, and easter egg |

### Terminal Commands

```
help          Show all available commands
whoami        Who is Subhansh?
about         About MewoOS
skills        Technical skills list
projects      Project showcase
contact       Email, GitHub, Discord, Portfolio
neofetch      System info with ASCII art
kawaii        Random kaomoji face
date          Current date and time
echo [text]   Echo text back
clear         Clear terminal
matrix        Matrix rain effect
party         Disco emoji mode
cat           Random ASCII cat
fortune       Random fortune/quote
weather       Fake weather report
cowsay [text] A cow says your text
sudo          Try it ;)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript 6 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 4 + CSS custom properties |
| State | Zustand |
| Animation | Framer Motion |
| Icons | Lucide React |
| Audio | Web Audio API (click sounds, boot chime, music visualizer) |
| Rendering | Canvas 2D (cursor trail, particles, clock widget, pixel cat) |

---

## Architecture

```
src/
├── main.tsx                  # Entry point
├── App.tsx                   # Main orchestrator — boot phases, cursor trail, window rendering
├── index.css                 # Global styles, theme variables, glassmorphism, animations
├── store/
│   └── desktopStore.ts       # Zustand stores (windows, notifications)
├── components/
│   ├── BootScreen.tsx        # Cinematic boot sequence with canvas particles
│   ├── TopBar.tsx            # macOS-style menu bar
│   ├── Desktop.tsx           # Desktop surface with context menu and parallax
│   ├── Dock.tsx              # App dock with magnification
│   ├── Window.tsx            # Windowing system (drag, resize, traffic lights)
│   ├── LockScreen.tsx        # Auto-lock after idle
│   ├── DesktopPet.tsx        # Animated pixel cat pet
│   ├── SystemUI.tsx          # Click sounds, Konami code, Spotlight search
│   ├── SearchBar.tsx         # App search bar
│   └── Widgets.tsx           # Analog clock and calendar
└── apps/
    ├── AboutMe.tsx           # Profile card
    ├── Terminal.tsx          # Fake shell with 20+ commands
    ├── Notes.tsx             # Auto-saving notepad
    ├── Calculator.tsx        # Calculator with keyboard support
    ├── MusicPlayer.tsx       # 27-track player with visualizer
    ├── Gallery.tsx           # Image grid with lightbox
    ├── Browser.tsx           # Embedded browser with proxy fallback
    ├── Doomscroll.tsx        # TikTok-style video scroller
    ├── Settings.tsx          # Accent colors, wallpapers, widgets
    └── Guide.tsx             # Feature guide
```

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/subhansh-dev/mewoos.git
cd mewoos

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Deployment

MewoOS is a fully static site — no backend required.

**Vercel** (recommended):
1. Push to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Vercel auto-detects Vite and deploys
4. Done — you get a live URL

**Other options**: Netlify, Cloudflare Pages, GitHub Pages — any static host works.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+K` / `Ctrl+K` | Open Spotlight search |
| `Escape` | Close search/context menu |
| `↑↑↓↓←→←→BA` | Konami code (confetti!) |

---

## Project Info

| | |
|---|---|
| **Made by** | Subhansh |
| **Age** | 17 |
| **Contact** | subhansh.dev@gmail.com |
| **Discord** | nernearr |
| **GitHub** | [subhansh-dev](https://github.com/subhansh-dev) |
| **Portfolio** | [subhanshh.vercel.app](https://subhanshh.vercel.app) |
| **Built for** | [Hack Club Stardance](https://hackclub.com) WebOS Jam |

---

<div align="center">

**MewoOS v1.0.0** — made with React, TypeScript, and a lot of sakura pink

</div>
