'use client'
import { Highlight } from '@/lib/types'

interface Props {
  highlight: Highlight
  onClick?: () => void
}

export default function HighlightBubble({ highlight, onClick }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <div style={{
        width: 62, height: 62, borderRadius: '50%', overflow: 'hidden',
        background: highlight.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2px solid #dbdbdb', flexShrink: 0
      }}>
        {highlight.cover_url ? (
          <img src={highlight.cover_url} alt={highlight.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : highlight.isBB ? (
          <span style={{ color: 'var(--fg)', fontWeight: 900, fontSize: 14 }}>BB</span>
        ) : (
          <span style={{ fontSize: 22 }}>{highlight.emoji}</span>
        )}
      </div>
      <span style={{ fontSize: 11, color: '#262626', maxWidth: 68, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {highlight.label}
      </span>
    </div>
  )
}
