/**
 * Calcule le niveau CECRL estimé basé sur les compétences et les résultats d'exercices
 *
 * @param competences - Objet contenant les scores des 6 compétences (0-100)
 * @param exerciceResults - Tableau des résultats d'exercices (optionnel)
 * @param corrections - Tableau des corrections avec niveau_cefr (optionnel)
 * @returns Niveau CECRL estimé (A1, A2, B1, B2)
 */
export function calculateNiveauEstime(
  competences: { lexique: number; syntaxe: number; cohesion: number; orthographe: number; comprehension: number; fluidite: number } | null,
  exerciceResults?: { reponse_correcte: boolean }[],
  corrections?: { niveau_cefr: string }[]
): string {
  // Si aucune donnée, retourner A2 par défaut
  if (!competences && (!exerciceResults || exerciceResults.length === 0) && (!corrections || corrections.length === 0)) {
    return 'A2'
  }

  let totalScore = 0
  let weightCount = 0

  // 1. Score basé sur les compétences (poids: 50%)
  if (competences) {
    const avgCompetences = (
      competences.lexique +
      competences.syntaxe +
      competences.cohesion +
      competences.orthographe +
      competences.comprehension +
      competences.fluidite
    ) / 6

    // Convertir la moyenne (0-100) en score CECRL
    // A1: 0-25, A2: 25-50, B1: 50-75, B2: 75-100
    const competenceScore = avgCompetences
    totalScore += competenceScore * 0.5
    weightCount += 0.5
  }

  // 2. Score basé sur les exercices Voltaire (poids: 25%)
  if (exerciceResults && exerciceResults.length > 0) {
    const correctCount = exerciceResults.filter(r => r.reponse_correcte).length
    const exercicePct = (correctCount / exerciceResults.length) * 100
    totalScore += exercicePct * 0.25
    weightCount += 0.25
  }

  // 3. Score basé sur les corrections d'expression écrite (poids: 25%)
  if (corrections && corrections.length > 0) {
    const cecrlScores: Record<string, number> = { 'A1': 25, 'A2': 50, 'B1': 75, 'B2': 100 }
    let totalCecrl = 0
    corrections.forEach(c => {
      totalCecrl += cecrlScores[c.niveau_cefr] || 50 // default A2 si inconnu
    })
    const avgCecrl = totalCecrl / corrections.length
    totalScore += avgCecrl * 0.25
    weightCount += 0.25
  }

  // Normaliser le score si tous les poids ne sont pas utilisés
  const normalizedScore = weightCount > 0 ? totalScore / weightCount : 50

  // Convertir le score en niveau CECRL
  if (normalizedScore < 25) return 'A1'
  if (normalizedScore < 50) return 'A2'
  if (normalizedScore < 75) return 'B1'
  return 'B2'
}

/**
 * Convertit un niveau CECRL en description textuelle
 */
export function getNiveauDescription(niveau: string): string {
  const descriptions: Record<string, string> = {
    'A1': 'Niveau introductif ou de découverte',
    'A2': 'Niveau intermédiaire ou de survie',
    'B1': 'Niveau seuil ou indépendant',
    'B2': 'Niveau avancé ou indépendant',
  }
  return descriptions[niveau] || 'Niveau non déterminé'
}

/**
 * Calcule la progression vers le niveau supérieur
 * @param niveauActuel - Niveau CECRL actuel
 * @param score - Score moyen (0-100)
 * @returns Pourcentage de progression (0-100)
 */
export function getProgressionVersNiveauSuperieur(niveauActuel: string, score: number): number {
  const niveaux: Record<string, number> = { 'A1': 0, 'A2': 25, 'B1': 50, 'B2': 75 }
  const niveauThreshold = niveaux[niveauActuel] || 25
  const nextThreshold = niveauActuel === 'B2' ? 100 : (niveaux[niveauActuel] || 25) + 25

  if (score <= niveauThreshold) return 0
  if (score >= nextThreshold) return 100

  return Math.round(((score - niveauThreshold) / (nextThreshold - niveauThreshold)) * 100)
}
