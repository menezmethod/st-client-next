import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../lib/firebase';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Loader, Center } from '@mantine/core';

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

  return (
    <DashboardLayout>
      {auth.currentUser ? (
        <></>
      ) : (
        <Center style={{ width: '100%', height: '100%' }}>
          <Loader type="bars" />
        </Center>
      )}
    </DashboardLayout>
  );
}