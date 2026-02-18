'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from '@/lib/i18n';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface DemoScenario {
  id: string;
  titleFr: string;
  titleEn: string;
  iconEmoji: string;
  conversationFr: Message[];
  conversationEn: Message[];
}

const TYPING_SPEED = 25;
const MESSAGE_DELAY = 800;
const RESTART_DELAY = 2500;

// 3 Demo scenarios
const SCENARIOS: DemoScenario[] = [
  {
    id: 'onboarding',
    titleFr: 'Démarrage',
    titleEn: 'Getting Started',
    iconEmoji: '🚀',
    conversationFr: [
      { role: 'user', content: "Salut Marko ! Je viens d'ouvrir ma boutique de bijoux, je ne sais pas par où commencer sur Instagram." },
      { role: 'assistant', content: "Félicitations ! 🎉 Tu as un compte Instagram Business ? C'est essentiel pour les stats et la pub." },
      { role: 'user', content: "Oui j'ai un compte pro. Mais j'ai 0 followers 😅" },
      { role: 'assistant', content: "Parfait pour bien démarrer !\n\nTon plan semaine 1 :\n• 3 posts variés\n• 15 min/jour de commentaires\n• 1 Reel simple\n\nOn commence par quoi ?" },
    ],
    conversationEn: [
      { role: 'user', content: "Hey Marko! Just opened my jewelry shop, no idea where to start on Instagram." },
      { role: 'assistant', content: "Congrats! 🎉 Do you have an Instagram Business account? Essential for analytics and ads." },
      { role: 'user', content: "Yeah I have a pro account. But I have 0 followers 😅" },
      { role: 'assistant', content: "Perfect starting point!\n\nYour week 1 plan:\n• 3 varied posts\n• 15 min/day commenting\n• 1 simple Reel\n\nWhat do we start with?" },
    ],
  },
  {
    id: 'content',
    titleFr: 'Création de post',
    titleEn: 'Content Creation',
    iconEmoji: '✨',
    conversationFr: [
      { role: 'user', content: "J'ai une nouvelle collection, tu peux me faire un post ?" },
      { role: 'assistant', content: "Bien sûr ! Voici ma proposition :\n\n📸 Photo : ta pièce phare sur fond neutre\n\n✍️ \"Nouvelle collection Printemps 🌸\nChaque pièce raconte une histoire.\nLaquelle sera la vôtre ?\n\n#bijouxcreateur #madeinfrance\"\n\nJe publie ?" },
      { role: 'user', content: "Parfait ! Oui publie" },
      { role: 'assistant', content: "✅ Publié sur Instagram !\n\n📱 Voir le post : instagram.com/p/xyz123\n\nJe te fais un rapport dans 24h pour voir les performances. Bonne soirée ! 🌟" },
    ],
    conversationEn: [
      { role: 'user', content: "I have a new collection, can you create a post?" },
      { role: 'assistant', content: "Of course! Here's my proposal:\n\n📸 Photo: your hero piece on neutral background\n\n✍️ \"New Spring Collection 🌸\nEvery piece tells a story.\nWhich one will be yours?\n\n#handmadejewelry #artisan\"\n\nShall I publish?" },
      { role: 'user', content: "Perfect! Yes publish it" },
      { role: 'assistant', content: "✅ Published on Instagram!\n\n📱 View post: instagram.com/p/xyz123\n\nI'll send you a performance report in 24h. Have a great evening! 🌟" },
    ],
  },
  {
    id: 'proactive',
    titleFr: 'Insights proactifs',
    titleEn: 'Proactive Insights',
    iconEmoji: '📊',
    conversationFr: [
      { role: 'assistant', content: "📈 Alerte performance !\n\nTon Reel d'hier explose : 12K vues, 340 likes, 28 saves.\n\nC'est 5x ta moyenne ! Le format \"behind the scenes\" marche super bien avec ton audience." },
      { role: 'user', content: "Wow ! On fait quoi maintenant ?" },
      { role: 'assistant', content: "Je te propose 2 actions :\n\n1️⃣ Boost ce Reel (15€ → ~8K personnes ciblées)\n\n2️⃣ Créer un Reel similaire demain pour surfer sur la tendance\n\nTu préfères quoi ?" },
      { role: 'user', content: "On boost !" },
      { role: 'assistant', content: "🚀 Campagne lancée !\n\nBudget : 15€ sur 3 jours\nCible : Femmes 25-45, mode & bijoux, France\n\nJe t'envoie les résultats quotidiens. Let's go ! 💪" },
    ],
    conversationEn: [
      { role: 'assistant', content: "📈 Performance alert!\n\nYour Reel from yesterday is blowing up: 12K views, 340 likes, 28 saves.\n\nThat's 5x your average! The \"behind the scenes\" format works great with your audience." },
      { role: 'user', content: "Wow! What do we do now?" },
      { role: 'assistant', content: "I suggest 2 actions:\n\n1️⃣ Boost this Reel ($15 → ~8K targeted people)\n\n2️⃣ Create a similar Reel tomorrow to ride the trend\n\nWhich do you prefer?" },
      { role: 'user', content: "Let's boost it!" },
      { role: 'assistant', content: "🚀 Campaign launched!\n\nBudget: $15 over 3 days\nTarget: Women 25-45, fashion & jewelry, US\n\nI'll send you daily results. Let's go! 💪" },
    ],
  },
];

