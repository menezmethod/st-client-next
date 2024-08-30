import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps } from 'firebase-admin/app';

if (!getApps().length) {
  initializeApp();
}

const auth = getAuth();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { uid, role } = req.body;

  if (!uid || !role) {
    return res.status(400).json({ error: 'Missing uid or role' });
  }

  try {
    await auth.setCustomUserClaims(uid, { role });
    return res.status(200).json({ message: 'Role set successfully' });
  } catch (error) {
    console.error('Error setting custom claims:', error);
    return res.status(500).json({ error: 'Failed to set user role' });
  }
}