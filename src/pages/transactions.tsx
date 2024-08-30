import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Stack, Group, Button, Text, Loader } from '@mantine/core';
import { createLinkToken, exchangePublicToken, fetchTransactions } from '../lib/plaid';
import { usePlaidLink } from 'react-plaid-link';
import { TransactionsTable } from '../components/Transactions/TransactionsTable';

interface Transaction {
  transaction_id: string;
  date: string;
  name: string;
  amount: number;
  category: string[];
  pending: boolean;
}

export default function Transactions() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getLinkToken = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await createLinkToken();
      console.log('Link token created:', token);
      setLinkToken(token);
    } catch (err) {
      console.error('Failed to create link token:', err);
      setError('Failed to create link token: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getLinkToken();
  }, [getLinkToken]);

  const onSuccess = useCallback(async (public_token: string) => {
    setIsLoading(true);
    try {
      const token = await exchangePublicToken(public_token);
      console.log('Access token received:', token);
      setAccessToken(token);
      const fetchedTransactions = await fetchTransactions(token);
      console.log('Transactions fetched:', fetchedTransactions);
      setTransactions(fetchedTransactions);
    } catch (err) {
      console.error('Failed to exchange public token or fetch transactions:', err);
      setError('Failed to exchange public token or fetch transactions: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const config: Parameters<typeof usePlaidLink>[0] = {
    token: linkToken!,
    onSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  return (
    <DashboardLayout>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text size="xl" fw={700}>Transactions</Text>
          {error && <Text c="red">{error}</Text>}
        </Group>
        
        {isLoading ? (
          <Loader />
        ) : accessToken ? (
          <TransactionsTable transactions={transactions} />
        ) : (
          <Text>Connect a bank account to view transactions.</Text>
        )}
        
        <Group justify="flex-end">
          <Button 
            onClick={() => open()}
            disabled={!ready || isLoading}
            loading={isLoading}
          >
            {accessToken ? 'Reconnect bank account' : 'Connect a bank account'}
          </Button>
        </Group>
      </Stack>
    </DashboardLayout>
  );
}