import Link from 'next/link';

export interface MorphResult {
  species: string;
  morph: string;
  morph_korean: string;
  confidence: '높음' | '중간' | '낮음';
  genes: string[];
  price_range: { min: number; max: number };
  description: string;
  care_tip: string;
  disclaimer: string;
}

interface Props {
  result: MorphResult;
  onReset: () => void;
}

export default function ResultCard({ result, onReset }: Props) {
  const confidenceColor =
    result.confidence === '높음' ? '#1A7F4B' :
    result.confidence === '중간' ? '#CA8A04' :
    '#9A9A94';

  return (
    <div className="bg-ga-white rounded-2xl border border-ga-border overflow-hidden mt-4">

      {/* 결과 헤더 */}
      <div className="bg-ga-black px-6 py-5">
        <p className="text-[9px] text-zinc-600 tracking-[0.2em] font-semibold mb-3 uppercase">
          Morph Analysis Result
        </p>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl font-bold text-white mb-1">
              {result.morph}
            </h2>
            <p className="text-sm text-zinc-500">{result.morph_korean}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[9px] text-zinc-600 mb-1 uppercase tracking-wider">확신도</p>
            <p className="text-sm font-bold" style={{ color: confidenceColor }}>
              {result.confidence}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">

        {/* 종 + 유전자 태그 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] bg-ga-bg text-ga-black border border-ga-border px-2.5 py-1 rounded font-bold">
            {result.species}
          </span>
          {result.genes.map(gene => (
            <span key={gene} className="text-[11px] bg-ga-bg text-ga-muted border border-ga-border px-2.5 py-1 rounded">
              {gene}
            </span>
          ))}
        </div>

        {/* 시세 */}
        <div className="bg-ga-bg rounded-xl p-4">
          <p className="text-[10px] text-ga-muted tracking-[0.15em] font-semibold mb-2 uppercase">예상 시세</p>
          <p className="font-serif text-2xl font-bold text-ga-black">
            {result.price_range.min.toLocaleString()}
            <span className="text-ga-muted text-lg"> — </span>
            {result.price_range.max.toLocaleString()}원
          </p>
        </div>

        {/* 모프 설명 */}
        <div>
          <p className="text-[10px] text-ga-muted tracking-[0.15em] font-semibold mb-2 uppercase">모프 설명</p>
          <p className="text-sm text-[#6B6B65] leading-relaxed">{result.description}</p>
        </div>

        {/* 사육 팁 */}
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-[10px] text-ga-blue tracking-[0.15em] font-semibold mb-1.5 uppercase">사육 팁</p>
          <p className="text-sm text-ga-blue leading-relaxed">{result.care_tip}</p>
        </div>

        {/* 면책 고지 */}
        <p className="text-[10px] text-ga-faint text-center">{result.disclaimer}</p>

        {/* 액션 버튼 */}
        <div className="flex flex-col gap-2 pt-1">
          <Link
            href="/deals"
            className="w-full bg-ga-black text-ga-white rounded-lg py-3.5 text-sm font-bold tracking-wide text-center block hover:opacity-80 transition-opacity"
          >
            이 모프 타임딜 보러가기
          </Link>
          <button
            onClick={onReset}
            className="w-full bg-ga-white text-ga-muted border border-ga-border rounded-lg py-3 text-sm font-medium hover:border-ga-muted transition-colors"
          >
            다시 감정하기
          </button>
        </div>
      </div>
    </div>
  );
}
