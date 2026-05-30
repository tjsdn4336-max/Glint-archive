'use client';

const TYPES = ['전체', '레오파드 게코', '볼파이톤', '크레스티드 게코', '비어디 드래곤', '콘스네이크', '기타'];

const PRICE_OPTIONS = [
  { label: '전체 가격',    min: '',        max: ''        },
  { label: '~5만원',       min: '',        max: '50000'   },
  { label: '5~20만원',     min: '50000',   max: '200000'  },
  { label: '20~50만원',    min: '200000',  max: '500000'  },
  { label: '50~100만원',   min: '500000',  max: '1000000' },
  { label: '100만원 이상', min: '1000000', max: ''        },
];

export interface FilterState {
  type:      string;
  dealOnly:  boolean;
  priceKey:  string;
  minPrice:  string;
  maxPrice:  string;
}

interface Props {
  filter: FilterState;
  onChange: (f: FilterState) => void;
}

export default function FilterBar({ filter, onChange }: Props) {
  const set = (partial: Partial<FilterState>) => onChange({ ...filter, ...partial });

  const handlePriceChange = (label: string) => {
    const opt = PRICE_OPTIONS.find(o => o.label === label) ?? PRICE_OPTIONS[0];
    set({ priceKey: label, minPrice: opt.min, maxPrice: opt.max });
  };

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5 items-center">
      {/* 종류 탭 */}
      {TYPES.map(t => (
        <button
          key={t}
          onClick={() => set({ type: t })}
          className={[
            'flex-shrink-0 px-3 py-1.5 rounded text-xs font-bold transition-colors duration-150',
            filter.type === t
              ? 'bg-ga-black text-ga-white'
              : 'bg-ga-white text-ga-muted border border-ga-border hover:border-ga-muted',
          ].join(' ')}
        >
          {t}
        </button>
      ))}

      {/* 구분선 */}
      <div className="w-px h-4 bg-ga-border flex-shrink-0 mx-1" />

      {/* 타임딜 토글 */}
      <button
        onClick={() => set({ dealOnly: !filter.dealOnly })}
        className={[
          'flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold transition-colors duration-150',
          filter.dealOnly
            ? 'bg-ga-black text-ga-white'
            : 'bg-ga-white text-ga-muted border border-ga-border hover:border-ga-muted',
        ].join(' ')}
      >
        ⚡ 타임딜만
      </button>

      {/* 가격 드롭다운 */}
      <select
        value={filter.priceKey}
        onChange={e => handlePriceChange(e.target.value)}
        className="flex-shrink-0 bg-ga-white border border-ga-border rounded px-3 py-1.5 text-xs text-ga-muted focus:outline-none cursor-pointer hover:border-ga-muted transition-colors"
      >
        {PRICE_OPTIONS.map(o => (
          <option key={o.label} value={o.label}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
