import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Title, Text, Paper } from '@mantine/core';

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <Paper p="md" shadow="sm">
        <Title order={2} mb="md">Financial Reports</Title>
        <Text>This is a placeholder for the Reports page. Here you'll find various financial reports and analytics.</Text>
      </Paper>
    </DashboardLayout>
  );
}