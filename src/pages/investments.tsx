import React from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Stack, Group, Button, Text, Loader, Alert } from '@mantine/core';
import { InvestmentsTable } from '../features/investments/components/InvestmentsTable';
import { usePlaidLink } from '../hooks/usePlaidLink';
import { fetchInvestments } from '../lib/plaid';
import { IconAlertCircle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useErrorMessage } from '../hooks/useErrorMessage';
import { Investment, Security, Account } from '../types/investment';

interface InvestmentsData {
  holdings: Investment[];
  securities: Security[];
  accounts: Account[];
}

export default function InvestmentsPage() {
  const { initiatePlaidLink, isLoading: isLinkLoading } = usePlaidLink();

  const { 
    data: accessToken,
    isLoading: isAccessTokenLoading,
  } = useQuery<string | null>({
    queryKey: ['accessToken'],
  });

  const { 
    data: investmentsData, 
    isLoading: isInvestmentsLoading, 
    error: investmentsError 
  } = useQuery<InvestmentsData>({
    queryKey: ['investments', accessToken],
    queryFn: () => fetchInvestments(accessToken!),
    enabled: !!accessToken,
  });

  const isLoading = isLinkLoading || isAccessTokenLoading || isInvestmentsLoading;
  const errorMessage = useErrorMessage(investmentsError);

  return (
    <DashboardLayout>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text size="xl" fw={700}>Investments</Text>
          {errorMessage && (
            <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">
              {errorMessage}
            </Alert>
          )}
        </Group>
        
        {isLoading ? (
          <Loader />
        ) : accessToken ? (
          investmentsData ? (
            <InvestmentsTable 
              holdings={investmentsData.holdings || []}
              securities={investmentsData.securities || []}
              accounts={investmentsData.accounts || []}
            />
          ) : (
            <Text>No investment data available.</Text>
          )
        ) : (
          <Text>Connect an investment account to view your investments.</Text>
        )}

        <Group justify="flex-end">
          <Button 
            onClick={initiatePlaidLink}
            disabled={isLoading}
            loading={isLoading}
          >
            {accessToken ? 'Reconnect investment account' : 'Connect an investment account'}
          </Button>
        </Group>
      </Stack>
    </DashboardLayout>
  );
}
