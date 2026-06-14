import { NextRequest, NextResponse } from 'next/server'
import { getClients } from '@/lib/clients'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  // Admin login
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  if (username === 'admin' && password === adminPassword) {
    const res = NextResponse.json({ ok: true, role: 'admin' })
    res.cookies.set('bb_admin', '1', { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/' })
    res.cookies.delete('bb_client')
    return res
  }

  // Client login
  const clients = await getClients()
  const client = clients.find(c => c.username === username && c.password === password)
  if (client) {
    const res = NextResponse.json({ ok: true, role: 'client', clientId: client.id })
    res.cookies.set('bb_client', client.id, { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/' })
    res.cookies.delete('bb_admin')
    return res
  }

  return NextResponse.json({ error: 'Wrong username or password' }, { status: 401 })
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('bb_admin')
  res.cookies.delete('bb_client')
  return res
}
