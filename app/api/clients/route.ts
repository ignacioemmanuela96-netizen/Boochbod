import { NextRequest, NextResponse } from 'next/server'
import { getClients, saveClients, type Client } from '@/lib/clients'
import { cookies } from 'next/headers'

async function requireAdmin() {
  const jar = await cookies()
  return jar.get('bb_admin')?.value === '1'
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const clients = await getClients()
  return NextResponse.json(clients)
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const clients = await getClients()

  if (clients.find(c => c.username === body.username)) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
  }

  const newClient: Client = {
    id: body.username.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    name: body.name,
    username: body.username,
    password: body.password,
    brand: body.brand || body.name,
    instagram: body.instagram || '',
    notes: body.notes || '',
    createdAt: new Date().toISOString(),
  }

  await saveClients([...clients, newClient])
  return NextResponse.json(newClient)
}
