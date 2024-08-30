import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { auth } from '../lib/firebase';

async function loginFn(credentials: { email: string; password: string }) {
  const { email, password } = credentials;
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

async function registerFn(credentials: { email: string; password: string }) {
  const { email, password } = credentials;
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  return user;
}

async function logoutFn() {
  await signOut(auth);
}

async function getUserFn(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export const authConfig = {
  loginFn,
  registerFn,
  logoutFn,
  getUserFn,
};