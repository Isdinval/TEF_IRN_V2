import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { texte, prompt_texte, section } = await req.json();

    if (!texte || texte.trim().length < 20) {
      return NextResponse.json({ error: 'Texte trop court pour une correction pertinente' }, { status: 400 });
    }

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

Section : ${section || 'Non précisée'}. Consigne : ${prompt_texte || 'Rédaction libre'}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Consigne complète :\n${prompt_texte || 'Aucune consigne fournie'}\n\nTexte de l'apprenant :\n${texte}` }
      ],
      temperature: 0.2,
      max_tokens: 2500,
    });

    let raw = completion.choices[0].message.content || '{}';
    // Nettoyage robuste
    raw = raw.replace(/```json|```/g, '').trim();

    const correction = JSON.parse(raw);

    return NextResponse.json(correction);
  } catch (err: any) {
    console.error('Erreur correction:', err);
    return NextResponse.json(
      { error: 'Erreur lors de la correction IA', details: err.message },
      { status: 500 }
    );
  }
}
