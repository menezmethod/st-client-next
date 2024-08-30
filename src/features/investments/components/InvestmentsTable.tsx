import React, { useState } from 'react';
import { Table, Text, Badge, Group, Box, Checkbox } from '@mantine/core';
import { Investment } from '@/types/investment';

interface InvestmentsTableProps {
  investments: Investment[];
}

export function InvestmentsTable({ investments }: InvestmentsTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  if (!investments || investments.length === 0) {
    return <Text>No investments found.</Text>;
  }

  const toggleRow = (id: string) =>
    setSelectedRows((current) =>
      current.includes(id)
        ? current.filter((rowId) => rowId !== id)
        : [...current, id]
    );

  const toggleAll = () =>
    setSelectedRows((current) =>
      current.length === investments.length ? [] : investments.map((i) => i.id)
    );

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

  const formatCurrency = (amount: number | null | undefined) => {
    return amount != null ? `$${amount.toFixed(2)}` : 'N/A';
  };

  const calculatePerformance = (holdings: Investment['holdings']) => {
    const costBasis = holdings.cost_basis * holdings.quantity;
    const currentValue = holdings.institution_value;
    return ((currentValue - costBasis) / costBasis) * 100;
  };

  const rows = investments.map((investment) => {
    const performance = calculatePerformance(investment.holdings);
    return (
      <Table.Tr
        key={investment.id}
        bg={selectedRows.includes(investment.id) ? 'var(--mantine-color-blue-light)' : undefined}
      >
        <Table.Td>
          <Checkbox
            aria-label="Select row"
            checked={selectedRows.includes(investment.id)}
            onChange={() => toggleRow(investment.id)}
          />
        </Table.Td>
        <Table.Td>{investment.name}</Table.Td>
        <Table.Td>
          <Badge color={getColor(investment.type)}>{investment.type}</Badge>
        </Table.Td>
        <Table.Td>{investment.holdings.quantity}</Table.Td>
        <Table.Td>{formatCurrency(investment.holdings.institution_price)}</Table.Td>
        <Table.Td>{formatCurrency(investment.value)}</Table.Td>
        <Table.Td>{formatCurrency(investment.holdings.cost_basis * investment.holdings.quantity)}</Table.Td>
        <Table.Td>
          <Text c={performance >= 0 ? 'green' : 'red'} fw={700}>
            {isNaN(performance) ? '-' : `${performance.toFixed(2)}%`}
          </Text>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Box style={{ boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', borderRadius: '8px', overflow: 'hidden' }}>
      <Table>
        <Table.Thead style={{ backgroundColor: '#f8f9fa' }}>
          <Table.Tr>
            <Table.Th>
              <Checkbox
                aria-label="Select all"
                checked={selectedRows.length === investments.length}
                indeterminate={selectedRows.length > 0 && selectedRows.length !== investments.length}
                onChange={toggleAll}
              />
            </Table.Th>
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