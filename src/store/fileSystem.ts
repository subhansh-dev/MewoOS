import { create } from 'zustand'

export interface FSNode {
  id: string
  name: string
  type: 'file' | 'folder'
  parentId: string | null
  content?: string
  mimeType?: string
  size: number
  created: number
  modified: number
}

const DB_NAME = 'mewo-fs'
const DB_VERSION = 1
const STORE_NAME = 'nodes'

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('parentId', 'parentId', { unique: false })
        store.createIndex('name', 'name', { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => { dbPromise = null; reject(req.error) }
  })
  return dbPromise
}

async function dbGetAll(): Promise<FSNode[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function dbPut(node: FSNode): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(node)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function dbDeleteAll(ids: string[]): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    for (const id of ids) store.delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

function generateId(): string {
  return `fs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

interface FileSystemStore {
  nodes: FSNode[]
  loaded: boolean
  load: () => Promise<void>

  getChildren: (parentId: string | null) => FSNode[]
  getNode: (id: string) => FSNode | undefined
  getPath: (id: string) => string

  createFile: (name: string, parentId: string | null, content?: string, mimeType?: string) => Promise<FSNode>
  createFolder: (name: string, parentId: string | null) => Promise<FSNode>
  updateContent: (id: string, content: string) => Promise<void>
  rename: (id: string, newName: string) => Promise<void>
  remove: (id: string) => Promise<void>
  move: (id: string, newParentId: string | null) => Promise<void>

  ensureDefaultStructure: () => Promise<void>
}

export const useFileSystem = create<FileSystemStore>((set, get) => ({
  nodes: [],
  loaded: false,

  load: async () => {
    const nodes = await dbGetAll()
    set({ nodes, loaded: true })
  },

  getChildren: (parentId) => {
    return get().nodes.filter(n => n.parentId === parentId).sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
      return a.name.localeCompare(b.name)
    })
  },

  getNode: (id) => get().nodes.find(n => n.id === id),

  getPath: (id) => {
    const parts: string[] = []
    let current = get().nodes.find(n => n.id === id)
    while (current) {
      parts.unshift(current.name)
      current = current.parentId ? get().nodes.find(n => n.id === current!.parentId) : undefined
    }
    return '/' + parts.join('/')
  },

  createFile: async (name, parentId, content = '', mimeType = 'text/plain') => {
    const now = Date.now()
    const node: FSNode = {
      id: generateId(), name, type: 'file', parentId,
      content, mimeType, size: content.length, created: now, modified: now,
    }
    await dbPut(node)
    set(s => ({ nodes: [...s.nodes, node] }))
    return node
  },

  createFolder: async (name, parentId) => {
    const now = Date.now()
    const node: FSNode = {
      id: generateId(), name, type: 'folder', parentId,
      size: 0, created: now, modified: now,
    }
    await dbPut(node)
    set(s => ({ nodes: [...s.nodes, node] }))
    return node
  },

  updateContent: async (id, content) => {
    const node = get().nodes.find(n => n.id === id)
    if (!node) return
    const updated = { ...node, content, size: content.length, modified: Date.now() }
    await dbPut(updated)
    set(s => ({ nodes: s.nodes.map(n => n.id === id ? updated : n) }))
  },

  rename: async (id, newName) => {
    const node = get().nodes.find(n => n.id === id)
    if (!node) return
    const updated = { ...node, name: newName, modified: Date.now() }
    await dbPut(updated)
    set(s => ({ nodes: s.nodes.map(n => n.id === id ? updated : n) }))
  },

  remove: async (id) => {
    const toDelete: string[] = []
    const collect = (parentId: string) => {
      toDelete.push(parentId)
      get().nodes.filter(n => n.parentId === parentId).forEach(n => collect(n.id))
    }
    collect(id)
    await dbDeleteAll(toDelete)
    set(s => ({ nodes: s.nodes.filter(n => !toDelete.includes(n.id)) }))
  },

  move: async (id, newParentId) => {
    const node = get().nodes.find(n => n.id === id)
    if (!node || node.id === newParentId) return
    const updated = { ...node, parentId: newParentId, modified: Date.now() }
    await dbPut(updated)
    set(s => ({ nodes: s.nodes.map(n => n.id === id ? updated : n) }))
  },

  ensureDefaultStructure: async () => {
    const nodes = await dbGetAll()
    if (nodes.length > 0) return

    const now = Date.now()
    const folders: FSNode[] = [
      { id: 'fs-home', name: 'Home', type: 'folder', parentId: null, size: 0, created: now, modified: now },
      { id: 'fs-documents', name: 'Documents', type: 'folder', parentId: 'fs-home', size: 0, created: now, modified: now },
      { id: 'fs-pictures', name: 'Pictures', type: 'folder', parentId: 'fs-home', size: 0, created: now, modified: now },
      { id: 'fs-music', name: 'Music', type: 'folder', parentId: 'fs-home', size: 0, created: now, modified: now },
      { id: 'fs-downloads', name: 'Downloads', type: 'folder', parentId: 'fs-home', size: 0, created: now, modified: now },
      { id: 'fs-desktop', name: 'Desktop', type: 'folder', parentId: 'fs-home', size: 0, created: now, modified: now },
    ]
    const files: FSNode[] = [
      { id: 'fs-readme', name: 'welcome.txt', type: 'file', parentId: 'fs-home', content: 'Welcome to MewoOS!\n\nThis is your virtual file system.\nCreate files, organize folders, and make it yours.\n\n— Meo', mimeType: 'text/plain', size: 80, created: now, modified: now },
    ]

    const db = await openDB()
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      for (const n of [...folders, ...files]) store.put(n)
      tx.oncomplete = () => {
        set(s => ({ nodes: [...s.nodes, ...folders, ...files] }))
        resolve()
      }
      tx.onerror = () => reject(tx.error)
    })
  },
}))
