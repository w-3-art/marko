'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useTranslation, Locale } from '@/lib/i18n';
import AnimatedDemo from '@/components/AnimatedDemo';
import PricingSection from '@/components/PricingSection';
import CookieBanner from '@/components/CookieBanner';

export default function Home() {
  const router = useRouter();
  const { t, locale, changeLocale } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          await api.getMe();
          setIsAuthenticated(true);
          router.push('/chat');
        } catch {
          api.logout();
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl logo-pulse">🚀</div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  const features = [
    { icon: '💬', key: 'chat' },
    { icon: '📱', key: 'meta' },
    { icon: '📊', key: 'analytics' },
    { icon: '🎯', key: 'strategy' },
    { icon: '✨', key: 'organic' },
    { icon: '📈', key: 'paid' },
  ];

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--border)]">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-2xl">🚀</span>
            <span>{t('app.name')}</span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language switcher */}
            <button
              onClick={() => changeLocale(locale === 'en' ? 'fr' : 'en')}
              className="btn-ghost text-sm px-2 py-1"
            >
              {locale === 'en' ? '🇫🇷 FR' : '🇬🇧 EN'}
            </button>
            
            <a href="#pricing" className="btn btn-ghost text-sm hidden sm:flex">
              {locale === 'fr' ? 'Tarifs' : 'Pricing'}
            </a>
            <Link href="/login" className="btn btn-ghost text-sm hidden sm:flex">
              {t('nav.login')}
            </Link>
            <Link href="/register" className="btn btn-primary text-sm">
              {t('nav.signup')}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container text-center">
          <div className="slide-up">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {t('hero.title')}{' '}
              <span className="gradient-text">{t('hero.title.highlight')}</span>
            </h1>
            <p className="text-lg sm:text-xl text-[var(--muted)] mb-10 max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/register" className="btn btn-primary text-base px-8 py-4">
                {t('hero.cta')} →
              </Link>
              <a href="#demo" className="btn btn-secondary text-base px-8 py-4">
                {t('hero.cta.secondary')}
              </a>
            </div>
          </div>
          
          {/* Demo Chat - Animated */}
          <div id="demo" className="max-w-2xl mx-auto">
            <AnimatedDemo />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('features.title')}</h2>
            <p className="text-[var(--muted)]">{t('features.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature) => (
              <div key={feature.key} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">
                  {t(`feature.${feature.key}.title`)}
                </h3>
                <p className="text-[var(--muted)] text-sm">
                  {t(`feature.${feature.key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container">
          <div className="glass p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-transparent"></div>
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t('cta.title')}</h2>
              <p className="text-[var(--muted)] mb-8">{t('cta.subtitle')}</p>
              <Link href="/register" className="btn btn-primary text-base px-8 py-4">
                {t('cta.button')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[var(--border)]">
        <div className="container text-center text-[var(--muted)] text-sm space-y-2">
          <p>{t('footer.built')} 🔥 {t('footer.by')} • 2026</p>
          <div className="flex justify-center gap-4">
            <Link href="/privacy" className="hover:text-[var(--foreground)] transition-colors">
              {locale === 'fr' ? 'Confidentialité' : 'Privacy Policy'}
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-[var(--foreground)] transition-colors">
              {locale === 'fr' ? 'CGU' : 'Terms of Service'}
            </Link>
          </div>
        </div>
      </footer>

      {/* Cookie Banner */}
      <CookieBanner />
    </main>
  );
}
