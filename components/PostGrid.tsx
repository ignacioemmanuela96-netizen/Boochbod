'use client'
import { Post } from '@/lib/types'
import PostTile from './PostTile'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { createClient } from '@/lib/supabase/client'

interface Props {
  posts: Post[]
  setPosts: (posts: Post[]) => void
  isAdmin: boolean
  filter: string
  activeTab: string
  onEdit: (post: Post) => void
}

export default function PostGrid({ posts, setPosts, isAdmin, filter, activeTab, onEdit }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function isFiltered(post: Post) {
    if (activeTab === 'REELS' && post.media_type !== 'video') return true
    if (activeTab === 'TAGGED') return true
    if (filter === 'ig' && post.platform !== 'Instagram') return true
    if (filter === 'tt' && post.platform !== 'TikTok') return true
    if (filter.startsWith('w')) {
      const week = parseInt(filter.slice(1))
      if (post.week !== week) return true
    }
    return false
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = posts.findIndex(p => p.id === active.id)
    const newIndex = posts.findIndex(p => p.id === over.id)
    const reordered = arrayMove(posts, oldIndex, newIndex).map((p, i) => ({ ...p, position: i + 1 }))
    setPosts(reordered)
    const supabase = createClient()
    await Promise.all(reordered.map(p => supabase.from('posts').update({ position: p.position }).eq('id', p.id)))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={posts.map(p => p.id)} strategy={rectSortingStrategy}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
          {posts.map(post => (
            <PostTile
              key={post.id}
              post={post}
              isAdmin={isAdmin}
              onEdit={onEdit}
              filtered={isFiltered(post)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
