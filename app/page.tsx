'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (document.cookie.includes('bb_admin=1')) router.replace('/grid')
  }, [router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErr('')
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    })
    if (res.ok) {
      router.replace('/grid')
    } else {
      setErr('Wrong password. Try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#033F3B',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        background: '#FAFDED',
        borderRadius: 24,
        padding: '48px 40px',
        width: '100%',
        maxWidth: 380,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 72,
          height: 72,
          background: 'linear-gradient(135deg, #033F3B, #7DB82A)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: 28,
        }}>🍵</div>
        <h1 style={{ margin: '0 0 4px', color: '#033F3B', fontSize: 26, fontWeight: 800 }}>BoochBod</h1>
        <p style={{ margin: '0 0 32px', color: '#666', fontSize: 14 }}>Instagram Grid Preview</p>

        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Enter password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '2px solid #e0e0e0',
              borderRadius: 12,
              fontSize: 16,
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: 12,
              fontFamily: 'inherit',
            }}
            autoFocus
          />
          {err && <p style={{ color: '#e53e3e', fontSize: 13, margin: '0 0 12px' }}>{err}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: '#033F3B',
              color: '#C5D93A',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  )
}
