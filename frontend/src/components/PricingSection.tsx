'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

interface PricingTier {
  name: string;
  price: number;
  priceYearly: number;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

export default function PricingSection() {
  const { locale } = useTranslation();
  const [isYearly, setIsYearly] = useState(false);

  const content = locale === 'fr' ? {
    title: 'Tarifs simples et transparents',
    subtitle: 'Pas de frais cachés. Annulez quand vous voulez.',
    monthly: 'Mensuel',
    yearly: 'Annuel',
    yearlyDiscount: '-20%',
    perMonth: '/mois',
    billedYearly: 'facturé annuellement',
    startFree: 'Commencer gratuitement',
    tiers: [
      {
        name: 'Starter',
        price: 0,
        priceYearly: 0,
        description: 'Pour découvrir Marko et tester le concept',
        features: [
          '50 messages IA/mois',
          '1 compte Meta connecté',
          'Suggestions de contenu',
          'Analyse basique',
          'Support email'
        ],
        cta: 'Commencer gratuitement'
      },
      {
        name: 'Pro',
        price: 29,
        priceYearly: 23,
        description: 'Pour les entrepreneurs qui veulent grandir',
        features: [
          'Messages IA illimités',
          '3 comptes Meta',
          'Publication programmée',
          'Stratégie personnalisée',
          'Analyse des concurrents',
          'Support prioritaire',
          'Export des rapports'
        ],
        cta: 'Essai gratuit 14 jours',
        popular: true
      },
      {
        name: 'Business',
        price: 79,
        priceYearly: 63,
        description: 'Pour les équipes et agences',
        features: [
          'Tout dans Pro +',
          '10 comptes Meta',
          'Gestion multi-marques',
          'API access',
          'Campagnes publicitaires',
          'Budget optimizer IA',
          'Account manager dédié',
          'SLA 99.9%'
        ],
        cta: 'Contacter les ventes'
      }
    ] as PricingTier[]
  } : {
    title: 'Simple, transparent pricing',
    subtitle: 'No hidden fees. Cancel anytime.',
    monthly: 'Monthly',
    yearly: 'Yearly',
    yearlyDiscount: '-20%',
    perMonth: '/month',
    billedYearly: 'billed yearly',
    startFree: 'Start for free',
    tiers: [
      {
        name: 'Starter',
        price: 0,
        priceYearly: 0,
        description: 'Discover Marko and test the concept',
        features: [
          '50 AI messages/month',
          '1 Meta account',
          'Content suggestions',
          'Basic analytics',
          'Email support'
        ],
        cta: 'Start for free'
      },
      {
        name: 'Pro',
        price: 29,
        priceYearly: 23,
        description: 'For entrepreneurs ready to grow',
        features: [
          'Unlimited AI messages',
          '3 Meta accounts',
          'Scheduled posting',
          'Personalized strategy',
          'Competitor analysis',
          'Priority support',
          'Report exports'
        ],
        cta: '14-day free trial',
        popular: true
      },
      {
        name: 'Business',
        price: 79,
        priceYearly: 63,
        description: 'For teams and agencies',
        features: [
          'Everything in Pro +',
          '10 Meta accounts',
          'Multi-brand management',
          'API access',
          'Ad campaigns',
          'AI budget optimizer',
          'Dedicated account manager',
          '99.9% SLA'
        ],
        cta: 'Contact sales'
      }
    ] as PricingTier[]
  };

  return (
    <section id="pricing" className="py-20 px-4">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{content.title}</h2>
          <p className="text-[var(--muted)] mb-8">{content.subtitle}</p>
          
          {/* Toggle */}
          <div className="inline-flex items-center gap-3 glass px-4 py-2 rounded-full">
            <span className={`text-sm ${!isYearly ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>
              {content.monthly}
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isYearly ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isYearly ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>
              {content.yearly}
            </span>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
              {content.yearlyDiscount}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {content.tiers.map((tier, idx) => (
            <div
              key={tier.name}
              className={`relative glass rounded-2xl p-6 ${
                tier.popular 
                  ? 'border-2 border-[var(--primary)] scale-105 shadow-lg shadow-[var(--primary)]/20' 
                  : 'border border-[var(--border)]'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {locale === 'fr' ? 'Le plus populaire' : 'Most popular'}
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <p className="text-sm text-[var(--muted)] mb-4">{tier.description}</p>
                
                <div className="flex items-baseline justify-center gap-1">
                  {tier.price === 0 ? (
                    <span className="text-4xl font-bold">
                      {locale === 'fr' ? 'Gratuit' : 'Free'}
                    </span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">
                        €{isYearly ? tier.priceYearly : tier.price}
                      </span>
                      <span className="text-[var(--muted)]">{content.perMonth}</span>
                    </>
                  )}
                </div>
                
                {isYearly && tier.price > 0 && (
                  <p className="text-xs text-[var(--muted)] mt-1">{content.billedYearly}</p>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`btn w-full text-center ${
                  tier.popular ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>{locale === 'fr' ? 'Paiement sécurisé' : 'Secure payment'}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{locale === 'fr' ? 'Annulation facile' : 'Easy cancellation'}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span>{locale === 'fr' ? 'Sans engagement' : 'No commitment'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
