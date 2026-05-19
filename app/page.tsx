'use client';

import Link from 'next/link';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Icons } from '@/components/layout/ui/icons';

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Animated Counter corrigé
  const AnimatedCounter = ({ end, suffix = "" }: { end: number; suffix?: string }) => {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));

    useEffect(() => {
      const controls = animate(count, end, { 
        duration: 2.2, 
        ease: "easeOut" 
      });
      return () => controls.stop();
    }, [end, count]);

    return (
      <motion.span>
        {rounded}
        {suffix}
      </motion.span>
    );
  };

  const faqs = [
    {
      q: "Combien de temps faut-il pour voir des résultats ?",
      a: "La plupart de nos apprenants voient une progression visible sur leur radar dès les 10-14 premiers jours. Avec 4-5 sessions par semaine, le B1 est très atteignable en 5 à 8 semaines."
    },
    {
      q: "Est-ce que le coach oral remplace vraiment un professeur humain ?",
      a: "Il ne le remplace pas, il le complète. Le coach IA est disponible 24/7, sans rendez-vous, et corrige prononciation + fluidité en temps réel."
    },
    {
      q: "La correction IA est-elle aussi précise qu'un correcteur officiel ?",
      a: "Oui. Nous avons calibré le modèle sur des milliers de copies réelles du TEF IRN. Elle attribue une note sur 500 exactement comme l’examen officiel."
    },
    {
      q: "Que se passe-t-il si je ne progresse pas ?",
      a: "Garantie 30 jours : si votre radar ne montre aucune amélioration après 30 jours d’utilisation sérieuse, nous vous remboursons intégralement."
    },
    {
      q: "Puis-je annuler mon abonnement à tout moment ?",
      a: "Oui. Aucune durée minimale sur l’offre mensuelle. Vous pouvez résilier en un clic depuis votre espace."
    }
  ];

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[var(--color-background)] text-[var(--color-text)] font-body">
      {/* Navigation */}
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
            <Link href="#parcours" className="hidden md:block text-sm font-medium hover:text-[var(--color-primary)] transition">Parcours</Link>
            <Link href="#resultats" className="hidden md:block text-sm font-medium hover:text-[var(--color-primary)] transition">Résultats</Link>
            <Link href="#prix" className="hidden md:block text-sm font-medium hover:text-[var(--color-primary)] transition">Tarifs</Link>
            <Link href="/auth" className="rounded-2xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white hover:scale-105 transition">
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(at_50%_30%,var(--color-primary)/0.08,transparent_70%)]"></div>
        
        <div className="mx-auto max-w-7xl px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/30 bg-white/70 px-5 py-2 text-sm font-medium mb-6"
            >
              Places limitées — Session juin 2026
            </motion.div>

            <h1 className="text-6xl md:text-7xl font-heading font-semibold leading-[1.05] tracking-tighter mb-8">
              Votre rêve français mérite une préparation d’exception.
            </h1>

            <p className="text-2xl md:text-3xl text-[var(--color-muted)] max-w-3xl mx-auto leading-tight mb-10">
              Passez du stress du TEF IRN à la fierté d’avoir réussi.
            </p>

            <Link 
              href="/auth"
              className="inline-block px-10 py-5 rounded-3xl bg-[var(--color-primary)] text-white font-semibold text-xl hover:scale-105 transition-all shadow-xl"
            >
              Démarrer l’essai gratuit de 14 jours →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats avec compteurs */}
      <section className="py-12 border-y border-[var(--color-muted)]/10 bg-white/50">
        <div className="mx-auto max-w-5xl px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { end: 3450, label: "Apprenants accompagnés", suffix: "+" },
            { end: 92, label: "Taux de réussite", suffix: "%" },
            { end: 18, label: "Progression moyenne", suffix: "%" },
            { end: 4.98, label: "Satisfaction", suffix: "/5" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-5xl md:text-6xl font-heading font-semibold text-[var(--color-primary)]">
                <AnimatedCounter end={stat.end} suffix={stat.suffix} />
              </div>
              <div className="text-[var(--color-muted)] mt-2">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Radar Preview */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-heading font-semibold mb-6">Visualisez vos progrès en temps réel</h2>
              <p className="text-xl text-[var(--color-muted)]">Le radar de compétences met à jour automatiquement votre niveau sur les 4 compétences du TEF IRN.</p>
            </div>

            <motion.div 
              initial={{ scale: 0.85, rotate: -5 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              className="relative flex justify-center"
            >
              <div className="relative w-80 h-80">
                <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
                  <circle cx="200" cy="200" r="160" fill="none" stroke="#e5e7eb" strokeWidth="12"/>
                  <circle cx="200" cy="200" r="110" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                  <circle cx="200" cy="200" r="60" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                  
                  <motion.polygon 
                    points="200,80 290,150 260,290 130,280 90,170" 
                    fill="rgba(139, 92, 246, 0.25)"
                    stroke="#8b5cf6"
                    strokeWidth="18"
                    strokeLinejoin="round"
                    animate={{ opacity: [0.6, 0.95, 0.6] }}
                    transition={{ duration: 3.5, repeat: Infinity }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-center">
                  <div>
                    <div className="text-7xl font-heading font-bold text-[var(--color-primary)]">B1</div>
                    <div className="text-sm tracking-widest uppercase">Niveau actuel</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-28 bg-white">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-5xl font-heading font-semibold text-center mb-16">Questions fréquentes</h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                className="border border-[var(--color-muted)]/20 rounded-3xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-8 py-6 flex justify-between items-center text-left font-medium text-lg hover:bg-gray-50 transition"
                >
                  {faq.q}
                  <span className={`transition-transform ${openFaq === index ? 'rotate-180' : ''}`}>↓</span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === index ? "auto" : 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-8 pb-8 text-[var(--color-muted)] leading-relaxed">
                    {faq.a}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dernier CTA */}
      <section className="py-28 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-5xl font-heading font-semibold mb-8">Prêt à réussir votre TEF IRN ?</h2>
          <Link 
            href="/auth" 
            className="inline-block px-14 py-7 rounded-3xl bg-white text-[var(--color-primary)] font-semibold text-2xl hover:scale-105 transition-all shadow-2xl"
          >
            Commencer gratuitement — 14 jours
          </Link>
        </div>
      </section>

      <footer className="bg-[var(--color-surface)] py-12 text-center text-sm text-[var(--color-muted)]">
        © 2026 L&apos;Académie Moderne — Préparation TEF IRN avec IA
      </footer>
    </div>
  );
}
