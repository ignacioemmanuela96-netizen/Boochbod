import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif',
  'video/mp4', 'video/quicktime', 'video/mov', 'video/x-m4v', 'video/mpeg',
]

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as HandleUploadBody

  // blob.upload-completed is a server-to-server callback from Vercel Blob — no user cookies.
  // Let handleUpload verify it internally; do NOT auth-check this branch.
  if ((body as { type?: string }).type === 'blob.upload-completed') {
    try {
      const json = await handleUpload({
        body, request: req,
        onBeforeGenerateToken: async () => ({ allowedContentTypes: ALLOWED_TYPES }),
        onUploadCompleted: async () => {},
      })
      return NextResponse.json(json)
    } catch (err) {
      return NextResponse.json({ error: (err as Error).message }, { status: 400 })
    }
  }

  // Token generation — requires a logged-in session
  const jar = await cookies()
  const authed =
    jar.get('bb_admin')?.value === '1' ||
    !!jar.get('bb_client')?.value ||
    !!jar.get('bb_preview_client')?.value

  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const json = await handleUpload({
      body, request: req,
      onBeforeGenerateToken: async () => ({ allowedContentTypes: ALLOWED_TYPES }),
      onUploadCompleted: async () => {},
    })
    return NextResponse.json(json)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 })
  }
}
