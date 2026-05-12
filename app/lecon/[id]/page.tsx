'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import { supabase, Module } from '@/lib/supabase'
import { Icons } from '@/components/layout/ui/icons'

export default function LeconPage() {
  const router = useRouter()
  const params = useParams()
  const moduleId = params.id as string

  const [module, setModule] = useState<Module | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadModule() {
      const { data } = await supabase
        .from('modules')
        .select('*')
        .eq('id', moduleId)
        .single()

      if (data) setModule(data)
      setLoading(false)
    }

    loadModule()
  }, [moduleId])

  if (loading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <div className="skeleton" style={{ width: '200px', height: '200px', borderRadius: '2px' }} />
        </div>
      </AppLayout>
    )
  }

  if (!module) {
    return (
      <AppLayout>
        <div style={{ textAlign: 'center', padding: '80px 40px', color: 'var(--color-muted)' }}>
          <Icons.warning 
            size={48} 
            strokeWidth={1.5} 
            style={{ display: 'block', margin: '0 auto 16px', color: '#f59e0b' }} 
          />
          <p style={{ fontSize: '16px' }}>Module non trouvé.</p>
          <button 
            onClick={() => router.push('/bibliotheque')} 
            style={{ 
              marginTop: '16px', 
              background: 'none', 
              border: '1px solid var(--color-primary)', 
              color: 'var(--color-primary)', 
              padding: '8px 16px', 
              cursor: 'pointer', 
              fontSize: '11px', 
              fontWeight: 600, 
              letterSpacing: '0.1em', 
              textTransform: 'uppercase' 
            }}
          >
            Retour à la bibliothèque
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '12px 32px', 
          borderBottom: '1px solid var(--color-muted)', 
          backgroundColor: 'var(--color-surface)', 
          flexShrink: 0 
        }}>
          <button 
            onClick={() => router.push('/bibliotheque')} 
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
            Retour à la Bibliothèque
          </button>
        </header>

        {/* Contenu principal */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>
            
            <span style={{ 
              fontSize: '11px', 
              fontWeight: 600, 
              letterSpacing: '0.1em', 
              textTransform: 'uppercase', 
              color: 'var(--color-muted)' 
            }}>
              {module.chapitre}
            </span>

            <h1 style={{ 
              fontFamily: 'var(--font-heading)', 
              fontSize: '36px', 
              fontWeight: 500, 
              color: 'var(--color-text)', 
              margin: '16px 0 24px' 
            }}>
              {module.titre}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
              <span style={{ 
                fontSize: '11px', 
                fontWeight: 600, 
                letterSpacing: '0.1em', 
                backgroundColor: 'var(--color-background)', 
                border: '1px solid rgba(142,150,164,0.3)', 
                padding: '6px 12px',
                borderRadius: '2px'
              }}>
                {module.categorie}
              </span>
              <span style={{ 
                fontSize: '11px', 
                fontWeight: 600, 
                letterSpacing: '0.1em', 
                color: 'var(--color-muted)' 
              }}>
                {module.duree_minutes} MIN
              </span>
            </div>

            {/* Description courte */}
            {module.description && (
              <div style={{ 
                backgroundColor: 'var(--color-background)', 
                border: '1px solid var(--color-muted)', 
                padding: '28px', 
                borderRadius: '2px', 
                marginBottom: '48px' 
              }}>
                <h3 style={{ 
                  fontFamily: 'var(--font-heading)', 
                  fontSize: '18px', 
                  marginBottom: '16px' 
                }}>
                  Description
                </h3>
                <p style={{ fontSize: '15px', lineHeight: 1.7 }}>
                  {module.description}
                </p>
              </div>
            )}

            {/* ====================== CONTENU DÉTAILLÉ ====================== */}
            {module.contenu && typeof module.contenu === 'object' && (
              <div>
                {/* Titre du contenu */}
                <h2 style={{ 
                  fontFamily: 'var(--font-heading)', 
                  fontSize: '28px', 
                  fontWeight: 500, 
                  marginBottom: '32px' 
                }}>
                  {module.contenu.titre || "Contenu de la leçon"}
                </h2>

                {/* Introduction */}
                {module.contenu.introduction && (
                  <div style={{ 
                    backgroundColor: 'var(--color-background)', 
                    padding: '32px', 
                    borderRadius: '2px',
                    marginBottom: '48px',
                    borderLeft: '5px solid var(--color-primary)'
                  }}>
                    <p style={{ fontSize: '15.5px', lineHeight: 1.85 }}>
                      {module.contenu.introduction}
                    </p>
                  </div>
                )}

                {/* Sections */}
                {module.contenu.sections?.map((section: any, index: number) => (
                  <div key={index} style={{ marginBottom: '52px' }}>
                    <h3 style={{ 
                      fontSize: '24px', 
                      fontWeight: 500, 
                      marginBottom: '24px',
                      color: 'var(--color-text)'
                    }}>
                      {section.titre}
                    </h3>

                    {section.contenu && (
                      <p style={{ 
                        fontSize: '15.5px', 
                        lineHeight: 1.8, 
                        marginBottom: '24px',
                        whiteSpace: 'pre-line'
                      }}>
                        {section.contenu}
                      </p>
                    )}

                    {/* Exemples */}
                    {section.exemples && section.exemples.length > 0 && (
                      <div style={{ marginBottom: '28px' }}>
                        <strong style={{ color: 'var(--color-muted)', fontSize: '14px' }}>Exemples :</strong>
                        <ul style={{ marginTop: '14px', paddingLeft: '22px' }}>
                          {section.exemples.map((ex: string, i: number) => (
                            <li key={i} style={{ marginBottom: '10px', fontSize: '15.5px' }}>
                              {ex}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tableau */}
                    {section.tableau && Array.isArray(section.tableau) && (
                      <table style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse', 
                        margin: '28px 0',
                        backgroundColor: 'var(--color-background)'
                      }}>
                        <thead>
                          <tr>
                            {section.tableau[0].map((header: string, i: number) => (
                              <th key={i} style={{ 
                                padding: '14px 20px', 
                                textAlign: 'left', 
                                border: '1px solid var(--color-muted)',
                                backgroundColor: 'rgba(0,0,0,0.02)'
                              }}>
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {section.tableau.slice(1).map((row: string[], rowIndex: number) => (
                            <tr key={rowIndex}>
                              {row.map((cell: string, cellIndex: number) => (
                                <td key={cellIndex} style={{ 
                                  padding: '14px 20px', 
                                  border: '1px solid var(--color-muted)',
                                  verticalAlign: 'top'
                                }}>
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))}

                {/* Erreurs courantes */}
                {module.contenu.erreurs_courantes?.length > 0 && (
                  <div style={{ marginBottom: '48px' }}>
                    <h3 style={{ fontSize: '22px', marginBottom: '20px' }}>❌ Erreurs courantes à éviter</h3>
                    <ul style={{ paddingLeft: '22px' }}>
                      {module.contenu.erreurs_courantes.map((err: string, i: number) => (
                        <li key={i} style={{ 
                          marginBottom: '12px', 
                          color: '#ef4444',
                          fontSize: '15px',
                          lineHeight: 1.6
                        }}>
                          {err}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Conseil TEF */}
                {module.contenu.conseil_tef && (
                  <div style={{ 
                    backgroundColor: '#fefce8', 
                    border: '1px solid #fde047', 
                    padding: '28px', 
                    borderRadius: '2px',
                    marginBottom: '48px'
                  }}>
                    <h3 style={{ marginBottom: '16px' }}>💡 Conseil pour le TEF IRN</h3>
                    <p style={{ lineHeight: 1.75, fontSize: '15.5px' }}>
                      {module.contenu.conseil_tef}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Boutons d'action */}
            <div style={{ marginTop: '60px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => router.push('/exercices')}
                style={{ 
                  backgroundColor: 'var(--color-primary)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '2px', 
                  padding: '14px 32px', 
                  fontSize: '11px', 
                  fontWeight: 600, 
                  letterSpacing: '0.15em', 
                  textTransform: 'uppercase', 
                  cursor: 'pointer' 
                }}
              >
                Commencer les exercices
              </button>

              <button 
                onClick={() => router.push('/ecriture')}
                style={{ 
                  backgroundColor: 'var(--color-surface)', 
                  color: 'var(--color-primary)', 
                  border: '1px solid var(--color-primary)', 
                  borderRadius: '2px', 
                  padding: '14px 32px', 
                  fontSize: '11px', 
                  fontWeight: 600, 
                  letterSpacing: '0.15em', 
                  textTransform: 'uppercase', 
                  cursor: 'pointer' 
                }}
              >
                Pratique écrite
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
