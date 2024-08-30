import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

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
      const { access_token } = req.body;
      const now = new Date();
      const twoYearsAgo = new Date(now.setFullYear(now.getFullYear() - 2));
      
      const response = await plaidClient.transactionsGet({
        access_token,
        start_date: twoYearsAgo.toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
      });

      res.status(200).json({ transactions: response.data.transactions });
    } catch (error: any) {
      console.error('Error fetching transactions:', error.response?.data || error.message);
      res.status(500).json({ error: 'Failed to fetch transactions', details: error.response?.data || error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}