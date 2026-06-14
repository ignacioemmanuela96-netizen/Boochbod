import { NextRequest, NextResponse } from 'next/server'
import { put, head, del } from '@vercel/blob'
import { cookies } from 'next/headers'

async function checkAuth() {
  const jar = await cookies()
  return jar.get('bb_admin')?.value === '1'
}

// GET — load cloud data
export async function GET() {
  try {
    const res = await fetch(
      `https://cbqvalz1fhbqsxye.public.blob.vercel-storage.com/boochbod-data.json?t=${Date.now()}`,
      { cache: 'no-store' }
    )
    if (!res.ok) return NextResponse.json({ data: null })
    const data = await res.json()
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ data: null })
  }
}

// POST — save cloud data (auth required)
export async function POST(req: NextRequest) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()

  // Delete old blob first so we can overwrite with same path
  try {
    await del('boochbod-data.json')
  } catch {}

  const blob = await put('boochbod-data.json', JSON.stringify(body), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  })

  return NextResponse.json({ ok: true, url: blob.url })
}
