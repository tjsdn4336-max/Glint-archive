import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:  ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', '"Apple SD Gothic Neo"', 'system-ui', 'sans-serif'],
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        mono:  ['"SF Mono"', '"Fira Code"', 'monospace'],
      },
      colors: {
        // GA 디자인 토큰
        ga: {
          bg:     '#F7F7F5',
          white:  '#FFFFFF',
          black:  '#111111',
          border: '#E8E8E4',
          muted:  '#9A9A94',
          faint:  '#C8C8C4',
          red:    '#D94035',
          blue:   '#1A56DB',
          green:  '#1A7F4B',
        },
        // 기존 zinc 유지 (ShopMap 등에서 사용)
        zinc: {
          50:  '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#09090B',
        },
        accent: '#111111',
      },
      borderRadius: {
        sm:    '4px',
        DEFAULT:'6px',
        lg:    '8px',
        xl:    '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(0,0,0,0.04)',
        sm: '0 1px 3px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.03)',
        md: '0 4px 12px rgba(0,0,0,0.06), 0 10px 28px rgba(0,0,0,0.04)',
        lg: '0 8px 24px rgba(0,0,0,0.07), 0 24px 56px rgba(0,0,0,0.05)',
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter:  '-0.03em',
        tight:    '-0.02em',
        snug:     '-0.015em',
        normal:   '-0.011em',
        wide:     '0.02em',
        wider:    '0.08em',
        widest:   '0.16em',
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '1.4' }],
        xs:    ['12px', { lineHeight: '1.5' }],
        sm:    ['13px', { lineHeight: '1.6' }],
        base:  ['15px', { lineHeight: '1.65' }],
        lg:    ['17px', { lineHeight: '1.55' }],
        xl:    ['20px', { lineHeight: '1.4' }],
        '2xl': ['24px', { lineHeight: '1.3' }],
        '3xl': ['30px', { lineHeight: '1.2' }],
        '4xl': ['38px', { lineHeight: '1.1' }],
      },
    },
  },
  plugins: [],
};

export default config;
