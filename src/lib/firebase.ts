import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBrPXtYcSZ8q2REkZVniiGnm1DZtdxOEII",
  authDomain: "st-trader-np.firebaseapp.com",
  projectId: "st-trader-np",
  storageBucket: "st-trader-np.appspot.com",
  messagingSenderId: "708256667332",
  appId: "1:708256667332:web:f7bc3f00018d8587609b91",
  measurementId: "G-HVLYDMX2L5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);