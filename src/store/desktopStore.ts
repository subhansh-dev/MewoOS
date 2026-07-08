import { create } from 'zustand'

export interface WindowState {
  id: string
  appId: string
  title: string
  x: number
  y: number
  width: number
  height: number
  minimized: boolean
  maximized: boolean
  zIndex: number
  workspace: number
  origin?: { x: number; y: number }
}

const MAX_WORKSPACES = 4

interface DesktopStore {
  windows: WindowState[]
  activeWindowId: string | null
  nextZIndex: number
  bootDone: boolean
  openApps: string[]
  dockHovered: string | null
  currentWorkspace: number
  maxWorkspaces: number

  setBootDone: (done: boolean) => void
  openWindow: (appId: string, title: string, width?: number, height?: number, origin?: { x: number; y: number }) => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  toggleMaximize: (id: string) => void
  updateWindowPosition: (id: string, x: number, y: number) => void
  updateWindowSize: (id: string, width: number, height: number) => void
  setDockHovered: (appId: string | null) => void
  switchWorkspace: (num: number) => void
  moveToWorkspace: (id: string, workspace: number) => void
  getWorkspaceWindows: (workspace: number) => WindowState[]
}

export const useDesktopStore = create<DesktopStore>((set, get) => ({
  windows: [],
  activeWindowId: null,
  nextZIndex: 10,
  bootDone: false,
  openApps: [],
  dockHovered: null,
  currentWorkspace: 1,
  maxWorkspaces: MAX_WORKSPACES,

  setBootDone: (done) => set({ bootDone: done }),

  openWindow: (appId, title, width = 640, height = 480, origin) => {
    const { windows, nextZIndex, currentWorkspace } = get()
    // Only check for existing windows on the CURRENT workspace
    const existing = windows.find(w => w.appId === appId && w.workspace === currentWorkspace && !w.minimized)
    if (existing) {
      get().focusWindow(existing.id)
      return
    }
    const minimized = windows.find(w => w.appId === appId && w.workspace === currentWorkspace && w.minimized)
    if (minimized) {
      set(state => ({
        windows: state.windows.map(w =>
          w.id === minimized.id ? { ...w, minimized: false, zIndex: state.nextZIndex } : w
        ),
        activeWindowId: minimized.id,
        nextZIndex: state.nextZIndex + 1,
      }))
      return
    }
    const id = `win-${Date.now()}`
    const workspaceWindows = windows.filter(w => w.workspace === currentWorkspace)
    const offsetX = (workspaceWindows.length % 5) * 30
    const offsetY = (workspaceWindows.length % 5) * 30
    const newWindow: WindowState = {
      id,
      appId,
      title,
      x: Math.max(80, 120 + offsetX),
      y: Math.max(60, 80 + offsetY),
      width,
      height,
      minimized: false,
      maximized: false,
      zIndex: nextZIndex,
      workspace: currentWorkspace,
      origin,
    }
    set(state => ({
      windows: [...state.windows, newWindow],
      activeWindowId: id,
      nextZIndex: state.nextZIndex + 1,
      openApps: state.openApps.includes(appId) ? state.openApps : [...state.openApps, appId],
    }))
  },

  closeWindow: (id) => set(state => {
    const win = state.windows.find(w => w.id === id)
    const remaining = state.windows.filter(w => w.id !== id)
    const stillOpen = remaining.some(w => w.appId === win?.appId)
    return {
      windows: remaining,
      activeWindowId: remaining.length ? remaining[remaining.length - 1].id : null,
      openApps: stillOpen ? state.openApps : state.openApps.filter(a => a !== win?.appId),
    }
  }),

  focusWindow: (id) => set(state => ({
    windows: state.windows.map(w =>
      w.id === id ? { ...w, zIndex: state.nextZIndex } : w
    ),
    activeWindowId: id,
    nextZIndex: state.nextZIndex + 1,
  })),

  minimizeWindow: (id) => set(state => ({
    windows: state.windows.map(w =>
      w.id === id ? { ...w, minimized: true } : w
    ),
    activeWindowId: state.windows.filter(w => w.id !== id && !w.minimized).pop()?.id || null,
  })),

  toggleMaximize: (id) => set(state => ({
    windows: state.windows.map(w =>
      w.id === id ? { ...w, maximized: !w.maximized } : w
    ),
  })),

  updateWindowPosition: (id, x, y) => set(state => ({
    windows: state.windows.map(w =>
      w.id === id ? { ...w, x, y } : w
    ),
  })),

  updateWindowSize: (id, width, height) => set(state => ({
    windows: state.windows.map(w =>
      w.id === id ? { ...w, width, height } : w
    ),
  })),

  setDockHovered: (appId) => set({ dockHovered: appId }),

  switchWorkspace: (num) => {
    const clamped = Math.max(1, Math.min(MAX_WORKSPACES, num))
    if (clamped === get().currentWorkspace) return
    set({ currentWorkspace: clamped, activeWindowId: null })
  },

  moveToWorkspace: (id, workspace) => {
    const clamped = Math.max(1, Math.min(MAX_WORKSPACES, workspace))
    set(state => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, workspace: clamped } : w
      ),
    }))
  },

  getWorkspaceWindows: (workspace) => {
    return get().windows.filter(w => w.workspace === workspace)
  },
}))

// Notification store
export interface Notification { id: string; message: string; icon?: string; duration?: number }
interface NotificationStore {
  notifications: Notification[]
  add: (message: string, icon?: string, duration?: number) => void
  remove: (id: string) => void
}
export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  add: (message, icon = '🔔', duration = 3000) => {
    const id = `notif-${Date.now()}-${Math.random()}`
    set(s => ({ notifications: [...s.notifications, { id, message, icon, duration }] }))
    setTimeout(() => set(s => ({ notifications: s.notifications.filter(n => n.id !== id) })), duration)
  },
  remove: (id) => set(s => ({ notifications: s.notifications.filter(n => n.id !== id) })),
}))
