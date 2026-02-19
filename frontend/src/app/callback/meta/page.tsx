'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface FacebookPage {
  id: string;
  name: string;
  has_instagram: boolean;
  access_token?: string;
  instagram_account?: {
    id: string;
    username: string;
  };
}

interface AdAccount {
  id: string;
  name: string;
}

type Step = 'loading' | 'error' | 'select-page' | 'success';

function MetaCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [step, setStep] = useState<Step>('loading');
  const [error, setError] = useState<string>('');
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth error
    if (errorParam) {
      setError(errorDescription || errorParam || 'Facebook authorization failed');
      setStep('error');
      return;
    }

    // Validate required params
    if (!code || !state) {
      setError('Missing authorization code or state. Please try connecting again.');
      setStep('error');
      return;
    }

    // Exchange code for token
    handleCallback(code, state);
  }, [searchParams]);

  const handleCallback = async (code: string, state: string) => {
    try {
      const response = await api.metaCallback({ code, state });
      
      if (response.pages && response.pages.length > 0) {
        setPages(response.pages);
        setAdAccounts(response.ad_accounts || []);
        setStep('select-page');
      } else {
        setError('No Facebook Pages found. Please ensure you have at least one Facebook Page connected to your account.');
        setStep('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect Meta account');
      setStep('error');
    }
  };

  const handleSelectPage = async () => {
    if (!selectedPage) return;
    
    setIsSubmitting(true);
    
    try {
      await api.selectMetaPage({
        page_id: selectedPage.id,
        page_name: selectedPage.name,
        page_token: selectedPage.access_token || '',
        instagram_account_id: selectedPage.instagram_account?.id,
        instagram_username: selectedPage.instagram_account?.username,
      });
      
      setStep('success');
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to configure Meta account');
      setStep('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    router.push('/dashboard');
  };

  return (
    <div className="glass p-6 sm:p-8">
      {/* Loading State */}
      {step === 'loading' && (
        <div className="text-center py-8">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <h2 className="text-xl font-semibold mb-2">Connecting to Meta...</h2>
          <p className="text-[var(--muted)]">Please wait while we verify your account.</p>
        </div>
      )}

      {/* Error State */}
      {step === 'error' && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-semibold mb-2 text-red-400">Connection Failed</h2>
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
          <button
            onClick={handleRetry}
            className="btn btn-primary"
          >
            Return to Dashboard
          </button>
        </div>
      )}

      {/* Page Selection */}
      {step === 'select-page' && (
        <>
          <h2 className="text-xl font-semibold mb-2 text-center">Select Your Page</h2>
          <p className="text-[var(--muted)] text-center text-sm mb-6">
            Choose the Facebook Page you want to use with Marko.
          </p>

          <div className="space-y-3 mb-6">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => setSelectedPage(page)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedPage?.id === page.id
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                    : 'border-[var(--glass-border)] hover:border-[var(--primary)]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{page.name}</div>
                    {page.has_instagram && page.instagram_account && (
                      <div className="text-sm text-[var(--muted)] mt-1">
                        📸 @{page.instagram_account.username}
                      </div>
                    )}
                  </div>
                  {selectedPage?.id === page.id && (
                    <span className="text-[var(--primary)] text-xl">✓</span>
                  )}
                </div>
                {page.has_instagram && !page.instagram_account && (
                  <div className="text-xs text-[var(--muted)] mt-2">
                    Instagram Business account available
                  </div>
                )}
              </button>
            ))}
          </div>

          {adAccounts.length > 0 && (
            <div className="mb-6 p-4 bg-[var(--glass-bg)] rounded-lg">
              <div className="text-sm text-[var(--muted)] mb-2">
                📊 Ad Accounts Available: {adAccounts.length}
              </div>
              <div className="text-xs text-[var(--muted)]">
                {adAccounts.map(a => a.name).join(', ')}
              </div>
            </div>
          )}

          <button
            onClick={handleSelectPage}
            disabled={!selectedPage || isSubmitting}
            className="btn btn-primary w-full"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span>
                Configuring...
              </>
            ) : (
              'Continue with Selected Page'
            )}
          </button>
        </>
      )}

      {/* Success State */}
      {step === 'success' && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-xl font-semibold mb-2 text-green-400">Connected Successfully!</h2>
          <p className="text-[var(--muted)] mb-4">
            Your Meta account is now connected. Redirecting to dashboard...
          </p>
          <div className="animate-spin text-2xl">🚀</div>
        </div>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="glass p-6 sm:p-8">
      <div className="text-center py-8">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <h2 className="text-xl font-semibold mb-2">Loading...</h2>
        <p className="text-[var(--muted)]">Please wait...</p>
      </div>
    </div>
  );
}

export default function MetaCallbackPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold">
            <span className="text-3xl logo-pulse">🚀</span>
            <span>Marko</span>
          </Link>
        </div>

        <Suspense fallback={<LoadingFallback />}>
          <MetaCallbackContent />
        </Suspense>
      </div>
    </main>
  );
}
