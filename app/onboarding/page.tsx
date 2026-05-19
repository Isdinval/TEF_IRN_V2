'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import OnboardingStep1 from '@/app/onboarding/Step1';
import OnboardingStep2 from '@/app/onboarding/Step2';
import OnboardingStep3 from '@/app/onboarding/Step3';
import OnboardingStep4 from '@/app/onboarding/Step4';
import OnboardingStep5 from '@/app/onboarding/Step5';
import ProgressBar from '@/app/onboarding/ProgressBar';

interface OnboardingData {
  firstName: string;
  goal: string;
  examDate: string | null;
  currentLevel: Record<string, string>;
  weeklyHours: number;
  preferredDays: string[];
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    firstName: '',
    goal: '',
    examDate: null,
    currentLevel: {},
    weeklyHours: 5,
    preferredDays: [],
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const bootstrap = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, goal, target_exam_date, weekly_hours, preferred_days, onboarding_completed')
        .eq('id', user.id)
        .single();

      if (profile?.onboarding_completed) {
        router.replace('/dashboard');
        return;
      }

      setData((prev) => ({
        ...prev,
        firstName: profile?.first_name ?? prev.firstName,
        goal: profile?.goal ?? prev.goal,
        examDate: profile?.target_exam_date ?? prev.examDate,
        weeklyHours: profile?.weekly_hours ?? prev.weeklyHours,
        preferredDays: profile?.preferred_days ?? prev.preferredDays,
      }));
      setInitialLoading(false);
    };

    bootstrap();
  }, [router, supabase]);

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const completeOnboarding = async () => {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      setError('Session expirée. Merci de vous reconnecter.');
      router.replace('/auth');
      return;
    }

    const { error: updateError } = await supabase.from('profiles').update({
      first_name: data.firstName,
      goal: data.goal,
      target_exam_date: data.examDate,
      weekly_hours: data.weeklyHours,
      preferred_days: data.preferredDays,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);

    if (updateError) {
      setError("Impossible d'enregistrer votre onboarding pour le moment. Réessayez.");
      setLoading(false);
      return;
    }

    router.push('/dashboard?welcome=true');
  };

  if (initialLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <ProgressBar currentStep={step} totalSteps={5} />

        <div className="mt-12 bg-white rounded-3xl shadow-xl p-10 md:p-16 border border-[var(--color-muted)]/20">
          {error && <p className="mb-6 text-sm text-red-500">{error}</p>}
          {step === 1 && <OnboardingStep1 data={data} updateData={updateData} next={nextStep} />}
          {step === 2 && <OnboardingStep2 data={data} updateData={updateData} next={nextStep} prev={prevStep} />}
          {step === 3 && <OnboardingStep3 data={data} updateData={updateData} next={nextStep} prev={prevStep} />}
          {step === 4 && <OnboardingStep4 data={data} updateData={updateData} next={nextStep} prev={prevStep} />}
          {step === 5 && <OnboardingStep5 data={data} complete={completeOnboarding} prev={prevStep} loading={loading} />}
        </div>
      </div>
    </div>
  );
}
