import { createTheme } from '@mantine/core';
import { MantineTheme } from '@mantine/core';

export const theme = createTheme({
  fontFamily: 'Poppins, sans-serif',
  primaryColor: 'teal',
  colors: {
    teal: [
      '#E6FCF5',
      '#C3FAE8',
      '#96F2D7',
      '#63E6BE',
      '#38D9A9',
      '#20C997',
      '#12B886',
      '#0CA678',
      '#099268',
      '#087F5B',
    ],
  },
  headings: {
    fontFamily: 'Poppins, sans-serif',
    fontWeight: '600',
  },
  components: {
    Button: {
        styles: (theme: MantineTheme) => ({
            root: {
          fontWeight: 500,
        },
      }),
    },
    Table: {
      styles: (theme: MantineTheme) => ({
        root: {
          '& th': {
            fontWeight: 600,
          },
        },
      }),
    },
  },
});
