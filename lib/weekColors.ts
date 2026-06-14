export const WEEK_PALETTES: Record<number, { bg: string[]; accent: string }> = {
  1: { bg: ['#0d2d4a', '#4A90D9'], accent: '#4A90D9' },
  2: { bg: ['#033F3B', '#7DB82A'], accent: '#7DB82A' },
  3: { bg: ['#2d0d4a', '#A855C8'], accent: '#A855C8' },
  4: { bg: ['#4a1f00', '#E07B2F'], accent: '#E07B2F' },
}

export function getWeekPalette(week: number) {
  const key = ((week - 1) % 4) + 1
  return WEEK_PALETTES[key]
}
