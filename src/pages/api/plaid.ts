import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API route called');
  console.log('PLAID_ENV:', serverRuntimeConfig.PLAID_ENV);
  console.log('PLAID_CLIENT_ID:', serverRuntimeConfig.PLAID_CLIENT_ID);
  console.log('PLAID_SECRET:', serverRuntimeConfig.PLAID_SECRET ? '[REDACTED]' : 'undefined');

  if (!serverRuntimeConfig.PLAID_CLIENT_ID || !serverRuntimeConfig.PLAID_SECRET) {
    console.error('Plaid credentials are missing');
    return res.status(500).json({ error: 'Server configuration error: Missing Plaid credentials' });
  }

  const configuration = new Configuration({
    basePath: PlaidEnvironments[serverRuntimeConfig.PLAID_ENV as keyof typeof PlaidEnvironments || 'sandbox'],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': serverRuntimeConfig.PLAID_CLIENT_ID,
        'PLAID-SECRET': serverRuntimeConfig.PLAID_SECRET,
      },
    },
  });

  const plaidClient = new PlaidApi(configuration);

  if (req.method === 'POST') {
    try {
      console.log('Attempting to create link token...');

      const response = await plaidClient.linkTokenCreate({
        user: { client_user_id: process.env.CLIENT_USER_ID || 'default-user-id' },
        client_name: 'ST Trader',
        products: [Products.Transactions],
        country_codes: [CountryCode.Us],
        language: 'en',
      });
      console.log('Link token created successfully:', response.data.link_token);
      res.status(200).json({ link_token: response.data.link_token });
    } catch (error: any) {
      console.error('Error creating link token:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      res.status(500).json({ 
        error: 'Failed to create link token', 
        details: error.message || 'Unknown error',
        plaidError: error.response ? error.response.data : null
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}