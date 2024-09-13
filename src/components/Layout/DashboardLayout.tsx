import React, { ReactNode } from 'react';
import { AppShell, useMantineTheme, useMantineColorScheme, Box } from '@mantine/core';
import { HeaderTabs } from './HeaderTabs';
import { LoadingOverlay } from '@mantine/core';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const { user, loading: isLoading } = useAuth();

  if (isLoading) {
    return <LoadingOverlay visible={true} />;
  }

  if (!user) {
    return <div>You are not authorized to view this page. Please log in.</div>;
  }

  return (
    <AppShell
      styles={{
        main: {
          background: colorScheme === 'dark' ? theme.colors.dark[9] : theme.white,
        },
      }}
      padding="md"
      navbar={{ width: 0, breakpoint: 'sm' }}
    >
      <Box>
        <HeaderTabs />
      </Box>
      <Box maw={1440} mx="auto">
        <AppShell.Main>
          {children}
        </AppShell.Main>
      </Box>
    </AppShell>
  );
}