import { Title, Box, Text, Group, Paper, Stack } from '@mantine/core';
import { CustomizableDashboard } from './CustomizableDashboard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IconArrowUpRight } from '@tabler/icons-react';

const data = [
  { name: 'Jan', value: 2000 },
  { name: 'Feb', value: 2200 },
  { name: 'Mar', value: 2100 },
  { name: 'Apr', value: 2300 },
  { name: 'May', value: 2400 },
  { name: 'Jun', value: 2546.34 },
];

export function DashboardContent() {
  return (
    <Box style={{ padding: 0 }}>
      <Paper p="md" mb="xl" withBorder>
        <Group justify="space-between" align="flex-start" style={{ marginBottom: '1rem' }}>
          <Stack gap={0}>
            <Title order={2}>Investing</Title>
            <Group gap="xs" align="flex-end">
              <Text size="xl" fw={700}>$2,546.34</Text>
              <Group gap={4}>
                <IconArrowUpRight size={20} style={{ color: '#12B886' }} />
                <Text size="sm" fw={500} c="teal">$117.02 (4.82%)</Text>
              </Group>
            </Group>
            <Text size="sm" c="dimmed">Today</Text>
          </Stack>
        </Group>
        <Box style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" hide={false} allowDataOverflow={false} allowDecimals={true} allowDuplicatedCategory={true} />
              <YAxis hide={false} allowDataOverflow={false} allowDecimals={true} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#12B886" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
      <CustomizableDashboard />
    </Box>
  );
}