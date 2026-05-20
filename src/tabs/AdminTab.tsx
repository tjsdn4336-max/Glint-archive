import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DealForm, PlanFeature } from '../types';

const PLAN_FEATURES: PlanFeature[] = [
  { label: '매장 프로필 등록',         standard: '기본 정보',    premium: '상단 고정 + 프리미엄 배지' },
  { label: '타임딜 등록',              standard: '월 3회',        premium: '무제한' },
  { label: '인근 유저 푸시 알림',      standard: false,           premium: true },
  { label: '신규 모프 입고 알림',      standard: false,           premium: true },
  { label: '판매 통계 대시보드',       standard: '기본 조회',     premium: '모프별 시세 & 트렌드' },
  { label: '검색 노출 우선순위',       standard: '일반',          premium: '최상단 고정' },
  { label: '팔로워 전용 특가 배포',    standard: false,           premium: true },
  { label: '월간 성과 리포트',         standard: false,           premium: true },
  { label: '전담 파트너 매니저',       standard: false,           premium: true },
];

const INITIAL_FORM: DealForm = {
  title: '',
  species: '',
  morphName: '',
  gender: '',
  originalPrice: '',
  salePrice: '',
  stock: '',
  durationHours: '24',
  description: '',
  imageUrl: '',
};

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center mx-auto">
        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#0d9488" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
        <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="#cbd5e1" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </div>
    );
  }
  return <span className="text-xs font-sans font-semibold text-slate-700">{value as string}</span>;
}

