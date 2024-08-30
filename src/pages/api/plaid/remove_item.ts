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
      const { access_token } = req.body;
      console.log('Attempting to remove Item with access token:', access_token);

      await plaidClient.itemRemove({
        access_token: access_token,
      });

      console.log('Item removed successfully');
      res.status(200).json({ message: 'Item removed successfully' });
    } catch (error: unknown) {
      console.error('Error removing Item:', error);
      res.status(500).json({ 
        error: 'Failed to remove Item', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}