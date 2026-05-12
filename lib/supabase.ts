import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = { id: string; full_name: string | null; email: string | null; niveau_estime: string; created_at: string }
export type Module = { id: string; titre: string; description: string | null; categorie: 'Grammaire' | 'Vocabulaire' | 'Culture' | 'Méthodologie'; chapitre: string | null; duree_minutes: number; ordre: number }
export type UserModuleProgress = { module_id: string; statut: 'non_commence' | 'en_cours' | 'complete'; score?: number }
export type Soumission = { id: string; user_id: string; module_id?: string; titre?: string; prompt_texte?: string; texte_soumis: string; mot_count?: number; statut: 'brouillon' | 'soumis' | 'corrige'; created_at: string; updated_at: string }
export type Correction = { id: string; soumission_id: string; note_globale: number; note_max: number; niveau_cefr: string; erreurs: Array<{ categorie: string; original: string; corrige: string; explication: string }>; resume_feedback: string; texte_annote: string }
export type Exercice = { id: string; categorie: string; phrase: string; mots: string[]; mot_erreur_index: number | null; explication: string; correction: string }
export type Message = { role: 'examiner' | 'user'; content: string; timestamp: string }
export type Competences = { lexique: number; syntaxe: number; cohesion: number; orthographe: number; comprehension: number; fluidite: number }
