/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 브랜드 골드 (보증서 프리미엄 배지용)
        gold: {
          300: '#fde68a',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // 라이트 테마 - 기본 배경/서피스
        cream: {
          50:  '#fafaf8',
          100: '#f5f5f0',
        },
      },
      fontFamily: {
        // 타이틀/브랜딩용 세리프 (Noto Serif KR)
        serif:   ['"Noto Serif KR"', 'Georgia', 'serif'],
        // 본문/UI용 산세리프 (Pretendard)
        sans:    ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        // display = serif (타이틀)
        display: ['"Noto Serif KR"', 'Georgia', 'serif'],
        body:    ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'card':    '0 1px 4px 0 rgba(15,23,42,0.06), 0 4px 16px -4px rgba(15,23,42,0.08)',
        'card-lg': '0 2px 8px 0 rgba(15,23,42,0.08), 0 12px 40px -8px rgba(15,23,42,0.12)',
        'gold':    '0 0 0 1px rgba(251,191,36,0.6), 0 0 24px 4px rgba(251,191,36,0.15)',
        'teal':    '0 0 0 3px rgba(13,148,136,0.15)',
      },
      backgroundImage: {
        'gold-shimmer': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 30%, #fde68a 50%, #f59e0b 70%, #d97706 100%)',
        'cert-texture': 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(13,148,136,0.015) 2px, rgba(13,148,136,0.015) 4px)',
      },
      animation: {
        'fade-up':   'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards',
        'shimmer':   'shimmer 2.5s linear infinite',
        'pulse-gold':'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:    { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer:   { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
        pulseGold: { '0%,100%': { boxShadow: '0 0 0 0 rgba(251,191,36,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(251,191,36,0)' } },
      },
    },
  },
  plugins: [],
}
