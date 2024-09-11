import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Stack, Group, Text, Loader, Button, Alert } from '@mantine/core';
import { InvestmentsTable } from '../features/investments/components/InvestmentsTable';
import { Investment } from '@/types/investment';
import { usePlaidLink } from 'react-plaid-link';
import { createLinkToken, exchangePublicToken } from '../lib/plaid';
import { IconAlertCircle } from '@tabler/icons-react';

export default function InvestmentsPage() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getLinkToken = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await createLinkToken();
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

  const fetchInvestments = useCallback(async (token: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/investments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: token }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setInvestments(data);
    } catch (err) {
      console.error('Error fetching investments:', err);
      setError('Failed to fetch investments: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onSuccess = useCallback(async (public_token: string) => {
    try {
      const token = await exchangePublicToken(public_token);
      setAccessToken(token);
      await fetchInvestments(token);
    } catch (err) {
      console.error('Failed to exchange public token:', err);
      setError('Failed to exchange public token: ' + (err instanceof Error ? err.message : String(err)));
    }
  }, [fetchInvestments]);

  const config: Parameters<typeof usePlaidLink>[0] = {
    token: linkToken!,
    onSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  return (
    <DashboardLayout>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text size="xl" fw={700}>Investments</Text>
        </Group>
        
        {error && (
          <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">
            {error}
          </Alert>
        )}
        
        {isLoading ? (
          <Loader />
        ) : investments.length > 0 ? (
          <InvestmentsTable investments={investments} />
        ) : (
          <Text>No investments found. Please link an account to view your investments.</Text>
        )}

        <Group justify="flex-end">
          <Button 
            onClick={() => open()}
            disabled={!ready || isLoading}
            loading={isLoading}
          >
            {accessToken ? 'Reconnect investment account' : 'Connect an investment account'}
          </Button>
        </Group>
      </Stack>
    </DashboardLayout>
  );
}