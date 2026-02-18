'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n';

export default function LoginPage() {
  const router = useRouter();
  const { t, locale, changeLocale } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.login(email, password);
      router.push('/chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Language switcher */}
        <div className="text-center mb-4">
          <button
            onClick={() => changeLocale(locale === 'en' ? 'fr' : 'en')}
            className="btn-ghost text-sm px-2 py-1"
          >
            {locale === 'en' ? '🇫🇷 Français' : '🇬🇧 English'}
          </button>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold">
            <span className="text-3xl logo-pulse">🚀</span>
            <span>{t('app.name')}</span>
          </Link>
        </div>

        {/* Card */}
        <div className="glass p-6 sm:p-8">
          <h1 className="text-2xl font-bold mb-2 text-center">{t('auth.login.title')}</h1>
          <p className="text-[var(--muted)] text-center text-sm mb-6">{t('auth.login.subtitle')}</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder={t('auth.email.placeholder')}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full mt-6"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  {t('auth.login.loading')}
                </>
              ) : (
                t('auth.login.button')
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-[var(--muted)] text-sm">
            {t('auth.login.noAccount')}{' '}
            <Link href="/register" className="text-[var(--primary)] hover:underline">
              {t('auth.login.signup')}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
