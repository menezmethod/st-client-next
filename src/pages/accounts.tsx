import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Stack, Group, Button, Text, Loader } from '@mantine/core';
import { createLinkToken, exchangePublicToken } from '../lib/plaid';
import { usePlaidLink } from 'react-plaid-link';
import { Accounts } from '../features/accounts/components/Accounts';
import { Account } from '@/types/account';

export default function AccountsPage() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
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
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: token }),
      });
      const fetchedAccounts = await response.json();
      console.log('Accounts fetched:', fetchedAccounts);
      setAccounts(fetchedAccounts);
    } catch (err) {
      console.error('Failed to exchange public token or fetch accounts:', err);
      setError('Failed to exchange public token or fetch accounts: ' + (err instanceof Error ? err.message : String(err)));
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
          <Text size="xl" fw={700}>Accounts</Text>
          {error && <Text c="red">{error}</Text>}
        </Group>
        
        {isLoading ? (
          <Loader />
        ) : accessToken ? (
          <Accounts accounts={accounts} />
        ) : (
          <Text>Connect a bank account to view your accounts.</Text>
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