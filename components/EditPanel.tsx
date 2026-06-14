'use client'
import { useState, useEffect } from 'react'
import { Post } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface Props {
  post: Post | null
  onClose: () => void
  onSave: (post: Post) => void
  onDelete: (id: number) => void
}

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1.5px solid #dbdbdb', borderRadius: 8,
  padding: '8px 10px', fontSize: 13, background: '#fff'
}
const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#8e8e8e', textTransform: 'uppercase', marginBottom: 4, display: 'block' }

export default function EditPanel({ post, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState<Post | null>(null)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => { setForm(post ? { ...post } : null) }, [post])

  if (!form) return null

  function set(key: keyof Post, value: unknown) {
    setForm(prev => prev ? { ...prev, [key]: value } : null)
  }

  async function handleSave() {
    if (!form) return
    const supabase = createClient()
    const { data, error } = await supabase.from('posts').upsert(form).select().single()
    if (!error && data) {
      onSave(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  async function handleDelete() {
    if (!form || !confirm('Delete this post?')) return
    const supabase = createClient()
    await supabase.from('posts').delete().eq('id', form.id)
    onDelete(form.id)
    onClose()
  }

  async function uploadFile(file: File, bucket: string, path: string): Promise<string | null> {
    const supabase = createClient()
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) return null
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !form) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const url = await uploadFile(file, 'media', `posts/${form.id}/media.${ext}`)
    if (url) set('media_url', url)
    setUploading(false)
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !form) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const url = await uploadFile(file, 'covers', `covers/${form.id}/cover.${ext}`)
    if (url) set('cover_url', url)
    setUploading(false)
  }

  const open = !!post
  const pillars = ['P1 Gut Education', 'P2 Identity & Lifestyle', 'P3 Social Proof', 'P4 Emotional Storytelling', 'P5 Product in Action']
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const statuses = ['To Film', 'Filming', 'In Edit', 'Ready', 'Posted']

  return (
    <>
      {open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }} />}
      <div style={{
        position: 'fixed', top: 0, right: open ? 0 : -480, width: 440, height: '100vh',
        background: '#fff', zIndex: 101, overflowY: 'auto',
        transition: 'right 0.28s cubic-bezier(.4,0,.2,1)', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)'
      }}>
        {/* Header */}
        <div style={{ background: 'var(--dg)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', fontWeight: 700, fontSize: 16, width: '100%' }}
              placeholder="Post title"
            />
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>EDITING POST #{form.id}</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Type toggle */}
          <div>
            <label style={labelStyle}>Content Type</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['image', 'video'].map(t => (
                <button key={t} onClick={() => set('media_type', t)} style={{
                  flex: 1, padding: '8px', border: '1.5px solid', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  borderColor: form.media_type === t ? 'var(--dg)' : '#dbdbdb',
                  background: form.media_type === t ? 'var(--dg)' : '#fff',
                  color: form.media_type === t ? '#fff' : '#262626'
                }}>{t === 'image' ? '📸 Image / Carousel' : '🎬 Reel / Video'}</button>
              ))}
            </div>
          </div>

          {/* Media upload */}
          <div>
            <label style={labelStyle}>Media</label>
            <label style={{ display: 'block', border: '2px dashed #dbdbdb', borderRadius: 10, padding: '20px', textAlign: 'center', cursor: 'pointer', background: 'var(--ww)' }}>
              {form.media_url ? (
                form.media_type === 'video'
                  ? <video src={form.media_url} style={{ maxHeight: 120, maxWidth: '100%' }} muted />
                  : <img src={form.media_url} style={{ maxHeight: 120, maxWidth: '100%', objectFit: 'cover', borderRadius: 6 }} alt="media" />
              ) : (
                <span style={{ color: '#8e8e8e', fontSize: 13 }}>{uploading ? 'Uploading…' : '↑ Upload media'}</span>
              )}
              <input type="file" accept={form.media_type === 'video' ? 'video/*' : 'image/*'} onChange={handleMediaUpload} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Cover (video only) */}
          {form.media_type === 'video' && (
            <div>
              <label style={labelStyle}>Grid Cover Image <span style={{ fontSize: 10, fontWeight: 400, textTransform: 'none', color: '#8e8e8e' }}>· shown in grid · hover plays reel</span></label>
              <label style={{ display: 'block', border: '2px dashed #dbdbdb', borderRadius: 10, padding: '16px', textAlign: 'center', cursor: 'pointer', background: 'var(--ww)' }}>
                {form.cover_url
                  ? <img src={form.cover_url} style={{ maxHeight: 80, maxWidth: '100%', objectFit: 'cover', borderRadius: 6 }} alt="cover" />
                  : <span style={{ color: '#8e8e8e', fontSize: 13 }}>{uploading ? 'Uploading…' : '↑ Upload cover photo'}</span>
                }
                <input type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />
              </label>
            </div>
          )}

          {/* Hook */}
          <div>
            <label style={labelStyle}>Viral Hook</label>
            <textarea
              value={form.hook || ''}
              onChange={e => set('hook', e.target.value)}
              rows={3}
              style={{ ...inputStyle, background: 'var(--ww)', borderColor: 'var(--fg)', fontStyle: 'italic', resize: 'vertical' }}
              placeholder="The hook that stops the scroll…"
            />
          </div>

          {/* Caption */}
          <div>
            <label style={labelStyle}>Caption <span style={{ fontWeight: 400 }}>({(form.caption || '').length}/2200)</span></label>
            <textarea
              value={form.caption || ''}
              onChange={e => set('caption', e.target.value.slice(0, 2200))}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #dbdbdb', margin: 0 }} />

          {/* Post details grid */}
          <div>
            <label style={labelStyle}>Post Details</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Date', key: 'date' as const, type: 'text', placeholder: 'Jun 16' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ ...labelStyle, fontSize: 10 }}>{f.label}</label>
                  <input style={inputStyle} value={(form[f.key] as string) || ''} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} />
                </div>
              ))}
              <div>
                <label style={{ ...labelStyle, fontSize: 10 }}>Day</label>
                <select style={inputStyle} value={form.day} onChange={e => set('day', e.target.value)}>
                  {days.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: 10 }}>Platform</label>
                <select style={inputStyle} value={form.platform} onChange={e => set('platform', e.target.value)}>
                  <option>Instagram</option><option>TikTok</option>
                </select>
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: 10 }}>Format</label>
                <input style={inputStyle} value={form.format || ''} onChange={e => set('format', e.target.value)} placeholder="Carousel" />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: 10 }}>Week #</label>
                <input style={inputStyle} type="number" value={form.week} onChange={e => set('week', parseInt(e.target.value))} />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: 10 }}>Status</label>
                <select style={inputStyle} value={form.status} onChange={e => set('status', e.target.value)}>
                  {statuses.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Week Theme</label>
            <input style={inputStyle} value={form.theme || ''} onChange={e => set('theme', e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Content Pillar</label>
            <select style={inputStyle} value={form.pillar} onChange={e => set('pillar', e.target.value)}>
              {pillars.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          {/* Hide toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontSize: 13, color: '#262626' }}>Hide from grid preview</label>
            <div
              onClick={() => set('hide', !form.hide)}
              style={{
                width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
                background: form.hide ? '#8e8e8e' : 'var(--dg)',
                position: 'relative', transition: 'background 0.2s'
              }}
            >
              <div style={{
                position: 'absolute', top: 2, left: form.hide ? 2 : 22,
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s'
              }} />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #dbdbdb', margin: 0 }} />

          <button onClick={handleSave} style={{
            background: 'var(--dg)', color: '#fff', border: 'none', borderRadius: 10,
            padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer', width: '100%'
          }}>
            {saved ? '✓ Saved!' : 'Save changes'}
          </button>

          <button onClick={handleDelete} style={{
            background: 'transparent', color: '#e74c3c', border: '1.5px solid #e74c3c',
            borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%'
          }}>
            Delete this post
          </button>
        </div>
      </div>
    </>
  )
}
