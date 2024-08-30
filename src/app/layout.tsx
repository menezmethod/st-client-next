'use client';
import { MantineProvider } from '@mantine/core';
import { theme } from '@/theme';
import '@mantine/core/styles.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </head>
      <body>
        <MantineProvider theme={theme}>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
