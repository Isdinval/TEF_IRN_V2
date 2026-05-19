import { NextRequest, NextResponse } from 'next/server'
import { CategorieVoltaire, updateCompetencesFromOral, updateCompetencesFromVoltaire } from '@/lib/scoring'

type VoltairePayload = {
  user_id: string
  category: CategorieVoltaire
  correct: boolean
}

type OralPayload = {
  user_id: string
  messages: { role: 'examiner' | 'user'; content: string }[]
}

function scoreOral(messages: OralPayload['messages']) {
  const userMessages = messages.filter((m) => m.role === 'user').map((m) => m.content.trim()).filter(Boolean)
  const text = userMessages.join(' ')
  const words = text.split(/\s+/).filter(Boolean)
  const unique = new Set(words.map((w) => w.toLowerCase()))
  const fluidite = Math.min(95, Math.max(20, userMessages.length * 8 + Math.min(35, words.length / 3)))
  const lexique = Math.min(95, Math.max(20, unique.size * 2))
  const connectors = ['cependant', 'donc', 'ainsi', 'parce que', 'en revanche', 'de plus']
  const cohesionBoost = connectors.filter((c) => text.toLowerCase().includes(c)).length * 8
  const cohesion = Math.min(95, Math.max(20, 35 + cohesionBoost + userMessages.length * 4))
  return { fluidite, lexique, cohesion }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (body.type === 'voltaire') {
      const payload = body as { type: 'voltaire' } & VoltairePayload
      await updateCompetencesFromVoltaire(payload.user_id, payload.correct, payload.category)
      return NextResponse.json({ ok: true })
    }
    if (body.type === 'oral') {
      const payload = body as { type: 'oral' } & OralPayload
      const scores = scoreOral(payload.messages)
      const competences = await updateCompetencesFromOral(payload.user_id, scores)
      return NextResponse.json({ ok: true, scores, competences })
    }
    return NextResponse.json({ error: 'Type d’événement non supporté' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 })
  }
}
