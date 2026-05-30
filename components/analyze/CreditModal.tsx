'use client';

interface Props {
  onClose: () => void;
  onToast: (msg: string) => void;
}

const PLANS = [
  { label: '10회 충전', price: '2,900원', sub: '1회당 290원', featured: false },
  { label: '월정액 무제한', price: '월 9,900원', sub: '가장 인기 있는 플랜', featured: true },
];

export default function CreditModal({ onClose, onToast }: Props) {
  const handlePlan = () => {
    onToast('준비 중입니다. 곧 오픈할게요!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center px-5">
      <div className="bg-ga-white rounded-2xl w-full max-w-sm p-6 shadow-xl">

        <h2 className="font-serif text-xl font-bold text-ga-black mb-1">
          크레딧이 부족합니다
        </h2>
        <p className="text-sm text-ga-muted mb-6">
          크레딧을 충전하고 계속 감정하세요
        </p>

        {PLANS.map(plan => (
          <button
            key={plan.label}
            onClick={handlePlan}
            className={[
              'w-full mb-3 p-4 rounded-xl text-left transition-opacity hover:opacity-90',
              plan.featured
                ? 'bg-ga-black text-ga-white'
                : 'bg-ga-bg border border-ga-border text-ga-black',
            ].join(' ')}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-sm mb-0.5">{plan.label}</p>
                <p className={`text-[11px] ${plan.featured ? 'text-zinc-500' : 'text-ga-muted'}`}>
                  {plan.sub}
                </p>
              </div>
              <p className="font-serif text-lg font-bold">{plan.price}</p>
            </div>
          </button>
        ))}

        <button
          onClick={onClose}
          className="w-full text-center text-sm text-ga-muted mt-2 py-2 hover:text-ga-black transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  );
}
