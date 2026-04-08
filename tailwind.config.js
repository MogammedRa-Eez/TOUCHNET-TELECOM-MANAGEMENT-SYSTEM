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
          blue:       '#2563eb',
          'blue-soft':'#93c5fd',
          'blue-dim': '#1d4ed8',
          red:        '#dc2626',
          'red-soft': '#fca5a5',
          'red-dim':  '#b91c1c',
        },
        /* keep legacy names so existing components don't break */
        cyan:   { DEFAULT: '#2563eb', soft: '#93c5fd', dim: '#1d4ed8' },
        teal:   { DEFAULT: '#1d4ed8', light: '#60a5fa' },
        lilac:  { DEFAULT: '#2563eb', soft: '#93c5fd', dim: '#1d4ed8' },
        violet: { DEFAULT: '#1d4ed8', light: '#3b82f6' },
      },
      boxShadow: {
        'blue-sm':   '0 2px 12px rgba(37,99,235,0.1)',
        'blue-md':   '0 4px 24px rgba(37,99,235,0.16)',
        'blue-lg':   '0 8px 40px rgba(37,99,235,0.2)',
        'blue-glow': '0 0 20px rgba(37,99,235,0.45)',
        'red-sm':    '0 2px 12px rgba(220,38,38,0.1)',
        'red-glow':  '0 0 20px rgba(220,38,38,0.45)',
        /* legacy aliases */
        'lilac-sm':  '0 2px 12px rgba(37,99,235,0.1)',
        'lilac-md':  '0 4px 24px rgba(37,99,235,0.16)',
        'lilac-lg':  '0 8px 40px rgba(37,99,235,0.2)',
        'lilac-glow':'0 0 20px rgba(37,99,235,0.45)',
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
          '0%, 100%': { boxShadow: '0 0 8px rgba(37,99,235,0.4)' },
          '50%':      { boxShadow: '0 0 20px rgba(37,99,235,0.8)' },
        },
        'glow-pulse-red': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(220,38,38,0.4)' },
          '50%':      { boxShadow: '0 0 20px rgba(220,38,38,0.8)' },
        },
      },
      animation: {
        'accordion-down':  'accordion-down 0.2s ease-out',
        'accordion-up':    'accordion-up 0.2s ease-out',
        'glow-pulse':      'glow-pulse 2.5s ease-in-out infinite',
        'glow-pulse-red':  'glow-pulse-red 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  safelist: [
    'bg-lilac', 'text-lilac', 'border-lilac',
    'bg-violet', 'text-violet', 'border-violet',
    'bg-brand-blue', 'text-brand-blue',
    'bg-brand-red', 'text-brand-red',
  ],
};