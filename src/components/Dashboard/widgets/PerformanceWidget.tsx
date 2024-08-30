import React from 'react';
import { Text, Group, Stack, Progress, useMantineTheme, Box } from '@mantine/core';

const mockPerformanceData = {
  totalReturn: '+12.5%',
  dailyChange: '+0.8%',
  winRate: 68,
  profitFactor: 2.3,
  sharpeRatio: 1.8,
  bestTrade: '+15.2%',
  worstTrade: '-5.7%',
};

export const PerformanceWidget: React.FC = () => {
  const theme = useMantineTheme();

  return (
    <Box>
      <Group grow align="flex-start" wrap="wrap">
        <Stack gap="xs">
          <Text size="lg" fw={700} c={theme.primaryColor}>
            {mockPerformanceData.totalReturn}
          </Text>
          <Text size="sm" c="dimmed">Total Return</Text>
        </Stack>
        <Stack gap="xs">
          <Text size="lg" fw={700} c={mockPerformanceData.dailyChange.startsWith('+') ? 'green' : 'red'}>
            {mockPerformanceData.dailyChange}
          </Text>
          <Text size="sm" c="dimmed">Daily Change</Text>
        </Stack>
        <Stack gap="xs" style={{ minWidth: '120px' }}>
          <Text size="lg" fw={700}>{mockPerformanceData.winRate}%</Text>
          <Text size="sm" c="dimmed">Win Rate</Text>
          <Progress value={mockPerformanceData.winRate} size="sm" color={theme.primaryColor} />
        </Stack>
      </Group>
      <Group grow align="flex-start" wrap="wrap" mt="md">
        <Stack gap="xs">
          <Text size="lg" fw={700}>{mockPerformanceData.profitFactor}</Text>
          <Text size="sm" c="dimmed">Profit Factor</Text>
        </Stack>
        <Stack gap="xs">
          <Text size="lg" fw={700}>{mockPerformanceData.sharpeRatio}</Text>
          <Text size="sm" c="dimmed">Sharpe Ratio</Text>
        </Stack>
        <Stack gap="xs">
          <Text size="lg" fw={700} c="green">{mockPerformanceData.bestTrade}</Text>
          <Text size="sm" c="dimmed">Best Trade</Text>
        </Stack>
        <Stack gap="xs">
          <Text size="lg" fw={700} c="red">{mockPerformanceData.worstTrade}</Text>
          <Text size="sm" c="dimmed">Worst Trade</Text>
        </Stack>
      </Group>
    </Box>
  );
};