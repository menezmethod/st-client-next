import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyIdToken } from '@/lib/firebaseAdmin';
import syncUserHandler from './sync_user';
import syncDataHandler from '../plaid/sync_data';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { idToken } = req.body;

    try {
        const decodedToken = await verifyIdToken(idToken);
        const firebaseUid = decodedToken.uid;

        // Sync user
        const syncUserReq = {
            ...req,
            body: { idToken, id: firebaseUid }
        } as NextApiRequest;
        const syncUserRes = {
            status: (code: number) => ({
                json: (data: any) => {
                    if (code !== 200) console.error('Failed to sync user:', data);
                }
            })
        } as NextApiResponse;
        await syncUserHandler(syncUserReq, syncUserRes);

        // Sync data
        const syncDataReq = {
            ...req,
            headers: {
                authorization: `Bearer ${idToken}`
            },
            body: {}
        } as NextApiRequest;
        const syncDataRes = {
            status: (code: number) => ({
                json: (data: any) => {
                    if (code !== 200) console.error('Failed to sync data:', data);
                }
            })
        } as NextApiResponse;
        await syncDataHandler(syncDataReq, syncDataRes);

        res.status(200).json({ success: true, message: 'User and data synced successfully.' });
    } catch (error) {
        console.error('Login sync error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}