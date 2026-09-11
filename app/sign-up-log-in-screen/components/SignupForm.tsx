'use client';

import React, { useState } from 'react';
import { useForm, useWatch, type UseFormRegisterReturn } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { signInWithGoogle, signUpWithEmail } from '../../libs/auth-service';
import { getAuthErrorMessage } from '../../libs/auth-errors';
import { roles } from '../../libs/role';
import FormField, { fieldAria, inputClassName } from './FormField';
import GoogleButton from './GoogleButton';
import PasswordInput from './PasswordInput';

interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  targetRole: string;
  experienceLevel: string;
  careerGoal: string;
  agreeToTerms: boolean;
}

interface SelectOption {
  value: string;
  label: string;
}

type PendingAction = 'google' | 'email' | null;

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

const TARGET_ROLE_OPTIONS: SelectOption[] = [
  ...roles.map((role) => ({ value: role.id, label: role.title })),
  { value: 'other', label: 'Other' },
];

const EXPERIENCE_OPTIONS: SelectOption[] = [
  { value: 'student', label: 'Student / New Grad' },
  { value: 'entry', label: '0 to 2 years (Entry Level)' },
  { value: 'mid', label: '3 to 5 years (Mid Level)' },
  { value: 'senior', label: '6 to 10 years (Senior)' },
  { value: 'lead', label: '10+ years (Staff / Lead)' },
];

const GOAL_OPTIONS: SelectOption[] = [
  { value: 'new-job', label: 'Land a new job soon' },
  { value: 'level-up', label: 'Level up at my current company' },
  { value: 'career-change', label: 'Change careers entirely' },
  { value: 'confidence', label: 'Build general interview confidence' },
];

const PASSWORD_STRENGTH = [
  { label: '', barColor: '', textColor: '' },
  { label: 'Weak', barColor: 'bg-danger', textColor: 'text-danger' },
  { label: 'Fair', barColor: 'bg-warning', textColor: 'text-warning' },
  { label: 'Good', barColor: 'bg-accent', textColor: 'text-accent' },
  { label: 'Strong', barColor: 'bg-success', textColor: 'text-success' },
] as const;

