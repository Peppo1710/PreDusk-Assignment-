'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileStack, Eye, EyeOff, Zap, Shield, BarChart3 } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const FEATURES = [
  { icon: Zap,       text: 'Real-time processing with live SSE progress' },
  { icon: Shield,    text: 'Secure JWT-based authentication' },
  { icon: BarChart3, text: 'Structured extraction with confidence scores' },
];

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await authApi.login(form);
      setAuth(data.user, data.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* ── Left decorative panel ───────────────────── */}
      <div className="hidden lg:flex flex-col w-[46%] min-h-screen relative overflow-hidden bg-surface-raised border-r border-surface-border">
        {/* Background layers */}
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand/10 via-transparent to-transparent" />
        <div className="absolute top-1/3 -left-16 w-72 h-72 bg-brand/20 rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-48 h-48 bg-brand-dim/15 rounded-full filter blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full p-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-light to-brand flex items-center justify-center shadow-glow-sm">
              <FileStack className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-ink">DocFlow</span>
          </div>

          {/* Hero text */}
          <div>
            <h2 className="text-4xl font-bold text-ink leading-tight mb-4">
              Process documents
              <br />
              <span className="gradient-text">intelligently.</span>
            </h2>
            <p className="text-ink-muted text-base leading-relaxed mb-10 max-w-xs">
              Upload any document format and get structured, AI-extracted data in seconds.
            </p>

            <div className="space-y-4">
              {FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-brand/15 border border-brand/25 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-brand-light" />
                  </div>
                  <span className="text-sm text-ink-muted">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom quote */}
          <p className="text-xs text-ink-faint">
            Async document processing platform — v0.1.0
          </p>
        </div>
      </div>

      {/* ── Right form panel ────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-light to-brand flex items-center justify-center shadow-glow-sm">
              <FileStack className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-ink">DocFlow</span>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-bold text-ink">Welcome back</h1>
            <p className="text-sm text-ink-muted mt-1">Sign in to your account to continue</p>
          </div>

          {/* Card */}
          <div className="bg-surface-raised border border-surface-border rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">⚠</span>
                {error}
              </div>
            )}
            <form onSubmit={submit} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-ink-muted tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    className="w-full bg-surface-overlay border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint pr-10 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 hover:border-[rgba(255,255,255,0.12)] transition-all duration-200 shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-muted transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
                Sign in
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-ink-muted mt-5">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-brand-light hover:text-brand font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
