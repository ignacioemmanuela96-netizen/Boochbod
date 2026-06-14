import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const jar = await cookies()
  if (jar.get('bb_admin')?.value !== '1') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form = await req.formData()
  const file = form.get('file') as File
  const key = form.get('key') as string

  if (!file || !key) return NextResponse.json({ error: 'Missing file or key' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const blob = await put(`media/${key}`, bytes, {
    access: 'public',
    contentType: file.type,
    addRandomSuffix: false,
  })

  return NextResponse.json({ url: blob.url })
}
