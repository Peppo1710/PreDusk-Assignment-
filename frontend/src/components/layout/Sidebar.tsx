'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Upload, LogOut, FileStack, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

const nav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/upload', icon: Upload, label: 'Upload' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <aside className="fixed left-0 top-0 h-full w-56 flex flex-col z-40 border-r border-surface-border bg-surface-raised shadow-[4px_0_24px_rgba(0,0,0,0.3)]">
      {/* Subtle top gradient accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />

      {/* Logo */}
      <div className="p-5 border-b border-surface-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-light to-brand flex items-center justify-center shadow-glow-sm flex-shrink-0">
            <FileStack className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-semibold text-ink text-sm tracking-tight">DocFlow</span>
            <p className="text-[10px] text-ink-faint leading-tight">Document AI</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        <p className="px-3 py-1.5 text-[10px] font-semibold text-ink-faint uppercase tracking-widest mb-1">
          Navigation
        </p>
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150 relative group',
                active
                  ? 'bg-brand/10 text-brand-light border border-brand/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                  : 'text-ink-muted hover:text-ink hover:bg-surface-hover border border-transparent'
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-brand-light" />
              )}
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-surface-border">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-light to-brand flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold shadow-glow-sm">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-ink truncate">{user?.username || 'User'}</p>
            <p className="text-[10px] text-ink-faint truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-1 flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-ink-muted hover:text-red-400 hover:bg-red-400/5 transition-all duration-150 border border-transparent hover:border-red-400/10"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
