import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Grid, Progress, Text, Paper, Box } from '@mantine/core';

const budgets = [
  { category: 'Food', spent: 300, limit: 500 },
  { category: 'Transportation', spent: 150, limit: 200 },
  { category: 'Entertainment', spent: 100, limit: 150 },
];

export default function Budgets() {
  return (
    <DashboardLayout>
      <Grid>
        <Grid.Col span={12}>
          <h1>Budgets</h1>
          {budgets.map((budget, index) => (
            <Paper key={index} withBorder p="md" mb="md">
              <Text>{budget.category}</Text>
              <Box mt="xs">
                <Progress 
                  value={(budget.spent / budget.limit) * 100} 
                  size="xl"
                />
                <Text size="sm" mt="xs">{`$${budget.spent} / $${budget.limit}`}</Text>
              </Box>
            </Paper>
          ))}
        </Grid.Col>
      </Grid>
    </DashboardLayout>
  );
}