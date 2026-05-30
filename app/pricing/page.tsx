import Link from 'next/link';
import { Check } from 'lucide-react';

export const metadata = { title: '플랜 안내 | Glint Archive' };

const USER_PLANS = [
  {
    key: 'free',
    name: '무료',
    price: 0,
    desc: '파충류 입문자를 위한 기본 플랜',
    features: [
      '내 파충류 1마리 등록',
      '먹이 기록',
      'AI 모프 감정 월 3회',
      '파충류 사전 무제한 열람',
      '타임딜 찜 기능',
    ],
    cta: '무료로 시작',
    ctaHref: '/auth',
    highlight: false,
  },
  {
    key: 'premium',
    name: '프리미엄',
    price: 4900,
    desc: '진지한 사육자를 위한 올인원 플랜',
    features: [
      '내 파충류 무제한 등록',
      '먹이·탈피·체중·건강 기록 전체',
      '체중 그래프 & 통계',
      'AI 모프 감정 무제한',
      '사육 일지 데이터 내보내기',
    ],
    cta: '프리미엄 시작하기',
    ctaHref: '/auth',
    highlight: true,
  },
];

const SHOP_PLANS = [
  {
    key: 'basic',
    name: '베이직',
    price: 0,
    desc: '샵 등록 및 기본 노출',
    features: [
      '타임딜 월 3건',
      '샵 프로필 페이지',
      '위치 지도 표시',
      '기본 분양 통계',
    ],
    cta: '샵 등록하기',
    ctaHref: '/admin',
    highlight: false,
  },
  {
    key: 'pro',
    name: 'PRO',
    price: 49000,
    desc: '마케팅 자동화 + 고객 관리',
    features: [
      '타임딜 무제한',
      '📷 분양 카드 자동 생성 (인스타·당근용)',
      '재고 관리 시스템',
      '고객 관리 & 알림 메모',
      '월간 매출 분석 리포트',
      '상단 노출 우선권',
      '디지털 패스포트 발급',
      '전화·카카오·DM 연결',
    ],
    cta: 'PRO 시작하기',
    ctaHref: '/admin',
    highlight: true,
  },
];

