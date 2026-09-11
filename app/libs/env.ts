import { z } from 'zod';

const firebaseEnvironmentSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_API_KEY is missing'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z
    .string()
    .min(1, 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is missing'),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing'),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z
    .string()
    .min(1, 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is missing'),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z
    .string()
    .min(1, 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID is missing'),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_APP_ID is missing'),
});

export type FirebaseEnvironment = z.infer<typeof firebaseEnvironmentSchema>;

export class EnvironmentConfigError extends Error {
  constructor(issues: string[]) {
    super(
      `Firebase configuration is incomplete:\n${issues.map((issue) => `  - ${issue}`).join('\n')}\n\n` +
        'Set these in your .env file locally, and in your hosting provider settings when deploying.'
    );
    this.name = 'EnvironmentConfigError';
  }
}

export function readFirebaseEnvironment(): FirebaseEnvironment {
  const parsed = firebaseEnvironmentSchema.safeParse({
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });

  if (!parsed.success) {
    throw new EnvironmentConfigError(parsed.error.issues.map((issue) => issue.message));
  }

  return parsed.data;
}
