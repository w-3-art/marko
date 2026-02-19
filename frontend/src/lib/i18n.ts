/**
 * Simple i18n system for Marko
 */

export type Locale = 'en' | 'fr';

export const translations = {
  en: {
    // Common
    'app.name': 'Marko',
    'app.tagline': 'Your AI CMO',
    'app.description': 'AI-powered marketing assistant for small businesses',
    
    // Navigation
    'nav.login': 'Log in',
    'nav.signup': 'Get Started',
    'nav.chat': 'Chat',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Log out',
    
    // Landing
    'hero.title': 'Your AI',
    'hero.title.highlight': 'Marketing Team',
    'hero.subtitle': 'Strategy, content creation, publishing. Organic + Paid. All in one conversation.',
    'hero.cta': 'Start Free',
    'hero.cta.secondary': 'See Demo',
    
    'features.title': 'Everything you need',
    'features.subtitle': 'One tool to rule them all',
    
    'feature.chat.title': 'Natural Chat',
    'feature.chat.description': 'Talk naturally. Marko understands your business and creates tailored content.',
    
    'feature.meta.title': 'Meta Integration',
    'feature.meta.description': 'Instagram, Facebook, Ads. Publish directly from Marko with one click.',
    
    'feature.analytics.title': 'Smart Analytics',
    'feature.analytics.description': 'Understand what works with clear explanations, not complex dashboards.',
    
    'feature.strategy.title': 'AI Strategy',
    'feature.strategy.description': 'Get a complete marketing strategy tailored to your business in seconds.',
    
    'feature.organic.title': 'Organic Content',
    'feature.organic.description': 'Posts, Stories, Reels. Marko creates content that resonates with your audience.',
    
    'feature.paid.title': 'Paid Campaigns',
    'feature.paid.description': 'Create and manage Meta Ads with AI-optimized targeting and creatives.',
    
    'demo.placeholder': 'Try asking: "Help me create a post for my new product launch"',
    'demo.user': 'I\'m launching a new organic tea line, help me with my Instagram strategy',
    'demo.assistant': 'Great project! 🍵 For your organic tea line on Instagram, here\'s my strategy:\n\n**Vibe:** Authentic, zen, nature\n\n**Content Mix:**\n- Recipe Reels (2/week)\n- Behind-the-scenes Stories\n- Educational posts about benefits\n\nWant me to generate the first pieces of content?',
    
    'cta.title': 'Ready to transform your marketing?',
    'cta.subtitle': 'Join thousands of businesses already using Marko',
    'cta.button': 'Get Started Free',
    
    'footer.built': 'Built with',
    'footer.by': 'by Echo',
    
    // Auth
    'auth.login.title': 'Welcome back',
    'auth.login.subtitle': 'Log in to continue to Marko',
    'auth.login.button': 'Log in',
    'auth.login.loading': 'Logging in...',
    'auth.login.noAccount': 'Don\'t have an account?',
    'auth.login.signup': 'Sign up',
    
    'auth.register.title': 'Create your account',
    'auth.register.subtitle': 'Start using Marko in 30 seconds',
    'auth.register.button': 'Create account',
    'auth.register.loading': 'Creating...',
    'auth.register.hasAccount': 'Already have an account?',
    'auth.register.login': 'Log in',
    
    'auth.email': 'Email',
    'auth.email.placeholder': 'you@company.com',
    'auth.password': 'Password',
    'auth.password.placeholder': 'Min. 8 characters',
    'auth.name': 'Your name',
    'auth.name.placeholder': 'John',
    'auth.company': 'Company name',
    'auth.company.placeholder': 'Acme Inc',
    
    // Chat
    'chat.welcome.title': 'Hey, I\'m Marko! 👋',
    'chat.welcome.subtitle': 'Your AI CMO. Tell me what you want to do: create content, launch a campaign, or just chat about strategy.',
    'chat.placeholder': 'Talk to Marko...',
    'chat.suggestions.1': 'Tell me about your business 🏪',
    'chat.suggestions.2': 'Create my first Instagram post ✨',
    'chat.suggestions.3': 'Analyze my marketing strategy 📊',
    'chat.newChat': 'New chat',
    'chat.disclaimer': 'Marko can make mistakes. Verify important information.',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.meta.title': 'Meta Connection',
    'dashboard.meta.connect': 'Connect Meta',
    'dashboard.meta.disconnect': 'Disconnect',
    'dashboard.meta.description': 'Connect Instagram and Facebook to publish directly from Marko',
    'dashboard.stats.content': 'Content created',
    'dashboard.stats.published': 'Published',
    'dashboard.stats.impressions': 'Impressions',
    'dashboard.stats.engagement': 'Engagement',
    'dashboard.recent': 'Recent content',
    'dashboard.recent.empty': 'No content yet',
    'dashboard.recent.create': 'Ask Marko to create some →',
  },
  
  fr: {
    // Common
    'app.name': 'Marko',
    'app.tagline': 'Ton CMO AI',
    'app.description': 'Assistant marketing IA pour les petites entreprises',
    
    // Navigation
    'nav.login': 'Connexion',
    'nav.signup': 'Commencer',
    'nav.chat': 'Chat',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Déconnexion',
    
    // Landing
    'hero.title': 'Ton équipe',
    'hero.title.highlight': 'Marketing IA',
    'hero.subtitle': 'Stratégie, création, publication. Organic + Paid. Le tout en une conversation.',
    'hero.cta': 'Essayer Gratuit',
    'hero.cta.secondary': 'Voir la Démo',
    
    'features.title': 'Tout ce qu\'il te faut',
    'features.subtitle': 'Un seul outil pour tout gérer',
    
    'feature.chat.title': 'Chat Naturel',
    'feature.chat.description': 'Parle naturellement. Marko comprend ton business et crée du contenu adapté.',
    
    'feature.meta.title': 'Intégration Meta',
    'feature.meta.description': 'Instagram, Facebook, Ads. Publie directement depuis Marko en un clic.',
    
    'feature.analytics.title': 'Analytics Clairs',
    'feature.analytics.description': 'Comprends ce qui marche avec des explications simples, pas des tableaux complexes.',
    
    'feature.strategy.title': 'Stratégie IA',
    'feature.strategy.description': 'Obtiens une stratégie marketing complète adaptée à ton business en quelques secondes.',
    
    'feature.organic.title': 'Contenu Organique',
    'feature.organic.description': 'Posts, Stories, Reels. Marko crée du contenu qui résonne avec ton audience.',
    
    'feature.paid.title': 'Campagnes Payantes',
    'feature.paid.description': 'Crée et gère tes Meta Ads avec un ciblage et des créatifs optimisés par l\'IA.',
    
    'demo.placeholder': 'Essaie : "Aide-moi à créer un post pour le lancement de mon produit"',
    'demo.user': 'Je lance une nouvelle gamme de thé bio, aide-moi avec ma stratégie Instagram',
    'demo.assistant': 'Super projet ! 🍵 Pour ta gamme de thé bio sur Instagram, voici ma stratégie :\n\n**Vibe :** Authentique, zen, nature\n\n**Mix de contenu :**\n- Reels recettes (2/sem)\n- Stories coulisses\n- Posts éducatifs sur les bienfaits\n\nTu veux que je génère les premiers contenus ?',
    
    'cta.title': 'Prêt à transformer ton marketing ?',
    'cta.subtitle': 'Rejoins des milliers d\'entreprises qui utilisent déjà Marko',
    'cta.button': 'Commencer Gratuitement',
    
    'footer.built': 'Built with',
    'footer.by': 'par Echo',
    
    // Auth
    'auth.login.title': 'Bon retour',
    'auth.login.subtitle': 'Connecte-toi pour continuer sur Marko',
    'auth.login.button': 'Se connecter',
    'auth.login.loading': 'Connexion...',
    'auth.login.noAccount': 'Pas encore de compte ?',
    'auth.login.signup': 'Créer un compte',
    
    'auth.register.title': 'Créer ton compte',
    'auth.register.subtitle': 'Commence à utiliser Marko en 30 secondes',
    'auth.register.button': 'Créer mon compte',
    'auth.register.loading': 'Création...',
    'auth.register.hasAccount': 'Déjà un compte ?',
    'auth.register.login': 'Se connecter',
    
    'auth.email': 'Email',
    'auth.email.placeholder': 'toi@entreprise.com',
    'auth.password': 'Mot de passe',
    'auth.password.placeholder': 'Min. 8 caractères',
    'auth.name': 'Ton prénom',
    'auth.name.placeholder': 'Marie',
    'auth.company': 'Nom de l\'entreprise',
    'auth.company.placeholder': 'Ma Super Boîte',
    
    // Chat
    'chat.welcome.title': 'Salut, je suis Marko ! 👋',
    'chat.welcome.subtitle': 'Ton CMO AI. Dis-moi ce que tu veux faire : créer du contenu, lancer une campagne, ou simplement discuter stratégie.',
    'chat.placeholder': 'Parle à Marko...',
    'chat.suggestions.1': 'Parle-moi de ton activité 🏪',
    'chat.suggestions.2': 'Créer mon premier post Instagram ✨',
    'chat.suggestions.3': 'Analyser ma stratégie marketing 📊',
    'chat.newChat': 'Nouvelle conversation',
    'chat.disclaimer': 'Marko peut faire des erreurs. Vérifie les informations importantes.',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.meta.title': 'Connexion Meta',
    'dashboard.meta.connect': 'Connecter Meta',
    'dashboard.meta.disconnect': 'Déconnecter',
    'dashboard.meta.description': 'Connecte Instagram et Facebook pour publier directement depuis Marko',
    'dashboard.stats.content': 'Contenus créés',
    'dashboard.stats.published': 'Publiés',
    'dashboard.stats.impressions': 'Impressions',
    'dashboard.stats.engagement': 'Engagement',
    'dashboard.recent': 'Contenus récents',
    'dashboard.recent.empty': 'Pas encore de contenu',
    'dashboard.recent.create': 'Demande à Marko d\'en créer →',
  },
};

export function getTranslation(locale: Locale, key: string): string {
  return translations[locale][key as keyof typeof translations['en']] || key;
}

export function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'fr' ? 'fr' : 'en';
}

// React hook for i18n
import { useState, useEffect, useCallback } from 'react';

export function useTranslation() {
  const [locale, setLocale] = useState<Locale>('en');
  
  useEffect(() => {
    const saved = localStorage.getItem('marko_locale') as Locale;
    if (saved && (saved === 'en' || saved === 'fr')) {
      setLocale(saved);
    } else {
      setLocale(detectLocale());
    }
  }, []);
  
  const t = useCallback((key: string) => getTranslation(locale, key), [locale]);
  
  const changeLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('marko_locale', newLocale);
  }, []);
  
  return { t, locale, changeLocale };
}
