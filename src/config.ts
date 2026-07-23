// Media base URL — Supabase Storage for audio/reels only, relative paths for images
const SUPABASE_BASE = import.meta.env.VITE_SUPABASE_MEDIA_URL || 'https://asmidlbevzqprejwevrs.supabase.co/storage/v1/object/public/media'

export const mediaUrl = (path: string) => {
  if (import.meta.env.PROD && (path.startsWith('/audio/') || path.startsWith('/reels/'))) {
    return `${SUPABASE_BASE}${path}`
  }
  return path
}
