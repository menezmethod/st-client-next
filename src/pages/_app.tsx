import React from 'react';
import { AppProps } from 'next/app';
import { Loader, MantineProvider, Center } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import '@mantine/core/styles.css'; 
import { theme } from '../theme'; 

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed. User:', user ? 'Logged in' : 'Not logged in');
      setIsAuthReady(true);
      
      if (user) {
        if (router.pathname === '/login' || router.pathname === '/signup') {
          router.push('/dashboard');
        }
      } else {
        if (router.pathname !== '/login' && router.pathname !== '/signup') {
          router.push('/login');
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!isAuthReady) {
    return (
      <MantineProvider theme={theme}>
        <Center style={{ width: '100vw', height: '100vh' }}>
          <Loader color="blue" size="xl" type="bars" />
        </Center>
      </MantineProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <Component {...pageProps} />
      </MantineProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default MyApp;