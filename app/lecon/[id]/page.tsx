'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import { supabase, Module } from '@/lib/supabase'

export default function LeconPage() {
  const router = useRouter()
  const params = useParams()
  const moduleId = params.id as string
  const [module, setModule] = useState<Module | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadModule() {
      const { data } = await supabase.from('modules').select('*').eq('id', moduleId).single()
      if (data) setModule(data)
      setLoading(false)
    }
    loadModule()
  }, [moduleId])

  if (loading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <div className="skeleton" style={{ width: '200px', height: '200px', borderRadius: '2px' }} />
        </div>
      </AppLayout>
    )
  }

  if (!module) {
    return (
      <AppLayout>
        <div style={{ textAlign: 'center', padding: '80px 40px', color: 'var(--color-muted)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>error</span>
          <p style={{ fontSize: '16px' }}>Module non trouvé.</p>
          <button onClick={() => router.push('/bibliotheque')} style={{ marginTop: '16px', background: 'none', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', padding: '8px 16px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Retour à la bibliothèque
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <header style={{ display: 'flex', alignItems: 'center', padding: '12px 32px', borderBottom: '1px solid var(--color-muted)', backgroundColor: 'var(--color-surface)', flexShrink: 0 }}>
          <button onClick={() => router.push('/bibliotheque')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
            Retour à la Bibliothèque
          </button>
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>{module.chapitre}</span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', fontWeight: 500, color: 'var(--color-text)', margin: '16px 0' }}>{module.titre}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', backgroundColor: 'var(--color-background)', border: '1px solid rgba(142,150,164,0.3)', padding: '4px 8px' }}>{module.categorie}</span>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--color-muted)' }}>{module.duree_minutes} MIN</span>
            </div>
            {module.description && (
              <div style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-muted)', padding: '24px', borderRadius: '2px', marginBottom: '32px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 500, color: 'var(--color-text)', marginBottom: '16px' }}>Description</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text)', lineHeight: 1.7 }}>{module.description}</p>
              </div>
            )}
            <div style={{ borderTop: '1px solid var(--color-muted)', paddingTop: '32px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 500, color: 'var(--color-text)', marginBottom: '16px' }}>Contenu de la leçon</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.7 }}>
                Le contenu détaillé de cette leçon sera affiché ici. Cette page est un modèle pour afficher les détails d'un module spécifique.
              </p>
            </div>
            <div style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
              <button onClick={() => router.push('/exercices')} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '2px', padding: '12px 24px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                Commencer les exercices <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_arrow</span>
              </button>
              <button onClick={() => router.push('/ecriture')} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--color-surface)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', borderRadius: '2px', padding: '12px 24px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                Pratique écrite <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
