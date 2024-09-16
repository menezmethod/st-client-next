import { NextApiRequest, NextApiResponse } from 'next';
import { plaidClient } from '@/lib/plaid';
import {
    LinkTokenCreateRequest,
    TransactionsGetRequest,
    InvestmentsHoldingsGetRequest,
    InvestmentsTransactionsGetRequest,
    AuthGetRequest,
    CountryCode,
    Products
} from 'plaid';
import { query } from '@/lib/db';
import { encrypt } from '@/lib/encryption';
import { verifyIdToken } from '@/lib/firebaseAdmin';
import syncDataHandler from './sync_data';

console.log('[Timestamp] [plaid/[action].ts] App started in environment:', process.env.NODE_ENV);

async function storeProviderToken(userId: string, providerName: string, accessToken: string, itemId: string) {
  try {
    console.log(`[${new Date().toISOString()}] [storeProviderToken] Storing token for user: ${userId}`);

    // Get or create the provider_id from the data_providers table
    let providerId;
    const providerResult = await query('SELECT id FROM data_providers WHERE name = $1', [providerName]);
    if (providerResult.rows.length === 0) {
      console.log(`[${new Date().toISOString()}] [storeProviderToken] Provider not found, creating: ${providerName}`);
      const insertResult = await query(
        `INSERT INTO data_providers (name, description, is_active, provider_type, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING id`,
        [providerName, 'Plaid financial data provider', true, 'financial']
      );
      providerId = insertResult.rows[0].id;
    } else {
      providerId = providerResult.rows[0].id;
    }

    // Encrypt the access token
    const encryptedAccessToken = await encrypt(accessToken);

    // Set expiry date to 30 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    // Insert or update the provider_tokens table
    await query(
      `INSERT INTO provider_tokens (user_id, provider_id, access_token_encrypted, item_id, access_token_expires_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (user_id, provider_id) 
       DO UPDATE SET 
         access_token_encrypted = EXCLUDED.access_token_encrypted,
         item_id = EXCLUDED.item_id,
         access_token_expires_at = EXCLUDED.access_token_expires_at,
         updated_at = NOW()`,
      [userId, providerId, encryptedAccessToken, itemId, expiryDate]
    );

    console.log(`[${new Date().toISOString()}] [storeProviderToken] Token stored successfully for user: ${userId}`);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[${new Date().toISOString()}] [storeProviderToken] Error: ${error.message}`, error.stack);
    } else {
      console.error(`[${new Date().toISOString()}] [storeProviderToken] Unknown error`);
    }
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log(`[${new Date().toISOString()}] [handler] API route called:`, {method: req.method, url: req.url});

    if (req.method !== 'POST') {
        console.warn(`[${new Date().toISOString()}] [handler] Method ${req.method} Not Allowed`);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const action = req.query.action as string;
    const { access_token, public_token, idToken } = req.body;
    console.log(`[${new Date().toISOString()}] [handler] Processing action:`, action, {
        access_token: access_token ? 'present' : 'not present',
        public_token: public_token ? 'present' : 'not present'
    });

    try {
        let result;
        let firebaseUid: string;

        switch (action) {
            case 'create_link_token':
                console.log(`[${new Date().toISOString()}] [create_link_token] Creating link token with user ID: user-id`);
                const createLinkTokenRequest: LinkTokenCreateRequest = {
                    user: { client_user_id: 'user-id' },
                    client_name: 'ST Trader',
                    products: ['transactions', 'investments', 'auth'] as Products[],
                    country_codes: ['US'] as CountryCode[],
                    language: 'en',
                };
                console.log(`[${new Date().toISOString()}] [create_link_token] Request payload:`, createLinkTokenRequest);
                console.time('create_link_token_duration');
                result = await plaidClient.linkTokenCreate(createLinkTokenRequest);
                console.timeEnd('create_link_token_duration');
                console.log(`[${new Date().toISOString()}] [create_link_token] Link token created successfully:`, { link_token: result.data.link_token.slice(0, 10) + '...' });
                return res.status(200).json({ link_token: result.data.link_token });

            case 'exchange_public_token':
                console.log(`[${new Date().toISOString()}] [exchange_public_token] Exchanging public token:`, public_token);
                console.time('exchange_public_token_duration');
                result = await plaidClient.itemPublicTokenExchange({ public_token });
                console.timeEnd('exchange_public_token_duration');
                console.log(`[${new Date().toISOString()}] [exchange_public_token] Public token exchanged successfully`);
                
                if (!idToken) {
                  console.error('[exchange_public_token] ID token is missing');
                  return res.status(400).json({ error: 'ID token is required' });
                }

                try {
                  const decodedToken = await verifyIdToken(idToken);
                  firebaseUid = decodedToken.uid;
                } catch (tokenError) {
                  console.error('[exchange_public_token] Error verifying ID token:', tokenError);
                  return res.status(401).json({ error: 'Invalid ID token' });
                }

                try {
                  const userResult = await query('SELECT id FROM users WHERE firebase_uid = $1', [firebaseUid]);
                  if (userResult.rows.length === 0) {
                    console.error('[exchange_public_token] User not found for Firebase UID:', firebaseUid);
                    return res.status(404).json({ error: 'User not found' });
                  }
                  const userId = userResult.rows[0].id;

                  try {
                    await storeProviderToken(userId, 'Plaid', result.data.access_token, result.data.item_id);
                    console.log(`[${new Date().toISOString()}] [exchange_public_token] Access token stored for user:`, userId);

                    // Trigger data sync
                    const syncDataReq = {
                      ...req,
                      headers: { authorization: `Bearer ${idToken}` },
                      body: { fullSync: true }
                    } as NextApiRequest;
                    const syncDataRes = {
                      status: (code: number) => ({
                        json: (data: any) => {
                          if (code !== 200) console.error('Failed to sync data:', data);
                          return res;
                        }
                      })
                    } as unknown as NextApiResponse;
                    
                    await syncDataHandler(syncDataReq, syncDataRes);
                    console.log(`[${new Date().toISOString()}] [exchange_public_token] Data sync completed for user:`, userId);
                    
                    return res.status(200).json({ success: true });
                  } catch (providerError) {
                    console.error('[exchange_public_token] Error storing provider token:', providerError);
                    return res.status(500).json({ error: 'Failed to store provider token', details: (providerError as Error).message });
                  }
                } catch (dbError) {
                  console.error('[exchange_public_token] Database error:', dbError);
                  return res.status(500).json({ error: 'Failed to process Plaid connection' });
                }

            case 'fetch_transactions':
                const endDate = new Date().toISOString().split('T')[0];
                const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                console.log(`[${new Date().toISOString()}] [fetch_transactions] Fetching transactions from ${startDate} to ${endDate}`);
                const transactionsRequest: TransactionsGetRequest = {
                    access_token,
                    start_date: startDate,
                    end_date: endDate,
                    options: {
                        count: 500,
                        offset: 0,
                    }
                };
                console.log(`[${new Date().toISOString()}] [fetch_transactions] Request payload:`, transactionsRequest);
                console.time('fetch_transactions_duration');
                result = await plaidClient.transactionsGet(transactionsRequest);
                console.timeEnd('fetch_transactions_duration');
                console.log(`[${new Date().toISOString()}] [fetch_transactions] Fetched ${result.data.transactions.length} transactions`);
                return res.status(200).json(result.data.transactions);

            case 'fetch_investments':
                console.log(`[${new Date().toISOString()}] [fetch_investments] Fetching investments data`);
                const holdingsRequest: InvestmentsHoldingsGetRequest = { access_token };
                console.log(`[${new Date().toISOString()}] [fetch_investments] Holdings request payload:`, holdingsRequest);
                console.time('fetch_holdings_duration');
                const holdings = await plaidClient.investmentsHoldingsGet(holdingsRequest);
                console.timeEnd('fetch_holdings_duration');

                const currentDate = new Date();
                const oneYearAgo = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));

                const investmentsTransactionsRequest: InvestmentsTransactionsGetRequest = {
                    access_token,
                    start_date: oneYearAgo.toISOString().split('T')[0],
                    end_date: new Date().toISOString().split('T')[0]
                };
                console.log(`[${new Date().toISOString()}] [fetch_investments] Transactions request payload:`, investmentsTransactionsRequest);
                console.time('fetch_investment_transactions_duration');
                const transactions = await plaidClient.investmentsTransactionsGet(investmentsTransactionsRequest);
                console.timeEnd('fetch_investment_transactions_duration');
                console.log(`[${new Date().toISOString()}] [fetch_investments] Fetched ${holdings.data.holdings.length} holdings and ${transactions.data.investment_transactions.length} transactions`);
                return res.status(200).json({
                    holdings: holdings.data.holdings,
                    securities: holdings.data.securities,
                    accounts: holdings.data.accounts,
                    transactions: transactions.data.investment_transactions,
                });

            case 'fetch_accounts':
                console.log(`[${new Date().toISOString()}] [fetch_accounts] Fetching accounts`);
                const authRequest: AuthGetRequest = { access_token };
                console.log(`[${new Date().toISOString()}] [fetch_accounts] Auth request payload:`, authRequest);
                console.time('fetch_accounts_duration');
                result = await plaidClient.authGet(authRequest);
                console.timeEnd('fetch_accounts_duration');
                console.log(`[${new Date().toISOString()}] [fetch_accounts] Fetched ${result.data.accounts.length} accounts`);
                return res.status(200).json(result.data.accounts);

            case 'remove_item':
                console.log(`[${new Date().toISOString()}] [remove_item] Removing item with access token:`, access_token?.slice(0, 10) + '...');
                console.time('remove_item_duration');
                await plaidClient.itemRemove({ access_token });
                console.timeEnd('remove_item_duration');
                console.log(`[${new Date().toISOString()}] [remove_item] Item removed successfully`);
                return res.status(200).json({ message: 'Item removed successfully' });

            case 'reset_sync':
                console.log(`[${new Date().toISOString()}] [reset_sync] Resetting sync cursor for user.`);
                
                if (!idToken) {
                    console.error('[reset_sync] ID token is missing');
                    return res.status(400).json({ error: 'ID token is required' });
                }

                const decodedToken = await verifyIdToken(idToken);
                firebaseUid = decodedToken.uid;

                const userResult = await query('SELECT id FROM users WHERE firebase_uid = $1', [firebaseUid]);
                if (userResult.rows.length === 0) {
                    console.error('[reset_sync] User not found for Firebase UID:', firebaseUid);
                    return res.status(404).json({ error: 'User not found' });
                }
                const userId = userResult.rows[0].id;

                await query(
                    'DELETE FROM user_provider_connections WHERE user_id = $1 AND provider_id = (SELECT id FROM data_providers WHERE name = $2)',
                    [userId, 'Plaid']
                );

                console.log(`[${new Date().toISOString()}] [reset_sync] Sync cursor reset successfully for user:`, userId);

                // Trigger sync_data after resetting
                const syncDataReq = {
                    ...req,
                    body: { fullSync: true }
                } as NextApiRequest;

                await syncDataHandler(syncDataReq, res);
                console.log(`[${new Date().toISOString()}] [reset_sync] Full sync triggered for user:`, userId);
                return; // Response already handled by syncDataHandler

            default:
                console.warn(`[${new Date().toISOString()}] [handler] Invalid action: ${action}`);
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error(`[${new Date().toISOString()}] [handler] Error in ${action}:`, error.message, error.stack);
            console.log(`[${new Date().toISOString()}] [handler] Error details:`, (error as any).response?.data || 'No additional details');
        } else {
            console.error(`[${new Date().toISOString()}] [handler] Unknown error in ${action}`);
        }
        return res.status(500).json({
            error: `Failed to ${action.replace('_', ' ')}`,
            details: (error as any).response?.data || 'Unknown error'
        });
    } finally {
        console.log(`[${new Date().toISOString()}] [handler] Request completed for action: ${action}`);
    }
}

console.log('[Timestamp] [plaid/[action].ts] Handler initialized');