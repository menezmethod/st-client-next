'use client';

import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Text, Paper, Container, Stack } from '@mantine/core';

export default function Home() {
  return (
    <DashboardLayout>
      <Container size="xl" px="md">
        <Stack>
          <Paper shadow="sm" p="md" radius="md">
          </Paper>
        </Stack>
      </Container>
    </DashboardLayout>
  );
}
