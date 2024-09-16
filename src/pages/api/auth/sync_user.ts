import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';
import { verifyIdToken } from '@/lib/firebaseAdmin';
import { rateLimit } from '@/lib/rateLimit';
import syncDataHandler from '../plaid/sync_data';

console.log('[Timestamp] [sync_user.ts] App started in environment:', process.env.NODE_ENV);

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 unique tokens per interval
});

/**
 * Sync user data from Firebase Auth to PostgreSQL 'users' table.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[Timestamp] [handler] Function called with method: ${req.method}`);
  
  if (req.method !== 'POST') {
    console.warn('[Timestamp] [handler] Method Not Allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[Timestamp] [handler] Checking rate limit');
    await limiter.check(res, 10, 'CACHE_TOKEN'); // 10 requests per minute
  } catch {
    console.warn('[Timestamp] [handler] Rate limit exceeded');
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  const { idToken, id: firebaseUid, email, display_name, photo_url, bio, is_email_verified, phone_number, date_of_birth, country, preferred_currency, last_login } = req.body;
  console.log(`[Timestamp] [handler] Received sync request for user:`, { firebaseUid, email });

  const client = await pool.connect();
  console.log('[Timestamp] [handler] Database connection established');

  try {
    console.log('[Timestamp] [handler] Beginning database transaction');
    await client.query('BEGIN');
    
    console.log('[Timestamp] [handler] Verifying ID token');
    console.time('verifyIdToken');
    const decodedToken = await verifyIdToken(idToken);
    console.timeEnd('verifyIdToken');
    console.log('[Timestamp] [handler] ID Token verified for user:', decodedToken.uid);

    if (decodedToken.uid !== firebaseUid) {
      console.error('[Timestamp] [handler] ID Token UID does not match the provided Firebase UID');
      return res.status(403).json({ error: 'Unauthorized' });
    }

    console.log('[Timestamp] [handler] Executing database query');
    console.time('databaseQuery');
    const result = await client.query(
      `INSERT INTO users (firebase_uid, email, display_name, photo_url, bio, is_email_verified, phone_number, date_of_birth, country, preferred_currency, last_login)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (firebase_uid) 
       DO UPDATE SET 
         email = EXCLUDED.email,
         display_name = COALESCE(EXCLUDED.display_name, users.display_name),
         photo_url = COALESCE(EXCLUDED.photo_url, users.photo_url),
         bio = COALESCE(EXCLUDED.bio, users.bio),
         is_email_verified = EXCLUDED.is_email_verified,
         phone_number = EXCLUDED.phone_number,
         date_of_birth = EXCLUDED.date_of_birth,
         country = EXCLUDED.country,
         preferred_currency = EXCLUDED.preferred_currency,
         last_login = EXCLUDED.last_login,
         updated_at = now()
       RETURNING *`,
      [firebaseUid, email, display_name, photo_url, bio, is_email_verified, phone_number, date_of_birth, country, preferred_currency, last_login]
    );
    console.timeEnd('databaseQuery');

    console.log('[Timestamp] [handler] Committing database transaction');
    await client.query('COMMIT');
    console.log('[Timestamp] [handler] User synced to database:', result.rows[0]);

    console.log('[Timestamp] [handler] Triggering data sync');
    console.time('dataSyncDuration');
    await syncDataHandler(req, res);
    console.timeEnd('dataSyncDuration');

    console.log('[Timestamp] [handler] User and data sync completed successfully');
    return res.status(200).json({ success: true, message: 'User and data synced successfully.' });
  } catch (error) {
    console.error('[Timestamp] [handler] Error:', error instanceof Error ? error.message : 'Unknown error', error instanceof Error ? error.stack : '');
    await client.query('ROLLBACK');
    console.log('[Timestamp] [handler] Database transaction rolled back');
    res.status(500).json({ error: 'Failed to sync user', details: error instanceof Error ? error.message : 'Unknown error' });
  } finally {
    client.release();
    console.log('[Timestamp] [handler] Database connection released');
  }
}