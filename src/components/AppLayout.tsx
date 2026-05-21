'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Topbar from './Topbar';
import Sidebar from './ui/Sidebar';
import { useAuth } from '@/contexts/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
  role: 'staff' | 'admin' | 'customer';
  currentPath?: string;
}

export default function AppLayout({ children, role, currentPath }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sidebar.collapsed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sidebar.collapsed', collapsed ? 'true' : 'false');
    } catch {}
  }, [collapsed]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/sign-up-login-screen');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Topbar role={role} onMenuToggle={() => setSidebarOpen(true)} />
      <div className="flex pt-0 md:pt-0">
        <Sidebar
          role={role}
          currentPath={currentPath || pathname}
          open={sidebarOpen}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 min-h-screen py-6 px-4 lg:px-8 xl:px-10 2xl:px-16">
          {children}
        </main>
      </div>
    </div>
  );
}