'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Sortable from 'sortablejs'
import { upload } from '@vercel/blob/client'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Highlight { emoji: string; label: string; bg: string; isBB?: boolean }
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
const WP = [
  null,
  { bg: ['#0d2d4a', '#4A90D9'] as [string,string], c: '#4A90D9' },
  { bg: ['#033F3B', '#7DB82A'] as [string,string], c: '#7DB82A' },
  { bg: ['#2d0d4a', '#A855C8'] as [string,string], c: '#A855C8' },
  { bg: ['#4a1f00', '#E07B2F'] as [string,string], c: '#E07B2F' },
  { bg: ['#001a2e', '#00D4FF'] as [string,string], c: '#00D4FF' },
  { bg: ['#1a2d00', '#A3E635'] as [string,string], c: '#A3E635' },
  { bg: ['#2d001a', '#FF6B9D'] as [string,string], c: '#FF6B9D' },
  { bg: ['#1a1a00', '#FFD700'] as [string,string], c: '#FFD700' },
]

// ─── Defaults ─────────────────────────────────────────────────────────────────
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
  { id:1, title:"You're Not Alone", hook:"I was bloated after every meal for 3 years. 45 days of BoochBod — I haven't been bloated since week 2.", caption:'', date:'Jun 16', day:'Mon', week:1, theme:"You're Not Alone", platform:'TikTok', format:'Face-to-cam UGC', pillar:'P3 Social Proof', mediaType:'video', hide:false, position:1, status:'Idea' },
  { id:2, title:'Your Gut Is Talking', hook:"Your gut is talking. Here's what it's saying.", caption:'', date:'Jun 17', day:'Tue', week:1, theme:"You're Not Alone", platform:'Instagram', format:'Carousel', pillar:'P1 Gut Education', mediaType:'image', hide:false, position:2, status:'Idea' },
  { id:3, title:'Gut Health Girlie', hook:'This is what a gut health girlie looks like.', caption:'', date:'Jun 18', day:'Wed', week:1, theme:"You're Not Alone", platform:'Instagram', format:'Static', pillar:'P2 Identity & Lifestyle', mediaType:'image', hide:false, position:3, status:'Idea' },
  { id:4, title:'Cancel Plans No More', hook:"I used to cancel plans because of my gut. I don't anymore.", caption:'', date:'Jun 19', day:'Thu', week:1, theme:"You're Not Alone", platform:'TikTok', format:'Reel', pillar:'P4 Emotional Storytelling', mediaType:'video', hide:false, position:4, status:'Idea' },
  { id:5, title:'Morning Routine Breakdown', hook:'How I take my BoochBod: my morning routine breakdown.', caption:'', date:'Jun 20', day:'Fri', week:1, theme:"You're Not Alone", platform:'Instagram', format:'Carousel', pillar:'P5 Product in Action', mediaType:'image', hide:false, position:5, status:'Idea' },
  { id:6, title:'One Gummy Changed Everything', hook:'One gummy with breakfast changed everything.', caption:'', date:'Jun 23', day:'Mon', week:2, theme:'Small Habits Big Results', platform:'TikTok', format:'Face-to-cam UGC', pillar:'P5 Product in Action', mediaType:'video', hide:false, position:6, status:'Idea' },
  { id:7, title:'5 Foods Destroying Your Gut', hook:'5 foods that are secretly destroying your gut.', caption:'', date:'Jun 24', day:'Tue', week:2, theme:'Small Habits Big Results', platform:'Instagram', format:'Carousel', pillar:'P1 Gut Education', mediaType:'image', hide:false, position:7, status:'Idea' },
  { id:8, title:'2,847 Women Fixed Bloat', hook:'2,847 women said this fixed their bloat.', caption:'', date:'Jun 25', day:'Wed', week:2, theme:'Small Habits Big Results', platform:'Instagram', format:'Static', pillar:'P3 Social Proof', mediaType:'image', hide:false, position:8, status:'Idea' },
  { id:9, title:'Day in My Life', hook:'Day in my life as someone who actually takes care of their gut.', caption:'', date:'Jun 26', day:'Thu', week:2, theme:'Small Habits Big Results', platform:'TikTok', format:'Duet / Stitch', pillar:'P2 Identity & Lifestyle', mediaType:'video', hide:false, position:9, status:'Idea' },
  { id:10, title:'Before vs. After 30 Days', hook:'Before BoochBod vs. after: a 30-day diary.', caption:'', date:'Jun 27', day:'Fri', week:2, theme:'Small Habits Big Results', platform:'Instagram', format:'Carousel', pillar:'P4 Emotional Storytelling', mediaType:'image', hide:false, position:10, status:'Idea' },
  { id:11, title:'The Identity Shift', hook:"I stopped identifying as 'the bloated one' and this is what happened.", caption:'', date:'Jun 30', day:'Mon', week:3, theme:'The Identity Shift', platform:'TikTok', format:'Reel', pillar:'P2 Identity & Lifestyle', mediaType:'video', hide:false, position:11, status:'Idea' },
  { id:12, title:'Gut-Brain Connection', hook:"The gut-brain connection nobody talks about.", caption:'', date:'Jul 1', day:'Tue', week:3, theme:'The Identity Shift', platform:'Instagram', format:'Carousel', pillar:'P1 Gut Education', mediaType:'image', hide:false, position:12, status:'Idea' },
  { id:13, title:'BoochBod Starter Kit', hook:'Your BoochBod starter kit.', caption:'', date:'Jul 2', day:'Wed', week:3, theme:'The Identity Shift', platform:'Instagram', format:'Static', pillar:'P5 Product in Action', mediaType:'image', hide:false, position:13, status:'Idea' },
  { id:14, title:'Dressing Room Moment', hook:'I cried in a dressing room because I felt so good in my body.', caption:'', date:'Jul 3', day:'Thu', week:3, theme:'The Identity Shift', platform:'TikTok', format:'Face-to-cam UGC', pillar:'P4 Emotional Storytelling', mediaType:'video', hide:false, position:14, status:'Idea' },
  { id:15, title:'60-Day Transformation', hook:"She tried BoochBod for 60 days. Here's what happened.", caption:'', date:'Jul 4', day:'Fri', week:3, theme:'The Identity Shift', platform:'Instagram', format:'Carousel', pillar:'P3 Social Proof', mediaType:'image', hide:false, position:15, status:'Idea' },
  { id:16, title:'Doctor Reacts', hook:'Doctor reacts to BoochBod ingredients.', caption:'', date:'Jul 7', day:'Mon', week:4, theme:'Proof + Push', platform:'TikTok', format:'Face-to-cam UGC', pillar:'P3 Social Proof', mediaType:'video', hide:false, position:16, status:'Idea' },
  { id:17, title:'Gummies Work Better', hook:'Why probiotics in gummy form actually work better.', caption:'', date:'Jul 8', day:'Tue', week:4, theme:'Proof + Push', platform:'Instagram', format:'Carousel', pillar:'P1 Gut Education', mediaType:'image', hide:false, position:17, status:'Idea' },
  { id:18, title:'3PM Energy Crash', hook:'The 3pm energy crash is not normal.', caption:'', date:'Jul 9', day:'Wed', week:4, theme:'Proof + Push', platform:'Instagram', format:'Static', pillar:'P2 Identity & Lifestyle', mediaType:'image', hide:false, position:18, status:'Idea' },
  { id:19, title:"Mom's Gut Health Journey", hook:'My mom started taking BoochBod and now we talk about gut health at dinner.', caption:'', date:'Jul 10', day:'Thu', week:4, theme:'Proof + Push', platform:'TikTok', format:'Duet / Stitch', pillar:'P4 Emotional Storytelling', mediaType:'video', hide:false, position:19, status:'Idea' },
  { id:20, title:'4-Week Gut Reset', hook:'Your 4-week gut reset plan. Starting now.', caption:'', date:'Jul 11', day:'Fri', week:4, theme:'Proof + Push', platform:'Instagram', format:'Carousel', pillar:'P5 Product in Action', mediaType:'image', hide:false, position:20, status:'Idea' },
]

