/**
 * API client for Marko backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('marko_token', token);
    } else {
      localStorage.removeItem('marko_token');
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('marko_token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || 'An error occurred');
    }

    return response.json();
  }

  // Auth
  async register(email: string, password: string, name?: string, companyName?: string) {
    const data = await this.request<{ access_token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, company_name: companyName }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request<{ access_token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async getMe() {
    return this.request<{
      id: number;
      email: string;
      name: string | null;
      company_name: string | null;
    }>('/api/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Chat
  async getConversations() {
    return this.request<Array<{
      id: number;
      title: string;
      created_at: string;
    }>>('/api/chat/conversations');
  }

  async getConversation(id: number) {
    return this.request<{
      id: number;
      title: string;
      messages: Array<{
        id: number;
        role: string;
        content: string;
        created_at: string;
      }>;
    }>(`/api/chat/conversations/${id}`);
  }

  async sendMessage(message: string, conversationId?: number) {
    return this.request<{
      conversation_id: number;
      message: { id: number; role: string; content: string; created_at: string };
      response: { id: number; role: string; content: string; created_at: string };
    }>('/api/chat/send', {
      method: 'POST',
      body: JSON.stringify({ message, conversation_id: conversationId }),
    });
  }

  async deleteConversation(id: number) {
    return this.request<{ status: string }>(`/api/chat/conversations/${id}`, {
      method: 'DELETE',
    });
  }

  // Meta
  async getMetaStatus() {
    return this.request<{
      connected: boolean;
      facebook_page?: string;
      instagram_username?: string;
    }>('/api/meta/status');
  }

  async getMetaConnectUrl() {
    return this.request<{ oauth_url: string }>('/api/meta/connect');
  }

  async disconnectMeta() {
    return this.request<{ status: string }>('/api/meta/disconnect', {
      method: 'DELETE',
    });
  }

  // Content
  async generateContent(data: {
    content_type: string;
    platform: string;
    brief: string;
    brand_voice?: string;
    target_audience?: string;
    objective?: string;
  }) {
    return this.request<{
      caption: string;
      hashtags: string[];
      cta: string;
      visual_suggestion: string;
      best_time: string;
      strategy_notes: string;
    }>('/api/content/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createContent(data: {
    title?: string;
    content_type: string;
    platform: string;
    caption: string;
    media_urls?: string[];
    hashtags?: string[];
    scheduled_for?: string;
  }) {
    return this.request<any>('/api/content/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listContent(params?: {
    status?: string;
    content_type?: string;
    platform?: string;
  }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.request<Array<any>>(`/api/content/?${query}`);
  }

  async publishContent(id: number) {
    return this.request<{ status: string; post_id: string }>(`/api/content/${id}/publish`, {
      method: 'POST',
    });
  }

  // Campaigns
  async listCampaigns() {
    return this.request<Array<any>>('/api/campaigns/');
  }

  async createCampaign(data: { name: string; description?: string; objective?: string }) {
    return this.request<any>('/api/campaigns/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateStrategy(campaignId: number, data: {
    business_description: string;
    goals: string;
    budget?: number;
    duration_days?: number;
  }) {
    return this.request<any>(`/api/campaigns/${campaignId}/generate-strategy`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Analytics
  async getAnalyticsOverview(days: number = 30) {
    return this.request<{
      total_content: number;
      published_content: number;
      total_impressions: number;
      total_reach: number;
      total_engagement: number;
      average_engagement_rate: number;
    }>(`/api/analytics/overview?days=${days}`);
  }

  async getTopContent(limit: number = 10) {
    return this.request<Array<any>>(`/api/analytics/top-content?limit=${limit}`);
  }
}

export const api = new ApiClient();
export default api;
