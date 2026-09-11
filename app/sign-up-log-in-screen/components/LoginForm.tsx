'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { requestPasswordReset, signInWithEmail, signInWithGoogle } from '../../libs/auth-service';
import { getAuthErrorMessage } from '../../libs/auth-errors';
import FormField, { fieldAria, inputClassName } from './FormField';
import GoogleButton from './GoogleButton';
import PasswordInput from './PasswordInput';

interface LoginFormData {
  email: string;
  password: string;
  keepSignedIn: boolean;
}

type PendingAction = 'google' | 'email' | 'reset' | null;

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export default function LoginForm({ onSwitchToSignup }: { onSwitchToSignup: () => void }) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const isBusy = pendingAction !== null;

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    trigger,
    getValues,
    setFocus,
    formState: { errors },
  } = useForm<LoginFormData>({ defaultValues: { keepSignedIn: true } });

  const handleGoogleSignIn = async () => {
    setPendingAction('google');
    clearErrors('root');

    try {
      await signInWithGoogle();
      toast.success('Welcome!', { description: 'Taking you to your dashboard.' });
      router.push('/');
    } catch (error) {
      const message = getAuthErrorMessage(error);
      if (message) toast.error('Google sign-in failed', { description: message });
    } finally {
      setPendingAction(null);
    }
  };

  const handleForgotPassword = async () => {
    clearErrors('root');
    const isEmailValid = await trigger('email');

    if (!isEmailValid) {
      setFocus('email');
      toast.info('Enter your email first', {
        description: 'Type the email you signed up with, then press Forgot password again.',
      });
      return;
    }

    const email = getValues('email');
    setPendingAction('reset');

    try {
      await requestPasswordReset(email);
      toast.success('Check your inbox', {
        description: `If an account exists for ${email}, a password reset link is on its way.`,
      });
    } catch (error) {
      toast.error('Could not send the reset email', {
        description: getAuthErrorMessage(error) ?? undefined,
      });
    } finally {
      setPendingAction(null);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setPendingAction('email');

    try {
      await signInWithEmail(data.email, data.password, data.keepSignedIn);
      toast.success('Welcome back!', { description: 'Taking you to your dashboard.' });
      router.push('/');
    } catch (error) {
      setError('root', { message: getAuthErrorMessage(error) ?? 'Sign-in was cancelled.' });
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <h2 className="text-foreground mb-1 text-xl font-bold">Welcome back</h2>
        <p className="text-muted-foreground text-sm">Sign in to continue your practice</p>
      </div>

      <GoogleButton
        label="Continue with Google"
        pending={pendingAction === 'google'}
        disabled={isBusy}
        onClick={handleGoogleSignIn}
      />

      <div className="flex items-center gap-3">
        <div className="bg-border h-px flex-1" />
        <span className="text-muted-foreground text-xs">or with email</span>
        <div className="bg-border h-px flex-1" />
      </div>

      {errors.root && (
        <div role="alert" className="bg-danger/10 border-danger/20 rounded-xl border p-3">
          <p className="text-danger text-xs">{errors.root.message}</p>
        </div>
      )}

      <FormField id="login-email" label="Email address" error={errors.email?.message}>
        <input
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          className={inputClassName(Boolean(errors.email))}
          {...fieldAria('login-email', errors.email?.message)}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address' },
          })}
        />
      </FormField>

      <FormField
        id="login-password"
        label="Password"
        error={errors.password?.message}
        labelAction={
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={isBusy}
            className="text-primary-light hover:text-primary flex items-center gap-1 rounded text-xs font-medium underline-offset-4 transition-colors duration-150 hover:underline disabled:opacity-50 disabled:hover:no-underline"
          >
            {pendingAction === 'reset' && (
              <Loader2 size={12} className="animate-spin" aria-hidden />
            )}
            {pendingAction === 'reset' ? 'Sending link' : 'Forgot password?'}
          </button>
        }
      >
        <PasswordInput
          autoComplete="current-password"
          placeholder="Enter your password"
          className={inputClassName(Boolean(errors.password))}
          {...fieldAria('login-password', errors.password?.message)}
          {...register('password', { required: 'Password is required' })}
        />
      </FormField>

      <div className="flex items-center gap-2.5">
        <input
          id="keepSignedIn"
          type="checkbox"
          className="border-border bg-input accent-primary h-4 w-4 rounded"
          {...register('keepSignedIn')}
        />
        <label
          htmlFor="keepSignedIn"
          className="text-secondary-foreground hover:text-foreground text-sm transition-colors duration-150 select-none"
        >
          Keep me signed in on this device
        </label>
      </div>

      <button type="submit" disabled={isBusy} className="btn-primary w-full py-3">
        {pendingAction === 'email' ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden />
            Signing in
          </>
        ) : (
          'Sign In'
        )}
      </button>

      <p className="text-muted-foreground text-center text-sm">
        No account yet?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-primary-light hover:text-primary font-medium underline-offset-4 transition-colors duration-150 hover:underline"
        >
          Create one free
        </button>
      </p>
    </form>
  );
}
