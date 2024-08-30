import type { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, PlaidApi, PlaidEnvironments, AccountBase, Security, Holding } from 'plaid';
import { Investment } from '@/types/investment';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
      'PLAID-SECRET': process.env.PLAID_SECRET!,
    },
  },
});

const client = new PlaidApi(configuration);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { access_token } = req.body;
      
      if (!access_token) {
        throw new Error('Access token is missing');
      }

      // First, get the list of investment accounts
      const accountsResponse = await client.accountsGet({ access_token });
      const investmentAccounts = accountsResponse.data.accounts.filter(
        (account: AccountBase) => account.type === 'investment'
      );

      if (investmentAccounts.length === 0) {
        return res.status(200).json([]);
      }

      // Then, get the holdings for these investment accounts
      const holdingsResponse = await client.investmentsHoldingsGet({ access_token });
      
      const securities = holdingsResponse.data.securities;
      const holdings = holdingsResponse.data.holdings;

      const transformedInvestments: Investment[] = holdings.map((holding: Holding) => {
        const security = securities.find((s: Security) => s.security_id === holding.security_id);
        return {
          id: holding.security_id,
          name: security?.name || 'Unknown',
          type: security?.type || 'Unknown',
          value: holding.institution_value || 0,
          holdings: {
            quantity: holding.quantity || 0,
            cost_basis: holding.cost_basis || 0,
            institution_price: holding.institution_price || 0,
            institution_value: holding.institution_value || 0,
          },
        };
      });

      res.status(200).json(transformedInvestments);
    } catch (error) {
      console.error('Error fetching investments:', error);
      res.status(500).json({ error: `Failed to fetch investments: ${error instanceof Error ? error.message : String(error)}` });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}