export default function AnimatedDemo() {
  const { locale } = useTranslation();
  const [currentScenario, setCurrentScenario] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [typingText, setTypingText] = useState('');
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number>(0);

  const scenario = SCENARIOS[currentScenario];
  const conversation = useMemo(() => 
    locale === 'fr' ? scenario.conversationFr : scenario.conversationEn
  , [locale, scenario]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Type text
  const typeText = useCallback((text: string, onChar: (partial: string) => void, onComplete: () => void) => {
    let index = 0;
    const type = () => {
      if (index <= text.length) {
        onChar(text.slice(0, index));
        index++;
        timeoutRef.current = setTimeout(type, TYPING_SPEED);
      } else {
        onComplete();
      }
    };
    type();
  }, []);

  // Process message
  const processMessage = useCallback((msgIndex: number, conv: Message[]) => {
    if (msgIndex >= conv.length) {
      timeoutRef.current = setTimeout(() => {
        setVisibleMessages([]);
        setTypingText('');
        setIsAssistantTyping(false);
        setInputValue('');
        animationRef.current++;
        processMessage(0, conv);
      }, RESTART_DELAY);
      return;
    }

    const msg = conv[msgIndex];

    if (msg.role === 'user') {
      typeText(
        msg.content,
        (partial) => setInputValue(partial),
        () => {
          timeoutRef.current = setTimeout(() => {
            setVisibleMessages(prev => [...prev, msg]);
            setInputValue('');
            timeoutRef.current = setTimeout(() => processMessage(msgIndex + 1, conv), 300);
          }, 200);
        }
      );
    } else {
      setIsAssistantTyping(true);
      timeoutRef.current = setTimeout(() => {
        setIsAssistantTyping(false);
        typeText(
          msg.content,
          (partial) => setTypingText(partial),
          () => {
            timeoutRef.current = setTimeout(() => {
              setVisibleMessages(prev => [...prev, msg]);
              setTypingText('');
              timeoutRef.current = setTimeout(() => processMessage(msgIndex + 1, conv), MESSAGE_DELAY);
            }, 200);
          }
        );
      }, 600);
    }
  }, [typeText]);

  // Reset and start animation
  const startAnimation = useCallback((conv: Message[]) => {
    cleanup();
    setVisibleMessages([]);
    setTypingText('');
    setIsAssistantTyping(false);
    setInputValue('');
    animationRef.current++;
    
    timeoutRef.current = setTimeout(() => {
      processMessage(0, conv);
    }, 400);
  }, [cleanup, processMessage]);

  // Start on mount and scenario change
  useEffect(() => {
    startAnimation(conversation);
    return cleanup;
  }, [currentScenario, locale]);

  // Scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleMessages, typingText, isAssistantTyping]);

  // Change scenario
  const goToScenario = (index: number) => {
    if (index >= 0 && index < SCENARIOS.length && index !== currentScenario) {
      setCurrentScenario(index);
    }
  };

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentScenario < SCENARIOS.length - 1) {
        goToScenario(currentScenario + 1);
      } else if (diff < 0 && currentScenario > 0) {
        goToScenario(currentScenario - 1);
      }
    }
  };

  return (
    <div className="glass p-4 sm:p-6 fade-in">
      {/* Scenario tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        {SCENARIOS.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => goToScenario(idx)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm whitespace-nowrap transition-all ${
              idx === currentScenario
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <span>{s.iconEmoji}</span>
            <span>{locale === 'fr' ? s.titleFr : s.titleEn}</span>
          </button>
        ))}
      </div>

      {/* Chat area with swipe */}
      <div 
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="space-y-3 mb-4 h-[260px] sm:h-[300px] overflow-y-auto scroll-smooth"
      >
        {visibleMessages.map((msg, idx) => (
          <div key={`${animationRef.current}-${idx}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`message ${msg.role === 'user' ? 'message-user' : 'message-assistant'} text-left text-sm sm:text-base whitespace-pre-line max-w-[85%]`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isAssistantTyping && (
          <div className="flex justify-start">
            <div className="message message-assistant">
              <div className="flex gap-1 py-1">
                <span className="w-2 h-2 bg-current rounded-full animate-bounce opacity-60" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-current rounded-full animate-bounce opacity-60" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-current rounded-full animate-bounce opacity-60" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        
        {typingText && (
          <div className="flex justify-start">
            <div className="message message-assistant text-left text-sm sm:text-base whitespace-pre-line max-w-[85%]">
              {typingText}
              <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse align-middle"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          placeholder={locale === 'fr' ? "Écris ton message..." : "Type your message..."}
          className="chat-input text-sm sm:text-base"
          readOnly
        />
        <button className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${inputValue ? 'text-[var(--primary)]' : 'text-[var(--muted)]'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>

      {/* Navigation dots + swipe hint */}
      <div className="flex items-center justify-center gap-2 mt-3">
        <span className="text-xs text-[var(--muted)] hidden sm:inline">←</span>
        {SCENARIOS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToScenario(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentScenario
                ? 'bg-[var(--primary)] w-4'
                : 'bg-[var(--muted)] hover:bg-[var(--foreground)]'
            }`}
          />
        ))}
        <span className="text-xs text-[var(--muted)] hidden sm:inline">→</span>
      </div>
      <p className="text-center text-xs text-[var(--muted)] mt-1 sm:hidden">
        {locale === 'fr' ? '← Swipe pour voir les autres démos →' : '← Swipe to see other demos →'}
      </p>
    </div>
  );
}
