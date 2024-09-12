import { NextApiRequest, NextApiResponse } from 'next';
import { plaidClient } from '../../../lib/plaid';
import { LinkTokenCreateRequest, TransactionsGetRequest, InvestmentsHoldingsGetRequest, InvestmentsTransactionsGetRequest, AuthGetRequest, CountryCode, Products } from 'plaid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const action = req.query.action as string;
  const { access_token, public_token } = req.body;

  try {
    let result;
    switch (action) {
      case 'create_link_token':
        const createLinkTokenRequest: LinkTokenCreateRequest = {
          user: { client_user_id: 'user-id' },
          client_name: 'ST Trader',
          products: ['transactions', 'investments', 'auth'] as Products[],
          country_codes: ['US'] as CountryCode[],
          language: 'en',
          client_id: process.env.PLAID_CLIENT_ID!,
          secret: process.env.PLAID_SECRET!,
        };
        result = await plaidClient.linkTokenCreate(createLinkTokenRequest);
        return res.status(200).json({ link_token: result.data.link_token });
      case 'exchange_public_token':
        result = await plaidClient.itemPublicTokenExchange({ public_token });
        return res.status(200).json({ access_token: result.data.access_token });
      case 'fetch_transactions':
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        console.log(`Fetching transactions from ${startDate} to ${endDate}`);
        const transactionsRequest: TransactionsGetRequest = {
          access_token,
          start_date: startDate,
          end_date: endDate,
          options: {
            count: 500,
            offset: 0,
          }
        };
        result = await plaidClient.transactionsGet(transactionsRequest);
        console.log(`Fetched ${result.data.transactions.length} transactions`);
        return res.status(200).json(result.data.transactions);
      case 'fetch_investments':
        const holdingsRequest: InvestmentsHoldingsGetRequest = { access_token };
        const holdings = await plaidClient.investmentsHoldingsGet(holdingsRequest);
        
        const currentDate = new Date();
        const oneYearAgo = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));
        
        const investmentsTransactionsRequest: InvestmentsTransactionsGetRequest = {
          access_token,
          start_date: oneYearAgo.toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0]
        };
        const transactions = await plaidClient.investmentsTransactionsGet(investmentsTransactionsRequest);
        return res.status(200).json({
          holdings: holdings.data.holdings,
          securities: holdings.data.securities,
          accounts: holdings.data.accounts,
          transactions: transactions.data.investment_transactions,
        });
      case 'fetch_accounts':
        const authRequest: AuthGetRequest = { access_token };
        result = await plaidClient.authGet(authRequest);
        return res.status(200).json(result.data.accounts);
      case 'remove_item':
        await plaidClient.itemRemove({ access_token });
        return res.status(200).json({ message: 'Item removed successfully' });
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error: any) {
    console.error(`Error in ${action}:`, error);
    return res.status(500).json({ 
      error: `Failed to ${action.replace('_', ' ')}`, 
      details: error.response?.data || error.message 
    });
  }
}