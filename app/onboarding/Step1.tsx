'use client';

import { Button } from '@/components/layout/ui/button';
import { Input } from '@/components/layout/ui/input';

export default function OnboardingStep1({ data, updateData, next }: any) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-8 h-24 w-24 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-3xl flex items-center justify-center">
        <span className="text-5xl">🇫🇷</span>
      </div>

      <h1 className="text-5xl font-heading font-semibold tracking-tight mb-4">
        Bienvenue chez l’Académie Moderne
      </h1>
      <p className="text-2xl text-[var(--color-muted)] mb-10">
        Nous allons créer ensemble ton parcours vers la réussite au TEF IRN.
      </p>

      <div className="max-w-sm mx-auto">
        <p className="text-left mb-2 font-medium">Comment dois-je t’appeler ?</p>
        <Input
          type="text"
          placeholder="Ton prénom"
          value={data.firstName}
          onChange={(e) => updateData({ firstName: e.target.value })}
          className="text-lg py-6 rounded-2xl"
        />
      </div>

      <Button 
        onClick={next} 
        disabled={!data.firstName.trim()}
        className="mt-12 w-full py-7 text-lg rounded-2xl"
      >
        Commencer mon parcours
      </Button>
    </div>
  );
}
