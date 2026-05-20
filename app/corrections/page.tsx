'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/layout/AppLayout'
import { useAuth } from '@/lib/auth-context'
import { supabase, Soumission } from '@/lib/supabase'
import { Icons } from '@/components/layout/ui/icons'
import { AppPage } from '@/components/ui/app-page'

type SoumissionWithCorrection = Soumission & { corrections?: { note_globale: number; niveau_cefr: string }[] }

export default function CorrectionsPage() {
  const { user } = useAuth()
  const [soumissions, setSoumissions] = useState<SoumissionWithCorrection[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'brouillon' | 'soumis' | 'corrige'>('all')

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  const loadData = async () => {
    const { data } = await supabase
      .from('soumissions')
      .select('*, corrections(note_globale, niveau_cefr)')
      .eq('user_id', user!.id)
      .order('updated_at', { ascending: false })

    setSoumissions((data as SoumissionWithCorrection[]) || [])
    setLoading(false)
  }

  const filteredSoumissions = useMemo(() => {
    if (filter === 'all') return soumissions
    return soumissions.filter((s) => s.statut === filter)
  }, [soumissions, filter])

  const getBadge = (statut: string) => {
    if (statut === 'corrige') return { label: 'Corrigé', bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' }
    if (statut === 'soumis') return { label: 'En analyse', bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' }
    return { label: 'Brouillon', bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB' }
  }

  const getNextAction = (statut: string) => {
    if (statut === 'corrige') return 'Action conseillée : refaire un sujet similaire pour consolider.'
    if (statut === 'soumis') return "Action conseillée : réviser vos erreurs fréquentes pendant l'analyse."
    return 'Action conseillée : terminer ce brouillon puis soumettre.'
  }

  return (
    <AppLayout>
      <AppPage>
      <header style={{ padding: '32px 40px', borderBottom: '1px solid rgba(100,116,139,0.28)', backgroundColor: 'rgba(248,247,252,0.82)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', fontWeight: 500, color: 'var(--color-text)', margin: 0 }}>Corrections</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginTop: '6px' }}>Retrouvez toutes vos soumissions et analyses éditoriales.</p>
          </div>
          <Link href="/ecriture">
            <button style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '2px', padding: '12px 24px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.edit size={18} strokeWidth={2.5} />
              Nouvelle rédaction
            </button>
          </Link>
        </div>
      </header>

      <div style={{ padding: '40px', flex: 1 }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {(['all', 'corrige', 'soumis', 'brouillon'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 12px', border: '1px solid rgba(100,116,139,0.28)', backgroundColor: filter === f ? 'var(--color-primary)' : 'white', color: filter === f ? 'white' : 'var(--color-text)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
              {f === 'all' ? 'Tous' : f}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>{[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '2px' }} />)}</div>
        ) : filteredSoumissions.length === 0 ? (
          <div style={{ backgroundColor: 'rgba(255,255,255,0.84)', border: '1px solid rgba(100,116,139,0.28)', borderRadius: '2px', padding: '80px 40px', textAlign: 'center' }}>
            <Icons.edit size={48} strokeWidth={1.5} style={{ color: 'var(--color-muted)', display: 'block', margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--color-text)', marginBottom: '8px' }}>Aucune soumission</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginBottom: '24px' }}>Rédigez votre première expression écrite pour recevoir un feedback institutionnel.</p>
            <Link href="/ecriture"><button style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '2px', padding: '12px 32px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Commencer une rédaction</button></Link>
          </div>
        ) : (
          <div style={{ backgroundColor: 'rgba(255,255,255,0.84)', border: '1px solid rgba(100,116,139,0.28)', borderRadius: '2px' }}>
            {filteredSoumissions.map((s) => {
              const badge = getBadge(s.statut)
              const corr = s.corrections?.[0]
              return (
                <Link key={s.id} href={`/corrections/${s.id}`} style={{ textDecoration: 'none' }}>
                  <div className="correction-item">
                    <div style={{ width: '44px', height: '44px', backgroundColor: s.statut === 'corrige' ? 'var(--color-hover-blue)' : 'var(--color-background)', border: '1px solid rgba(100,116,139,0.28)', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {s.statut === 'corrige' ? <Icons.taskAlt size={22} strokeWidth={2.5} style={{ color: 'var(--color-primary)' }} /> : <Icons.edit size={22} strokeWidth={2} style={{ color: 'var(--color-muted)' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px' }}>{s.titre || 'Expression Écrite'}</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-muted)' }}>{s.mot_count ? `${s.mot_count} mots` : 'Brouillon'} • {new Date(s.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-primary)', marginTop: '6px' }}>{getNextAction(s.statut)}</div>
                    </div>
                    {corr && (
                      <div style={{ textAlign: 'center', flexShrink: 0, marginRight: '16px' }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--color-primary)' }}>{corr.note_globale}<span style={{ fontSize: '16px', color: 'var(--color-muted)' }}>/ 15</span></div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)', letterSpacing: '0.1em' }}>{corr.niveau_cefr}</div>
                      </div>
                    )}
                    <div style={{ padding: '4px 10px', backgroundColor: badge.bg, border: `1px solid ${badge.border}`, borderRadius: '2px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: badge.color, flexShrink: 0 }}>{badge.label}</div>
                    <Icons.chevronRight size={20} strokeWidth={2.5} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .correction-item { padding: 20px 24px; display: flex; align-items: center; gap: 20px; border-bottom: 1px solid var(--color-muted); cursor: pointer; transition: background-color 0.15s; }
        .correction-item:last-child { border-bottom: none; }
        .correction-item:hover { background-color: var(--color-hover-blue); }
      `}</style>
          </AppPage>
    </AppLayout>
  )
}
