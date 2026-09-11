export class SessionAccessError extends Error {
  readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'SessionAccessError';
    this.cause = cause;
  }
}

export class NotAuthenticatedError extends Error {
  constructor(message = 'You need to be signed in to view this.') {
    super(message);
    this.name = 'NotAuthenticatedError';
  }
}

export function toUserFacingMessage(error: unknown): string {
  if (error instanceof NotAuthenticatedError || error instanceof SessionAccessError) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
