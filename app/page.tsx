import Link from 'next/link';
import { Icons } from '@/components/layout/ui/icons';

export default function Home() {
  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[var(--color-background)] text-[var(--color-text)] font-body">
      {/* SEO & Meta optimisés */}
      <head>
        <title>L&apos;Académie Moderne | Préparation TEF IRN avec IA • Réussite Garantie</title>
        <meta name="description" content="Préparez le TEF IRN avec des corrections IA notées, un coach oral intelligent et un parcours adaptatif. +18% de score moyen. 92% de réussite. Commencez gratuitement." />
        <meta name="keywords" content="TEF IRN, préparation TEF IRN, examen français nationalité, TEF IRN IA, coach oral français, correction expression écrite" />
      </head>

      {/* Navigation Premium */}
      <nav className="sticky top-0 z-50 border-b border-[var(--color-muted)]/20 bg-[var(--color-surface)]/95 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white font-bold">AM</div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-primary)]">TEF IRN 2026</p>
              <h1 className="text-2xl font-heading font-semibold tracking-tight">L&apos;Académie Moderne</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="#parcours" className="hidden md:block text-sm font-medium hover:text-[var(--color-primary)] transition">Le parcours</Link>
            <Link href="#resultats" className="hidden md:block text-sm font-medium hover:text-[var(--color-primary)] transition">Résultats</Link>
            <Link href="#prix" className="hidden md:block text-sm font-medium hover:text-[var(--color-primary)] transition">Tarifs</Link>
            <Link 
              href="/auth" 
              className="rounded-2xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/30 hover:scale-[1.03] transition-all"
            >
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO - Storytelling émotionnel */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(at_50%_30%,var(--color-primary)/0.08,transparent_70%)]"></div>
        
        <div className="mx-auto max-w-7xl px-6 md:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/30 bg-white/70 px-5 py-2 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Places limitées pour la session juin 2026
            </div>

            <h1 className="text-6xl md:text-7xl font-heading font-semibold leading-[1.05] tracking-tighter mb-8">
              Votre rêve français<br />
              mérite une <span className="bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-primary)] bg-clip-text text-transparent">préparation d&apos;exception</span>.
            </h1>

            <p className="text-2xl md:text-3xl text-[var(--color-muted)] max-w-3xl mx-auto leading-tight mb-10">
              Arrêtez de stresser devant le TEF IRN.<br />
              Passez de <span className="line-through opacity-50">« je vais essayer »</span> à <span className="font-semibold text-[var(--color-primary)]">« j’ai réussi »</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/auth"
                className="group relative px-10 py-5 rounded-3xl bg-[var(--color-primary)] text-white font-semibold text-xl shadow-2xl shadow-[var(--color-primary)]/40 hover:shadow-[var(--color-primary)]/60 transition-all hover:-translate-y-1 flex items-center gap-3"
              >
                Démarrer mon essai gratuit de 14 jours
                <span className="group-hover:rotate-12 transition">→</span>
              </Link>
              <Link href="#resultats" className="px-8 py-5 rounded-3xl border border-[var(--color-muted)]/50 hover:border-[var(--color-primary)]/50 text-lg transition">
                Voir les transformations réelles →
              </Link>
            </div>

            <p className="text-sm text-[var(--color-muted)] mt-6">Sans carte bancaire • Annulable à tout moment</p>
          </div>
        </div>
      </section>

      {/* Social Proof Hero */}
      <section className="py-12 border-y border-[var(--color-muted)]/10 bg-white/50">
        <div className="mx-auto max-w-5xl px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { number: "3 450+", label: "Apprenants accompagnés" },
            { number: "92 %", label: "Taux de réussite TEF IRN" },
            { number: "+18 %", label: "Progression moyenne en 30 jours" },
            { number: "4,98/5", label: "Satisfaction des apprenants" },
          ].map((stat, i) => (
            <div key={i} className="animate-in-view" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="text-4xl md:text-5xl font-heading font-semibold text-[var(--color-primary)]">{stat.number}</div>
              <div className="text-[var(--color-muted)] mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Storytelling Section */}
      <section id="histoire" className="py-24 bg-white">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-16">
            <p className="uppercase tracking-[0.15em] text-[var(--color-primary)] font-medium mb-4">Votre histoire commence ici</p>
            <h2 className="text-5xl font-heading font-semibold">De l&apos;anxiété à la fierté</h2>
          </div>

          <div className="prose prose-lg max-w-none text-[var(--color-muted)] leading-relaxed space-y-8">
            <p>
              Vous êtes arrivé en France avec un rêve : <strong>construire votre vie ici</strong>. Obtenir la nationalité, la carte de résident longue durée, ou simplement prouver votre maîtrise du français.
            </p>
            <p>
              Mais le TEF IRN vous terrifie. Les expressions écrites qui ne sonnent jamais juste, les oraux où vous bloquez, les points perdus bêtement… Vous passez des soirées à réviser sans savoir si vous progressez vraiment.
            </p>
            <p className="text-2xl font-medium text-[var(--color-text)] border-l-4 border-[var(--color-primary)] pl-6 py-2">
              Imaginez recevoir votre résultat : <span className="text-emerald-600 font-semibold">B1 validé</span>, ou même mieux. Votre dossier accepté. Votre avenir sécurisé.
            </p>
            <p>
              C’est ce que nous faisons chez L’Académie Moderne. Nous avons créé l’accompagnateur que nous aurions voulu avoir : intelligent, patient, disponible 24/7, et surtout <strong>obsédé par vos résultats</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Features détaillées */}
      <section id="parcours" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-heading font-semibold mb-4">Une méthode pensée pour réussir</h2>
            <p className="text-xl text-[var(--color-muted)]">Pas juste des exercices. Un véritable coach IA + humain.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group bg-white border border-[var(--color-muted)]/20 rounded-3xl p-10 hover:border-[var(--color-primary)]/30 transition-all hover:shadow-2xl">
              <div className="h-16 w-16 bg-violet-100 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition">
                {Icons.library && <Icons.library className="h-9 w-9 text-[var(--color-primary)]" />}
              </div>
              <h3 className="text-3xl font-heading font-semibold mb-4">Parcours adaptatif CECRL</h3>
              <p className="text-lg text-[var(--color-muted)]">Votre radar de compétences met à jour votre niveau en temps réel. Le planning s’ajuste automatiquement à votre date d’examen.</p>
            </div>

            {/* Card 2 */}
            <div className="group bg-white border border-[var(--color-muted)]/20 rounded-3xl p-10 hover:border-[var(--color-primary)]/30 transition-all hover:shadow-2xl">
              <div className="h-16 w-16 bg-rose-100 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition">
                {Icons.checkCircle && <Icons.checkCircle className="h-9 w-9 text-[var(--color-primary)]" />}
              </div>
              <h3 className="text-3xl font-heading font-semibold mb-4">Corrections IA notées comme à l’examen</h3>
              <p className="text-lg text-[var(--color-muted)]">Rédigez en conditions réelles. Recevez une note officielle, annotations inline, remarques détaillées et plan d’action prioritaire.</p>
            </div>

            {/* Card 3 */}
            <div className="group bg-white border border-[var(--color-muted)]/20 rounded-3xl p-10 hover:border-[var(--color-primary)]/30 transition-all hover:shadow-2xl">
              <div className="h-16 w-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition">
                {Icons.mic && <Icons.mic className="h-9 w-9 text-[var(--color-primary)]" />}
              </div>
              <h3 className="text-3xl font-heading font-semibold mb-4">Coach Oral Intelligent</h3>
              <p className="text-lg text-[var(--color-muted)]">Un examinateur IA qui vous pousse, relance, corrige la prononciation et enrichit votre vocabulaire en direct. Comme un vrai oral… mais sans stress.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages (fictifs mais réalistes) */}
      <section id="resultats" className="py-24 bg-gradient-to-b from-white to-[var(--color-background)]">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-5xl font-heading font-semibold text-center mb-16">Ils ont réussi leur TEF IRN grâce à nous</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Amina K.",
                origin: "Maroc • Nationalité obtenue",
                quote: "J’ai validé le B1 du premier coup avec 3 points d’avance. Les corrections IA m’ont fait gagner un temps fou sur l’expression écrite.",
                score: "B1 (378/499)",
                delay: "0"
              },
              {
                name: "Carlos M.",
                origin: "Brésil • Résidence longue durée",
                quote: "Le coach oral a complètement transformé ma confiance. Je parlais avec peur avant. Aujourd’hui je tiens une conversation fluide.",
                score: "B1 (412/499)",
                delay: "150"
              },
              {
                name: "Fatou N.",
                origin: "Sénégal • OFII",
                quote: "En 5 semaines seulement. Le radar de compétences m’a montré exactement où je perdais des points.",
                score: "A2 validé",
                delay: "300"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white p-10 rounded-3xl border border-[var(--color-muted)]/10 shadow-xl animate-in-view" style={{animationDelay: `${testimonial.delay}ms`}}>
                <div className="italic text-xl leading-relaxed mb-8">“{testimonial.quote}”</div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-[var(--color-muted)]">{testimonial.origin}</div>
                  <div className="mt-4 text-emerald-600 font-medium">{testimonial.score}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Garantie de résultat */}
      <section className="py-24 bg-[var(--color-primary)] text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="inline-block mb-6 rounded-2xl bg-white/10 px-6 py-2 text-sm font-medium tracking-widest">GARANTIE DE RÉSULTAT</div>
          <h2 className="text-5xl font-heading font-semibold mb-8 leading-tight">Si vous ne progressez pas, nous vous remboursons.</h2>
          <p className="text-2xl opacity-90">Engagez-vous 100% avec nous pendant 30 jours. Si vous ne voyez pas d’amélioration claire sur votre radar de compétences, nous vous remboursons intégralement.</p>
          <div className="mt-12 text-sm opacity-75">* Conditions sur demande après analyse de votre progression</div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section id="prix" className="py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-heading font-semibold">Choisissez votre réussite</h2>
            <p className="text-xl text-[var(--color-muted)] mt-4">Offre de lancement – prix bloqué</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Abonnement Mensuel */}
            <div className="border border-[var(--color-muted)]/30 rounded-3xl p-10 bg-white">
              <div className="uppercase tracking-widest text-sm mb-2">Flexible</div>
              <div className="text-6xl font-heading font-semibold mb-2">29 €<span className="text-2xl font-normal text-[var(--color-muted)]">/mois</span></div>
              <ul className="space-y-4 my-10 text-lg">
                <li>✓ Accès complet à toutes les fonctionnalités</li>
                <li>✓ Corrections IA illimitées</li>
                <li>✓ Coach oral 24/7</li>
                <li>✓ Radar mis à jour quotidiennement</li>
              </ul>
              <Link href="/auth" className="block w-full text-center py-5 rounded-2xl border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-semibold hover:bg-[var(--color-primary)] hover:text-white transition">
                Commencer maintenant
              </Link>
            </div>

            {/* Abonnement 6 mois (recommandé) */}
            <div className="relative border-2 border-[var(--color-primary)] rounded-3xl p-10 bg-white shadow-2xl">
              <div className="absolute -top-4 right-8 bg-[var(--color-primary)] text-white text-sm font-bold px-6 py-1 rounded-full">Le plus choisi</div>
              <div className="uppercase tracking-widest text-sm mb-2 text-[var(--color-primary)]">Meilleur rapport</div>
              <div className="text-6xl font-heading font-semibold mb-1">139 €</div>
              <div className="text-xl text-[var(--color-muted)]">pour 6 mois (-20%)</div>
              
              <ul className="space-y-4 my-10 text-lg">
                <li>✓ Tout de l’offre mensuelle</li>
                <li>✓ Accès prioritaire au coach</li>
                <li>✓ 2 simulations complètes TEF IRN offertes</li>
                <li>✓ Support humain par email</li>
                <li>✓ Garantie de résultat 30 jours</li>
              </ul>
              <Link href="/auth" className="block w-full text-center py-5 rounded-2xl bg-[var(--color-primary)] text-white font-semibold text-xl shadow-xl">
                Je m’engage pour 6 mois
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dernier CTA */}
      <section className="py-28 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-white">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-5xl font-heading font-semibold mb-8">Votre avenir en français commence aujourd’hui.</h2>
          <p className="text-2xl opacity-90 mb-12">Rejoignez les centaines d’apprenants qui ont déjà transformé leur vie grâce à L’Académie Moderne.</p>
          
          <Link
            href="/auth"
            className="inline-block px-16 py-7 rounded-3xl bg-white text-[var(--color-primary)] font-semibold text-2xl hover:scale-105 transition-all shadow-2xl"
          >
            Créer mon compte gratuit
          </Link>
          
          <p className="mt-8 opacity-75">14 jours d’essai complet • Sans engagement</p>
        </div>
      </section>

      <footer className="bg-[var(--color-surface)] py-12 border-t">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-[var(--color-muted)]">
          © 2026 L&apos;Académie Moderne — Préparation TEF IRN avec intelligence artificielle
        </div>
      </footer>
    </div>
  );
}
