'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/layout/AppLayout'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { calculateNiveauEstime } from '@/lib/niveau-utils'
import { Icons } from '@/components/layout/ui/icons'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState<{modulesTotal:number;modulesCompletes:number;motCount:number;niveauEstime:string;progression:number}|null>(null)
  const [activities, setActivities] = useState<{id:string;titre:string;detail:string;statut:string;date:string;icon:string}[]>([])
  const [nextModule, setNextModule] = useState<{id:string;titre:string;categorie:string;duree_minutes:number}|null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { 
    if (!user) return; 
    loadDashboard() 
  }, [user])

  const loadDashboard = async () => {
    if (!user) return

    const [{ data: progressData }, { data: soumissionsData }, { data: allModules }, { data: exerciceResults }, { data: conversationsData }, { data: competencesData }] = await Promise.all([
      supabase.from('user_module_progress').select('*, modules(*)').eq('user_id', user.id),
      supabase.from('soumissions').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
      supabase.from('modules').select('*').order('ordre', { ascending: true }),
      supabase.from('user_exercice_results').select('reponse_correcte').eq('user_id', user.id),
      supabase.from('conversations_coach').select('messages').eq('user_id', user.id).eq('statut', 'termine'),
      supabase.from('competences').select('*').eq('user_id', user.id).single(),
    ])

    const completedIds = new Set((progressData||[]).filter(p=>p.statut==='complete').map(p=>p.module_id))
    const nextMod = allModules?.find(m=>!completedIds.has(m.id)) || null
    setNextModule(nextMod)

    const acts: {id:string;titre:string;detail:string;statut:string;date:string;icon:string}[] = []

    progressData?.slice(0,3).forEach(p => { 
      if(p.modules) {
        acts.push({ 
          id: p.module_id, 
          titre: p.modules.titre, 
          detail: `${p.modules.categorie} • ${p.statut==='complete'?'Complété':'En cours'}`, 
          statut: p.statut, 
          date: new Date(p.created_at||Date.now()).toLocaleDateString('fr-FR',{day:'numeric',month:'short'}), 
          icon: p.statut==='complete' ? 'check_circle' : 'edit' 
        }) 
      }
    })

    soumissionsData?.slice(0,2).forEach(s => {
      acts.push({ 
        id: s.id, 
        titre: s.titre||'Expression Écrite', 
        detail: `Expression Écrite • ${s.statut==='corrige'?'Corrigé':s.statut==='soumis'?'En attente':'Brouillon'}`, 
        statut: s.statut, 
        date: new Date(s.updated_at).toLocaleDateString('fr-FR',{day:'numeric',month:'short'}), 
        icon: s.statut==='corrige' ? 'task_alt' : 'edit' 
      })
    })

    setActivities(acts.slice(0,5))

    const totalMots = (soumissionsData||[]).reduce((acc,s)=>acc+(s.mot_count||0),0)

    const corrections = soumissionsData?.filter(s => s.statut === 'corrige').map(s => ({
      niveau_cefr: 'A2'
    })) || []

    const niveauCalcule = calculateNiveauEstime(
      competencesData ? { 
        lexique: competencesData.lexique, 
        syntaxe: competencesData.syntaxe, 
        cohesion: competencesData.cohesion, 
        orthographe: competencesData.orthographe, 
        comprehension: competencesData.comprehension, 
        fluidite: competencesData.fluidite 
      } : null,
      exerciceResults || undefined,
      corrections.length > 0 ? corrections : undefined,
      conversationsData || undefined
    )

    setStats({ 
      modulesTotal: allModules?.length||0, 
      modulesCompletes: completedIds.size, 
      motCount: totalMots, 
      niveauEstime: niveauCalcule, 
      progression: Math.round((completedIds.size / Math.max(allModules?.length||1, 1)) * 100) 
    })
    setLoading(false)
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Candidat'

  const S = { 
    fontSize: '11px', 
    fontWeight: 600, 
    letterSpacing: '0.15em', 
    textTransform: 'uppercase' as const, 
    color: 'var(--color-muted)', 
    marginBottom: '16px' 
  }

  // Mapping des icônes pour les activités
  const getActivityIcon = (iconName: string) => {
    switch(iconName) {
      case 'check_circle': return Icons.checkCircle
      case 'task_alt': return Icons.taskAlt
      case 'edit': return Icons.edit
      default: return Icons.edit
    }
  }

  return (
    <AppLayout>
      <header style={{ padding: '32px 40px', borderBottom: '1px solid var(--color-muted)', backgroundColor: 'var(--color-background)' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', fontWeight: 500, color: 'var(--color-text)', margin: 0 }}>
          Bonjour, {firstName}
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginTop: '6px' }}>
          Voici un résumé de votre préparation institutionnelle aujourd'hui.
        </p>
      </header>

      <div style={{ flex: 1, padding: '40px', display: 'flex', gap: '40px', overflowY: 'auto' }}>
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '32px', minWidth: 0 }}>
          {/* Prochaine Étape */}
          <section>
            <h3 style={S}>Prochaine Étape</h3>
            {loading ? (
              <div className="skeleton" style={{ height: '140px', borderRadius: '2px' }} />
            ) : nextModule ? (
              <div style={{ 
                backgroundColor: 'var(--color-surface)', 
                border: '1px solid var(--color-muted)', 
                borderRadius: '2px', 
                padding: '24px', 
                display: 'flex', 
                alignItems: 'flex-start', 
                justifyContent: 'space-between', 
                gap: '24px' 
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ backgroundColor: 'var(--color-hover-blue)', color: 'var(--color-primary)', border: '1px solid rgba(0,51,204,0.2)', fontSize: '11px', fontWeight: 600, padding: '3px 8px' }}>
                      {nextModule.categorie}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>{nextModule.duree_minutes} min</span>
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--color-text)', margin: '0 0 8px' }}>
                    {nextModule.titre}
                  </h4>
                </div>
                <Link href="/bibliotheque">
                  <button style={{ 
                    backgroundColor: 'var(--color-primary)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '2px', 
                    padding: '12px 24px', 
                    fontSize: '11px', 
                    fontWeight: 600, 
                    letterSpacing: '0.1em', 
                    textTransform: 'uppercase', 
                    cursor: 'pointer', 
                    fontFamily: 'var(--font-body)', 
                    flexShrink: 0 
                  }}>
                    Commencer
                  </button>
                </Link>
              </div>
            ) : (
              <div style={{ padding: '24px', border: '1px solid var(--color-muted)', borderRadius: '2px', color: 'var(--color-muted)', fontSize: '14px' }}>
                Aucune donnée. Commencez votre première évaluation.
              </div>
            )}
          </section>

          {/* Activité Récente */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ ...S, margin: 0 }}>Activité Récente</h3>
              <Link href="/corrections" style={{ 
                color: 'var(--color-primary)', 
                fontSize: '13px', 
                textDecoration: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px' 
              }}>
                Voir tout 
                <Icons.arrowForward size={16} strokeWidth={2.5} />
              </Link>
            </div>

            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-muted)', borderRadius: '2px' }}>
              {loading ? (
                [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '64px', margin: '1px 0' }} />)
              ) : activities.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-muted)', fontSize: '14px' }}>
                  Aucune activité. Commencez votre première évaluation.
                </div>
              ) : (
                activities.map((act, i) => {
                  const IconComponent = getActivityIcon(act.icon)
                  return (
                    <div key={act.id + i} style={{ 
                      padding: '16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '16px', 
                      borderBottom: i < activities.length - 1 ? '1px solid var(--color-muted)' : 'none' 
                    }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        backgroundColor: 'var(--color-hover-blue)', 
                        border: '1px solid var(--color-muted)', 
                        borderRadius: '2px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        flexShrink: 0 
                      }}>
                        <IconComponent size={20} strokeWidth={2.5} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>{act.titre}</div>
                        <div style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '2px' }}>{act.detail}</div>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--color-muted)', flexShrink: 0 }}>{act.date}</div>
                    </div>
                  )
                })
              )}
            </div>
          </section>
        </div>

        {/* Sidebar droite */}
        <aside style={{ flex: '0 0 300px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <section>
            <h3 style={S}>Évaluation Globale</h3>
            <div style={{ 
              backgroundColor: 'var(--color-surface)', 
              border: '1px solid var(--color-muted)', 
              borderRadius: '2px', 
              padding: '24px', 
              textAlign: 'center', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              minHeight: '200px', 
              justifyContent: 'center' 
            }}>
              {loading ? (
                <div className="skeleton" style={{ width: '80px', height: '64px', borderRadius: '2px' }} />
              ) : (
                <>
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '8px' }}>Niveau Actuel Estimé</p>
                  <div style={{ 
                    fontFamily: 'var(--font-heading)', 
                    fontSize: '64px', 
                    fontWeight: 600, 
                    color: 'var(--color-primary)', 
                    lineHeight: 1, 
                    marginBottom: '16px' 
                  }}>
                    {stats?.niveauEstime || 'A2'}
                  </div>
                  <div style={{ 
                    width: '100%', 
                    backgroundColor: 'var(--color-background)', 
                    border: '1px solid var(--color-muted)', 
                    height: '8px', 
                    overflow: 'hidden', 
                    marginBottom: '8px' 
                  }}>
                    <div style={{ 
                      backgroundColor: 'var(--color-primary)', 
                      height: '100%', 
                      width: `${stats?.progression || 0}%` 
                    }} />
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                    {stats?.progression || 0}% de préparation vers l'objectif
                  </p>
                </>
              )}
            </div>
          </section>

          <section>
            <h3 style={S}>Statistiques Rapides</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Mots Rédigés', value: loading ? '—' : (stats?.motCount || 0).toLocaleString('fr-FR') },
                { label: 'Modules Finis', value: loading ? '—' : `${stats?.modulesCompletes || 0} / ${stats?.modulesTotal || 0}` }
              ].map(s => (
                <div key={s.label} style={{ 
                  backgroundColor: 'var(--color-surface)', 
                  border: '1px solid var(--color-muted)', 
                  borderRadius: '2px', 
                  padding: '16px' 
                }}>
                  <div style={{ 
                    fontSize: '11px', 
                    fontWeight: 600, 
                    letterSpacing: '0.1em', 
                    textTransform: 'uppercase' as const, 
                    color: 'var(--color-muted)', 
                    marginBottom: '6px' 
                  }}>
                    {s.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--color-text)' }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </AppLayout>
  )
}
