import Link from 'next/link'
import { Icons } from '@/components/layout/ui/icons'   // ← Ajuste le chemin si nécessaire

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-heading font-semibold text-[var(--color-text)]">
          L'Académie Moderne
        </h1>
        <Link
          href="/auth"
          className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Accéder à l'espace membre
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-5xl md:text-6xl font-heading font-semibold text-[var(--color-text)] leading-tight mb-6">
              Préparation TEF IRN
              <span className="block text-[var(--color-primary)]">d'excellence</span>
            </h2>
            <p className="text-xl text-[var(--color-muted)] mb-8 leading-relaxed">
              Plateforme institutionnelle de préparation au TEF IRN.
              Accédez à des exercices corrigés, des simulations d'oral,
              et un suivi personnalisé par nos coachs experts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth"
                className="px-8 py-4 bg-[var(--color-primary)] text-white rounded-lg font-medium text-lg hover:opacity-90 transition-opacity text-center"
              >
                Commencer gratuitement
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 border-2 border-[var(--color-primary)] text-[var(--color-primary)] rounded-lg font-medium text-lg hover:bg-[var(--color-hover-blue)] transition-colors text-center"
              >
                Découvrir les fonctionnalités
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl p-8 border border-[var(--color-muted)]/20">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center">
                    <Icons.bookOpen className="w-7 h-7 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-semibold">Leçons structurées</h3>
                    <p className="text-[var(--color-muted)]">Contenu pédagogique complet</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center">
                    <Icons.mic className="w-7 h-7 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-semibold">Coach Oral IA</h3>
                    <p className="text-[var(--color-muted)]">Entraînement avec feedback instantané</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center">
                    <Icons.trendingUp className="w-7 h-7 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-semibold">Suivi personnalisé</h3>
                    <p className="text-[var(--color-muted)]">Progression en temps réel</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-32">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-heading font-semibold text-[var(--color-text)] mb-4">
              Tout pour réussir votre TEF IRN
            </h3>
            <p className="text-xl text-[var(--color-muted)] max-w-2xl mx-auto">
              Une suite complète d'outils conçus par des experts de la langue française
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[var(--color-surface)] p-8 rounded-xl border border-[var(--color-muted)]/20 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mb-6">
                <Icons.library className="w-8 h-8 text-[var(--color-primary)]" />
              </div>
              <h4 className="text-2xl font-heading font-semibold mb-3">Bibliothèque</h4>
              <p className="text-[var(--color-muted)] leading-relaxed">
                Accédez à des centaines de leçons couvrant tous les aspects du TEF IRN : grammaire, vocabulaire, compréhension.
              </p>
            </div>

            <div className="bg-[var(--color-surface)] p-8 rounded-xl border border-[var(--color-muted)]/20 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mb-6">
                <Icons.mic className="w-8 h-8 text-[var(--color-primary)]" />
              </div>
              <h4 className="text-2xl font-heading font-semibold mb-3">Coach Oral IA</h4>
              <p className="text-[var(--color-muted)] leading-relaxed">
                Entraînez-vous à l'expression orale avec notre coach IA qui vous donne des feedbacks instantanés.
              </p>
            </div>

            <div className="bg-[var(--color-surface)] p-8 rounded-xl border border-[var(--color-muted)]/20 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mb-6">
                <Icons.checkCircle className="w-8 h-8 text-[var(--color-primary)]" />
              </div>
              <h4 className="text-2xl font-heading font-semibold mb-3">Exercices & Corrections</h4>
              <p className="text-[var(--color-muted)] leading-relaxed">
                Pratiquez avec des exercices interactifs et recevez des corrections détaillées par nos experts.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-32 text-center">
          <div className="bg-[var(--color-primary)] rounded-2xl p-16">
            <h3 className="text-4xl font-heading font-semibold text-white mb-6">
              Prêt à commencer ?
            </h3>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Rejoignez L'Académie Moderne et préparez votre TEF IRN dans les meilleures conditions.
            </p>
            <Link
              href="/auth"
              className="inline-block px-10 py-5 bg-white text-[var(--color-primary)] rounded-lg font-medium text-lg hover:bg-[var(--color-hover-blue)] transition-colors"
            >
              Créer mon compte gratuit
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-muted)]/20 mt-32">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[var(--color-muted)]">
              © 2025 L'Académie Moderne. Tous droits réservés.
            </p>
            <div className="flex gap-8">
              <Link href="/auth" className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors">
                Connexion
              </Link>
              <Link href="/auth" className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors">
                Inscription
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
