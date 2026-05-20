'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppPage, AppPanel, PageErrorState } from '@/components/ui/app-page';
import { createClient, Competences, Profile } from '@/lib/supabase';
import { calculateNiveauEstime } from '@/lib/niveau-utils';

type CorrectionPreview = {
  id: string;
  titre?: string | null;
  updated_at: string;
  corrections?: { note_globale: number; niveau_cefr: string }[];
};

type CompetenceEntry = { key: keyof Competences; label: string; value: number };

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
  const [loading, setLoading] = useState(true);
  const [streakDays, setStreakDays] = useState(0);
  const [competences, setCompetences] = useState<Competences | null>(null);
  const [recentCorrections, setRecentCorrections] = useState<CorrectionPreview[]>([]);
  const [competencesUpdated, setCompetencesUpdated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

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
        .limit(5),
    ]);

    if (profileRes.error || soumissionsRes.error) {
      setError('Impossible de charger le dashboard pour le moment.');
      setLoading(false);
      return;
    }

    setProfile(profileRes.data);
    setCompetences(competencesRes.data ?? null);
    const submissions = (soumissionsRes.data as CorrectionPreview[]) || [];
    setRecentCorrections(submissions);

    const days = new Set(submissions.map((s) => new Date(s.updated_at).toISOString().slice(0, 10)));
    setStreakDays(days.size);

    if (typeof window !== 'undefined' && window.localStorage.getItem('competences_updated') === '1') {
      setCompetencesUpdated(true);
      window.localStorage.removeItem('competences_updated');
      setTimeout(() => setCompetencesUpdated(false), 6000);
    }

    setLoading(false);
  }, [router, supabase]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const competenceEntries = useMemo<CompetenceEntry[]>(() => {
    if (!competences) return [];
    return (Object.keys(competenceLabels) as (keyof Competences)[]).map((key) => ({ key, label: competenceLabels[key], value: competences[key] }));
  }, [competences]);

  const weakest = useMemo(() => competenceEntries.slice().sort((a, b) => a.value - b.value)[0], [competenceEntries]);
  const strongest = useMemo(() => competenceEntries.slice().sort((a, b) => b.value - a.value)[0], [competenceEntries]);
  const avgScore = useMemo(() => (competenceEntries.length ? Math.round(competenceEntries.reduce((acc, cur) => acc + cur.value, 0) / competenceEntries.length) : null), [competenceEntries]);
  const niveau = useMemo(() => (competences ? calculateNiveauEstime(competences) : '-'), [competences]);

  const recommended = useMemo(() => {
    if (!weakest) return { title: 'Commencer votre diagnostic initial', subtitle: 'Soumettez une première production écrite pour obtenir un plan personnalisé.', href: '/ecriture' };
    if (['orthographe', 'syntaxe'].includes(weakest.key)) return { title: `Priorité : ${weakest.label}`, subtitle: 'Lancez une série d’exercices ciblés pour remonter ce score rapidement.', href: '/exercices' };
    if (['fluidite', 'comprehension'].includes(weakest.key)) return { title: `Priorité : ${weakest.label}`, subtitle: 'Faites une session de coach oral et obtenez du feedback immédiat.', href: '/coach-oral' };
    return { title: `Priorité : ${weakest.label}`, subtitle: 'Travaillez une production guidée pour progresser sur cet axe.', href: '/ecriture' };
  }, [weakest]);

  if (loading) return <div className="min-h-screen grid place-items-center">Chargement du dashboard…</div>;
  if (error) return <AppPage><PageErrorState title="Erreur dashboard" message={error} onRetry={fetchDashboard} /></AppPage>;
  if (!profile) return <AppPage><PageErrorState title="Profil introuvable" message="Nous n'avons pas trouvé votre profil utilisateur." onRetry={fetchDashboard} /></AppPage>;

  return (
    <AppPage>
      {competencesUpdated && <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800">Compétences mises à jour depuis votre dernière activité.</div>}

      <AppPanel className="p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Bonjour {profile.first_name} 👋</h1>
            <p className="mt-1 text-[var(--color-muted)]">Objectif du jour : 1 action ciblée pour améliorer votre score TEF IRN.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/radar"><Button variant="outline" className="rounded-xl border-violet-300">Voir Radar</Button></Link>
            <Link href={recommended.href}><Button className="rounded-xl">Action recommandée</Button></Link>
          </div>
        </div>
      </AppPanel>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Niveau estimé" value={niveau} detail="Calculé sur vos compétences actuelles" />
        <MetricCard title="Score moyen" value={avgScore ? `${avgScore}%` : '-'} detail="Moyenne des 6 axes" />
        <MetricCard title="Série active" value={`${streakDays} j`} detail="Jours avec activité récente" />
        <MetricCard title="Axe à renforcer" value={weakest?.label || '-'} detail={weakest ? `${weakest.value}% actuellement` : 'En attente de données'} />
      </section>

      <section className="grid gap-6 lg:grid-cols-12">
        <AppPanel className="p-6 lg:col-span-7">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Vue rapide des compétences</h2>
            <span className="text-sm text-[var(--color-muted)]">6 axes</span>
          </div>
          {!competenceEntries.length ? (
            <div className="rounded-2xl border border-dashed border-violet-300/70 bg-white/50 p-10 text-center text-[var(--color-muted)]">Aucune donnée pour le moment.</div>
          ) : (
            <div className="space-y-4">
              {competenceEntries.map((entry) => (
                <div key={entry.key}>
                  <div className="mb-1 flex justify-between text-sm"><span>{entry.label}</span><span>{entry.value}%</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-violet-100"><div className="h-full bg-[var(--color-primary)]" style={{ width: `${entry.value}%` }} /></div>
                </div>
              ))}
            </div>
          )}
        </AppPanel>

        <div className="space-y-6 lg:col-span-5">
          <AppPanel className="p-6">
            <h3 className="mb-2 text-lg font-semibold">Prochaine étape</h3>
            <p className="font-medium">{recommended.title}</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{recommended.subtitle}</p>
            <Link href={recommended.href}><Button className="mt-5 w-full rounded-xl">Commencer maintenant</Button></Link>
          </AppPanel>
          <AppPanel className="p-6">
            <h3 className="mb-2 text-lg font-semibold">Point fort actuel</h3>
            <p className="font-medium">{strongest?.label || 'À déterminer'}</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{strongest ? `${strongest.value}% — capitalisez dessus dans les épreuves complètes.` : 'Réalisez une activité pour générer des données.'}</p>
          </AppPanel>
        </div>
      </section>

      <AppPanel className="p-6">
        <h3 className="mb-4 text-xl font-semibold">Dernières corrections</h3>
        {!recentCorrections.length ? (
          <p className="text-[var(--color-muted)]">Aucune correction disponible. Lancez une rédaction pour alimenter votre suivi.</p>
        ) : (
          <div className="space-y-3">
            {recentCorrections.map((s) => (
              <Link href={`/corrections/${s.id}`} key={s.id} className="block rounded-xl border border-violet-200/70 bg-white/80 p-4 hover:bg-violet-50">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{s.titre || 'Expression écrite'}</p>
                    <p className="text-sm text-[var(--color-muted)]">{new Date(s.updated_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <p className="font-semibold text-[var(--color-primary)]">{s.corrections?.[0]?.note_globale ?? '-'} / 15</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </AppPanel>
    </AppPage>
  );
}

function MetricCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-violet-200/60 bg-gradient-to-b from-white to-violet-50/40 p-5">
      <p className="text-sm text-[var(--color-muted)]">{title}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-[var(--color-muted)]">{detail}</p>
    </div>
  );
}
