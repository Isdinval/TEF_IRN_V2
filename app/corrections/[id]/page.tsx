'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

type Soumission = any
type Correction = any

export default function CorrectionDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [soumission, setSoumission] = useState<Soumission | null>(null)
  const [correction, setCorrection] = useState<Correction | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedError, setSelectedError] = useState<number | null>(null)

  const loadData = useCallback(async () => {
    if (!user || !id) return

    setLoading(true)
    setError(null)

    const { data: soum, error: soumError } = await supabase
      .from('soumissions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (soumError || !soum) {
      setError("Soumission introuvable")
      setLoading(false)
      return
    }

    setSoumission(soum)

    const { data: corr } = await supabase
      .from('corrections')
      .select('*')
      .eq('soumission_id', id)
      .single()

    if (corr) {
      setCorrection(corr)
      setLoading(false)
    } else if (soum.statut !== 'corrige') {
      setLoading(false)
      runCorrection(soum)
    } else {
      setLoading(false)
    }
  }, [user, id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const runCorrection = async (soum: Soumission) => {
    if (analyzing) return
    setAnalyzing(true)
    setError(null)

    try {
      const res = await fetch('/api/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texte: soum.texte_soumis,
          prompt_texte: soum.prompt_texte,
          section: soum.section
        }),
      })

      if (!res.ok) throw new Error('Erreur API')

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      const { data: newCorr, error: insertError } = await supabase
        .from('corrections')
        .insert({
          soumission_id: id,
          user_id: user!.id,
          note_globale: data.note_globale ?? 0,
          note_max: data.note_max || 15,
          niveau_cefr: data.niveau_cefr || 'A2',
          scores_detail: data.scores_detail || {},
          erreurs: data.erreurs || [],
          points_forts: data.points_forts || [],
          resume_feedback: data.resume_feedback,
          recommandation_prochaine: data.recommandation_prochaine,
          texte_annote: data.texte_annote || soum.texte_soumis,
        })
        .select()
        .single()

      if (insertError) throw insertError

      await supabase
        .from('soumissions')
        .update({ statut: 'corrige' })
        .eq('id', id)

      setCorrection(newCorr)
      await supabase.rpc('refresh_user_stats', { user_uuid: user!.id })

    } catch (err: any) {
      console.error("Erreur correction :", err)
      setError(err.message || "Impossible de générer la correction")
    } finally {
      setAnalyzing(false)
    }
  }

  const renderAnnotatedText = () => {
    if (!correction && !soumission) return null

    const texte = correction?.texte_annote || soumission?.texte_soumis || ''
    const parts = texte.split(/(\[ERR\].*?\[\/ERR\])/g)

    return parts.map((part: string, i: number) => {
      const errMatch = part.match(/\[ERR\](.*?)\[\/ERR\]/)
      if (errMatch) {
        const errIndex = correction?.erreurs?.findIndex((e: any) =>
          e.original === errMatch[1] || part.includes(e.original)
        ) ?? -1

        return (
          <mark
            key={i}
            className="highlight-error"
            onClick={() => setSelectedError(errIndex >= 0 ? errIndex : null)}
            style={{
              backgroundColor: selectedError === errIndex ? '#FCA5A5' : '#FEE2E2',
              cursor: 'pointer',
              padding: '2px 4px',
              borderRadius: '2px',
            }}
          >
            {errMatch[1]}
          </mark>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      GRAMMAIRE: 'Grammaire',
      ORTHOGRAPHE: 'Orthographe',
      SYNTAXE: 'Syntaxe',
      VOCABULAIRE: 'Vocabulaire',
      COHESION: 'Cohésion',
    }
    return labels[cat] || cat
  }

  const getScoreColor = (note: number) => {
    if (note >= 2.5) return '#059669'
    if (note >= 1.8) return '#D97706'
    return '#DC2626'
  }

  const criteriaNames: Record<string, string> = {
    contenu: 'Contenu',
    lexique: 'Lexique',
    morphosyntaxe: 'Morphosyntaxe',
    orthographe: 'Orthographe',
    cohesion: 'Cohésion'
  }

  if (error) {
    return (
      <AppLayout>
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <h2>Erreur</h2>
          <p>{error}</p>
          <button onClick={loadData} style={{ marginTop: '20px', padding: '10px 20px' }}>
            Réessayer
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        borderBottom: '1px solid var(--color-muted)',
        backgroundColor: 'var(--color-surface)',
      }}>
        <button
          onClick={() => router.push('/corrections')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          ← Toutes les corrections
        </button>

        {correction && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '42px', fontWeight: 600, color: getScoreColor(correction.note_globale / 15 * 3) }}>
              {correction.note_globale}
            </div>
            <div style={{ fontSize: '18px', color: 'var(--color-muted)' }}>/ 15</div>
            <span style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              fontSize: '12px',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: '2px',
              letterSpacing: '0.1em',
            }}>
              {correction.niveau_cefr}
            </span>
          </div>
        )}
      </header>

      {analyzing && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
          <div style={{ width: '64px', height: '64px', border: '3px solid var(--color-muted)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <h3>Correction en cours...</h3>
          <p>L’examinateur TEF IRN analyse votre texte</p>
        </div>
      )}

      {!analyzing && soumission && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Texte annoté */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '40px', borderRight: '1px solid var(--color-muted)' }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                Soumis le {new Date(soumission.updated_at).toLocaleDateString('fr-FR')} • {soumission.mot_count || 0} mots
              </div>
            </div>

            <div style={{ fontSize: '18px', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
              {renderAnnotatedText()}
            </div>

            {correction?.resume_feedback && (
              <div style={{ marginTop: '48px', padding: '24px', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-muted)', borderRadius: '2px' }}>
                <p style={{ fontSize: '15px', lineHeight: 1.7 }}>{correction.resume_feedback}</p>
              </div>
            )}
          </div>

          {/* Panneau latéral */}
          <div style={{ width: '420px', flexShrink: 0, overflowY: 'auto', backgroundColor: 'var(--color-surface)', padding: '32px 24px' }}>
            {correction && (
              <>
                {/* Scores détaillés */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '16px' }}>
                    Scores détaillés
                  </div>
                  {Object.entries(correction.scores_detail || {}).map(([key, valueRaw]) => {
                    const value = Number(valueRaw) || 0
                    return (
                      <div key={key} style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                          <span>{criteriaNames[key] || key}</span>
                          <span style={{ fontWeight: 600, color: getScoreColor(value) }}>{value} / 3</span>
                        </div>
                        <div style={{ height: '6px', backgroundColor: 'var(--color-muted)', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ width: `${(value / 3) * 100}%`, height: '100%', backgroundColor: getScoreColor(value) }} />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Points forts */}
                {correction.points_forts && correction.points_forts.length > 0 && (
                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '12px' }}>
                      Points forts
                    </div>
                    <ul style={{ paddingLeft: '20px', color: '#059669' }}>
                      {correction.points_forts.map((point: string, i: number) => (
                        <li key={i} style={{ marginBottom: '8px', fontSize: '14px' }}>✓ {point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Erreurs */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                      Erreurs détectées
                    </div>
                    <div style={{ backgroundColor: '#FEE2E2', color: 'var(--color-accent)', padding: '3px 10px', borderRadius: '2px', fontSize: '11px', fontWeight: 700 }}>
                      {correction.erreurs?.length || 0}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {correction.erreurs?.map((err: any, i: number) => (
                      <div
                        key={i}
                        onClick={() => setSelectedError(selectedError === i ? null : i)}
                        style={{
                          border: `1px solid ${selectedError === i ? 'var(--color-accent)' : 'var(--color-muted)'}`,
                          borderRadius: '2px',
                          padding: '16px',
                          cursor: 'pointer',
                          backgroundColor: selectedError === i ? '#FFF5F5' : 'transparent',
                        }}
                      >
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', backgroundColor: '#FEE2E2', color: 'var(--color-accent)', padding: '2px 8px', borderRadius: '2px' }}>
                            {getCategoryLabel(err.categorie)}
                          </span>
                        </div>
                        <div style={{ fontSize: '14px', marginBottom: '6px' }}>
                          <span style={{ textDecoration: 'line-through', color: '#B91C1C' }}>{err.original}</span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#166534' }}>
                          → {err.corrige}
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '10px', lineHeight: 1.5 }}>
                          {err.explication}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {correction.recommandation_prochaine && (
                  <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '2px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#0369A1' }}>RECOMMANDATION</div>
                    <p style={{ fontSize: '14px', color: '#0C4A6E' }}>{correction.recommandation_prochaine}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  )
}
