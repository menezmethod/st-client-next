import { configureAuth } from 'react-query-auth';
import { auth } from './firebase';
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    User,
    UserCredential
} from 'firebase/auth';
import axios from 'axios';

async function getUserFn(): Promise<User | null> {
    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
        });
    });
}

async function authenticateAndSync(authFunction: () => Promise<UserCredential>): Promise<User> {
    try {
        const { user } = await authFunction();
        console.log('[authenticateAndSync] Authentication successful, syncing user to database:', user.uid);
        await syncUserToDatabase(user);
        console.log('[authenticateAndSync] User sync completed successfully');
        return user;
    } catch (error) {
        console.error('[authenticateAndSync] Failed to authenticate or sync user:', error);
        throw error;
    }
}

export async function loginFn(credentials: { email: string; password: string }): Promise<User> {
    return authenticateAndSync(() => signInWithEmailAndPassword(auth, credentials.email, credentials.password));
}

export async function registerFn(credentials: { email: string; password: string }): Promise<User> {
    return authenticateAndSync(() => createUserWithEmailAndPassword(auth, credentials.email, credentials.password));
}

export async function googleSignInFn(): Promise<User> {
    const provider = new GoogleAuthProvider();
    return authenticateAndSync(() => signInWithPopup(auth, provider));
}

async function syncUserToDatabase(user: User): Promise<void> {
    try {
        console.log('[syncUserToDatabase] Starting user sync process for:', user.uid);
        const idToken = await user.getIdToken();
        console.log('[syncUserToDatabase] Obtained ID Token:', idToken.slice(0, 10) + '...');

        console.log('[syncUserToDatabase] Sending POST request to /api/auth/sync_user');
        const response = await axios.post('/api/auth/sync_user', {
            idToken,
            id: user.uid,
            email: user.email,
            display_name: user.displayName,
            photo_url: user.photoURL,
            bio: '',
            is_email_verified: user.emailVerified,
            phone_number: user.phoneNumber,
            country: '',
            preferred_currency: 'USD',
            last_login: new Date().toISOString(),
        });

        console.log('[syncUserToDatabase] Received response:', response.status, response.data);
    } catch (error: any) {
        console.error('[syncUserToDatabase] Error syncing user to database:', error);
        console.error('[syncUserToDatabase] Error details:', error.response?.data);
        throw error;
    }
}

async function logoutFn(): Promise<void> {
    await signOut(auth);
}

const authConfig = {
    userFn: getUserFn,
    loginFn,
    registerFn,
    logoutFn,
};

export const { useUser, useLogin, useRegister, useLogout, AuthLoader } = configureAuth(authConfig);