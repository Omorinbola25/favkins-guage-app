import React from 'react';

export function inputClassName(hasError: boolean, extra = ''): string {
  return [
    'bg-input text-foreground placeholder:text-muted-foreground w-full rounded-xl border px-4 py-2.5 text-sm transition-all duration-200',
    'hover:border-primary/40 focus:ring-2 focus:outline-none',
    hasError
      ? 'border-danger focus:ring-danger/40'
      : 'border-border focus:border-primary/60 focus:ring-ring',
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

export function fieldAria(id: string, error?: string, hasHint = false) {
  const describedBy = [hasHint ? `${id}-hint` : '', error ? `${id}-error` : '']
    .filter(Boolean)
    .join(' ');

  return {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy || undefined,
  };
}

interface FormFieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  labelAction?: React.ReactNode;
  children: React.ReactNode;
}

export default function FormField({
  id,
  label,
  hint,
  error,
  labelAction,
  children,
}: FormFieldProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-foreground block text-sm font-medium">
          {label}
        </label>
        {labelAction}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="text-muted-foreground mb-1.5 text-xs">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-danger mt-1.5 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
