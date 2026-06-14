'use client'
import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

// Admin previewing a client's grid — set a temp cookie and redirect to /client
export default function AdminPreview() {
  const router = useRouter()
  const { clientId } = useParams<{ clientId: string }>()

  useEffect(() => {
    if (!document.cookie.includes('bb_admin=1')) { router.replace('/'); return }
    // Set preview cookie so /client loads this client's data
    document.cookie = `bb_preview_client=${clientId};path=/;max-age=3600`
    router.replace('/client?preview=1')
  }, [clientId, router])

  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0f', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'Inter,sans-serif' }}>
      Loading preview…
    </div>
  )
}
