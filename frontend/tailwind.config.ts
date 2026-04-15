import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      colors: {
        brand: {
          DEFAULT: '#8b5cf6',
          light: '#a78bfa',
          dim: '#7c3aed',
          muted: 'rgba(139,92,246,0.14)',
          glow: 'rgba(139,92,246,0.3)',
        },
        surface: {
          DEFAULT: '#07070f',
          raised: '#0d0d1e',
          overlay: '#131326',
          border: 'rgba(255,255,255,0.08)',
          hover: 'rgba(255,255,255,0.05)',
          card: 'rgba(255,255,255,0.03)',
        },
        ink: {
          DEFAULT: '#f0eeff',
          muted: '#9998bb',
          faint: '#4e4d6a',
        },
      },
      borderRadius: {
        DEFAULT: '10px',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        'gradient-surface': 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 100%)',
      },
      boxShadow: {
        'glow-brand': '0 0 24px rgba(139,92,246,0.35)',
        'glow-sm': '0 0 12px rgba(139,92,246,0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-10px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(139,92,246,0.2)' },
          '50%': { boxShadow: '0 0 24px rgba(139,92,246,0.4)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'progress-indeterminate': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(400%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.25s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config
