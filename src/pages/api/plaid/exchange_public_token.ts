import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { public_token } = req.body;
      console.log('Attempting to exchange public token:', public_token);

      const exchangeResponse = await plaidClient.itemPublicTokenExchange({
        public_token: public_token,
      });

      console.log('Exchange successful, access token obtained');
      res.status(200).json({ access_token: exchangeResponse.data.access_token });
    } catch (error: unknown) {
      console.error('Error exchanging public token:', error);
      res.status(500).json({ 
        error: 'Failed to exchange public token', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}