// lib/categories.ts
export const categoriesConfig = {
  Fondamentaux: {
    label: "Fondamentaux & Grammaire",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    icon: "📘",
    priority: 1,
  },
  Vocabulaire: {
    label: "Vocabulaire & Lexique",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    icon: "📝",
    priority: 2,
  },
  Ecrit: {
    label: "Expression Écrite",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    icon: "✍️",
    priority: 3,
  },
  Oral: {
    label: "Expression Orale",
    color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    icon: "🗣️",
    priority: 4,
  },
  Compréhension: {
    label: "Compréhension",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    icon: "👂",
    priority: 5,
  },
  Entrainement: {
    label: "Entraînement & Simulations",
    color: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    icon: "🎯",
    priority: 6,
  },
} as const;

export type CategoryKey = keyof typeof categoriesConfig;
