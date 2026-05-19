'use client';

export default function ProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-8">
      <div className="flex justify-between text-sm mb-3 text-[var(--color-muted)]">
        <span>Étape {currentStep} sur {totalSteps}</span>
        <span>{Math.round(progress)}% complété</span>
      </div>
      <div className="h-1.5 bg-[var(--color-muted)]/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] transition-all duration-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
