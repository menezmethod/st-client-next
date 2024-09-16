import React, { useCallback, useMemo } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Stack, Group, Button, Text, Alert, Skeleton } from '@mantine/core';
import { IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useErrorMessage } from '@/hooks/useErrorMessage';
import { Investment, Security } from '@/types/investment';
import { Account } from '@/types/account'; // Assuming you have an Account type defined
import { usePlaid } from '@/contexts/PlaidContext';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { InvestmentsTable } from '@/features/investments/components/InvestmentsTable';

const InvestmentsPage: React.FC = React.memo(() => {
  const { initiatePlaidLink, isLoading: isPlaidLoading } = usePlaid();
  const { user } = useAuth();

  const {
    data: investmentsData,
    isLoading: isInvestmentsLoading,
    error: investmentsError,
    refetch: refetchInvestments
  } = useQuery<{ investments: Investment[], securities: Security[] }>({
    queryKey: ['investments'],
    queryFn: async () => {
      const token = await user?.getIdToken();
      const response = await axios.get<{ investments: Investment[], securities: Security[] }>('/api/investments', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    },
    enabled: !!user,
  });

  const {
    data: accountsData,
    isLoading: isAccountsLoading,
    error: accountsError
  } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: async () => {
      const token = await user?.getIdToken();
      const response = await axios.get<{ accounts: Account[] }>('/api/accounts', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.accounts;
    },
    enabled: !!user,
  });

  const isLoading = isPlaidLoading || isInvestmentsLoading || isAccountsLoading;
  const errorMessage = useErrorMessage(investmentsError || accountsError);

  const handleInitiatePlaidLink = useCallback(async () => {
    await initiatePlaidLink();
    refetchInvestments();
  }, [initiatePlaidLink, refetchInvestments]);

  const renderContent = useMemo(() => {
    if (isLoading) {
      return <Skeleton height={200} />;
    }
    if (investmentsData && investmentsData.investments.length > 0 && accountsData) {
      return (
        <InvestmentsTable 
          holdings={investmentsData.investments}
          securities={investmentsData.securities}
          accounts={accountsData}
        />
      );
    }
    return (
      <Alert variant="light" color="blue" title="No Investments Found" icon={<IconInfoCircle />}>
        No investments found. This could be due to no investments in the linked account or an error in fetching.
      </Alert>
    );
  }, [isLoading, investmentsData, accountsData]);

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
        
        {renderContent}
        
        <Group justify="flex-end">
          <Button 
            onClick={handleInitiatePlaidLink}
            disabled={isLoading}
            loading={isLoading}
          >
            {investmentsData && investmentsData.investments.length > 0 ? 'Reconnect investment account' : 'Connect an investment account'}
          </Button>
        </Group>
      </Stack>
    </DashboardLayout>
  );
});

InvestmentsPage.displayName = 'InvestmentsPage';

export default InvestmentsPage;
