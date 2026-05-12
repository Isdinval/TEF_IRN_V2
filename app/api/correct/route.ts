import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { texte, prompt_texte } = await req.json()
    if (!texte || texte.trim().length < 10) return NextResponse.json({ error: 'Texte trop court' }, { status: 400 })
    const systemPrompt = `Tu es un correcteur expert du TEF IRN. Analyse le texte et réponds UNIQUEMENT en JSON valide (sans markdown ni backticks):
{"note_globale":<0-15>,"note_max":15,"niveau_cefr":"<A1|A2|B1|B2>","erreurs":[{"categorie":"<GRAMMAIRE|ORTHOGRAPHE|SYNTAXE|VOCABULAIRE>","original":"<texte erroné>","corrige":"<forme correcte>","explication":"<explication pédagogique>"}],"resume_feedback":"<résumé 2-3 phrases>","texte_annote":"<texte avec erreurs entre [ERR] et [/ERR]>"}`
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role:'system', content:systemPrompt },{ role:'user', content:`Consigne: ${prompt_texte||'Rédaction libre'}\n\nTexte:\n${texte}` }],
      temperature: 0.3, max_tokens: 2000,
    })
    const raw = completion.choices[0].message.content || '{}'
    const clean = raw.replace(/```json|```/g, '').trim()
    return NextResponse.json(JSON.parse(clean))
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur lors de la correction' }, { status: 500 })
  }
}
