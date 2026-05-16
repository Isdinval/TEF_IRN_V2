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

    if (!soum) { 
      router.push('/corrections'); 
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
    } else {
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
      body: JSON.stringify({ 
        texte: soum.texte_soumis, 
        prompt_texte: soum.prompt_texte,
        section: soum.section 
      }),
    })

    const data = await res.json()
    if (data.error) throw new Error(data.error)

    const { data: newCorr } = await supabase.from('corrections').insert({
      soumission_id: id,
      user_id: user!.id,
      note_globale: data.note_globale,
      note_max: data.note_max || 15,
      niveau_cefr: data.niveau_cefr,
      scores_detail: data.scores_detail || {},
      erreurs: data.erreurs || [],
      points_forts: data.points_forts || [],
      resume_feedback: data.resume_feedback,
      recommandation_prochaine: data.recommandation_prochaine,
      texte_annote: data.texte_annote || soum.texte_soumis,
    }).select().single()

    await supabase.from('soumissions').update({ statut: 'corrige' }).eq('id', id)

    if (newCorr) {
      setCorrection(newCorr)
      
      // Rafraîchissement forcé des données utilisateur (radar + niveau)
      await supabase.rpc('refresh_user_stats', { user_uuid: user!.id })
      
      // Optionnel : recharger la page pour voir le radar mis à jour immédiatement
      setTimeout(() => {
        window.location.reload()
      }, 1200)
    }
  } catch (err) {
    console.error(err)
  }
  setAnalyzing(false)
}

  const renderAnnotatedText = () => {
    if (!correction) return null
    const texte = correction.texte_annote || soumission?.texte_soumis || ''
    const parts = texte.split(/(\[ERR\].*?\[\/ERR\])/g)
    return parts.map((part, i) => {
      const errMatch = part.match(/\[ERR\](.*?)\[\/ERR\]/)
      if (errMatch) {
        const errIndex = correction.erreurs.findIndex(e => 
          e.original === errMatch[1] || part.includes(e.original)
        )
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

  return (
    <AppLayout>
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
              Note globale
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '42px', fontWeight: 600, color: getScoreColor(correction.note_globale / 15 * 3) }}>
                {correction.note_globale}
              </span>
              <span style={{ fontSize: '18px', color: 'var(--color-muted)' }}>/ 15</span>
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
          </div>
        )}
      </header>

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
            border: '3px solid var(--color-muted)',
            borderTop: '3px solid var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--color-text)', marginBottom: '8px' }}>
              Correction en cours...
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
              L’examinateur TEF IRN analyse votre texte
            </p>
          </div>
        </div>
      )}

      {!analyzing && soumission && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Texte annoté */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '40px',
            borderRight: '1px solid var(--color-muted)',
          }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '4px' }}>
                Votre soumission — {soumission.section || 'Section inconnue'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                Soumis le {new Date(soumission.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} • {soumission.mot_count || 0} mots
              </div>
            </div>

            <div style={{ 
              fontFamily: 'var(--font-heading)', 
              fontSize: '18px', 
              lineHeight: 1.85, 
              color: 'var(--color-text)', 
              whiteSpace: 'pre-wrap' 
            }}>
              {correction ? renderAnnotatedText() : soumission.texte_soumis}
            </div>

            {correction && correction.resume_feedback && (
              <div style={{
                marginTop: '48px',
                padding: '24px',
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-muted)',
                borderRadius: '2px',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '12px' }}>
                  Synthèse de l’examinateur
                </div>
                <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--color-text)' }}>
                  {correction.resume_feedback}
                </p>
              </div>
            )}
          </div>

          {/* Panneau latéral analyse */}
          <div style={{
            width: '420px',
            flexShrink: 0,
            overflowY: 'auto',
            backgroundColor: 'var(--color-surface)',
            padding: '32px 24px',
          }}>
            {correction && (
              <>
                {/* Scores détaillés */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '16px' }}>
                    Scores détaillés
                  </div>
                  {Object.entries(correction.scores_detail || {}).map(([key, value]) => (
                    <div key={key} style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                        <span>{criteriaNames[key] || key}</span>
                        <span style={{ fontWeight: 600, color: getScoreColor(value) }}>{value} / 3</span>
                      </div>
                      <div style={{
                        height: '6px',
                        backgroundColor: 'var(--color-muted)',
                        borderRadius: '9999px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(value / 3) * 100}%`,
                          height: '100%',
                          backgroundColor: getScoreColor(value),
                          transition: 'width 0.6s ease'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Points forts */}
                {correction.points_forts && correction.points_forts.length > 0 && (
                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '12px' }}>
                      Points forts
                    </div>
                    <ul style={{ paddingLeft: '20px', color: '#059669' }}>
                      {correction.points_forts.map((point, i) => (
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
                    <div style={{
                      backgroundColor: '#FEE2E2',
                      color: 'var(--color-accent)',
                      padding: '3px 10px',
                      borderRadius: '2px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      {correction.erreurs.length}
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
                          backgroundColor: selectedError === i ? '#FFF5F5' : 'transparent',
                        }}
                      >
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            backgroundColor: '#FEE2E2',
                            color: 'var(--color-accent)',
                            padding: '2px 8px',
                            borderRadius: '2px'
                          }}>
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
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#0369A1', marginBottom: '8px' }}>
                      RECOMMANDATION
                    </div>
                    <p style={{ fontSize: '14px', color: '#0C4A6E' }}>
                      {correction.recommandation_prochaine}
                    </p>
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
