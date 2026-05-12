'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Icons } from '@/components/layout/ui/icons'

const PROMPT = {
  titre: 'Section A: Faits Divers',
  section: 'SECTION A',
  consigne: "Vous avez été témoin d'un incident dans une gare. Rédigez une lettre formelle au directeur de la gare pour décrire la situation et demander des améliorations. (200 mots environ)",
  source: "Rédigez une lettre formelle en respectant les conventions épistolaires : formule d'appel, développement structuré, formule de politesse. Utilisez le passé composé et l'imparfait pour le récit.",
  consignes: [
    "Temps recommandés : Passé composé, imparfait.",
    "Respectez la structure de la lettre formelle.",
    "Inclinez le récit vers une résolution proposée."
  ],
  motsMax: 220,
}

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

export default function EcriturePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [texte, setTexte] = useState('')
  const [soumissionId, setSoumissionId] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const motCount = countWords(texte)

  const saveDraft = useCallback(async () => {
    if (!user || texte.length < 10) return

    const data = { 
      user_id: user.id, 
      titre: PROMPT.titre, 
      prompt_texte: PROMPT.consigne, 
      texte_soumis: texte, 
      mot_count: motCount, 
      statut: 'brouillon' as const, 
      updated_at: new Date().toISOString() 
    }

    if (soumissionId) {
      await supabase.from('soumissions').update(data).eq('id', soumissionId)
    } else {
      const { data: newSoum } = await supabase.from('soumissions').insert(data).select().single()
      if (newSoum) setSoumissionId(newSoum.id)
    }

    setLastSaved(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
  }, [texte, user, soumissionId, motCount])

  useEffect(() => {
    if (!user || texte.length < 10) return
    const interval = setInterval(() => saveDraft(), 30000)
    return () => clearInterval(interval)
  }, [texte, user, saveDraft])

  const handleSubmit = async () => {
    if (!user || motCount < 10) return
    setSubmitting(true)

    let id = soumissionId
    const data = { 
      texte_soumis: texte, 
      mot_count: motCount, 
      statut: 'soumis' as const, 
      updated_at: new Date().toISOString() 
    }

    if (!id) {
      const { data: d } = await supabase.from('soumissions')
        .insert({ user_id: user.id, titre: PROMPT.titre, prompt_texte: PROMPT.consigne, ...data })
        .select()
        .single()
      id = d?.id
    } else {
      await supabase.from('soumissions').update(data).eq('id', id)
    }

    if (id) router.push(`/corrections/${id}`)
    setSubmitting(false)
  }

  const motColor = motCount > PROMPT.motsMax ? 'var(--color-accent)' : 'var(--color-text)'

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '12px 32px', 
          borderBottom: '1px solid var(--color-muted)', 
          backgroundColor: 'var(--color-surface)', 
          flexShrink: 0 
        }}>
          <button 
            onClick={() => router.push('/bibliotheque')} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              color: 'var(--color-text)', 
              fontSize: '11px', 
              fontWeight: 600, 
              letterSpacing: '0.1em', 
              textTransform: 'uppercase' 
            }}
          >
            <Icons.arrowBack size={20} strokeWidth={2.5} />
            Retour à la Bibliothèque
          </button>
        </header>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Panneau de consigne */}
          <aside style={{ 
            width: '35%', 
            backgroundColor: 'var(--color-background)', 
            borderRight: '1px solid var(--color-muted)', 
            overflowY: 'auto', 
            padding: '40px', 
            display: 'flex', 
            flexDirection: 'column', 
            flexShrink: 0 
          }}>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: 600, 
              letterSpacing: '0.15em', 
              textTransform: 'uppercase', 
              color: 'var(--color-muted)', 
              marginBottom: '16px' 
            }}>
              {PROMPT.section}
            </div>

            <h2 style={{ 
              fontFamily: 'var(--font-heading)', 
              fontSize: '32px', 
              fontWeight: 500, 
              color: 'var(--color-text)', 
              marginBottom: '24px' 
            }}>
              {PROMPT.titre}
            </h2>

            <p style={{ 
              fontSize: '14px', 
              color: 'var(--color-text)', 
              lineHeight: 1.7, 
              marginBottom: '24px' 
            }}>
              {PROMPT.consigne}
            </p>

            <div style={{ 
              backgroundColor: 'var(--color-surface)', 
              border: '1px solid var(--color-muted)', 
              padding: '20px', 
              position: 'relative', 
              borderRadius: '2px', 
              marginBottom: '32px' 
            }}>
              <Icons.info 
                size={20} 
                strokeWidth={2} 
                style={{ 
                  position: 'absolute', 
                  top: '-12px', 
                  left: '-12px', 
                  backgroundColor: 'var(--color-background)', 
                  color: 'var(--color-muted)', 
                  padding: '4px' 
                }} 
              />
              <p style={{ 
                fontFamily: 'var(--font-heading)', 
                fontSize: '16px', 
                fontStyle: 'italic', 
                color: 'var(--color-text)', 
                lineHeight: 1.6 
              }}>
                {PROMPT.source}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--color-muted)', paddingTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Icons.info size={20} strokeWidth={2.5} style={{ color: 'var(--color-primary)', marginTop: '2px' }} />
                <div>
                  <p style={{ 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: 'var(--color-text)', 
                    marginBottom: '8px' 
                  }}>
                    Consignes de l'examinateur:
                  </p>
                  <ul style={{ listStyle: 'disc', paddingLeft: '16px' }}>
                    {PROMPT.consignes.map((c, i) => (
                      <li key={i} style={{ 
                        fontSize: '14px', 
                        color: 'var(--color-muted)', 
                        lineHeight: 1.6, 
                        marginBottom: '4px' 
                      }}>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </aside>

          {/* Zone d'écriture */}
          <section style={{ 
            flex: 1, 
            backgroundColor: 'var(--color-surface)', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden' 
          }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '48px' }}>
              <textarea 
                autoFocus 
                value={texte} 
                onChange={e => setTexte(e.target.value)} 
                placeholder="Commencez votre rédaction ici..." 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  minHeight: '400px', 
                  resize: 'none', 
                  border: 'none', 
                  outline: 'none', 
                  boxShadow: 'none', 
                  fontSize: '18px', 
                  lineHeight: 1.8, 
                  color: 'var(--color-text)', 
                  fontFamily: 'var(--font-body)', 
                  backgroundColor: 'transparent' 
                }} 
              />
            </div>

            {/* Barre du bas */}
            <div style={{ 
              borderTop: '1px solid var(--color-muted)', 
              backgroundColor: 'var(--color-background)', 
              padding: '16px 32px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              flexShrink: 0 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-muted)' }}>
                <Icons.save size={18} strokeWidth={2} />
                {lastSaved ? `Brouillon enregistré à ${lastSaved}` : 'Non enregistré'}
                <button 
                  onClick={saveDraft} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    color: 'var(--color-primary)', 
                    fontSize: '11px', 
                    fontWeight: 600, 
                    letterSpacing: '0.1em', 
                    textTransform: 'uppercase', 
                    marginLeft: '8px' 
                  }}
                >
                  Sauvegarder
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icons.textSnipper size={20} strokeWidth={2} style={{ color: 'var(--color-muted)' }} />
                  <span style={{ fontSize: '14px', fontWeight: 500, color: motColor }}>
                    {motCount} / {PROMPT.motsMax} mots
                  </span>
                </div>

                <button 
                  onClick={handleSubmit} 
                  disabled={submitting || motCount < 10} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    backgroundColor: submitting || motCount < 10 ? 'var(--color-muted)' : 'var(--color-primary)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '2px', 
                    padding: '12px 24px', 
                    fontSize: '11px', 
                    fontWeight: 600, 
                    letterSpacing: '0.15em', 
                    textTransform: 'uppercase', 
                    cursor: submitting || motCount < 10 ? 'not-allowed' : 'pointer', 
                    fontFamily: 'var(--font-body)' 
                  }}
                >
                  {submitting ? 'Analyse...' : 'Soumettre'} 
                  <Icons.submit size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  )
}
