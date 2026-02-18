'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function TermsOfService() {
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
                <h1 className="text-3xl font-bold mb-2">Conditions Générales d'Utilisation</h1>
                <p className="text-[var(--muted)] text-sm mb-8">Dernière mise à jour : {lastUpdated}</p>

                <div className="space-y-8 text-sm leading-relaxed">
                  <section>
                    <h2 className="text-xl font-semibold mb-3">1. Acceptation des conditions</h2>
                    <p className="text-[var(--muted)]">
                      En utilisant Marko, vous acceptez les présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le service.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">2. Description du service</h2>
                    <p className="text-[var(--muted)]">
                      Marko est un assistant marketing IA qui vous aide à créer du contenu, gérer votre présence sur Instagram et Facebook, et analyser vos performances. Le service fonctionne via l'API Meta (Facebook/Instagram).
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">3. Création de compte</h2>
                    <ul className="text-[var(--muted)] space-y-2 list-disc list-inside">
                      <li>Vous devez avoir 18 ans ou plus pour utiliser Marko</li>
                      <li>Vous êtes responsable de la sécurité de vos identifiants</li>
                      <li>Un seul compte par personne/entreprise</li>
                      <li>Les informations fournies doivent être exactes</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">4. Utilisation acceptable</h2>
                    <div className="text-[var(--muted)] space-y-3">
                      <p>Vous vous engagez à :</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Respecter les <Link href="https://www.facebook.com/policies" className="text-[var(--primary)] underline">Conditions d'utilisation de Meta</Link></li>
                        <li>Ne publier que du contenu légal et que vous avez le droit d'utiliser</li>
                        <li>Ne pas utiliser Marko à des fins de spam ou de manipulation</li>
                        <li>Ne pas tenter de contourner les mesures de sécurité</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">5. Contenu publié</h2>
                    <p className="text-[var(--muted)]">
                      Vous êtes seul responsable du contenu publié via Marko sur vos comptes. Marko n'est qu'un outil de facilitation — la décision finale de publication vous appartient toujours. Nous ne cautionnons pas et ne sommes pas responsables du contenu que vous publiez.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">6. Propriété intellectuelle</h2>
                    <p className="text-[var(--muted)]">
                      Le contenu généré par Marko (suggestions, textes, stratégies) vous appartient. Vous conservez tous les droits sur votre contenu et vos données. Marko se réserve le droit d'utiliser les interactions anonymisées pour améliorer le service.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">7. Tarifs et paiement</h2>
                    <div className="text-[var(--muted)] space-y-2">
                      <p>Les tarifs sont affichés sur notre page de prix. Toute modification tarifaire sera notifiée 30 jours à l'avance.</p>
                      <p>Les abonnements sont sans engagement et résiliables à tout moment (effectif à la fin de la période en cours).</p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">8. Disponibilité du service</h2>
                    <p className="text-[var(--muted)]">
                      Nous visons une disponibilité maximale mais ne garantissons pas un fonctionnement ininterrompu. Certaines interruptions peuvent résulter de la disponibilité de l'API Meta, hors de notre contrôle.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">9. Limitation de responsabilité</h2>
                    <p className="text-[var(--muted)]">
                      Marko est fourni "en l'état". Nous ne sommes pas responsables des pertes de données, pertes de revenus, ou dommages indirects résultant de l'utilisation du service. Notre responsabilité totale ne peut excéder le montant payé au cours des 3 derniers mois.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">10. Résiliation</h2>
                    <p className="text-[var(--muted)]">
                      Vous pouvez supprimer votre compte à tout moment. Nous nous réservons le droit de suspendre ou résilier un compte en cas de violation des présentes CGU, sans préavis si nécessaire.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">11. Droit applicable</h2>
                    <p className="text-[var(--muted)]">
                      Ces CGU sont régies par le droit français. Tout litige sera soumis aux tribunaux compétents de France.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">12. Contact</h2>
                    <p className="text-[var(--muted)]">
                      Pour toute question : <strong>hello@marko.ai</strong>
                    </p>
                  </section>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
                <p className="text-[var(--muted)] text-sm mb-8">Last updated: February 18, 2026</p>

                <div className="space-y-8 text-sm leading-relaxed">
                  <section>
                    <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                    <p className="text-[var(--muted)]">
                      By using Marko, you agree to these Terms of Service. If you do not agree, please do not use the service.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
                    <p className="text-[var(--muted)]">
                      Marko is an AI marketing assistant that helps you create content, manage your Instagram and Facebook presence, and analyze your performance. The service operates via the Meta API (Facebook/Instagram).
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">3. Account Creation</h2>
                    <ul className="text-[var(--muted)] space-y-2 list-disc list-inside">
                      <li>You must be 18 or older to use Marko</li>
                      <li>You are responsible for the security of your credentials</li>
                      <li>One account per person/company</li>
                      <li>Information provided must be accurate</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">4. Acceptable Use</h2>
                    <div className="text-[var(--muted)] space-y-3">
                      <p>You agree to:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Comply with <Link href="https://www.facebook.com/policies" className="text-[var(--primary)] underline">Meta's Terms of Service</Link></li>
                        <li>Only publish content that is legal and that you have the right to use</li>
                        <li>Not use Marko for spam or manipulation</li>
                        <li>Not attempt to bypass security measures</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">5. Published Content</h2>
                    <p className="text-[var(--muted)]">
                      You are solely responsible for content published via Marko on your accounts. Marko is only a facilitation tool — the final publishing decision always belongs to you. We do not endorse and are not responsible for content you publish.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
                    <p className="text-[var(--muted)]">
                      Content generated by Marko (suggestions, texts, strategies) belongs to you. You retain all rights to your content and data. Marko reserves the right to use anonymized interactions to improve the service.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">7. Pricing and Payment</h2>
                    <div className="text-[var(--muted)] space-y-2">
                      <p>Prices are displayed on our pricing page. Any price changes will be notified 30 days in advance.</p>
                      <p>Subscriptions are commitment-free and can be cancelled at any time (effective at the end of the current period).</p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">8. Service Availability</h2>
                    <p className="text-[var(--muted)]">
                      We aim for maximum availability but do not guarantee uninterrupted service. Some interruptions may result from Meta API availability, which is outside our control.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
                    <p className="text-[var(--muted)]">
                      Marko is provided "as is". We are not liable for data loss, revenue loss, or indirect damages resulting from use of the service. Our total liability cannot exceed the amount paid in the last 3 months.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">10. Termination</h2>
                    <p className="text-[var(--muted)]">
                      You may delete your account at any time. We reserve the right to suspend or terminate an account for violation of these Terms, without notice if necessary.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">11. Governing Law</h2>
                    <p className="text-[var(--muted)]">
                      These Terms are governed by French law. Any disputes will be submitted to the competent courts of France.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">12. Contact</h2>
                    <p className="text-[var(--muted)]">
                      Any questions: <strong>hello@marko.ai</strong>
                    </p>
                  </section>
                </div>
              </>
            )}

            <div className="mt-10 pt-6 border-t border-[var(--border)] flex gap-4">
              <Link href="/" className="btn btn-ghost text-sm">← {locale === 'fr' ? 'Retour' : 'Back'}</Link>
              <Link href="/privacy" className="btn btn-ghost text-sm">{locale === 'fr' ? 'Confidentialité →' : 'Privacy →'}</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
