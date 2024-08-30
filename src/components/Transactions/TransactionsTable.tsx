import { useState } from 'react';
import { Table, Checkbox, Text, Badge, Group, Box } from '@mantine/core';

interface Transaction {
  transaction_id: string;
  date: string;
  name: string;
  amount: number;
  category: string[];
  pending: boolean;
}

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  if (!transactions || transactions.length === 0) {
    return <Text>No transactions found.</Text>;
  }

  const toggleRow = (transaction_id: string) =>
    setSelectedRows((current) =>
      current.includes(transaction_id)
        ? current.filter((id) => id !== transaction_id)
        : [...current, transaction_id]
    );

  const toggleAll = () =>
    setSelectedRows((current) =>
      current.length === transactions.length ? [] : transactions.map((t) => t.transaction_id)
    );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const rows = transactions.map((transaction) => (
    <Table.Tr
      key={transaction.transaction_id}
      bg={selectedRows.includes(transaction.transaction_id) ? 'var(--mantine-color-blue-light)' : undefined}
    >
      <Table.Td>
        <Checkbox
          aria-label="Select row"
          checked={selectedRows.includes(transaction.transaction_id)}
          onChange={() => toggleRow(transaction.transaction_id)}
        />
      </Table.Td>
      <Table.Td>{formatDate(transaction.date)}</Table.Td>
      <Table.Td>{transaction.name}</Table.Td>
      <Table.Td>${Math.abs(transaction.amount).toFixed(2)}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          {transaction.category.map((cat, index) => (
            <Badge key={index} color="blue" variant="light">
              {cat}
            </Badge>
          ))}
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge color={transaction.pending ? "yellow" : "green"}>
          {transaction.pending ? "Pending" : "Posted"}
        </Badge>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box style={{ boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', borderRadius: '8px', overflow: 'hidden' }}>
      <Table>
        <Table.Thead style={{ backgroundColor: '#f8f9fa' }}>
          <Table.Tr>
            <Table.Th>
              <Checkbox
                aria-label="Select all"
                checked={selectedRows.length === transactions.length}
                indeterminate={selectedRows.length > 0 && selectedRows.length !== transactions.length}
                onChange={toggleAll}
              />
            </Table.Th>
            <Table.Th>Date</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Category</Table.Th>
            <Table.Th>Status</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Box>
  );
}