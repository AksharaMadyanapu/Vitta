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

const API_BASE = '/api';

export const api = {
  getRunway: async (): Promise<RunwayData> => {
    const res = await fetch(`${API_BASE}/runway`);
    if (!res.ok) throw new Error('Failed to fetch runway metric');
    return res.json();
  },

  getSummary: async (): Promise<DashboardSummaryData> => {
    const res = await fetch(`${API_BASE}/summary`);
    if (!res.ok) throw new Error('Failed to fetch summary data');
    return res.json();
  },

  getForecast: async (horizon_days: number = 30): Promise<ForecastData> => {
    const res = await fetch(`${API_BASE}/forecast?horizon_days=${horizon_days}`);
    if (!res.ok) throw new Error('Failed to fetch forecast');
    return res.json();
  },

  postForecast: async (
    horizon_days: number,
    overrides?: OverrideItem[],
    extra_items?: any[]
  ): Promise<ForecastData> => {
    const res = await fetch(`${API_BASE}/forecast`, {
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
    const res = await fetch(`${API_BASE}/forecast/backtest?days_before_crunch=${days_before_crunch}`);
    if (!res.ok) throw new Error('Failed to fetch backtest');
    return res.json();
  },

  reseedDatabase: async (): Promise<{ ok: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/admin/reseed`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reseed database');
    return res.json();
  },
};

