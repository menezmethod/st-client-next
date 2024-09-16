import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Loader, Center, Grid } from '@mantine/core';
import { RightSidebar } from '@/components/Layout/RightSidebar';
import { CustomizableDashboard } from '@/components/Dashboard/CustomizableDashboard';
import { DashboardContent } from '@/components/Dashboard/DashboardContent';

export default function Dashboard() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <Center style={{ width: '100%', height: '100vh' }}>
                <Loader type="bars" />
            </Center>
        );
    }

    if (!user) {
        return null;
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
