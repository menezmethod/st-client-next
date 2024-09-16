import type { NextApiRequest, NextApiResponse } from 'next';
import { query, pool } from '@/lib/db';
import { verifyIdToken } from '@/lib/firebaseAdmin';
import syncDataHandler from './plaid/sync_data';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[${new Date().toISOString()}] [handler] Function called`);

  // Extract ID token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    console.warn('[handler] Missing or invalid Authorization header');
    return;
  }
  const idToken = authHeader.split('Bearer ')[1];

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

  // Fetch user ID from the database
  let userId: string;
  const client = await pool.connect();
  try {
    const userResult = await query('SELECT id FROM users WHERE firebase_uid = $1', [firebaseUid]);
    if (userResult.rows.length === 0) {
      console.error(`[handler] User not found for UID: ${firebaseUid}`);
      res.status(404).json({ error: 'User not found' });
      return;
    }
    userId = userResult.rows[0].id;
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
      const transactionsResult = await query(`
        SELECT t.*, a.name as account_name
        FROM transactions t
        JOIN accounts a ON t.account_id = a.id
        WHERE t.user_id = $1
        ORDER BY t.created_at DESC
        LIMIT 100
      `, [userId]);
      let transactions = transactionsResult.rows;

      console.log('Raw transactions data:', JSON.stringify(transactions, null, 2));

      if (transactions.length === 0) {
        console.warn(`[handler] No transactions found in database for userId: ${userId}. Attempting to sync data.`);
        
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

        // Fetch transactions again after sync
        const newTransactionsResult = await query(`
          SELECT t.*, a.name as account_name
          FROM transactions t
          JOIN accounts a ON t.account_id = a.id
          WHERE t.user_id = $1
          ORDER BY t.created_at DESC
          LIMIT 100
        `, [userId]);
        transactions = newTransactionsResult.rows;
      }

      if (transactions.length === 0) {
        return res.status(404).json({ error: 'No transactions found. Please connect your account and try again.' });
      }

      console.log('Sending transactions to client:', JSON.stringify(transactions, null, 2));
      res.status(200).json({ transactions });
    } catch (error: any) {
      console.error(`[handler] Error fetching transactions:`, error.message, error.stack);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  console.log('[handler] Function execution completed');
}