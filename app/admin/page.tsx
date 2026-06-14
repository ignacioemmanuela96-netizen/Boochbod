'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Client {
  id: string; name: string; username: string; password: string
  brand: string; instagram: string; notes: string; createdAt: string; logoUrl?: string
}

const PURPLE = 'linear-gradient(135deg,#6366f1,#8b5cf6)'

export default function AdminPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [form, setForm] = useState({ name:'', username:'', password:'', brand:'', instagram:'', notes:'' })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [deleteId, setDeleteId] = useState<string|null>(null)

  useEffect(() => {
    if (!document.cookie.includes('bb_admin=1')) { router.replace('/'); return }
    loadClients()
  }, [])

  async function loadClients() {
    setLoading(true)
    const res = await fetch('/api/clients')
    if (res.ok) setClients(await res.json())
    setLoading(false)
  }

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.replace('/')
  }

  function openAdd() {
    setForm({ name:'', username:'', password:'', brand:'', instagram:'', notes:'' })
    setErr(''); setEditClient(null); setShowAdd(true)
  }

  function openEdit(c: Client) {
    setForm({ name:c.name, username:c.username, password:c.password, brand:c.brand, instagram:c.instagram, notes:c.notes })
    setErr(''); setEditClient(c); setShowAdd(true)
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.username || !form.password) { setErr('Name, username, and password are required.'); return }
    setSaving(true); setErr('')
    try {
      const res = editClient
        ? await fetch(`/api/clients/${editClient.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
        : await fetch('/api/clients', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
      if (!res.ok) { const d = await res.json(); setErr(d.error || 'Error'); return }
      await loadClients()
      setShowAdd(false)
    } finally { setSaving(false) }
  }

  async function confirmDelete(id: string) {
    await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    setDeleteId(null)
    await loadClients()
  }

  const s: Record<string,React.CSSProperties> = {
    page: { minHeight:'100vh', background:'#0a0a0f', fontFamily:"'Inter',sans-serif", color:'#fff' },
    topbar: { background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50, backdropFilter:'blur(10px)' } as React.CSSProperties,
    main: { padding:'32px 24px', maxWidth:1000, margin:'0 auto' },
    card: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, overflow:'hidden' },
    clientRow: { display:'flex', alignItems:'center', padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', gap:16 },
    badge: { fontSize:11, padding:'3px 8px', borderRadius:20, fontWeight:600 },
    overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16 } as React.CSSProperties,
    modal: { background:'#141420', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:28, width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto' } as React.CSSProperties,
    label: { display:'block', color:'#888', fontSize:11, fontWeight:600, marginBottom:5, textTransform:'uppercase', letterSpacing:'0.5px' } as React.CSSProperties,
    input: { width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#fff', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit', marginBottom:12 } as React.CSSProperties,
  }

  return (
    <div style={s.page}>
      {/* Top bar */}
      <div style={s.topbar}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:32, height:32, background:PURPLE, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>✦</div>
          <span style={{ fontWeight:800, fontSize:16 }}>Emmy Client Work</span>
          <span style={{ color:'#6366f1', fontSize:12, background:'rgba(99,102,241,0.15)', padding:'2px 8px', borderRadius:20 }}>Admin</span>
        </div>
        <button onClick={logout} style={{ background:'rgba(255,255,255,0.06)', color:'#888', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'6px 14px', cursor:'pointer', fontSize:13 }}>Log Out</button>
      </div>

      <div style={s.main}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
          <div>
            <h1 style={{ margin:0, fontSize:24, fontWeight:800 }}>Clients</h1>
            <p style={{ margin:'4px 0 0', color:'#666', fontSize:14 }}>{clients.length} client{clients.length!==1?'s':''} total</p>
          </div>
          <button onClick={openAdd} style={{ background:PURPLE, color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontWeight:700, cursor:'pointer', fontSize:14 }}>+ New Client</button>
        </div>

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:28 }}>
          {[
            { label:'Total Clients', value:clients.length, color:'#6366f1' },
            { label:'Active Grids', value:clients.length, color:'#10b981' },
            { label:'Pending Review', value:0, color:'#f59e0b' },
          ].map(stat => (
            <div key={stat.label} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'18px 20px' }}>
              <div style={{ color:stat.color, fontSize:28, fontWeight:800 }}>{stat.value}</div>
              <div style={{ color:'#666', fontSize:12, marginTop:4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Client list */}
        <div style={s.card}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', gap:0 }}>
            <span style={{ color:'#666', fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>Client Accounts</span>
          </div>

          {loading
            ? <div style={{ padding:40, textAlign:'center', color:'#444' }}>Loading…</div>
            : clients.length === 0
            ? <div style={{ padding:40, textAlign:'center', color:'#444' }}>No clients yet. Create one above.</div>
            : clients.map(c => (
              <div key={c.id} style={s.clientRow}>
                {/* Avatar */}
                <div style={{ width:44, height:44, borderRadius:12, background:`linear-gradient(135deg,#${c.id.charCodeAt(0).toString(16).repeat(3).slice(0,6)||'6366f1'},#8b5cf6)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:15 }}>{c.name}</div>
                  <div style={{ color:'#666', fontSize:12, marginTop:2 }}>@{c.username} {c.instagram ? `· ${c.instagram}` : ''}</div>
                  {c.notes && <div style={{ color:'#555', fontSize:11, marginTop:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.notes}</div>}
                </div>
                {/* Meta */}
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ color:'#444', fontSize:11, marginBottom:6 }}>{new Date(c.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
                  <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
                    <button onClick={()=>router.push(`/admin/preview/${c.id}`)} style={{ background:'rgba(99,102,241,0.15)', color:'#a5b4fc', border:'none', borderRadius:6, padding:'5px 10px', fontSize:11, cursor:'pointer', fontWeight:600 }}>Preview Grid</button>
                    <button onClick={()=>openEdit(c)} style={{ background:'rgba(255,255,255,0.06)', color:'#ccc', border:'none', borderRadius:6, padding:'5px 10px', fontSize:11, cursor:'pointer' }}>Edit</button>
                    <button onClick={()=>setDeleteId(c.id)} style={{ background:'rgba(239,68,68,0.12)', color:'#f87171', border:'none', borderRadius:6, padding:'5px 10px', fontSize:11, cursor:'pointer' }}>Delete</button>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Add/Edit modal */}
      {showAdd && (
        <div style={s.overlay} onClick={()=>setShowAdd(false)}>
          <div style={s.modal} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h3 style={{ margin:0, fontSize:18, fontWeight:800 }}>{editClient ? 'Edit Client' : 'New Client'}</h3>
              <button onClick={()=>setShowAdd(false)} style={{ background:'none', border:'none', color:'#666', fontSize:24, cursor:'pointer', lineHeight:1 }}>×</button>
            </div>
            <form onSubmit={submitForm}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={s.label}>Client Name *</label>
                  <input style={s.input} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="BoochBod" />
                </div>
                <div>
                  <label style={s.label}>Brand Name</label>
                  <input style={s.input} value={form.brand} onChange={e=>setForm(p=>({...p,brand:e.target.value}))} placeholder="BoochBod" />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={s.label}>Username *</label>
                  <input style={s.input} value={form.username} onChange={e=>setForm(p=>({...p,username:e.target.value.toLowerCase().replace(/\s/g,'')}))} placeholder="boochbod" disabled={!!editClient} />
                </div>
                <div>
                  <label style={s.label}>Password *</label>
                  <input style={s.input} value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} placeholder="••••••••" type="text" />
                </div>
              </div>
              <div>
                <label style={s.label}>Instagram Handle</label>
                <input style={s.input} value={form.instagram} onChange={e=>setForm(p=>({...p,instagram:e.target.value}))} placeholder="@boochbod" />
              </div>
              <div>
                <label style={s.label}>Notes</label>
                <textarea style={{...s.input, resize:'vertical'} as React.CSSProperties} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} rows={3} placeholder="Internal notes about this client…" />
              </div>
              {err && <p style={{ color:'#f87171', fontSize:13, margin:'0 0 12px' }}>{err}</p>}
              <div style={{ display:'flex', gap:10 }}>
                <button type="submit" disabled={saving} style={{ flex:1, padding:'12px', background:PURPLE, color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer' }}>
                  {saving ? 'Saving…' : editClient ? 'Save Changes' : 'Create Client'}
                </button>
                <button type="button" onClick={()=>setShowAdd(false)} style={{ padding:'12px 20px', background:'rgba(255,255,255,0.06)', color:'#888', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, fontSize:14, cursor:'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div style={s.overlay} onClick={()=>setDeleteId(null)}>
          <div style={{ ...s.modal, maxWidth:360, textAlign:'center' }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:40, marginBottom:16 }}>⚠️</div>
            <h3 style={{ margin:'0 0 8px', fontSize:18 }}>Delete client?</h3>
            <p style={{ color:'#888', fontSize:14, margin:'0 0 24px' }}>This will permanently remove their account. Their grid data will remain in storage.</p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>confirmDelete(deleteId)} style={{ flex:1, padding:'12px', background:'#dc2626', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer' }}>Yes, Delete</button>
              <button onClick={()=>setDeleteId(null)} style={{ flex:1, padding:'12px', background:'rgba(255,255,255,0.06)', color:'#888', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, fontSize:14, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
