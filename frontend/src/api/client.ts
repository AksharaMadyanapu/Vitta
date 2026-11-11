/**
 * Runway API Client
 * Typed client for interacting with the Runway FastAPI backend.
 */

export interface RunwayData {
  runway_days: number;
  runway_label: string;
  status: 'Healthy' | 'Watch' | 'Urgent';
  status_key: 'safe' | 'caution' | 'high_risk';
  expected_shortfall_date: string | null;
  expected_shortfall_amount: number | null;
  total_bank_balance: number;
  shortfall_prob_30: number;
  one_line_reason: string;
}

export interface AttentionItem {
  id: string;
  title: string;
  amount: number;
  amount_formatted: string;
  link_text: string;
  route: string;
  due_label: string;
  urgent: boolean;
  severity: 'safe' | 'caution' | 'high_risk';
}

export interface BankAccountItem {
  id: number;
  account_number: string;
  bank_name: string;
  account_type: string;
  current_balance: number;
  is_connected: boolean;
}

export interface DashboardSummaryData {
  total_bank_balance: number;
  total_receivables_30d: number;
  total_payables_30d: number;
  overdue_receivables: number;
  overdue_receivables_count: number;
  late_payment_borrowing_cost: number;
  borrowing_rate_annual: number;
  attention_items: AttentionItem[];
  accounts: BankAccountItem[];
}

export interface TopDriver {
  rank: number;
  invoice_id: number | null;
  invoice_number: string | null;
  type: 'receivable' | 'payable' | 'recurring';
  amount: number;
  due_date: string | null;
  counterparty_id: number | null;
  impact: number;
  plain_reason: string;
}

export interface ForecastData {
  horizon_days: number;
  as_of: string;
  days: string[];
  p10: number[];
  p50: number[];
  p90: number[];
  shortfall_prob_14: number;
  shortfall_prob_30: number;
  shortfall_prob_60: number;
  expected_shortfall_date: string | null;
  expected_shortfall_amount: number | null;
  risk_level: 'safe' | 'caution' | 'high_risk';
  top_drivers: TopDriver[];
  simulation_count: number;
  elapsed_ms: number;
}

export interface OverrideItem {
  customer_id?: number;
  supplier_id?: number;
  invoice_id?: number;
  pays_days_earlier?: number;
  delay_days?: number;
  paid_on_day?: number;
}

export interface BacktestData {
  as_of: string;
  crunch_date: string;
  days_before_crunch: number;
  predicted_days: string[];
  predicted_p50: number[];
  predicted_p10: number[];
  shortfall_prob_30: number;
  shortfall_prob_14: number;
  predicted_shortfall_date: string | null;
  summary: string;
  elapsed_ms: number;
}

export interface ActionCardItem {
  id: string;
  title: string;
  why: string;
  impact: string;
  before_prob: number;
  after_prob: number;
  before_runway: number;
  after_runway: number;
  cost: number;
  cash_gain: number;
  effort: 'Low' | 'Medium' | 'High';
  category: 'receivable' | 'payable' | 'expense';
  badge: string;
  related_party?: string;
  related_amount?: number;
  applied?: boolean;
}

export interface SourceChip {
  label: string;
  value: string;
}

export interface ChatResponse {
  reply: string;
  sources: SourceChip[];
  suggested_actions?: string[];
}

export interface AssessRequest {
  type: 'purchase' | 'sale' | 'expense';
  party: string;
  amount: number;
  date: string;
  payment_terms: number;
}

export interface AlternativeOption {
  id: string;
  title: string;
  description: string;
  shortfall_prob: number;
  lowest_balance: number;
  verdict: 'safe' | 'caution' | 'high_risk';
  extra_items: any[];
}

export interface AssessResponse {
  verdict: 'safe' | 'caution' | 'high_risk';
  explanation: string;
  before_prob: number;
  after_prob: number;
  before_lowest: number;
  after_lowest: number;
  lowest_date: string;
  days: string[];
  before_curve: number[];
  after_curve: number[];
  alternatives: AlternativeOption[];
}

export interface ConfirmRequest {
  type: string;
  party: string;
  amount: number;
  date: string;
  notes?: string;
  alternative_id?: string;
}

export interface ReminderItem {
  id: string;
  invoice_id: number;
  invoice_number: string;
  party_id: number;
  party_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  amount: number;
  amount_formatted: string;
  due_date: string;
  days_left: number;
  status: 'overdue' | 'due_soon' | 'upcoming';
  status_label: string;
  messages: {
    en: string;
    hi: string;
    te: string;
  };
  whatsapp_url: string;
  last_sent_at?: string;
}

export interface HealthData {
  status: string;
  service: string;
  company: string;
  timestamp: string;
  database: string;
}

