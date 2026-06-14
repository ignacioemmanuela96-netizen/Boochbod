'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Sortable from 'sortablejs'

// ─── Types ───────────────────────────────────────────────────────────────────
interface Highlight { emoji: string; label: string; bg: string; isBB?: boolean; coverUrl?: string }
interface Profile {
  username: string; displayName: string; bio: string; link: string
  followers: string; following: string; avatarUrl?: string
  highlights: Highlight[]
}
interface Post {
  id: number; title: string; hook: string; caption: string; date: string
  day: string; week: number; theme: string; platform: string; format: string
  pillar: string; mediaType: 'image' | 'video'; mediaUrl?: string; coverUrl?: string
  hide: boolean; position: number; status: string
}

// ─── Color palettes ───────────────────────────────────────────────────────────
const WP: Array<null | { bg: [string, string]; c: string }> = [
  null,
  { bg: ['#0d2d4a', '#4A90D9'], c: '#4A90D9' },
  { bg: ['#033F3B', '#7DB82A'], c: '#7DB82A' },
  { bg: ['#2d0d4a', '#A855C8'], c: '#A855C8' },
  { bg: ['#4a1f00', '#E07B2F'], c: '#E07B2F' },
  { bg: ['#001a2e', '#00D4FF'], c: '#00D4FF' },
  { bg: ['#1a2d00', '#A3E635'], c: '#A3E635' },
  { bg: ['#2d001a', '#FF6B9D'], c: '#FF6B9D' },
  { bg: ['#1a1a00', '#FFD700'], c: '#FFD700' },
]

