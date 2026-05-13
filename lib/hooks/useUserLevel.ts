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
}

export function useUserLevel() {
  const { user } = useAuth()
  const [level, setLevel] = useState<UserLevel | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshLevel = useCallback(async () => {
    if (!user) return

    await supabase.rpc('calculate_user_level', { p_user_id: user.id })

    const { data, error } = await supabase
      .from('user_level_evaluations')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') console.error(error) // PGRST116 = no rows
    if (data) setLevel(data)

    setLoading(false)
  }, [user])

  useEffect(() => {
    refreshLevel()
  }, [refreshLevel])

  return { level, loading, refreshLevel }
}
