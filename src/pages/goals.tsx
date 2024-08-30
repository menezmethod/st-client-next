import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Grid, Card, Text, Progress } from '@mantine/core';

const goals = [
  { name: 'Emergency Fund', current: 5000, target: 10000 },
  { name: 'Vacation', current: 2000, target: 5000 },
  { name: 'New Car', current: 10000, target: 30000 },
];

export default function Goals() {
  return (
    <DashboardLayout>
      <Grid>
        <Grid.Col span={12}>
          <h1>Financial Goals</h1>
          {goals.map((goal, index) => (
            <Card key={index} shadow="sm" padding="lg" style={{ marginBottom: '1rem' }}>
              <Text fw={500}>{goal.name}</Text>
              <Text size="sm" c="dimmed">
                ${goal.current} / ${goal.target}
              </Text>
              <Progress 
                value={(goal.current / goal.target) * 100} 
                size="xl" 
                mt="xs"
              />
              <Text size="sm" ta="center" mt="xs">
                {`${((goal.current / goal.target) * 100).toFixed(0)}%`}
              </Text>
            </Card>
          ))}
        </Grid.Col>
      </Grid>
    </DashboardLayout>
  );
}