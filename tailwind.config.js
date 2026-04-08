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
        /* ── Brand palette for inline use ── */
        cyan:  { DEFAULT: '#0ea5e9', soft: '#7dd3fc', dim: '#0284c7', glow: 'rgba(14,165,233,0.35)' },
        teal:  { DEFAULT: '#06b6d4', light: '#67e8f9' },
        /* keep legacy names so existing components don't break */
        lilac:  { DEFAULT: '#0ea5e9', soft: '#7dd3fc', dim: '#0284c7' },
        violet: { DEFAULT: '#0284c7', light: '#38bdf8' },
      },
      boxShadow: {
        'lilac-sm': '0 2px 12px rgba(139,92,246,0.12)',
        'lilac-md': '0 4px 24px rgba(139,92,246,0.18)',
        'lilac-lg': '0 8px 40px rgba(139,92,246,0.22)',
        'lilac-glow': '0 0 20px rgba(155,143,239,0.5)',
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
          '0%, 100%': { boxShadow: '0 0 8px rgba(155,143,239,0.4)' },
          '50%':      { boxShadow: '0 0 20px rgba(155,143,239,0.8)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'glow-pulse':     'glow-pulse 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  safelist: [
    'bg-lilac', 'text-lilac', 'border-lilac',
    'bg-violet', 'text-violet', 'border-violet',
  ],
};