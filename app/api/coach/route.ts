import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { messages, sujet, lastUserMessage } = await req.json()
    const systemPrompt = `Tu es un examinateur du TEF IRN simulant une épreuve orale sur le sujet: "${sujet}". Parle toujours en français formel. Pose des questions de relance courtes (2-4 phrases). Après 6-8 échanges, propose un bref feedback.`
    const apiMessages = [
      { role:'system' as const, content:systemPrompt },
      ...messages.map((m: { role:string; content:string }) => ({ role:m.role==='examiner'?'assistant' as const:'user' as const, content:m.content })),
      ...(lastUserMessage ? [{ role:'user' as const, content:lastUserMessage }] : []),
    ]
    const completion = await openai.chat.completions.create({ model:'gpt-4o-mini', messages:apiMessages, temperature:0.7, max_tokens:300 })
    const reply = completion.choices[0].message.content || ''
    const hintRes = await openai.chat.completions.create({ model:'gpt-4o-mini', messages:[{ role:'system', content:'Donne 3 mots/expressions utiles (séparés par virgules) pour répondre à cette question. Réponds UNIQUEMENT les mots.' },{ role:'user', content:reply }], max_tokens:60, temperature:0.5 })
    return NextResponse.json({ reply, hints: hintRes.choices[0].message.content || '' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur coach' }, { status: 500 })
  }
}
