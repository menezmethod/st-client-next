export interface Investment {
  account_id: string;
  security_id: string;
  institution_price: number;
  institution_value: number;
  cost_basis: number;
  quantity: number;
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