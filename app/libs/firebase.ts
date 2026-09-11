import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { readFirebaseEnvironment } from './env';

const environment = readFirebaseEnvironment();

const firebaseConfig = {
  apiKey: environment.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: environment.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: environment.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: environment.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: environment.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: environment.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