export default function AdminTab() {
  const [activePlan, setActivePlan] = useState<'standard' | 'premium'>('premium');
  const [form, setForm] = useState<DealForm>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [activeSection, setActiveSection] = useState<'register' | 'stats' | 'plan'>('register');

  const discountRate = form.originalPrice && form.salePrice
    ? Math.round((1 - Number(form.salePrice) / Number(form.originalPrice)) * 100)
    : 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
            <span className="text-xs font-sans font-bold text-amber-700">사장님 전용</span>
          </div>
        </div>
        <h2 className="font-display text-2xl font-bold text-slate-800">비즈니스 어드민</h2>
        <p className="font-sans text-sm text-slate-500 mt-1">타임딜 등록 · 매장 관리 · 플랜 비교</p>
      </motion.div>

      {/* 섹션 탭 */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 mb-8 border-b border-slate-100"
      >
        {([
          { id: 'register', label: '⚡ 타임딜 등록' },
          { id: 'stats',    label: '📊 판매 통계' },
          { id: 'plan',     label: '💎 플랜 비교' },
        ] as const).map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`relative pb-3 px-1 text-sm font-sans font-semibold transition-colors duration-200
              ${activeSection === s.id ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}
            `}
          >
            {s.label}
            {activeSection === s.id && (
              <motion.div
                layoutId="admin-tab-line"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ─── 타임딜 등록 ────────────────────────────────────────────────────── */}
        {activeSection === 'register' && (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* 등록 폼 */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-display text-base font-bold text-slate-800">타임딜 등록</h3>
                    <p className="text-xs font-sans text-slate-500 mt-0.5">
                      {activePlan === 'standard' ? '이번 달 잔여 횟수: 2회' : '무제한 등록 가능 (PREMIUM)'}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* 딜 제목 */}
                    <div>
                      <label className="block text-xs font-sans font-semibold text-slate-600 mb-1.5">딜 제목 *</label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="예: 🔥 엑스트림 할리퀸 크레스티 수컷"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-sans text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all duration-200"
                      />
                    </div>

                    {/* 종 + 성별 */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-sans font-semibold text-slate-600 mb-1.5">종 *</label>
                        <select
                          value={form.species}
                          onChange={(e) => setForm({ ...form, species: e.target.value as DealForm['species'] })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-sans text-slate-800 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all duration-200"
                        >
                          <option value="">선택하세요</option>
                          <option value="crestie">크레스티드 게코</option>
                          <option value="leopard">레오파드 게코</option>
                          <option value="beardie">비어디드 드래곤</option>
                          <option value="gargoyle">가고일 게코</option>
                          <option value="chameleon">카멜레온</option>
                          <option value="bluetongue">블루텅 스킨크</option>
                          <option value="other">기타</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-sans font-semibold text-slate-600 mb-1.5">성별 *</label>
                        <select
                          value={form.gender}
                          onChange={(e) => setForm({ ...form, gender: e.target.value as DealForm['gender'] })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-sans text-slate-800 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all duration-200"
                        >
                          <option value="">선택하세요</option>
                          <option value="수컷">수컷</option>
                          <option value="암컷">암컷</option>
                          <option value="미확인">미확인</option>
                        </select>
                      </div>
                    </div>

                    {/* 모프명 */}
                    <div>
                      <label className="block text-xs font-sans font-semibold text-slate-600 mb-1.5">모프명 *</label>
                      <input
                        type="text"
                        value={form.morphName}
                        onChange={(e) => setForm({ ...form, morphName: e.target.value })}
                        placeholder="예: Extreme Harlequin, W&Y, 블리자드"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-sans text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all duration-200"
                      />
                    </div>

                    {/* 가격 */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-sans font-semibold text-slate-600 mb-1.5">정가 (원) *</label>
                        <input
                          type="number"
                          value={form.originalPrice}
                          onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                          placeholder="450000"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-sans text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-sans font-semibold text-slate-600 mb-1.5">
                          딜 가격 (원) *
                          {discountRate > 0 && (
                            <span className="ml-2 text-red-500 font-bold">-{discountRate}%</span>
                          )}
                        </label>
                        <input
                          type="number"
                          value={form.salePrice}
                          onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                          placeholder="280000"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-sans text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* 재고 + 딜 시간 */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-sans font-semibold text-slate-600 mb-1.5">재고 수량 (마리)</label>
                        <input
                          type="number"
                          value={form.stock}
                          onChange={(e) => setForm({ ...form, stock: e.target.value })}
                          placeholder="3"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-sans text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-sans font-semibold text-slate-600 mb-1.5">딜 지속 시간</label>
                        <select
                          value={form.durationHours}
                          onChange={(e) => setForm({ ...form, durationHours: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-sans text-slate-800 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all duration-200"
                        >
                          <option value="6">6시간</option>
                          <option value="12">12시간</option>
                          <option value="24">24시간</option>
                          <option value="48">48시간</option>
                          <option value="72">72시간</option>
                        </select>
                      </div>
                    </div>

                    {/* 설명 */}
                    <div>
                      <label className="block text-xs font-sans font-semibold text-slate-600 mb-1.5">딜 설명</label>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="개체 특징, 사육 환경, 건강 상태 등을 입력하세요"
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-sans text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all duration-200 resize-none"
                      />
                    </div>

                    {/* 제출 버튼 */}
                    <AnimatePresence mode="wait">
                      {submitted ? (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="w-full py-3.5 rounded-xl bg-emerald-500 flex items-center justify-center gap-2 text-white font-sans font-bold text-sm"
                        >
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                          </svg>
                          타임딜이 등록되었습니다!
                        </motion.div>
                      ) : (
                        <motion.button
                          key="submit"
                          type="submit"
                          className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-sans font-bold text-sm transition-all duration-200 shadow-sm active:scale-[0.99] flex items-center justify-center gap-2"
                        >
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                          </svg>
                          타임딜 즉시 오픈
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </form>
                </div>
              </div>

              {/* 우측 — 미리보기 + 안내 */}
              <div className="lg:col-span-2 space-y-4">
                {/* 딜 미리보기 카드 */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-display text-sm font-bold text-slate-700">미리보기</h3>
                  </div>
                  <div className="p-5">
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-sans font-bold px-2 py-0.5 rounded-md text-white ${discountRate > 0 ? 'bg-red-500' : 'bg-slate-300'}`}>
                          {discountRate > 0 ? `-${discountRate}%` : '--%'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{form.durationHours}시간 딜</span>
                      </div>
                      <div>
                        <p className="font-display text-sm font-bold text-slate-800 leading-snug">
                          {form.title || '딜 제목을 입력하세요'}
                        </p>
                        <p className="text-xs font-sans text-slate-500 mt-0.5">
                          {form.morphName || '모프명'} · {form.gender || '성별'}
                        </p>
                      </div>
                      <div className="flex items-end gap-2">
                        {form.originalPrice && (
                          <p className="text-xs font-sans text-slate-400 line-through">
                            {Number(form.originalPrice).toLocaleString()}원
                          </p>
                        )}
                        <p className="font-display text-lg font-black text-slate-900">
                          {form.salePrice ? `${Number(form.salePrice).toLocaleString()}원` : '₩ — — —'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-sans text-slate-400">
                        <span>재고: {form.stock || '—'}마리</span>
                        <span>내 샵 이름</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 수익 예측 */}
                {form.salePrice && form.stock && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-teal-50 rounded-2xl border border-teal-100 p-5"
                  >
                    <p className="text-xs font-sans font-bold text-teal-700 mb-3">예상 수익</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-sans text-teal-600">전량 판매시</span>
                        <span className="font-display font-bold text-teal-800">
                          {(Number(form.salePrice) * Number(form.stock)).toLocaleString()}원
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="font-sans text-teal-500">50% 판매시</span>
                        <span className="font-sans font-semibold text-teal-700">
                          {(Number(form.salePrice) * Number(form.stock) * 0.5).toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 팁 카드 */}
                <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base">💡</span>
                    <p className="text-xs font-sans font-bold text-amber-700">딜 성과 높이는 팁</p>
                  </div>
                  <ul className="space-y-1.5 text-xs font-sans text-amber-700">
                    <li>• 고화질 사진을 추가하면 전환율 3배</li>
                    <li>• 24시간 미만 딜이 클릭율 2배 높음</li>
                    <li>• 30% 이상 할인율이 즉시 구매 유도</li>
                    <li>• 오후 6–9시 등록 시 노출량 최대</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── 판매 통계 ────────────────────────────────────────────────────── */}
        {activeSection === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: '이번 달 딜 조회수', value: '14,302', change: '+23%', up: true },
                { label: '문의 전환율', value: '8.4%', change: '+1.2%p', up: true },
                { label: '팔로워 수', value: '1,840', change: '+156', up: true },
                { label: '평균 할인율', value: '38%', change: '-2%p', up: false },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 shadow-card p-4">
                  <p className="text-[10px] font-sans text-slate-400 uppercase tracking-wider mb-2">{stat.label}</p>
                  <p className="font-display text-2xl font-black text-slate-800">{stat.value}</p>
                  <p className={`text-xs font-sans font-semibold mt-1 ${stat.up ? 'text-emerald-500' : 'text-red-400'}`}>
                    {stat.change} 전월 대비
                  </p>
                </div>
              ))}
            </div>

            {/* 모의 차트 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 mb-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-base font-bold text-slate-800">딜 조회수 추이</h3>
                <span className="text-xs font-sans text-slate-400">최근 7일</span>
              </div>
              <div className="flex items-end gap-2 h-28">
                {[42, 68, 55, 90, 73, 110, 143].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex-1 rounded-t-lg origin-bottom"
                    style={{
                      height: `${(h / 143) * 100}%`,
                      background: i === 6
                        ? 'linear-gradient(to top, #0d9488, #14b8a6)'
                        : 'linear-gradient(to top, #e2e8f0, #f1f5f9)',
                    }}
                  />
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                {['월', '화', '수', '목', '금', '토', '일'].map((d) => (
                  <span key={d} className="flex-1 text-center text-[9px] font-sans text-slate-400">{d}</span>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4 flex items-center gap-3">
              <span className="text-xl">💎</span>
              <div>
                <p className="text-sm font-sans font-bold text-amber-800">모프별 시세 분석은 Premium 전용</p>
                <p className="text-xs font-sans text-amber-600 mt-0.5">Premium으로 업그레이드하면 전국 모프 시세 트렌드와 경쟁 샵 분석을 볼 수 있습니다</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── 플랜 비교 ────────────────────────────────────────────────────── */}
        {activeSection === 'plan' && (
          <motion.div
            key="plan"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.25 }}
          >
            {/* 플랜 선택 토글 */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-2 bg-slate-100 rounded-2xl p-1.5">
                {(['standard', 'premium'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setActivePlan(p)}
                    className={`relative px-6 py-2.5 rounded-xl text-sm font-sans font-bold transition-all duration-200
                      ${activePlan === p ? 'text-white shadow-sm' : 'text-slate-500'}
                    `}
                  >
                    {activePlan === p && (
                      <motion.div
                        layoutId="plan-bg"
                        className={`absolute inset-0 rounded-xl ${p === 'premium' ? '' : 'bg-slate-700'}`}
                        style={p === 'premium' ? { background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' } : {}}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">
                      {p === 'standard' ? 'Standard' : '⭐ Premium'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 가격 표시 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
              <div className={`rounded-2xl border-2 p-6 text-center transition-all duration-300 ${activePlan === 'standard' ? 'border-slate-700 shadow-card-lg' : 'border-slate-100 opacity-60'}`}>
                <p className="font-display text-base font-bold text-slate-700 mb-1">Standard</p>
                <p className="font-display text-3xl font-black text-slate-800 mb-1">무료</p>
                <p className="text-xs font-sans text-slate-400">기본 기능 이용</p>
              </div>
              <div
                className={`rounded-2xl border-2 p-6 text-center transition-all duration-300 relative overflow-hidden
                  ${activePlan === 'premium' ? 'border-amber-300 shadow-gold' : 'border-slate-100 opacity-60'}
                `}
              >
                <div className="absolute top-0 right-0 w-16 h-16 opacity-10" style={{ background: 'radial-gradient(circle, #fbbf24, transparent)' }} />
                <p className="font-display text-base font-bold text-amber-700 mb-1">⭐ Premium</p>
                <p className="font-display text-3xl font-black text-slate-800 mb-1">
                  99,000<span className="text-base font-sans font-semibold text-slate-400">원/월</span>
                </p>
                <p className="text-xs font-sans text-amber-600 font-semibold">연간 결제 시 30% 할인</p>
              </div>
            </div>

            {/* 기능 비교표 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden max-w-2xl mx-auto">
              <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-100">
                <div className="px-4 py-3 text-xs font-sans font-bold text-slate-500 uppercase tracking-wider">기능</div>
                <div className="px-4 py-3 text-xs font-sans font-bold text-slate-600 uppercase tracking-wider text-center">Standard</div>
                <div className="px-4 py-3 text-xs font-sans font-bold text-amber-700 uppercase tracking-wider text-center">Premium</div>
              </div>
              <div className="divide-y divide-slate-100">
                {PLAN_FEATURES.map((feature) => (
                  <div key={feature.label} className="grid grid-cols-3 items-center">
                    <div className="px-4 py-3.5 text-xs font-sans text-slate-700">{feature.label}</div>
                    <div className="px-4 py-3.5 text-center">
                      <FeatureValue value={feature.standard} />
                    </div>
                    <div className="px-4 py-3.5 text-center">
                      <FeatureValue value={feature.premium} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 업그레이드 CTA */}
            <div className="mt-8 max-w-2xl mx-auto">
              <button
                className="w-full py-4 rounded-2xl font-display font-bold text-base text-amber-900 transition-all duration-200 hover:shadow-gold active:scale-[0.99]"
                style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' }}
              >
                ⭐ Premium으로 업그레이드 — 월 99,000원
              </button>
              <p className="text-center text-xs font-sans text-slate-400 mt-3">
                14일 무료 체험 · 언제든 해지 가능 · 카드 자동 결제
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
