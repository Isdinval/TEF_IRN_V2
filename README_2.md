# L'Académie Moderne — TEF IRN Preparation Platform

Plateforme institutionnelle de préparation au TEF IRN (Test d'Évaluation de Français pour la Nationalité Française).

## Stack

- **Frontend / Framework** : Next.js 15 (App Router) + TypeScript
- **Styling** : Tailwind CSS v4 + CSS variables (design system "Institutional Archive")
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth
- **IA Correction** : OpenAI GPT-4o-mini
- **IA Coach Oral** : OpenAI GPT-4o-mini (conversation multi-tours)

---

## Installation

### 1. Cloner et installer les dépendances

```bash
npm install
```

### 2. Configurer les variables d'environnement

Copiez le fichier exemple et remplissez vos clés :

```bash
cp .env.local.example .env.local
```

Éditez `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
OPENAI_API_KEY=sk-...
```

### 3. Configurer Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Allez dans **SQL Editor** dans votre tableau de bord Supabase
3. Copiez-collez et exécutez le contenu de `supabase-schema.sql`
4. Cela crée toutes les tables, politiques RLS, et données seed

### 4. Lancer en développement

```bash
npm run dev
```

L'application est accessible sur `http://localhost:3000`

---

## Architecture

```
app/
├── auth/              # Page de connexion / inscription
├── dashboard/         # Tableau de bord principal
├── bibliotheque/      # Bibliothèque des modules (leçons)
├── ecriture/          # Éditeur expression écrite
├── corrections/       # Liste des soumissions
│   └── [id]/          # Correction détaillée (IA)
├── exercices/         # Exercices interactifs style Voltaire
├── coach-oral/        # Simulateur conversation orale (IA)
├── radar/             # Radar de compétences CECRL
└── api/
    ├── correct/       # POST /api/correct → GPT-4o-mini correction
    └── coach/         # POST /api/coach   → GPT-4o-mini conversation

components/
├── layout/
│   ├── Sidebar.tsx    # Navigation 250px fixe
│   └── AppLayout.tsx  # Shell avec auth guard

lib/
├── supabase.ts        # Client Supabase + types TypeScript
└── auth-context.tsx   # Context React pour l'authentification
```

## Schéma de base de données

| Table | Description |
|-------|-------------|
| `profiles` | Profils utilisateurs (étend auth.users) |
| `modules` | Modules du curriculum (leçons) |
| `user_module_progress` | Progression par module |
| `soumissions` | Textes soumis pour correction |
| `corrections` | Résultats IA de correction |
| `exercices` | Exercices interactifs |
| `user_exercice_results` | Résultats des exercices |
| `conversations_coach` | Historique des sessions Coach Oral |
| `competences` | Scores CECRL par compétence |

## Flux principaux

### Correction Expression Écrite
1. `/ecriture` → Rédaction + sauvegarde brouillon auto
2. Clic "Soumettre" → Redirection `/corrections/[id]`
3. `/api/correct` appelé avec le texte → GPT-4o-mini analyse
4. Résultat sauvegardé dans `corrections` table
5. Affichage split-screen : texte annoté + erreurs détaillées

### Coach Oral
1. `/coach-oral` → Session initialisée
2. `/api/coach` → GPT-4o-mini joue le rôle d'examinateur
3. Conversation multi-tours sauvegardée dans Supabase
4. Suggestions de vocabulaire en temps réel

## Déploiement

### Vercel (recommandé)
```bash
npm run build
vercel deploy
```
Ajoutez les variables d'environnement dans les settings Vercel.

### Autre hébergeur Node.js
```bash
npm run build
npm start
```

---

## Fonctionnalités

- ✅ Authentification Supabase (inscription / connexion)
- ✅ Dashboard avec stats et progression
- ✅ Bibliothèque de modules avec filtres par catégorie
- ✅ Éditeur expression écrite avec auto-save
- ✅ Correction IA (GPT-4o-mini) avec annotations inline
- ✅ Exercices interactifs style Voltaire
- ✅ Coach oral IA avec conversation multi-tours
- ✅ Radar de compétences CECRL (SVG)
- ✅ Design system "Institutional Archive" complet
- ✅ RLS Supabase (sécurité par utilisateur)

## Variables d'environnement requises

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service Supabase (pour admin) |
| `OPENAI_API_KEY` | Clé API OpenAI |
