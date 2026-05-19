'use client';

import { Button } from '@/components/layout/ui/button';
import { Calendar } from '@/components/layout/ui/calendar';

export default function OnboardingStep2({ data, updateData, next, prev }: any) {
  const goals = [
    "Obtenir la nationalité française",
    "Carte de résident longue durée",
    "Demande OFII",
    "Améliorer mon français professionnel",
    "Autre",
  ];

  return (
    <div>
      <h1 className="text-4xl font-heading font-semibold mb-3">Quel est ton objectif principal ?</h1>
      <p className="text-[var(--color-muted)] mb-10">Cela nous permettra d’adapter parfaitement ton parcours.</p>

      <div className="space-y-3 mb-10">
        {goals.map((goal) => (
          <button
            key={goal}
            onClick={() => updateData({ goal })}
            className={`w-full text-left p-5 rounded-2xl border transition-all ${
              data.goal === goal 
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' 
                : 'border-[var(--color-muted)]/30 hover:border-[var(--color-primary)]/50'
            }`}
          >
            {goal}
          </button>
        ))}
      </div>

      {data.goal && (
        <div className="mb-10">
          <p className="mb-3 font-medium">Quelle est ta date cible d’examen ?</p>
          <Calendar
            mode="single"
            selected={data.examDate ? new Date(data.examDate) : undefined}
            onSelect={(date) => updateData({ examDate: date?.toISOString() })}
            className="rounded-xl border"
          />
        </div>
      )}

      <div className="flex justify-between mt-12">
        <Button variant="outline" onClick={prev}>Retour</Button>
        <Button onClick={next} disabled={!data.goal}>Continuer</Button>
      </div>
    </div>
  );
}
