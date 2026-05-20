'use client'

import { useEffect, useMemo, useState } from 'react'
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
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
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

export default function RadarPage() {
  const { user } = useAuth()
  const [competences, setCompetences] = useState<Competences | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const loadData = async () => {
      const { data } = await supabase.from('competences').select('*').eq('user_id', user.id).single()
      if (data) {
        setCompetences(data)
      }
      setLoading(false)
    }
    loadData()
  }, [user])

  const values = useMemo(() => AXES.map((a) => competences?.[a.key as AxeKey] ?? 0), [competences])
  const weakest = useMemo(() => {
    if (!competences) return null
    return AXES.map((a) => ({ ...a, value: competences[a.key as AxeKey] })).sort((a, b) => a.value - b.value)[0]
  }, [competences])
  const strongest = useMemo(() => {
    if (!competences) return null
    return AXES.map((a) => ({ ...a, value: competences[a.key as AxeKey] })).sort((a, b) => b.value - a.value)[0]
  }, [competences])

  const niveauEstime = competences ? calculateNiveauEstime(competences) : '-'
  const CX = 200
  const CY = 200
  const MAX_R = 140

  return (
    <AppLayout>
      <div className="p-6 md:p-10 space-y-6 bg-[var(--color-background)] min-h-screen">
        <section className="rounded-3xl bg-white border border-[var(--color-muted)]/20 p-6">
          <h1 className="text-3xl font-semibold">Radar de compétences</h1>
          <p className="text-[var(--color-muted)] mt-1">Visualisez vos forces, vos priorités, et votre niveau estimé pour guider votre prochain entraînement.</p>
        </section>

        <section className="grid xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 rounded-3xl bg-white border border-[var(--color-muted)]/20 p-6">
            <div className="flex justify-between flex-wrap gap-3 mb-6">
              <div>
                <p className="text-sm text-[var(--color-muted)]">Niveau estimé</p>
                <p className="text-2xl font-semibold">{niveauEstime}</p>
              </div>
              <Link href="/exercices" className="text-sm text-[var(--color-primary)]">Lancer un exercice ciblé →</Link>
            </div>

            {loading ? (
              <div className="h-[420px] grid place-items-center">Chargement du radar…</div>
            ) : !competences ? (
              <div className="h-[420px] grid place-items-center text-center text-[var(--color-muted)]">Aucune donnée radar disponible. Réalisez une activité pour initialiser vos compétences.</div>
            ) : (
              <div className="flex justify-center">
                <svg viewBox="0 0 400 400" width="100%" className="max-w-[460px]">
                  {[25, 50, 75, 100].map((pct) => (
                    <polygon key={pct} points={gridPolygon(CX, CY, (pct / 100) * MAX_R, AXES.length)} stroke="#A8B0BF" strokeWidth="1" fill="none" opacity="0.45" />
                  ))}

                  {AXES.map((_, i) => {
                    const end = polarToCartesian(CX, CY, MAX_R, i, AXES.length)
                    return <line key={i} x1={CX} y1={CY} x2={end.x} y2={end.y} stroke="#A8B0BF" strokeWidth="1" opacity="0.6" />
                  })}

                  <polygon points={radarPolygon(values, CX, CY, MAX_R, 100)} fill="#0033CC" fillOpacity="0.16" stroke="#0033CC" strokeWidth="2" />

                  {values.map((v, i) => {
                    const pt = polarToCartesian(CX, CY, (v / 100) * MAX_R, i, values.length)
                    return <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#0033CC" />
                  })}

                  {AXES.map((axis, i) => {
                    const pt = polarToCartesian(CX, CY, MAX_R + 24, i, AXES.length)
                    return <text key={i} x={pt.x} y={pt.y} textAnchor="middle" className="text-[10px] fill-slate-700">{axis.label}</text>
                  })}
                </svg>
              </div>
            )}
          </div>

          <div className="xl:col-span-4 space-y-4">
            <InsightCard title="Axe prioritaire" value={weakest ? `${weakest.label} (${weakest.value}%)` : 'En attente'} description="Ciblez cet axe dans votre prochaine session pour maximiser le gain de score." />
            <InsightCard title="Axe fort" value={strongest ? `${strongest.label} (${strongest.value}%)` : 'En attente'} description="Conservez cet avantage avec des simulations complètes régulières." />
            <div className="rounded-2xl bg-white border border-[var(--color-muted)]/20 p-5">
              <h3 className="font-semibold">Plan d'action immédiat</h3>
              <p className="text-sm text-[var(--color-muted)] mt-2">1) Faites un exercice ciblé<br/>2) Relancez une production écrite<br/>3) Vérifiez l'évolution dans le radar</p>
              <div className="flex gap-2 mt-4">
                <Link href="/exercices" className="text-sm text-[var(--color-primary)]">Exercices</Link>
                <Link href="/ecriture" className="text-sm text-[var(--color-primary)]">Écriture</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}

function InsightCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <div className="rounded-2xl bg-white border border-[var(--color-muted)]/20 p-5">
      <p className="text-sm text-[var(--color-muted)]">{title}</p>
      <p className="text-lg font-semibold mt-1">{value}</p>
      <p className="text-sm text-[var(--color-muted)] mt-2">{description}</p>
    </div>
  )
}
