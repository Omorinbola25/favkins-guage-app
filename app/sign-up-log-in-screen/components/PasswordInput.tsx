'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type PasswordInputProps = Omit<React.ComponentProps<'input'>, 'type'>;

export default function PasswordInput({ className, ...inputProps }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...inputProps}
        type={isVisible ? 'text' : 'password'}
        className={`${className ?? ''} pr-11`}
      />
      <button
        type="button"
        onClick={() => setIsVisible((visible) => !visible)}
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        aria-pressed={isVisible}
        className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-1.5 transition-all duration-150 active:scale-90"
      >
        {isVisible ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
      </button>
    </div>
  );
}
