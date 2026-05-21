'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { Eye, EyeOff, Copy, ChevronRight, Loader2, CheckCircle2, Hammer, Layers, Zap, AlertTriangle, Moon, SunMedium } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

type Role = 'staff' | 'admin' | 'customer';

type LoginForm = {
  email: string;
  password: string;
  remember: boolean;
};

type ForgotForm = {
  email: string;
};

type ResetForm = {
  email: string;
  otp: string;
  password: string;
  confirmPassword: string;
};

const demoCredentials: Record<Role, { email: string; password: string; hint: string }> = {
  staff: {
    email: 'marcos.reyes@mvcawood.com',
    password: 'Staff@2026',
    hint: 'Workshop Worker — access task timer & QA tools',
  },
  admin: {
    email: 'sunita.kapoor@mvcawood.com',
    password: 'Admin@2026',
    hint: 'Supervisor — access production dashboard & rework queue',
  },
  customer: {
    email: 'claire.leblanc@gmail.com',
    password: 'Customer@2026',
    hint: 'Customer — view order status & inspection photos',
  },
};

const roleLabels: Record<Role, string> = {
  staff: 'Staff',
  admin: 'Admin',
  customer: 'Customer',
};

const roleRedirect: Record<string, string> = {
  staff: '/staff-dashboard',
  admin: '/admin-dashboard',
  customer: '/customer-dashboard',
};

const features = [
  { icon: Hammer, label: 'AI-Assisted QA', desc: 'YOLOv8 defect detection on every piece' },
  { icon: Layers, label: 'Live WIP Tracking', desc: 'Real-time workstation visibility' },
  { icon: Zap, label: 'Auto Time Logging', desc: 'Persistent per-task elapsed timers' },
];

