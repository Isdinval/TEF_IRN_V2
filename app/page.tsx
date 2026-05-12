'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (!loading) { if (user) router.push('/dashboard'); else router.push('/auth') }
  }, [user, loading, router])
  return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', backgroundColor:'var(--color-background)' }}><h1 style={{ fontFamily:'var(--font-heading)', fontSize:'32px', color:'var(--color-text)' }}>L'Académie Moderne</h1></div>
}
