// app/ecriture/EcritureClient.tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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

  const [prompts, setPrompts] = useState<EcriturePrompt[]>([])
  const [currentPrompt, setCurrentPrompt] = useState<EcriturePrompt | null>(null)
  const [texte, setTexte] = useState('')
  const [soumissionId, setSoumissionId] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<'A' | 'B' | 'ALL'>('ALL')

  const motCount = countWords(texte)

  // Charger les prompts + historique de l'utilisateur
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)

      // 1. Charger tous les prompts
      const { data: promptsData, error: promptsError } = await supabase
        .from('ecriture_prompts')
        .select('*')
        .order('ordre', { ascending: true })

      if (promptsError || !promptsData) {
        setError("Erreur lors du chargement des sujets")
        setLoading(false)
        return
      }

      setPrompts(promptsData)

      // 2. Charger l'historique de l'utilisateur pour recommandation intelligente
      const { data: history } = await supabase
        .from('soumissions')
        .select('titre, prompt_texte')
        .eq('user_id', user?.id)
        .eq('statut', 'soumis')

      // Recommandation intelligente
      let recommended = promptsData[0]

      if (history && history.length > 0) {
        const sectionACount = history.filter((h: { titre: string }) => h.titre.includes('SECTION A') || h.titre.includes('Sujet A')).length
        const sectionBCount = history.length - sectionACount

        // Priorité à la section la moins travaillée
        if (selectedSection === 'ALL') {
          if (sectionBCount < sectionACount) {
            const sectionBPrompts = promptsData.filter((p: EcriturePrompt) => p.section.includes('B'))
            if (sectionBPrompts.length > 0) recommended = sectionBPrompts[Math.floor(Math.random() * sectionBPrompts.length)]
          } else {
            const sectionAPrompts = promptsData.filter((p: EcriturePrompt) => p.section.includes('A'))
            if (sectionAPrompts.length > 0) recommended = sectionAPrompts[Math.floor(Math.random() * sectionAPrompts.length)]
          }
        }
      } else {
        // Premier essai → sujet aléatoire
        recommended = promptsData[Math.floor(Math.random() * promptsData.length)]
      }

      setCurrentPrompt(recommended)
      setLoading(false)
    }

    if (user) loadData()
  }, [user, selectedSection])

  // Sauvegarde brouillon
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
      const { data: newSoum } = await supabase.from('soumissions').insert(data).select().single()
      if (newSoum) setSoumissionId(newSoum.id)
    }

    setLastSaved(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
  }, [texte, user, soumissionId, motCount, currentPrompt])

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

  const changePrompt = () => {
    let filteredPrompts = prompts

    if (selectedSection !== 'ALL') {
      filteredPrompts = prompts.filter(p => p.section.includes(selectedSection))
    }

    if (filteredPrompts.length === 0) return

    const currentIndex = filteredPrompts.findIndex(p => p.id === currentPrompt?.id)
    let newIndex = currentIndex

    while (newIndex === currentIndex) {
      newIndex = Math.floor(Math.random() * filteredPrompts.length)
    }

    setCurrentPrompt(filteredPrompts[newIndex])
    setTexte('')
    setSoumissionId(null)
  }

  const filterSection = (section: 'A' | 'B' | 'ALL') => {
    setSelectedSection(section)
  }

  if (loading) return <AppLayout><div style={{ padding: '80px', textAlign: 'center' }}>Préparation du meilleur exercice pour vous...</div></AppLayout>
  if (error) return <AppLayout><div style={{ padding: '80px', textAlign: 'center', color: 'red' }}>{error}</div></AppLayout>
  if (!currentPrompt) return <AppLayout><div>Aucun sujet disponible.</div></AppLayout>

  const motColor = motCount > currentPrompt.mots_max ? 'var(--color-accent)' : 'var(--color-text)'

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* Header */}
        <header style={{ 
          padding: '12px 32px', 
          borderBottom: '1px solid var(--color-muted)', 
          backgroundColor: 'var(--color-surface)', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button onClick={() => router.push('/bibliotheque')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            ← Retour
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => filterSection('ALL')} className={selectedSection === 'ALL' ? 'active' : ''} style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid var(--color-muted)', background: selectedSection === 'ALL' ? 'var(--color-primary)' : 'transparent', color: selectedSection === 'ALL' ? 'white' : 'inherit' }}>
              Tous
            </button>
            <button onClick={() => filterSection('A')} style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid var(--color-muted)', background: selectedSection === 'A' ? 'var(--color-primary)' : 'transparent', color: selectedSection === 'A' ? 'white' : 'inherit' }}>
              Section A
            </button>
            <button onClick={() => filterSection('B')} style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid var(--color-muted)', background: selectedSection === 'B' ? 'var(--color-primary)' : 'transparent', color: selectedSection === 'B' ? 'white' : 'inherit' }}>
              Section B
            </button>

            <button 
              onClick={changePrompt}
              style={{ padding: '6px 16px', marginLeft: '12px', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-muted)', borderRadius: '4px' }}
            >
              🔄 Autre sujet
            </button>
          </div>
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
                  {submitting ? 'Envoi...' : 'Soumettre pour correction'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  )
}
