'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const resolveAuthCallback = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/auth');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      router.replace(profile?.onboarding_completed ? '/dashboard' : '/onboarding');
    };

    resolveAuthCallback();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <p className="text-[var(--color-muted)]">Validation de votre connexion...</p>
    </div>
  );
}