function scorePassword(password: string): number {
  if (!password) return 0;
  return [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((rule) => rule.test(password)).length;
}

function SelectField({
  id,
  label,
  placeholder,
  options,
  error,
  registration,
}: {
  id: string;
  label: string;
  placeholder: string;
  options: SelectOption[];
  error?: string;
  registration: UseFormRegisterReturn;
}) {
  return (
    <FormField id={id} label={label} error={error}>
      <select
        defaultValue=""
        className={inputClassName(Boolean(error))}
        {...fieldAria(id, error)}
        {...registration}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

export default function SignupForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const isBusy = pendingAction !== null;

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<SignupFormData>();

  const password = useWatch({ control, name: 'password', defaultValue: '' });
  const strengthScore = scorePassword(password);
  const strength = PASSWORD_STRENGTH[strengthScore];

  const handleGoogleSignUp = async () => {
    setPendingAction('google');
    clearErrors('root');

    try {
      await signInWithGoogle();
      toast.success('You are in!', { description: 'Welcome to TheGauge.' });
      router.push('/');
    } catch (error) {
      const message = getAuthErrorMessage(error);
      if (message) toast.error('Google sign-up failed', { description: message });
    } finally {
      setPendingAction(null);
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    setPendingAction('email');

    try {
      await signUpWithEmail(data.email, data.password, {
        fullName: data.fullName.trim(),
        targetRole: data.targetRole,
        experienceLevel: data.experienceLevel,
        careerGoal: data.careerGoal,
      });
      toast.success('Account created!', { description: 'Welcome to TheGauge.' });
      router.push('/');
    } catch (error) {
      setError('root', { message: getAuthErrorMessage(error) ?? 'Sign-up was cancelled.' });
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <h2 className="text-foreground mb-1 text-xl font-bold">Create your account</h2>
        <p className="text-muted-foreground text-sm">Free to start, no credit card required</p>
      </div>

      <GoogleButton
        label="Sign up with Google"
        pending={pendingAction === 'google'}
        disabled={isBusy}
        onClick={handleGoogleSignUp}
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

      <FormField id="signup-name" label="Full name" error={errors.fullName?.message}>
        <input
          type="text"
          autoComplete="name"
          placeholder="Jordan Kim"
          className={inputClassName(Boolean(errors.fullName))}
          {...fieldAria('signup-name', errors.fullName?.message)}
          {...register('fullName', {
            required: 'Full name is required',
            validate: (value) => value.trim().length > 1 || 'Enter your full name',
          })}
        />
      </FormField>

      <FormField id="signup-email" label="Work or personal email" error={errors.email?.message}>
        <input
          type="email"
          autoComplete="email"
          placeholder="jordan@company.com"
          className={inputClassName(Boolean(errors.email))}
          {...fieldAria('signup-email', errors.email?.message)}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address' },
          })}
        />
      </FormField>

      <FormField
        id="signup-password"
        label="Password"
        hint="At least 8 characters, with one uppercase letter and one number"
        error={errors.password?.message}
      >
        <PasswordInput
          autoComplete="new-password"
          placeholder="Create a strong password"
          className={inputClassName(Boolean(errors.password))}
          {...fieldAria('signup-password', errors.password?.message, true)}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters' },
            validate: {
              uppercase: (value) => /[A-Z]/.test(value) || 'Add at least one uppercase letter',
              number: (value) => /[0-9]/.test(value) || 'Add at least one number',
            },
          })}
        />
        {password && (
          <div className="mt-2 flex items-center gap-2" aria-live="polite">
            <div className="flex flex-1 gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={`password-strength-${level}`}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    level <= strengthScore ? strength.barColor : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            {strength.label && (
              <span className={`text-xs font-medium ${strength.textColor}`}>{strength.label}</span>
            )}
          </div>
        )}
      </FormField>

      <SelectField
        id="signup-role"
        label="Target role"
        placeholder="Select your target role"
        options={TARGET_ROLE_OPTIONS}
        error={errors.targetRole?.message}
        registration={register('targetRole', { required: 'Select your target role' })}
      />

      <SelectField
        id="signup-experience"
        label="Experience level"
        placeholder="Select experience level"
        options={EXPERIENCE_OPTIONS}
        error={errors.experienceLevel?.message}
        registration={register('experienceLevel', { required: 'Select your experience level' })}
      />

      <SelectField
        id="signup-goal"
        label="Primary goal"
        placeholder="What is your main goal?"
        options={GOAL_OPTIONS}
        error={errors.careerGoal?.message}
        registration={register('careerGoal', { required: 'Select your primary goal' })}
      />

      <div>
        <div className="flex items-start gap-2.5">
          <input
            id="agreeToTerms"
            type="checkbox"
            aria-invalid={errors.agreeToTerms ? true : undefined}
            aria-describedby={errors.agreeToTerms ? 'agreeToTerms-error' : undefined}
            className="border-border bg-input accent-primary mt-0.5 h-4 w-4 shrink-0 rounded"
            {...register('agreeToTerms', { required: 'You must agree to the terms to continue' })}
          />
          <label
            htmlFor="agreeToTerms"
            className="text-muted-foreground hover:text-secondary-foreground text-xs leading-relaxed transition-colors duration-150 select-none"
          >
            I agree to the <span className="text-foreground font-medium">Terms of Service</span> and{' '}
            <span className="text-foreground font-medium">Privacy Policy</span>
          </label>
        </div>
        {errors.agreeToTerms && (
          <p id="agreeToTerms-error" role="alert" className="text-danger mt-1.5 text-xs">
            {errors.agreeToTerms.message}
          </p>
        )}
      </div>

      <button type="submit" disabled={isBusy} className="btn-primary w-full py-3">
        {pendingAction === 'email' ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden />
            Creating your account
          </>
        ) : (
          'Create Free Account'
        )}
      </button>

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary-light hover:text-primary font-medium underline-offset-4 transition-colors duration-150 hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
