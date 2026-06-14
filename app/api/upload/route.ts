import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif',
  'video/mp4', 'video/quicktime', 'video/mov', 'video/x-m4v', 'video/mpeg',
]

export async function POST(req: NextRequest): Promise<NextResponse> {
  const jar = await cookies()
  const authed =
    jar.get('bb_admin')?.value === '1' ||
    !!jar.get('bb_client')?.value ||
    !!jar.get('bb_preview_client')?.value

  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json() as { type?: string; payload?: { pathname?: string; multipart?: boolean } }

    if (body.type !== 'blob.generate-client-token') {
      // blob.upload-completed callback — no-op, return 200
      return NextResponse.json({ ok: true })
    }

    const pathname = body.payload?.pathname
    if (!pathname) {
      return NextResponse.json({ error: 'Missing pathname' }, { status: 400 })
    }

    const ext = pathname.split('.').pop()?.toLowerCase() || ''
    const typeMap: Record<string, string> = {
      mov: 'video/quicktime', mp4: 'video/mp4', m4v: 'video/x-m4v',
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
      gif: 'image/gif', webp: 'image/webp', heic: 'image/heic', heif: 'image/heif',
    }
    const contentType = typeMap[ext] || 'application/octet-stream'

    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    }

    const clientToken = await generateClientTokenFromReadWriteToken({
      pathname,
      allowedContentTypes: ALLOWED_TYPES,
      allowOverwrite: true,
    })

    return NextResponse.json({ clientToken })
  } catch (err) {
    console.error('[upload] error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
