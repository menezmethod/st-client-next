import React from 'react';
import { Text, Stack } from '@mantine/core';

const mockNotes = [
  { id: 1, date: '2023-06-01', content: 'AAPL showing strong support at $150. Consider buying if it dips.' },
  { id: 2, date: '2023-06-03', content: 'Crypto market volatility increasing. Monitor BTC closely for potential short-term trades.' },
  { id: 3, date: '2023-06-05', content: 'Oil prices rising due to OPEC+ production cuts. Look into energy sector stocks.' },
  { id: 4, date: '2023-06-07', content: 'Fed meeting next week. Prepare for potential market reactions to interest rate decisions.' },
];

export const NotesWidget: React.FC = () => {
  return (
    <Stack gap="xs">
      {mockNotes.map((note) => (
        <div key={note.id}>
          <Text size="sm" fw={700}>{note.date}</Text>
          <Text size="sm">{note.content}</Text>
        </div>
      ))}
    </Stack>
  );
};