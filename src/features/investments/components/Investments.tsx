import React from 'react';
import { Table, Text, Badge, Group, Paper, Title } from '@mantine/core';
import { Investment } from '@/types/investment';

interface InvestmentsProps {
  investments: Investment[];
}

export function Investments({ investments }: InvestmentsProps) {
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

  return (
    <Paper p="md">
      <Title order={2} mb="md">Investments</Title>
      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Quantity</th>
            <th>Current Price</th>
            <th>Total Value</th>
            <th>Cost Basis</th>
            <th>Performance</th>
          </tr>
        </thead>
        <tbody>
          {investments.map((investment) => {
            const performance = calculatePerformance(investment.holdings);
            return (
              <tr key={investment.id}>
                <td>{investment.name}</td>
                <td>
                  <Badge color={getColor(investment.type)}>{investment.type}</Badge>
                </td>
                <td>{investment.holdings.quantity}</td>
                <td>{formatCurrency(investment.holdings.institution_price)}</td>
                <td>{formatCurrency(investment.value)}</td>
                <td>{formatCurrency(investment.holdings.cost_basis * investment.holdings.quantity)}</td>
                <td>
                  <Text c={performance >= 0 ? 'green' : 'red'} fw={700}>
                    {performance.toFixed(2)}%
                  </Text>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Paper>
  );
}