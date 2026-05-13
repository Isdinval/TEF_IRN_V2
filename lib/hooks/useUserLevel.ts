// lib/hooks/useUserLevel.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

export type UserLevel = {
  global_level: string
  global_score: number
  writing_score: number
  voltaire_score: number
  speaking_score: number
  strengths: string[]
  weaknesses: string[]
  last_updated: string
}

export function useUserLevel() {
  const { user } = useAuth()
  const [level, setLevel] = useState<UserLevel | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshLevel = async () => {
    if (!user) return

    // Calcul du niveau
    await supabase.rpc('calculate_user_level', { p_user_id: user.id })

    const { data } = await supabase
      .from('user_level_evaluations')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) setLevel(data)
    setLoading(false)
  }

  useEffect(() => {
    refreshLevel()
  }, [user])

  return { level, loading, refreshLevel }
}
