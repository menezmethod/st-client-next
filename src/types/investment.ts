export interface Investment {
  id: number;
  user_id: string;
  holding_id: string;
  account_id: string; // Changed from number to string
  security_id: string | null;
  security_name: string;
  security_type: string | null;
  ticker_symbol: string | null;
  quantity: number;
  cost_basis: number | null;
  current_market_value: number;
  institution_value?: number; // Added as optional
  institution_price?: number; // Added as optional
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Security {
  security_id: string;
  name: string;
  type: string;
  ticker_symbol: string | null;
  iso_currency_code: string;
}

export interface Account {
  account_id: string;
  name: string;
  type: string;
  subtype: string;
}