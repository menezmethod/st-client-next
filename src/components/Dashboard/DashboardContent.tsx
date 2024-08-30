import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Title, Box, Text, Group, Paper, Stack, SegmentedControl } from '@mantine/core';
import { CustomizableDashboard } from './CustomizableDashboard';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { IconArrowUpRight, IconArrowDownRight } from '@tabler/icons-react';

const baselineValue = 2546.34;

const formatTime = (hour: number): string => {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:00 ${ampm}`;
};

const generateInitialData = (dataPoints: number, baseValue: number) => {
  const data = [];
  let currentValue = baseValue;
  for (let i = 0; i < dataPoints; i++) {
    const volatility = Math.random() * 100 - 50;
    const trend = Math.random() > 0.5 ? 1 : -1;
    currentValue = Math.max(0, currentValue + volatility * trend);
    data.push({
      name: formatTime(i),
      value: parseFloat(currentValue.toFixed(2))
    });
  }
  return data;
};

const updateLatestDataPoint = (data: any[], baseValue: number) => {
  const lastValue = data[data.length - 1].value;
  const volatility = Math.random() * 50 - 25;
  const newValue = Math.max(0, lastValue + volatility);
  return [
    ...data.slice(0, -1),
    { ...data[data.length - 1], value: parseFloat(newValue.toFixed(2)) }
  ];
};

// Mock user account creation date (5 years ago)
const mockAccountCreationDate = new Date();
mockAccountCreationDate.setFullYear(mockAccountCreationDate.getFullYear() - 5);

const generateAllData = () => {
  const now = new Date();
  const daysSinceCreation = Math.floor((now.getTime() - mockAccountCreationDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    dailyData: generateInitialData(24, baselineValue),
    weeklyData: generateInitialData(7, baselineValue),
    monthlyData: generateInitialData(30, baselineValue),
    threeMonthData: generateInitialData(90, baselineValue),
    ytdData: generateInitialData(now.getMonth() + 1, baselineValue),
    yearlyData: generateInitialData(12, baselineValue),
    allTimeData: generateInitialData(daysSinceCreation, baselineValue),
  };
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: 'white', padding: '5px', border: '1px solid #ccc' }}>
        <p>{`${label}`}</p>
      </div>
    );
  }
  return null;
};

export function DashboardContent() {
  const [timeframe, setTimeframe] = useState('1D');
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [marketData, setMarketData] = useState(generateAllData());

  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prevData => ({
        ...prevData,
        dailyData: updateLatestDataPoint(prevData.dailyData, baselineValue),
      }));
    }, 5000); // Update latest data point every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getDataForTimeframe = () => {
    switch (timeframe) {
      case '1D': return marketData.dailyData;
      case '1W': return marketData.weeklyData;
      case '1M': return marketData.monthlyData;
      case '3M': return marketData.threeMonthData;
      case 'YTD': return marketData.ytdData;
      case '1Y': return marketData.yearlyData;
      case 'ALL': return marketData.allTimeData;
      default: return marketData.dailyData;
    }
  };

  const currentValue = useMemo(() => {
    const data = getDataForTimeframe();
    return data[data.length - 1].value;
  }, [timeframe, marketData]);

  const displayValue = hoverValue !== null ? hoverValue : currentValue;
  const difference = displayValue - baselineValue;
  const percentChange = (difference / baselineValue) * 100;
  const isPositive = difference >= 0;

  const lineColor = useMemo(() => {
    if (hoverValue !== null) {
      return hoverValue < baselineValue ? '#FA5252' : '#12B886';
    }
    return currentValue < baselineValue ? '#FA5252' : '#12B886';
  }, [hoverValue, currentValue, baselineValue]);

  const handleMouseMove = useCallback((state: any) => {
    if (state.activePayload) {
      setHoverValue(state.activePayload[0].value);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverValue(null);
  }, []);

  const getTimeReference = useMemo(() => {
    switch (timeframe) {
      case '1D': return 'Today';
      case '1W': return 'Past Week';
      case '1M': return 'Past Month';
      case '3M': return 'Past 3 Months';
      case 'YTD': return 'Year to Date';
      case '1Y': return 'Past Year';
      case 'ALL': return 'All Time';
      default: return 'Today';
    }
  }, [timeframe]);

  const getDataLabel = useMemo(() => {
    const now = new Date();
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    switch (timeframe) {
      case '1D':
        return `${formatDate(now)}`;
      case '1W':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return `${formatDate(weekAgo)} - ${formatDate(now)}`;
      case '1M':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return `${formatDate(monthAgo)} - ${formatDate(now)}`;
      case '3M':
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        return `${formatDate(threeMonthsAgo)} - ${formatDate(now)}`;
      case 'YTD':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return `${formatDate(startOfYear)} - ${formatDate(now)}`;
      case '1Y':
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        return `${formatDate(yearAgo)} - ${formatDate(now)}`;
      case 'ALL':
        return `${formatDate(mockAccountCreationDate)} - ${formatDate(now)}`;
      default:
        return formatDate(now);
    }
  }, [timeframe]);

  return (
    <Box style={{ padding: 0 }}>
      <Paper p="md" mb="xl" shadow="none">
        <Stack gap={0}>
          <Title order={2}>Investing</Title>
          <Text size="xl" fw={700}>${displayValue.toFixed(2)}</Text>
          <Group gap={4}>
            {isPositive ? (
              <IconArrowUpRight size={20} style={{ color: '#12B886' }} />
            ) : (
              <IconArrowDownRight size={20} style={{ color: '#FA5252' }} />
            )}
            <Text size="sm" fw={500} c={isPositive ? 'teal' : 'red'}>
              ${Math.abs(difference).toFixed(2)} ({percentChange.toFixed(2)}%)
            </Text>
          </Group>
          <Text size="sm" c="dimmed">{getTimeReference}</Text>
          <Text size="xs" c="dimmed">{getDataLabel}</Text>
        </Stack>
        <Box style={{ width: '100%', height: 250, marginTop: '1rem' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={getDataForTimeframe()} 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <XAxis dataKey="name" hide={true} />
              <YAxis hide={true} domain={['dataMin', 'dataMax']} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={baselineValue} stroke="gray" strokeDasharray="3 3" />
              <Line 
                type="linear" 
                dataKey="value" 
                stroke={lineColor}
                strokeWidth={2} 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        <SegmentedControl
          value={timeframe}
          onChange={setTimeframe}
          data={[
            { label: '1D', value: '1D' },
            { label: '1W', value: '1W' },
            { label: '1M', value: '1M' },
            { label: '3M', value: '3M' },
            { label: 'YTD', value: 'YTD' },
            { label: '1Y', value: '1Y' },
            { label: 'ALL', value: 'ALL' },
          ]}
          style={{ marginTop: '1rem' }}
        />
      </Paper>
      <CustomizableDashboard />
    </Box>
  );
}