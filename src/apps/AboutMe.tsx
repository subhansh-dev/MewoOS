import { motion } from 'framer-motion'
import { ExternalLink, Mail, Globe, MessageCircle } from 'lucide-react'
import { mediaUrl } from '../config'

export default function AboutMe() {
  return (
    <div style={{
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      textAlign: 'center',
      height: '100%',
    }}>
      <motion.div
        style={{
          width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(232,130,155,0.2)',
          border: '2px solid rgba(255,255,255,0.08)',
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
      >
        <img
          src={mediaUrl("/images/pfp/pfp.jpg")}
          alt="Profile"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            if (target.parentElement) {
              target.parentElement.style.background = 'linear-gradient(135deg, rgba(232,130,155,0.2), rgba(107,63,160,0.2))'
              target.parentElement.innerHTML = '<span style="font-size:28px;color:var(--color-sakura);font-family:var(--font-mono);font-weight:800;display:flex;align-items:center;justify-content:center;height:100%">S</span>'
            }
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: 'var(--color-text-primary)' }}>Subhansh</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, fontWeight: 500 }}>
          Independent AI Researcher & Developer
        </p>
      </motion.div>

      <motion.div
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {['AI/ML', 'Full-Stack', 'Research', 'Open Source'].map(tag => (
          <span
            key={tag}
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(232,130,155,0.06)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-sakura)',
              border: '1px solid rgba(232,130,155,0.08)',
            }}
          >
            {tag}
          </span>
        ))}
      </motion.div>

      <motion.div
        style={{
          background: 'rgba(232,130,155,0.03)',
          backdropFilter: 'blur(16px)',
          borderRadius: 14,
          padding: 18,
          width: '100%',
          textAlign: 'left',
          fontSize: 13,
          lineHeight: 1.7,
          color: 'var(--color-text-secondary)',
          border: '1px solid rgba(232,130,155,0.06)',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p>
          17 y/o. Working on RUMI (autonomous scientific discovery AI), 
          Chronovisor (temporal archaeology engine), and FRIDAY (cognitive AI OS). 
          mewo mewo meow
          <br /><br />
          dc: nernearr
          <br />
          mail: subhansh.dev@gmail.com
        </p>
      </motion.div>

      <motion.div
        style={{ display: 'flex', gap: 12 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[
          { Icon: ExternalLink, label: 'GitHub', href: 'https://github.com/subhansh-dev' },
          { Icon: MessageCircle, label: 'Discord: nernearr', href: '#' },
          { Icon: Mail, label: 'Email', href: 'mailto:subhansh.dev@gmail.com' },
          { Icon: Globe, label: 'Portfolio', href: 'https://subhanshh.vercel.app' },
        ].map(({ Icon, label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={label}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(232,130,155,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-sakura)',
              textDecoration: 'none',
              transition: 'all 0.15s',
              border: '1px solid rgba(232,130,155,0.08)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--color-sakura)'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(232,130,155,0.06)'
              e.currentTarget.style.color = 'var(--color-sakura)'
            }}
          >
            <Icon size={16} />
          </a>
        ))}
      </motion.div>
    </div>
  )
}
