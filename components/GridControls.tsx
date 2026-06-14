'use client'
import { getWeekPalette } from '@/lib/weekColors'

interface Props {
  filter: string
  setFilter: (f: string) => void
  weeks: number[]
  isAdmin: boolean
  onAddPost: () => void
  activeTab: string
  setActiveTab: (t: string) => void
}

export default function GridControls({ filter, setFilter, weeks, isAdmin, onAddPost, activeTab, setActiveTab }: Props) {
  const btnBase: React.CSSProperties = {
    border: '1.5px solid #dbdbdb', borderRadius: 20, padding: '5px 14px',
    fontSize: 12, fontWeight: 600, cursor: 'pointer', background: '#fff', color: '#262626'
  }

  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #dbdbdb' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #dbdbdb' }}>
        {[['POSTS', '⊞'], ['REELS', '▷'], ['TAGGED', '🏷']].map(([tab, icon]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '10px', border: 'none', background: 'transparent',
            borderBottom: activeTab === tab ? '2px solid #262626' : '2px solid transparent',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', color: activeTab === tab ? '#262626' : '#8e8e8e',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5
          }}>
            {icon} {tab}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, padding: '10px 12px', alignItems: 'center', overflowX: 'auto', scrollbarWidth: 'none' }}>
        <button onClick={() => setFilter('all')} style={{
          ...btnBase,
          background: filter === 'all' ? '#262626' : '#fff',
          color: filter === 'all' ? '#fff' : '#262626',
          border: filter === 'all' ? '1.5px solid #262626' : '1.5px solid #dbdbdb'
        }}>All</button>

        {weeks.map(w => {
          const pal = getWeekPalette(w)
          const active = filter === `w${w}`
          return (
            <button key={w} onClick={() => setFilter(`w${w}`)} style={{
              ...btnBase,
              borderColor: pal.accent,
              background: active ? pal.accent : '#fff',
              color: active ? '#fff' : pal.accent
            }}>Week {w}</button>
          )
        })}

        <button onClick={() => setFilter('ig')} style={{
          ...btnBase,
          background: filter === 'ig' ? 'var(--pk)' : '#fff',
          borderColor: 'var(--pk)',
          color: filter === 'ig' ? '#fff' : 'var(--pk)'
        }}>📸 IG</button>

        <button onClick={() => setFilter('tt')} style={{
          ...btnBase,
          background: filter === 'tt' ? '#000' : '#fff',
          borderColor: '#000',
          color: filter === 'tt' ? '#fff' : '#000'
        }}>TT</button>

        <div style={{ flex: 1 }} />

        {isAdmin && (
          <span style={{ fontSize: 11, color: '#8e8e8e', fontStyle: 'italic', whiteSpace: 'nowrap', marginRight: 8 }}>⠿ drag to reorder</span>
        )}

        {isAdmin && (
          <button onClick={onAddPost} style={{
            background: 'var(--dg)', color: '#fff', border: 'none', borderRadius: 20,
            padding: '6px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap'
          }}>+ Add post</button>
        )}
      </div>
    </div>
  )
}