const STATUSES = ['Idea','In Progress','For Approval','Approved','Scheduled','Posted']
const PLATFORMS = ['Instagram','TikTok','YouTube','Pinterest']
const FORMATS = ['Static','Carousel','Reel','Story','Face-to-cam UGC','Duet / Stitch']
const PILLARS = ['P1 Gut Education','P2 Identity & Lifestyle','P3 Social Proof','P4 Emotional Storytelling','P5 Product in Action']
const STATUS_COLORS: Record<string,string> = { 'Idea':'#d97706', 'In Progress':'#dc2626', 'For Approval':'#2563eb', 'Approved':'#7c3aed', 'Scheduled':'#6366f1', 'Posted':'#16a34a' }

// ─── Upload file directly to Vercel Blob (no size limit) ─────────────────────
async function uploadFile(file: File, key: string): Promise<string> {
  const ext = file.name.split('.').pop() || ''
  const pathname = `media/${key}.${ext}`
  const blob = await upload(pathname, file, {
    access: 'public',
    handleUploadUrl: '/api/upload',
  })
  return blob.url
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GridPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [isAdminPreview, setIsAdminPreview] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [order, setOrder] = useState<number[]>([])
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE)
  const [activePanel, setActivePanel] = useState<'edit'|'profile'|'add'|null>(null)
  const [editPost, setEditPost] = useState<Post|null>(null)
  const [editingProfile, setEditingProfile] = useState<Profile>(DEFAULT_PROFILE)
  const [newPost, setNewPost] = useState<Partial<Post>>({})
  const [newPostFile, setNewPostFile] = useState<File|null>(null)
  const [newPostPreview, setNewPostPreview] = useState<string|null>(null)
  const [syncStatus, setSyncStatus] = useState<'idle'|'saving'|'loading'|'saved'|'error'>('idle')
  const [uploading, setUploading] = useState(false)
  const [showBackups, setShowBackups] = useState(false)
  const [backups, setBackups] = useState<{url:string;uploadedAt:string;pathname:string}[]>([])
  const gridRef = useRef<HTMLDivElement>(null)
  const sortableRef = useRef<Sortable|null>(null)
  const nextId = useRef(21)
  const orderRef = useRef<number[]>([])
  const postsRef = useRef<Post[]>([])
  const profileRef = useRef<Profile>(DEFAULT_PROFILE)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>|null>(null)
  const isFirstLoad = useRef(true)

  useEffect(() => {
    const isAdmin = document.cookie.includes('bb_admin=1')
    const isClient = document.cookie.match(/bb_client=[^;]+/)
    const isPreview = document.cookie.match(/bb_preview_client=[^;]+/)
    if (!isAdmin && !isClient && !isPreview) { router.replace('/'); return }
    if (isAdmin) setIsAdminPreview(true)
    loadData()
  }, [])

  // Keep refs in sync for use inside sortable callback
  useEffect(() => { orderRef.current = order }, [order])
  useEffect(() => { postsRef.current = posts }, [posts])
  useEffect(() => { profileRef.current = profile }, [profile])

  // Auto-save 3 seconds after any change to posts, order, or profile
  useEffect(() => {
    if (!ready || isFirstLoad.current) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      saveToCloud(postsRef.current, orderRef.current, profileRef.current)
    }, 3000)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [posts, order, profile, ready])

  // ─── Load: cloud first, localStorage fallback ──────────────────────────────
  async function loadData() {
    setSyncStatus('loading')
    // Determine client key for localStorage namespacing
    const clientMatch = document.cookie.match(/bb_client=([^;]+)/)
    const previewMatch = document.cookie.match(/bb_preview_client=([^;]+)/)
    const clientKey = clientMatch?.[1] || previewMatch?.[1] || 'default'
    const lsPosts = `bb_posts_${clientKey}`
    const lsOrder = `bb_order_${clientKey}`
    const lsProfile = `bb_profile_${clientKey}`

    try {
      const res = await fetch('/api/sync')
      const { data } = await res.json()
      if (data?.posts && data?.order) {
        setPosts(data.posts)
        setOrder(data.order)
        setProfile(data.profile || DEFAULT_PROFILE)
        nextId.current = Math.max(...data.posts.map((p: Post) => p.id)) + 1
        localStorage.setItem(lsPosts, JSON.stringify(data.posts))
        localStorage.setItem(lsOrder, JSON.stringify(data.order))
        localStorage.setItem(lsProfile, JSON.stringify(data.profile || DEFAULT_PROFILE))
        setSyncStatus('idle')
        setReady(true)
        setTimeout(() => { isFirstLoad.current = false }, 100)
        return
      }
    } catch {}

    // Fall back to localStorage
    const ps = localStorage.getItem(lsPosts)
    const or = localStorage.getItem(lsOrder)
    const pr = localStorage.getItem(lsProfile)
    const loadedPosts = ps ? JSON.parse(ps) : SEED
    const loadedOrder = or ? JSON.parse(or) : loadedPosts.map((p: Post) => p.id)
    const loadedProfile = pr ? JSON.parse(pr) : DEFAULT_PROFILE
    setPosts(loadedPosts)
    setOrder(loadedOrder)
    setProfile(loadedProfile)
    nextId.current = Math.max(...loadedPosts.map((p: Post) => p.id)) + 1
    setSyncStatus('idle')
    setReady(true)
    setTimeout(() => { isFirstLoad.current = false }, 100)
  }

  async function loadBackups() {
    const res = await fetch('/api/sync?backups=1')
    const { backups: b } = await res.json()
    setBackups(b || [])
    setShowBackups(true)
  }

  async function restoreBackup(url: string) {
    if (!confirm('Restore this backup? Current data will be backed up first.')) return
    const res = await fetch(url)
    const data = await res.json()
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setPosts(data.posts); setOrder(data.order); setProfile(data.profile || DEFAULT_PROFILE)
    setShowBackups(false)
    setSyncStatus('saved'); setTimeout(() => setSyncStatus('idle'), 2500)
  }

  // ─── Save to cloud ─────────────────────────────────────────────────────────
  async function saveToCloud(p?: Post[], o?: number[], pr?: Profile) {
    const savePosts = p || postsRef.current
    const saveOrder = o || orderRef.current
    const saveProfile = pr || profile
    setSyncStatus('saving')
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posts: savePosts, order: saveOrder, profile: saveProfile }),
      })
      setSyncStatus('saved')
      setTimeout(() => setSyncStatus('idle'), 2500)
    } catch {
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 3000)
    }
  }

  function saveLocal(p: Post[], o: number[]) {
    localStorage.setItem('bb_posts_v4', JSON.stringify(p))
    localStorage.setItem('bb_order_v4', JSON.stringify(o))
    postsRef.current = p
    orderRef.current = o
  }

  // ─── Sortable ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready || !gridRef.current) return
    sortableRef.current?.destroy()
    sortableRef.current = Sortable.create(gridRef.current, {
      animation: 200,
      ghostClass: 'sortable-ghost',
      filter: '.tile-add',
      onEnd: () => {
        const tiles = gridRef.current?.querySelectorAll('.sortable-tile')
        if (!tiles) return
        const newOrder = Array.from(tiles).map(t => Number((t as HTMLElement).dataset.id))
        setOrder(newOrder)
        saveLocal(postsRef.current, newOrder)
      },
    })
    return () => sortableRef.current?.destroy()
  }, [ready])

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.replace('/')
  }

  // ─── Add post ──────────────────────────────────────────────────────────────
  function openAdd() {
    setNewPost({ mediaType: 'image', week: 1, status: 'To Film', platform: 'Instagram', format: 'Static', pillar: 'P1 Gut Education' })
    setNewPostFile(null); setNewPostPreview(null)
    setActivePanel('add')
  }

  function handleNewFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setNewPostFile(file)
    setNewPostPreview(URL.createObjectURL(file))
    setNewPost(p => ({ ...p, mediaType: file.type.startsWith('video') ? 'video' : 'image' }))
  }

  async function submitAdd() {
    const id = nextId.current++
    const base = newPost
    let mediaUrl: string | undefined
    if (newPostFile) {
      setUploading(true)
      try { mediaUrl = await uploadFile(newPostFile, `post_${id}_media`) } catch {}
      setUploading(false)
    }
    const p: Post = {
      id, title: base.title || `Post ${id}`, hook: base.hook || '', caption: base.caption || '',
      date: base.date || '', day: base.day || '', week: base.week || 1, theme: base.theme || '',
      platform: base.platform || 'Instagram', format: base.format || 'Static',
      pillar: base.pillar || 'P1 Gut Education', mediaType: base.mediaType || 'image',
      mediaUrl, hide: false, position: posts.length + 1, status: base.status || 'To Film',
    }
    const newPosts = [...posts, p]
    const newOrder = [...order, id]
    setPosts(newPosts); setOrder(newOrder)
    saveLocal(newPosts, newOrder)
    setActivePanel(null)
    saveToCloud(newPosts, newOrder)
  }

  // ─── Edit post ─────────────────────────────────────────────────────────────
  function openEdit(post: Post) { setEditPost({ ...post }); setActivePanel('edit') }

  async function handleEditFile(e: React.ChangeEvent<HTMLInputElement>, key: 'media'|'cover') {
    const file = e.target.files?.[0]
    if (!file || !editPost) return
    setUploading(true)
    try {
      const url = await uploadFile(file, `post_${editPost.id}_${key}`)
      if (key === 'media') {
        setEditPost(p => p ? { ...p, mediaUrl: url, mediaType: file.type.startsWith('video') ? 'video' : 'image' } : p)
      } else {
        setEditPost(p => p ? { ...p, coverUrl: url } : p)
      }
    } catch {}
    setUploading(false)
  }

  function saveEdit() {
    if (!editPost) return
    const updated = posts.map(p => p.id === editPost.id ? editPost : p)
    setPosts(updated); saveLocal(updated, order)
    setActivePanel(null); setEditPost(null)
    saveToCloud(updated, order)
  }

  function deletePost(id: number) {
    const updated = posts.filter(p => p.id !== id)
    const newOrder = order.filter(o => o !== id)
    setPosts(updated); setOrder(newOrder)
    saveLocal(updated, newOrder)
    setActivePanel(null); setEditPost(null)
    saveToCloud(updated, newOrder)
  }

  // ─── Profile ───────────────────────────────────────────────────────────────
  function openProfileEdit() {
    setEditingProfile({ ...profile, highlights: profile.highlights.map(h => ({ ...h })) })
    setActivePanel('profile')
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadFile(file, 'profile_avatar')
      setEditingProfile(p => ({ ...p, avatarUrl: url }))
    } catch {}
    setUploading(false)
  }

  function saveProfileEdit() {
    setProfile(editingProfile)
    localStorage.setItem('bb_profile_v1', JSON.stringify(editingProfile))
    setActivePanel(null)
    saveToCloud(undefined, undefined, editingProfile)
  }

  // ─── Ordered posts ─────────────────────────────────────────────────────────
  const postMap = Object.fromEntries(posts.map(p => [p.id, p]))
  const orderedPosts = order.map(id => postMap[id]).filter(Boolean)
  const avatarUrl = profile.avatarUrl

  if (!ready) return (
    <div style={{ minHeight:'100vh', background:'#033F3B', display:'flex', alignItems:'center', justifyContent:'center', color:'#C5D93A', fontSize:18, fontFamily:'Inter,sans-serif' }}>
      Loading…
    </div>
  )

  const syncLabel = syncStatus === 'saving' ? '⏳ Auto-saving…' : syncStatus === 'loading' ? '⏳ Loading…' : syncStatus === 'saved' ? '✅ Saved!' : syncStatus === 'error' ? '❌ Error' : '☁️ Saved'

  return (
    <div style={{ minHeight:'100vh', background:'#1a1a1a', fontFamily:"'Inter', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        .sortable-ghost { opacity: 0.3; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #444; border-radius: 3px; }
        input, textarea, select { font-family: inherit; }
        .panel-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:100; }
        .slide-panel { position:fixed; top:0; right:0; height:100vh; width:440px; background:#1e1e1e; border-left:1px solid #333; z-index:101; overflow-y:auto; padding:24px; }
        @media(max-width:480px){ .slide-panel { width:100vw; } }
        .fl { font-size:11px; font-weight:600; color:#888; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; }
        .fi { width:100%; padding:10px 12px; background:#2a2a2a; border:1px solid #444; border-radius:8px; color:#fff; font-size:14px; outline:none; }
        .fi:focus { border-color:#C5D93A; }
        .btn-p { background:#C5D93A; color:#033F3B; border:none; border-radius:10px; padding:12px; font-size:14px; font-weight:700; cursor:pointer; width:100%; margin-bottom:8px; }
        .btn-d { background:#e53e3e; color:#fff; border:none; border-radius:10px; padding:11px; font-size:14px; font-weight:600; cursor:pointer; width:100%; margin-bottom:8px; }
        .btn-g { background:transparent; color:#888; border:1px solid #444; border-radius:10px; padding:11px; font-size:14px; cursor:pointer; width:100%; }
        .tile:hover .tile-ov { opacity:1; }
        .tile-ov { opacity:0; transition:opacity 0.2s; }
        video { display:block; }
      `}</style>

      {/* ── Top Bar ── */}
      <div style={{ background:'#033F3B', borderBottom:'1px solid #0a5a54', padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50, gap:8, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, background:'linear-gradient(135deg,#7DB82A,#C5D93A)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🍵</div>
          <span style={{ color:'#C5D93A', fontWeight:800, fontSize:16 }}>{profile.displayName || 'Grid Preview'}</span>
          <span style={{ color:'#7DB82A', fontSize:12 }}>Grid Preview</span>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
          {/* Auto-save status indicator */}
          <div style={{ fontSize:11, color: syncStatus==='saved'?'#7DB82A': syncStatus==='saving'?'#C5D93A': syncStatus==='error'?'#f87171':'#4a7a50', display:'flex', alignItems:'center', gap:4, padding:'4px 8px', background:'rgba(0,0,0,0.2)', borderRadius:6, transition:'color 0.3s' }}>
            {syncStatus==='saving' ? '⏳' : syncStatus==='saved' ? '✅' : syncStatus==='error' ? '❌' : '☁️'} {syncLabel}
          </div>
          <button onClick={loadBackups} style={{ background:'transparent', color:'#7DB82A', border:'1px solid #2a5a2a', borderRadius:8, padding:'6px 10px', cursor:'pointer', fontSize:12 }} title="View backups">🕐 Backups</button>
          <button onClick={openAdd} style={{ background:'#C5D93A', color:'#033F3B', border:'none', borderRadius:8, padding:'6px 14px', fontWeight:700, cursor:'pointer', fontSize:13 }}>+ Add Post</button>
          <button onClick={openProfileEdit} style={{ background:'transparent', color:'#C5D93A', border:'1px solid #7DB82A', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontSize:13 }}>Edit Profile</button>
          {isAdminPreview
            ? <button onClick={()=>router.replace('/admin')} style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none', borderRadius:8, padding:'6px 14px', cursor:'pointer', fontSize:13, fontWeight:700 }}>← Back to Admin</button>
            : <button onClick={logout} style={{ background:'transparent', color:'#888', border:'1px solid #444', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontSize:13 }}>Log Out</button>
          }
        </div>
      </div>

      {/* ── Instagram Profile ── */}
      <div style={{ background:'#000', padding:'20px 16px 0', maxWidth:480, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:24, padding:'0 4px 16px' }}>
          <div style={{ flexShrink:0 }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" style={{ width:80, height:80, borderRadius:'50%', objectFit:'cover', border:'2px solid #333' }} />
              : <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#033F3B,#7DB82A)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, border:'2px solid #333' }}>🍵</div>
            }
          </div>
          <div style={{ flex:1, display:'flex', justifyContent:'space-around' }}>
            {[['Posts', orderedPosts.filter(p=>!p.hide).length.toString()],['Followers',profile.followers],['Following',profile.following]].map(([l,v])=>(
              <div key={l} style={{ textAlign:'center' }}>
                <div style={{ color:'#fff', fontWeight:700, fontSize:17 }}>{v}</div>
                <div style={{ color:'#aaa', fontSize:12 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding:'0 4px 12px' }}>
          <div style={{ color:'#fff', fontWeight:700, fontSize:14 }}>{profile.displayName}</div>
          <div style={{ color:'#ddd', fontSize:13, whiteSpace:'pre-line', marginTop:2 }}>{profile.bio}</div>
          {profile.link && <div style={{ color:'#4A90D9', fontSize:13, marginTop:4 }}>🔗 {profile.link}</div>}
        </div>
        <div style={{ display:'flex', gap:12, padding:'0 4px 16px', overflowX:'auto' }}>
          {profile.highlights.map((h,i)=>(
            <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, flexShrink:0 }}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:h.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:h.isBB?11:22, fontWeight:h.isBB?800:400, color:'#fff', border:'2px solid #333' }}>{h.isBB?'BB':h.emoji}</div>
              <span style={{ color:'#ddd', fontSize:11 }}>{h.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', borderTop:'1px solid #333' }}>
          {['⊞','☰','♡'].map((icon,i)=>(
            <button key={i} style={{ flex:1, background:'none', border:'none', color:i===0?'#fff':'#666', fontSize:20, padding:'10px 0', cursor:'pointer', borderBottom:i===0?'2px solid #fff':'2px solid transparent' }}>{icon}</button>
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      <div style={{ background:'#000', maxWidth:480, margin:'0 auto' }}>
        <div ref={gridRef} style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:3 }}>
          {orderedPosts.map(post => {
            const w = WP[post.week] || WP[2]!
            const mediaSrc = post.mediaUrl
            const coverSrc = post.coverUrl
            const displaySrc = coverSrc || (post.mediaType==='image'?mediaSrc:undefined)
            return (
              <div key={post.id} data-id={post.id} className="tile sortable-tile" style={{ position:'relative', aspectRatio:'1', cursor:'grab', opacity:post.hide?0.35:1 }} onClick={()=>openEdit(post)}>
                {displaySrc
                  ? <img src={displaySrc} alt={post.title} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                  : post.mediaType==='video' && mediaSrc
                  ? <video src={mediaSrc} style={{ width:'100%', height:'100%', objectFit:'cover', pointerEvents:'none' }} muted playsInline preload="metadata" />
                  : <div style={{ width:'100%', height:'100%', background:`linear-gradient(135deg,${w.bg[0]},${w.bg[1]})`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:8, gap:4 }}>
                      <div style={{ color:w.c, fontSize:9, fontWeight:700, opacity:0.7 }}>W{post.week}</div>
                      <div style={{ color:'#fff', fontSize:9, fontWeight:600, textAlign:'center', lineHeight:1.3 }}>{post.hook.slice(0,50)}{post.hook.length>50?'…':''}</div>
                    </div>
                }
                <div className="tile-ov" style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.72)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, padding:6 }}>
                  <div style={{ color:'#fff', fontSize:8, textAlign:'center', lineHeight:1.4 }}>{post.hook.slice(0,70)}</div>
                  <div style={{ fontSize:8, padding:'2px 6px', borderRadius:10, background:STATUS_COLORS[post.status]||'#666', color:'#fff', fontWeight:600 }}>{post.status}</div>
                </div>
                {post.mediaType==='video' && mediaSrc && !coverSrc && <div style={{ position:'absolute', top:4, right:5, color:'#fff', fontSize:14, textShadow:'0 1px 3px rgba(0,0,0,0.8)' }}>▶</div>}
                {post.hide && <div style={{ position:'absolute', top:4, left:4, fontSize:9, color:'#fff', background:'rgba(0,0,0,0.6)', padding:'1px 4px', borderRadius:4 }}>hidden</div>}
              </div>
            )
          })}
          <div className="tile-add" onClick={openAdd} style={{ aspectRatio:'1', background:'#111', border:'2px dashed #333', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:28, color:'#444' }}>+</div>
        </div>
      </div>

      {/* ── Panel overlay ── */}
      {activePanel && <div className="panel-overlay" onClick={()=>setActivePanel(null)} />}

      {/* ── Edit Post Panel ── */}
      {activePanel==='edit' && editPost && (
        <div className="slide-panel" onClick={e=>e.stopPropagation()}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <h3 style={{ color:'#fff', margin:0, fontSize:16 }}>Edit Post</h3>
            <button onClick={()=>setActivePanel(null)} style={{ background:'none', border:'none', color:'#888', fontSize:24, cursor:'pointer', lineHeight:1 }}>×</button>
          </div>

          {/* Media preview + controls */}
          <div style={{ marginBottom:16 }}>
            <div style={{ background:'#111', borderRadius:10, overflow:'hidden', aspectRatio:'1', marginBottom:8, position:'relative' }}>
              {editPost.coverUrl
                ? <img src={editPost.coverUrl} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : editPost.mediaType==='video' && editPost.mediaUrl
                ? <video src={editPost.mediaUrl} style={{ width:'100%', height:'100%', objectFit:'cover' }} controls playsInline />
                : editPost.mediaUrl
                ? <img src={editPost.mediaUrl} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#555', fontSize:13 }}>No media yet</div>
              }
              {uploading && (
                <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', color:'#C5D93A', fontSize:14 }}>Uploading…</div>
              )}
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:8 }}>
              <label style={{ flex:1, background:'#2a2a2a', border:'1px solid #444', borderRadius:8, padding:'8px', cursor:'pointer', color:'#ccc', fontSize:12, textAlign:'center' }}>
                {editPost.mediaType==='video'?'🎬':'📷'} Upload {editPost.mediaType==='video'?'Video':'Image'}
                <input type="file" accept="image/*,video/mp4,video/quicktime,.mp4,.mov" style={{ display:'none' }} onChange={e=>handleEditFile(e,'media')} />
              </label>
              <label style={{ flex:1, background:'#2a2a2a', border:'1px solid #444', borderRadius:8, padding:'8px', cursor:'pointer', color:'#ccc', fontSize:12, textAlign:'center' }}>
                🖼 Cover Image
                <input type="file" accept="image/*" style={{ display:'none' }} onChange={e=>handleEditFile(e,'cover')} />
              </label>
            </div>
            <div style={{ marginBottom:8 }}>
              <div className="fl">Media Type</div>
              <div style={{ display:'flex', gap:8 }}>
                {(['image','video'] as const).map(t=>(
                  <button key={t} onClick={()=>setEditPost(p=>p?{...p,mediaType:t}:p)} style={{ flex:1, padding:'8px', borderRadius:8, border:'1px solid '+(editPost.mediaType===t?'#C5D93A':'#444'), background:editPost.mediaType===t?'#1a2a00':'#2a2a2a', color:editPost.mediaType===t?'#C5D93A':'#888', cursor:'pointer', fontSize:13, fontWeight:600 }}>{t==='image'?'📷 Image':'🎬 Video'}</button>
                ))}
              </div>
            </div>
          </div>

          <F label="Title" value={editPost.title} onChange={v=>setEditPost(p=>p?{...p,title:v}:p)} />
          <F label="Hook (main text shown on grid)" value={editPost.hook} onChange={v=>setEditPost(p=>p?{...p,hook:v}:p)} multiline />
          <F label="Caption" value={editPost.caption} onChange={v=>setEditPost(p=>p?{...p,caption:v}:p)} multiline />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
            <div><div className="fl">Date</div><input className="fi" value={editPost.date} onChange={e=>setEditPost(p=>p?{...p,date:e.target.value}:p)} placeholder="Jun 16"/></div>
            <div><div className="fl">Day</div><input className="fi" value={editPost.day} onChange={e=>setEditPost(p=>p?{...p,day:e.target.value}:p)} placeholder="Mon"/></div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
            <div>
              <div className="fl">Week</div>
              <select className="fi" value={editPost.week} onChange={e=>setEditPost(p=>p?{...p,week:Number(e.target.value)}:p)}>
                {[1,2,3,4,5,6,7,8].map(w=><option key={w} value={w}>Week {w}</option>)}
              </select>
            </div>
            <div>
              <div className="fl">Status</div>
              <select className="fi" value={editPost.status} onChange={e=>setEditPost(p=>p?{...p,status:e.target.value}:p)}>
                {STATUSES.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom:10 }}><div className="fl">Platform</div><select className="fi" value={editPost.platform} onChange={e=>setEditPost(p=>p?{...p,platform:e.target.value}:p)}>{PLATFORMS.map(s=><option key={s}>{s}</option>)}</select></div>
          <div style={{ marginBottom:10 }}><div className="fl">Format</div><select className="fi" value={editPost.format} onChange={e=>setEditPost(p=>p?{...p,format:e.target.value}:p)}>{FORMATS.map(s=><option key={s}>{s}</option>)}</select></div>
          <div style={{ marginBottom:10 }}><div className="fl">Content Pillar</div><select className="fi" value={editPost.pillar} onChange={e=>setEditPost(p=>p?{...p,pillar:e.target.value}:p)}>{PILLARS.map(s=><option key={s}>{s}</option>)}</select></div>
          <F label="Theme" value={editPost.theme} onChange={v=>setEditPost(p=>p?{...p,theme:v}:p)} />

          <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', color:'#ccc', fontSize:13, padding:'10px 0', borderTop:'1px solid #333', marginTop:4, marginBottom:16 }}>
            <input type="checkbox" checked={editPost.hide} onChange={e=>setEditPost(p=>p?{...p,hide:e.target.checked}:p)} />
            Hide from grid (still editable)
          </label>

          <button className="btn-p" onClick={saveEdit} disabled={uploading}>{uploading?'Uploading…':'Save Changes'}</button>
          <button className="btn-d" onClick={()=>{ if(confirm('Delete this post?')) deletePost(editPost.id) }}>Delete Post</button>
          <button className="btn-g" onClick={()=>setActivePanel(null)}>Cancel</button>
        </div>
      )}

      {/* ── Add Post Panel ── */}
      {activePanel==='add' && (
        <div className="slide-panel" onClick={e=>e.stopPropagation()}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <h3 style={{ color:'#fff', margin:0, fontSize:16 }}>Add New Post</h3>
            <button onClick={()=>setActivePanel(null)} style={{ background:'none', border:'none', color:'#888', fontSize:24, cursor:'pointer', lineHeight:1 }}>×</button>
          </div>

          <div style={{ marginBottom:16 }}>
            {newPostPreview
              ? <div style={{ background:'#111', borderRadius:10, overflow:'hidden', aspectRatio:'1', marginBottom:8 }}>
                  {newPost.mediaType==='video'
                    ? <video src={newPostPreview} style={{ width:'100%', height:'100%', objectFit:'cover' }} controls playsInline />
                    : <img src={newPostPreview} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  }
                </div>
              : null
            }
            <label style={{ display:'block', background:'#2a2a2a', border:'2px dashed #444', borderRadius:10, padding:'20px', cursor:'pointer', color:'#ccc', fontSize:13, textAlign:'center' }}>
              📷 / 🎬 Click to upload image or video (MP4 / MOV)
              <input type="file" accept="image/*,video/mp4,video/quicktime,.mp4,.mov" style={{ display:'none' }} onChange={handleNewFile} />
            </label>
          </div>

          <F label="Title" value={(newPost.title||'')} onChange={v=>setNewPost(p=>({...p,title:v}))} />
          <F label="Hook (main text)" value={(newPost.hook||'')} onChange={v=>setNewPost(p=>({...p,hook:v}))} multiline />
          <F label="Caption" value={(newPost.caption||'')} onChange={v=>setNewPost(p=>({...p,caption:v}))} multiline />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
            <div><div className="fl">Date</div><input className="fi" value={newPost.date||''} onChange={e=>setNewPost(p=>({...p,date:e.target.value}))} placeholder="Jun 16"/></div>
            <div><div className="fl">Day</div><input className="fi" value={newPost.day||''} onChange={e=>setNewPost(p=>({...p,day:e.target.value}))} placeholder="Mon"/></div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
            <div><div className="fl">Week</div><select className="fi" value={newPost.week||1} onChange={e=>setNewPost(p=>({...p,week:Number(e.target.value)}))}>{[1,2,3,4,5,6,7,8].map(w=><option key={w} value={w}>Week {w}</option>)}</select></div>
            <div><div className="fl">Status</div><select className="fi" value={newPost.status||'To Film'} onChange={e=>setNewPost(p=>({...p,status:e.target.value}))}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
          </div>

          <div style={{ marginBottom:10 }}><div className="fl">Platform</div><select className="fi" value={newPost.platform||'Instagram'} onChange={e=>setNewPost(p=>({...p,platform:e.target.value}))}>{PLATFORMS.map(s=><option key={s}>{s}</option>)}</select></div>
          <div style={{ marginBottom:10 }}><div className="fl">Format</div><select className="fi" value={newPost.format||'Static'} onChange={e=>setNewPost(p=>({...p,format:e.target.value}))}>{FORMATS.map(s=><option key={s}>{s}</option>)}</select></div>
          <div style={{ marginBottom:16 }}><div className="fl">Content Pillar</div><select className="fi" value={newPost.pillar||'P1 Gut Education'} onChange={e=>setNewPost(p=>({...p,pillar:e.target.value}))}>{PILLARS.map(s=><option key={s}>{s}</option>)}</select></div>

          <button className="btn-p" onClick={submitAdd} disabled={uploading}>{uploading?'Uploading…':'Add to Grid'}</button>
          <button className="btn-g" onClick={()=>setActivePanel(null)}>Cancel</button>
        </div>
      )}

      {/* ── Profile Panel ── */}
      {activePanel==='profile' && (
        <div className="slide-panel" onClick={e=>e.stopPropagation()}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <h3 style={{ color:'#fff', margin:0, fontSize:16 }}>Edit Profile</h3>
            <button onClick={()=>setActivePanel(null)} style={{ background:'none', border:'none', color:'#888', fontSize:24, cursor:'pointer', lineHeight:1 }}>×</button>
          </div>

          <div style={{ textAlign:'center', marginBottom:20 }}>
            {editingProfile.avatarUrl
              ? <img src={editingProfile.avatarUrl} style={{ width:80, height:80, borderRadius:'50%', objectFit:'cover', marginBottom:8 }} />
              : <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#033F3B,#7DB82A)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:32, marginBottom:8 }}>🍵</div>
            }
            <div>
              <label style={{ background:'#2a2a2a', border:'1px solid #444', borderRadius:8, padding:'6px 14px', cursor:'pointer', color:'#ccc', fontSize:12 }}>
                {uploading?'Uploading…':'Upload Avatar'}
                <input type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatarUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          <F label="Username" value={editingProfile.username} onChange={v=>setEditingProfile(p=>({...p,username:v}))} />
          <F label="Display Name" value={editingProfile.displayName} onChange={v=>setEditingProfile(p=>({...p,displayName:v}))} />
          <F label="Bio" value={editingProfile.bio} onChange={v=>setEditingProfile(p=>({...p,bio:v}))} multiline />
          <F label="Link" value={editingProfile.link} onChange={v=>setEditingProfile(p=>({...p,link:v}))} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
            <div><div className="fl">Followers</div><input className="fi" value={editingProfile.followers} onChange={e=>setEditingProfile(p=>({...p,followers:e.target.value}))} /></div>
            <div><div className="fl">Following</div><input className="fi" value={editingProfile.following} onChange={e=>setEditingProfile(p=>({...p,following:e.target.value}))} /></div>
          </div>

          <div style={{ marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div className="fl" style={{ margin:0 }}>Story Highlights</div>
              <button onClick={()=>setEditingProfile(p=>({...p,highlights:[...p.highlights,{emoji:'⭐',label:'New',bg:'#033F3B'}]}))} style={{ background:'#C5D93A', color:'#033F3B', border:'none', borderRadius:6, padding:'4px 10px', fontSize:12, fontWeight:700, cursor:'pointer' }}>+ Add</button>
            </div>
            {editingProfile.highlights.map((h,i)=>(
              <div key={i} style={{ background:'#2a2a2a', borderRadius:10, padding:'10px 12px', marginBottom:8, display:'flex', gap:8, alignItems:'center' }}>
                <input className="fi" style={{ width:50 }} value={h.emoji} onChange={e=>{ const hl=[...editingProfile.highlights]; hl[i]={...hl[i],emoji:e.target.value}; setEditingProfile(p=>({...p,highlights:hl})) }} />
                <input className="fi" style={{ flex:1 }} value={h.label} onChange={e=>{ const hl=[...editingProfile.highlights]; hl[i]={...hl[i],label:e.target.value}; setEditingProfile(p=>({...p,highlights:hl})) }} />
                <input type="color" value={h.bg} onChange={e=>{ const hl=[...editingProfile.highlights]; hl[i]={...hl[i],bg:e.target.value}; setEditingProfile(p=>({...p,highlights:hl})) }} style={{ width:36, height:36, border:'none', borderRadius:6, cursor:'pointer', padding:2 }} />
                <button onClick={()=>setEditingProfile(p=>({...p,highlights:p.highlights.filter((_,idx)=>idx!==i)}))} style={{ background:'none', border:'none', color:'#e53e3e', fontSize:20, cursor:'pointer', padding:'0 4px', lineHeight:1 }}>×</button>
              </div>
            ))}
          </div>

          <button className="btn-p" onClick={saveProfileEdit}>Save Profile</button>
          <button className="btn-g" onClick={()=>setActivePanel(null)}>Cancel</button>
        </div>
      )}

      {/* ── Backups modal ── */}
      {showBackups && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={()=>setShowBackups(false)}>
          <div style={{ background:'#1e1e1e', border:'1px solid #333', borderRadius:16, padding:24, width:'100%', maxWidth:480, maxHeight:'80vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div>
                <h3 style={{ color:'#fff', margin:'0 0 4px', fontSize:16 }}>🕐 Backups</h3>
                <p style={{ color:'#666', fontSize:12, margin:0 }}>Auto-saved before every change. Last {backups.length} backups shown.</p>
              </div>
              <button onClick={()=>setShowBackups(false)} style={{ background:'none', border:'none', color:'#888', fontSize:22, cursor:'pointer', lineHeight:1 }}>×</button>
            </div>
            {backups.length === 0
              ? <p style={{ color:'#555', textAlign:'center', padding:'20px 0' }}>No backups yet — they appear after your first save.</p>
              : backups.map((b, i) => {
                const d = new Date(b.uploadedAt)
                const label = d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) + ' at ' + d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})
                return (
                  <div key={b.url} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #2a2a2a' }}>
                    <div>
                      <div style={{ color:'#ccc', fontSize:14 }}>{i === 0 ? '⭐ Most Recent — ' : ''}{label}</div>
                    </div>
                    <button onClick={()=>restoreBackup(b.url)} style={{ background:'#2a2a2a', border:'1px solid #444', borderRadius:8, padding:'6px 12px', color:'#C5D93A', fontSize:12, cursor:'pointer', fontWeight:600, flexShrink:0 }}>Restore</button>
                  </div>
                )
              })
            }
          </div>
        </div>
      )}
    </div>
  )
}

function F({ label, value, onChange, multiline }: { label:string; value:string; onChange:(v:string)=>void; multiline?:boolean }) {
  return (
    <div style={{ marginBottom:10 }}>
      <div className="fl">{label}</div>
      {multiline
        ? <textarea className="fi" value={value||''} onChange={e=>onChange(e.target.value)} rows={3} style={{ resize:'vertical' }} />
        : <input className="fi" value={value||''} onChange={e=>onChange(e.target.value)} />
      }
    </div>
  )
}