// ─── IndexedDB helpers ────────────────────────────────────────────────────────
const DB_NAME = 'bb_media_v2'
let dbPromise: Promise<IDBDatabase> | null = null
function getDB(): Promise<IDBDatabase> {
  if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = e => (e.target as IDBOpenDBRequest).result.createObjectStore('media')
    req.onsuccess = e => resolve((e.target as IDBOpenDBRequest).result)
    req.onerror = e => reject((e.target as IDBOpenDBRequest).error)
  })
  return dbPromise
}
async function saveBlob(id: string, blob: Blob) {
  const db = await getDB()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('media', 'readwrite')
    tx.objectStore('media').put(blob, id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
async function loadBlob(id: string): Promise<string | null> {
  try {
    const db = await getDB()
    return new Promise((resolve) => {
      const tx = db.transaction('media', 'readonly')
      const req = tx.objectStore('media').get(id)
      req.onsuccess = () => {
        if (req.result) resolve(URL.createObjectURL(req.result))
        else resolve(null)
      }
      req.onerror = () => resolve(null)
    })
  } catch { return null }
}
async function deleteBlob(id: string) {
  try {
    const db = await getDB()
    const tx = db.transaction('media', 'readwrite')
    tx.objectStore('media').delete(id)
  } catch {}
}

// ─── Default data ─────────────────────────────────────────────────────────────
const DEFAULT_PROFILE: Profile = {
  username: 'boochbod', displayName: 'BoochBod',
  bio: 'probiotic kombucha gummy 🍵\ngut health for women who want to feel themselves again',
  link: 'linkinbio.boochbod.com', followers: '14.2K', following: '312',
  highlights: [
    { emoji: 'BB', label: 'About Us', bg: '#033F3B', isBB: true },
    { emoji: '✨', label: 'Results', bg: '#FFB4DB' },
    { emoji: '🧬', label: 'Gut Facts', bg: '#C5D93A' },
    { emoji: '⭐', label: 'Reviews', bg: '#ffd700' },
    { emoji: '🍬', label: 'Product', bg: '#033F3B' },
  ]
}

const SEED: Post[] = [
  { id: 1, title: "You're Not Alone", hook: "I was bloated after every meal for 3 years. 45 days of BoochBod — I haven't been bloated since week 2.", caption: '', date: 'Jun 16', day: 'Mon', week: 1, theme: "You're Not Alone", platform: 'TikTok', format: 'Face-to-cam UGC', pillar: 'P3 Social Proof', mediaType: 'video', hide: false, position: 1, status: 'To Film' },
  { id: 2, title: 'Your Gut Is Talking', hook: "Your gut is talking. Here's what it's saying.", caption: '', date: 'Jun 17', day: 'Tue', week: 1, theme: "You're Not Alone", platform: 'Instagram', format: 'Carousel', pillar: 'P1 Gut Education', mediaType: 'image', hide: false, position: 2, status: 'To Film' },
  { id: 3, title: 'Gut Health Girlie', hook: 'This is what a gut health girlie looks like.', caption: '', date: 'Jun 18', day: 'Wed', week: 1, theme: "You're Not Alone", platform: 'Instagram', format: 'Static', pillar: 'P2 Identity & Lifestyle', mediaType: 'image', hide: false, position: 3, status: 'To Film' },
  { id: 4, title: 'Cancel Plans No More', hook: "I used to cancel plans because of my gut. I don't anymore.", caption: '', date: 'Jun 19', day: 'Thu', week: 1, theme: "You're Not Alone", platform: 'TikTok', format: 'Reel', pillar: 'P4 Emotional Storytelling', mediaType: 'video', hide: false, position: 4, status: 'To Film' },
  { id: 5, title: 'Morning Routine Breakdown', hook: 'How I take my BoochBod: my morning routine breakdown.', caption: '', date: 'Jun 20', day: 'Fri', week: 1, theme: "You're Not Alone", platform: 'Instagram', format: 'Carousel', pillar: 'P5 Product in Action', mediaType: 'image', hide: false, position: 5, status: 'To Film' },
  { id: 6, title: 'One Gummy Changed Everything', hook: 'One gummy with breakfast changed everything.', caption: '', date: 'Jun 23', day: 'Mon', week: 2, theme: 'Small Habits Big Results', platform: 'TikTok', format: 'Face-to-cam UGC', pillar: 'P5 Product in Action', mediaType: 'video', hide: false, position: 6, status: 'To Film' },
  { id: 7, title: '5 Foods Destroying Your Gut', hook: '5 foods that are secretly destroying your gut.', caption: '', date: 'Jun 24', day: 'Tue', week: 2, theme: 'Small Habits Big Results', platform: 'Instagram', format: 'Carousel', pillar: 'P1 Gut Education', mediaType: 'image', hide: false, position: 7, status: 'To Film' },
  { id: 8, title: '2,847 Women Fixed Bloat', hook: '2,847 women said this fixed their bloat.', caption: '', date: 'Jun 25', day: 'Wed', week: 2, theme: 'Small Habits Big Results', platform: 'Instagram', format: 'Static', pillar: 'P3 Social Proof', mediaType: 'image', hide: false, position: 8, status: 'To Film' },
  { id: 9, title: 'Day in My Life', hook: 'Day in my life as someone who actually takes care of their gut.', caption: '', date: 'Jun 26', day: 'Thu', week: 2, theme: 'Small Habits Big Results', platform: 'TikTok', format: 'Duet / Stitch', pillar: 'P2 Identity & Lifestyle', mediaType: 'video', hide: false, position: 9, status: 'To Film' },
  { id: 10, title: 'Before vs. After 30 Days', hook: 'Before BoochBod vs. after: a 30-day diary.', caption: '', date: 'Jun 27', day: 'Fri', week: 2, theme: 'Small Habits Big Results', platform: 'Instagram', format: 'Carousel', pillar: 'P4 Emotional Storytelling', mediaType: 'image', hide: false, position: 10, status: 'To Film' },
  { id: 11, title: 'The Identity Shift', hook: "I stopped identifying as 'the bloated one' and this is what happened.", caption: '', date: 'Jun 30', day: 'Mon', week: 3, theme: 'The Identity Shift', platform: 'TikTok', format: 'Reel', pillar: 'P2 Identity & Lifestyle', mediaType: 'video', hide: false, position: 11, status: 'To Film' },
  { id: 12, title: 'Gut-Brain Connection', hook: "The gut-brain connection nobody talks about.", caption: '', date: 'Jul 1', day: 'Tue', week: 3, theme: 'The Identity Shift', platform: 'Instagram', format: 'Carousel', pillar: 'P1 Gut Education', mediaType: 'image', hide: false, position: 12, status: 'To Film' },
  { id: 13, title: 'BoochBod Starter Kit', hook: 'Your BoochBod starter kit.', caption: '', date: 'Jul 2', day: 'Wed', week: 3, theme: 'The Identity Shift', platform: 'Instagram', format: 'Static', pillar: 'P5 Product in Action', mediaType: 'image', hide: false, position: 13, status: 'To Film' },
  { id: 14, title: 'Dressing Room Moment', hook: 'I cried in a dressing room because I felt so good in my body.', caption: '', date: 'Jul 3', day: 'Thu', week: 3, theme: 'The Identity Shift', platform: 'TikTok', format: 'Face-to-cam UGC', pillar: 'P4 Emotional Storytelling', mediaType: 'video', hide: false, position: 14, status: 'To Film' },
  { id: 15, title: '60-Day Transformation', hook: "She tried BoochBod for 60 days. Here's what happened.", caption: '', date: 'Jul 4', day: 'Fri', week: 3, theme: 'The Identity Shift', platform: 'Instagram', format: 'Carousel', pillar: 'P3 Social Proof', mediaType: 'image', hide: false, position: 15, status: 'To Film' },
  { id: 16, title: 'Doctor Reacts', hook: 'Doctor reacts to BoochBod ingredients.', caption: '', date: 'Jul 7', day: 'Mon', week: 4, theme: 'Proof + Push', platform: 'TikTok', format: 'Face-to-cam UGC', pillar: 'P3 Social Proof', mediaType: 'video', hide: false, position: 16, status: 'To Film' },
  { id: 17, title: 'Gummies Work Better', hook: 'Why probiotics in gummy form actually work better.', caption: '', date: 'Jul 8', day: 'Tue', week: 4, theme: 'Proof + Push', platform: 'Instagram', format: 'Carousel', pillar: 'P1 Gut Education', mediaType: 'image', hide: false, position: 17, status: 'To Film' },
  { id: 18, title: '3PM Energy Crash', hook: 'The 3pm energy crash is not normal.', caption: '', date: 'Jul 9', day: 'Wed', week: 4, theme: 'Proof + Push', platform: 'Instagram', format: 'Static', pillar: 'P2 Identity & Lifestyle', mediaType: 'image', hide: false, position: 18, status: 'To Film' },
  { id: 19, title: "Mom's Gut Health Journey", hook: 'My mom started taking BoochBod and now we talk about gut health at dinner.', caption: '', date: 'Jul 10', day: 'Thu', week: 4, theme: 'Proof + Push', platform: 'TikTok', format: 'Duet / Stitch', pillar: 'P4 Emotional Storytelling', mediaType: 'video', hide: false, position: 19, status: 'To Film' },
  { id: 20, title: '4-Week Gut Reset', hook: 'Your 4-week gut reset plan. Starting now.', caption: '', date: 'Jul 11', day: 'Fri', week: 4, theme: 'Proof + Push', platform: 'Instagram', format: 'Carousel', pillar: 'P5 Product in Action', mediaType: 'image', hide: false, position: 20, status: 'To Film' },
]

const STATUSES = ['To Film', 'Filmed', 'Editing', 'Scheduled', 'Posted']
const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Pinterest']
const FORMATS = ['Static', 'Carousel', 'Reel', 'Story', 'Face-to-cam UGC', 'Duet / Stitch']
const PILLARS = ['P1 Gut Education', 'P2 Identity & Lifestyle', 'P3 Social Proof', 'P4 Emotional Storytelling', 'P5 Product in Action']
const STATUS_COLORS: Record<string, string> = {
  'To Film': '#666', Filmed: '#4A90D9', Editing: '#E07B2F', Scheduled: '#A855C8', Posted: '#7DB82A'
}

// ─── Main Grid Page ───────────────────────────────────────────────────────────
export default function GridPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [order, setOrder] = useState<number[]>([])
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE)
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({})
  const [editPost, setEditPost] = useState<Post | null>(null)
  const [editProfile, setEditProfile] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile>(DEFAULT_PROFILE)
  const [addPanel, setAddPanel] = useState(false)
  const [newPost, setNewPost] = useState<Partial<Post>>({ mediaType: 'image', week: 1, status: 'To Film' })
  const [activePanel, setActivePanel] = useState<'edit' | 'profile' | 'add' | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const sortableRef = useRef<Sortable | null>(null)
  const nextId = useRef(21)

  // ─── Auth check ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!document.cookie.includes('bb_admin=1')) {
      router.replace('/')
    } else {
      loadAll()
    }
  }, [])

  // ─── Load from storage ───────────────────────────────────────────────────────
  async function loadAll() {
    const ps = localStorage.getItem('bb_posts_v4')
    const or = localStorage.getItem('bb_order_v4')
    const pr = localStorage.getItem('bb_profile_v1')
    const loadedPosts: Post[] = ps ? JSON.parse(ps) : SEED.map(p => ({ ...p }))
    const loadedOrder: number[] = or ? JSON.parse(or) : loadedPosts.map(p => p.id)
    if (!ps) {
      localStorage.setItem('bb_posts_v4', JSON.stringify(loadedPosts))
      localStorage.setItem('bb_order_v4', JSON.stringify(loadedOrder))
    }
    const loadedProfile: Profile = pr ? JSON.parse(pr) : DEFAULT_PROFILE
    setPosts(loadedPosts)
    setOrder(loadedOrder)
    setProfile(loadedProfile)
    if (loadedPosts.length > 0) nextId.current = Math.max(...loadedPosts.map(p => p.id)) + 1

    // load blobs
    const urls: Record<string, string> = {}
    for (const p of loadedPosts) {
      if (!p.mediaUrl && !p.coverUrl) {
        const media = await loadBlob(`post_${p.id}_media`)
        const cover = await loadBlob(`post_${p.id}_cover`)
        if (media) urls[`post_${p.id}_media`] = media
        if (cover) urls[`post_${p.id}_cover`] = cover
      }
    }
    const avatar = await loadBlob('profile_avatar')
    if (avatar) urls['profile_avatar'] = avatar
    setBlobUrls(urls)
    setReady(true)
  }

  function savePosts(p: Post[], o: number[]) {
    localStorage.setItem('bb_posts_v4', JSON.stringify(p))
    localStorage.setItem('bb_order_v4', JSON.stringify(o))
  }

  function saveProfile(pr: Profile) {
    localStorage.setItem('bb_profile_v1', JSON.stringify(pr))
  }

  // ─── Sortable init ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready || !gridRef.current) return
    if (sortableRef.current) sortableRef.current.destroy()
    sortableRef.current = Sortable.create(gridRef.current, {
      animation: 200,
      ghostClass: 'sortable-ghost',
      filter: '.tile-add',
      onEnd: () => {
        const tiles = gridRef.current?.querySelectorAll('.sortable-tile')
        if (!tiles) return
        const newOrder = Array.from(tiles).map(t => Number((t as HTMLElement).dataset.id))
        setOrder(newOrder)
        setPosts(prev => {
          savePosts(prev, newOrder)
          return prev
        })
      },
    })
    return () => { sortableRef.current?.destroy() }
  }, [ready])

  // ─── Logout ──────────────────────────────────────────────────────────────────
  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.replace('/')
  }

  // ─── Add post ────────────────────────────────────────────────────────────────
  function openAdd() { setNewPost({ mediaType: 'image', week: 1, status: 'To Film' }); setActivePanel('add') }

  async function handleAddMedia(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const blob = new Blob([await file.arrayBuffer()], { type: file.type })
    const isVideo = file.type.startsWith('video')
    setNewPost(p => ({ ...p, mediaType: isVideo ? 'video' : 'image', _pendingBlob: blob, _pendingName: file.name } as Partial<Post> & { _pendingBlob?: Blob; _pendingName?: string }))
    const url = URL.createObjectURL(blob)
    setBlobUrls(prev => ({ ...prev, _new_media: url }))
  }

  async function submitAdd() {
    const id = nextId.current++
    const base = newPost as Partial<Post> & { _pendingBlob?: Blob }
    const p: Post = {
      id,
      title: base.title || `Post ${id}`,
      hook: base.hook || '',
      caption: base.caption || '',
      date: base.date || '',
      day: base.day || '',
      week: base.week || 1,
      theme: base.theme || '',
      platform: base.platform || 'Instagram',
      format: base.format || 'Static',
      pillar: base.pillar || 'P1 Gut Education',
      mediaType: base.mediaType || 'image',
      hide: false,
      position: posts.length + 1,
      status: base.status || 'To Film',
    }
    const pending = (newPost as Partial<Post> & { _pendingBlob?: Blob; _pendingName?: string })._pendingBlob
    if (pending) {
      await saveBlob(`post_${id}_media`, pending)
      const url = blobUrls['_new_media']
      if (url) setBlobUrls(prev => { const n = { ...prev }; n[`post_${id}_media`] = url; delete n['_new_media']; return n })
    }
    const newPosts = [...posts, p]
    const newOrder = [...order, id]
    setPosts(newPosts)
    setOrder(newOrder)
    savePosts(newPosts, newOrder)
    setActivePanel(null)
  }

  // ─── Edit post ───────────────────────────────────────────────────────────────
  function openEdit(post: Post) { setEditPost({ ...post }); setActivePanel('edit') }

  async function handleEditMedia(e: React.ChangeEvent<HTMLInputElement>, key: 'media' | 'cover') {
    const file = e.target.files?.[0]
    if (!file || !editPost) return
    const blob = new Blob([await file.arrayBuffer()], { type: file.type })
    const blobKey = `post_${editPost.id}_${key}`
    await saveBlob(blobKey, blob)
    const url = URL.createObjectURL(blob)
    setBlobUrls(prev => ({ ...prev, [blobKey]: url }))
    if (key === 'media') setEditPost(p => p ? { ...p, mediaType: file.type.startsWith('video') ? 'video' : 'image' } : p)
  }

  async function removeMedia(id: number, key: 'media' | 'cover') {
    const blobKey = `post_${id}_${key}`
    await deleteBlob(blobKey)
    setBlobUrls(prev => { const n = { ...prev }; delete n[blobKey]; return n })
  }

  function saveEdit() {
    if (!editPost) return
    const updated = posts.map(p => p.id === editPost.id ? editPost : p)
    setPosts(updated)
    savePosts(updated, order)
    setActivePanel(null)
    setEditPost(null)
  }

  function deletePost(id: number) {
    const updated = posts.filter(p => p.id !== id)
    const newOrder = order.filter(o => o !== id)
    setPosts(updated)
    setOrder(newOrder)
    savePosts(updated, newOrder)
    deleteBlob(`post_${id}_media`)
    deleteBlob(`post_${id}_cover`)
    setActivePanel(null)
    setEditPost(null)
  }

  function toggleHide(id: number) {
    const updated = posts.map(p => p.id === id ? { ...p, hide: !p.hide } : p)
    setPosts(updated)
    savePosts(updated, order)
    if (editPost?.id === id) setEditPost(p => p ? { ...p, hide: !p.hide } : p)
  }

  // ─── Profile ─────────────────────────────────────────────────────────────────
  function openProfileEdit() { setEditingProfile({ ...profile, highlights: profile.highlights.map(h => ({ ...h })) }); setActivePanel('profile') }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const blob = new Blob([await file.arrayBuffer()], { type: file.type })
    await saveBlob('profile_avatar', blob)
    const url = URL.createObjectURL(blob)
    setBlobUrls(prev => ({ ...prev, profile_avatar: url }))
  }

  function saveProfileEdit() {
    setProfile(editingProfile)
    saveProfile(editingProfile)
    setActivePanel(null)
  }

  function updateHighlight(i: number, key: keyof Highlight, val: string | boolean) {
    setEditingProfile(p => {
      const hl = [...p.highlights]
      hl[i] = { ...hl[i], [key]: val }
      return { ...p, highlights: hl }
    })
  }

  function addHighlight() {
    setEditingProfile(p => ({ ...p, highlights: [...p.highlights, { emoji: '⭐', label: 'New', bg: '#033F3B' }] }))
  }

  function removeHighlight(i: number) {
    setEditingProfile(p => ({ ...p, highlights: p.highlights.filter((_, idx) => idx !== i) }))
  }

  // ─── Ordered visible posts ───────────────────────────────────────────────────
  const postMap = Object.fromEntries(posts.map(p => [p.id, p]))
  const orderedPosts = order.map(id => postMap[id]).filter(Boolean)

  const avatarUrl = blobUrls['profile_avatar'] || profile.avatarUrl

  if (!ready) return (
    <div style={{ minHeight: '100vh', background: '#033F3B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C5D93A', fontSize: 18 }}>
      Loading…
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .sortable-ghost { opacity: 0.3; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #444; border-radius: 3px; }
        input, textarea, select { font-family: inherit; }
        .panel-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; }
        .slide-panel { position: fixed; top: 0; right: 0; height: 100vh; width: 420px; background: #1e1e1e; border-left: 1px solid #333; z-index: 101; overflow-y: auto; padding: 24px; transform: translateX(0); }
        @media (max-width: 480px) { .slide-panel { width: 100vw; } }
        .field-label { font-size: 11px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .field-input { width: 100%; padding: 10px 12px; background: #2a2a2a; border: 1px solid #444; border-radius: 8px; color: #fff; font-size: 14px; outline: none; }
        .field-input:focus { border-color: #C5D93A; }
        .btn-primary { background: #C5D93A; color: #033F3B; border: none; border-radius: 10px; padding: 12px 20px; font-size: 14px; font-weight: 700; cursor: pointer; width: 100%; }
        .btn-danger { background: #e53e3e; color: #fff; border: none; border-radius: 10px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 8px; }
        .btn-ghost { background: transparent; color: #888; border: 1px solid #444; border-radius: 10px; padding: 10px 20px; font-size: 14px; cursor: pointer; width: 100%; margin-top: 8px; }
        .tile:hover .tile-overlay { opacity: 1; }
        .tile-overlay { opacity: 0; transition: opacity 0.2s; }
        .tab-btn { padding: 6px 14px; border-radius: 20px; border: none; cursor: pointer; font-size: 12px; font-weight: 600; }
      `}</style>

      {/* ── Top bar ── */}
      <div style={{ background: '#033F3B', borderBottom: '1px solid #0a5a54', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #7DB82A, #C5D93A)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🍵</div>
          <span style={{ color: '#C5D93A', fontWeight: 800, fontSize: 16 }}>BoochBod</span>
          <span style={{ color: '#7DB82A', fontSize: 12 }}>Grid Preview</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={openAdd} style={{ background: '#C5D93A', color: '#033F3B', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>+ Add Post</button>
          <button onClick={openProfileEdit} style={{ background: 'transparent', color: '#C5D93A', border: '1px solid #7DB82A', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}>Edit Profile</button>
          <button onClick={logout} style={{ background: 'transparent', color: '#888', border: '1px solid #444', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}>Log Out</button>
        </div>
      </div>

      {/* ── Instagram profile section ── */}
      <div style={{ background: '#000', padding: '20px 16px 0', maxWidth: 480, margin: '0 auto' }}>
        {/* Avatar + stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '0 4px 16px' }}>
          <div style={{ flexShrink: 0 }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid #333' }} />
              : <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #033F3B, #7DB82A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, border: '2px solid #333' }}>🍵</div>
            }
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around' }}>
            {[['Posts', orderedPosts.filter(p => !p.hide).length.toString()], ['Followers', profile.followers], ['Following', profile.following]].map(([label, val]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>{val}</div>
                <div style={{ color: '#aaa', fontSize: 12 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Bio */}
        <div style={{ padding: '0 4px 12px' }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{profile.displayName}</div>
          <div style={{ color: '#ddd', fontSize: 13, whiteSpace: 'pre-line', marginTop: 2 }}>{profile.bio}</div>
          {profile.link && <div style={{ color: '#4A90D9', fontSize: 13, marginTop: 4 }}>🔗 {profile.link}</div>}
        </div>
        {/* Highlights */}
        <div style={{ display: 'flex', gap: 12, padding: '0 4px 16px', overflowX: 'auto' }}>
          {profile.highlights.map((h, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: h.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: h.isBB ? 11 : 22, fontWeight: h.isBB ? 800 : 400, color: '#fff', border: '2px solid #333' }}>
                {h.isBB ? 'BB' : h.emoji}
              </div>
              <span style={{ color: '#ddd', fontSize: 11 }}>{h.label}</span>
            </div>
          ))}
        </div>
        {/* Tab bar */}
        <div style={{ display: 'flex', borderTop: '1px solid #333' }}>
          {['⊞', '☰', '♡'].map((icon, i) => (
            <button key={i} style={{ flex: 1, background: 'none', border: 'none', color: i === 0 ? '#fff' : '#666', fontSize: 20, padding: '10px 0', cursor: 'pointer', borderBottom: i === 0 ? '2px solid #fff' : '2px solid transparent' }}>{icon}</button>
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      <div style={{ background: '#000', maxWidth: 480, margin: '0 auto' }}>
        <div
          ref={gridRef}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, padding: 0 }}
        >
          {orderedPosts.map(post => {
            const w = WP[post.week] || WP[2]!
            const mediaKey = `post_${post.id}_media`
            const coverKey = `post_${post.id}_cover`
            const mediaSrc = blobUrls[mediaKey] || post.mediaUrl
            const coverSrc = blobUrls[coverKey] || post.coverUrl
            const displaySrc = coverSrc || (post.mediaType === 'image' ? mediaSrc : undefined)
            return (
              <div
                key={post.id}
                data-id={post.id}
                className="tile sortable-tile"
                style={{ position: 'relative', aspectRatio: '1', cursor: 'grab', opacity: post.hide ? 0.35 : 1 }}
                onClick={() => openEdit(post)}
              >
                {displaySrc
                  ? <img src={displaySrc} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${w.bg[0]}, ${w.bg[1]})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 8, gap: 4 }}>
                      <div style={{ color: w.c, fontSize: 9, fontWeight: 700, textAlign: 'center', lineHeight: 1.3, opacity: 0.7 }}>W{post.week}</div>
                      <div style={{ color: '#fff', fontSize: 9, fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>{post.hook.slice(0, 50)}{post.hook.length > 50 ? '…' : ''}</div>
                    </div>
                }
                <div className="tile-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 6 }}>
                  <div style={{ color: '#fff', fontSize: 8, textAlign: 'center', lineHeight: 1.4 }}>{post.hook.slice(0, 60)}</div>
                  <div style={{ fontSize: 8, padding: '2px 6px', borderRadius: 10, background: STATUS_COLORS[post.status] || '#666', color: '#fff', fontWeight: 600 }}>{post.status}</div>
                </div>
                {post.mediaType === 'video' && mediaSrc && !coverSrc && (
                  <div style={{ position: 'absolute', top: 4, right: 4, color: '#fff', fontSize: 12 }}>▶</div>
                )}
                {post.hide && (
                  <div style={{ position: 'absolute', top: 4, left: 4, fontSize: 10, color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '1px 4px', borderRadius: 4 }}>hidden</div>
                )}
              </div>
            )
          })}
          {/* Add tile */}
          <div
            className="tile-add"
            onClick={openAdd}
            style={{ aspectRatio: '1', background: '#111', border: '2px dashed #333', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 28, color: '#444' }}
          >+</div>
        </div>
      </div>

      {/* ── Panel overlay ── */}
      {activePanel && (
        <div className="panel-overlay" onClick={() => setActivePanel(null)} />
      )}

      {/* ── Edit post panel ── */}
      {activePanel === 'edit' && editPost && (
        <div className="slide-panel" onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ color: '#fff', margin: 0, fontSize: 16 }}>Edit Post</h3>
            <button onClick={() => setActivePanel(null)} style={{ background: 'none', border: 'none', color: '#888', fontSize: 22, cursor: 'pointer' }}>×</button>
          </div>

          {/* Media preview */}
          <div style={{ marginBottom: 16 }}>
            {(() => {
              const mediaKey = `post_${editPost.id}_media`
              const coverKey = `post_${editPost.id}_cover`
              const mediaSrc = blobUrls[mediaKey] || editPost.mediaUrl
              const coverSrc = blobUrls[coverKey] || editPost.coverUrl
              return (
                <div style={{ background: '#2a2a2a', borderRadius: 10, overflow: 'hidden', aspectRatio: '1', marginBottom: 8 }}>
                  {coverSrc
                    ? <img src={coverSrc} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : editPost.mediaType === 'video' && mediaSrc
                    ? <video src={mediaSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls />
                    : mediaSrc
                    ? <img src={mediaSrc} alt="media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 14 }}>No media</div>
                  }
                </div>
              )
            })()}
            <div style={{ display: 'flex', gap: 8 }}>
              <label style={{ flex: 1, background: '#2a2a2a', border: '1px solid #444', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', color: '#ccc', fontSize: 12, textAlign: 'center' }}>
                📷 Upload Media
                <input type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={e => handleEditMedia(e, 'media')} />
              </label>
              <label style={{ flex: 1, background: '#2a2a2a', border: '1px solid #444', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', color: '#ccc', fontSize: 12, textAlign: 'center' }}>
                🖼 Cover Image
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleEditMedia(e, 'cover')} />
              </label>
            </div>
            {(blobUrls[`post_${editPost.id}_media`] || blobUrls[`post_${editPost.id}_cover`]) && (
              <button onClick={() => { removeMedia(editPost.id, 'media'); removeMedia(editPost.id, 'cover') }} style={{ marginTop: 6, background: 'none', border: '1px solid #555', borderRadius: 6, color: '#888', fontSize: 11, padding: '4px 10px', cursor: 'pointer', width: '100%' }}>Remove media</button>
            )}
          </div>

          <Field label="Title" value={editPost.title} onChange={v => setEditPost(p => p ? { ...p, title: v } : p)} />
          <Field label="Hook (main text)" value={editPost.hook} onChange={v => setEditPost(p => p ? { ...p, hook: v } : p)} multiline />
          <Field label="Caption" value={editPost.caption} onChange={v => setEditPost(p => p ? { ...p, caption: v } : p)} multiline />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <div className="field-label">Date</div>
              <input className="field-input" value={editPost.date} onChange={e => setEditPost(p => p ? { ...p, date: e.target.value } : p)} />
            </div>
            <div>
              <div className="field-label">Day</div>
              <input className="field-input" value={editPost.day} onChange={e => setEditPost(p => p ? { ...p, day: e.target.value } : p)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <div className="field-label">Week</div>
              <select className="field-input" value={editPost.week} onChange={e => setEditPost(p => p ? { ...p, week: Number(e.target.value) } : p)}>
                {[1,2,3,4,5,6,7,8].map(w => <option key={w} value={w}>Week {w}</option>)}
              </select>
            </div>
            <div>
              <div className="field-label">Status</div>
              <select className="field-input" value={editPost.status} onChange={e => setEditPost(p => p ? { ...p, status: e.target.value } : p)}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div className="field-label">Platform</div>
            <select className="field-input" value={editPost.platform} onChange={e => setEditPost(p => p ? { ...p, platform: e.target.value } : p)}>
              {PLATFORMS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div className="field-label">Format</div>
            <select className="field-input" value={editPost.format} onChange={e => setEditPost(p => p ? { ...p, format: e.target.value } : p)}>
              {FORMATS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div className="field-label">Content Pillar</div>
            <select className="field-input" value={editPost.pillar} onChange={e => setEditPost(p => p ? { ...p, pillar: e.target.value } : p)}>
              {PILLARS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <Field label="Theme" value={editPost.theme} onChange={v => setEditPost(p => p ? { ...p, theme: v } : p)} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: '1px solid #333', marginTop: 8, marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#ccc', fontSize: 13 }}>
              <input type="checkbox" checked={editPost.hide} onChange={e => setEditPost(p => p ? { ...p, hide: e.target.checked } : p)} />
              Hide from grid
            </label>
          </div>

          <button className="btn-primary" onClick={saveEdit}>Save Changes</button>
          <button className="btn-danger" onClick={() => { if (confirm('Delete this post?')) deletePost(editPost.id) }}>Delete Post</button>
          <button className="btn-ghost" onClick={() => setActivePanel(null)}>Cancel</button>
        </div>
      )}

      {/* ── Add post panel ── */}
      {activePanel === 'add' && (
        <div className="slide-panel" onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ color: '#fff', margin: 0, fontSize: 16 }}>Add New Post</h3>
            <button onClick={() => setActivePanel(null)} style={{ background: 'none', border: 'none', color: '#888', fontSize: 22, cursor: 'pointer' }}>×</button>
          </div>

          {/* Media upload */}
          <div style={{ marginBottom: 16 }}>
            {blobUrls['_new_media']
              ? <div style={{ background: '#2a2a2a', borderRadius: 10, overflow: 'hidden', aspectRatio: '1', marginBottom: 8 }}>
                  <img src={blobUrls['_new_media']} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              : null
            }
            <label style={{ display: 'block', background: '#2a2a2a', border: '2px dashed #444', borderRadius: 10, padding: '20px', cursor: 'pointer', color: '#ccc', fontSize: 13, textAlign: 'center' }}>
              📷 Click to upload image or video
              <input type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleAddMedia} />
            </label>
          </div>

          <Field label="Title" value={(newPost as Post).title || ''} onChange={v => setNewPost(p => ({ ...p, title: v }))} />
          <Field label="Hook (main text)" value={(newPost as Post).hook || ''} onChange={v => setNewPost(p => ({ ...p, hook: v }))} multiline />
          <Field label="Caption" value={(newPost as Post).caption || ''} onChange={v => setNewPost(p => ({ ...p, caption: v }))} multiline />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <div className="field-label">Date (e.g. Jun 16)</div>
              <input className="field-input" value={(newPost as Post).date || ''} onChange={e => setNewPost(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <div className="field-label">Day (e.g. Mon)</div>
              <input className="field-input" value={(newPost as Post).day || ''} onChange={e => setNewPost(p => ({ ...p, day: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <div className="field-label">Week</div>
              <select className="field-input" value={(newPost as Post).week || 1} onChange={e => setNewPost(p => ({ ...p, week: Number(e.target.value) }))}>
                {[1,2,3,4,5,6,7,8].map(w => <option key={w} value={w}>Week {w}</option>)}
              </select>
            </div>
            <div>
              <div className="field-label">Status</div>
              <select className="field-input" value={(newPost as Post).status || 'To Film'} onChange={e => setNewPost(p => ({ ...p, status: e.target.value }))}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div className="field-label">Platform</div>
            <select className="field-input" value={(newPost as Post).platform || 'Instagram'} onChange={e => setNewPost(p => ({ ...p, platform: e.target.value }))}>
              {PLATFORMS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div className="field-label">Format</div>
            <select className="field-input" value={(newPost as Post).format || 'Static'} onChange={e => setNewPost(p => ({ ...p, format: e.target.value }))}>
              {FORMATS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div className="field-label">Content Pillar</div>
            <select className="field-input" value={(newPost as Post).pillar || 'P1 Gut Education'} onChange={e => setNewPost(p => ({ ...p, pillar: e.target.value }))}>
              {PILLARS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <button className="btn-primary" onClick={submitAdd}>Add to Grid</button>
          <button className="btn-ghost" onClick={() => setActivePanel(null)}>Cancel</button>
        </div>
      )}

      {/* ── Profile panel ── */}
      {activePanel === 'profile' && (
        <div className="slide-panel" onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ color: '#fff', margin: 0, fontSize: 16 }}>Edit Profile</h3>
            <button onClick={() => setActivePanel(null)} style={{ background: 'none', border: 'none', color: '#888', fontSize: 22, cursor: 'pointer' }}>×</button>
          </div>

          {/* Avatar */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            {blobUrls['profile_avatar'] || profile.avatarUrl
              ? <img src={blobUrls['profile_avatar'] || profile.avatarUrl} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: 8 }} />
              : <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #033F3B, #7DB82A)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 8 }}>🍵</div>
            }
            <div>
              <label style={{ background: '#2a2a2a', border: '1px solid #444', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: '#ccc', fontSize: 12 }}>
                Upload Avatar
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
              </label>
            </div>
          </div>

          <Field label="Username" value={editingProfile.username} onChange={v => setEditingProfile(p => ({ ...p, username: v }))} />
          <Field label="Display Name" value={editingProfile.displayName} onChange={v => setEditingProfile(p => ({ ...p, displayName: v }))} />
          <Field label="Bio" value={editingProfile.bio} onChange={v => setEditingProfile(p => ({ ...p, bio: v }))} multiline />
          <Field label="Link" value={editingProfile.link} onChange={v => setEditingProfile(p => ({ ...p, link: v }))} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <div className="field-label">Followers</div>
              <input className="field-input" value={editingProfile.followers} onChange={e => setEditingProfile(p => ({ ...p, followers: e.target.value }))} />
            </div>
            <div>
              <div className="field-label">Following</div>
              <input className="field-input" value={editingProfile.following} onChange={e => setEditingProfile(p => ({ ...p, following: e.target.value }))} />
            </div>
          </div>

          {/* Highlights */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div className="field-label" style={{ margin: 0 }}>Story Highlights</div>
              <button onClick={addHighlight} style={{ background: '#C5D93A', color: '#033F3B', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Add</button>
            </div>
            {editingProfile.highlights.map((h, i) => (
              <div key={i} style={{ background: '#2a2a2a', borderRadius: 10, padding: '10px 12px', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <input className="field-input" style={{ width: 50 }} value={h.emoji} onChange={e => updateHighlight(i, 'emoji', e.target.value)} placeholder="Emoji" />
                  <input className="field-input" style={{ flex: 1 }} value={h.label} onChange={e => updateHighlight(i, 'label', e.target.value)} placeholder="Label" />
                  <input type="color" value={h.bg} onChange={e => updateHighlight(i, 'bg', e.target.value)} style={{ width: 36, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'none' }} />
                  <button onClick={() => removeHighlight(i)} style={{ background: 'none', border: 'none', color: '#e53e3e', fontSize: 18, cursor: 'pointer', padding: '0 4px' }}>×</button>
                </div>
              </div>
            ))}
          </div>

          <button className="btn-primary" onClick={saveProfileEdit}>Save Profile</button>
          <button className="btn-ghost" onClick={() => setActivePanel(null)}>Cancel</button>
        </div>
      )}
    </div>
  )
}

// ─── Reusable field component ─────────────────────────────────────────────────
function Field({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="field-label">{label}</div>
      {multiline
        ? <textarea className="field-input" value={value || ''} onChange={e => onChange(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
        : <input className="field-input" value={value || ''} onChange={e => onChange(e.target.value)} />
      }
    </div>
  )
}
