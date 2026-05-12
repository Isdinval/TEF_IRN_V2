'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/layout/AppLayout'
import { useAuth } from '@/lib/auth-context'
import { supabase, Competences } from '@/lib/supabase'
import { calculateNiveauEstime } from '@/lib/niveau-utils'

const AXES = [
  { key: 'lexique', label: 'Lexique' },
  { key: 'syntaxe', label: 'Syntaxe' },
  { key: 'cohesion', label: 'Cohésion' },
  { key: 'orthographe', label: 'Orthographe' },
  { key: 'comprehension', label: 'Compréhension' },
  { key: 'fluidite', label: 'Fluidité' },
] as const

type AxeKey = typeof AXES[number]['key']

function polarToCartesian(cx: number, cy: number, r: number, angleIndex: number, total: number) {
  const angle = (Math.PI * 2 * angleIndex) / total - Math.PI / 2
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  }
}

function radarPolygon(values: number[], cx: number, cy: number, maxR: number, maxVal: number) {
  return values.map((v, i) => {
    const r = (v / maxVal) * maxR
    const pt = polarToCartesian(cx, cy, r, i, values.length)
    return `${pt.x},${pt.y}`
  }).join(' ')
}

function gridPolygon(cx: number, cy: number, r: number, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const pt = polarToCartesian(cx, cy, r, i, n)
    return `${pt.x},${pt.y}`
  }).join(' ')
}

const INSIGHTS = [
  {
    type: 'warning' as const,
    titre: 'Réviser le subjonctif présent',
    texte: 'Faiblesse détectée en Syntaxe lors des 3 dernières rédactions. Confusion fréquente avec l\'indicatif.',
    cta: 'S\'entraîner',
    href: '/exercices',
    accent: true,
  },
  {
    type: 'positive' as const,
    titre: 'Amélioration du Lexique',
    texte: 'Utilisation accrue de connecteurs logiques complexes. Continuez à diversifier vos adverbes.',
    cta: 'Voir Module',
    href: '/bibliotheque',
    accent: false,
  },
  {
    type: 'action' as const,
    titre: 'Évaluation Blanche Requise',
    texte: 'Vos métriques de fluidité sont stables. Il est temps de passer une épreuve complète pour valider le niveau B1.',
    cta: 'Débuter l\'Épreuve',
    href: '/ecriture',
    accent: false,
    primary: true,
  },
]

