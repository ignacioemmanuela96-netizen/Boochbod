'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError('Wrong password. Try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#033F3B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ width: 360, background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ background: '#033F3B', padding: '40px 32px 32px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#C5D93A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24, fontWeight: 900, color: '#033F3B' }}>BB</div>
          <div style={{ color: '#C5D93A', fontWeight: 900, fontSize: 26, letterSpacing: -1 }}>BoochBod</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>Admin Panel</div>
        </div>
        <form onSubmit={handleLogin} style={{ padding: '32px' }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#8e8e8e', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              autoFocus
              style={{ width: '100%', border: '1.5px solid #dbdbdb', borderRadius: 10, padding: '12px 14px', fontSize: 15, boxSizing: 'border-box' }}
            />
          </div>
          {error && <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: 8, padding: '10px 14px', color: '#c0392b', fontSize: 13, marginBottom: 16 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', background: '#033F3B', color: '#fff', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Logging in…' : 'Log in →'}
          </button>
        </form>
      </div>
    </div>
  )
}
