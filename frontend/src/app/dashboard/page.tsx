'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [metaStatus, setMetaStatus] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [content, setContent] = useState<any[]>([]);
  const [allContent, setAllContent] = useState<any[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const [userData, meta, stats, contentList, allContentList] = await Promise.all([
          api.getMe(),
          api.getMetaStatus(),
          api.getAnalyticsOverview(30).catch(() => null),
          api.listContent({ limit: 5 } as any).catch(() => []),
          api.listContent({ limit: 50 } as any).catch(() => []),
        ]);
        
        setUser(userData);
        setMetaStatus(meta);
        setAnalytics(stats);
        setContent(contentList);
        setAllContent(allContentList);
      } catch {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [router]);
  
  // Group content by date for calendar view
  const groupContentByDate = (items: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    
    items.forEach(item => {
      const date = item.scheduled_for || item.published_at || item.created_at;
      const dateKey = new Date(date).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });
    
    // Sort by date descending
    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, items]) => ({ date, items }));
  };

  const handleConnectMeta = async () => {
    try {
      const { oauth_url } = await api.getMetaConnectUrl();
      window.location.href = oauth_url;
    } catch (err) {
      console.error('Error getting Meta connect URL:', err);
    }
  };

  const handleDisconnectMeta = async () => {
    if (confirm('Déconnecter ton compte Meta ?')) {
      try {
        await api.disconnectMeta();
        setMetaStatus({ connected: false });
      } catch (err) {
        console.error('Error disconnecting Meta:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-slow text-4xl">🚀</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/chat" className="flex items-center gap-2 text-xl font-bold">
            <span>🚀</span>
            <span>Marko</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/chat" className="text-gray-400 hover:text-white">
              Chat
            </Link>
            <Link href="/dashboard" className="text-white font-medium">
              Dashboard
            </Link>
            <div className="text-gray-400 text-sm">
              {user?.name || user?.email}
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Meta Connection */}
        <section className="card mb-8">
          <h2 className="text-xl font-bold mb-4">Connexion Meta</h2>
          {metaStatus?.connected ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl">
                  📸
                </div>
                <div>
                  <div className="font-medium">
                    {metaStatus.instagram_username && `@${metaStatus.instagram_username}`}
                  </div>
                  <div className="text-sm text-gray-400">
                    {metaStatus.facebook_page && `Page: ${metaStatus.facebook_page}`}
                  </div>
                </div>
              </div>
              <button onClick={handleDisconnectMeta} className="btn-secondary text-red-400">
                Déconnecter
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-xl font-medium mb-2">Connecte ton compte Meta</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Connecte Instagram et Facebook pour publier directement depuis Marko
              </p>
              <button onClick={handleConnectMeta} className="btn-primary">
                Connecter Meta
              </button>
            </div>
          )}
        </section>

        {/* Stats */}
        {analytics && (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card">
              <div className="text-3xl font-bold">{analytics.total_content}</div>
              <div className="text-gray-400 text-sm">Contenus créés</div>
            </div>
            <div className="card">
              <div className="text-3xl font-bold">{analytics.published_content}</div>
              <div className="text-gray-400 text-sm">Publiés</div>
            </div>
            <div className="card">
              <div className="text-3xl font-bold">
                {analytics.total_impressions > 1000
                  ? `${(analytics.total_impressions / 1000).toFixed(1)}K`
                  : analytics.total_impressions}
              </div>
              <div className="text-gray-400 text-sm">Impressions</div>
            </div>
            <div className="card">
              <div className="text-3xl font-bold">{analytics.average_engagement_rate}%</div>
              <div className="text-gray-400 text-sm">Engagement</div>
            </div>
          </section>
        )}

        {/* Content Calendar Toggle */}
        <section className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">📅 Calendrier de contenu</h2>
            <button 
              onClick={() => setShowCalendar(!showCalendar)}
              className="btn-secondary text-sm"
            >
              {showCalendar ? 'Masquer' : 'Voir tout'}
            </button>
          </div>
          
          {showCalendar && allContent.length > 0 ? (
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {groupContentByDate(allContent).map(({ date, items }) => (
                <div key={date} className="border-l-2 border-gray-700 pl-4">
                  <div className="text-sm font-medium text-gray-400 mb-2">
                    {new Date(date).toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </div>
                  <div className="space-y-2">
                    {items.map((item: any) => (
                      <div 
                        key={item.id}
                        className={`flex items-center gap-2 p-2 rounded ${
                          item.status === 'published' 
                            ? 'bg-green-500/10 border-l-2 border-green-500' 
                            : item.status === 'scheduled'
                            ? 'bg-yellow-500/10 border-l-2 border-yellow-500'
                            : 'bg-gray-800/50 border-l-2 border-gray-500'
                        }`}
                      >
                        <span className="text-lg">
                          {item.content_type === 'reel' && '🎬'}
                          {item.content_type === 'story' && '📱'}
                          {item.content_type === 'post' && '📷'}
                          {item.content_type === 'ad' && '📢'}
                          {!['reel', 'story', 'post', 'ad'].includes(item.content_type) && '📝'}
                        </span>
                        <span className="text-sm flex-1 truncate">
                          {item.title || item.caption?.substring(0, 50) || 'Sans titre'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          item.status === 'published' ? 'text-green-400' :
                          item.status === 'scheduled' ? 'text-yellow-400' : 'text-gray-400'
                        }`}>
                          {item.status === 'published' && '✓ Publié'}
                          {item.status === 'scheduled' && '⏰ Planifié'}
                          {item.status === 'draft' && '📝 Brouillon'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : showCalendar ? (
            <p className="text-gray-400 text-center py-4">
              Aucun contenu pour le moment. 
              <Link href="/chat" className="text-indigo-400 ml-1">Crée ton premier post →</Link>
            </p>
          ) : (
            <p className="text-gray-400 text-sm">
              Visualise tous tes posts passés et planifiés en un coup d&apos;œil.
            </p>
          )}
        </section>

        {/* Recent Content */}
        <section className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Contenus récents</h2>
            <Link href="/chat" className="text-indigo-400 hover:underline text-sm">
              Créer nouveau →
            </Link>
          </div>
          
          {content.length > 0 ? (
            <div className="space-y-3">
              {content.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-900 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {item.content_type === 'reel' && '🎬'}
                      {item.content_type === 'story' && '📱'}
                      {item.content_type === 'post' && '📷'}
                      {item.content_type === 'ad' && '📢'}
                      {!['reel', 'story', 'post', 'ad'].includes(item.content_type) && '📝'}
                    </div>
                    <div>
                      <div className="font-medium">{item.title || 'Sans titre'}</div>
                      <div className="text-sm text-gray-400">
                        {item.platform} • {item.content_type}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        item.status === 'published'
                          ? 'bg-green-500/20 text-green-400'
                          : item.status === 'scheduled'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {item.status === 'published' && 'Publié'}
                      {item.status === 'scheduled' && 'Planifié'}
                      {item.status === 'draft' && 'Brouillon'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>Pas encore de contenu</p>
              <Link href="/chat" className="text-indigo-400 hover:underline mt-2 inline-block">
                Demande à Marko d'en créer →
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
