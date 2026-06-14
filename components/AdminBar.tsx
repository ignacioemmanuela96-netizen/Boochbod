'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminBar() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div style={{ background: 'var(--dg)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', fontSize: 13, fontWeight: 600 }}>
      <span>✏️ Edit Mode — BoochBod Grid</span>
      <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: 8, padding: '4px 14px', cursor: 'pointer', fontSize: 12 }}>
        Logout
      </button>
    </div>
  )
}
