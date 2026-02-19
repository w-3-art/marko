'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  generatedImage?: string; // URL of generated image for this message
  isPublishing?: boolean;
}

interface Conversation {
  id: number;
  title: string;
  created_at: string;
}

export default function ChatPage() {
  const router = useRouter();
  const { t, locale, changeLocale } = useTranslation();
  const [user, setUser] = useState<{ name: string | null; email: string } | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [metaStatus, setMetaStatus] = useState<{ connected: boolean; instagram_username?: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [generatingImageFor, setGeneratingImageFor] = useState<number | null>(null);
  const [publishingFor, setPublishingFor] = useState<number | null>(null);
  const [showPublishModal, setShowPublishModal] = useState<{ messageId: number; caption: string; imageUrl: string } | null>(null);
  const [onboardingTriggered, setOnboardingTriggered] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const init = async () => {
      try {
        const userData = await api.getMe();
        setUser(userData);
        
        const [convos, meta] = await Promise.all([
          api.getConversations(),
          api.getMetaStatus(),
        ]);
        
        setConversations(convos);
        setMetaStatus(meta);
        
        // Trigger onboarding for new users (no conversations)
        if (convos.length === 0 && !onboardingTriggered) {
          setOnboardingTriggered(true);
          triggerOnboarding();
        }
      } catch {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [router, onboardingTriggered]);
  
  // Trigger onboarding for new users
  const triggerOnboarding = async () => {
    setIsSending(true);
    try {
      const response = await api.sendMessage('ONBOARDING_START');
      setCurrentConversationId(response.conversation_id);
      setMessages([response.response as Message]);
      const convos = await api.getConversations();
      setConversations(convos);
    } catch (err) {
      console.error('Error triggering onboarding:', err);
    } finally {
      setIsSending(false);
    }
  };
  
  // Detect if a message looks like content (has hashtags, caption-like structure)
  const isContentMessage = (content: string): boolean => {
    const hasHashtags = /#\w+/.test(content);
    const hasEmojis = /[\u{1F300}-\u{1F9FF}]/u.test(content);
    const looksLikeCaption = content.length > 50 && (hasHashtags || hasEmojis);
    return looksLikeCaption;
  };
  
  // Extract caption text (remove strategy notes, keep main caption + hashtags)
  const extractCaption = (content: string): string => {
    // Try to extract just the caption part
    const lines = content.split('\n');
    const captionLines: string[] = [];
    let inCaption = false;
    
    for (const line of lines) {
      // Skip strategy/notes sections
      if (line.includes('Stratégie') || line.includes('Note') || line.includes('Meilleur moment')) {
        break;
      }
      // Start capturing after "Caption:" or similar headers
      if (line.includes('Caption') || line.includes('Texte') || line.includes('**Post**')) {
        inCaption = true;
        continue;
      }
      if (inCaption || /#\w+/.test(line) || line.trim().length > 20) {
        captionLines.push(line);
      }
    }
    
    return captionLines.join('\n').trim() || content;
  };
  
  // Generate image for a message
  const handleGenerateImage = async (messageId: number, content: string) => {
    setGeneratingImageFor(messageId);
    try {
      // Create a prompt based on the content
      const prompt = `Professional social media marketing image for: ${content.substring(0, 200)}. Modern, clean, Instagram-worthy style.`;
      const result = await api.generateImage(prompt);
      
      // Update the message with the generated image
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, generatedImage: result.image_url } : m
      ));
    } catch (err) {
      console.error('Error generating image:', err);
      alert('Erreur lors de la génération de l\'image');
    } finally {
      setGeneratingImageFor(null);
    }
  };
  
  // Open publish modal
  const handlePublishClick = (messageId: number, content: string, imageUrl?: string) => {
    const caption = extractCaption(content);
    setShowPublishModal({
      messageId,
      caption,
      imageUrl: imageUrl || ''
    });
  };
  
  // Publish to Instagram
  const handlePublish = async () => {
    if (!showPublishModal) return;
    
    setPublishingFor(showPublishModal.messageId);
    try {
      await api.publishToMeta({
        platform: 'instagram',
        content_type: 'post',
        caption: showPublishModal.caption,
        media_url: showPublishModal.imageUrl || undefined
      });
      alert('✅ Publié sur Instagram !');
      setShowPublishModal(null);
    } catch (err: any) {
      alert(`Erreur: ${err.message || 'Publication échouée'}`);
    } finally {
      setPublishingFor(null);
    }
  };

  const loadConversation = async (id: number) => {
    try {
      const convo = await api.getConversation(id);
      setMessages(convo.messages as Message[]);
      setCurrentConversationId(id);
      setSidebarOpen(false);
    } catch (err) {
      console.error('Error loading conversation:', err);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isSending) return;

    const messageText = inputValue.trim();
    setInputValue('');
    setIsSending(true);

    const tempUserMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await api.sendMessage(messageText, currentConversationId || undefined);
      
      if (!currentConversationId) {
        setCurrentConversationId(response.conversation_id);
        const convos = await api.getConversations();
        setConversations(convos);
      }

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempUserMessage.id);
        return [...filtered, response.message as Message, response.response as Message];
      });
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const newConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    api.logout();
    router.push('/');
  };

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl logo-pulse">🚀</div>
      </div>
    );
  }

  const suggestions = [
    t('chat.suggestions.1'),
    t('chat.suggestions.2'),
    t('chat.suggestions.3'),
  ];

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="p-4 border-b border-[var(--border)]">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-4">
            <span className="text-xl">🚀</span>
            <span>{t('app.name')}</span>
          </Link>
          <button onClick={newConversation} className="btn btn-primary w-full text-sm">
            + {t('chat.newChat')}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {conversations.map((convo) => (
            <button
              key={convo.id}
              onClick={() => loadConversation(convo.id)}
              className={`w-full text-left p-3 rounded-lg mb-1 transition-all text-sm ${
                currentConversationId === convo.id
                  ? 'bg-[var(--primary)]/20 text-[var(--primary-light)] border border-[var(--primary)]/30'
                  : 'hover:bg-[var(--card-hover)] text-[var(--muted)]'
              }`}
            >
              <div className="truncate">{convo.title}</div>
              <div className="text-xs opacity-60 mt-1">
                {new Date(convo.created_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-[var(--border)]">
          {metaStatus?.connected ? (
            <div className="badge badge-success mb-3 w-full justify-center">
              ✅ @{metaStatus.instagram_username || 'Meta'}
            </div>
          ) : (
            <Link href="/dashboard" className="btn btn-secondary w-full text-xs mb-3">
              {t('dashboard.meta.connect')}
            </Link>
          )}
          
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => changeLocale(locale === 'en' ? 'fr' : 'en')}
              className="btn-ghost text-xs px-2 py-1"
            >
              {locale === 'en' ? '🇫🇷' : '🇬🇧'}
            </button>
            <span className="text-xs text-[var(--muted)] truncate flex-1">
              {user?.name || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="btn-ghost text-xs text-[var(--muted)]"
            >
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-[var(--border)] glass">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-[var(--card)] rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <span className="font-bold">🚀 {t('app.name')}</span>
          <Link href="/dashboard" className="p-2 hover:bg-[var(--card)] rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
            </svg>
          </Link>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 max-w-xl mx-auto">
              <div className="text-5xl mb-4">👋</div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">{t('chat.welcome.title')}</h2>
              <p className="text-[var(--muted)] text-sm sm:text-base mb-8">
                {t('chat.welcome.subtitle')}
              </p>
              <div className="grid gap-2 w-full">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInputValue(suggestion)}
                    className="btn btn-secondary text-left text-sm p-3"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`message ${msg.role === 'user' ? 'message-user' : 'message-assistant'} text-sm sm:text-base`}
                    dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                  />
                  
                  {/* Generated Image Display */}
                  {msg.generatedImage && (
                    <div className="mt-2 rounded-lg overflow-hidden max-w-xs">
                      <img 
                        src={msg.generatedImage} 
                        alt="Generated" 
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                  
                  {/* Marko Actions - show for assistant content messages */}
                  {msg.role === 'assistant' && isContentMessage(msg.content) && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleGenerateImage(msg.id, msg.content)}
                        disabled={generatingImageFor === msg.id}
                        className="btn btn-secondary text-xs py-1 px-3 flex items-center gap-1"
                      >
                        {generatingImageFor === msg.id ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            Génération...
                          </>
                        ) : (
                          <>🎨 Générer une image</>
                        )}
                      </button>
                      
                      {metaStatus?.connected && (
                        <button
                          onClick={() => handlePublishClick(msg.id, msg.content, msg.generatedImage)}
                          disabled={publishingFor === msg.id}
                          className="btn btn-primary text-xs py-1 px-3 flex items-center gap-1"
                        >
                          {publishingFor === msg.id ? (
                            <>
                              <span className="animate-spin">⏳</span>
                              Publication...
                            </>
                          ) : (
                            <>📱 Publier sur Instagram</>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="message message-assistant">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="chat-input-container">
          <div className="max-w-3xl mx-auto relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={t('chat.placeholder')}
              className="chat-input text-sm sm:text-base"
              disabled={isSending}
            />
            <button
              onClick={sendMessage}
              disabled={isSending || !inputValue.trim()}
              className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                inputValue.trim() ? 'text-[var(--primary)]' : 'text-[var(--muted)]'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
          <p className="text-center text-xs text-[var(--muted)] mt-2 opacity-60">
            {t('chat.disclaimer')}
          </p>
        </div>
      </main>
      
      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold">📱 Publier sur Instagram</h3>
            
            {showPublishModal.imageUrl && (
              <div className="rounded-lg overflow-hidden">
                <img 
                  src={showPublishModal.imageUrl} 
                  alt="À publier" 
                  className="w-full h-auto"
                />
              </div>
            )}
            
            <div>
              <label className="text-sm text-[var(--muted)] block mb-1">Caption</label>
              <textarea
                value={showPublishModal.caption}
                onChange={(e) => setShowPublishModal({ ...showPublishModal, caption: e.target.value })}
                className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm min-h-[120px]"
              />
            </div>
            
            {!showPublishModal.imageUrl && (
              <div>
                <label className="text-sm text-[var(--muted)] block mb-1">URL de l&apos;image (optionnel)</label>
                <input
                  type="text"
                  value={showPublishModal.imageUrl}
                  onChange={(e) => setShowPublishModal({ ...showPublishModal, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm"
                />
              </div>
            )}
            
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowPublishModal(null)}
                className="btn btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={handlePublish}
                disabled={publishingFor !== null}
                className="btn btn-primary"
              >
                {publishingFor ? 'Publication...' : 'Publier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
