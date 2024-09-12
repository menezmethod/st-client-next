export interface Transaction {
  transaction_id: string;
  account_id: string;
  amount: number;
  iso_currency_code: string;
  unofficial_currency_code: string | null;
  category: string[] | null;
  category_id: string | null;
  check_number: string | null;
  date: string;
  datetime: string | null;
  authorized_date: string | null;
  authorized_datetime: string | null;
  location: {
    address: string | null;
    city: string | null;
    region: string | null;
    postal_code: string | null;
    country: string | null;
    lat: number | null;
    lon: number | null;
  };
  name: string;
  merchant_name: string | null;
  payment_channel: string;
  pending: boolean;
  pending_transaction_id: string | null;
  account_owner: string | null;
  transaction_code: string | null;
  transaction_type: string | null;
}