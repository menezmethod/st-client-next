import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import axios from 'axios';
import { Investment, Security, Account } from '@/types/investment';
import { Transaction } from '@/types/transaction';

interface InvestmentsData {
  holdings: Investment[];
  securities: Security[];
  accounts: Account[];
}

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.NEXT_PUBLIC_PLAID_ENV as keyof typeof PlaidEnvironments || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
      'PLAID-SECRET': process.env.PLAID_SECRET_SANDBOX!,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

const apiClient = axios.create({
  baseURL: '/api/plaid',
});

export async function createLinkToken(): Promise<string> {
  const response = await apiClient.post<{ link_token: string }>('/create_link_token');
  return response.data.link_token;
}

export async function exchangePublicToken(data: { public_token: string; idToken: string }): Promise<string> {
  const response = await fetch('/api/plaid/exchange_public_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to exchange public token');
  }
  return response.json();
}

export async function removeItem(access_token: string): Promise<any> {
  const response = await apiClient.post('/remove_item', { access_token });
  return response.data;
}

async function fetchDataWithAccessToken<T>(endpoint: string, accessToken: string): Promise<T> {
  const response = await apiClient.post<T>(endpoint, { access_token: accessToken });
  return response.data;
}

export async function fetchAccounts(accessToken: string): Promise<Account[]> {
  console.log('Fetching accounts with access token:', accessToken);
  const accounts = await fetchDataWithAccessToken<Account[]>('/fetch_accounts', accessToken);
  console.log('Fetched accounts:', accounts);
  return accounts;
}

export async function fetchTransactions(accessToken: string): Promise<Transaction[]> {
  console.log('Fetching transactions with access token:', accessToken);
  const transactions = await fetchDataWithAccessToken<Transaction[]>('/fetch_transactions', accessToken);
  console.log('Fetched transactions:', transactions);
  return transactions;
}

export async function fetchInvestments(accessToken: string): Promise<InvestmentsData> {
  return fetchDataWithAccessToken<InvestmentsData>('/fetch_investments', accessToken);
}

// Add other Plaid-related functions as needed