export default function LoginPageClient() {
  const router = useRouter();
  const { signIn } = useAuth();
  const supabase = createClient();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [role, setRole] = useState<Role>('staff');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [step, setStep] = useState<'login' | 'forgot' | 'reset'>('login');
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [copied, setCopied] = useState<'email' | 'password' | null>(null);
  const [forgotEmail, setForgotEmail] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LoginForm>({ defaultValues: { remember: false } });

  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: forgotErrors },
  } = useForm<ForgotForm>();

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    watch: watchReset,
    reset: resetReset,
    formState: { errors: resetErrors },
  } = useForm<ResetForm>();

  const creds = demoCredentials[role];

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('theme') as 'dark' | 'light' | null;
    const initialTheme = storedTheme === 'light' ? 'light' : 'dark';
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => setResendCooldown((v) => v - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (step !== 'forgot') setOtpSent(false);
  }, [step]);

  const canSubmitReset = useMemo(() => {
    const values = watchReset();
    return values.password && values.confirmPassword && values.password === values.confirmPassword && values.otp?.length === 6;
  }, [watchReset]);

  function showMessage(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4000);
  }

  function autofill() {
    setValue('email', creds.email);
    setValue('password', creds.password);
  }

  function copyField(field: 'email' | 'password') {
    const val = field === 'email' ? creds.email : creds.password;
    navigator.clipboard.writeText(val).catch(() => {});
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
    showMessage('success', `${field === 'email' ? 'Email' : 'Password'} copied`);
  }

  function toggleTheme() {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem('theme', nextTheme);
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
      return nextTheme;
    });
  }

  async function onSubmit(data: LoginForm) {
    setLoading(true);
    try {
      const result = await signIn(data.email, data.password);
      
      if (!result?.user) {
        throw new Error('Login failed');
      }

      showMessage('success', 'Signed in successfully');
      
      // Get the user with all metadata
      const user = result.user;
      
      // Try to get role from user_metadata first (set during signup/profile creation)
      let userRole = user.user_metadata?.role || 'staff';
      
      // Wait for auth state to be persisted to cookies (critical for middleware)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Verify session is actually persisted before redirecting
      const session = await supabase.auth.getSession();
      if (!session?.data?.session?.user) {
        console.warn('Session not persisted after auth, checking token...');
        // If session not in cookies, the user_metadata role should still work
      }
      
      // Try to fetch the full profile from the database asynchronously
      // This won't block the login flow but will update the role if available
      try {
        const { data: profileData, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (!error && profileData?.role) {
          userRole = profileData.role;
        }
      } catch (profileError) {
        console.warn('Could not fetch profile, using metadata role:', profileError);
      }
      
      // Determine redirect path based on role
      const redirectPath = roleRedirect[userRole] || '/staff-dashboard';
      console.log('Redirecting to:', redirectPath, 'with role:', userRole);
      console.log('Auth state:', { user: user.id, role: userRole });
      
      // Use Next.js router for proper redirect and then return to prevent further execution
      router.push(redirectPath);
      return;
    } catch (error: any) {
      setLoading(false);
      console.error('Login error:', error);
      const errorMessage = error?.message || error?.toString() || 'Invalid credentials. Please try again.';
      showMessage('error', errorMessage);
    }
  }

  async function handleForgot(data: ForgotForm) {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback?next=/sign-up-login-screen`,
      });
      setLoading(false);
      if (error) {
        showMessage('error', error.message || 'Unable to send reset email');
        return;
      }
      setForgotEmail(data.email);
      showMessage('success', 'Password reset email sent. Check your inbox.');
      setOtpSent(true);
      setResendCooldown(60);
      setStep('reset');
      resetReset({ email: data.email, otp: '', password: '', confirmPassword: '' });
    } catch (error: any) {
      setLoading(false);
      showMessage('error', 'Unable to send reset email. Please try again.');
    }
  }

  async function handleReset(data: ResetForm) {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password });
      setLoading(false);
      if (error) {
        showMessage('error', error.message || 'Unable to reset password');
        return;
      }
      showMessage('success', 'Password reset successfully. Please sign in.');
      setStep('login');
      reset();
    } catch (error: any) {
      setLoading(false);
      showMessage('error', 'Unable to reset password. Please try again.');
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || !forgotEmail) return;
    setLoading(true);
    try {
      await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
      });
      setLoading(false);
      showMessage('success', 'Reset email resent successfully');
      setResendCooldown(60);
    } catch {
      setLoading(false);
      showMessage('error', 'Unable to resend. Please try again.');
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <button
        type="button"
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-[60] inline-flex items-center gap-2 rounded-full border border-border bg-card/95 px-3 py-2 text-xs font-semibold text-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-muted"
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? <SunMedium size={14} /> : <Moon size={14} />}
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </button>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl animate-fade-in text-sm font-semibold text-white ${toast.type === 'success' ? 'bg-success' : 'bg-danger'}`}
        >
          {toast.type === 'success' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
          {toast.message}
        </div>
      )}

      {/* Left Brand Panel */}
      <div
        className="hidden lg:flex lg:w-[44%] xl:w-[42%] flex-col justify-between p-10 xl:p-14 relative overflow-hidden bg-[#0D0D0D]"
      >
        <div className="absolute top-0 left-0 w-96 h-96 blob-primary opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 blob-primary opacity-20 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <AppLogo size={44} />
            <div>
              <span className="block font-bold text-lg text-white tracking-tight">MVCA WoodWorks</span>
              <span className="block text-xs text-slate-400 tracking-widest uppercase">Production Platform</span>
            </div>
          </div>

          <h1 className="text-hero-xl text-white mb-4 leading-tight">
            Craft Quality.<br />
            <span className="text-accent">Track Every Stage.</span>
          </h1>
          <p className="text-slate-300 text-base leading-relaxed max-w-sm">
            Real-time QA, AI-powered defect detection, and time tracking built for the workshop floor.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {features.map((f) => {
            const FeatureIcon = f.icon;
            return (
              <div key={`feature-${f.label}`} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                  <FeatureIcon size={16} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.label}</p>
                  <p className="text-xs text-slate-400">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Auth Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <AppLogo size={36} />
            <div>
              <span className="block font-bold text-base text-foreground">MVCA WoodWorks</span>
              <span className="block text-xs text-muted-foreground">Production Platform</span>
            </div>
          </div>

          {/* ===== LOGIN STEP ===== */}
          {step === 'login' && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
                <p className="text-sm text-muted-foreground mt-1">Sign in to your workspace account</p>
              </div>

              {/* Role Selector */}
              <div className="flex gap-2 mb-6 p-1 rounded-xl bg-muted">
                {(['staff', 'admin', 'customer'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      role === r ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {roleLabels[r]}
                  </button>
                ))}
              </div>

              {/* Demo Credentials */}
              <div className="mb-6 rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Demo Credentials</p>
                  <button
                    type="button"
                    onClick={autofill}
                    className="text-xs text-accent hover:text-primary font-semibold transition-colors"
                  >
                    Auto-fill ↗
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground font-mono truncate">{creds.email}</span>
                    <button
                      type="button"
                      onClick={() => copyField('email')}
                      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copied === 'email' ? <CheckCircle2 size={13} className="text-success" /> : <Copy size={13} />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground font-mono">{creds.password}</span>
                    <button
                      type="button"
                      onClick={() => copyField('password')}
                      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copied === 'password' ? <CheckCircle2 size={13} className="text-success" /> : <Copy size={13} />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground/70 mt-1">{creds.hint}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email address</label>
                  <input
                    type="email"
                    autoComplete="email"
                    className={`input-dark w-full ${errors.email ? 'border-danger' : ''}`}
                    placeholder="you@mvcawood.com"
                    {...register('email', { required: 'Email is required' })}
                  />
                  {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      autoComplete="current-password"
                      className={`input-dark w-full pr-10 ${errors.password ? 'border-danger' : ''}`}
                      placeholder="••••••••"
                      {...register('password', { required: 'Password is required' })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" {...register('remember')} />
                    <span className="text-sm text-muted-foreground">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep('forgot')}
                    className="text-sm text-accent hover:text-primary transition-colors font-medium"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            </>
          )}

          {/* ===== FORGOT PASSWORD STEP ===== */}
          {step === 'forgot' && (
            <>
              <div className="mb-8">
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1 transition-colors"
                >
                  ← Back to sign in
                </button>
                <h2 className="text-2xl font-bold text-foreground">Reset password</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your email and we will send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmitForgot(handleForgot)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email address</label>
                  <input
                    type="email"
                    className={`input-dark w-full ${forgotErrors.email ? 'border-danger' : ''}`}
                    placeholder="you@mvcawood.com"
                    {...registerForgot('email', { required: 'Email is required' })}
                  />
                  {forgotErrors.email && <p className="text-xs text-danger mt-1">{forgotErrors.email.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>

              {otpSent && (
                <div className="mt-4 rounded-xl border border-success/30 bg-success/10 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={15} className="text-success" />
                    <p className="text-sm font-semibold text-success">Reset link sent!</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Check your email inbox for the password reset link.</p>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    className="mt-2 text-xs text-accent hover:text-primary font-medium disabled:opacity-50 transition-colors"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend link'}
                  </button>
                </div>
              )}
            </>
          )}

          {/* ===== RESET PASSWORD STEP ===== */}
          {step === 'reset' && (
            <>
              <div className="mb-8">
                <button
                  type="button"
                  onClick={() => setStep('forgot')}
                  className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1 transition-colors"
                >
                  ← Back
                </button>
                <h2 className="text-2xl font-bold text-foreground">New password</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your new password below.
                </p>
              </div>

              <form onSubmit={handleSubmitReset(handleReset)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">New password</label>
                  <input
                    type="password"
                    className={`input-dark w-full ${resetErrors.password ? 'border-danger' : ''}`}
                    placeholder="Min. 8 characters"
                    {...registerReset('password', {
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Minimum 8 characters' },
                    })}
                  />
                  {resetErrors.password && <p className="text-xs text-danger mt-1">{resetErrors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Confirm password</label>
                  <input
                    type="password"
                    className={`input-dark w-full ${resetErrors.confirmPassword ? 'border-danger' : ''}`}
                    placeholder="Repeat password"
                    {...registerReset('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (val) => val === watchReset('password') || 'Passwords do not match',
                    })}
                  />
                  {resetErrors.confirmPassword && (
                    <p className="text-xs text-danger mt-1">{resetErrors.confirmPassword.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !canSubmitReset}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-60"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {loading ? 'Resetting...' : 'Reset password'}
                </button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            MWQATS v2.0 · MVCA WoodWorks Production Platform
          </p>
        </div>
      </div>
    </div>
  );
}