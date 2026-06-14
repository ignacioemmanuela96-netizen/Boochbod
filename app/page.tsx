import { createClient } from '@/lib/supabase/server'
import GridClient from '@/components/GridClient'
import SetupPage from '@/components/SetupPage'
import { Post, Profile } from '@/lib/types'
import { cookies } from 'next/headers'

const DEFAULT_PROFILE: Profile = {
  id: 1,
  username: 'boochbod',
  display_name: 'BoochBod',
  bio: 'probiotic kombucha gummy 🍵\ngut health for women who want to feel themselves again',
  link: 'linkinbio.boochbod.com',
  followers: '14.2K',
  following: '312',
  avatar_url: null,
  highlights: [
    { emoji: 'BB', label: 'About Us', bg: '#033F3B', isBB: true, cover_url: null },
    { emoji: '✨', label: 'Results', bg: '#FFB4DB', cover_url: null },
    { emoji: '🧬', label: 'Gut Facts', bg: '#C5D93A', cover_url: null },
    { emoji: '⭐', label: 'Reviews', bg: '#ffd700', cover_url: null },
    { emoji: '🍬', label: 'Product', bg: '#033F3B', cover_url: null },
  ]
}

const SEED_POSTS: Omit<Post, 'created_at'>[] = [
  { id: 1, title: "You're Not Alone", hook: "I was bloated after every meal for 3 years. 45 days of BoochBod — I haven't been bloated since week 2.", caption: null, date: 'Jun 16', day: 'Mon', week: 1, theme: "You're Not Alone", platform: 'TikTok', format: 'Face-to-cam UGC', pillar: 'P3 Social Proof', media_type: 'video', media_url: null, cover_url: null, hide: false, position: 1, status: 'To Film' },
  { id: 2, title: 'Your Gut Is Talking', hook: "Your gut is talking. Here's what it's saying.", caption: null, date: 'Jun 17', day: 'Tue', week: 1, theme: "You're Not Alone", platform: 'Instagram', format: 'Carousel', pillar: 'P1 Gut Education', media_type: 'image', media_url: null, cover_url: null, hide: false, position: 2, status: 'To Film' },
  { id: 3, title: 'Gut Health Girlie', hook: 'This is what a gut health girlie looks like.', caption: null, date: 'Jun 18', day: 'Wed', week: 1, theme: "You're Not Alone", platform: 'Instagram', format: 'Static', pillar: 'P2 Identity & Lifestyle', media_type: 'image', media_url: null, cover_url: null, hide: false, position: 3, status: 'To Film' },
  { id: 4, title: 'Cancel Plans No More', hook: "I used to cancel plans because of my gut. I don't anymore.", caption: null, date: 'Jun 19', day: 'Thu', week: 1, theme: "You're Not Alone", platform: 'TikTok', format: 'Reel', pillar: 'P4 Emotional Storytelling', media_type: 'video', media_url: null, cover_url: null, hide: false, position: 4, status: 'To Film' },
  { id: 5, title: 'Morning Routine Breakdown', hook: 'How I take my BoochBod: my morning routine breakdown.', caption: null, date: 'Jun 20', day: 'Fri', week: 1, theme: "You're Not Alone", platform: 'Instagram', format: 'Carousel', pillar: 'P5 Product in Action', media_type: 'image', media_url: null, cover_url: null, hide: false, position: 5, status: 'To Film' },
  { id: 6, title: 'One Gummy Changed Everything', hook: 'One gummy with breakfast changed everything.', caption: null, date: 'Jun 23', day: 'Mon', week: 2, theme: 'Small Habits Big Results', platform: 'TikTok', format: 'Face-to-cam UGC', pillar: 'P5 Product in Action', media_type: 'video', media_url: null, cover_url: null, hide: false, position: 6, status: 'To Film' },
  { id: 7, title: '5 Foods Destroying Your Gut', hook: '5 foods that are secretly destroying your gut.', caption: null, date: 'Jun 24', day: 'Tue', week: 2, theme: 'Small Habits Big Results', platform: 'Instagram', format: 'Carousel', pillar: 'P1 Gut Education', media_type: 'image', media_url: null, cover_url: null, hide: false, position: 7, status: 'To Film' },
  { id: 8, title: '2,847 Women Fixed Bloat', hook: '2,847 women said this fixed their bloat.', caption: null, date: 'Jun 25', day: 'Wed', week: 2, theme: 'Small Habits Big Results', platform: 'Instagram', format: 'Static', pillar: 'P3 Social Proof', media_type: 'image', media_url: null, cover_url: null, hide: false, position: 8, status: 'To Film' },
  { id: 9, title: 'Day in My Life', hook: 'Day in my life as someone who actually takes care of their gut.', caption: null, date: 'Jun 26', day: 'Thu', week: 2, theme: 'Small Habits Big Results', platform: 'TikTok', format: 'Duet / Stitch', pillar: 'P2 Identity & Lifestyle', media_type: 'video', media_url: null, cover_url: null, hide: false, position: 9, status: 'To Film' },
  { id: 10, title: 'Before vs. After 30 Days', hook: 'Before BoochBod vs. after: a 30-day diary.', caption: null, date: 'Jun 27', day: 'Fri', week: 2, theme: 'Small Habits Big Results', platform: 'Instagram', format: 'Carousel', pillar: 'P4 Emotional Storytelling', media_type: 'image', media_url: null, cover_url: null, hide: false, position: 10, status: 'To Film' },
  { id: 11, title: 'The Identity Shift', hook: "I stopped identifying as 'the bloated one' and this is what happened.", caption: null, date: 'Jun 30', day: 'Mon', week: 3, theme: 'The Identity Shift', platform: 'TikTok', format: 'Reel', pillar: 'P2 Identity & Lifestyle', media_type: 'video', media_url: null, cover_url: null, hide: false, position: 11, status: 'To Film' },
  { id: 12, title: 'Gut-Brain Connection', hook: "The gut-brain connection nobody talks about.", caption: null, date: 'Jul 1', day: 'Tue', week: 3, theme: 'The Identity Shift', platform: 'Instagram', format: 'Carousel', pillar: 'P1 Gut Education', media_type: 'image', media_url: null, cover_url: null, hide: false, position: 12, status: 'To Film' },
  { id: 13, title: 'BoochBod Starter Kit', hook: 'Your BoochBod starter kit.', caption: null, date: 'Jul 2', day: 'Wed', week: 3, theme: 'The Identity Shift', platform: 'Instagram', format: 'Static', pillar: 'P5 Product in Action', media_type: 'image', media_url: null, cover_url: null, hide: false, position: 13, status: 'To Film' },
  { id: 14, title: 'Dressing Room Moment', hook: 'I cried in a dressing room because I felt so good in my body.', caption: null, date: 'Jul 3', day: 'Thu', week: 3, theme: 'The Identity Shift', platform: 'TikTok', format: 'Face-to-cam UGC', pillar: 'P4 Emotional Storytelling', media_type: 'video', media_url: null, cover_url: null, hide: false, position: 14, status: 'To Film' },
  { id: 15, title: '60-Day Transformation', hook: "She tried BoochBod for 60 days. Here's what happened.", caption: null, date: 'Jul 4', day: 'Fri', week: 3, theme: 'The Identity Shift', platform: 'Instagram', format: 'Carousel', pillar: 'P3 Social Proof', media_type: 'image', media_url: null, cover_url: null, hide: false, position: 15, status: 'To Film' },
  { id: 16, title: 'Doctor Reacts', hook: 'Doctor reacts to BoochBod ingredients.', caption: null, date: 'Jul 7', day: 'Mon', week: 4, theme: 'Proof + Push', platform: 'TikTok', format: 'Face-to-cam UGC', pillar: 'P3 Social Proof', media_type: 'video', media_url: null, cover_url: null, hide: false, position: 16, status: 'To Film' },
  { id: 17, title: 'Gummies Work Better', hook: 'Why probiotics in gummy form actually work better.', caption: null, date: 'Jul 8', day: 'Tue', week: 4, theme: 'Proof + Push', platform: 'Instagram', format: 'Carousel', pillar: 'P1 Gut Education', media_type: 'image', media_url: null, cover_url: null, hide: false, position: 17, status: 'To Film' },
  { id: 18, title: '3PM Energy Crash', hook: 'The 3pm energy crash is not normal.', caption: null, date: 'Jul 9', day: 'Wed', week: 4, theme: 'Proof + Push', platform: 'Instagram', format: 'Static', pillar: 'P2 Identity & Lifestyle', media_type: 'image', media_url: null, cover_url: null, hide: false, position: 18, status: 'To Film' },
  { id: 19, title: "Mom's Gut Health Journey", hook: 'My mom started taking BoochBod and now we talk about gut health at dinner.', caption: null, date: 'Jul 10', day: 'Thu', week: 4, theme: 'Proof + Push', platform: 'TikTok', format: 'Duet / Stitch', pillar: 'P4 Emotional Storytelling', media_type: 'video', media_url: null, cover_url: null, hide: false, position: 19, status: 'To Film' },
  { id: 20, title: '4-Week Gut Reset', hook: 'Your 4-week gut reset plan. Starting now.', caption: null, date: 'Jul 11', day: 'Fri', week: 4, theme: 'Proof + Push', platform: 'Instagram', format: 'Carousel', pillar: 'P5 Product in Action', media_type: 'image', media_url: null, cover_url: null, hide: false, position: 20, status: 'To Film' },
]

export default async function Home() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  const isAdmin = session?.value === (process.env.ADMIN_PASSWORD || 'admin123')

  const supabase = await createClient()

  let { data: postsData, error: postsError } = await supabase.from('posts').select('*').order('position')
  let { data: profileData, error: profileError } = await supabase.from('profile').select('*').eq('id', 1).single()

  // Tables don't exist yet — show setup page
  if (postsError?.code === '42P01' || profileError?.code === '42P01') {
    return <SetupPage isAdmin={isAdmin} />
  }

  // Seed posts if empty
  if (!postsData || postsData.length === 0) {
    await supabase.from('posts').insert(SEED_POSTS)
    const { data } = await supabase.from('posts').select('*').order('position')
    postsData = data
  }

  // Seed profile if missing
  if (!profileData) {
    await supabase.from('profile').insert(DEFAULT_PROFILE)
    const { data } = await supabase.from('profile').select('*').eq('id', 1).single()
    profileData = data
  }

  const posts = (postsData || SEED_POSTS) as Post[]
  const profile = (profileData || DEFAULT_PROFILE) as Profile

  return <GridClient initialPosts={posts} initialProfile={profile} isAdmin={isAdmin} />
}
