import React, { useMemo } from 'react';
import { Table, Text, Badge, Box, Group, Divider } from '@mantine/core';
import { Investment, Security } from '@/types/investment';
import { Account } from '@/types/account'; // Assuming you have an Account type defined

interface InvestmentsTableProps {
  holdings: Investment[];
  securities: Security[];
  accounts: Account[];
}

export function InvestmentsTable({ holdings, securities, accounts }: InvestmentsTableProps) {
  const rows = useMemo(() => {
    if (!holdings || holdings.length === 0) {
      return [];
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
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const calculatePerformance = (holding: Investment) => {
      if (holding.cost_basis === null || holding.current_market_value === undefined) {
        return null;
      }
      const costBasis = holding.cost_basis * holding.quantity;
      const currentValue = holding.current_market_value;
      return ((currentValue - costBasis) / costBasis) * 100;
    };

    const formatQuantity = (quantity: number | string) => {
      const numQuantity = Number(quantity);
      return isNaN(numQuantity) ? 'N/A' : numQuantity.toFixed(2);
    };

    const getAccountName = (accountId: string) => {
      const account = accounts.find(a => a.id === Number(accountId));
      return account ? account.name : `Unknown (ID: ${accountId})`;
    };

    return holdings.map((holding) => {
      const security = securities?.find(s => s.security_id === holding.security_id);
      const performance = calculatePerformance(holding);
      return (
        <Table.Tr key={`${holding.security_id}-${holding.account_id}`}>
          <Table.Td>{security?.name || holding.security_name || 'Unknown'}</Table.Td>
          <Table.Td>
            <Badge color={getColor(security?.type || holding.security_type || 'unknown')}>
              {security?.type || holding.security_type || 'Unknown'}
            </Badge>
          </Table.Td>
          <Table.Td>{formatQuantity(holding.quantity)}</Table.Td>
          <Table.Td>{formatCurrency(holding.current_market_value / holding.quantity)}</Table.Td>
          <Table.Td>{formatCurrency(holding.current_market_value)}</Table.Td>
          <Table.Td>{holding.cost_basis !== null ? formatCurrency(holding.cost_basis * holding.quantity) : 'N/A'}</Table.Td>
          <Table.Td>
            <Text c={performance !== null ? (performance >= 0 ? 'green' : 'red') : 'gray'} fw={700}>
              {performance !== null ? `${performance.toFixed(2)}%` : 'N/A'}
            </Text>
          </Table.Td>
          <Table.Td>{getAccountName(holding.account_id)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [holdings, securities, accounts]);

  const { totalValue, totalCostBasis, totalPerformance } = useMemo(() => {
    if (!holdings || holdings.length === 0) {
      return { totalValue: 0, totalCostBasis: 0, totalPerformance: 0 };
    }
    const totalValue = holdings.reduce((sum, holding) => sum + (holding.institution_value || 0), 0);
    const totalCostBasis = holdings.reduce((sum, holding) => sum + ((holding.cost_basis || 0) * holding.quantity), 0);
    const totalPerformance = totalCostBasis !== 0 ? ((totalValue - totalCostBasis) / totalCostBasis) * 100 : 0;
    return { totalValue, totalCostBasis, totalPerformance };
  }, [holdings]);

  if (!holdings || holdings.length === 0) {
    return <Text>No investments found.</Text>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

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
            <Table.Th>Account</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
        <Table.Tfoot>
          <Table.Tr>
            <Table.Td colSpan={8} p={0}>
              <Divider my="xs" />
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td colSpan={4}><Text fw={700}>Total</Text></Table.Td>
            <Table.Td><Text fw={700}>{formatCurrency(totalValue)}</Text></Table.Td>
            <Table.Td><Text fw={700}>{formatCurrency(totalCostBasis)}</Text></Table.Td>
            <Table.Td>
              <Text c={totalPerformance >= 0 ? 'green' : 'red'} fw={700}>
                {totalPerformance.toFixed(2)}%
              </Text>
            </Table.Td>
            <Table.Td></Table.Td>
          </Table.Tr>
        </Table.Tfoot>
      </Table>
      <Group justify="space-between" p="md">
        <Text size="sm">Total Holdings: {holdings.length}</Text>
        <Text size="sm">Total Accounts: {new Set(holdings.map(h => h.account_id)).size}</Text>
      </Group>
    </Box>
  );
}