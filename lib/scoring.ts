import { createClient } from '@supabase/supabase-js'

// ─── Client Supabase côté serveur (service role) ─────────────────────────────
// Cette lib est appelée uniquement depuis les API routes (server-side).
// On utilise le service role key pour bypasser RLS.
function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type ScoresEcrit = {
  contenu: number      // 0-3
  lexique: number      // 0-3
  morphosyntaxe: number // 0-3
  orthographe: number  // 0-3
  cohesion: number     // 0-3
}

export type CategorieVoltaire = 'grammaire' | 'orthographe' | 'syntaxe' | 'vocabulaire'

export type ScoresOral = {
  fluidite: number     // 0-100
  lexique: number      // 0-100
  cohesion: number     // 0-100
}

type Competences = {
  lexique: number
  syntaxe: number
  cohesion: number
  orthographe: number
  comprehension: number
  fluidite: number
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const VALEURS_DEFAUT: Competences = {
  lexique: 50,
  syntaxe: 50,
  cohesion: 50,
  orthographe: 50,
  comprehension: 50,
  fluidite: 50,
}

// Poids de la nouvelle session dans la moyenne mobile (20%)
// Plus ce chiffre est élevé, plus chaque session a d'impact
const POIDS_NOUVELLE_SESSION = 0.20

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Moyenne mobile pondérée : déplace le score actuel de POIDS vers la nouvelle valeur.
 * Exemple : actuel=50, nouveau=80, poids=0.2 → 50 + 0.2*(80-50) = 56
 */
function moyenneMobile(actuel: number, nouveau: number, poids = POIDS_NOUVELLE_SESSION): number {
  const resultat = actuel + poids * (nouveau - actuel)
  return Math.round(Math.min(100, Math.max(0, resultat)))
}

/**
 * Convertit un score sur 3 (TEF écrit) en score sur 100.
 * 0/3 → 10, 1/3 → 35, 2/3 → 65, 3/3 → 95
 * On évite les extrêmes (0 et 100) car une correction parfaite
 * ne garantit pas 100 de maîtrise, et une mauvaise ne détruit pas tout.
 */
function sur3versSur100(score: number): number {
  const mapping: Record<number, number> = { 0: 10, 1: 35, 2: 65, 3: 95 }
  return mapping[Math.round(score)] ?? Math.round((score / 3) * 85 + 10)
}

/**
 * Récupère les compétences actuelles de l'utilisateur.
 * Retourne les valeurs par défaut si aucune ligne n'existe encore.
 */
async function getCompetencesActuelles(userId: string): Promise<{ data: Competences; exists: boolean }> {
  const supabase = getServerSupabase()
  const { data, error } = await supabase
    .from('competences')
    .select('lexique, syntaxe, cohesion, orthographe, comprehension, fluidite')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return { data: { ...VALEURS_DEFAUT }, exists: false }
  }

  return { data: data as Competences, exists: true }
}

/**
 * Sauvegarde les nouvelles compétences (upsert).
 */
