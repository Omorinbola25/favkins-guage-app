import React from 'react';

interface StatusBadgeProps {
  variant: 'good' | 'excellent' | 'fair' | 'poor' | 'info';
  label: string;
}

const variantStyles: Record<string, string> = {
  good: 'bg-primary/10 text-primary-light border-primary/20',
  excellent: 'bg-success/10 text-success border-success/20',
  fair: 'bg-warning/10 text-warning border-warning/20',
  poor: 'bg-danger/10 text-danger border-danger/20',
  info: 'bg-accent/10 text-accent border-accent/20',
};

export default function StatusBadge({ variant, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant] || variantStyles.info}`}
    >
      {label}
    </span>
  );
}
