import React from 'react';
import { Text, Table } from '@mantine/core';

const mockCryptoData = [
  { name: 'Bitcoin', symbol: 'BTC', price: '$45,000', change: '+2.5%', holdings: '0.5 BTC' },
  { name: 'Ethereum', symbol: 'ETH', price: '$3,200', change: '-1.2%', holdings: '2.3 ETH' },
  { name: 'Cardano', symbol: 'ADA', price: '$1.20', change: '+5.7%', holdings: '1000 ADA' },
  { name: 'Solana', symbol: 'SOL', price: '$150', change: '+0.8%', holdings: '10 SOL' },
];

export const CryptoWidget: React.FC = () => {
  return (
    <>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>24h Change</th>
            <th>Holdings</th>
          </tr>
        </thead>
        <tbody>
          {mockCryptoData.map((crypto) => (
            <tr key={crypto.symbol}>
              <td>{crypto.name} ({crypto.symbol})</td>
              <td>{crypto.price}</td>
              <td style={{ color: crypto.change.startsWith('+') ? 'green' : 'red' }}>
                {crypto.change}
              </td>
              <td>{crypto.holdings}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Text size="sm" mt="md">Note: This is mock data for demonstration purposes.</Text>
    </>
  );
};