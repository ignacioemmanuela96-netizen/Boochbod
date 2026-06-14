export interface Highlight {
  emoji: string
  label: string
  bg: string
  isBB?: boolean
  cover_url?: string | null
}

export interface Profile {
  id: number
  username: string
  display_name: string
  bio: string
  link: string
  followers: string
  following: string
  avatar_url: string | null
  highlights: Highlight[]
}

export interface Post {
  id: number
  title: string
  hook: string | null
  caption: string | null
  date: string | null
  day: string
  platform: string
  format: string | null
  week: number
  status: string
  theme: string | null
  pillar: string
  media_type: string
  media_url: string | null
  cover_url: string | null
  hide: boolean
  position: number
  created_at: string
}
