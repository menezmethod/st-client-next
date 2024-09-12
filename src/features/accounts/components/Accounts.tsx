import React from 'react';
import { SimpleGrid, Card, Text, Badge, Group, Stack } from '@mantine/core';
import { IconCreditCard, IconPigMoney, IconBuildingBank } from '@tabler/icons-react';
import { Account } from '../../../types/account';

interface AccountsProps {
  accounts: Account[];
}

export function Accounts({ accounts }: AccountsProps) {
  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'credit':
        return <IconCreditCard size={24} />;
      case 'depository':
        return <IconPigMoney size={24} />;
      default:
        return <IconBuildingBank size={24} />;
    }
  };

  const getColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'credit':
        return 'red';
      case 'depository':
        return 'green';
      case 'investment':
        return 'blue';
      case 'loan':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    return amount != null ? `$${amount.toFixed(2)}` : 'N/A';
  };

  return (
    <SimpleGrid
      cols={{ base: 1, sm: 3 }}
      spacing="lg"
    >
      {accounts.map((account) => (
        <Card key={account.account_id} shadow="sm" padding="lg" radius="md" withBorder>
          <Card.Section withBorder inheritPadding py="xs">
            <Group justify="space-between">
              <Text fw={500}>{account.name}</Text>
              <Badge color={getColor(account.type)}>{account.type}</Badge>
            </Group>
          </Card.Section>

          <Group mt="md" mb="xs">
            {getIcon(account.type)}
            <Text size="sm" c="dimmed">
              {account.subtype}
            </Text>
          </Group>

          <Stack>
            <Text size="lg" fw={700}>
              {formatCurrency(account.balances.current)}
            </Text>
            <Text size="xs" c="dimmed">
              Current Balance
            </Text>
          </Stack>

          {account.balances.available !== null && (
            <Stack mt="xs">
              <Text size="sm">
                {formatCurrency(account.balances.available)} available
              </Text>
            </Stack>
          )}

          {account.balances.limit !== null && (
            <Stack mt="xs">
              <Text size="sm">
                {formatCurrency(account.balances.limit)} limit
              </Text>
            </Stack>
          )}
        </Card>
      ))}
    </SimpleGrid>
  );
}