import React from 'react';
import { Table, Text, Badge, Box } from '@mantine/core';
import { Investment } from '../../../types/investment';

interface InvestmentsTableProps {
  holdings: Investment[];
  securities: any[];
  accounts: any[];
}

export function InvestmentsTable({ holdings, securities, accounts }: InvestmentsTableProps) {
  if (!holdings || holdings.length === 0) {
    return <Text>No investments found.</Text>;
  }

  const getColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'etf':
        return 'blue';
      case 'stock':
        return 'green';
      default:
        return 'gray';
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const calculatePerformance = (holding: Investment) => {
    const costBasis = holding.cost_basis * holding.quantity;
    const currentValue = holding.institution_value;
    return ((currentValue - costBasis) / costBasis) * 100;
  };

  const rows = holdings.map((holding) => {
    const security = securities.find(s => s.security_id === holding.security_id);
    const account = accounts.find(a => a.account_id === holding.account_id);
    const performance = calculatePerformance(holding);
    return (
      <Table.Tr key={holding.security_id}>
        <Table.Td>{security?.name || 'Unknown'}</Table.Td>
        <Table.Td>
          <Badge color={getColor(security?.type || 'unknown')}>{security?.type || 'Unknown'}</Badge>
        </Table.Td>
        <Table.Td>{holding.quantity}</Table.Td>
        <Table.Td>{formatCurrency(holding.institution_price)}</Table.Td>
        <Table.Td>{formatCurrency(holding.institution_value)}</Table.Td>
        <Table.Td>{formatCurrency(holding.cost_basis * holding.quantity)}</Table.Td>
        <Table.Td>
          <Text c={performance >= 0 ? 'green' : 'red'} fw={700}>
            {performance.toFixed(2)}%
          </Text>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Box style={{ boxShadow: 'var(--mantine-shadow-sm)', borderRadius: 'var(--mantine-radius-md)', border: '1px solid var(--mantine-color-gray-3)' }}>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Quantity</Table.Th>
            <Table.Th>Current Price</Table.Th>
            <Table.Th>Total Value</Table.Th>
            <Table.Th>Cost Basis</Table.Th>
            <Table.Th>Performance</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Box>
  );
}