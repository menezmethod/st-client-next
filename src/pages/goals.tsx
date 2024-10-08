import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Title, Text, Paper } from '@mantine/core';

export default function GoalsPage() {
  return (
    <DashboardLayout>
      <Paper p="md" shadow="sm">
        <Title order={2} mb="md">Financial Goals</Title>
        <Text>This is a placeholder for the Goals page. Here you can set and track your financial goals.</Text>
      </Paper>
    </DashboardLayout>
  );
}