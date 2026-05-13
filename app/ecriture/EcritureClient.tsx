// app/ecriture/EcritureClient.tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

type EcriturePrompt = {
  id: string
  titre: string
  section: string
  consigne: string
  consignes: string[]
  mots_min: number
  mots_max: number
  type: string
  ordre: number
}

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

export default function EcritureClient() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [prompts, setPrompts] = useState<EcriturePrompt[]>([])
  const [currentPrompt, setCurrentPrompt] = useState<EcriturePrompt | null>(null)
  const [texte, setTexte] = useState('')
  const [soumissionId, setSoumissionId] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const motCount = countWords(texte)

  // Charger les prompts
  useEffect(() => {
    const loadPrompts = async () => {
      setLoading(true)
      setError(null)

      console.log("🔄 Chargement des prompts d'écriture...")

      const { data, error: supabaseError } = await supabase
        .from('ecriture_prompts')
        .select('*')
        .order('ordre', { ascending: true })

      if (supabaseError) {
        console.error("❌ Erreur Supabase:", supabaseError)
        setError(supabaseError.message)
      } else if (data) {
        console.log(`✅ ${data.length} prompts chargés`, data)
        setPrompts(data)

        if (data.length > 0) {
          const promptId = searchParams.get('id')
          let selected = data[0]

          if (promptId) {
            const found = data.find(p => p.id === promptId)
            if (found) selected = found
          }
          setCurrentPrompt(selected)
        } else {
          setError("Aucun sujet trouvé dans la table ecriture_prompts")
        }
      }
      setLoading(false)
    }

    loadPrompts()
  }, [searchParams])

  // Sauvegarde automatique du brouillon
  const saveDraft = useCallback(async () => {
    if (!user || !currentPrompt || texte.length < 10) return

    const data = { 
      user_id: user.id, 
      titre: currentPrompt.titre, 
      prompt_texte: currentPrompt.consigne, 
      texte_soumis: texte, 
      mot_count: motCount, 
      statut: 'brouillon' as const,
    }

    if (soumissionId) {
      await supabase.from('soumissions').update(data).eq('id', soumissionId)
    } else {
      const { data: newSoum } = await supabase
        .from('soumissions')
        .insert(data)
        .select()
        .single()
      
      if (newSoum) setSoumissionId(newSoum.id)
    }

    setLastSaved(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
  }, [texte, user, soumissionId, motCount, currentPrompt])

  // Auto-save toutes les 30 secondes
  useEffect(() => {
    if (!user || !currentPrompt) return
    const interval = setInterval(saveDraft, 30000)
    return () => clearInterval(interval)
  }, [saveDraft, user, currentPrompt])

  const handleSubmit = async () => {
    if (!user || !currentPrompt || motCount < 10) return
    setSubmitting(true)

    let id = soumissionId
    const payload = { 
      texte_soumis: texte, 
      mot_count: motCount, 
      statut: 'soumis' as const,
    }

    if (!id) {
      const { data } = await supabase.from('soumissions')
        .insert({ 
          user_id: user.id, 
          titre: currentPrompt.titre, 
          prompt_texte: currentPrompt.consigne, 
          ...payload 
        })
        .select()
        .single()
      id = data?.id
    } else {
      await supabase.from('soumissions').update(payload).eq('id', id)
    }

    if (id) router.push(`/corrections/${id}`)
    setSubmitting(false)
  }

  const changePrompt = (newPrompt: EcriturePrompt) => {
    if (newPrompt.id === currentPrompt?.id) return
    setCurrentPrompt(newPrompt)
    setTexte('')
    setSoumissionId(null)
  }

  // ==================== RENDU ====================
  if (loading) {
    return (
      <AppLayout>
        <div style={{ padding: '80px 40px', textAlign: 'center' }}>
          Chargement des sujets d'écriture...
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div style={{ padding: '80px 40px', textAlign: 'center', color: '#e11d48' }}>
          <h2>Erreur de chargement</h2>
          <p>{error}</p>
          <p style={{ marginTop: '20px', fontSize: '14px' }}>
            Vérifie que ta table <strong>ecriture_prompts</strong> contient bien 10 sujets.
          </p>
        </div>
      </AppLayout>
    )
  }

  if (!currentPrompt) {
    return (
      <AppLayout>
        <div style={{ padding: '80px 40px', textAlign: 'center' }}>
          Aucun sujet disponible.
        </div>
      </AppLayout>
    )
  }

  const motColor = motCount > currentPrompt.mots_max ? 'var(--color-accent)' : 'var(--color-text)'

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* Header */}
        <header style={{ 
          padding: '12px 32px', 
          borderBottom: '1px solid var(--color-muted)', 
          backgroundColor: 'var(--color-surface)', 
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <button onClick={() => router.push('/bibliotheque')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            ← Retour
          </button>

          <select 
            value={currentPrompt.id}
            onChange={(e) => {
              const selected = prompts.find(p => p.id === e.target.value)
              if (selected) changePrompt(selected)
            }}
            style={{ 
              padding: '8px 12px', 
              background: 'var(--color-background)', 
              border: '1px solid var(--color-muted)',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            {prompts.map(p => (
              <option key={p.id} value={p.id}>
                {p.section} — {p.titre}
              </option>
            ))}
          </select>
        </header>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* Panneau Consigne */}
          <aside style={{ 
            width: '38%', 
            backgroundColor: 'var(--color-background)', 
            borderRight: '1px solid var(--color-muted)', 
            overflowY: 'auto', 
            padding: '40px' 
          }}>
            <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '12px' }}>
              {currentPrompt.section}
            </div>

            <h2 style={{ fontSize: '28px', fontWeight: 500, marginBottom: '24px' }}>
              {currentPrompt.titre}
            </h2>

            <p style={{ fontSize: '15px', lineHeight: 1.7, marginBottom: '32px' }}>
              {currentPrompt.consigne}
            </p>

            <div>
              <p style={{ fontWeight: 600, marginBottom: '12px' }}>Consignes de l’examinateur :</p>
              <ul style={{ paddingLeft: '20px', lineHeight: 1.6 }}>
                {currentPrompt.consignes.map((c, i) => (
                  <li key={i} style={{ marginBottom: '8px' }}>{c}</li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Zone d'écriture */}
          <section style={{ flex: 1, backgroundColor: 'var(--color-surface)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, padding: '48px', overflowY: 'auto' }}>
              <textarea
                autoFocus
                value={texte}
                onChange={e => setTexte(e.target.value)}
                placeholder="Rédigez votre texte ici..."
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '500px',
                  resize: 'none',
                  border: 'none',
                  outline: 'none',
                  fontSize: '17.5px',
                  lineHeight: 1.75,
                  background: 'transparent',
                  fontFamily: 'var(--font-body)'
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
              justifyContent: 'space-between' 
            }}>
              <div style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                Auto-sauvegarde toutes les 30s {lastSaved && `— ${lastSaved}`}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <span style={{ fontWeight: 500, color: motColor }}>
                  {motCount} / {currentPrompt.mots_max} mots
                </span>

                <button 
                  onClick={handleSubmit}
                  disabled={submitting || motCount < 10}
                  style={{
                    padding: '12px 28px',
                    backgroundColor: submitting || motCount < 10 ? 'var(--color-muted)' : 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    cursor: submitting || motCount < 10 ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Envoi en cours...' : 'Soumettre pour correction'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  )
}
