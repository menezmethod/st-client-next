import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Stack, Group, Button, Text, Alert, Skeleton, Card, SimpleGrid, Badge } from '@mantine/core';
import { IconAlertCircle, IconInfoCircle, IconWallet } from '@tabler/icons-react';
import axios from 'axios';
import { Account as AccountType } from '@/types/account';
import { useErrorMessage } from '@/hooks/useErrorMessage';
import { usePlaid } from '@/contexts/PlaidContext';
import { useAuth } from '@/contexts/AuthContext'; 

const AccountsPage: React.FC = React.memo(() => {
  const { initiatePlaidLink } = usePlaid();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<AccountType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAccounts = async () => {
      if (user) {
        try {
          const token = await user?.getIdToken();
          const response = await axios.get<{ accounts: AccountType[] }>('/api/accounts', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (isMounted) {
            setAccounts(response.data.accounts);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error fetching accounts:', error);
          setIsLoading(false);
        }
      }
    };

    loadAccounts();

    return () => {
      isMounted = false;
    };
  }, [user]);

  console.log('Fetched accounts:', accounts);

  const errorMessage = useErrorMessage(null);

  const categorizedAccounts = useMemo(() => {
    return accounts.reduce<Record<string, AccountType[]>>((acc, account) => {
      const category = account.subtype || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(account);
      return acc;
    }, {});
  }, [accounts]);

  const handleInitiatePlaidLink = useCallback(async () => {
    await initiatePlaidLink();
  }, [initiatePlaidLink]);

  const formatBalance = (balance: any): string => {
    if (typeof balance === 'number') {
      return balance.toFixed(2);
    } else if (typeof balance === 'string') {
      const num = parseFloat(balance);
      return isNaN(num) ? 'N/A' : num.toFixed(2);
    } else {
      return 'N/A';
    }
  };

  const renderContent = useMemo(() => {
    console.log('Rendering accounts:', accounts);
    if (isLoading) {
      return <Skeleton height={200} />;
    }
    if (accounts.length > 0) {
      return (
        <SimpleGrid cols={3} spacing="md" verticalSpacing="md">
          {Object.entries(categorizedAccounts).map(([category, accounts]) => (
            <Card key={category} shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section withBorder inheritPadding py="xs">
                <Group justify="space-between">
                  <Text fw={500}>{category}</Text>
                  <Badge color="blue" variant="light">
                    {accounts.length} {accounts.length === 1 ? 'Account' : 'Accounts'}
                  </Badge>
                </Group>
              </Card.Section>
              <Stack gap="sm" mt="md">
                {accounts.map(account => (
                  <Group key={account.id} justify="space-between">
                    <Group gap="xs">
                      <IconWallet size="1rem" />
                      <Text size="sm">{account.name}</Text>
                    </Group>
                    <Text size="sm" fw={500}>
                      ${formatBalance(account.balance)}
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      );
    }
    return (
      <Alert variant="light" color="blue" title="No Bank Account Connected" icon={<IconInfoCircle />}>
        Connect a bank account to view your accounts.
      </Alert>
    );
  }, [isLoading, accounts, categorizedAccounts]);

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
        
        {renderContent}
        
        <Group justify="flex-end">
          <Button 
            onClick={handleInitiatePlaidLink}
            disabled={isLoading}
            loading={isLoading}
          >
            {accounts.length > 0 ? 'Reconnect bank account' : 'Connect a bank account'}
          </Button>
        </Group>
      </Stack>
    </DashboardLayout>
  );
});

AccountsPage.displayName = 'AccountsPage';

export default AccountsPage;