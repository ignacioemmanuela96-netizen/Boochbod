import { put, del } from '@vercel/blob'

export interface Client {
  id: string
  name: string
  username: string
  password: string
  brand: string
  instagram: string
  notes: string
  createdAt: string
  logoUrl?: string
}

const CLIENTS_URL = 'https://cbqvalz1fhbqsxye.public.blob.vercel-storage.com/clients.json'

const INITIAL_CLIENTS: Client[] = [
  {
    id: 'boochbod',
    name: 'BoochBod',
    username: 'boochbod',
    password: 'boochbod123',
    brand: 'BoochBod',
    instagram: '@boochbod',
    notes: 'Probiotic kombucha gummy brand. First client.',
    createdAt: new Date().toISOString(),
  },
]

export async function getClients(): Promise<Client[]> {
  try {
    const res = await fetch(`${CLIENTS_URL}?t=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) return INITIAL_CLIENTS
    return await res.json()
  } catch {
    return INITIAL_CLIENTS
  }
}

export async function saveClients(clients: Client[]): Promise<void> {
  try { await del('clients.json') } catch {}
  await put('clients.json', JSON.stringify(clients), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  })
}
