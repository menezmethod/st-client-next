import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

console.log('API route called');
console.log('PLAID_ENV:', process.env.PLAID_ENV);
console.log('PLAID_CLIENT_ID:', process.env.PLAID_CLIENT_ID);
console.log('PLAID_SECRET:', process.env.PLAID_SECRET ? '[REDACTED]' : 'undefined');

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
      'PLAID-SECRET': process.env.PLAID_SECRET!,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      console.log('Creating link token with client ID:', process.env.PLAID_CLIENT_ID);
      const createTokenResponse = await plaidClient.linkTokenCreate({
        user: { client_user_id: 'user-' + Math.random().toString(36).substring(2, 15) },
        client_name: 'ST Trader',
        products: [Products.Transactions],
        country_codes: [CountryCode.Us],
        language: 'en',
      });
      console.log('Link token created successfully:', createTokenResponse.data.link_token);
      res.status(200).json({ link_token: createTokenResponse.data.link_token });
    } catch (error: any) {
      console.error('Error creating link token:', error.response?.data || error);
      res.status(500).json({ 
        error: 'Failed to create link token',
        details: error.response?.data || error.message
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}