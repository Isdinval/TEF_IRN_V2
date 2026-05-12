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

  if (loading) return <AppLayout><div className="flex justify-center items-center h-screen">Chargement...</div></AppLayout>
  if (!module) return <AppLayout><div>Module non trouvé</div></AppLayout>

  const contenu = module.contenu as any

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
            <button 
              onClick={() => router.push('/bibliotheque')}
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <Icons.arrowBack size={20} />
              Retour à la Bibliothèque
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-10">
          {/* Métadonnées */}
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="text-xs font-semibold tracking-widest uppercase bg-white border border-gray-200 px-4 py-2 rounded">
              {module.chapitre}
            </span>
            {contenu?.niveau && (
              <span className="text-xs font-semibold tracking-widest uppercase bg-blue-100 text-blue-700 px-4 py-2 rounded">
                Niveau {contenu.niveau}
              </span>
            )}
            <span className="text-xs font-semibold tracking-widest uppercase bg-white border border-gray-200 px-4 py-2 rounded">
              {module.duree_minutes} minutes
            </span>
          </div>

          {/* Titre principal */}
          <h1 className="text-4xl font-semibold leading-tight mb-8 text-gray-900">
            {module.titre}
          </h1>

          {/* Introduction */}
          {contenu?.introduction && (
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-8 mb-12 leading-relaxed text-[15.5px]">
              {contenu.introduction}
            </div>
          )}

          {/* Sections */}
          {contenu?.sections?.map((section: any, index: number) => (
            <div key={index} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 mb-10">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">
                {section.titre}
              </h2>

              {section.contenu && (
                <p className="text-[15.5px] leading-relaxed mb-8 whitespace-pre-line">
                  {section.contenu}
                </p>
              )}

              {/* Formation / Règles */}
              {(section.formation || section.regle_accord) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
                  {section.formation && (
                    <div className="mb-4">
                      <strong className="text-amber-800">Formation :</strong>
                      <p className="mt-1 text-amber-900">{section.formation}</p>
                    </div>
                  )}
                  {section.regle_accord && (
                    <div>
                      <strong className="text-amber-800">Règle d’accord :</strong>
                      <p className="mt-1 text-amber-900">{section.regle_accord}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Exemples */}
              {section.exemples?.length > 0 && (
                <div className="mb-8">
                  <h4 className="font-semibold mb-4 text-gray-800">Exemples :</h4>
                  <div className="space-y-3">
                    {section.exemples.map((ex: string, i: number) => (
                      <div key={i} className="pl-5 border-l-2 border-primary text-[15px]">
                        {ex}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Astuce */}
              {section.astuce && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mt-8">
                  <strong className="text-emerald-800">💡 Astuce :</strong>
                  <p className="mt-2 text-emerald-900">{section.astuce}</p>
                </div>
              )}

              {/* Différence */}
              {section.difference && (
                <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-blue-900">{section.difference}</p>
                </div>
              )}

              {/* Tableau */}
              {section.tableau && (
                <div className="mt-10 overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200 rounded-xl overflow-hidden">
                    <thead>
                      <tr className="bg-gray-100">
                        {section.tableau[0].map((header: string, i: number) => (
                          <th key={i} className="px-6 py-4 text-left font-semibold border-b border-gray-200">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.tableau.slice(1).map((row: string[], rowIdx: number) => (
                        <tr key={rowIdx} className="hover:bg-gray-50">
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className="px-6 py-4 border-t border-gray-200">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}

          {/* Erreurs courantes */}
          {contenu?.erreurs_courantes?.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-12">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-red-800">
                ❌ Erreurs courantes à éviter
              </h3>
              <ul className="space-y-4">
                {contenu.erreurs_courantes.map((err: string, i: number) => (
                  <li key={i} className="flex gap-3 text-red-700">
                    <span className="text-red-400 mt-1">•</span>
                    <span>{err}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Conseil TEF */}
          {contenu?.conseil_tef && (
            <div className="bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 rounded-2xl p-8 mb-12">
              <h3 className="text-xl font-semibold mb-4">💡 Conseil pour réussir le TEF IRN</h3>
              <p className="leading-relaxed text-amber-900">{contenu.conseil_tef}</p>
            </div>
          )}

          {/* Exercices (à venir) */}
          {contenu?.exercices?.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-8">
              <h3 className="text-2xl font-semibold mb-6">Exercices d’entraînement</h3>
              <p className="text-gray-600 mb-8">
                Les exercices interactifs pour cette leçon seront bientôt disponibles.
              </p>
              <button 
                onClick={() => alert("Fonctionnalité en cours de développement")}
                className="bg-primary text-white px-8 py-3.5 rounded-xl font-medium hover:bg-primary/90 transition"
              >
                Voir les exercices
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
