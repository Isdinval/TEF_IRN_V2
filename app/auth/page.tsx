'use client'
import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function AuthPage() {
  const [mode, setMode] = useState<'login'|'register'>('login')
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [fullName, setFullName] = useState('')
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false); const [success, setSuccess] = useState('')
  const { signIn, signUp, user } = useAuth(); const router = useRouter()
  useEffect(() => { if (user) router.push('/dashboard') }, [user, router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true)
    if (mode === 'login') { const { error } = await signIn(email, password); if (error) setError(error.message); else router.push('/dashboard') }
    else { if (!fullName.trim()) { setError('Veuillez entrer votre nom complet.'); setLoading(false); return }; const { error } = await signUp(email, password, fullName); if (error) setError(error.message); else setSuccess('Compte créé ! Vérifiez votre email pour confirmer.') }
    setLoading(false)
  }
  const inp = { width:'100%', padding:'12px 16px', backgroundColor:'var(--color-background)', border:'1px solid var(--color-muted)', borderRadius:'2px', fontSize:'14px', color:'var(--color-text)', fontFamily:'var(--font-body)' }
  const lbl = { display:'block', fontSize:'11px', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' as const, color:'var(--color-muted)', marginBottom:'6px' }
  return (
    <div style={{ minHeight:'100vh', backgroundColor:'var(--color-background)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 20px' }}>
      <div style={{ textAlign:'center', marginBottom:'48px' }}>
        <h1 style={{ fontFamily:'var(--font-heading)', fontSize:'36px', fontWeight:600, color:'var(--color-text)', marginBottom:'8px' }}>L'Académie Moderne</h1>
        <p style={{ fontSize:'11px', fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--color-muted)' }}>Préparation TEF IRN</p>
      </div>
      <div style={{ width:'100%', maxWidth:'420px', backgroundColor:'var(--color-surface)', border:'1px solid var(--color-muted)', borderRadius:'2px', padding:'40px' }}>
        <div style={{ display:'flex', borderBottom:'1px solid var(--color-muted)', marginBottom:'32px' }}>
          {(['login','register'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }} style={{ flex:1, padding:'12px', background:'none', border:'none', borderBottom:mode===m?'2px solid var(--color-primary)':'2px solid transparent', color:mode===m?'var(--color-primary)':'var(--color-muted)', fontSize:'11px', fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer', marginBottom:'-1px' }}>
              {m === 'login' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {mode==='register' && <div><label style={lbl}>Nom complet</label><input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Marie Dupont" style={inp} required /></div>}
          <div><label style={lbl}>Adresse email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="marie.dupont@email.com" style={inp} required /></div>
          <div><label style={lbl}>Mot de passe</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={inp} required minLength={6} /></div>
          {error && <div style={{ padding:'12px 16px', backgroundColor:'#FEE2E2', border:'1px solid rgba(217,42,42,0.3)', borderRadius:'2px', fontSize:'13px', color:'var(--color-accent)' }}>{error}</div>}
          {success && <div style={{ padding:'12px 16px', backgroundColor:'#D1FAE5', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'2px', fontSize:'13px', color:'#065F46' }}>{success}</div>}
          <button type="submit" disabled={loading} style={{ width:'100%', padding:'14px', backgroundColor:loading?'var(--color-muted)':'var(--color-primary)', color:'white', border:'none', borderRadius:'2px', fontSize:'11px', fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', cursor:loading?'not-allowed':'pointer', fontFamily:'var(--font-body)', marginTop:'8px' }}>
            {loading ? 'Chargement...' : mode==='login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>
      </div>
    </div>
  )
}
