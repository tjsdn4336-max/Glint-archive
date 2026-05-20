import { useState } from 'react';
import type { Certificate } from '../types';

interface Props {
  cert: Certificate;
  compact?: boolean;
}

// 종 이모지 매핑
const SPECIES_EMOJI: Record<string, string> = {
  crestie:  '🦎',
  leopard:  '🦎',
  beardie:  '🐉',
  gargoyle: '🦎',
  other:    '🦎',
};

export default function CertificateCard({ cert, compact = false }: Props) {
  const [copied, setCopied] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const shareUrl = `https://glintarchive.com/cert/${cert.id}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const formattedHatchDate = cert.hatchDate
    ? new Date(cert.hatchDate).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  const formattedIssuedAt = new Date(cert.issuedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="relative group">
      {/* 프리미엄 골드 아우라 레이어 */}
      {cert.isPremium && (
        <div
          className="absolute -inset-[2px] rounded-3xl z-0 animate-pulse-gold"
          style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #fde68a 30%, #f59e0b 60%, #fde68a 80%, #d97706 100%)',
            borderRadius: '24px',
          }}
        />
      )}

      {/* 카드 본체 */}
      <div
        className={`relative z-10 rounded-3xl overflow-hidden flex flex-col
          bg-white border
          ${cert.isPremium
            ? 'border-transparent shadow-gold'
            : 'border-slate-200/80 shadow-card-lg'
          }
          transition-all duration-500
          group-hover:-translate-y-1 group-hover:shadow-card-lg
        `}
      >
        {/* 상단 사진 영역 */}
        <div className="relative h-52 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden cert-bg">
          {cert.imageUrl && !imgErr ? (
            <img
              src={cert.imageUrl}
              alt={cert.animalName}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={() => setImgErr(true)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <span className="text-5xl opacity-30">{SPECIES_EMOJI[cert.species] ?? '🦎'}</span>
              <p className="text-xs text-slate-400 font-sans tracking-widest">사진 없음</p>
            </div>
          )}

          {/* 상단 반투명 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />

          {/* 공식 인증 배지 */}
          <div className="absolute top-3 left-3">
            <div className="flex items-center gap-1.5 bg-teal-600 text-white rounded-full px-3 py-1 shadow-sm">
              <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span className="text-[10px] font-bold tracking-wider">GLINT 공식 인증</span>
            </div>
          </div>

          {/* 프리미엄 배지 */}
          {cert.isPremium && (
            <div className="absolute top-3 right-3">
              <div
                className="flex items-center gap-1 rounded-full px-3 py-1 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}
              >
                <span className="text-[10px]">★</span>
                <span className="text-[10px] font-bold text-amber-900 tracking-wider">PREMIUM</span>
              </div>
            </div>
          )}
        </div>

        {/* 카드 본문 */}
        <div className="flex-1 p-5 flex flex-col gap-4 bg-white">

          {/* 종 + 모프 */}
          <div>
            <p className="text-[10px] font-sans tracking-[0.3em] text-teal-600 uppercase mb-1">
              {cert.speciesLabel}
            </p>
            <div className="flex items-end justify-between gap-2">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-800 leading-tight">
                  {cert.animalName}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5 font-sans">{cert.morphName}</p>
              </div>
              <span className={`flex-shrink-0 text-xs font-sans font-semibold px-2.5 py-1 rounded-full
                ${cert.gender === '수컷'
                  ? 'bg-blue-50 text-blue-600'
                  : cert.gender === '암컷'
                  ? 'bg-pink-50 text-pink-600'
                  : 'bg-slate-100 text-slate-500'
                }`}
              >
                {cert.gender}
              </span>
            </div>
          </div>

          {/* 정보 행 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 px-3 py-2.5">
              <p className="text-[9px] font-sans tracking-widest text-slate-400 uppercase mb-1">발급 샵</p>
              <p className="text-xs font-sans font-semibold text-slate-700 truncate">{cert.shopName}</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2.5">
              <p className="text-[9px] font-sans tracking-widest text-slate-400 uppercase mb-1">해칭일</p>
              <p className="text-xs font-sans font-semibold text-slate-700">{formattedHatchDate}</p>
            </div>
          </div>

          {/* 시리얼 넘버 + 발급일 구분선 */}
          <div className="border-t border-dashed border-slate-200 pt-3 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-sans text-slate-400 tracking-widest uppercase mb-0.5">보증서 번호</p>
              <p className="font-mono text-xs font-bold text-slate-600 tracking-widest">{cert.id}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-sans text-slate-400 tracking-widest uppercase mb-0.5">발급일</p>
              <p className="font-mono text-[10px] text-slate-500">{formattedIssuedAt}</p>
            </div>
          </div>

          {/* 하단 워터마크 */}
          <div className="flex items-center justify-center gap-1.5 py-1">
            <div className="h-px flex-1 bg-slate-100" />
            <p className="text-[9px] font-sans tracking-[0.25em] text-slate-300 uppercase">GLINT ARCHIVE</p>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          {/* 액션 버튼 */}
          {!compact && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 py-2.5 text-xs font-sans font-semibold text-slate-600 hover:text-teal-700 transition-all duration-200"
              >
                {copied ? (
                  <>
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    복사 완료
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    링크 복사
                  </>
                )}
              </button>
              <button className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 py-2.5 text-xs font-sans font-bold text-white transition-colors duration-200 shadow-sm">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                샵 문의하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
