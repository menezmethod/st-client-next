import { useState } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Grid, TextInput, Textarea, Button, Card, Text } from '@mantine/core';

const initialEntries = [
  { date: '2023-05-01', title: 'Market Analysis', content: 'Today I analyzed the tech sector...' },
  { date: '2023-05-02', title: 'Investment Decision', content: 'Decided to increase my position in...' },
];

export default function Journal() {
  const [entries, setEntries] = useState(initialEntries);
  const [newEntry, setNewEntry] = useState({ title: '', content: '' });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const date = new Date().toISOString().split('T')[0];
    setEntries([{ date, ...newEntry }, ...entries]);
    setNewEntry({ title: '', content: '' });
  };

  return (
    <DashboardLayout>
      <Grid>
        <Grid.Col span={12}>
          <h1>Trading Journal</h1>
          <form onSubmit={handleSubmit}>
            <TextInput
              label="Title"
              value={newEntry.title}
              onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
              required
              style={{ marginBottom: '1rem' }}
            />
            <Textarea
              label="Content"
              value={newEntry.content}
              onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
              required
              style={{ marginBottom: '1rem' }}
            />
            <Button type="submit">Add Entry</Button>
          </form>
          {entries.map((entry, index) => (
            <Card key={index} shadow="sm" padding="lg" style={{ marginTop: '1rem' }}>
              <Text fw={500}>{entry.title}</Text>
              <Text size="sm" c="dimmed">{entry.date}</Text>
              <Text style={{ marginTop: '0.5rem' }}>{entry.content}</Text>
            </Card>
          ))}
        </Grid.Col>
      </Grid>
    </DashboardLayout>
  );
}