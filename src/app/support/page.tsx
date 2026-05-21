import React from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { MessageSquare, ShieldCheck } from 'lucide-react';

export default function SupportPage() {
  return (
    <AppLayout role="customer" currentPath="/support">
      <div className="space-y-8">
        <div className="rounded-3xl border border-border bg-card p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Customer Support</p>
              <h1 className="mt-3 text-3xl font-semibold text-foreground">We’re here to help</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Open a support ticket, request order updates, or get help with product questions.
              </p>
            </div>
            <div className="inline-flex items-center rounded-3xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
              <MessageSquare size={20} className="mr-2" /> Live support ready
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
            <div className="flex items-center gap-3 text-primary">
              <ShieldCheck size={20} />
              <span className="text-sm font-semibold">Order protection</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Need help with delivery, customization, or returns? We’ll connect your request with the right team.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
            <div className="flex items-center gap-3 text-foreground">
              <MessageSquare size={20} />
              <span className="text-sm font-semibold">Contact options</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Start with our support portal for quick answers, or go back to the login page when finished.
            </p>
            <Link href="/" className="mt-5 inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted">
              Return to login
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