const CREDITS = [
  { label: 'AI 크레딧 10개', price: 2900, key: 'credits_10' },
  { label: 'AI 크레딧 30개', price: 6900, key: 'credits_30' },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F5]">

      {/* 헤더 */}
      <div className="bg-white border-b border-[#E8E8E4] px-5 py-10 text-center">
        <p className="text-[10px] text-[#9A9A94] tracking-widest uppercase mb-3">Pricing</p>
        <h1 className="font-serif text-3xl font-bold text-[#111] mb-3">플랜 안내</h1>
        <p className="text-sm text-[#9A9A94] max-w-xs mx-auto">
          사육자와 샵 사장님 모두를 위한 합리적인 플랜
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8 space-y-10">

        {/* ── 사육자 플랜 ── */}
        <section>
          <p className="text-[10px] text-[#9A9A94] tracking-widest uppercase mb-4">사육자 플랜</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {USER_PLANS.map(plan => (
              <div key={plan.key}
                className={`rounded-2xl overflow-hidden border ${
                  plan.highlight ? 'border-[#111] bg-[#111]' : 'border-[#E8E8E4] bg-white'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className={`text-[10px] font-semibold tracking-widest uppercase mb-1 ${plan.highlight ? 'text-white/50' : 'text-[#9A9A94]'}`}>
                        {plan.name}
                      </p>
                      <p className={`font-serif text-2xl font-bold ${plan.highlight ? 'text-white' : 'text-[#111]'}`}>
                        {plan.price === 0 ? '무료' : `₩${plan.price.toLocaleString()}`}
                        {plan.price > 0 && <span className={`text-sm font-normal ml-1 ${plan.highlight ? 'text-white/50' : 'text-[#9A9A94]'}`}>/월</span>}
                      </p>
                    </div>
                    {plan.highlight && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white">추천</span>
                    )}
                  </div>
                  <p className={`text-xs mb-5 ${plan.highlight ? 'text-white/60' : 'text-[#9A9A94]'}`}>{plan.desc}</p>
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-white/70' : 'text-[#1A7F4B]'}`} />
                        <span className={`text-sm ${plan.highlight ? 'text-white/80' : 'text-[#111]'}`}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.ctaHref}
                    className={`block w-full text-center py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-80 ${
                      plan.highlight ? 'bg-white text-[#111]' : 'bg-[#111] text-white'
                    }`}>
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── AI 크레딧 ── */}
        <section>
          <p className="text-[10px] text-[#9A9A94] tracking-widest uppercase mb-4">AI 모프 감정 크레딧</p>
          <div className="bg-white rounded-2xl border border-[#E8E8E4] overflow-hidden">
            {CREDITS.map((c, i) => (
              <div key={c.key} className={`flex items-center justify-between px-5 py-4 ${i < CREDITS.length - 1 ? 'border-b border-[#E8E8E4]' : ''}`}>
                <div>
                  <p className="text-sm font-semibold text-[#111]">{c.label}</p>
                  <p className="text-xs text-[#9A9A94]">개당 {Math.round(c.price / (c.key === 'credits_10' ? 10 : 30))}원</p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-base font-bold text-[#111]">₩{c.price.toLocaleString()}</p>
                  <Link href="/analyze" className="text-xs text-[#9A9A94] hover:text-[#111] underline">구매</Link>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#C8C8C4] text-center mt-2">크레딧은 만료 없이 사용 가능합니다</p>
        </section>

        {/* ── 샵 플랜 ── */}
        <section>
          <p className="text-[10px] text-[#9A9A94] tracking-widest uppercase mb-4">샵 플랜 (사장님용)</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {SHOP_PLANS.map(plan => (
              <div key={plan.key}
                className={`rounded-2xl overflow-hidden border ${
                  plan.highlight ? 'border-[#111] bg-[#111]' : 'border-[#E8E8E4] bg-white'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className={`text-[10px] font-semibold tracking-widest uppercase mb-1 ${plan.highlight ? 'text-white/50' : 'text-[#9A9A94]'}`}>
                        {plan.name}
                      </p>
                      <p className={`font-serif text-2xl font-bold ${plan.highlight ? 'text-white' : 'text-[#111]'}`}>
                        {plan.price === 0 ? '무료' : `₩${plan.price.toLocaleString()}`}
                        {plan.price > 0 && <span className={`text-sm font-normal ml-1 ${plan.highlight ? 'text-white/50' : 'text-[#9A9A94]'}`}>/월</span>}
                      </p>
                    </div>
                    {plan.highlight && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white">PRO</span>
                    )}
                  </div>
                  <p className={`text-xs mb-5 ${plan.highlight ? 'text-white/60' : 'text-[#9A9A94]'}`}>{plan.desc}</p>
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-white/70' : 'text-[#1A7F4B]'}`} />
                        <span className={`text-sm ${plan.highlight ? 'text-white/80' : 'text-[#111]'}`}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.ctaHref}
                    className={`block w-full text-center py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-80 ${
                      plan.highlight ? 'bg-white text-[#111]' : 'bg-[#111] text-white'
                    }`}>
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="pb-4">
          <p className="text-[10px] text-[#9A9A94] tracking-widest uppercase mb-4">자주 묻는 질문</p>
          <div className="bg-white rounded-2xl border border-[#E8E8E4] overflow-hidden divide-y divide-[#E8E8E4]">
            {[
              { q: '결제는 어떻게 하나요?', a: '현재 플랜 가입은 준비 중입니다. 출시 시 안내해드릴게요.' },
              { q: '크레딧은 언제까지 쓸 수 있나요?', a: '크레딧은 만료 기한 없이 계속 사용 가능합니다.' },
              { q: 'PRO 플랜 취소는요?', a: '언제든지 취소 가능하며 취소 시 남은 기간까지 사용할 수 있습니다.' },
            ].map(({ q, a }) => (
              <div key={q} className="px-5 py-4">
                <p className="text-sm font-semibold text-[#111] mb-1">{q}</p>
                <p className="text-xs text-[#9A9A94] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
