'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/layout/AppLayout'
import { useAuth } from '@/lib/auth-context'
import { supabase, Module, UserModuleProgress } from '@/lib/supabase'
import { Icons } from '@/components/layout/ui/icons'
import { AppPage } from '@/components/ui/app-page'

// ==================== NOUVEAU MAPPING CATÉGORIES ====================
const categoriesConfig = {
  Fondamentaux: { label: 'Fondamentaux & Grammaire', icon: '📘', color: 'var(--color-primary)' },
  Vocabulaire:  { label: 'Vocabulaire & Lexique', icon: '📝', color: '#8b5cf6' },
  Ecrit:        { label: 'Expression Écrite', icon: '✍️', color: '#10b981' },
  Oral:         { label: 'Expression Orale', icon: '🗣️', color: '#f59e0b' },
  Compréhension:{ label: 'Compréhension', icon: '👂', color: '#eab308' },
  Entrainement: { label: 'Entraînement & Simulations', icon: '🎯', color: '#ef4444' },
} as const

export default function Bibliotheque() {
  const { user } = useAuth()
  const [modules, setModules] = useState<Module[]>([])
  const [progress, setProgress] = useState<Map<string, UserModuleProgress>>(new Map())
  const [activeCategory, setActiveCategory] = useState<string>('Fondamentaux')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  const loadData = async () => {
    const [{ data: modulesData }, { data: progressData }] = await Promise.all([
      supabase.from('modules').select('*').order('ordre', { ascending: true }),
      supabase.from('user_module_progress').select('*').eq('user_id', user!.id),
    ])

    setModules(modulesData || [])
    const progressMap = new Map<string, UserModuleProgress>()
    progressData?.forEach((p: UserModuleProgress) => progressMap.set(p.module_id, p))
    setProgress(progressMap)
    setLoading(false)
  }

  // Filtrage
  const filteredModules = useMemo(() => {
    return modules.filter(m =>
      m.categorie === activeCategory &&
      (!search || m.titre.toLowerCase().includes(search.toLowerCase()))
    )
  }, [modules, activeCategory, search])

  const getStatusColor = (moduleId: string) => {
    const p = progress.get(moduleId)
    if (!p || p.statut === 'non_commence') return '#8E96A4'
    if (p.statut === 'complete') return '#10B981'
    return '#F59E0B'
  }

  return (
    <AppLayout>
      <AppPage>
      <header style={{
        backgroundColor: 'rgba(255,255,255,0.84)',
        borderBottom: '1px solid rgba(100,116,139,0.28)',
        padding: '32px 40px',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '36px',
              fontWeight: 500,
              color: 'var(--color-text)',
              margin: 0
            }}>
              Bibliothèque
            </h2>
            <p style={{
              fontSize: '14px',
              color: 'var(--color-muted)',
              marginTop: '4px'
            }}>
              Leçons structurées pour réussir le TEF IRN
            </p>
          </div>

          {/* Barre de recherche */}
          <div style={{ position: 'relative', width: '320px' }}>
            <Icons.search
              size={20}
              strokeWidth={2.5}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-muted)',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un module..."
              style={{
                width: '100%',
                paddingLeft: '40px',
                paddingRight: '16px',
                paddingTop: '10px',
                paddingBottom: '10px',
                backgroundColor: 'rgba(248,247,252,0.82)',
                border: '1px solid rgba(100,116,139,0.28)',
                borderRadius: '2px',
                fontSize: '13px',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)'
              }}
            />
          </div>
        </div>

        {/* Tabs des nouvelles catégories */}
        <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid rgba(142,150,164,0.3)', flexWrap: 'wrap' }}>
          {Object.entries(categoriesConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeCategory === key ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: activeCategory === key ? 'var(--color-primary)' : 'var(--color-muted)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                padding: '0 0 12px',
                cursor: 'pointer',
                marginBottom: '-1px',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{config.icon}</span>
              {config.label}
            </button>
          ))}
        </div>
      </header>

      <div style={{ padding: '40px', flex: 1 }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[1,2,3,4].map(i => (
              <div key={i} className="skeleton" style={{ height: '200px', borderRadius: '2px' }} />
            ))}
          </div>
        ) : filteredModules.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 40px',
            color: 'var(--color-muted)'
          }}>
            <Icons.search size={48} strokeWidth={1.5} style={{ display: 'block', margin: '0 auto 16px' }} />
            <p style={{ fontSize: '16px' }}>Aucun module trouvé dans cette catégorie.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {filteredModules.map(module => (
              <Link
                href={`/lecon/${module.id}`}   // ← Mis à jour
                key={module.id}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <article className="module-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--color-muted)'
                    }}>
                      {module.niveau} • {categoriesConfig[module.categorie as keyof typeof categoriesConfig]?.icon}
                    </span>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: getStatusColor(String(module.id))
                    }} />
                  </div>

                  <h3 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '22px',
                    fontWeight: 500,
                    color: 'var(--color-text)',
                    lineHeight: 1.3,
                    marginBottom: '10px'
                  }}>
                    {module.titre}
                  </h3>

                  {module.description && (
                    <p style={{
                      fontSize: '13px',
                      color: 'var(--color-muted)',
                      lineHeight: 1.6,
                      marginBottom: '16px',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    } as React.CSSProperties}>
                      {module.description}
                    </p>
                  )}

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid rgba(142,150,164,0.2)',
                    paddingTop: '16px',
                    marginTop: 'auto'
                  }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      backgroundColor: 'rgba(248,247,252,0.82)',
                      border: '1px solid rgba(142,150,164,0.3)',
                      padding: '4px 8px'
                    }}>
                      ⏱ {module.duree_minutes} MIN
                    </span>
                    <span style={{
                      color: 'var(--color-primary)',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      Commencer
                      <Icons.arrowForward size={18} strokeWidth={2.5} />
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .module-card {
          background-color: var(--color-surface);
          border: 1px solid rgba(142,150,164,0.4);
          border-radius: 2px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: all 0.15s ease;
          height: 100%;
        }
        .module-card:hover {
          background-color: var(--color-hover-blue);
          border-color: rgba(0,51,204,0.4);
          transform: translateY(-2px);
        }
      `}</style>
          </AppPage>
    </AppLayout>
  )
}
