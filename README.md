# 🦎 Glint Archive

파충류 모프 데이터베이스 & 프리미엄 분양 쇼룸 플랫폼

## 기술 스택

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (custom dark theme)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (GitHub 자동 배포)

## 주요 기능

- **아카이브 대시보드**: 종별 탭 + 모프 필터 + 카드 그리드
- **이상형 월드컵**: 종별 토너먼트 브라켓 (최대 16강)

## 로컬 실행

```bash
npm install
# .env.local에 Supabase 키 설정
npm run dev
```

## 환경 변수

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
