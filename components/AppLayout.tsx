// components/AppLayout.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../app/hooks/useAuth';
import AuthGuard from './AuthGuard';
import { LayoutDashboard, Mic, BarChart3, LogOut, Menu, X, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

const navigation = [
  { id: 'nav-dashboard', label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { id: 'nav-roles', label: 'Browse Roles', href: '/roles', icon: Briefcase },
  {
    id: 'nav-interview',
    label: 'Practice Interview',
    href: '/interview-session-screen',
    icon: Mic,
  },
  {
    id: 'nav-reports',
    label: 'Feedback Reports',
    href: '/ai-feedback-report-screen',
    icon: BarChart3,
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  // Get initials from user's display name or email
  const getInitials = () => {
    if (!user) return '?';
    if (user.displayName) {
      const names = user.displayName.split(' ');
      if (names.length >= 2) {
        return names[0][0] + names[1][0];
      }
      return names[0][0] || '?';
    }
    return user.email?.[0]?.toUpperCase() || '?';
  };

  return (
    <AuthGuard>
      <div className="bg-background min-h-screen">
        {/* Sidebar */}
        <aside
          className={`bg-card border-border fixed inset-y-0 left-0 z-50 w-64 transform border-r transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo */}
          <div className="border-border flex items-center justify-between border-b px-6 py-5">
            <Link
              href="/"
              aria-label="TheGauge dashboard"
              className="flex items-center gap-2.5 rounded-xl transition-opacity duration-150 hover:opacity-80"
            >
              <div className="from-primary to-accent flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br">
                <span className="text-sm font-bold text-white">G</span>
              </div>
              <span className="text-foreground text-lg font-bold">TheGauge</span>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation"
              className="btn-icon lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-primary/10 text-primary hover:bg-primary/15'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted hover:translate-x-0.5'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-border absolute right-0 bottom-0 left-0 border-t p-4">
            <div className="hover:bg-muted group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150">
              <div className="from-primary to-accent flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white">
                {getInitials()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm font-medium">
                  {user?.displayName || user?.email || 'User'}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {user?.email || 'No email'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sign out"
                title="Sign out"
                className="btn-icon hover:bg-danger/10 hover:text-danger focus-visible:opacity-100 lg:opacity-60 lg:group-hover:opacity-100"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top bar */}
          <header className="bg-background/80 border-border sticky top-0 z-30 border-b backdrop-blur-lg">
            <div className="flex items-center justify-between px-6 py-3 lg:px-8 xl:px-10 2xl:px-16">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
                aria-expanded={sidebarOpen}
                className="btn-icon p-2 lg:hidden"
              >
                <Menu size={20} />
              </button>

              <div className="flex-1" />

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="from-primary to-accent flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-bold text-white">
                    {getInitials()}
                  </div>
                  <span className="text-foreground hidden text-sm font-medium sm:block">
                    {user?.displayName?.split(' ')[0] || 'User'}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main>{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