export default function RadarPage() {
  const { user } = useAuth()
  const [competences, setCompetences] = useState<Competences>({
    lexique: 75,
    syntaxe: 55,
    cohesion: 62,
    orthographe: 48,
    comprehension: 70,
    fluidite: 65,
  })
  const [loading, setLoading] = useState(true)
  const [niveauEstime, setNiveauEstime] = useState<string>('B1')
  const [progression, setProgression] = useState('+15%')

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  const loadData = async () => {
    const { data } = await supabase
      .from('competences')
      .select('*')
      .eq('user_id', user!.id)
      .single()

    if (data) {
      setCompetences({
        lexique: data.lexique,
        syntaxe: data.syntaxe,
        cohesion: data.cohesion,
        orthographe: data.orthographe,
        comprehension: data.comprehension,
        fluidite: data.fluidite,
      })
    } else {
      // Create default competences
      await supabase.from('competences').insert({
        user_id: user!.id,
        lexique: 75,
        syntaxe: 55,
        cohesion: 62,
        orthographe: 48,
        comprehension: 70,
        fluidite: 65,
      })
    }
    setLoading(false)
  }

  const CX = 200
  const CY = 200
  const MAX_R = 140
  const N = AXES.length
  const values = AXES.map(a => competences[a.key])
  const RINGS = [25, 50, 75, 100]

  return (
    <AppLayout>
      {/* Header */}
      <header style={{ padding: '32px 40px', borderBottom: '1px solid var(--color-muted)', backgroundColor: 'var(--color-background)' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', fontWeight: 500, color: 'var(--color-text)', margin: 0 }}>
          Radar de compétences
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginTop: '6px' }}>
          Analyse détaillée des compétences CECRL (A1–B1) basée sur vos récentes évaluations institutionnelles.
        </p>
      </header>

      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', maxWidth: '1100px' }}>
          {/* Left: Chart */}
          <div style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-muted)',
            borderRadius: '2px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            minHeight: '520px',
          }}>
            {/* Chart meta */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '4px' }}>
                  Profil Évalué
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: 'var(--color-text)' }}>
                  Niveau Actuel Estimé : {niveauEstime}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '4px' }}>
                  Progression (30 jours)
                </div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: '#059669' }}>
                  {progression}
                </div>
              </div>
            </div>

            {/* SVG Radar */}
            {loading ? (
              <div className="skeleton" style={{ width: '400px', height: '400px', borderRadius: '50%' }} />
            ) : (
              <svg viewBox="0 0 400 400" width="420" height="420" style={{ overflow: 'visible' }}>
                {/* Grid rings */}
                {RINGS.map(pct => (
                  <polygon
                    key={pct}
                    points={gridPolygon(CX, CY, (pct / 100) * MAX_R, N)}
                    stroke="#8E96A4"
                    strokeWidth="1"
                    fill="none"
                    opacity="0.35"
                  />
                ))}

                {/* Axis lines */}
                {AXES.map((_, i) => {
                  const end = polarToCartesian(CX, CY, MAX_R, i, N)
                  return (
                    <line
                      key={i}
                      x1={CX} y1={CY}
                      x2={end.x} y2={end.y}
                      stroke="#8E96A4"
                      strokeWidth="1"
                      opacity="0.5"
                    />
                  )
                })}

                {/* Data polygon */}
                <polygon
                  points={radarPolygon(values, CX, CY, MAX_R, 100)}
                  fill="#0033CC"
                  fillOpacity="0.12"
                  stroke="#0033CC"
                  strokeWidth="2"
                />

                {/* Data points */}
                {values.map((v, i) => {
                  const r = (v / 100) * MAX_R
                  const pt = polarToCartesian(CX, CY, r, i, N)
                  return <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#0033CC" />
                })}

                {/* Labels */}
                {AXES.map((axis, i) => {
                  const pt = polarToCartesian(CX, CY, MAX_R + 28, i, N)
                  let anchor: 'middle' | 'start' | 'end' = 'middle'
                  if (pt.x < CX - 10) anchor = 'end'
                  else if (pt.x > CX + 10) anchor = 'start'
                  return (
                    <text
                      key={i}
                      x={pt.x}
                      y={pt.y + 4}
                      textAnchor={anchor}
                      style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', fill: '#0B132B', fontFamily: 'Albert Sans, sans-serif' }}
                    >
                      {axis.label}
                    </text>
                  )
                })}
              </svg>
            )}

            {/* Score legend */}
            <div style={{ display: 'flex', gap: '24px', marginTop: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {AXES.map(axis => (
                <div key={axis.key} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>
                    {axis.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--color-primary)' }}>
                    {competences[axis.key]}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Insights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', color: 'var(--color-text)', borderBottom: '1px solid var(--color-muted)', paddingBottom: '8px', margin: 0 }}>
              Insights Éditoriaux
            </h3>

            {INSIGHTS.map((insight, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: `1px solid ${insight.accent ? 'rgba(217,42,42,0.2)' : 'var(--color-muted)'}`,
                  borderRadius: '2px',
                  padding: '20px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {insight.accent && (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', backgroundColor: 'var(--color-accent)' }} />
                )}
                <div style={{ paddingLeft: insight.accent ? '12px' : '0', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span className="material-symbols-outlined" style={{
                    fontSize: '22px',
                    color: insight.accent ? 'var(--color-accent)' : 'var(--color-muted)',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}>
                    {insight.type === 'warning' ? 'warning' : insight.type === 'positive' ? 'trending_up' : 'assignment'}
                  </span>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '6px' }}>
                      {insight.titre}
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '14px' }}>
                      {insight.texte}
                    </p>
                    <Link href={insight.href}>
                      <button style={{
                        backgroundColor: insight.primary ? 'var(--color-primary)' : 'transparent',
                        color: insight.primary ? 'white' : 'var(--color-primary)',
                        border: insight.primary ? 'none' : 'none',
                        cursor: 'pointer',
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-body)',
                        padding: insight.primary ? '8px 16px' : '0',
                        borderRadius: '2px',
                        textDecoration: insight.primary ? 'none' : 'underline',
                        textUnderlineOffset: '3px',
                      }}>
                        {insight.cta} {!insight.primary && '→'}
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
