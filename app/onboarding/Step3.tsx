'use client';

import { Button } from '@/components/layout/ui/button';

const skills = [
  { key: 'listening', label: 'Compréhension orale' },
  { key: 'reading', label: 'Compréhension écrite' },
  { key: 'writing', label: 'Expression écrite' },
  { key: 'speaking', label: 'Expression orale' },
];

const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];

export default function OnboardingStep3({ data, updateData, next, prev }: any) {
  const updateLevel = (skillKey: string, level: string) => {
    updateData({
      currentLevel: { ...data.currentLevel, [skillKey]: level }
    });
  };

  const isComplete = Object.keys(data.currentLevel).length === 4;

  return (
    <div>
      <h1 className="text-4xl font-heading font-semibold mb-3">Quel est ton niveau actuel ?</h1>
      <p className="text-[var(--color-muted)] mb-10">
        Sois honnête. Cela nous permettra d’adapter la difficulté et de mesurer ta progression.
      </p>

      <div className="space-y-8">
        {skills.map((skill) => (
          <div key={skill.key}>
            <label className="block font-medium mb-3">{skill.label}</label>
            <div className="flex flex-wrap gap-3">
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => updateLevel(skill.key, level)}
                  className={`px-6 py-3 rounded-2xl border transition-all ${
                    data.currentLevel[skill.key] === level
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                      : 'border-[var(--color-muted)]/30 hover:border-[var(--color-primary)]/50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-12">
        <Button variant="outline" onClick={prev}>Retour</Button>
        <Button onClick={next} disabled={!isComplete}>Continuer</Button>
      </div>
    </div>
  );
}
