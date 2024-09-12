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
      
      // Fetch holdings
      const holdingsResponse = await plaidClient.investmentsHoldingsGet({
        access_token: access_token,
      });

      console.log('Holdings response:', holdingsResponse.data);

      // Fetch investment transactions (optional, remove if not needed)
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      const transactionsResponse = await plaidClient.investmentsTransactionsGet({
        access_token: access_token,
        start_date: startDate,
        end_date: endDate,
      });

      console.log('Transactions response:', transactionsResponse.data);

      res.status(200).json({
        holdings: holdingsResponse.data.holdings,
        securities: holdingsResponse.data.securities,
        accounts: holdingsResponse.data.accounts,
        transactions: transactionsResponse.data.investment_transactions,
      });
    } catch (error: any) {
      console.error('Error fetching investments:', error);
      console.error('Error details:', error.response?.data);
      res.status(500).json({ 
        error: 'Failed to fetch investments', 
        details: error.response?.data || error.message 
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}