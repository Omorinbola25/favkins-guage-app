// app/sign-up-log-in-screen/components/AuthScreen.tsx
'use client';

import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import AuthBrandPanel from './AuthBrandPanel';

export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  return (
    <div className="bg-background flex min-h-screen">
      {/* Left brand panel */}
      <AuthBrandPanel />

      {/* Right form panel */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-8 lg:p-12">
        <div className="relative z-10 w-full max-w-md">
          {/* Logo for mobile */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="from-primary to-accent flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br">
              <span className="text-sm font-bold text-white">G</span>
            </div>
            <span className="text-foreground text-lg font-bold">TheGauge</span>
          </div>

          <div
            role="tablist"
            aria-label="Sign in or create an account"
            className="bg-muted mb-8 flex rounded-xl p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'login'}
              onClick={() => setActiveTab('login')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-card-elevated text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card-elevated/50'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'signup'}
              onClick={() => setActiveTab('signup')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                activeTab === 'signup'
                  ? 'bg-card-elevated text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card-elevated/50'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Forms */}
          <div className="animate-fade-in">
            {activeTab === 'login' ? (
              <LoginForm onSwitchToSignup={() => setActiveTab('signup')} />
            ) : (
              <SignupForm onSwitchToLogin={() => setActiveTab('login')} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
