/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#FF7521',
          600: '#ea6c1a',
          700: '#c2570e',
          800: '#9a450f',
          900: '#7c3810',
        },
        surface: {
          page: '#f7f8fa',
          card: '#ffffff',
          muted: '#f4f5f7',
          soft: '#f8fafc',
        },
        ink: {
          950: '#0f172a',
          900: '#111827',
          700: '#374151',
          500: '#6b7280',
          300: '#d1d5db',
        },
        success: {
          50: '#ecfdf3',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        danger: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      borderRadius: {
        panel: '14px',
        control: '10px',
      },
      boxShadow: {
        panel: '0 10px 30px rgba(15, 23, 42, 0.06)',
        soft: '0 6px 18px rgba(15, 23, 42, 0.05)',
        focus: '0 0 0 4px rgba(255, 117, 33, 0.12)',
      },
    },
  },
  plugins: [],
}

