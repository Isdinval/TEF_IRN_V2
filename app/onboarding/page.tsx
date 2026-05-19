'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import OnboardingStep1 from '@/components/onboarding/Step1';
import OnboardingStep2 from '@/components/onboarding/Step2';
import OnboardingStep3 from '@/components/onboarding/Step3';
import OnboardingStep4 from '@/components/onboarding/Step4';
import OnboardingStep5 from '@/components/onboarding/Step5';
import ProgressBar from '@/components/onboarding/ProgressBar';

interface OnboardingData {
  firstName: string;
  goal: string;
  examDate: string | null;
  currentLevel: any;
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

  const router = useRouter();
  const supabase = createClient();

  const updateData = (newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const completeOnboarding = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Mise à jour du profil
      await supabase.from('profiles').update({
        first_name: data.firstName,
        goal: data.goal,
        target_exam_date: data.examDate,
        weekly_hours: data.weeklyHours,
        preferred_days: data.preferredDays,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id);

      // Initialiser le radar de compétences
      // ... (appel à une fonction d'initialisation)
    }

    router.push('/dashboard?welcome=true');
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <ProgressBar currentStep={step} totalSteps={5} />

        <div className="mt-12 bg-white rounded-3xl shadow-xl p-10 md:p-16 border border-[var(--color-muted)]/20">
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
