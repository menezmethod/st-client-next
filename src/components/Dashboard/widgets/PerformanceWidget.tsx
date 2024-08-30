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
    <Box p="md" style={(theme) => ({
      border: `1px solid ${theme.colors.gray[3]}`,
      borderRadius: theme.radius.md,
    })}>
      <Group grow align="flex-start" gap="sm">
        {Object.entries(mockPerformanceData).map(([key, value]) => (
          <Stack key={key} gap="xs" style={{ minWidth: '100px' }}>
            <Text size="md" fw={700} style={(theme) => ({
              color: key === 'totalReturn' ? theme.primaryColor :
                     key === 'dailyChange' ? ((value as string).startsWith('+') ? 'green' : 'red') :
                     key === 'bestTrade' ? 'green' :
                     key === 'worstTrade' ? 'red' : 'inherit',
              fontSize: theme.fontSizes.md,
              '@media (max-width: 768px)': {
                fontSize: theme.fontSizes.sm,
              },
            })}>
              {value}
            </Text>
            <Text size="xs" c="dimmed" style={(theme) => ({
              fontSize: theme.fontSizes.xs,
              '@media (max-width: 768px)': {
                fontSize: `${parseFloat(theme.fontSizes.xs) * 0.9}px`,
              },
            })}>
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </Text>
            {key === 'winRate' && (
              <Progress 
                value={Number(value)} 
                size="xs" 
                color={theme.primaryColor} 
                style={{ marginTop: '4px' }}
              />
            )}
          </Stack>
        ))}
      </Group>
    </Box>
  );
};