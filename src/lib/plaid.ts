import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.NEXT_PUBLIC_PLAID_ENV as keyof typeof PlaidEnvironments || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.NEXT_PUBLIC_PLAID_CLIENT_ID!,
      'PLAID-SECRET': process.env.NEXT_PUBLIC_PLAID_SECRET!,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

export async function createLinkToken() {
  try {
    const response = await fetch('/api/create_link_token', { method: 'POST' });
    const data = await response.json();
    if (response.ok) {
      return data.link_token;
    } else {
      console.error('Failed to create link token:', data);
      throw new Error(data.error || 'Failed to create link token');
    }
  } catch (error) {
    console.error('Error creating link token:', error);
    throw error;
  }
}

export async function exchangePublicToken(public_token: string) {
  try {
    const response = await fetch('/api/exchange_public_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_token }),
    });
    const data = await response.json();
    if (response.ok) {
      return data.access_token;
    } else {
      throw new Error(data.error || 'Failed to exchange public token');
    }
  } catch (error) {
    console.error('Error exchanging public token:', error);
    throw error;
  }
}

export async function getTransactions(access_token: string) {
  const response = await plaidClient.transactionsGet({
    access_token,
    start_date: '2023-01-01',
    end_date: '2023-12-31',
  });
  return response.data.transactions;
}

export async function removeItem(access_token: string) {
  try {
    console.log('Removing existing Item...');
    const response = await fetch('/api/plaid/remove_item', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ access_token }),
    });
    const data = await response.json();
    if (response.ok) {
      console.log('Item removed successfully');
      return true;
    } else {
      console.error('Error removing Item:', data);
      throw new Error(data.error || 'Failed to remove Item');
    }
  } catch (error) {
    console.error('Error removing Item:', error);
    return false;
  }
}

export async function fetchTransactions(access_token: string) {
  try {
    const response = await fetch('/api/fetch_transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token }),
    });
    const data = await response.json();
    if (response.ok) {
      return data.transactions;
    } else {
      throw new Error(data.error || 'Failed to fetch transactions');
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}