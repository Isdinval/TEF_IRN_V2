'use client';

import { Button } from '@/components/layout/ui/button';
import { Slider } from '@/components/layout/ui/slider';

const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function OnboardingStep4({ data, updateData, next, prev }: any) {
  const toggleDay = (day: string) => {
    const current = data.preferredDays || [];
    if (current.includes(day)) {
      updateData({ preferredDays: current.filter((d: string) => d !== day) });
    } else {
      updateData({ preferredDays: [...current, day] });
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-heading font-semibold mb-3">Combien de temps peux-tu consacrer ?</h1>
      <p className="text-[var(--color-muted)] mb-10">Nous adapterons ton planning en conséquence.</p>

      <div className="mb-12">
        <label className="block text-lg font-medium mb-6">
          Heures par semaine : <span className="text-[var(--color-primary)]">{data.weeklyHours}h</span>
        </label>
        <Slider
          min={2}
          max={20}
          step={1}
          value={[data.weeklyHours]}
          onValueChange={(v) => updateData({ weeklyHours: v[0] })}
          className="w-full"
        />
      </div>

      <div>
        <p className="font-medium mb-4">Quels sont tes jours préférés ?</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={`p-4 rounded-2xl border transition-all ${
                data.preferredDays.includes(day)
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                  : 'border-[var(--color-muted)]/30 hover:border-[var(--color-primary)]/50'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-12">
        <Button variant="outline" onClick={prev}>Retour</Button>
        <Button onClick={next}>Continuer</Button>
      </div>
    </div>
  );
}
