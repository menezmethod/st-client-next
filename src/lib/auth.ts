import { configureAuth } from 'react-query-auth';
import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  User 
} from 'firebase/auth';

async function getUserFn(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

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

export const { useUser, useLogin, useRegister, useLogout, AuthLoader } = configureAuth({
  userFn: getUserFn,
  loginFn,
  registerFn,
  logoutFn,
});