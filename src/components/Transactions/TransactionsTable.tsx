import React, { useState } from 'react';
import { Table, Checkbox, Text, Badge, Group, Box } from '@mantine/core';
import { Transaction } from '@/types/transaction';

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  if (!transactions || transactions.length === 0) {
    return <Text>No transactions found.</Text>;
  }

  const toggleRow = (id: number) =>
    setSelectedRows((current) =>
      current.includes(id)
        ? current.filter((rowId) => rowId !== id)
        : [...current, id]
    );

  const toggleAll = () =>
    setSelectedRows((current) =>
      current.length === transactions.length ? [] : transactions.map((t) => t.id)
    );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(amount));
  };

  const rows = transactions.map((transaction) => (
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
      <Table.Td>{formatDate(transaction.transaction_date)}</Table.Td>
      <Table.Td>{transaction.description}</Table.Td>
      <Table.Td>{formatCurrency(transaction.amount)}</Table.Td>
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
      <Table.Td>{transaction.account_name}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Box style={{ boxShadow: 'var(--mantine-shadow-sm)', borderRadius: 'var(--mantine-radius-md)', border: '1px solid var(--mantine-color-gray-3)' }}>
      <Table striped highlightOnHover>
        <Table.Thead>
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
            <Table.Th>Account</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Box>
  );
}