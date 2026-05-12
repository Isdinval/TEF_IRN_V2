# 🎓 L'Académie Moderne — Guide de démarrage rapide

## Étape 1 — Extraire et installer

```bash
unzip academie-moderne.zip
cd academie-moderne
npm install
```

## Étape 2 — Supabase

1. Créez un compte sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Dans **SQL Editor**, copiez-collez le contenu de `supabase-schema.sql` et exécutez-le
4. Récupérez vos clés dans **Settings → API**

## Étape 3 — OpenAI

1. Créez un compte sur [platform.openai.com](https://platform.openai.com)
2. Générez une clé API

## Étape 4 — Variables d'environnement

Créez le fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-proj-...
```

## Étape 5 — Lancer

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

---

## Architecture complète

```
7 pages :
✅ /auth           → Connexion / Inscription (Supabase Auth)
✅ /dashboard      → Tableau de bord avec stats
✅ /bibliotheque   → Bibliothèque de modules filtrée
✅ /ecriture       → Éditeur expression écrite avec auto-save
✅ /corrections    → Liste de vos soumissions
✅ /corrections/[id] → Correction IA détaillée (GPT-4o-mini)
✅ /exercices      → Exercices interactifs style Voltaire
✅ /coach-oral     → Simulateur oral IA (GPT-4o-mini)
✅ /radar          → Radar de compétences CECRL SVG

2 routes API :
✅ POST /api/correct  → Correction GPT-4o-mini
✅ POST /api/coach    → Coach conversationnel GPT-4o-mini

9 tables Supabase :
✅ profiles, modules, user_module_progress
✅ soumissions, corrections, exercices
✅ user_exercice_results, conversations_coach, competences
```

## Déploiement sur Vercel

```bash
npm install -g vercel
vercel deploy
```

Ajoutez les 4 variables d'environnement dans les Settings Vercel.
