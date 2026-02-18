'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';

const COOKIE_CONSENT_KEY = 'marko_cookie_consent';

export default function CookieBanner() {
  const { locale } = useTranslation();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  const handleCustomize = () => {
    // For MVP, just accept essential only
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  const content = locale === 'fr' ? {
    title: '🍪 Cookies',
    description: 'Nous utilisons des cookies pour améliorer votre expérience et analyser notre trafic. Vous pouvez accepter tous les cookies ou personnaliser vos préférences.',
    accept: 'Tout accepter',
    reject: 'Refuser',
    customize: 'Personnaliser',
    privacy: 'Politique de confidentialité'
  } : {
    title: '🍪 Cookies',
    description: 'We use cookies to enhance your experience and analyze our traffic. You can accept all cookies or customize your preferences.',
    accept: 'Accept all',
    reject: 'Reject',
    customize: 'Customize',
    privacy: 'Privacy Policy'
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-slide-up">
      <div className="container max-w-4xl mx-auto">
        <div className="glass border border-[var(--border)] rounded-2xl p-4 sm:p-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{content.title}</h3>
              <p className="text-sm text-[var(--muted)]">
                {content.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={handleReject}
                className="btn btn-ghost text-sm px-4 py-2 flex-1 sm:flex-none"
              >
                {content.reject}
              </button>
              <button
                onClick={handleCustomize}
                className="btn btn-secondary text-sm px-4 py-2 flex-1 sm:flex-none"
              >
                {content.customize}
              </button>
              <button
                onClick={handleAccept}
                className="btn btn-primary text-sm px-4 py-2 flex-1 sm:flex-none"
              >
                {content.accept}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
