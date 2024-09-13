import React, { useMemo } from 'react';
import { AppProps } from 'next/app';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import '@mantine/core/styles.css'; 
import { theme } from '@/theme';
import { PlaidProvider } from '@/contexts/PlaidContext';
import { AuthProvider } from '@/contexts/AuthContext';

console.log('[App Initialization] App started in environment:', process.env.NODE_ENV);
console.log('[App Initialization] Theme configuration:', Object.keys(theme));

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  console.log('[MyApp] Function called with pageProps:', Object.keys(pageProps));

  const appContent = useMemo(() => (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <PlaidProvider>
          <AuthProvider>
            <Component {...pageProps} />
          </AuthProvider>
        </PlaidProvider>
      </MantineProvider>
      {process.env.NODE_ENV !== 'production' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  ), [Component, pageProps]);

  console.log('[MyApp] App structure rendered');

  return appContent;
}

export default MyApp;