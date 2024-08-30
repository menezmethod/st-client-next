import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Grid, Card, Text } from '@mantine/core';

const insights = [
  { title: 'Spending Trend', description: 'Your spending has decreased by 15% this month compared to last month.' },
  { title: 'Savings Opportunity', description: 'You could save $200 more per month by reducing dining out expenses.' },
  { title: 'Investment Suggestion', description: 'Based on your risk profile, consider increasing your stock allocation by 10%.' },
];

export default function Insights() {
  return (
    <DashboardLayout>
      <Grid>
        <Grid.Col span={12}>
          <h1>Financial Insights</h1>
          {insights.map((insight, index) => (
            <Card key={index} shadow="sm" padding="lg" style={{ marginBottom: '1rem' }}>
              <Text fw={500}>{insight.title}</Text>
              <Text size="sm" mt="0.5rem">{insight.description}</Text>
            </Card>
          ))}
        </Grid.Col>
      </Grid>
    </DashboardLayout>
  );
}