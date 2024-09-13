import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps } from 'firebase-admin/app';

console.log(`[${new Date().toISOString()}] [AppStart] setUserRole API route initialized`);
console.log(`[${new Date().toISOString()}] [AppStart] Environment:`, process.env.NODE_ENV);

if (!getApps().length) {
  console.log(`[${new Date().toISOString()}] [AppStart] Initializing Firebase app`);
  console.time('Firebase App Initialization');
  initializeApp();
  console.timeEnd('Firebase App Initialization');
  console.log(`[${new Date().toISOString()}] [AppStart] Firebase app initialized successfully`);
} else {
  console.log(`[${new Date().toISOString()}] [AppStart] Firebase app already initialized`);
}

const auth = getAuth();
console.log(`[${new Date().toISOString()}] [AppStart] Firebase Auth initialized`);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[${new Date().toISOString()}] [handler] Function called with method:`, req.method);

  if (req.method !== 'POST') {
    console.warn(`[${new Date().toISOString()}] [handler] Method not allowed:`, req.method);
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    console.log(`[${new Date().toISOString()}] [handler] Method not allowed response sent with status 405`);
    return;
  }

  const { uid, role } = req.body;
  console.log(`[${new Date().toISOString()}] [handler] Request body:`, { uid, role });

  if (!uid || !role) {
    console.warn(`[${new Date().toISOString()}] [handler] Missing uid or role in request body`);
    res.status(400).json({ error: 'Missing uid or role' });
    console.log(`[${new Date().toISOString()}] [handler] Bad request response sent with status 400`);
    return;
  }

  try {
    console.log(`[${new Date().toISOString()}] [handler] Setting custom user claims for uid:`, uid);
    console.time('Set Custom User Claims Duration');
    await auth.setCustomUserClaims(uid, { role });
    console.timeEnd('Set Custom User Claims Duration');
    console.log(`[${new Date().toISOString()}] [handler] Custom user claims set successfully`);

    res.status(200).json({ message: 'Role set successfully' });
    console.log(`[${new Date().toISOString()}] [handler] Success response sent with status 200`);
  } catch (error: any) {
    console.timeEnd('Set Custom User Claims Duration');
    console.error(`[${new Date().toISOString()}] [handler] Error setting custom claims:`, error.message, error.stack);
    res.status(500).json({ error: 'Failed to set user role' });
    console.log(`[${new Date().toISOString()}] [handler] Error response sent with status 500`);
  }

  console.log(`[${new Date().toISOString()}] [handler] Request handling completed`);
}