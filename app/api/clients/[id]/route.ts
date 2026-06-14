import { NextRequest, NextResponse } from 'next/server'
import { getClients, saveClients } from '@/lib/clients'
import { cookies } from 'next/headers'

async function requireAdmin() {
  const jar = await cookies()
  return jar.get('bb_admin')?.value === '1'
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const clients = await getClients()
  const updated = clients.map(c => c.id === id ? { ...c, ...body, id: c.id } : c)
  await saveClients(updated)
  return NextResponse.json(updated.find(c => c.id === id))
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const clients = await getClients()
  await saveClients(clients.filter(c => c.id !== id))
  return NextResponse.json({ ok: true })
}
