import { NextRequest, NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'
import { cookies } from 'next/headers'

const BASE_URL = 'https://cbqvalz1fhbqsxye.public.blob.vercel-storage.com'

async function getClientId(): Promise<string | null> {
  const jar = await cookies()
  if (jar.get('bb_admin')?.value === '1') {
    // Admin can sync any client's data by passing ?clientId=
    return null
  }
  return jar.get('bb_client')?.value || null
}

export async function GET(req: NextRequest) {
  const jar = await cookies()
  const isAdmin = jar.get('bb_admin')?.value === '1'
  const previewClient = jar.get('bb_preview_client')?.value
  const clientId = isAdmin
    ? (req.nextUrl.searchParams.get('clientId') || previewClient || 'boochbod')
    : jar.get('bb_client')?.value

  if (!clientId) return NextResponse.json({ data: null })

  try {
    const res = await fetch(`${BASE_URL}/client_${clientId}/data.json?t=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) return NextResponse.json({ data: null })
    const data = await res.json()
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ data: null })
  }
}

export async function POST(req: NextRequest) {
  const jar = await cookies()
  const isAdmin = jar.get('bb_admin')?.value === '1'
  const clientId = isAdmin
    ? (req.nextUrl.searchParams.get('clientId') || null)
    : jar.get('bb_client')?.value

  if (!clientId) return NextResponse.json({ error: 'No client' }, { status: 400 })

  const body = await req.json()
  const path = `client_${clientId}/data.json`

  try { await del(path) } catch {}
  const blob = await put(path, JSON.stringify(body), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  })

  return NextResponse.json({ ok: true, url: blob.url })
}
