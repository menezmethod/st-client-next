import React from 'react';
import { Table, Text, Box, MantineTheme } from '@mantine/core';

const mockStockData = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 150.25, change: '+2.5%' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2750.80, change: '-0.8%' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 305.15, change: '+1.2%' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3380.50, change: '+0.5%' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 725.60, change: '-1.5%' },
];

export function StockWidget() {
  return (
    <Box style={(theme: MantineTheme) => ({
      overflowX: 'auto',
      fontSize: theme.fontSizes.sm,
      '@media (maxWidth: 1200px)': {
        fontSize: theme.fontSizes.xs,
      },
      '@media (maxWidth: 768px)': {
        fontSize: `${parseFloat(theme.fontSizes.xs) * 0.9}px`,
      },
      '@media (maxWidth: 480px)': {
        fontSize: `${parseFloat(theme.fontSizes.xs) * 0.8}px`,
      },
    })}>
      <Table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Name</th>
            <th>Price</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          {mockStockData.map((stock) => (
            <tr key={stock.symbol}>
              <td>{stock.symbol}</td>
              <td>{stock.name}</td>
              <td>${stock.price.toFixed(2)}</td>
              <td style={{ color: stock.change.startsWith('+') ? 'green' : 'red' }}>
                {stock.change}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Text size="sm" mt="md">Note: This is mock data for demonstration purposes.</Text>
    </Box>
  );
}