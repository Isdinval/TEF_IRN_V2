'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import { useAuth } from '@/lib/auth-context'
import { supabase, Exercice } from '@/lib/supabase'
import { Icons } from '@/components/layout/ui/icons'

type FeedbackState = {
  correct: boolean
  message: string
  explication: string
} | null

export default function ExercicesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [exercices, setExercices] = useState<Exercice[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [finished, setFinished] = useState(false)
  const [startTime, setStartTime] = useState<number>(Date.now())

  useEffect(() => {
    if (!user) return
    loadExercices()
  }, [user])

  const loadExercices = async () => {
    const { data } = await supabase
      .from('exercices')
      .select('*')
      .order('ordre', { ascending: true })
    setExercices(data || [])
    setLoading(false)
  }

  const current = exercices[currentIndex]
  const progress = exercices.length > 0 ? ((currentIndex) / exercices.length) * 100 : 0

  const handleWordClick = async (wordIndex: number) => {
    if (feedback || !current) return
    const tempsMs = Date.now() - startTime
    const isCorrect = wordIndex === current.mot_erreur_index

    if (isCorrect) {
      setFeedback({
        correct: true,
        message: 'Correct !',
        explication: current.explication,
      })
      setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }))
    } else {
      setFeedback({
        correct: false,
        message: `Incorrect. L'erreur se trouve dans « ${current.mots[current.mot_erreur_index!]} »`,
        explication: current.explication,
      })
      setScore(s => ({ ...s, total: s.total + 1 }))
    }

    await supabase.from('user_exercice_results').insert({
      user_id: user!.id,
      exercice_id: current.id,
      reponse_correcte: isCorrect,
      temps_reponse_ms: tempsMs,
    })

    await fetch('/api/competences/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'voltaire',
        user_id: user!.id,
        category: (current.categorie || 'grammaire').toLowerCase(),
        correct: isCorrect,
      }),
    })
  }

  const handleNoError = async () => {
    if (feedback || !current) return
    const tempsMs = Date.now() - startTime
    const isCorrect = current.mot_erreur_index === null

    setFeedback({
      correct: isCorrect,
      message: isCorrect ? 'Correct ! Il n\'y a effectivement pas de faute.' : `Incorrect. L'erreur se trouve dans « ${current.mots[current.mot_erreur_index!]} »`,
      explication: current.explication,
    })

    setScore(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }))

    await supabase.from('user_exercice_results').insert({
      user_id: user!.id,
      exercice_id: current.id,
      reponse_correcte: isCorrect,
      temps_reponse_ms: tempsMs,
    })

    await fetch('/api/competences/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'voltaire',
        user_id: user!.id,
        category: (current.categorie || 'grammaire').toLowerCase(),
        correct: isCorrect,
      }),
    })
  }

  const nextExercice = useCallback(() => {
    if (currentIndex >= exercices.length - 1) {
      setFinished(true)
    } else {
      setCurrentIndex(i => i + 1)
      setFeedback(null)
      setStartTime(Date.now())
    }
  }, [currentIndex, exercices.length])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && feedback) nextExercice()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [feedback, nextExercice])

  // Résultats finaux
  if (finished) {
    const pct = Math.round((score.correct / score.total) * 100)
    return (
      <AppLayout>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', backgroundColor: 'var(--color-background)' }}>
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-muted)', borderRadius: '2px', padding: '64px', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '72px', fontWeight: 600, color: pct >= 70 ? 'var(--color-primary)' : 'var(--color-accent)', lineHeight: 1, marginBottom: '16px' }}>
              {pct}%
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', color: 'var(--color-text)', marginBottom: '8px' }}>
              {pct >= 80 ? 'Excellent !' : pct >= 60 ? 'Bon travail !' : 'À revoir'}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginBottom: '32px' }}>
              {score.correct} bonne{score.correct > 1 ? 's' : ''} réponse{score.correct > 1 ? 's' : ''} sur {score.total}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setCurrentIndex(0)
                  setFeedback(null)
                  setScore({ correct: 0, total: 0 })
                  setFinished(false)
                  setStartTime(Date.now())
                }}
                style={{ 
                  backgroundColor: 'var(--color-primary)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '2px', 
                  padding: '12px 24px', 
                  fontSize: '11px', 
                  fontWeight: 600, 
                  letterSpacing: '0.15em', 
                  textTransform: 'uppercase', 
                  cursor: 'pointer', 
                  fontFamily: 'var(--font-body)' 
                }}
              >
                Recommencer
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                style={{ 
                  backgroundColor: 'transparent', 
                  color: 'var(--color-text)', 
                  border: '1px solid var(--color-muted)', 
                  borderRadius: '2px', 
                  padding: '12px 24px', 
                  fontSize: '11px', 
                  fontWeight: 600, 
                  letterSpacing: '0.15em', 
                  textTransform: 'uppercase', 
                  cursor: 'pointer', 
                  fontFamily: 'var(--font-body)' 
                }}
              >
                Tableau de bord
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        height: '64px',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-muted)',
        flexShrink: 0,
      }}>
        <button
          onClick={() => router.push('/dashboard')}
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
          Quitter l'exercice
        </button>
        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
          Module 04 — Syntaxe
        </div>
      </header>

      {/* Progress bar */}
      <div style={{ width: '100%', height: '2px', backgroundColor: 'rgba(142,150,164,0.2)', flexShrink: 0 }}>
        <div style={{ height: '100%', backgroundColor: 'var(--color-primary)', width: `${progress}%`, transition: 'width 0.3s ease' }} />
      </div>

      {/* Score */}
      <div style={{ 
        padding: '12px 40px', 
        borderBottom: '1px solid var(--color-muted)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        backgroundColor: 'var(--color-background)', 
        flexShrink: 0 
      }}>
        <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
          Question {currentIndex + 1} / {exercices.length}
        </span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>
          {score.correct} / {score.total} correctes
        </span>
      </div>

      {/* Exercise area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', overflowY: 'auto' }}>
        {loading ? (
          <div className="skeleton" style={{ width: '600px', height: '200px', borderRadius: '2px' }} />
        ) : !current ? (
          <p style={{ color: 'var(--color-muted)' }}>Aucun exercice disponible.</p>
        ) : (
          <div style={{
            width: '100%',
            maxWidth: '800px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-muted)',
            borderRadius: '2px',
            padding: '64px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            {/* Instruction */}
            <h2 style={{ 
              fontSize: '11px', 
              fontWeight: 600, 
              letterSpacing: '0.15em', 
              textTransform: 'uppercase', 
              color: 'var(--color-muted)', 
              marginBottom: '64px', 
              textAlign: 'center' 
            }}>
              Cliquez sur le mot contenant une erreur
            </h2>

            {/* Sentence */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '8px 16px',
              marginBottom: '80px',
            }}>
              {current.mots.map((mot, i) => {
                const isError = feedback && i === current.mot_erreur_index
                return (
                  <span
                    key={i}
                    onClick={() => handleWordClick(i)}
                    className="word-item"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '32px',
                      cursor: feedback ? 'default' : 'pointer',
                      padding: '4px 8px',
                      borderRadius: '2px',
                      transition: 'all 0.15s',
                      color: isError ? 'var(--color-accent)' : 'var(--color-text)',
                      textDecoration: isError ? 'underline' : 'none',
                      textDecorationColor: 'rgba(217,42,42,0.4)',
                    }}
                  >
                    {mot}
                  </span>
                )
              })}
            </div>

            {/* No error button */}
            {!feedback && (
              <button
                onClick={handleNoError}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-muted)',
                  borderRadius: '2px',
                  color: 'var(--color-text)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  padding: '14px 40px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.15s',
                }}
              >
                Il n'y a pas de faute
              </button>
            )}

            {/* Feedback */}
            {feedback && (
              <div style={{
                width: '100%',
                marginTop: '32px',
                padding: '20px 24px',
                backgroundColor: feedback.correct ? '#D1FAE5' : '#FEE2E2',
                border: `1px solid ${feedback.correct ? '#A7F3D0' : 'rgba(217,42,42,0.3)'}`,
                borderRadius: '2px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                  {feedback.correct ? (
                    <Icons.checkCircle size={22} strokeWidth={2.5} style={{ color: '#059669', flexShrink: 0 }} />
                  ) : (
                    <Icons.cancel size={22} strokeWidth={2.5} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                  )}
                  <div>
                    <p style={{ 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: feedback.correct ? '#065F46' : 'var(--color-accent)', 
                      marginBottom: '6px' 
                    }}>
                      {feedback.message}
                    </p>
                    <p style={{ fontSize: '14px', color: 'var(--color-text)', lineHeight: 1.6 }}>
                      {feedback.explication}
                    </p>
                  </div>
                </div>

                <button
                  onClick={nextExercice}
                  style={{
                    marginTop: '16px',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '2px',
                    padding: '10px 24px',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {currentIndex >= exercices.length - 1 ? 'Voir les résultats' : 'Question suivante →'}
                </button>
                <span style={{ fontSize: '11px', color: 'var(--color-muted)', marginLeft: '12px' }}>ou appuyez sur Entrée</span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Styles */}
      <style jsx>{`
        .word-item:hover {
          background-color: var(--color-hover-blue);
          color: var(--color-primary);
          border-color: rgba(142,150,164,0.3);
        }
      `}</style>
    </AppLayout>
  )
}
