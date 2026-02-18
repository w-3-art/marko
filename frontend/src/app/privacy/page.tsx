'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function PrivacyPolicy() {
  const { locale, changeLocale } = useTranslation();
  const lastUpdated = '18 février 2026';

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--border)]">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-2xl">🚀</span>
            <span>Marko</span>
          </Link>
          <button
            onClick={() => changeLocale(locale === 'en' ? 'fr' : 'en')}
            className="btn-ghost text-sm px-2 py-1"
          >
            {locale === 'en' ? '🇫🇷 FR' : '🇬🇧 EN'}
          </button>
        </div>
      </header>

      <div className="pt-24 pb-20 px-4">
        <div className="container max-w-3xl mx-auto">
          <div className="glass p-8 rounded-2xl">
            {locale === 'fr' ? (
              <>
                <h1 className="text-3xl font-bold mb-2">Politique de Confidentialité</h1>
                <p className="text-[var(--muted)] text-sm mb-8">Dernière mise à jour : {lastUpdated}</p>

                <div className="space-y-8 text-sm leading-relaxed">
                  <section>
                    <h2 className="text-xl font-semibold mb-3">1. Qui sommes-nous</h2>
                    <p className="text-[var(--muted)]">
                      Marko est un assistant marketing IA développé pour aider les petites et moyennes entreprises à gérer leur présence sur les réseaux sociaux. Notre application est accessible à l'adresse <strong>marko.w3art.io</strong>.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">2. Données collectées</h2>
                    <div className="text-[var(--muted)] space-y-3">
                      <p><strong className="text-[var(--foreground)]">Données de compte :</strong> nom, adresse email, mot de passe (hashé), nom de l'entreprise.</p>
                      <p><strong className="text-[var(--foreground)]">Données Meta/Instagram :</strong> tokens d'accès OAuth, informations sur vos Pages Facebook et comptes Instagram Business (username, nombre d'abonnés).</p>
                      <p><strong className="text-[var(--foreground)]">Conversations :</strong> historique de vos échanges avec Marko (notre assistant IA), nécessaire pour maintenir le contexte.</p>
                      <p><strong className="text-[var(--foreground)]">Données analytiques :</strong> métriques de vos posts et campagnes (impressions, portée, engagement) récupérées via l'API Meta.</p>
                      <p><strong className="text-[var(--foreground)]">Cookies :</strong> cookie de session pour maintenir votre connexion.</p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">3. Comment nous utilisons vos données</h2>
                    <ul className="text-[var(--muted)] space-y-2 list-disc list-inside">
                      <li>Vous connecter et sécuriser votre compte</li>
                      <li>Interagir avec l'API Meta en votre nom (publication, analytics)</li>
                      <li>Permettre à Marko de vous donner des conseils marketing contextualisés</li>
                      <li>Améliorer notre service</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">4. Base légale (RGPD)</h2>
                    <div className="text-[var(--muted)] space-y-2">
                      <p>Le traitement de vos données repose sur :</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li><strong className="text-[var(--foreground)]">Exécution du contrat</strong> : pour fournir le service Marko</li>
                        <li><strong className="text-[var(--foreground)]">Consentement</strong> : pour la connexion à Meta/Instagram (révocable à tout moment)</li>
                        <li><strong className="text-[var(--foreground)]">Intérêts légitimes</strong> : pour améliorer notre service</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">5. Partage des données</h2>
                    <div className="text-[var(--muted)] space-y-2">
                      <p>Nous partageons vos données uniquement avec :</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li><strong className="text-[var(--foreground)]">Anthropic</strong> : pour le traitement IA des conversations (politique de confidentialité : anthropic.com/privacy)</li>
                        <li><strong className="text-[var(--foreground)]">Meta Platforms</strong> : via leur API (pour publier et analyser votre contenu)</li>
                        <li><strong className="text-[var(--foreground)]">Railway / Vercel</strong> : hébergement de l'application</li>
                      </ul>
                      <p className="mt-2">Nous ne vendons jamais vos données à des tiers.</p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">6. Conservation des données</h2>
                    <p className="text-[var(--muted)]">
                      Vos données sont conservées tant que votre compte est actif. Vous pouvez supprimer votre compte et toutes vos données à tout moment depuis les paramètres.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">7. Vos droits (RGPD)</h2>
                    <ul className="text-[var(--muted)] space-y-2 list-disc list-inside">
                      <li><strong className="text-[var(--foreground)]">Accès</strong> : obtenir une copie de vos données</li>
                      <li><strong className="text-[var(--foreground)]">Rectification</strong> : corriger vos données</li>
                      <li><strong className="text-[var(--foreground)]">Suppression</strong> : effacer votre compte et données</li>
                      <li><strong className="text-[var(--foreground)]">Portabilité</strong> : recevoir vos données dans un format standard</li>
                      <li><strong className="text-[var(--foreground)]">Opposition</strong> : vous opposer à certains traitements</li>
                      <li><strong className="text-[var(--foreground)]">Retrait du consentement</strong> : révoquer l'accès Meta à tout moment</li>
                    </ul>
                    <p className="text-[var(--muted)] mt-3">Pour exercer ces droits : <strong>privacy@marko.ai</strong></p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">8. Sécurité</h2>
                    <p className="text-[var(--muted)]">
                      Vos mots de passe sont hashés (bcrypt). Les tokens Meta sont chiffrés. Toutes les communications sont en HTTPS. Nous utilisons des JWT signés pour l'authentification.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">9. Contact</h2>
                    <p className="text-[var(--muted)]">
                      Pour toute question : <strong>privacy@marko.ai</strong>
                    </p>
                  </section>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
                <p className="text-[var(--muted)] text-sm mb-8">Last updated: February 18, 2026</p>

                <div className="space-y-8 text-sm leading-relaxed">
                  <section>
                    <h2 className="text-xl font-semibold mb-3">1. Who We Are</h2>
                    <p className="text-[var(--muted)]">
                      Marko is an AI marketing assistant built to help small and medium businesses manage their social media presence. Our application is available at <strong>marko.w3art.io</strong>.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">2. Data We Collect</h2>
                    <div className="text-[var(--muted)] space-y-3">
                      <p><strong className="text-[var(--foreground)]">Account data:</strong> name, email address, password (hashed), company name.</p>
                      <p><strong className="text-[var(--foreground)]">Meta/Instagram data:</strong> OAuth access tokens, information about your Facebook Pages and Instagram Business accounts (username, follower count).</p>
                      <p><strong className="text-[var(--foreground)]">Conversations:</strong> your chat history with Marko (our AI assistant), required to maintain context.</p>
                      <p><strong className="text-[var(--foreground)]">Analytics data:</strong> metrics from your posts and campaigns (impressions, reach, engagement) retrieved via the Meta API.</p>
                      <p><strong className="text-[var(--foreground)]">Cookies:</strong> session cookie to keep you logged in.</p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">3. How We Use Your Data</h2>
                    <ul className="text-[var(--muted)] space-y-2 list-disc list-inside">
                      <li>Authenticate and secure your account</li>
                      <li>Interact with the Meta API on your behalf (publishing, analytics)</li>
                      <li>Allow Marko to give you contextualized marketing advice</li>
                      <li>Improve our service</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">4. Legal Basis (GDPR)</h2>
                    <div className="text-[var(--muted)] space-y-2">
                      <p>Processing of your data is based on:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li><strong className="text-[var(--foreground)]">Contract performance</strong>: to provide the Marko service</li>
                        <li><strong className="text-[var(--foreground)]">Consent</strong>: for Meta/Instagram connection (revocable at any time)</li>
                        <li><strong className="text-[var(--foreground)]">Legitimate interests</strong>: to improve our service</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">5. Data Sharing</h2>
                    <div className="text-[var(--muted)] space-y-2">
                      <p>We only share your data with:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li><strong className="text-[var(--foreground)]">Anthropic</strong>: for AI processing of conversations (privacy policy: anthropic.com/privacy)</li>
                        <li><strong className="text-[var(--foreground)]">Meta Platforms</strong>: via their API (to publish and analyze your content)</li>
                        <li><strong className="text-[var(--foreground)]">Railway / Vercel</strong>: application hosting</li>
                      </ul>
                      <p className="mt-2">We never sell your data to third parties.</p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
                    <p className="text-[var(--muted)]">
                      Your data is retained as long as your account is active. You can delete your account and all associated data at any time from Settings.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">7. Your Rights (GDPR)</h2>
                    <ul className="text-[var(--muted)] space-y-2 list-disc list-inside">
                      <li><strong className="text-[var(--foreground)]">Access</strong>: obtain a copy of your data</li>
                      <li><strong className="text-[var(--foreground)]">Rectification</strong>: correct your data</li>
                      <li><strong className="text-[var(--foreground)]">Erasure</strong>: delete your account and data</li>
                      <li><strong className="text-[var(--foreground)]">Portability</strong>: receive your data in a standard format</li>
                      <li><strong className="text-[var(--foreground)]">Objection</strong>: object to certain processing</li>
                      <li><strong className="text-[var(--foreground)]">Withdraw consent</strong>: revoke Meta access at any time</li>
                    </ul>
                    <p className="text-[var(--muted)] mt-3">To exercise these rights: <strong>privacy@marko.ai</strong></p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">8. Security</h2>
                    <p className="text-[var(--muted)]">
                      Passwords are hashed (bcrypt). Meta tokens are encrypted. All communications use HTTPS. We use signed JWTs for authentication.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">9. Contact</h2>
                    <p className="text-[var(--muted)]">
                      Any questions: <strong>privacy@marko.ai</strong>
                    </p>
                  </section>
                </div>
              </>
            )}

            <div className="mt-10 pt-6 border-t border-[var(--border)] flex gap-4">
              <Link href="/" className="btn btn-ghost text-sm">← {locale === 'fr' ? 'Retour' : 'Back'}</Link>
              <Link href="/terms" className="btn btn-ghost text-sm">{locale === 'fr' ? 'CGU →' : 'Terms →'}</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
