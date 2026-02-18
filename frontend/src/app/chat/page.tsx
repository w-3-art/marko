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
      } catch {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [router]);

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
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`message ${msg.role === 'user' ? 'message-user' : 'message-assistant'} text-sm sm:text-base`}
                    dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                  />
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
    </div>
  );
}
