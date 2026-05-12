'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import { useAuth } from '@/lib/auth-context'
import { supabase, Correction, Soumission } from '@/lib/supabase'

export default function CorrectionDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [soumission, setSoumission] = useState<Soumission | null>(null)
  const [correction, setCorrection] = useState<Correction | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedError, setSelectedError] = useState<number | null>(null)

  useEffect(() => {
    if (!user || !id) return
    loadData()
  }, [user, id])

  const loadData = async () => {
    const { data: soum } = await supabase
      .from('soumissions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user!.id)
      .single()

    if (!soum) { router.push('/corrections'); return }
    setSoumission(soum)

    const { data: corr } = await supabase
      .from('corrections')
      .select('*')
      .eq('soumission_id', id)
      .single()

    if (corr) {
      setCorrection(corr)
      setLoading(false)
    } else {
      // Trigger AI correction
      setLoading(false)
      runCorrection(soum)
    }
  }

  const runCorrection = async (soum: Soumission) => {
    setAnalyzing(true)
    try {
      const res = await fetch('/api/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texte: soum.texte_soumis, prompt_texte: soum.prompt_texte }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      // Save correction to DB
      const { data: newCorr } = await supabase.from('corrections').insert({
        soumission_id: id,
        user_id: user!.id,
        note_globale: data.note_globale,
        note_max: data.note_max || 15,
        niveau_cefr: data.niveau_cefr,
        erreurs: data.erreurs || [],
        resume_feedback: data.resume_feedback,
        texte_annote: data.texte_annote || soum.texte_soumis,
      }).select().single()

      // Update soumission status
      await supabase.from('soumissions').update({ statut: 'corrige' }).eq('id', id)

      if (newCorr) setCorrection(newCorr)
    } catch (err) {
      console.error(err)
    }
    setAnalyzing(false)
  }

  // Render annotated text with error highlights
  const renderAnnotatedText = () => {
    if (!correction) return null
    const texte = correction.texte_annote || soumission?.texte_soumis || ''
    const parts = texte.split(/(\[ERR\].*?\[\/ERR\])/g)
    return parts.map((part, i) => {
      const errMatch = part.match(/\[ERR\](.*?)\[\/ERR\]/)
      if (errMatch) {
        const errIndex = correction.erreurs.findIndex(e => e.original === errMatch[1] || part.includes(e.original))
        return (
          <mark
            key={i}
            className="highlight-error"
            onClick={() => setSelectedError(errIndex >= 0 ? errIndex : null)}
            style={{
              backgroundColor: selectedError === errIndex ? '#FCA5A5' : '#FEE2E2',
              cursor: 'pointer',
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
      PONCTUATION: 'Ponctuation',
    }
    return labels[cat] || cat
  }

  const getScoreColor = (note: number, max: number) => {
    const pct = note / max
    if (pct >= 0.8) return '#059669'
    if (pct >= 0.6) return '#D97706'
    return 'var(--color-accent)'
  }

  return (
    <AppLayout>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        borderBottom: '1px solid var(--color-muted)',
        backgroundColor: 'var(--color-surface)',
        flexShrink: 0,
      }}>
        <button
          onClick={() => router.push('/corrections')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
          Toutes les corrections
        </button>

        {correction && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
              Note globale (CECRL)
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', fontWeight: 600, color: getScoreColor(correction.note_globale, correction.note_max) }}>
                {correction.note_globale}
              </span>
              <span style={{ fontSize: '18px', color: 'var(--color-muted)' }}>/ {correction.note_max}</span>
              <span style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '2px',
                letterSpacing: '0.1em',
                marginLeft: '8px',
              }}>
                {correction.niveau_cefr}
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Analyzing state */}
      {analyzing && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-background)',
          gap: '24px',
          padding: '80px',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '2px solid var(--color-muted)',
            borderTop: '2px solid var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--color-text)', marginBottom: '8px' }}>
              Analyse éditoriale en cours...
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
              L'Académie examine votre texte. Cela peut prendre quelques instants.
            </p>
          </div>
        </div>
      )}

      {/* Main content */}
      {!analyzing && soumission && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left: Annotated text */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '40px',
            borderRight: '1px solid var(--color-muted)',
          }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '4px' }}>
                Votre soumission
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                Soumis le {new Date(soumission.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} • {soumission.mot_count || 0} mots
              </div>
            </div>
            <div style={{ width: '100%', borderBottom: '1px solid var(--color-muted)', marginBottom: '32px' }} />

            {loading ? (
              <div className="skeleton" style={{ height: '400px', borderRadius: '2px' }} />
            ) : (
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '18px',
                lineHeight: 1.9,
                color: 'var(--color-text)',
                whiteSpace: 'pre-wrap',
              }}>
                {correction ? renderAnnotatedText() : soumission.texte_soumis}
              </div>
            )}

            {correction && (
              <div style={{
                marginTop: '40px',
                padding: '20px',
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-muted)',
                borderRadius: '2px',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '10px' }}>
                  Synthèse globale
                </div>
                <p style={{ fontSize: '14px', color: 'var(--color-text)', lineHeight: 1.7 }}>
                  {correction.resume_feedback}
                </p>
              </div>
            )}
          </div>

          {/* Right: Errors drawer */}
          <div style={{
            width: '380px',
            flexShrink: 0,
            overflowY: 'auto',
            backgroundColor: 'var(--color-surface)',
            padding: '24px',
          }}>
            {!correction ? (
              <div style={{ color: 'var(--color-muted)', fontSize: '14px', textAlign: 'center', marginTop: '40px' }}>
                Aucune correction disponible.
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                    Analyse Éditoriale
                  </div>
                  <div style={{
                    backgroundColor: correction.erreurs.length > 0 ? '#FEE2E2' : '#D1FAE5',
                    color: correction.erreurs.length > 0 ? 'var(--color-accent)' : '#065F46',
                    border: `1px solid ${correction.erreurs.length > 0 ? 'rgba(217,42,42,0.3)' : '#A7F3D0'}`,
                    borderRadius: '2px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                  }}>
                    {correction.erreurs.length} erreur{correction.erreurs.length !== 1 ? 's' : ''} détectée{correction.erreurs.length !== 1 ? 's' : ''}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {correction.erreurs.map((err, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedError(selectedError === i ? null : i)}
                      style={{
                        border: `1px solid ${selectedError === i ? 'var(--color-accent)' : 'var(--color-muted)'}`,
                        borderRadius: '2px',
                        padding: '16px',
                        cursor: 'pointer',
                        backgroundColor: selectedError === i ? '#FFF5F5' : 'var(--color-surface)',
                        transition: 'all 0.15s',
                      }}
                    >
                      {/* Category badge */}
                      <div style={{ marginBottom: '10px' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          color: 'var(--color-accent)',
                          backgroundColor: '#FEE2E2',
                          padding: '3px 8px',
                          borderRadius: '2px',
                        }}>
                          Erreur {String(i + 1).padStart(2, '0')} / {getCategoryLabel(err.categorie)}
                        </span>
                      </div>

                      {/* Original vs corrected */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '18px', color: 'var(--color-accent)' }}>×</span>
                          <span style={{
                            fontSize: '15px',
                            fontFamily: 'var(--font-heading)',
                            color: 'var(--color-accent)',
                            textDecoration: 'line-through',
                          }}>
                            {err.original}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '18px', color: '#059669' }}>✓</span>
                          <span style={{
                            fontSize: '15px',
                            fontFamily: 'var(--font-heading)',
                            color: '#059669',
                            fontWeight: 500,
                          }}>
                            {err.corrige}
                          </span>
                        </div>
                      </div>

                      {/* Explanation */}
                      <div style={{ borderTop: '1px solid var(--color-muted)', paddingTop: '10px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '4px' }}>
                          Note de correction :
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--color-text)', lineHeight: 1.6 }}>
                          {err.explication}
                        </p>
                      </div>
                    </div>
                  ))}

                  {correction.erreurs.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '40px', display: 'block', marginBottom: '12px', color: '#10B981' }}>check_circle</span>
                      <p style={{ fontSize: '14px' }}>Aucune erreur détectée. Excellent travail !</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  )
}
