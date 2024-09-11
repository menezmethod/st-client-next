import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Title, Text, Paper } from '@mantine/core';

export default function RecurringPage() {
  return (
    <DashboardLayout>
      <Paper p="md" shadow="sm">
        <Title order={2} mb="md">Recurring Transactions</Title>
        <Text>This is a placeholder for the Recurring Transactions page. Here you can view and manage your recurring income and expenses.</Text>
      </Paper>
    </DashboardLayout>
  );
}