import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import { updateCompetencesFromEcrit, ScoresEcrit } from '@/lib/scoring'
 
 
function getServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
 
export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY manquante" }, { status: 500 })
  const openai = new OpenAI({ apiKey })
  try {
    const { texte, prompt_texte, section, soumission_id, user_id } = await req.json()
 
    if (!texte || texte.trim().length < 20) {
      return NextResponse.json(
        { error: 'Texte trop court pour une correction pertinente' },
        { status: 400 }
      )
    }
 
    // ── 1. Appel GPT ────────────────────────────────────────────────────────
    const systemPrompt = `Tu es un examinateur officiel du TEF IRN 2026. 
Évalue le texte de l'apprenant avec rigueur et pédagogie selon les critères exacts de l'examen.
Réponds UNIQUEMENT avec un JSON valide (pas de markdown, pas d'explications hors JSON) :
{
  "note_globale": number entre 0 et 15,
  "note_max": 15,
  "niveau_cefr": "A2" | "B1" | "B2",
  "scores_detail": {
    "contenu": number (0-3),
    "lexique": number (0-3),
    "morphosyntaxe": number (0-3),
    "orthographe": number (0-3),
    "cohesion": number (0-3)
  },
  "erreurs": [
    {
      "categorie": "GRAMMAIRE|ORTHOGRAPHE|SYNTAXE|VOCABULAIRE|COHESION",
      "original": "texte erroné",
      "corrige": "forme correcte",
      "explication": "explication courte et pédagogique"
    }
  ],
  "points_forts": ["liste de 2-4 points positifs"],
  "resume_feedback": "Résumé constructif en 2-4 phrases maximum",
  "recommandation_prochaine": "Une recommandation précise de module ou compétence à travailler",
  "texte_annote": "Le texte original avec les erreurs entourées de [ERR]erreur[/ERR]"
}
Critères d'évaluation TEF IRN :
- Contenu : respect de la consigne, complétude, pertinence
- Lexique : richesse, précision, variété
- Morphosyntaxe : conjugaison, accords, structures
- Orthographe : orthographe lexicale et grammaticale
- Cohésion : organisation des idées, connecteurs, fluidité
Section : ${section || 'Non précisée'}. Consigne : ${prompt_texte || 'Rédaction libre'}`
 
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Consigne complète :\n${prompt_texte || 'Aucune consigne fournie'}\n\nTexte de l'apprenant :\n${texte}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 2500,
    })
 
    let raw = completion.choices[0].message.content || '{}'
    raw = raw.replace(/```json|```/g, '').trim()
    const correction = JSON.parse(raw)
 
    // ── 2. Sauvegarde en base ────────────────────────────────────────────────
    if (soumission_id && user_id) {
      const supabase = getServerSupabase()
 
      // Upsert de la correction
      const { error: correctionError } = await supabase
        .from('corrections')
        .upsert(
          {
            soumission_id,
            user_id,
            note_globale: correction.note_globale,
            note_max: correction.note_max,
            niveau_cefr: correction.niveau_cefr,
            erreurs: correction.erreurs ?? [],
            resume_feedback: correction.resume_feedback,
            texte_annote: correction.texte_annote,
            scores_detail: correction.scores_detail ?? {},
            points_forts: correction.points_forts ?? [],
            recommandation_prochaine: correction.recommandation_prochaine,
          },
          { onConflict: 'soumission_id' }
        )
 
      if (correctionError) {
        console.error('[correct] Erreur upsert correction:', correctionError)
      } else {
        // Mise à jour du statut de la soumission
        await supabase
          .from('soumissions')
          .update({ statut: 'corrige' })
          .eq('id', soumission_id)
      }
 
      // ── 3. Pipeline scoring → radar ────────────────────────────────────────
      const scores = correction.scores_detail as ScoresEcrit
      if (scores && scores.lexique !== undefined) {
        try {
          await updateCompetencesFromEcrit(user_id, scores)
        } catch (scoringError) {
          // Non bloquant : la correction est sauvegardée même si le scoring échoue
          console.error('[correct] Erreur scoring compétences:', scoringError)
        }
      }
    }
 
    return NextResponse.json(correction)
  } catch (err: any) {
    console.error('[correct] Erreur:', err)
    return NextResponse.json(
      { error: 'Erreur lors de la correction IA', details: err.message },
      { status: 500 }
    )
  }
}
