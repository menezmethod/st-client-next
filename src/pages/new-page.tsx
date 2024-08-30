import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Grid } from '@mantine/core';
import { RightSidebar } from '../components/Layout/RightSidebar';

export default function NewPage() {
  return (
    <DashboardLayout>
      <Grid>
        <Grid.Col span={9}>
         Transactions
        </Grid.Col>
      </Grid>
    </DashboardLayout>
  );
}