async function sauvegarderCompetences(userId: string, competences: Competences): Promise<void> {
  const supabase = getServerSupabase()
  const { error } = await supabase
    .from('competences')
    .upsert(
      {
        user_id: userId,
        ...competences,
        last_updated: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (error) {
    console.error('[scoring] Erreur sauvegarde compétences:', error)
    throw new Error(`Erreur sauvegarde compétences: ${error.message}`)
  }
}

// ─── Fonctions publiques ──────────────────────────────────────────────────────

/**
 * MET À JOUR les compétences depuis une correction écrite TEF.
 *
 * Mapping scores_detail → axes radar :
 *   lexique       → lexique
 *   morphosyntaxe → syntaxe
 *   cohesion      → cohesion
 *   orthographe   → orthographe
 *   contenu       → contribue à cohesion (organisation des idées)
 *
 * L'axe "comprehension" n'est PAS touché par l'écrit (c'est la compréhension orale/écrite).
 * L'axe "fluidite" n'est PAS touché par l'écrit (c'est l'oral).
 */
export async function updateCompetencesFromEcrit(
  userId: string,
  scores: ScoresEcrit
): Promise<Competences> {
  const { data: actuel } = await getCompetencesActuelles(userId)

  // Conversion sur 100
  const nouveauLexique = sur3versSur100(scores.lexique)
  const nouveauSyntaxe = sur3versSur100(scores.morphosyntaxe)
  // cohesion = moyenne de cohesion + contenu (contenu = organisation = cohésion étendue)
  const scoresCohesion = (scores.cohesion + scores.contenu) / 2
  const nouveauCohesion = sur3versSur100(scoresCohesion)
  const nouveauOrthographe = sur3versSur100(scores.orthographe)

  const nouvelles: Competences = {
    lexique: moyenneMobile(actuel.lexique, nouveauLexique),
    syntaxe: moyenneMobile(actuel.syntaxe, nouveauSyntaxe),
    cohesion: moyenneMobile(actuel.cohesion, nouveauCohesion),
    orthographe: moyenneMobile(actuel.orthographe, nouveauOrthographe),
    // Ces deux axes ne sont pas impactés par l'écrit
    comprehension: actuel.comprehension,
    fluidite: actuel.fluidite,
  }

  await sauvegarderCompetences(userId, nouvelles)
  return nouvelles
}

/**
 * MET À JOUR les compétences depuis un résultat d'exercice Voltaire.
 *
 * Un seul exercice a peu d'impact (poids réduit à 5% au lieu de 20%).
 * L'effet s'accumule session après session.
 *
 * Mapping catégorie Voltaire → axes radar :
 *   grammaire   → syntaxe
 *   orthographe → orthographe
 *   syntaxe     → syntaxe
 *   vocabulaire → lexique
 */
export async function updateCompetencesFromVoltaire(
  userId: string,
  correct: boolean,
  categorie: CategorieVoltaire
): Promise<void> {
  const { data: actuel } = await getCompetencesActuelles(userId)

  // Score pour cet exercice : correct = 85, incorrect = 20
  // On n'utilise pas 100/0 pour éviter les effets de bord trop violents
  const scoreExercice = correct ? 85 : 20
  const POIDS_EXERCICE = 0.05 // Impact réduit : un exercice = petite mise à jour

  const nouvelles: Competences = { ...actuel }

  switch (categorie) {
    case 'grammaire':
    case 'syntaxe':
      nouvelles.syntaxe = moyenneMobile(actuel.syntaxe, scoreExercice, POIDS_EXERCICE)
      break
    case 'orthographe':
      nouvelles.orthographe = moyenneMobile(actuel.orthographe, scoreExercice, POIDS_EXERCICE)
      break
    case 'vocabulaire':
      nouvelles.lexique = moyenneMobile(actuel.lexique, scoreExercice, POIDS_EXERCICE)
      break
  }

  await sauvegarderCompetences(userId, nouvelles)
}

/**
 * MET À JOUR les compétences depuis un scoring de session orale.
 *
 * Appelé en fin de session coach oral, avec les scores extraits par GPT.
 *
 * Mapping :
 *   fluidite → fluidite
 *   lexique  → lexique (contribution partielle : 50/50 avec l'écrit)
 *   cohesion → cohesion (contribution partielle)
 */
export async function updateCompetencesFromOral(
  userId: string,
  scores: ScoresOral
): Promise<Competences> {
  const { data: actuel } = await getCompetencesActuelles(userId)

  // L'oral contribue à fluidité à 100%, et à lexique/cohésion à 50%
  // (ces axes reçoivent aussi les contributions de l'écrit)
  const POIDS_ORAL_FLUIDITE = 0.25 // L'oral est la seule source de fluidité → poids plus fort
  const POIDS_ORAL_PARTAGE = 0.10  // Axes partagés avec l'écrit → poids réduit

  const nouvelles: Competences = {
    lexique: moyenneMobile(actuel.lexique, scores.lexique, POIDS_ORAL_PARTAGE),
    syntaxe: actuel.syntaxe, // L'oral ne touche pas la syntaxe écrite
    cohesion: moyenneMobile(actuel.cohesion, scores.cohesion, POIDS_ORAL_PARTAGE),
    orthographe: actuel.orthographe, // L'oral ne touche pas l'orthographe
    comprehension: actuel.comprehension, // Source future : exercices de compréhension
    fluidite: moyenneMobile(actuel.fluidite, scores.fluidite, POIDS_ORAL_FLUIDITE),
  }

  await sauvegarderCompetences(userId, nouvelles)
  return nouvelles
}

/**
 * Recalcule les compétences depuis TOUT l'historique d'un utilisateur.
 * À appeler via un endpoint admin ou une migration ponctuelle pour
 * rétroactivement corriger les données existantes.
 *
 * Ordre : corrections écrits (chronologique) → exercices Voltaire → sessions orales
 */
export async function recalculerCompetencesDepuisHistorique(userId: string): Promise<Competences> {
  const supabase = getServerSupabase()

  // Réinitialiser aux valeurs par défaut
  let competences: Competences = { ...VALEURS_DEFAUT }
  await sauvegarderCompetences(userId, competences)

  // 1. Corrections écrites (ordre chronologique)
  const { data: corrections } = await supabase
    .from('corrections')
    .select('scores_detail, created_at')
    .eq('user_id', userId)
    .not('scores_detail', 'eq', '{}')
    .order('created_at', { ascending: true })

  for (const correction of corrections || []) {
    const s = correction.scores_detail as ScoresEcrit
    if (s && s.lexique !== undefined) {
      competences = await updateCompetencesFromEcrit(userId, s)
    }
  }

  // 2. Exercices Voltaire (ordre chronologique)
  const { data: resultatsVoltaire } = await supabase
    .from('user_exercice_results')
    .select('reponse_correcte, exercice_id, created_at, exercices(categorie)')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  for (const r of resultatsVoltaire || []) {
    const categorie = (r as any).exercices?.categorie as CategorieVoltaire
    if (categorie) {
      await updateCompetencesFromVoltaire(userId, r.reponse_correcte, categorie)
    }
  }

  // Relire les compétences finales
  const final = await getCompetencesActuelles(userId)
  return final.data ?? competences
}
