'use client'
import { useRef, useState } from 'react'
import { Post } from '@/lib/types'
import { getWeekPalette } from '@/lib/weekColors'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Props {
  post: Post
  isAdmin: boolean
  onEdit: (post: Post) => void
  filtered: boolean
}

export default function PostTile({ post, isAdmin, onEdit, filtered }: Props) {
  const [hovered, setHovered] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const pal = getWeekPalette(post.week)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: post.id, disabled: !isAdmin })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : post.hide ? 0.2 : 1,
    display: filtered ? 'none' : undefined,
  }

  function handleMouseEnter() {
    setHovered(true)
    if (post.media_type === 'video' && !post.cover_url && videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }

  function handleMouseLeave() {
    setHovered(false)
    if (post.media_type === 'video' && videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, aspectRatio: '1/1', position: 'relative', overflow: 'hidden', cursor: isAdmin ? 'grab' : 'default' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...(isAdmin ? { ...attributes, ...listeners } : {})}
    >
      {/* Background */}
      {post.media_url && post.media_type === 'image' ? (
        <img src={post.media_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : post.media_url && post.media_type === 'video' ? (
        <>
          {post.cover_url && !hovered && (
            <img src={post.cover_url} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          )}
          <video
            ref={videoRef}
            src={post.media_url}
            muted loop playsInline preload="metadata"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </>
      ) : (
        <div style={{
          width: '100%', height: '100%',
          background: `linear-gradient(135deg, ${pal.bg[0]}, ${pal.bg[1]})`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 10
        }}>
          {post.date && (
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
              {post.date} · {post.day}
            </div>
          )}
          <p style={{ fontSize: 10, color: '#fff', textAlign: 'center', lineHeight: 1.4, margin: 0, display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {post.hook}
          </p>
        </div>
      )}

      {/* Badges */}
      <div style={{ position: 'absolute', top: 5, left: 5, display: 'flex', gap: 3 }}>
        <span style={{ background: pal.accent, color: '#fff', fontSize: 8, fontWeight: 800, borderRadius: 8, padding: '2px 5px' }}>W{post.week}</span>
        <span style={{
          background: post.platform === 'Instagram' ? 'var(--pk)' : '#000',
          color: '#fff', fontSize: 8, fontWeight: 800, borderRadius: 8, padding: '2px 5px'
        }}>{post.platform === 'Instagram' ? 'IG' : 'TT'}</span>
      </div>

      {/* Reel icon */}
      {post.media_type === 'video' && (
        <div style={{ position: 'absolute', top: 5, right: 5, color: '#fff', fontSize: 12 }}>▶</div>
      )}

      {/* Position number */}
      <div style={{ position: 'absolute', bottom: 4, right: 6, color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: 700 }}>#{post.position}</div>

      {/* Hover overlay */}
      <div style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.52)',
        opacity: hovered ? 1 : 0, transition: 'opacity 0.2s',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 10, gap: 8
      }}>
        <p style={{ color: '#fff', fontSize: 10, fontStyle: 'italic', textAlign: 'center', margin: 0, lineHeight: 1.4 }}>{post.hook}</p>
        {isAdmin && (
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onEdit(post) }}
            style={{
              background: 'var(--dg)', color: '#fff', border: 'none', borderRadius: 8,
              padding: '5px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer'
            }}
          >Edit post</button>
        )}
      </div>
    </div>
  )
}
