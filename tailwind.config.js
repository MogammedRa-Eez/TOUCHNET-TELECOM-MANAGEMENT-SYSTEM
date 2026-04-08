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
          green:        '#10b981',
          'green-bright':'#34d399',
          'green-dim':  '#059669',
          'green-soft': '#6ee7b7',
          purple:       '#a855f7',
          'purple-soft':'#d8b4fe',
          'purple-dim': '#7c3aed',
          red:          '#dc2626',
          'red-soft':   '#fca5a5',
          'red-dim':    '#b91c1c',
          pink:         '#e879f9',
        },
        /* keep legacy names so existing components don't break */
        cyan:   { DEFAULT: '#10b981', soft: '#6ee7b7', dim: '#059669' },
        teal:   { DEFAULT: '#059669', light: '#10b981' },
        lilac:  { DEFAULT: '#a855f7', soft: '#d8b4fe', dim: '#7c3aed' },
        violet: { DEFAULT: '#7c3aed', light: '#a855f7' },
        neon:   { DEFAULT: '#10b981', bright: '#34d399', soft: '#6ee7b7', dim: '#059669' },
      },
      boxShadow: {
        'green-sm':    '0 2px 12px rgba(16,185,129,0.18)',
        'green-md':    '0 4px 24px rgba(16,185,129,0.25)',
        'green-lg':    '0 8px 40px rgba(16,185,129,0.32)',
        'green-glow':  '0 0 28px rgba(16,185,129,0.65)',
        'green-glow-sm':'0 0 14px rgba(16,185,129,0.5)',
        'purple-sm':   '0 2px 12px rgba(168,85,247,0.15)',
        'purple-md':   '0 4px 24px rgba(168,85,247,0.22)',
        'purple-lg':   '0 8px 40px rgba(168,85,247,0.28)',
        'purple-glow': '0 0 24px rgba(168,85,247,0.6)',
        'red-sm':      '0 2px 12px rgba(220,38,38,0.15)',
        'red-glow':    '0 0 24px rgba(220,38,38,0.55)',
        'pink-glow':   '0 0 24px rgba(232,121,249,0.55)',
        /* legacy aliases now point to green */
        'blue-sm':     '0 2px 12px rgba(16,185,129,0.18)',
        'blue-md':     '0 4px 24px rgba(16,185,129,0.25)',
        'blue-lg':     '0 8px 40px rgba(16,185,129,0.32)',
        'blue-glow':   '0 0 28px rgba(16,185,129,0.6)',
        'lilac-sm':    '0 2px 12px rgba(168,85,247,0.15)',
        'lilac-md':    '0 4px 24px rgba(168,85,247,0.22)',
        'lilac-lg':    '0 8px 40px rgba(168,85,247,0.28)',
        'lilac-glow':  '0 0 24px rgba(168,85,247,0.6)',
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
          '0%, 100%': { boxShadow: '0 0 10px rgba(168,85,247,0.5), 0 0 20px rgba(168,85,247,0.2)' },
          '50%':      { boxShadow: '0 0 24px rgba(168,85,247,0.9), 0 0 48px rgba(168,85,247,0.4)' },
        },
        'glow-pulse-red': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(220,38,38,0.5)' },
          '50%':      { boxShadow: '0 0 24px rgba(220,38,38,0.9)' },
        },
        'glow-pulse-pink': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(232,121,249,0.5)' },
          '50%':      { boxShadow: '0 0 24px rgba(232,121,249,0.9)' },
        },
        'glow-pulse-green': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(16,185,129,0.5), 0 0 20px rgba(16,185,129,0.2)' },
          '50%':      { boxShadow: '0 0 24px rgba(16,185,129,0.9), 0 0 48px rgba(16,185,129,0.4)' },
        },
      },
      animation: {
        'accordion-down':   'accordion-down 0.2s ease-out',
        'accordion-up':     'accordion-up 0.2s ease-out',
        'glow-pulse':       'glow-pulse 2.5s ease-in-out infinite',
        'glow-pulse-red':   'glow-pulse-red 2.5s ease-in-out infinite',
        'glow-pulse-pink':  'glow-pulse-pink 2.5s ease-in-out infinite',
        'glow-pulse-green': 'glow-pulse-green 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  safelist: [
    'bg-lilac', 'text-lilac', 'border-lilac',
    'bg-violet', 'text-violet', 'border-violet',
    'bg-brand-purple', 'text-brand-purple',
    'bg-brand-red', 'text-brand-red',
    'bg-brand-pink', 'text-brand-pink',
    'bg-brand-green', 'text-brand-green', 'border-brand-green',
    'bg-neon', 'text-neon', 'border-neon',
    'shadow-green-glow', 'shadow-green-md', 'shadow-green-sm',
  ],
};