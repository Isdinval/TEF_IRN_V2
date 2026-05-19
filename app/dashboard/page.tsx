'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, Competences, Profile } from '@/lib/supabase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type CorrectionPreview = {
  id: string;
  titre?: string | null;
  updated_at: string;
  corrections?: { note_globale: number; niveau_cefr: string }[];
};

type RecommendedActivity = {
  title: string;
  subtitle: string;
  href: string;
};

const competenceLabels: Record<keyof Competences, string> = {
  lexique: 'Lexique',
  syntaxe: 'Syntaxe',
  cohesion: 'Cohésion',
  orthographe: 'Orthographe',
  comprehension: 'Compréhension',
  fluidite: 'Fluidité',
};

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [welcome, setWelcome] = useState(false);
  const [loading, setLoading] = useState(true);
  const [streakDays, setStreakDays] = useState(0);
  const [competences, setCompetences] = useState<Competences | null>(null);
  const [recentCorrections, setRecentCorrections] = useState<CorrectionPreview[]>([]);
  const [competencesUpdated, setCompetencesUpdated] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      const [profileRes, competencesRes, soumissionsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('competences').select('*').eq('user_id', user.id).single(),
        supabase
          .from('soumissions')
          .select('id, titre, updated_at, corrections(note_globale, niveau_cefr)')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(3),
      ]);

      setProfile(profileRes.data);
      setCompetences(competencesRes.data ?? null);
      setRecentCorrections((soumissionsRes.data as CorrectionPreview[]) || []);

      const days = new Set(
        ((soumissionsRes.data as CorrectionPreview[]) || []).map((s) =>
          new Date(s.updated_at).toISOString().slice(0, 10)
        )
      );
      setStreakDays(days.size);

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('competences') === 'updated' || window.localStorage.getItem('competences_updated') === '1') {
          setCompetencesUpdated(true);
          window.localStorage.removeItem('competences_updated');
          setTimeout(() => setCompetencesUpdated(false), 6000);
        }
      }

      if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('welcome') === 'true') {
        setWelcome(true);
        setTimeout(() => setWelcome(false), 6000);
      }

      setLoading(false);
    };

    fetchDashboard();
  }, [router, supabase]);

  const weakestAxe = useMemo(() => {
    if (!competences) return null;
    const entries = Object.entries(competences)
      .filter(([k]) => Object.keys(competenceLabels).includes(k)) as [keyof Competences, number][];
    if (entries.length === 0) return null;
    entries.sort((a, b) => a[1] - b[1]);
    return entries[0][0];
  }, [competences]);

  const recommendedActivity: RecommendedActivity = useMemo(() => {
    if (!weakestAxe) {
      return {
        title: 'Compléter votre premier diagnostic',
        subtitle: 'Passez une rédaction pour générer vos premières recommandations personnalisées.',
        href: '/ecriture',
      };
    }

    if (weakestAxe === 'orthographe' || weakestAxe === 'syntaxe') {
      return {
        title: 'Renforcer grammaire & syntaxe',
        subtitle: `Axe prioritaire détecté : ${competenceLabels[weakestAxe]}.`,
        href: '/exercices',
      };
    }

    if (weakestAxe === 'fluidite' || weakestAxe === 'comprehension') {
      return {
        title: 'Simulation orale ciblée',
        subtitle: `Axe prioritaire détecté : ${competenceLabels[weakestAxe]}.`,
        href: '/coach-oral',
      };
    }

    return {
      title: 'Nouvelle expression écrite guidée',
      subtitle: `Axe prioritaire détecté : ${competenceLabels[weakestAxe]}.`,
      href: '/ecriture',
    };
  }, [weakestAxe]);

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
      <div className="border-b border-[var(--color-muted)]/20 bg-white/70 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-heading font-semibold">Bonjour {profile.first_name} 👋</h1>
            <p className="text-[var(--color-muted)]">Prêt à progresser aujourd’hui ?</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/profil"><Button variant="outline" className="rounded-2xl">Mon profil</Button></Link>
            <Link href="/coach-oral"><Button className="rounded-2xl bg-[var(--color-primary)]">Coach Oral</Button></Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-10">
        {competencesUpdated && (
          <div className="mb-6 bg-blue-600 text-white rounded-2xl px-6 py-4">
            ✅ Compétences mises à jour à partir de votre dernière activité.
          </div>
        )}

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
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-[var(--color-muted)]/20">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-heading font-semibold">Ton Radar de Compétences</h2>
              <Link href="/radar" className="text-[var(--color-primary)] hover:underline text-sm font-medium">Voir le détail →</Link>
            </div>
            {competences ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(Object.keys(competenceLabels) as (keyof Competences)[]).map((key) => (
                  <div key={key} className="rounded-2xl border border-[var(--color-muted)]/20 p-4">
                    <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide">{competenceLabels[key]}</p>
                    <p className="text-2xl font-semibold mt-1">{competences[key]}%</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center border-2 border-dashed border-[var(--color-muted)] rounded-2xl">
                <p className="text-[var(--color-muted)] text-center">Aucune donnée radar pour le moment.</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-3xl p-8 border border-[var(--color-muted)]/20">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🔥</div>
                <div>
                  <div className="text-5xl font-heading font-semibold text-orange-500">{streakDays}</div>
                  <p className="text-sm text-[var(--color-muted)]">jours actifs récents</p>
                </div>
              </div>
              <p className="mt-6 text-sm">Maintiens ton rythme quotidien pour consolider ton niveau TEF IRN.</p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-[var(--color-muted)]/20">
              <h3 className="font-semibold mb-4 text-lg">🎯 Prochaine séance recommandée</h3>
              <div className="p-5 bg-[var(--color-background)] rounded-2xl">
                <p className="font-medium">{recommendedActivity.title}</p>
                <p className="text-sm text-[var(--color-muted)] mt-1">{recommendedActivity.subtitle}</p>
              </div>
              <Link href={recommendedActivity.href}><Button className="w-full mt-6 rounded-2xl py-6">Commencer maintenant</Button></Link>
            </div>
          </div>

          <div className="lg:col-span-12 mt-6">
            <h3 className="font-semibold text-xl mb-6">Dernières corrections</h3>
            <div className="bg-white rounded-3xl p-8 border border-[var(--color-muted)]/20">
              {recentCorrections.length === 0 ? (
                <p className="text-[var(--color-muted)] text-center py-12">Aucune correction récente. Commence une nouvelle rédaction pour voir tes progrès ici.</p>
              ) : (
                <div className="space-y-4">
                  {recentCorrections.map((s) => (
                    <Link href={`/corrections/${s.id}`} key={s.id} className="block rounded-2xl border border-[var(--color-muted)]/20 p-4 hover:bg-[var(--color-background)] transition">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">{s.titre || 'Expression écrite'}</p>
                          <p className="text-sm text-[var(--color-muted)]">{new Date(s.updated_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[var(--color-primary)]">{s.corrections?.[0]?.note_globale ?? '-'} / 15</p>
                          <p className="text-xs text-[var(--color-muted)]">{s.corrections?.[0]?.niveau_cefr ?? 'En cours'}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
