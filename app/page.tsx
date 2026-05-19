import Link from 'next/link'
import { Icons } from '@/components/layout/ui/icons'

const proofPoints = [
  { label: 'Apprenants accompagnés', value: '3 200+' },
  { label: 'Taux de réussite TEF IRN', value: '92%' },
  { label: 'Temps moyen avant examen', value: '6 semaines' },
]

const featureCards = [
  {
    icon: Icons.library,
    title: 'Parcours adaptatif',
    description:
      'Un plan d’étude qui s’ajuste à votre niveau CECRL, vos erreurs récurrentes et votre date d’examen.',
  },
  {
    icon: Icons.checkCircle,
    title: 'Corrections IA notées',
    description:
      'Rédigez comme à l’examen et recevez une note, des annotations détaillées et des actions concrètes pour progresser.',
  },
  {
    icon: Icons.mic,
    title: 'Simulation orale premium',
    description:
      'Un examinateur IA qui relance intelligemment, détecte vos points faibles et enrichit votre vocabulaire en direct.',
  },
]

export default function Home() {
  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[var(--color-background)] text-[var(--color-text)]">
      <nav className="sticky top-0 z-40 border-b border-[var(--color-muted)]/15 bg-[var(--color-surface)]/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 md:px-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-primary)]">TEF IRN 2026</p>
            <h1 className="text-2xl font-heading font-semibold">L'Académie Moderne</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="#features"
              className="hidden rounded-lg border border-[var(--color-primary)]/20 px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-hover-blue)] md:inline-block"
            >
              Voir la méthode
            </Link>
            <Link
              href="/auth"
              className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] hover:opacity-95"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl px-6 pb-20 pt-14 md:px-8 md:pt-20">
        <section className="relative grid items-center gap-12 md:grid-cols-2">
          <div className="absolute -left-16 top-12 -z-10 h-56 w-56 rounded-full bg-[var(--color-primary)]/15 blur-3xl" />
          <div className="absolute right-8 top-48 -z-10 h-44 w-44 rounded-full bg-[var(--color-accent)]/20 blur-3xl" />

          <div className="animate-in-view">
            <p className="mb-4 inline-flex items-center rounded-full border border-[var(--color-primary)]/20 bg-[var(--color-surface)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">
              Préparation guidée & résultats mesurables
            </p>
            <h2 className="text-5xl font-heading font-semibold leading-tight md:text-6xl">
              Transformez votre <span className="text-[var(--color-primary)]">objectif TEF IRN</span> en réussite certifiée.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-muted)] md:text-xl">
              Une expérience premium, conçue pour convertir votre motivation en progrès concret grâce à des parcours personnalisés,
              des simulations réalistes et un coaching intelligent.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth"
                className="rounded-xl bg-[var(--color-primary)] px-8 py-4 text-center text-base font-semibold text-white shadow-xl shadow-[var(--color-primary)]/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
              >
                Démarrer mon essai gratuit
              </Link>
              <Link
                href="#social-proof"
                className="rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-surface)] px-8 py-4 text-center text-base font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-hover-blue)]"
              >
                Voir les résultats
              </Link>
            </div>
          </div>

          <div className="animate-float-slow relative rounded-2xl border border-[var(--color-muted)]/20 bg-[var(--color-surface)] p-7 shadow-2xl shadow-[var(--color-primary)]/10 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--color-muted)]">Score prédictif TEF IRN</p>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">+18% en 30 jours</span>
            </div>
            <div className="space-y-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-primary)]/10">
                <div className="animate-progress h-full w-[78%] rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {proofPoints.map((item) => (
                  <div key={item.label} className="rounded-xl border border-[var(--color-muted)]/15 bg-[var(--color-background)] p-4">
                    <p className="text-2xl font-heading font-semibold">{item.value}</p>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-28">
          <div className="mb-12 text-center animate-in-view">
            <h3 className="text-4xl font-heading font-semibold md:text-5xl">Une landing pensée pour convertir en clients payants.</h3>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-[var(--color-muted)]">
              Chaque section répond aux leviers de conversion 2026 : clarté de la promesse, preuve immédiate, réassurance et passage à l’action.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {featureCards.map((feature) => {
              const Icon = feature.icon
              return (
                <article
                  key={feature.title}
                  className="animate-in-view group rounded-2xl border border-[var(--color-muted)]/20 bg-[var(--color-surface)] p-8 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] transition group-hover:scale-105">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h4 className="text-2xl font-heading font-semibold">{feature.title}</h4>
                  <p className="mt-3 leading-relaxed text-[var(--color-muted)]">{feature.description}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section id="social-proof" className="mt-28 rounded-3xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] p-12 text-center text-white md:p-16">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/75">Offre de lancement</p>
          <h3 className="mt-4 text-4xl font-heading font-semibold md:text-5xl">Passez du statut de prospect à candidat prêt en quelques jours.</h3>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85">
            Activez votre espace membre, testez les simulations et observez votre progression avant de passer à l’abonnement complet.
          </p>
          <Link
            href="/auth"
            className="mt-8 inline-block rounded-xl bg-white px-9 py-4 text-base font-semibold text-[var(--color-primary)] transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-hover-blue)]"
          >
            Créer mon compte et commencer
          </Link>
        </section>
      </main>
    </div>
  )
}
