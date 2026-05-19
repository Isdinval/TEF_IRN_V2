'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Profile } from '@/lib/supabase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [welcome, setWelcome] = useState(false);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchProfileAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('welcome') === 'true') {
        setWelcome(true);
        setTimeout(() => setWelcome(false), 6000);
      }

      setLoading(false);
    };

    fetchProfileAndData();
  }, [router]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Chargement de ton tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-12">
      {/* Header */}
      <div className="border-b border-[var(--color-muted)]/20 bg-white/70 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-heading font-semibold">
              Bonjour {profile.first_name} 👋
            </h1>
            <p className="text-[var(--color-muted)]">Prêt à progresser aujourd’hui ?</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/profil">
              <Button variant="outline" className="rounded-2xl">
                Mon profil
              </Button>
            </Link>
            <Link href="/coach-oral">
              <Button className="rounded-2xl bg-[var(--color-primary)]">Coach Oral</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-10">
        {/* Welcome Banner */}
        {welcome && (
          <div className="mb-10 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-3xl p-8 flex items-center gap-6 shadow-xl">
            <div className="text-5xl">🎉</div>
            <div>
              <h2 className="text-2xl font-semibold">Bienvenue dans ton parcours personnalisé !</h2>
              <p className="opacity-90">Nous avons préparé un plan adapté à tes objectifs et ton niveau.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Radar de Compétences - Colonne principale */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-[var(--color-muted)]/20">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-heading font-semibold">Ton Radar de Compétences</h2>
              <Link href="/radar" className="text-[var(--color-primary)] hover:underline text-sm font-medium">
                Voir le détail →
              </Link>
            </div>
            
            <div className="h-80 flex items-center justify-center border-2 border-dashed border-[var(--color-muted)] rounded-2xl">
              <div className="text-center">
                <p className="text-[var(--color-muted)]">Composant Radar CECRL à intégrer ici</p>
                <p className="text-sm mt-2">(SVG interactif ou graphique)</p>
              </div>
            </div>
          </div>

          {/* Prochaines actions & Streak */}
          <div className="lg:col-span-5 space-y-8">
            {/* Streak Card */}
            <div className="bg-white rounded-3xl p-8 border border-[var(--color-muted)]/20">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🔥</div>
                <div>
                  <div className="text-5xl font-heading font-semibold text-orange-500">7</div>
                  <p className="text-sm text-[var(--color-muted)]">jours de streak</p>
                </div>
              </div>
              <p className="mt-6 text-sm">Ne perds pas ta dynamique ! Reviens demain pour maintenir ta série.</p>
            </div>

            {/* Prochaine activité recommandée */}
            <div className="bg-white rounded-3xl p-8 border border-[var(--color-muted)]/20">
              <h3 className="font-semibold mb-4 text-lg">🎯 Prochaine séance recommandée</h3>
              <div className="p-5 bg-[var(--color-background)] rounded-2xl">
                <p className="font-medium">Expression écrite - Sujet : Lettre formelle</p>
                <p className="text-sm text-[var(--color-muted)] mt-1">15-20 minutes • Niveau B1</p>
              </div>
              <Link href="/ecriture">
                <Button className="w-full mt-6 rounded-2xl py-6">Commencer maintenant</Button>
              </Link>
            </div>
          </div>

          {/* Quick Access */}
          <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link href="/ecriture" className="group">
              <div className="bg-white hover:bg-[var(--color-primary)] hover:text-white transition-all rounded-3xl p-8 border border-[var(--color-muted)]/20 h-full">
                <div className="text-4xl mb-4">✍️</div>
                <h4 className="font-semibold text-xl">Expression Écrite</h4>
                <p className="text-sm opacity-70 mt-2">Corrections IA notées</p>
              </div>
            </Link>

            <Link href="/coach-oral" className="group">
              <div className="bg-white hover:bg-[var(--color-primary)] hover:text-white transition-all rounded-3xl p-8 border border-[var(--color-muted)]/20 h-full">
                <div className="text-4xl mb-4">🎤</div>
                <h4 className="font-semibold text-xl">Coach Oral</h4>
                <p className="text-sm opacity-70 mt-2">Entraînement conversation</p>
              </div>
            </Link>

            <Link href="/bibliotheque" className="group">
              <div className="bg-white hover:bg-[var(--color-primary)] hover:text-white transition-all rounded-3xl p-8 border border-[var(--color-muted)]/20 h-full">
                <div className="text-4xl mb-4">📚</div>
                <h4 className="font-semibold text-xl">Bibliothèque</h4>
                <p className="text-sm opacity-70 mt-2">Modules &amp; exercices</p>
              </div>
            </Link>

            <Link href="/exercices" className="group">
              <div className="bg-white hover:bg-[var(--color-primary)] hover:text-white transition-all rounded-3xl p-8 border border-[var(--color-muted)]/20 h-full">
                <div className="text-4xl mb-4">⚡</div>
                <h4 className="font-semibold text-xl">Exercices rapides</h4>
                <p className="text-sm opacity-70 mt-2">Entraînement intensif</p>
              </div>
            </Link>
          </div>

          {/* Dernières corrections */}
          <div className="lg:col-span-12 mt-6">
            <h3 className="font-semibold text-xl mb-6">Dernières corrections</h3>
            <div className="bg-white rounded-3xl p-8 border border-[var(--color-muted)]/20">
              <p className="text-[var(--color-muted)] text-center py-12">
                Aucune correction récente. Commence une nouvelle rédaction pour voir tes progrès ici.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
