import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

console.log(`[${new Date().toISOString()}] [AppStart] Plaid API route initialized`);
console.log(`[${new Date().toISOString()}] [AppStart] Environment:`, {
  PLAID_ENV: serverRuntimeConfig.PLAID_ENV,
  PLAID_CLIENT_ID: serverRuntimeConfig.PLAID_CLIENT_ID ? '[REDACTED]' : 'undefined',
  PLAID_SECRET_SANDBOX: serverRuntimeConfig.PLAID_SECRET_SANDBOX ? '[REDACTED]' : 'undefined'
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[${new Date().toISOString()}] [handler] Function called with method:`, req.method);

  if (!serverRuntimeConfig.PLAID_CLIENT_ID || !serverRuntimeConfig.PLAID_SECRET_SANDBOX) {
    console.error(`[${new Date().toISOString()}] [handler] Plaid credentials are missing`);
    return res.status(500).json({ error: 'Server configuration error: Missing Plaid credentials' });
  }

  console.log(`[${new Date().toISOString()}] [handler] Initializing Plaid configuration`);
  const configuration = new Configuration({
    basePath: PlaidEnvironments[serverRuntimeConfig.PLAID_ENV as keyof typeof PlaidEnvironments || 'sandbox'],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': serverRuntimeConfig.PLAID_CLIENT_ID,
        'PLAID-SECRET': serverRuntimeConfig.PLAID_SECRET_SANDBOX,
      },
    },
  });

  console.log(`[${new Date().toISOString()}] [handler] Creating Plaid API client`);
  const plaidClient = new PlaidApi(configuration);

  if (req.method === 'POST') {
    console.log(`[${new Date().toISOString()}] [handler] POST request received`);
    try {
      console.log(`[${new Date().toISOString()}] [handler] Attempting to create link token...`);
      console.time('Link Token Creation Duration');

      const linkTokenParams = {
        user: { client_user_id: process.env.CLIENT_USER_ID || 'default-user-id' },
        client_name: 'ST Trader',
        products: [Products.Transactions],
        country_codes: [CountryCode.Us],
        language: 'en',
      };
      console.log(`[${new Date().toISOString()}] [handler] Link token creation params:`, linkTokenParams);

      const response = await plaidClient.linkTokenCreate(linkTokenParams);
      console.timeEnd('Link Token Creation Duration');

      console.log(`[${new Date().toISOString()}] [handler] Link token created successfully:`, response.data.link_token);
      console.debug(`[${new Date().toISOString()}] [handler] Full response:`, response.data);

      res.status(200).json({ link_token: response.data.link_token });
      console.log(`[${new Date().toISOString()}] [handler] Response sent with status 200`);
    } catch (error: any) {
      console.timeEnd('Link Token Creation Duration');
      console.error(`[${new Date().toISOString()}] [handler] Error creating link token:`, error.message, error.stack);
      if (error.response) {
        console.error(`[${new Date().toISOString()}] [handler] Error response:`, error.response.data);
      }
      res.status(500).json({ 
        error: 'Failed to create link token', 
        details: error.message || 'Unknown error',
        plaidError: error.response ? error.response.data : null
      });
      console.log(`[${new Date().toISOString()}] [handler] Error response sent with status 500`);
    }
  } else {
    console.warn(`[${new Date().toISOString()}] [handler] Method not allowed:`, req.method);
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    console.log(`[${new Date().toISOString()}] [handler] Method not allowed response sent with status 405`);
  }

  console.log(`[${new Date().toISOString()}] [handler] Request handling completed`);
}