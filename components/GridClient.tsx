'use client'
import { useState } from 'react'
import { Post, Profile } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import AdminBar from './AdminBar'
import ProfileSection from './ProfileSection'
import GridControls from './GridControls'
import PostGrid from './PostGrid'
import EditPanel from './EditPanel'
import ProfilePanel from './ProfilePanel'

interface Props {
  initialPosts: Post[]
  initialProfile: Profile
  isAdmin: boolean
}

export default function GridClient({ initialPosts, initialProfile, isAdmin }: Props) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [filter, setFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('POSTS')
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [profilePanelOpen, setProfilePanelOpen] = useState(false)

  const weeks = [...new Set(posts.map(p => p.week))].sort((a, b) => a - b)

  async function handleAddPost() {
    const supabase = createClient()
    const maxPos = posts.reduce((m, p) => Math.max(m, p.position), 0)
    const { data, error } = await supabase.from('posts').insert({
      title: 'New Post', position: maxPos + 1, week: 1, platform: 'Instagram', media_type: 'image', pillar: 'P1 Gut Education', status: 'To Film', day: 'Mon'
    }).select().single()
    if (!error && data) {
      setPosts(prev => [...prev, data])
      setEditingPost(data)
    }
  }

  function handleSavePost(updated: Post) {
    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))
  }

  function handleDeletePost(id: number) {
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div style={{ maxWidth: 470, margin: '0 auto', background: '#fff', minHeight: '100vh' }}>
      {isAdmin && <AdminBar />}

      <ProfileSection
        profile={profile}
        postCount={posts.length}
        isAdmin={isAdmin}
        onEditProfile={() => setProfilePanelOpen(true)}
      />

      <GridControls
        filter={filter}
        setFilter={setFilter}
        weeks={weeks}
        isAdmin={isAdmin}
        onAddPost={handleAddPost}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <PostGrid
        posts={posts}
        setPosts={setPosts}
        isAdmin={isAdmin}
        filter={filter}
        activeTab={activeTab}
        onEdit={setEditingPost}
      />

      {isAdmin && (
        <>
          <EditPanel
            post={editingPost}
            onClose={() => setEditingPost(null)}
            onSave={handleSavePost}
            onDelete={handleDeletePost}
          />
          <ProfilePanel
            profile={profile}
            open={profilePanelOpen}
            onClose={() => setProfilePanelOpen(false)}
            onSave={p => { setProfile(p); setProfilePanelOpen(false) }}
          />
        </>
      )}
    </div>
  )
}
