import React, { ReactNode } from 'react';
import { AppShell, useMantineTheme, useMantineColorScheme, Box } from '@mantine/core';
import { HeaderTabs } from './HeaderTabs';
import { RightSidebar } from './RightSidebar';
import { DashboardContent } from '../Dashboard/DashboardContent';
import { LoadingOverlay } from '@mantine/core';
import { useUser } from '@/lib/auth';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

interface DashboardLayoutProps {
  children: ReactNode;
}

const queryClient = new QueryClient();

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </QueryClientProvider>
  );
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return <LoadingOverlay visible={true} />;
  }

  if (!user) {
    return null;
  }

  return (
    <AppShell
      styles={{
        main: {
          background: colorScheme === 'dark' ? theme.colors.dark[9] : theme.white,
          paddingRight: 0,
        },
      }}
      padding="md"
      navbar={{ width: 0, breakpoint: 'sm' }}
    >
      <Box>
        <HeaderTabs opened={false} toggle={() => {}} />
      </Box>
      <Box maw={1440} mx="auto" style={{ display: 'flex' }}>
        <AppShell.Main style={{ flex: 1, maxWidth: 'calc(100% - 300px)' }}>
          <DashboardContent />
        </AppShell.Main>
        <Box style={{ width: 300, flexShrink: 0 }}>
          <RightSidebar />
        </Box>
      </Box>
      {children}
    </AppShell>
  );
}