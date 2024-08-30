import React from 'react';
import { Text, Title, Table } from '@mantine/core';

const mockBondData = [
  { name: 'US Treasury 10Y', yield: '1.60%', price: '$98.25', rating: 'AAA' },
  { name: 'Corporate Bond ETF', yield: '2.80%', price: '$110.50', rating: 'BBB' },
  { name: 'Municipal Bond Fund', yield: '1.20%', price: '$52.75', rating: 'AA' },
  { name: 'High Yield Bond ETF', yield: '4.50%', price: '$85.30', rating: 'BB' },
];

export const BondWidget: React.FC = () => {
  return (
    <>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Yield</th>
            <th>Price</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {mockBondData.map((bond, index) => (
            <tr key={index}>
              <td>{bond.name}</td>
              <td>{bond.yield}</td>
              <td>{bond.price}</td>
              <td>{bond.rating}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Text size="sm" mt="md">Note: This is mock data for demonstration purposes.</Text>
    </>
  );
};