import type { NextApiRequest, NextApiResponse } from 'next';
import { query, pool } from '@/lib/db';
import { verifyIdToken } from '@/lib/firebaseAdmin';
import syncDataHandler from './plaid/sync_data';
import syncUserHandler from './auth/sync_user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[${new Date().toISOString()}] [handler] Function called`);

  // Extract ID token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    console.warn('[handler] Missing or invalid Authorization header');
    return;
  }
  const idToken = authHeader.split(' ')[1];

  let firebaseUid: string;
  try {
    const decodedToken = await verifyIdToken(idToken);
    firebaseUid = decodedToken.uid;
    console.log(`[handler] Verified ID token for UID: ${firebaseUid}`);
  } catch (error: any) {
    console.error('[handler] Error verifying ID token:', error.message);
    res.status(401).json({ error: 'Invalid ID token' });
    return;
  }

  // Fetch or sync user in the database
  let userId: string;
  const client = await pool.connect();
  try {
    const userResult = await query('SELECT id FROM users WHERE firebase_uid = $1', [firebaseUid]);
    if (userResult.rows.length === 0) {
      console.warn(`[handler] User not found for UID: ${firebaseUid}. Attempting to sync user.`);
      const { email, display_name } = req.body;

      // Use the sync_user handler
      const syncReq = {
        ...req,
        body: { idToken, id: firebaseUid, email, display_name }
      } as NextApiRequest;
      const syncRes = {
        status: (code: number) => ({
          json: (data: any) => {
            if (code !== 200) throw new Error(data.error || 'Failed to sync user');
          }
        })
      } as unknown as NextApiResponse;

      await syncUserHandler(syncReq, syncRes);

      const newUserResult = await query('SELECT id FROM users WHERE firebase_uid = $1', [firebaseUid]);
      if (newUserResult.rows.length === 0) {
        throw new Error('Failed to sync user');
      }
      userId = newUserResult.rows[0].id;
    } else {
      userId = userResult.rows[0].id;
    }
  } catch (error: any) {
    console.error('[handler] Database error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  } finally {
    client.release();
    console.log('[handler] Database connection released');
  }

  if (req.method === 'GET') {
    try {
      const accountsResult = await query(`
        SELECT id, account_source_id, name, type, subtype, balance, currency_code, is_active
        FROM accounts 
        WHERE user_id = $1
      `, [userId]);
      let accounts = accountsResult.rows;

      console.log('Raw accounts data:', JSON.stringify(accounts, null, 2));

      if (accounts.length === 0) {
        console.warn(`[handler] No accounts found in database for userId: ${userId}. Attempting to sync data.`);
        
        // Trigger a full data sync
        const syncDataReq = {
          ...req,
          method: 'POST',
          headers: { authorization: `Bearer ${idToken}` },
          body: { fullSync: true }
        } as NextApiRequest;
        
        const syncDataRes = {
          status: (code: number) => ({
            json: (data: any) => {
              if (code !== 200) {
                console.error('Failed to sync data:', data);
                throw new Error(data.message || 'Failed to sync data');
              }
              return { json: () => {} };
            }
          })
        } as unknown as NextApiResponse;
        
        await syncDataHandler(syncDataReq, syncDataRes);

        // Fetch accounts again after sync
        const newAccountsResult = await query('SELECT * FROM accounts WHERE user_id = $1', [userId]);
        accounts = newAccountsResult.rows;
      }

      if (accounts.length === 0) {
        return res.status(404).json({ error: 'No accounts found. Please connect your Plaid account and try again.' });
      }

      console.log('Sending accounts to client:', JSON.stringify(accounts, null, 2));
      res.status(200).json({ accounts });
    } catch (error: any) {
      console.error(`[handler] Error fetching accounts:`, error.message, error.stack);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  console.log('[handler] Function execution completed');
}