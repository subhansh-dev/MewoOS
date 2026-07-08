import { useState, useRef, useCallback, useEffect } from 'react'

const PRESETS = [
  { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Main_Page' },
  { label: 'GitHub', url: 'https://github.com' },
  { label: 'Reddit', url: 'https://old.reddit.com' },
  { label: 'YouTube', url: 'https://www.youtube.com' },
  { label: 'Hacker News', url: 'https://news.ycombinator.com' },
  { label: 'MDN', url: 'https://developer.mozilla.org' },
]

const PROXY_OPTIONS = [
  {
    id: 'google-translate',
    label: 'Google Translate',
    desc: 'Best compatibility — renders most sites',
    getUrl: (url: string) =>
      `https://translate.google.com/translate?sl=auto&tl=en&u=${encodeURIComponent(url)}`,
  },
  {
    id: 'wayback',
    label: 'Wayback Machine',
    desc: 'Archived version of the page',
    getUrl: (url: string) =>
      `https://web.archive.org/web/2024/${url}`,
  },
]

export default function Browser() {
  const [url, setUrl] = useState('https://en.wikipedia.org/wiki/Main_Page')
  const [inputUrl, setInputUrl] = useState('https://en.wikipedia.org/wiki/Main_Page')
  const [loading, setLoading] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [blockedSite, setBlockedSite] = useState('')
  const [activeProxy, setActiveProxy] = useState<string | null>(null)
  const [proxiedSrc, setProxiedSrc] = useState<string | null>(null)
  const [faviconFailed, setFaviconFailed] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Reset favicon state when URL changes
  useEffect(() => { setFaviconFailed(false) }, [blockedSite, url])

  const resolveSrc = useCallback((): string => {
    if (activeProxy && proxiedSrc) return proxiedSrc
    return url
  }, [activeProxy, proxiedSrc, url])

  const navigate = useCallback((targetUrl: string) => {
    let finalUrl = targetUrl.trim()
    if (!finalUrl) return
    if (!finalUrl.startsWith('http')) finalUrl = 'https://' + finalUrl
    // Block dangerous URL schemes
    try {
      const parsed = new URL(finalUrl)
      if (!['http:', 'https:'].includes(parsed.protocol)) return
    } catch { return }
    setBlocked(false)
    setBlockedSite('')
    setActiveProxy(null)
    setProxiedSrc(null)
    setUrl(finalUrl)
    setInputUrl(finalUrl)
    setLoading(true)
  }, [])

  const activateProxy = useCallback((proxyId: string, siteUrl: string) => {
    const proxy = PROXY_OPTIONS.find(p => p.id === proxyId)
    if (!proxy) return
    setActiveProxy(proxyId)
    setProxiedSrc(proxy.getUrl(siteUrl))
    setBlocked(false)
    setLoading(true)
  }, [])

  const handleIframeLoad = useCallback(() => {
    setLoading(false)
    if (activeProxy) return
    try {
      const iframe = iframeRef.current
      if (!iframe) return
      const iframeOrigin = new URL(resolveSrc()).origin
      if (iframe.contentWindow?.location.origin === iframeOrigin) return
    } catch {
      // Cross-origin — can't verify, site may or may not be blocked
    }
    if (blocked) {
      setBlockedSite(url)
    }
  }, [activeProxy, blocked, resolveSrc, url])

  const handleIframeError = useCallback(() => {
    setLoading(false)
    if (!activeProxy) {
      setBlocked(true)
      setBlockedSite(url)
    }
  }, [activeProxy, url])

  const siteHost = (() => { try { return new URL(blockedSite || url).hostname } catch { return '' } })()
  const siteFavicon = `https://www.google.com/s2/favicons?domain=${siteHost}&sz=128`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0D0A0E' }}>
      {/* Address bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
        background: 'rgba(26,17,24,0.9)',
        borderBottom: '1px solid rgba(232,130,155,0.08)',
      }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <NavBtn onClick={() => iframeRef.current?.contentWindow?.history.back()}>{'<'}</NavBtn>
          <NavBtn onClick={() => iframeRef.current?.contentWindow?.history.forward()}>{'>'}</NavBtn>
          <NavBtn onClick={() => { if (activeProxy && blockedSite) activateProxy(activeProxy, blockedSite); else navigate(url) }}>
            {'~'}
          </NavBtn>
        </div>
        <input
          value={inputUrl}
          onChange={e => setInputUrl(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') navigate(inputUrl) }}
          style={{
            flex: 1, background: 'rgba(232,130,155,0.06)',
            border: '1px solid rgba(232,130,155,0.1)', borderRadius: 6,
            padding: '5px 10px', color: 'var(--color-text-primary)', fontSize: 12,
            fontFamily: 'var(--font-mono)', outline: 'none',
          }}
          spellCheck={false}
        />
        {activeProxy && (
          <span style={{
            fontSize: 9, fontWeight: 700, color: 'var(--color-miku)',
            background: 'rgba(126,221,214,0.1)', padding: '2px 7px', borderRadius: 4,
            whiteSpace: 'nowrap', letterSpacing: 0.5,
          }}>
            {PROXY_OPTIONS.find(p => p.id === activeProxy)?.label || 'PROXY'}
          </span>
        )}
      </div>

      {/* Quick links */}
      <div style={{
        display: 'flex', gap: 4, padding: '4px 10px',
        background: 'rgba(10,7,9,0.5)',
        borderBottom: '1px solid rgba(232,130,155,0.05)',
        overflowX: 'auto',
      }}>
        {PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => navigate(p.url)}
            style={{
              padding: '3px 8px', borderRadius: 4,
              border: '1px solid rgba(232,130,155,0.08)',
              background: 'rgba(232,130,155,0.04)',
              color: 'var(--color-text-secondary)', fontSize: 10,
              fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Loading bar */}
        {loading && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: 'var(--color-sakura)', animation: 'loading-bar 1s ease-in-out', zIndex: 3,
          }} />
        )}

        {/* Blocked site overlay */}
        {blocked && !activeProxy && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 5,
            background: 'linear-gradient(180deg, #0D0A0E 0%, #0A0709 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: 40, textAlign: 'center', overflow: 'auto',
          }}>
            {/* Favicon */}
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'rgba(232,130,155,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 20, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
            }}>
              {faviconFailed ? (
                <span style={{ fontSize: 22, color: 'var(--color-text-muted)' }}>?</span>
              ) : (
                <img
                  src={siteFavicon} alt="" style={{ width: 32, height: 32 }}
                  onError={() => setFaviconFailed(true)}
                />
              )}
            </div>

            {/* Message */}
            <div style={{
              fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 6,
            }}>
              {siteHost} blocked this view
            </div>
            <div style={{
              fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 28,
              maxWidth: 340, lineHeight: 1.5,
            }}>
              This site sets security headers that prevent embedding.
              Use a proxy below, or open it directly in a new tab.
            </div>

            {/* Open in new tab */}
            <button
              onClick={() => window.open(blockedSite, '_blank', 'noopener,noreferrer')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 10,
                background: 'var(--color-sakura)', color: 'white',
                border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                fontFamily: 'var(--font-sans)', marginBottom: 24,
                boxShadow: '0 4px 20px rgba(232,130,155,0.25)', transition: 'filter 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'none'}
            >
              <span style={{ fontSize: 15 }}>{'↗'}</span>
              Open in New Tab
            </button>

            {/* Divider */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%',
              maxWidth: 320, marginBottom: 20,
            }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              <span style={{
                fontSize: 9, fontWeight: 700, color: 'var(--color-text-muted)',
                letterSpacing: 1.5, textTransform: 'uppercase',
              }}>
                or try a proxy
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            </div>

            {/* Proxy buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 320 }}>
              {PROXY_OPTIONS.map(proxy => (
                <button
                  key={proxy.id}
                  onClick={() => activateProxy(proxy.id, blockedSite)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 10, width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'background 0.15s, border-color 0.15s',
                    color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(126,221,214,0.06)'
                    e.currentTarget.style.borderColor = 'rgba(126,221,214,0.15)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  }}
                >
                  <span style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(126,221,214,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, flexShrink: 0, border: '1px solid rgba(126,221,214,0.1)',
                  }}>
                    {proxy.id === 'google-translate' ? '⚛' : '⏪'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{proxy.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 1 }}>
                      {proxy.desc}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 14, color: 'var(--color-miku)', fontWeight: 700, flexShrink: 0,
                  }}>{'>'}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main iframe */}
        <iframe
          ref={iframeRef}
          key={resolveSrc()}
          src={resolveSrc()}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          style={{ width: '100%', height: '100%', border: 'none', background: 'white' }}
          sandbox="allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  )
}

function NavBtn({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button onClick={onClick} style={{
      width: 26, height: 26, borderRadius: 4, border: 'none',
      background: 'rgba(232,130,155,0.06)', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 14, color: 'var(--color-text-secondary)',
      fontFamily: 'var(--font-mono)',
    }}>
      {children}
    </button>
  )
}
