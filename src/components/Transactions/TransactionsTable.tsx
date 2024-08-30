import { useState } from 'react';
import { Table, Checkbox, Text, Group, Badge, ActionIcon, Menu, Box } from '@mantine/core';
import { IconDotsVertical, IconEdit, IconTrash, IconCategory } from '@tabler/icons-react';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
}

const mockTransactions: Transaction[] = [
  { id: '1', date: '2023-05-01', description: 'Grocery Shopping at Whole Foods Market', category: 'Food', amount: 120.50, type: 'expense' },
  { id: '2', date: '2023-05-02', description: 'Monthly Salary Deposit', category: 'Income', amount: 3000, type: 'income' },
  { id: '3', date: '2023-05-03', description: 'Electric Bill Payment', category: 'Utilities', amount: 85.20, type: 'expense' },
  { id: '4', date: '2023-05-04', description: 'Freelance Web Development Project Payment', category: 'Income', amount: 500, type: 'income' },
  { id: '5', date: '2023-05-05', description: 'Dinner at Local Italian Restaurant', category: 'Food', amount: 65.30, type: 'expense' },
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
}

export function TransactionsTable() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const toggleRow = (id: string) =>
    setSelectedRows((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );

  const toggleAll = () =>
    setSelectedRows((current) => (current.length === mockTransactions.length ? [] : mockTransactions.map((t) => t.id)));

  const rows = mockTransactions.map((transaction) => (
    <Table.Tr
      key={transaction.id}
      bg={selectedRows.includes(transaction.id) ? 'var(--mantine-color-blue-light)' : undefined}
    >
      <Table.Td>
        <Checkbox
          aria-label="Select row"
          checked={selectedRows.includes(transaction.id)}
          onChange={() => toggleRow(transaction.id)}
        />
      </Table.Td>
      <Table.Td>
        <Text size="sm" style={{ whiteSpace: 'nowrap' }}>
          {formatDate(transaction.date)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" lineClamp={2}>
          {transaction.description}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge color={transaction.type === 'income' ? 'green' : 'red'}>
          {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm" lineClamp={1}>
          {transaction.category}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" justify="flex-end">
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
                <IconDotsVertical style={{ width: '70%', height: '70%' }} stroke={1.5} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconEdit size={14} />}>Edit</Menu.Item>
              <Menu.Item leftSection={<IconCategory size={14} />}>Change Category</Menu.Item>
              <Menu.Item color="red" leftSection={<IconTrash size={14} />}>Delete</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box style={{ overflowX: 'auto' }}>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: 40 }}>
              <Checkbox
                aria-label="Select all"
                checked={selectedRows.length === mockTransactions.length}
                indeterminate={selectedRows.length > 0 && selectedRows.length !== mockTransactions.length}
                onChange={toggleAll}
              />
            </Table.Th>
            <Table.Th>Date</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Category</Table.Th>
            <Table.Th style={{ width: 40 }} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Box>
  );
}