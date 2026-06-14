import { NextRequest, NextResponse } from 'next/server'
import { put, del, list } from '@vercel/blob'
import { cookies } from 'next/headers'

const BASE_URL = 'https://cbqvalz1fhbqsxye.public.blob.vercel-storage.com'
const MAX_BACKUPS = 10

export async function GET(req: NextRequest) {
  const jar = await cookies()
  const isAdmin = jar.get('bb_admin')?.value === '1'
  const previewClient = jar.get('bb_preview_client')?.value
  const clientId = isAdmin
    ? (req.nextUrl.searchParams.get('clientId') || previewClient || 'boochbod')
    : jar.get('bb_client')?.value

  if (!clientId) return NextResponse.json({ data: null })

  // Return backup list if requested
  if (req.nextUrl.searchParams.get('backups') === '1') {
    try {
      const { blobs } = await list({ prefix: `client_${clientId}/backups/` })
      const backups = blobs
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
        .map(b => ({ url: b.url, uploadedAt: b.uploadedAt, pathname: b.pathname }))
      return NextResponse.json({ backups })
    } catch {
      return NextResponse.json({ backups: [] })
    }
  }

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
  const mainPath = `client_${clientId}/data.json`

  // Snapshot current data into a timestamped backup before overwriting
  try {
    const current = await fetch(`${BASE_URL}/${mainPath}?t=${Date.now()}`, { cache: 'no-store' })
    if (current.ok) {
      const ts = new Date().toISOString().replace(/[:.]/g, '-')
      const backupPath = `client_${clientId}/backups/data_${ts}.json`
      const currentText = await current.text()
      await put(backupPath, currentText, {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
      })

      // Prune old backups — keep only MAX_BACKUPS most recent
      const { blobs } = await list({ prefix: `client_${clientId}/backups/` })
      const sorted = blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      const toDelete = sorted.slice(MAX_BACKUPS)
      await Promise.all(toDelete.map(b => del(b.url)))
    }
  } catch {
    // Backup failure is non-fatal — continue with save
  }

  // Write new data
  try { await del(mainPath) } catch {}
  const blob = await put(mainPath, JSON.stringify(body), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  })

  return NextResponse.json({ ok: true, url: blob.url })
}
