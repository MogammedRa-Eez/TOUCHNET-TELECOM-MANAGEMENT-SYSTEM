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
        /* ── Brand palette ── */
        brand: {
          purple:        '#8b5cf6',
          'purple-soft': '#c4b5fd',
          'purple-dim':  '#7c3aed',
          blue:          '#3b82f6',
          'blue-soft':   '#93c5fd',
          'blue-dim':    '#2563eb',
          red:           '#ef4444',
          'red-soft':    '#fca5a5',
          'red-dim':     '#dc2626',
          cyan:          '#06b6d4',
          pink:          '#ec4899',
        },
        /* keep legacy names so existing components don't break */
        cyan:   { DEFAULT: '#06b6d4', soft: '#67e8f9', dim: '#0891b2' },
        teal:   { DEFAULT: '#14b8a6', light: '#5eead4' },
        lilac:  { DEFAULT: '#8b5cf6', soft: '#c4b5fd', dim: '#7c3aed' },
        violet: { DEFAULT: '#7c3aed', light: '#a78bfa' },
      },
      boxShadow: {
        'purple-sm':   '0 2px 12px rgba(139,92,246,0.15)',
        'purple-md':   '0 4px 24px rgba(139,92,246,0.22)',
        'purple-lg':   '0 8px 40px rgba(139,92,246,0.28)',
        'purple-glow': '0 0 24px rgba(139,92,246,0.55)',
        'blue-sm':     '0 2px 12px rgba(59,130,246,0.15)',
        'blue-md':     '0 4px 24px rgba(59,130,246,0.22)',
        'blue-lg':     '0 8px 40px rgba(59,130,246,0.28)',
        'blue-glow':   '0 0 24px rgba(59,130,246,0.55)',
        'red-sm':      '0 2px 12px rgba(239,68,68,0.15)',
        'red-glow':    '0 0 24px rgba(239,68,68,0.55)',
        /* legacy aliases */
        'lilac-sm':    '0 2px 12px rgba(139,92,246,0.15)',
        'lilac-md':    '0 4px 24px rgba(139,92,246,0.22)',
        'lilac-lg':    '0 8px 40px rgba(139,92,246,0.28)',
        'lilac-glow':  '0 0 24px rgba(139,92,246,0.55)',
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
          '0%, 100%': { boxShadow: '0 0 8px rgba(59,130,246,0.5)' },
          '50%':      { boxShadow: '0 0 28px rgba(59,130,246,0.95), 0 0 50px rgba(59,130,246,0.4)' },
        },
        'network-flow': {
          '0%':   { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '52px 52px' },
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
    'bg-lilac', 'text-lilac', 'border-lilac',
    'bg-violet', 'text-violet', 'border-violet',
    'bg-brand-purple', 'text-brand-purple',
    'bg-brand-blue', 'text-brand-blue',
    'bg-brand-red', 'text-brand-red',
    'bg-brand-cyan', 'text-brand-cyan',
    'shadow-purple-glow', 'shadow-blue-glow', 'shadow-red-glow',
    'glow-pulse', 'glow-pulse-red', 'glow-pulse-blue',
  ],
};