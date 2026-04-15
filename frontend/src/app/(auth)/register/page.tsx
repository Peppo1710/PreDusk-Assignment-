'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileStack, Zap, Shield, BarChart3 } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const FEATURES = [
  { icon: Zap,       text: 'Real-time processing with live SSE progress' },
  { icon: Shield,    text: 'Secure JWT-based authentication' },
  { icon: BarChart3, text: 'Structured extraction with confidence scores' },
];

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await authApi.register(form);
      setAuth(data.user, data.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* ── Left decorative panel ───────────────────── */}
      <div className="hidden lg:flex flex-col w-[46%] min-h-screen relative overflow-hidden bg-surface-raised border-r border-surface-border">
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand/10 via-transparent to-transparent" />
        <div className="absolute top-1/3 -left-16 w-72 h-72 bg-brand/20 rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-48 h-48 bg-brand-dim/15 rounded-full filter blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full p-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-light to-brand flex items-center justify-center shadow-glow-sm">
              <FileStack className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-ink">DocFlow</span>
          </div>

          <div>
            <h2 className="text-4xl font-bold text-ink leading-tight mb-4">
              Get started
              <br />
              <span className="gradient-text">in seconds.</span>
            </h2>
            <p className="text-ink-muted text-base leading-relaxed mb-10 max-w-xs">
              Create your free account and start processing documents with AI-powered extraction.
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

          <p className="text-xs text-ink-faint">
            Async document processing platform — v0.1.0
          </p>
        </div>
      </div>

      {/* ── Right form panel ────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="flex lg:hidden items-center gap-2.5 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-light to-brand flex items-center justify-center shadow-glow-sm">
              <FileStack className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-ink">DocFlow</span>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-bold text-ink">Create your account</h1>
            <p className="text-sm text-ink-muted mt-1">Free forever · No credit card required</p>
          </div>

          <div className="bg-surface-raised border border-surface-border rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">⚠</span>
                {error}
              </div>
            )}
            <form onSubmit={submit} className="space-y-4">
              <Input
                label="Username"
                placeholder="johndoe"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                hint="Use 8+ characters for a strong password"
                required
              />
              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
                Create free account
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-ink-muted mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-light hover:text-brand font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
