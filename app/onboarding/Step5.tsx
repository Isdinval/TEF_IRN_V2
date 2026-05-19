'use client';

import { Button } from '@/components/layout/ui/button';

export default function OnboardingStep5({ data, complete, prev, loading }: any) {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-heading font-semibold mb-6">Parfait {data.firstName} ! 🎉</h1>
      <p className="text-2xl text-[var(--color-muted)] mb-12">
        Nous avons tout ce qu’il faut pour créer ton parcours personnalisé.
      </p>

      <div className="bg-[var(--color-background)] rounded-2xl p-8 text-left mb-12 space-y-6">
        <div><strong>Objectif :</strong> {data.goal}</div>
        {data.examDate && (
          <div><strong>Date cible :</strong> {new Date(data.examDate).toLocaleDateString('fr-FR')}</div>
        )}
        <div><strong>Temps par semaine :</strong> {data.weeklyHours} heures</div>
        <div><strong>Niveau estimé :</strong> {Object.values(data.currentLevel).join(' / ')}</div>
      </div>

      <p className="italic text-lg mb-12 text-[var(--color-muted)]">
        Ton parcours est prêt. Tu vas progresser plus vite que tu ne l’imagines.
      </p>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prev}>Modifier</Button>
        <Button 
          onClick={complete} 
          disabled={loading}
          className="px-12 py-7 text-lg"
        >
          {loading ? "Création de ton parcours..." : "Accéder à mon tableau de bord"}
        </Button>
      </div>
    </div>
  );
}
