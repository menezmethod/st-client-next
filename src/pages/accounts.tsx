import React from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Stack, Group, Button, Text, Loader, Alert, Skeleton } from '@mantine/core';
import { Accounts } from '../features/accounts/components/Accounts';
import { IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Account } from '../types/account';
import { useErrorMessage } from '../hooks/useErrorMessage';
import { usePlaidLink } from '../hooks/usePlaidLink';
import { fetchAccounts } from '../lib/plaid';

export default function AccountsPage() {
  const { initiatePlaidLink, isLoading: isLinkLoading } = usePlaidLink();

  const { 
    data: accessToken,
    isLoading: isAccessTokenLoading,
  } = useQuery<string | null>({
    queryKey: ['accessToken'],
  });

  const { 
    data: accounts, 
    isLoading: isAccountsLoading, 
    error: accountsError 
  } = useQuery<Account[] | undefined>({
    queryKey: ['accounts', accessToken],
    queryFn: () => fetchAccounts(accessToken!),
    enabled: !!accessToken,
  });

  const isLoading = isLinkLoading || isAccessTokenLoading || isAccountsLoading;
  const errorMessage = useErrorMessage(accountsError);

  return (
    <DashboardLayout>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text size="xl" fw={700}>Accounts</Text>
          {errorMessage && (
            <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">
              {errorMessage}
            </Alert>
          )}
        </Group>
        
        {isLoading ? (
          <Skeleton height={200} />
        ) : accessToken ? (
          accounts && accounts.length > 0 ? <Accounts accounts={accounts} /> : <Text>No accounts found.</Text>
        ) : (
          <Alert variant="light" color="red" title="No Bank Account Connected" icon={<IconInfoCircle />}>
            Connect a bank account to view your accounts.
          </Alert>
        )}
        
        <Group justify="flex-end">
          <Button 
            onClick={initiatePlaidLink}
            disabled={isLoading}
            loading={isLoading}
          >
            {accessToken ? 'Reconnect bank account' : 'Connect a bank account'}
          </Button>
        </Group>
      </Stack>
    </DashboardLayout>
  );
}