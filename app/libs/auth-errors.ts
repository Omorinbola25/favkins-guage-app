import { FirebaseError } from 'firebase/app';

const USER_CANCELLED_CODES = new Set([
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/user-cancelled',
]);

const INVALID_LOGIN = 'That email and password do not match an account.';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': INVALID_LOGIN,
  'auth/invalid-login-credentials': INVALID_LOGIN,
  'auth/user-not-found': INVALID_LOGIN,
  'auth/wrong-password': INVALID_LOGIN,
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/missing-email': 'Enter your email address first.',
  'auth/email-already-in-use': 'An account with this email already exists. Try signing in instead.',
  'auth/weak-password': 'Choose a stronger password.',
  'auth/too-many-requests': 'Too many attempts. Wait a few minutes and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/popup-blocked': 'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.',
  'auth/unauthorized-domain': 'Sign-in is not enabled for this website yet.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled yet.',
  'auth/account-exists-with-different-credential':
    'This email is already registered with a different sign-in method.',
  'auth/user-disabled': 'This account has been disabled.',
};

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

export function getAuthErrorMessage(error: unknown): string | null {
  if (!(error instanceof FirebaseError)) return FALLBACK_MESSAGE;
  if (USER_CANCELLED_CODES.has(error.code)) return null;
  return AUTH_ERROR_MESSAGES[error.code] ?? FALLBACK_MESSAGE;
}

export function isAccountLookupError(error: unknown): boolean {
  return error instanceof FirebaseError && error.code === 'auth/user-not-found';
}