const API_BASE = (((import.meta as any).env?.VITE_API_URL as string) || '/api').replace(/\/+$/, '');

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 10000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export const api = {
  getHealth: async (): Promise<HealthData> => {
    const res = await fetchWithTimeout(`${API_BASE}/health`, {}, 15000);
    if (!res.ok) throw new Error('Server health check failed');
    return res.json();
  },

  getRunway: async (): Promise<RunwayData> => {
    const res = await fetchWithTimeout(`${API_BASE}/runway`);
    if (!res.ok) throw new Error('Failed to fetch runway metric');
    return res.json();
  },

  getSummary: async (): Promise<DashboardSummaryData> => {
    const res = await fetchWithTimeout(`${API_BASE}/summary`);
    if (!res.ok) throw new Error('Failed to fetch summary data');
    return res.json();
  },

  getForecast: async (horizon_days: number = 30): Promise<ForecastData> => {
    const res = await fetchWithTimeout(`${API_BASE}/forecast?horizon_days=${horizon_days}`);
    if (!res.ok) throw new Error('Failed to fetch forecast');
    return res.json();
  },

  postForecast: async (
    horizon_days: number,
    overrides?: OverrideItem[],
    extra_items?: any[]
  ): Promise<ForecastData> => {
    const res = await fetchWithTimeout(`${API_BASE}/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        horizon_days,
        overrides: overrides || null,
        extra_items: extra_items || null,
      }),
    });
    if (!res.ok) throw new Error('Failed to run forecast simulation');
    return res.json();
  },

  getBacktest: async (days_before_crunch: number = 21): Promise<BacktestData> => {
    const res = await fetchWithTimeout(`${API_BASE}/forecast/backtest?days_before_crunch=${days_before_crunch}`);
    if (!res.ok) throw new Error('Failed to fetch backtest');
    return res.json();
  },

  getRecommendations: async (): Promise<ActionCardItem[]> => {
    const res = await fetchWithTimeout(`${API_BASE}/recommendations`);
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },

  chatCopilot: async (message: string, history?: any[]): Promise<ChatResponse> => {
    const res = await fetchWithTimeout(`${API_BASE}/copilot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    }, 25000);
    if (!res.ok) throw new Error('Failed to contact Copilot');
    return res.json();
  },

  assessPurchase: async (data: AssessRequest): Promise<AssessResponse> => {
    const res = await fetchWithTimeout(`${API_BASE}/risk/assess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }, 15000);
    if (!res.ok) throw new Error('Failed to assess purchase risk');
    return res.json();
  },

  confirmPurchase: async (data: ConfirmRequest): Promise<any> => {
    const res = await fetchWithTimeout(`${API_BASE}/risk/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to confirm transaction');
    return res.json();
  },

  getReminders: async (): Promise<ReminderItem[]> => {
    const res = await fetchWithTimeout(`${API_BASE}/reminders`);
    if (!res.ok) throw new Error('Failed to fetch reminders');
    return res.json();
  },

  sendReminder: async (invoice_id: number, channel: string = 'whatsapp', language: string = 'en'): Promise<any> => {
    const res = await fetchWithTimeout(`${API_BASE}/reminders/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice_id, channel, language }),
    });
    if (!res.ok) throw new Error('Failed to log reminder');
    return res.json();
  },

  getParties: async (party_type?: 'customer' | 'supplier'): Promise<any[]> => {
    const url = party_type ? `${API_BASE}/parties?party_type=${party_type}` : `${API_BASE}/parties`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error('Failed to fetch counterparties');
    return res.json();
  },

  getParty: async (id: number): Promise<any> => {
    const res = await fetchWithTimeout(`${API_BASE}/parties/${id}`);
    if (!res.ok) throw new Error('Failed to fetch party details');
    return res.json();
  },

  getInvoices: async (params?: { invoice_type?: string; status?: string; limit?: number }): Promise<any> => {
    const query = new URLSearchParams();
    if (params?.invoice_type) query.set('invoice_type', params.invoice_type);
    if (params?.status) query.set('status', params.status);
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    const res = await fetchWithTimeout(`${API_BASE}/invoices${qs ? `?${qs}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch invoices');
    return res.json();
  },

  getTransactions: async (params?: { limit?: number; category?: string; account_id?: number }): Promise<any> => {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.category) query.set('category', params.category);
    if (params?.account_id) query.set('account_id', String(params.account_id));
    const qs = query.toString();
    const res = await fetchWithTimeout(`${API_BASE}/transactions${qs ? `?${qs}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  getAccounts: async (): Promise<BankAccountItem[]> => {
    const res = await fetchWithTimeout(`${API_BASE}/accounts`);
    if (!res.ok) throw new Error('Failed to fetch bank accounts');
    return res.json();
  },

  reseedDatabase: async (): Promise<{ ok: boolean; message: string }> => {
    const res = await fetchWithTimeout(`${API_BASE}/admin/reseed`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reseed database');
    return res.json();
  },
};
