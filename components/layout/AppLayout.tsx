'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Sidebar from '@/components/layout/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  useEffect(() => { if (!loading && !user) router.push('/auth') }, [user, loading, router])
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', backgroundColor:'var(--color-background)' }}>
      <div style={{ textAlign:'center' }}>
        <h2 style={{ fontFamily:'var(--font-heading)', fontSize:'24px', color:'var(--color-text)', marginBottom:'8px' }}>L'Académie Moderne</h2>
        <p style={{ fontSize:'13px', color:'var(--color-muted)' }}>Chargement...</p>
      </div>
    </div>
  )
  if (!user) return null
  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar />
      <main style={{ flex:1, marginLeft:'var(--nav-width)', display:'flex', flexDirection:'column', minHeight:'100vh', background: 'radial-gradient(80rem 36rem at 100% -5%, rgba(91,33,182,0.26), transparent 58%), radial-gradient(52rem 26rem at 0% 0%, rgba(192,38,211,0.16), transparent 60%), var(--color-background)' }}>
        {children}
      </main>
    </div>
  )
}
