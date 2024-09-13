import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
  }
}

export { admin };

/**
 * Verify Firebase ID Token
 */
export async function verifyIdToken(idToken: string) {
  try {
    return await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    console.error('[firebaseAdmin] Error verifying ID token:', error);
    throw new Error('Invalid ID token');
  }
}