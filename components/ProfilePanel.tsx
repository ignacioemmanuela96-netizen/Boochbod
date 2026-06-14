'use client'
import { useState, useEffect } from 'react'
import { Profile, Highlight } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface Props {
  profile: Profile | null
  open: boolean
  onClose: () => void
  onSave: (profile: Profile) => void
}

const inputStyle: React.CSSProperties = { width: '100%', border: '1.5px solid #dbdbdb', borderRadius: 8, padding: '8px 10px', fontSize: 13 }
const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#8e8e8e', textTransform: 'uppercase', marginBottom: 4, display: 'block' }

export default function ProfilePanel({ profile, open, onClose, onSave }: Props) {
  const [form, setForm] = useState<Profile | null>(null)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => { setForm(profile ? { ...profile, highlights: [...(profile.highlights || [])] } : null) }, [profile])

  if (!form) return null

  function setField(key: keyof Profile, value: unknown) {
    setForm(prev => prev ? { ...prev, [key]: value } : null)
  }

  function setHighlight(index: number, key: keyof Highlight, value: unknown) {
    setForm(prev => {
      if (!prev) return null
      const highlights = [...prev.highlights]
      highlights[index] = { ...highlights[index], [key]: value }
      return { ...prev, highlights }
    })
  }

  async function uploadFile(file: File, path: string): Promise<string | null> {
    const supabase = createClient()
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) return null
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const url = await uploadFile(file, `avatar_${Date.now()}.${ext}`)
    if (url) setField('avatar_url', url)
    setUploading(false)
  }

  async function handleHighlightCover(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const url = await uploadFile(file, `highlight_${index}_${Date.now()}.${ext}`)
    if (url) setHighlight(index, 'cover_url', url)
    setUploading(false)
  }

  async function handleSave() {
    if (!form) return
    const supabase = createClient()
    const { data, error } = await supabase.from('profile').upsert(form).select().single()
    if (!error && data) {
      onSave(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  function addHighlight() {
    setForm(prev => {
      if (!prev) return null
      return { ...prev, highlights: [...prev.highlights, { emoji: '✨', label: 'New', bg: '#033F3B' }] }
    })
  }

  function removeHighlight(index: number) {
    setForm(prev => {
      if (!prev) return null
      const highlights = prev.highlights.filter((_, i) => i !== index)
      return { ...prev, highlights }
    })
  }

  return (
    <>
      {open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }} />}
      <div style={{
        position: 'fixed', top: 0, right: open ? 0 : -480, width: 440, height: '100vh',
        background: '#fff', zIndex: 101, overflowY: 'auto',
        transition: 'right 0.28s cubic-bezier(.4,0,.2,1)', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)'
      }}>
        <div style={{ background: 'var(--dg)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>EDITING — Profile & Highlights</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Avatar */}
          <div>
            <label style={labelStyle}>Profile Picture</label>
            <label style={{ display: 'block', width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', border: '2px dashed #dbdbdb' }}>
              {form.avatar_url
                ? <img src={form.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="avatar" />
                : <div style={{ width: '100%', height: '100%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#8e8e8e' }}>
                    {uploading ? '…' : '↑'}
                  </div>
              }
              <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
            </label>
          </div>

          <div><label style={labelStyle}>Username</label><input style={inputStyle} value={form.username} onChange={e => setField('username', e.target.value)} /></div>
          <div><label style={labelStyle}>Display Name</label><input style={inputStyle} value={form.display_name} onChange={e => setField('display_name', e.target.value)} /></div>
          <div><label style={labelStyle}>Bio</label><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={form.bio} onChange={e => setField('bio', e.target.value)} /></div>
          <div><label style={labelStyle}>Link in Bio</label><input style={inputStyle} value={form.link} onChange={e => setField('link', e.target.value)} /></div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={labelStyle}>Followers</label><input style={inputStyle} value={form.followers} onChange={e => setField('followers', e.target.value)} /></div>
            <div><label style={labelStyle}>Following</label><input style={inputStyle} value={form.following} onChange={e => setField('following', e.target.value)} /></div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #dbdbdb', margin: 0 }} />

          {/* Highlights */}
          <div>
            <label style={labelStyle}>Story Highlights</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {form.highlights.map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', flexShrink: 0, background: h.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #dbdbdb' }}>
                    {h.cover_url
                      ? <img src={h.cover_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={h.label} />
                      : h.isBB
                        ? <span style={{ color: 'var(--fg)', fontWeight: 900, fontSize: 11 }}>BB</span>
                        : <span style={{ fontSize: 18 }}>{h.emoji}</span>
                    }
                    <input type="file" accept="image/*" onChange={e => handleHighlightCover(e, i)} style={{ display: 'none' }} />
                  </label>
                  <input style={{ ...inputStyle, width: 50 }} value={h.emoji} onChange={e => setHighlight(i, 'emoji', e.target.value)} />
                  <input style={{ ...inputStyle, flex: 1 }} value={h.label} onChange={e => setHighlight(i, 'label', e.target.value)} />
                  <input type="color" value={h.bg} onChange={e => setHighlight(i, 'bg', e.target.value)} style={{ width: 32, height: 32, border: 'none', borderRadius: '50%', cursor: 'pointer', padding: 0 }} />
                  <button onClick={() => removeHighlight(i)} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#8e8e8e' }}>×</button>
                </div>
              ))}
              <button onClick={addHighlight} style={{ border: '2px dashed #dbdbdb', borderRadius: 10, padding: '8px', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#8e8e8e' }}>
                + Add highlight
              </button>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #dbdbdb', margin: 0 }} />

          <button onClick={handleSave} style={{ background: 'var(--dg)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
            {saved ? '✓ Profile saved!' : 'Save profile'}
          </button>
        </div>
      </div>
    </>
  )
}
