import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Title, Text, Paper } from '@mantine/core';

export default function AdvicePage() {
  return (
    <DashboardLayout>
      <Paper p="md" shadow="sm">
        <Title order={2} mb="md">Financial Advice</Title>
        <Text>This is a placeholder for the Advice page. Here you'll find personalized financial advice and recommendations.</Text>
      </Paper>
    </DashboardLayout>
  );
}