'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/layout/AppLayout'
import { useAuth } from '@/lib/auth-context'
import { supabase, Competences } from '@/lib/supabase'
import { calculateNiveauEstime } from '@/lib/niveau-utils'
import { AppPage, AppPanel, PageErrorState } from '@/components/ui/app-page'

const AXES = [
  { key: 'lexique', label: 'Lexique' },
  { key: 'syntaxe', label: 'Syntaxe' },
  { key: 'cohesion', label: 'Cohésion' },
  { key: 'orthographe', label: 'Orthographe' },
  { key: 'comprehension', label: 'Compréhension' },
  { key: 'fluidite', label: 'Fluidité' },
] as const

type AxeKey = typeof AXES[number]['key']

const polarToCartesian = (cx: number, cy: number, r: number, angleIndex: number, total: number) => {
  const angle = (Math.PI * 2 * angleIndex) / total - Math.PI / 2
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
}

const radarPolygon = (values: number[], cx: number, cy: number, maxR: number, maxVal: number) => values.map((v, i) => {
  const pt = polarToCartesian(cx, cy, (v / maxVal) * maxR, i, values.length)
  return `${pt.x},${pt.y}`
}).join(' ')

const gridPolygon = (cx: number, cy: number, r: number, n: number) => Array.from({ length: n }, (_, i) => {
  const pt = polarToCartesian(cx, cy, r, i, n)
  return `${pt.x},${pt.y}`
}).join(' ')

export default function RadarPage() {
  const { user } = useAuth()
  const [competences, setCompetences] = useState<Competences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase.from('competences').select('*').eq('user_id', user.id).single()
    if (fetchError && fetchError.code !== 'PGRST116') {
      setError('Impossible de charger le radar pour le moment.')
      setLoading(false)
      return
    }
    setCompetences(data ?? null)
    setLoading(false)
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  const values = useMemo(() => AXES.map((a) => competences?.[a.key as AxeKey] ?? 0), [competences])
  const weakest = useMemo(() => competences ? AXES.map((a) => ({ ...a, value: competences[a.key as AxeKey] })).sort((a, b) => a.value - b.value)[0] : null, [competences])
  const strongest = useMemo(() => competences ? AXES.map((a) => ({ ...a, value: competences[a.key as AxeKey] })).sort((a, b) => b.value - a.value)[0] : null, [competences])

  const niveauEstime = competences ? calculateNiveauEstime(competences) : '-'
  const CX = 200
  const CY = 200
  const MAX_R = 140

  return (
    <AppLayout>
      <AppPage>
        <AppPanel className="p-6">
          <h1 className="text-3xl font-semibold">Radar de compétences</h1>
          <p className="mt-1 text-[var(--color-muted)]">Visualisez vos forces, vos priorités, et votre niveau estimé pour guider votre prochain entraînement.</p>
        </AppPanel>

        {error ? (
          <PageErrorState title="Erreur radar" message={error} onRetry={loadData} />
        ) : (
          <section className="grid gap-6 xl:grid-cols-12">
            <AppPanel className="p-6 xl:col-span-8">
              <div className="mb-6 flex flex-wrap justify-between gap-3">
                <div>
                  <p className="text-sm text-[var(--color-muted)]">Niveau estimé</p>
                  <p className="text-2xl font-semibold">{niveauEstime}</p>
                </div>
                <Link href="/exercices" className="text-sm text-[var(--color-primary)]">Lancer un exercice ciblé →</Link>
              </div>

              {loading ? (
                <div className="grid h-[420px] place-items-center">Chargement du radar…</div>
              ) : !competences ? (
                <div className="grid h-[420px] place-items-center rounded-2xl border border-dashed border-violet-300/70 bg-white/50 text-center text-[var(--color-muted)]">Aucune donnée radar disponible. Réalisez une activité pour initialiser vos compétences.</div>
              ) : (
                <div className="flex justify-center">
                  <svg viewBox="0 0 400 400" width="100%" className="max-w-[460px]">
                    {[25, 50, 75, 100].map((pct) => (<polygon key={pct} points={gridPolygon(CX, CY, (pct / 100) * MAX_R, AXES.length)} stroke="#A8B0BF" strokeWidth="1" fill="none" opacity="0.45" />))}
                    {AXES.map((_, i) => {
                      const end = polarToCartesian(CX, CY, MAX_R, i, AXES.length)
                      return <line key={i} x1={CX} y1={CY} x2={end.x} y2={end.y} stroke="#A8B0BF" strokeWidth="1" opacity="0.6" />
                    })}
                    <polygon points={radarPolygon(values, CX, CY, MAX_R, 100)} fill="#5B21B6" fillOpacity="0.16" stroke="#5B21B6" strokeWidth="2" />
                    {values.map((v, i) => {
                      const pt = polarToCartesian(CX, CY, (v / 100) * MAX_R, i, values.length)
                      return <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#5B21B6" />
                    })}
                    {AXES.map((axis, i) => {
                      const pt = polarToCartesian(CX, CY, MAX_R + 24, i, AXES.length)
                      return <text key={i} x={pt.x} y={pt.y} textAnchor="middle" className="fill-slate-700 text-[10px]">{axis.label}</text>
                    })}
                  </svg>
                </div>
              )}
            </AppPanel>

            <div className="space-y-4 xl:col-span-4">
              <InsightCard title="Axe prioritaire" value={weakest ? `${weakest.label} (${weakest.value}%)` : 'En attente'} description="Ciblez cet axe dans votre prochaine session pour maximiser le gain de score." />
              <InsightCard title="Axe fort" value={strongest ? `${strongest.label} (${strongest.value}%)` : 'En attente'} description="Conservez cet avantage avec des simulations complètes régulières." />
              <AppPanel className="p-5">
                <h3 className="font-semibold">Plan d'action immédiat</h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">1) Faites un exercice ciblé<br/>2) Relancez une production écrite<br/>3) Vérifiez l'évolution dans le radar</p>
              </AppPanel>
            </div>
          </section>
        )}
      </AppPage>
    </AppLayout>
  )
}

function InsightCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <AppPanel className="p-5">
      <p className="text-sm text-[var(--color-muted)]">{title}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
      <p className="mt-2 text-sm text-[var(--color-muted)]">{description}</p>
    </AppPanel>
  )
}
