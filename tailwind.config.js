/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["'Inter'", '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        grotesk: ["'Space Grotesk'", 'sans-serif'],
        mono:    ["'JetBrains Mono'", 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input:  'hsl(var(--input))',
        ring:   'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT:              'hsl(var(--sidebar-background))',
          foreground:           'hsl(var(--sidebar-foreground))',
          primary:              'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent:               'hsl(var(--sidebar-accent))',
          'accent-foreground':  'hsl(var(--sidebar-accent-foreground))',
          border:               'hsl(var(--sidebar-border))',
          ring:                 'hsl(var(--sidebar-ring))',
        },
        /* ── Brand ── */
        brand: {
          violet:        '#8b5cf6',
          'violet-soft': '#c4b5fd',
          'violet-dim':  '#7c3aed',
          indigo:        '#6366f1',
          'indigo-soft': '#a5b4fc',
          cyan:          '#06b6d4',
          'cyan-soft':   '#a5f3fc',
          emerald:       '#10b981',
          'emerald-soft':'#6ee7b7',
          amber:         '#f59e0b',
          'amber-soft':  '#fde68a',
          rose:          '#ef4444',
          'rose-soft':   '#fca5a5',
          pink:          '#ec4899',
          'pink-soft':   '#f9a8d4',
        },
        /* Legacy aliases for backwards compatibility */
        cyan:   { DEFAULT: '#06b6d4', soft: '#a5f3fc', dim: '#0891b2' },
        teal:   { DEFAULT: '#14b8a6', light: '#5eead4' },
        lilac:  { DEFAULT: '#8b5cf6', soft: '#c4b5fd', dim: '#7c3aed' },
        violet: { DEFAULT: '#7c3aed', light: '#a78bfa' },
      },
      boxShadow: {
        /* Violet */
        'violet-sm':   '0 2px 12px rgba(139,92,246,0.18)',
        'violet-md':   '0 4px 24px rgba(139,92,246,0.28)',
        'violet-lg':   '0 8px 48px rgba(139,92,246,0.35)',
        'violet-glow': '0 0 24px rgba(139,92,246,0.6)',
        /* Indigo */
        'indigo-sm':   '0 2px 12px rgba(99,102,241,0.18)',
        'indigo-md':   '0 4px 24px rgba(99,102,241,0.28)',
        'indigo-glow': '0 0 24px rgba(99,102,241,0.6)',
        /* Cyan */
        'cyan-sm':     '0 2px 12px rgba(6,182,212,0.18)',
        'cyan-glow':   '0 0 24px rgba(6,182,212,0.6)',
        /* Emerald */
        'emerald-sm':  '0 2px 12px rgba(16,185,129,0.18)',
        'emerald-glow':'0 0 24px rgba(16,185,129,0.6)',
        /* Rose */
        'rose-sm':     '0 2px 12px rgba(239,68,68,0.18)',
        'rose-glow':   '0 0 24px rgba(239,68,68,0.6)',
        /* Legacy aliases */
        'purple-sm':   '0 2px 12px rgba(139,92,246,0.18)',
        'purple-md':   '0 4px 24px rgba(139,92,246,0.28)',
        'purple-lg':   '0 8px 48px rgba(139,92,246,0.35)',
        'purple-glow': '0 0 24px rgba(139,92,246,0.6)',
        'blue-sm':     '0 2px 12px rgba(99,102,241,0.18)',
        'blue-md':     '0 4px 24px rgba(99,102,241,0.28)',
        'blue-lg':     '0 8px 48px rgba(99,102,241,0.35)',
        'blue-glow':   '0 0 24px rgba(99,102,241,0.6)',
        'red-sm':      '0 2px 12px rgba(239,68,68,0.18)',
        'red-glow':    '0 0 24px rgba(239,68,68,0.6)',
        'lilac-sm':    '0 2px 12px rgba(139,92,246,0.18)',
        'lilac-md':    '0 4px 24px rgba(139,92,246,0.28)',
        'lilac-lg':    '0 8px 48px rgba(139,92,246,0.35)',
        'lilac-glow':  '0 0 24px rgba(139,92,246,0.6)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(139,92,246,0.5)' },
          '50%':      { boxShadow: '0 0 28px rgba(139,92,246,0.95), 0 0 50px rgba(139,92,246,0.4)' },
        },
        'glow-pulse-red': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(239,68,68,0.5)' },
          '50%':      { boxShadow: '0 0 28px rgba(239,68,68,0.95), 0 0 50px rgba(239,68,68,0.4)' },
        },
        'glow-pulse-blue': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(99,102,241,0.5)' },
          '50%':      { boxShadow: '0 0 28px rgba(99,102,241,0.95), 0 0 50px rgba(99,102,241,0.4)' },
        },
        'network-flow': {
          '0%':   { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '56px 56px' },
        },
        'float-particle': {
          '0%':   { transform: 'translateY(0) scale(1)', opacity: '0.6' },
          '100%': { transform: 'translateY(-60px) scale(0)', opacity: '0' },
        },
      },
      animation: {
        'accordion-down':   'accordion-down 0.2s ease-out',
        'accordion-up':     'accordion-up 0.2s ease-out',
        'glow-pulse':       'glow-pulse 2.5s ease-in-out infinite',
        'glow-pulse-red':   'glow-pulse-red 2.5s ease-in-out infinite',
        'glow-pulse-blue':  'glow-pulse-blue 2.5s ease-in-out infinite',
        'network-flow':     'network-flow 4s linear infinite',
        'float-particle':   'float-particle 3s ease-out infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  safelist: [
    // Legacy color classes
    'bg-lilac', 'text-lilac', 'border-lilac',
    'bg-violet', 'text-violet', 'border-violet',
    // Brand
    'bg-brand-violet', 'text-brand-violet',
    'bg-brand-indigo', 'text-brand-indigo',
    'bg-brand-cyan',   'text-brand-cyan',
    'bg-brand-emerald','text-brand-emerald',
    'bg-brand-amber',  'text-brand-amber',
    'bg-brand-rose',   'text-brand-rose',
    'bg-brand-pink',   'text-brand-pink',
    // Legacy aliases
    'bg-brand-purple', 'text-brand-purple',
    'bg-brand-blue',   'text-brand-blue',
    'bg-brand-red',    'text-brand-red',
    // Shadow glows
    'shadow-violet-glow', 'shadow-indigo-glow', 'shadow-cyan-glow',
    'shadow-emerald-glow','shadow-rose-glow',
    'shadow-purple-glow', 'shadow-blue-glow',  'shadow-red-glow',
    // Animations
    'glow-pulse', 'glow-pulse-red', 'glow-pulse-blue', 'glow-pulse-green',
  ],
};