import {
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { isAccountLookupError } from './auth-errors';

export interface UserProfile {
  fullName: string;
  targetRole: string;
  experienceLevel: string;
  careerGoal: string;
}

function createGoogleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

export async function signInWithGoogle(): Promise<User> {
  const credential = await signInWithPopup(auth, createGoogleProvider());
  return credential.user;
}

export async function signInWithEmail(
  email: string,
  password: string,
  keepSignedIn: boolean
): Promise<User> {
  await setPersistence(auth, keepSignedIn ? browserLocalPersistence : browserSessionPersistence);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
  await setDoc(
    doc(db, 'users', userId),
    { ...profile, updatedAt: new Date().toISOString() },
    { merge: true }
  );
}

export async function signUpWithEmail(
  email: string,
  password: string,
  profile: UserProfile
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: profile.fullName });

  try {
    await saveUserProfile(credential.user.uid, profile);
  } catch (error) {
    console.error('Account created, but the profile could not be saved.', error);
  }

  return credential.user;
}

export async function requestPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    if (isAccountLookupError(error)) return;
    throw error;
  }
}
