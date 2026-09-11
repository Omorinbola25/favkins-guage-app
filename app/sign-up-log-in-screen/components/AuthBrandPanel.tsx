import React from 'react';
import { Mic, TrendingUp, Shield, Zap } from 'lucide-react';

const stats = [
  { id: 'stat-sessions', value: '48,200+', label: 'Mock sessions completed' },
  { id: 'stat-improvement', value: '+31%', label: 'Avg score improvement' },
  { id: 'stat-users', value: '12,400', label: 'Job seekers practicing' },
];

const features = [
  { id: 'feat-voice', icon: Mic, text: 'Voice-powered answer analysis' },
  { id: 'feat-ai', icon: Zap, text: 'Instant AI feedback on every answer' },
  { id: 'feat-score', icon: TrendingUp, text: 'Track confidence & clarity over time' },
  { id: 'feat-secure', icon: Shield, text: 'Private: your data stays yours' },
];

export default function AuthBrandPanel() {
  return (
    <div className="bg-gradient-brand relative hidden flex-col justify-between overflow-hidden p-12 lg:flex lg:w-[45%] xl:w-[48%]">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 h-full w-full">
        <div className="blob-violet absolute top-1/4 left-1/4 h-72 w-72 opacity-50" />
        <div className="blob-cyan absolute right-1/4 bottom-1/3 h-48 w-48 opacity-30" />
        <div className="blob-violet absolute top-1/2 right-1/3 h-32 w-32 opacity-20" />
      </div>
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative z-10">
        {/* Logo */}
        <div className="mb-16 flex items-center gap-3">
          <div className="from-primary to-accent glow-primary flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br">
            <span className="text-base font-bold text-white">G</span>
          </div>
          <span className="text-foreground text-xl font-bold">TheGauge</span>
        </div>

        {/* Headline */}
        <div className="mb-12">
          <h1 className="text-foreground mb-4 text-3xl leading-tight font-bold xl:text-4xl">
            Stop failing interviews.
            <br />
            <span className="text-gradient-primary">Start acing them.</span>
          </h1>
          <p className="text-secondary-foreground max-w-sm text-base leading-relaxed">
            The 2025 job market is brutal. Practice by voice, get AI feedback in seconds, and walk
            into every interview confident.
          </p>
        </div>

        {/* Features */}
        <div className="mb-12 space-y-3">
          {features?.map((f) => {
            const Icon = f?.icon;
            return (
              <div key={f?.id} className="flex items-center gap-3">
                <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg">
                  <Icon size={15} className="text-primary-light" />
                </div>
                <span className="text-secondary-foreground text-sm">{f?.text}</span>
              </div>
            );
          })}
        </div>
      </div>
      {/* Stats */}
      <div className="relative z-10">
        <div className="card-glass grid grid-cols-3 gap-4 p-5">
          {stats?.map((s) => (
            <div key={s?.id} className="text-center">
              <p className="font-mono-data text-gradient-primary text-xl font-bold">{s?.value}</p>
              <p className="text-muted-foreground mt-1 text-xs leading-tight">{s?.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
