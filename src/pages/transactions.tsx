import React from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Stack, Group, Button, Text, Loader, Alert, Skeleton } from '@mantine/core';
import { fetchTransactions } from '../lib/plaid';
import { usePlaidLink } from '../hooks/usePlaidLink';
import { TransactionsTable } from '../components/Transactions/TransactionsTable';
import { IconAlertCircle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useErrorMessage } from '../hooks/useErrorMessage';
import { Transaction } from '../types/transaction';

export default function TransactionsPage() {
  const { initiatePlaidLink, isLoading: isLinkLoading } = usePlaidLink();

  const { 
    data: accessToken,
    isLoading: isAccessTokenLoading,
  } = useQuery<string | null>({
    queryKey: ['accessToken'],
  });

  const { 
    data: transactions, 
    isLoading: isTransactionsLoading, 
    error: transactionsError 
  } = useQuery<Transaction[]>({
    queryKey: ['transactions', accessToken],
    queryFn: () => fetchTransactions(accessToken!),
    enabled: !!accessToken,
  });

  const isLoading = isLinkLoading || isAccessTokenLoading || isTransactionsLoading;
  const errorMessage = useErrorMessage(transactionsError);

  return (
    <DashboardLayout>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text size="xl" fw={700}>Transactions</Text>
          {errorMessage && (
            <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">
              {errorMessage}
            </Alert>
          )}
        </Group>
        
        {isLoading ? (
          <Skeleton height={200} />
        ) : accessToken ? (
          transactions && transactions.length > 0 ? (
            <TransactionsTable transactions={transactions.map(t => ({
              ...t,
              category: t.category || []
            }))} />
          ) : (
            <Text>
              No transactions found. This could be due to no transactions in the linked account or an error in fetching.
              {transactionsError && ` Error: ${transactionsError}`}
            </Text>
          )
        ) : (
          <Text>Connect a bank account to view transactions.</Text>
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