import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../lib/firebase';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Loader, Center, Grid } from '@mantine/core';
import { RightSidebar } from '../components/Layout/RightSidebar';
import { DashboardContent } from '../components/Dashboard/DashboardContent';
import { CustomizableDashboard } from '../components/Dashboard/CustomizableDashboard';

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <Center style={{ width: '100%', height: '100%' }}>
          <Loader type="bars" />
        </Center>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Grid>
        <Grid.Col span={9}>
          <DashboardContent />
          <CustomizableDashboard />
        </Grid.Col>
        <Grid.Col span={3}>
          <RightSidebar />
        </Grid.Col>
      </Grid>
    </DashboardLayout>
  );
}