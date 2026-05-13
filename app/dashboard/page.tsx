'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/layout/AppLayout'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { calculateNiveauEstime } from '@/lib/niveau-utils'
import { Icons } from '@/components/layout/ui/icons'
import { useUserLevel } from '@/lib/hooks/useUserLevel'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const { level: userLevel, loading: levelLoading, refreshLevel } = useUserLevel()

  const [stats, setStats] = useState({
    modulesTotal: 0,
    modulesCompletes: 0,
    motCount: 0,
    progression: 0
  })

  const [activities, setActivities] = useState<{
    id: string
    titre: string
    detail: string
    statut: string
    date: string
    icon: string
  }[]>([])

  const [nextModule, setNextModule] = useState<{
    id: string
    titre: string
    categorie: string
    duree_minutes: number
  } | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadDashboard()
  }, [user])

  const loadDashboard = async () => {
    if (!user) return

    try {
      const [
        { data: progressData },
        { data: soumissionsData },
        { data: allModules },
        { data: exerciceResults }
      ] = await Promise.all([
        supabase.from('user_module_progress').select('*, modules(*)').eq('user_id', user.id),
        supabase.from('soumissions').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
        supabase.from('modules').select('*').order('ordre', { ascending: true }),
        supabase.from('user_exercice_results').select('reponse_correcte').eq('user_id', user.id)
      ])

      // Next module
      const completedIds = new Set((progressData || []).filter(p => p.statut === 'complete').map(p => p.module_id))
      const nextMod = allModules?.find(m => !completedIds.has(m.id)) || null
      setNextModule(nextMod)

      // Recent activities
      const acts: any[] = []

      progressData?.slice(0, 3).forEach((p: any) => {
        if (p.modules) {
          acts.push({
            id: p.module_id,
            titre: p.modules.titre,
            detail: `${p.modules.categorie} • ${p.statut === 'complete' ? 'Complété' : 'En cours'}`,
            statut: p.statut,
            date: new Date(p.updated_at || p.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
            icon: p.statut === 'complete' ? 'check_circle' : 'edit'
          })
        }
      })

      soumissionsData?.slice(0, 2).forEach((s: any) => {
        acts.push({
          id: s.id,
          titre: s.titre || 'Expression Écrite',
          detail: `Expression Écrite • ${s.statut === 'corrige' ? 'Corrigé' : s.statut === 'soumis' ? 'En attente' : 'Brouillon'}`,
          statut: s.statut,
          date: new Date(s.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          icon: s.statut === 'corrige' ? 'task_alt' : 'edit'
        })
      })

      setActivities(acts.slice(0, 5))

      // Stats
      const totalMots = (soumissionsData || []).reduce((acc: number, s: any) => acc + (s.mot_count || 0), 0)

      setStats({
        modulesTotal: allModules?.length || 0,
        modulesCompletes: completedIds.size,
        motCount: totalMots,
        progression: Math.round((completedIds.size / Math.max(allModules?.length || 1, 1)) * 100)
      })

    } catch (error) {
      console.error('Erreur chargement dashboard:', error)
    } finally {
      setLoading(false)
    }
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

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
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
                    fontFamily: 'var(--font-body)'
                  }}>
                    Commencer
                  </button>
                </Link>
              </div>
            ) : (
              <div style={{ padding: '24px', border: '1px solid var(--color-muted)', borderRadius: '2px', color: 'var(--color-muted)', fontSize: '14px' }}>
                Félicitations ! Vous avez terminé tous les modules.
              </div>
            )}
          </section>

          {/* Activité Récente */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ ...S, margin: 0 }}>Activité Récente</h3>
              <Link href="/corrections" style={{ color: 'var(--color-primary)', fontSize: '13px', textDecoration: 'none' }}>
                Voir tout →
              </Link>
            </div>

            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-muted)', borderRadius: '2px' }}>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '72px', margin: '1px 0' }} />
                ))
              ) : activities.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)' }}>
                  Aucune activité récente.
                </div>
              ) : (
                activities.map((act, i) => {
                  const IconComponent = getActivityIcon(act.icon)
                  return (
                    <div key={act.id} style={{
                      padding: '18px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      borderBottom: i < activities.length - 1 ? '1px solid var(--color-muted)' : 'none'
                    }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        backgroundColor: 'var(--color-hover-blue)',
                        border: '1px solid var(--color-muted)',
                        borderRadius: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <IconComponent size={22} strokeWidth={2.5} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{act.titre}</div>
                        <div style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '2px' }}>{act.detail}</div>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--color-muted)' }}>{act.date}</div>
                    </div>
                  )
                })
              )}
            </div>
          </section>
        </div>

        {/* Colonne de droite */}
        <aside style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* === ÉVALUATION GLOBALE - NOUVELLE VERSION === */}
          <section>
            <h3 style={S}>Évaluation Globale</h3>
            <div style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-muted)',
              borderRadius: '2px',
              padding: '32px 28px',
              textAlign: 'center'
            }}>
              {levelLoading || loading ? (
                <div className="skeleton" style={{ height: '260px' }} />
              ) : userLevel ? (
                <>
                  <div style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '12px' }}>
                    NIVEAU GLOBAL • Mis à jour le {new Date(userLevel.last_updated).toLocaleDateString('fr-FR')}
                  </div>

                  <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '78px',
                    fontWeight: 600,
                    lineHeight: 1,
                    color: 'var(--color-primary)',
                    marginBottom: '8px'
                  }}>
                    {userLevel.global_level}
                  </div>

                  <div style={{ fontSize: '19px', color: 'var(--color-text)', marginBottom: '28px' }}>
                    {userLevel.global_score} <span style={{ fontSize: '15px', color: 'var(--color-muted)' }}>/ 100</span>
                  </div>

                  {/* Sous-scores */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>ÉCRIT</div>
                      <div style={{ fontSize: '26px', fontWeight: 600 }}>{userLevel.writing_score}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>VOLTAIRE</div>
                      <div style={{ fontSize: '26px', fontWeight: 600 }}>{userLevel.voltaire_score}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>ORAL</div>
                      <div style={{ fontSize: '26px', fontWeight: 600 }}>{userLevel.speaking_score}</div>
                    </div>
                  </div>

                  {/* Forces & Faiblesses */}
                  {(userLevel.strengths?.length || userLevel.weaknesses?.length) ? (
                    <div style={{ marginTop: '32px', textAlign: 'left', fontSize: '13.5px', borderTop: '1px solid var(--color-muted)', paddingTop: '24px' }}>
                      {userLevel.strengths && userLevel.strengths.length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                          <strong>Forces :</strong> {userLevel.strengths.join(', ')}
                        </div>
                      )}
                      {userLevel.weaknesses && userLevel.weaknesses.length > 0 && (
                        <div style={{ color: '#e11d48' }}>
                          <strong>Axes d’amélioration :</strong> {userLevel.weaknesses.join(', ')}
                        </div>
                      )}
                    </div>
                  ) : null}
                </>
              ) : (
                <div style={{ padding: '60px 20px', color: 'var(--color-muted)' }}>
                  Commencez vos premières évaluations pour obtenir votre niveau global.
                </div>
              )}
            </div>
          </section>

          {/* Statistiques Rapides */}
          <section>
            <h3 style={S}>Statistiques Rapides</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-muted)', borderRadius: '2px', padding: '20px' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginBottom: '8px' }}>MOTS RÉDIGÉS</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 500 }}>
                  {stats.motCount.toLocaleString('fr-FR')}
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-muted)', borderRadius: '2px', padding: '20px' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginBottom: '8px' }}>PROGRESSION</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 500 }}>
                  {stats.progression}%
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </AppLayout>
  )
}
