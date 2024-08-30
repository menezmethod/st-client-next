import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Title, Text, Paper } from '@mantine/core';

export default function BudgetPage() {
  return (
    <DashboardLayout>
      <Paper p="md" shadow="sm">
        <Title order={2} mb="md">Budget</Title>
        <Text>This is a placeholder for the Budget page. Here you can create and manage your budget.</Text>
      </Paper>
    </DashboardLayout>
  );
}