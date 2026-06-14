'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (document.cookie.includes('bb_admin=1')) router.replace('/admin')
    else if (document.cookie.match(/bb_client=[^;]+/)) router.replace('/client')
  }, [router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setErr('')
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password }),
    })
    if (res.ok) {
      const { role } = await res.json()
      router.replace(role === 'admin' ? '/admin' : '/client')
    } else {
      const { error } = await res.json()
      setErr(error || 'Wrong username or password')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0a0a 0%,#1a1a2e 100%)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',sans-serif", padding:16 }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:64, height:64, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius:16, marginBottom:16, fontSize:28 }}>✦</div>
          <h1 style={{ color:'#fff', fontSize:28, fontWeight:800, margin:'0 0 4px', letterSpacing:'-0.5px' }}>Emmy Client Work</h1>
          <p style={{ color:'#888', fontSize:14, margin:0 }}>Instagram Grid Preview Studio</p>
        </div>

        {/* Card */}
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:32, backdropFilter:'blur(10px)' }}>
          <h2 style={{ color:'#fff', fontSize:18, fontWeight:700, margin:'0 0 24px' }}>Welcome back</h2>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', color:'#888', fontSize:12, fontWeight:600, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px' }}>Username</label>
              <input
                value={username} onChange={e=>setUsername(e.target.value)}
                placeholder="your username"
                autoFocus autoComplete="username"
                style={{ width:'100%', padding:'12px 14px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#fff', fontSize:15, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
              />
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', color:'#888', fontSize:12, fontWeight:600, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px' }}>Password</label>
              <input
                type="password" value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{ width:'100%', padding:'12px 14px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#fff', fontSize:15, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
              />
            </div>
            {err && <p style={{ color:'#f87171', fontSize:13, margin:'0 0 16px', textAlign:'center' }}>{err}</p>}
            <button type="submit" disabled={loading} style={{ width:'100%', padding:'13px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:700, cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, fontFamily:'inherit' }}>
              {loading ? 'Logging in…' : 'Log In'}
            </button>
          </form>
        </div>

        <p style={{ color:'#444', fontSize:12, textAlign:'center', marginTop:24 }}>© 2026 Emmy Client Work · All rights reserved</p>
      </div>
    </div>
  )
}
