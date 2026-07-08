import { useState } from 'react'
import { mediaUrl } from '../config'

const galleryItems = [
  { id: 1, img: mediaUrl('/images/gallery-new/gallery-1.jpg') },
  { id: 2, img: mediaUrl('/images/gallery-new/gallery-2.jpg') },
  { id: 3, img: mediaUrl('/images/gallery-new/gallery-3.jpg') },
  { id: 4, img: mediaUrl('/images/gallery-new/gallery-4.jpg') },
  { id: 5, img: mediaUrl('/images/gallery-new/gallery-5.jpg') },
  { id: 6, img: mediaUrl('/images/gallery-new/gallery-6.jpg') },
  { id: 7, img: mediaUrl('/images/gallery-new/gallery-7.jpg') },
  { id: 8, img: mediaUrl('/images/gallery-new/gallery-8.jpg') },
  { id: 9, img: mediaUrl('/images/gallery-new/gallery-9.jpg') },
  { id: 10, img: mediaUrl('/images/gallery-new/gallery-10.jpg') },
  { id: 11, img: mediaUrl('/images/gallery-new/gallery-11.jpg') },
]

export default function Gallery() {
  const [selected, setSelected] = useState<number | null>(null)
  const [lightbox, setLightbox] = useState<number | null>(null)

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-sakura)' }}>Gallery</span>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{galleryItems.length} pieces</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {galleryItems.map((item, i) => (
          <div key={item.id}
            onClick={() => setSelected(selected === i ? null : i)}
            onDoubleClick={() => setLightbox(i)}
            style={{
              aspectRatio: '1', borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
              position: 'relative', transition: 'transform 0.15s',
              border: selected === i ? '2px solid var(--color-sakura)' : '2px solid transparent',
              boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
            }}>
            <img src={item.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </div>
        ))}
      </div>
      {selected !== null && (
        <div style={{ marginTop: 16, padding: 12, background: 'rgba(12,10,18,0.7)', backdropFilter: 'blur(16px)',
          borderRadius: 12, textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
          <img src={galleryItems[selected].img} alt="" style={{ width: '100%', maxHeight: 250, objectFit: 'cover', borderRadius: 8 }}
            onDoubleClick={() => setLightbox(selected)} />
        </div>
      )}

      {/* Lightbox overlay */}
      {lightbox !== null && (
        <div onClick={() => setLightbox(null)} style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <img src={galleryItems[lightbox].img} alt="" style={{
            maxWidth: '90%', maxHeight: '90%', objectFit: 'contain',
            borderRadius: 8, boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          }} />
          {/* Nav arrows */}
          <div onClick={e => { e.stopPropagation(); setLightbox((lightbox - 1 + galleryItems.length) % galleryItems.length) }}
            style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', fontSize: 32,
              color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 10 }}>‹</div>
          <div onClick={e => { e.stopPropagation(); setLightbox((lightbox + 1) % galleryItems.length) }}
            style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', fontSize: 32,
              color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 10 }}>›</div>
        </div>
      )}
    </div>
  )
}
