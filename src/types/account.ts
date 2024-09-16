export interface Account {
  id: number;
  account_source_id: string;
  name: string;
  type: string;
  subtype: string;
  balance: number;
  currency_code: string;
  is_active: boolean;
}