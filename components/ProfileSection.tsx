'use client'
import { Profile } from '@/lib/types'
import HighlightBubble from './HighlightBubble'

interface Props {
  profile: Profile
  postCount: number
  isAdmin: boolean
  onEditProfile?: () => void
}

export default function ProfileSection({ profile, postCount, isAdmin, onEditProfile }: Props) {
  const bioLines = profile.bio.split('\n')

  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #dbdbdb', padding: '20px 16px 0' }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 14 }}>
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 94, height: 94, borderRadius: '50%',
            background: 'conic-gradient(#FFB4DB, #C5D93A, #FFB4DB)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ width: 86, height: 86, borderRadius: '50%', overflow: 'hidden', background: '#eee', border: '3px solid #fff' }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--dg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'var(--fg)', fontWeight: 900, fontSize: 22 }}>BB</span>
                </div>
              )}
            </div>
          </div>
          {isAdmin && (
            <button onClick={onEditProfile} style={{
              position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%',
              background: 'var(--dg)', border: '2px solid #fff', color: '#fff', fontSize: 11,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>✏️</button>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontWeight: 600, fontSize: 18, color: '#262626' }}>@{profile.username}</span>
            {isAdmin && (
              <button onClick={onEditProfile} style={{
                background: 'transparent', border: '1px solid #dbdbdb', borderRadius: 8,
                padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#262626'
              }}>Edit Profile</button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 24, marginBottom: 10 }}>
            {[['posts', postCount], ['followers', profile.followers], ['following', profile.following]].map(([label, val]) => (
              <div key={label as string} style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#262626' }}>{val}</div>
                <div style={{ fontSize: 12, color: '#8e8e8e' }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#262626', marginBottom: 2 }}>{profile.display_name}</div>
          {bioLines.map((line, i) => (
            <div key={i} style={{ fontSize: 13, color: '#262626', lineHeight: 1.4 }}>{line}</div>
          ))}
          {profile.link && (
            <div style={{ fontSize: 13, color: '#00376b', marginTop: 2 }}>🔗 {profile.link}</div>
          )}
        </div>
      </div>

      {/* Highlights */}
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 14, paddingTop: 4, scrollbarWidth: 'none' }}>
        {profile.highlights.map((h, i) => (
          <HighlightBubble key={i} highlight={h} />
        ))}
      </div>
    </div>
  )
}
