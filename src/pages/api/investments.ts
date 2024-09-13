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
      const investmentsResult = await query(`
        SELECT i.*, a.name as account_name
        FROM investments i
        JOIN accounts a ON i.account_id = a.id
        WHERE i.user_id = $1
        ORDER BY i.current_market_value DESC
      `, [userId]);
      let investments = investmentsResult.rows;

      console.log('Raw investments data:', JSON.stringify(investments, null, 2));

      if (investments.length === 0) {
        console.warn(`[handler] No investments found in database for userId: ${userId}. Attempting to sync data.`);
        
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

        // Fetch investments again after sync
        const newInvestmentsResult = await query(`
          SELECT i.*, a.name as account_name
          FROM investments i
          JOIN accounts a ON i.account_id = a.id
          WHERE i.user_id = $1
          ORDER BY i.current_market_value DESC
        `, [userId]);
        investments = newInvestmentsResult.rows;
      }

      if (investments.length === 0) {
        return res.status(404).json({ error: 'No investments found. Please connect your investment account and try again.' });
      }

      console.log('Sending investments to client:', JSON.stringify(investments, null, 2));
      res.status(200).json({ investments });
    } catch (error: any) {
      console.error(`[handler] Error fetching investments:`, error.message, error.stack);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  console.log('[handler] Function execution completed');
}