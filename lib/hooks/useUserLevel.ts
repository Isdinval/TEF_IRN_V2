// lib/hooks/useUserLevel.ts
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

export type UserLevel = {
  global_level: string
  global_score: number
  writing_score: number
  voltaire_score: number
  speaking_score: number
  strengths: string[] | null
  weaknesses: string[] | null
  last_updated: string
  total_exercices?: number
  last_evaluation_date?: string
}

export function useUserLevel() {
  const { user } = useAuth()
  const [level, setLevel] = useState<UserLevel | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshLevel = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      // Appel de la fonction SQL qui fait le calcul + UPSERT
      await supabase.rpc('calculate_user_level', { 
        p_user_id: user.id 
      })

      // Récupération des résultats
      const { data, error } = await supabase
        .from('user_level_evaluations')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur lors de la récupération du niveau:', error)
      }

      if (data) {
        setLevel(data)
      }
    } catch (err) {
      console.error('Erreur refreshLevel:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Chargement initial
  useEffect(() => {
    refreshLevel()
  }, [refreshLevel])

  return { level, loading, refreshLevel }
}
