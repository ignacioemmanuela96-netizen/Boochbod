'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1.5px solid #dbdbdb', borderRadius: 8,
    padding: '12px 14px', fontSize: 14, background: '#fafafa'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 360, background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #dbdbdb' }}>
        <div style={{ background: 'var(--dg)', padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ color: 'var(--fg)', fontWeight: 900, fontSize: 28, letterSpacing: -1 }}>BoochBod</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>Grid Admin</div>
        </div>
        <form onSubmit={handleLogin} style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#8e8e8e', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Email</label>
            <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#8e8e8e', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Password</label>
            <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          {error && <div style={{ color: '#e74c3c', fontSize: 13, background: '#ffeaea', borderRadius: 8, padding: '10px 12px' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{
            background: 'var(--dg)', color: '#fff', border: 'none', borderRadius: 10,
            padding: '13px', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, marginTop: 4
          }}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  )
}
