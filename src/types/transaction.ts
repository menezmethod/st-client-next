export interface Transaction {
  id: number;
  user_id: string;
  account_id: number;
  transaction_source_id: string;
  transaction_source: string;
  amount: number;
  transaction_date: string;
  authorized_date: string | null;
  description: string;
  category: string[];
  transaction_type: string | null;
  pending: boolean;
  is_manual: boolean;
  metadata: Record<string, any>;
  is_duplicate: boolean;
  created_at: string;
  updated_at: string;
  last_modified: string;
  account_name: string;
}