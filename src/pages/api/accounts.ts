import type { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, PlaidApi, PlaidEnvironments, AccountBase } from 'plaid';
import { Account } from '@/types/account';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
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
      const accountsResponse = await client.accountsGet({
        access_token: access_token,
      });
      
      const transformedAccounts: Account[] = accountsResponse.data.accounts.map((account: AccountBase) => ({
        id: account.account_id,
        name: account.name,
        type: account.type,
        subtype: account.subtype,
        balances: {
          current: account.balances.current || 0,
          available: account.balances.available,
          limit: account.balances.limit,
        },
      }));

      res.status(200).json(transformedAccounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      res.status(500).json({ error: 'Failed to fetch accounts' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}