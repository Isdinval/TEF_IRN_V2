'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchDashboard = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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

      setProfile(profileRes.data);
      setCompetences(competencesRes.data ?? null);
      setRecentCorrections((soumissionsRes.data as CorrectionPreview[]) || []);

      const days = new Set(
        ((soumissionsRes.data as CorrectionPreview[]) || []).map((s) =>
          new Date(s.updated_at).toISOString().slice(0, 10)
        )
      );
      setStreakDays(days.size);

      if (typeof window !== 'undefined' && window.localStorage.getItem('competences_updated') === '1') {
        setCompetencesUpdated(true);
        window.localStorage.removeItem('competences_updated');
        setTimeout(() => setCompetencesUpdated(false), 6000);
      }

      setLoading(false);
    };

    fetchDashboard();
  }, [router, supabase]);

  const competenceEntries = useMemo<CompetenceEntry[]>(() => {
    if (!competences) return [];
    return (Object.keys(competenceLabels) as (keyof Competences)[]).map((key) => ({
      key,
      label: competenceLabels[key],
      value: competences[key],
    }));
  }, [competences]);

  const weakest = useMemo(() => competenceEntries.slice().sort((a, b) => a.value - b.value)[0], [competenceEntries]);
  const strongest = useMemo(() => competenceEntries.slice().sort((a, b) => b.value - a.value)[0], [competenceEntries]);
  const avgScore = useMemo(() => {
    if (!competenceEntries.length) return null;
    return Math.round(competenceEntries.reduce((acc, cur) => acc + cur.value, 0) / competenceEntries.length);
  }, [competenceEntries]);

  const niveau = useMemo(() => {
    if (!competences) return '-';
    return calculateNiveauEstime(competences);
  }, [competences]);

  const recommended = useMemo(() => {
    if (!weakest) {
      return {
        title: 'Commencer votre diagnostic initial',
        subtitle: 'Soumettez une première production écrite pour obtenir un plan personnalisé.',
        href: '/ecriture',
      };
    }

    if (['orthographe', 'syntaxe'].includes(weakest.key)) {
      return {
        title: `Priorité : ${weakest.label}`,
        subtitle: 'Lancez une série d’exercices ciblés pour remonter ce score rapidement.',
        href: '/exercices',
      };
    }

    if (['fluidite', 'comprehension'].includes(weakest.key)) {
      return {
        title: `Priorité : ${weakest.label}`,
        subtitle: 'Faites une session de coach oral et obtenez du feedback immédiat.',
        href: '/coach-oral',
      };
    }

    return {
      title: `Priorité : ${weakest.label}`,
      subtitle: 'Travaillez une production guidée pour progresser sur cet axe.',
      href: '/ecriture',
    };
  }, [weakest]);

  if (loading || !profile) {
    return <div className="min-h-screen grid place-items-center">Chargement du dashboard…</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-6 md:p-10 space-y-6">
      {competencesUpdated && <div className="rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3">Compétences mises à jour depuis votre dernière activité.</div>}

      <section className="rounded-3xl bg-white border border-[var(--color-muted)]/20 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Bonjour {profile.first_name} 👋</h1>
            <p className="text-[var(--color-muted)] mt-1">Objectif du jour : 1 action ciblée pour améliorer votre score TEF IRN.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/radar"><Button variant="outline" className="rounded-xl">Voir Radar</Button></Link>
            <Link href={recommended.href}><Button className="rounded-xl">Action recommandée</Button></Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard title="Niveau estimé" value={niveau} detail="Calculé sur vos compétences actuelles" />
        <MetricCard title="Score moyen" value={avgScore ? `${avgScore}%` : '-'} detail="Moyenne des 6 axes" />
        <MetricCard title="Série active" value={`${streakDays} j`} detail="Jours avec activité récente" />
        <MetricCard title="Axe à renforcer" value={weakest?.label || '-'} detail={weakest ? `${weakest.value}% actuellement` : 'En attente de données'} />
      </section>

      <section className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-3xl bg-white border border-[var(--color-muted)]/20 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold">Vue rapide des compétences</h2>
            <span className="text-sm text-[var(--color-muted)]">6 axes</span>
          </div>
          {!competenceEntries.length ? (
            <div className="rounded-2xl border border-dashed p-10 text-center text-[var(--color-muted)]">Aucune donnée pour le moment.</div>
          ) : (
            <div className="space-y-4">
              {competenceEntries.map((entry) => (
                <div key={entry.key}>
                  <div className="flex justify-between text-sm mb-1"><span>{entry.label}</span><span>{entry.value}%</span></div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[var(--color-primary)]" style={{ width: `${entry.value}%` }} /></div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-white border border-[var(--color-muted)]/20 p-6">
            <h3 className="text-lg font-semibold mb-2">Prochaine étape</h3>
            <p className="font-medium">{recommended.title}</p>
            <p className="text-sm text-[var(--color-muted)] mt-1">{recommended.subtitle}</p>
            <Link href={recommended.href}><Button className="w-full mt-5 rounded-xl">Commencer maintenant</Button></Link>
          </div>
          <div className="rounded-3xl bg-white border border-[var(--color-muted)]/20 p-6">
            <h3 className="text-lg font-semibold mb-2">Point fort actuel</h3>
            <p className="font-medium">{strongest?.label || 'À déterminer'}</p>
            <p className="text-sm text-[var(--color-muted)] mt-1">{strongest ? `${strongest.value}% — capitalisez dessus dans les épreuves complètes.` : 'Réalisez une activité pour générer des données.'}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white border border-[var(--color-muted)]/20 p-6">
        <h3 className="text-xl font-semibold mb-4">Dernières corrections</h3>
        {recentCorrections.length === 0 ? (
          <p className="text-[var(--color-muted)]">Aucune correction disponible. Lancez une rédaction pour alimenter votre suivi.</p>
        ) : (
          <div className="space-y-3">
            {recentCorrections.map((s) => (
              <Link href={`/corrections/${s.id}`} key={s.id} className="block rounded-2xl border p-4 hover:bg-gray-50">
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
      </section>
    </div>
  );
}

function MetricCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl bg-white border border-[var(--color-muted)]/20 p-5">
      <p className="text-sm text-[var(--color-muted)]">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
      <p className="text-xs text-[var(--color-muted)] mt-1">{detail}</p>
    </div>
  );
}
