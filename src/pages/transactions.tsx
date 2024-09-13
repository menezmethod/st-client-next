import React, { useCallback, useMemo } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Stack, Group, Button, Text, Alert, Skeleton } from '@mantine/core';
import { IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useErrorMessage } from '@/hooks/useErrorMessage';
import { Transaction } from '@/types/transaction';
import { usePlaid } from '@/contexts/PlaidContext';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { TransactionsTable } from '@/components/Transactions/TransactionsTable';

console.log(`[${new Date().toISOString()}] [AppStart] TransactionsPage component initialized`);
console.log(`[${new Date().toISOString()}] [AppStart] Environment:`, process.env.NODE_ENV);

const TransactionsPage: React.FC = React.memo(() => {
  console.log(`[${new Date().toISOString()}] [TransactionsPage] Function called`);

  const { initiatePlaidLink, isLoading: isPlaidLoading } = usePlaid();
  const { user } = useAuth();

  const {
    data: transactions,
    isLoading: isTransactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions
  } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const token = await user?.getIdToken();
      const response = await axios.get<{ transactions: Transaction[] }>('/api/transactions', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Ensure that each transaction has a category array, even if it's empty
      return response.data.transactions.map(transaction => ({
        ...transaction,
        category: transaction.category || []
      }));
    },
    enabled: !!user,
  });

  const isLoading = isPlaidLoading || isTransactionsLoading;
  const errorMessage = useErrorMessage(transactionsError);

  console.log(`[${new Date().toISOString()}] [TransactionsPage] State:`, {
    isLoading,
    hasError: !!errorMessage,
    transactionsCount: transactions?.length
  });

  const handleInitiatePlaidLink = useCallback(async () => {
    console.log(`[${new Date().toISOString()}] [TransactionsPage] Initiating Plaid Link`);
    await initiatePlaidLink();
    refetchTransactions();
  }, [initiatePlaidLink, refetchTransactions]);

  const renderContent = useMemo(() => {
    if (isLoading) {
      return <Skeleton height={200} />;
    }
    if (transactions && transactions.length > 0) {
      return <TransactionsTable transactions={transactions} />;
    }
    return (
      <Alert variant="light" color="blue" title="No Transactions Found" icon={<IconInfoCircle />}>
        No transactions found. This could be due to no transactions in the linked account or an error in fetching.
      </Alert>
    );
  }, [isLoading, transactions]);

  console.log(`[${new Date().toISOString()}] [TransactionsPage] Rendering component`);

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
        
        {renderContent}
        
        <Group justify="flex-end">
          <Button 
            onClick={handleInitiatePlaidLink}
            disabled={isLoading}
            loading={isLoading}
          >
            {transactions && transactions.length > 0 ? 'Reconnect bank account' : 'Connect a bank account'}
          </Button>
        </Group>
      </Stack>
    </DashboardLayout>
  );
});

TransactionsPage.displayName = 'TransactionsPage';

console.log(`[${new Date().toISOString()}] [AppExport] TransactionsPage component exported`);

export default TransactionsPage;