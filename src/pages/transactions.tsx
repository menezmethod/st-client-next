import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Stack, Group, Button, Text } from '@mantine/core';
import { createLinkToken, exchangePublicToken } from '../lib/plaid';
import { usePlaidLink } from 'react-plaid-link';
import { TransactionsTable } from '../components/Transactions/TransactionsTable';

export default function Transactions() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLinkToken = async () => {
      setIsLoading(true);
      try {
        const token = await createLinkToken();
        setLinkToken(token);
      } catch (err) {
        setError('Failed to create link token');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkToken();
  }, []);

  const onSuccess = async (public_token: string) => {
    setIsLoading(true);
    try {
      const token = await exchangePublicToken(public_token);
      setAccessToken(token);
      // Here you would typically fetch real transactions using the access token
    } catch (err) {
      setError('Failed to exchange public token');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

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
        
        <TransactionsTable />
        
        <Group justify="flex-end">
          <Button 
            onClick={() => open()}
            disabled={!ready || isLoading}
            loading={isLoading}
          >
            Connect a bank account
          </Button>
        </Group>
      </Stack>
    </DashboardLayout>
  );
}