'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import { supabase, Module } from '@/lib/supabase'

// ─── Icons inline (pas de dépendance externe) ─────────────────────────────────
const ArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
)
const Clock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
  </svg>
)
const BookOpen = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)
const Lightbulb = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6M10 22h4" />
  </svg>
)
const AlertTriangle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)
const Trophy = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
  </svg>
)
const CheckCircle = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)
const Sparkles = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4M19 17v4M3 5h4M17 19h4" />
  </svg>
)

// ─── Helpers visuels ──────────────────────────────────────────────────────────
const sectionAccents = [
  { bar: '#6366f1', bg: '#eef2ff', badge: '#818cf8' }, // indigo
  { bar: '#0ea5e9', bg: '#e0f2fe', badge: '#38bdf8' }, // sky
  { bar: '#10b981', bg: '#ecfdf5', badge: '#34d399' }, // emerald
  { bar: '#f59e0b', bg: '#fffbeb', badge: '#fbbf24' }, // amber
  { bar: '#8b5cf6', bg: '#f5f3ff', badge: '#a78bfa' }, // violet
]

function parseMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
}

// ─── Sous-composants ──────────────────────────────────────────────────────────
function ProgressBar({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ flex: 1, height: '4px', background: '#e5e7eb', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{ width: `${(current / total) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '99px', transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: '12px', color: '#9ca3af', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {current}/{total} sections
      </span>
    </div>
  )
}

function ExampleCard({ text, index }: { text: string; index: number }) {
  const colors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6']
  const color = colors[index % colors.length]
  return (
    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px 16px', background: '#fafafa', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color, fontFamily: 'monospace' }}>{index + 1}</span>
      </div>
      <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.6, color: '#374151', fontStyle: 'italic' }}
        dangerouslySetInnerHTML={{ __html: parseMarkdown(text) }} />
    </div>
  )
}

function SectionCard({ section, index, total }: { section: any; index: number; total: number }) {
  const accent = sectionAccents[index % sectionAccents.length]

  return (
    <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)' }}>
      {/* Accent bar + header */}
      <div style={{ borderLeft: `4px solid ${accent.bar}`, padding: '24px 28px 20px', borderBottom: section.contenu || section.formation ? '1px solid #f3f4f6' : undefined }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: accent.bar, background: accent.bg, padding: '3px 10px', borderRadius: '99px' }}>
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </div>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
          {section.titre}
        </h2>
      </div>

      <div style={{ padding: '24px 28px' }}>
        {/* Contenu principal */}
        {section.contenu && (
          <p style={{ margin: '0 0 20px', fontSize: '15.5px', lineHeight: 1.75, color: '#4b5563', whiteSpace: 'pre-line' }}
            dangerouslySetInnerHTML={{ __html: parseMarkdown(section.contenu) }} />
        )}

        {/* Formation + accord */}
        {(section.formation || section.regle_accord) && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', padding: '18px 20px', marginBottom: '20px' }}>
            {section.formation && (
              <div style={{ marginBottom: section.regle_accord ? '14px' : 0 }}>
                <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#92400e' }}>Formation</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#78350f', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>{section.formation}</p>
              </div>
            )}
            {section.regle_accord && (
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#92400e' }}>Règle d'accord</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#78350f' }}>{section.regle_accord}</p>
              </div>
            )}
          </div>
        )}

        {/* Exemples */}
        {section.exemples?.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9ca3af' }}>Exemples</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {section.exemples.map((ex: string, i: number) => (
                <ExampleCard key={i} text={ex} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Astuce */}
        {section.astuce && (
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '14px', padding: '16px 20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }}><Lightbulb /></div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#065f46' }}>Astuce</p>
              <p style={{ margin: 0, fontSize: '14.5px', color: '#064e3b', lineHeight: 1.65 }}>{section.astuce}</p>
            </div>
          </div>
        )}

        {/* Différence */}
        {section.difference && (
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '14px 18px', marginTop: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ width: '3px', height: '100%', minHeight: '36px', background: '#3b82f6', borderRadius: '99px', flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '14.5px', color: '#1e40af', fontWeight: 500 }}>{section.difference}</p>
          </div>
        )}

        {/* Tableau */}
        {section.tableau && (
          <div style={{ marginTop: '8px', overflowX: 'auto', borderRadius: '14px', border: '1px solid #e5e7eb' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14.5px' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {section.tableau[0].map((h: string, i: number) => (
                    <th key={i} style={{ padding: '12px 18px', textAlign: 'left', fontWeight: 700, color: '#374151', fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.tableau.slice(1).map((row: string[], ri: number) => (
                  <tr key={ri} style={{ background: ri % 2 === 0 ? '#fff' : '#fafafa' }}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{ padding: '13px 18px', color: ci === 0 ? '#111827' : '#4b5563', fontWeight: ci === 0 ? 600 : 400, borderTop: '1px solid #f3f4f6' }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function ExerciseCard({ exercise, index }: { exercise: any; index: number }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)

  const typeLabels: Record<string, { label: string; color: string; bg: string }> = {
    choix_multiple: { label: 'QCM', color: '#6366f1', bg: '#eef2ff' },
    transformation: { label: 'Transformation', color: '#0ea5e9', bg: '#e0f2fe' },
    redaction: { label: 'Rédaction', color: '#10b981', bg: '#ecfdf5' },
  }
  const meta = typeLabels[exercise.type] || { label: exercise.type, color: '#6b7280', bg: '#f3f4f6' }

  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{index + 1}</span>
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: meta.color, background: meta.bg, padding: '2px 8px', borderRadius: '99px', marginBottom: '8px', display: 'inline-block' }}>{meta.label}</span>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#111827', lineHeight: 1.5 }}>{exercise.question}</p>
        </div>
      </div>

      <div style={{ padding: '16px 24px 20px' }}>
        {/* QCM */}
        {exercise.options && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: revealed ? '16px' : 0 }}>
            {exercise.options.map((opt: string) => {
              const isSelected = selected === opt
              const isCorrect = opt === exercise.reponse
              const showResult = revealed
              let bg = '#f9fafb', border = '#e5e7eb', color = '#374151'
              if (isSelected && !showResult) { bg = '#eef2ff'; border = '#6366f1'; color = '#4338ca' }
              if (showResult && isCorrect) { bg = '#ecfdf5'; border = '#10b981'; color = '#065f46' }
              if (showResult && isSelected && !isCorrect) { bg = '#fef2f2'; border = '#ef4444'; color = '#991b1b' }
              return (
                <button key={opt} onClick={() => { if (!revealed) setSelected(opt) }}
                  style={{ padding: '11px 16px', borderRadius: '10px', border: `1.5px solid ${border}`, background: bg, color, fontWeight: 500, fontSize: '14.5px', textAlign: 'left', cursor: revealed ? 'default' : 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s' }}>
                  <span>{opt}</span>
                  {showResult && isCorrect && <CheckCircle />}
                </button>
              )
            })}
            {selected && !revealed && (
              <button onClick={() => setRevealed(true)}
                style={{ marginTop: '4px', padding: '10px', borderRadius: '10px', background: '#111827', color: '#fff', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer' }}>
                Vérifier ma réponse
              </button>
            )}
          </div>
        )}

        {/* Réponse transformation/rédaction */}
        {(exercise.reponse && !exercise.options) && (
          <div>
            {!revealed ? (
              <button onClick={() => setRevealed(true)}
                style={{ padding: '10px 20px', borderRadius: '10px', background: '#f3f4f6', color: '#374151', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer' }}>
                Voir la correction
              </button>
            ) : (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '14px 18px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#065f46' }}>Correction</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#064e3b', fontWeight: 500 }}>{exercise.reponse}</p>
              </div>
            )}
          </div>
        )}

        {/* Exemple pour rédaction */}
        {exercise.exemple && revealed && (
          <div style={{ marginTop: '12px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '14px 18px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#0369a1' }}>Exemple de réponse</p>
            <p style={{ margin: 0, fontSize: '14px', color: '#075985', lineHeight: 1.65, fontStyle: 'italic' }}>{exercise.exemple}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function LeconPage() {
  const router = useRouter()
  const params = useParams()
  const moduleId = params.id as string
  const [module, setModule] = useState<Module | null>(null)
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    async function loadModule() {
      const { data } = await supabase.from('modules').select('*').eq('id', moduleId).single()
      if (data) setModule(data)
      setLoading(false)
    }
    loadModule()
  }, [moduleId])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  if (loading) return (
    <AppLayout>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>Chargement de la leçon…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </AppLayout>
  )

  if (!module) return (
    <AppLayout>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: '#6b7280' }}>Module non trouvé.</p>
      </div>
    </AppLayout>
  )

  const contenu = module.contenu as any
  const sections = contenu?.sections || []
  const exercices = contenu?.exercices || []
  const erreursCount = contenu?.erreurs_courantes?.length || 0

  return (
    <AppLayout>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.45s ease both; }
        .fade-up-1 { animation-delay: 0.05s; }
        .fade-up-2 { animation-delay: 0.12s; }
        .fade-up-3 { animation-delay: 0.20s; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f8f9fb' }}>

        {/* ── Sticky header ── */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: scrolled ? 'rgba(255,255,255,0.92)' : '#fff',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: '1px solid #e5e7eb',
          transition: 'all 0.25s',
          boxShadow: scrolled ? '0 1px 8px rgba(0,0,0,0.06)' : 'none',
        }}>
          <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <button onClick={() => router.push('/bibliotheque')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#111827')}
              onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}>
              <ArrowLeft />
              Bibliothèque
            </button>
            {scrolled && (
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '480px' }}>
                {module.titre}
              </p>
            )}
            <ProgressBar total={sections.length} current={sections.length} />
          </div>
        </header>

        {/* ── Hero ── */}
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)', color: '#fff', padding: '56px 24px 60px' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <div className="fade-up" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.15)', color: '#c7d2fe', padding: '4px 12px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <BookOpen />{module.chapitre}
              </span>
              {contenu?.niveau && (
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: '#6366f1', color: '#e0e7ff', padding: '4px 12px', borderRadius: '99px' }}>
                  Niveau {contenu.niveau}
                </span>
              )}
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.12)', color: '#a5b4fc', padding: '4px 12px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock />{module.duree_minutes} min
              </span>
            </div>

            <h1 className="fade-up fade-up-1" style={{ margin: '0 0 20px', fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em', color: '#fff' }}>
              {module.titre}
            </h1>

            {/* Stats rapides */}
            <div className="fade-up fade-up-2" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
              {[
                { n: sections.length, label: 'sections' },
                { n: exercices.length, label: 'exercices' },
                { n: erreursCount, label: 'erreurs à éviter' },
              ].map(({ n, label }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.10)', borderRadius: '10px', padding: '10px 16px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#a5b4fc', lineHeight: 1 }}>{n}</p>
                  <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Contenu principal ── */}
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px 80px' }}>

          {/* Introduction */}
          {contenu?.introduction && (
            <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e5e7eb', padding: '28px 32px', margin: '-28px 0 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-1px', left: '32px', width: '48px', height: '3px', background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: '0 0 4px 4px' }} />
              <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.8, color: '#374151' }}>{contenu.introduction}</p>
            </div>
          )}

          {/* Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
            {sections.map((section: any, i: number) => (
              <SectionCard key={i} section={section} index={i} total={sections.length} />
            ))}
          </div>

          {/* Erreurs courantes */}
          {contenu?.erreurs_courantes?.length > 0 && (
            <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '20px', padding: '28px 32px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', flexShrink: 0 }}>
                  <AlertTriangle />
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#7f1d1d' }}>Erreurs fréquentes à éviter</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {contenu.erreurs_courantes.map((err: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '14px 16px', background: '#fff', borderRadius: '12px', border: '1px solid #fecaca' }}>
                    <span style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px', fontSize: '16px' }}>✗</span>
                    <p style={{ margin: 0, fontSize: '14.5px', color: '#991b1b', lineHeight: 1.6 }}>{err}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conseil TEF */}
          {contenu?.conseil_tef && (
            <div style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1px solid #fde68a', borderRadius: '20px', padding: '28px 32px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '120px', height: '120px', background: '#fbbf24', opacity: 0.08, borderRadius: '50%' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#92400e' }}>
                  <Trophy />
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#78350f' }}>Conseil TEF IRN</h3>
              </div>
              <p style={{ margin: 0, fontSize: '15px', color: '#92400e', lineHeight: 1.75 }}>{contenu.conseil_tef}</p>
            </div>
          )}

          {/* Exercices */}
          {exercices.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Sparkles />
                </div>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#111827' }}>Exercices d'entraînement</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {exercices.map((ex: any, i: number) => (
                  <ExerciseCard key={i} exercise={ex} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Footer CTA */}
          <div style={{ marginTop: '48px', background: 'linear-gradient(135deg, #1e1b4b, #312e81)', borderRadius: '20px', padding: '32px', textAlign: 'center', color: '#fff' }}>
            <p style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 800, color: '#fff' }}>Leçon terminée ! 🎉</p>
            <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#a5b4fc' }}>Continuez votre progression TEF IRN</p>
            <button onClick={() => router.push('/bibliotheque')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '12px', padding: '13px 28px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', transition: 'transform 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
              Explorer d'autres leçons
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
