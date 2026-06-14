'use client'
import { useRouter } from 'next/navigation'

export default function AdminBar() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div style={{ background: 'var(--dg)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', fontSize: 13, fontWeight: 600 }}>
      <span>✏️ Edit Mode — BoochBod Grid</span>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <a href="/login" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, textDecoration: 'none' }}>admin panel</a>
        <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: 8, padding: '4px 14px', cursor: 'pointer', fontSize: 12 }}>
          Logout
        </button>
      </div>
    </div>
  )
}
