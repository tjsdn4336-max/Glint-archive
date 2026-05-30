'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { ChevronLeft, ChevronDown, ChevronUp, Thermometer, Droplets, Info } from 'lucide-react';

interface Species {
  id: string;
  slug: string;
  name_korean: string;
  name_english: string;
  name_scientific: string;
  difficulty: string;
  temperament: string;
  lifespan: string;
  adult_size: string;
  origin: string;
  description: string;
  housing: string;
  temperature: string;
  humidity: string;
  diet: string;
  beginner_friendly: boolean;
  image_url: string;
  morph_note: string | null;
  morph_count_label: string | null;
  aliases: string[];
}

interface Morph {
  id: string;
  name_korean: string;
  name_english: string;
  rarity: string;
  genes: string[];
  gene_types: string[];
  description: string;
  appearance: string;
  price_min: number;
  price_max: number;
  color_main: string;
  color_secondary: string;
  color_accent: string;
  aliases: string[];
  is_combo: boolean;
}

/* 희귀도 배지 스타일 */
const RARITY_BADGE: Record<string, string> = {
  '커먼':        'bg-white/90 text-[#9A9A94]',
  '언커먼':      'bg-blue-500/90 text-white',
  '레어':        'bg-purple-600/90 text-white',
  '울트라 레어': 'bg-black/90 text-yellow-400',
};

export default function SpeciesDetailPage() {
  const params      = useParams();
  const router      = useRouter();
  const catSlug     = decodeURIComponent(params?.category as string);
  const speciesSlug = decodeURIComponent(params?.species  as string);

  const [sp,            setSp]            = useState<Species | null>(null);
  const [morphs,        setMorphs]        = useState<Morph[]>([]);
  const [selectedMorph, setSelectedMorph] = useState<string | null>(null);
  const [activeTab,     setActiveTab]     = useState<'info' | 'care' | 'morphs'>('info');
  const [loading,       setLoading]       = useState(true);
  const [missing,       setMissing]       = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (!speciesSlug) return;
    const fetchData = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: s } = await (supabase as any)
        .from('species')
        .select('*')
        .eq('slug', speciesSlug)
        .maybeSingle() as { data: Species | null };

      if (!s) { setMissing(true); setLoading(false); return; }
      setSp(s);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: m } = await (supabase as any)
        .from('morphs')
        .select('*')
        .eq('species_id', s.id)
        .order('sort_order') as { data: Morph[] | null };

      setMorphs(m || []);
      setLoading(false);
    };
    fetchData();
  }, [speciesSlug]);

  useEffect(() => {
    if (!loading && missing) router.replace('/encyclopedia');
  }, [loading, missing, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!sp) return null;

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      {/* 상단 바 */}
      <div className="bg-white border-b border-[#E8E8E4] px-5 h-14 flex items-center gap-3 sticky top-0 z-10">
        <Link
          href={`/encyclopedia/${catSlug}`}
          className="w-8 h-8 rounded-full bg-[#F7F7F5] border border-[#E8E8E4] flex items-center justify-center"
        >
          <ChevronLeft className="w-4 h-4 text-[#111]" />
        </Link>
        <span className="font-serif text-base font-bold text-[#111]">파충류 사전</span>
      </div>

      {/* 히어로 이미지 — 16:9 */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#F0F0EE] to-[#E4E4E0]">
        {sp.image_url ? (
          <img
            src={sp.image_url}
            alt={sp.name_korean}
            className="w-full h-full object-cover object-center"
            onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0'; }}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-5">
          <h1 className="font-serif text-2xl font-bold text-white mb-0.5">
            {sp.name_korean}
          </h1>
          <p className="text-sm text-white/70">{sp.name_english}</p>
          <p className="text-[10px] text-white/50 italic mt-0.5">{sp.name_scientific}</p>
        </div>
      </div>

      {/* 탭 바 */}
      <div className="flex bg-white border-b border-[#E8E8E4] sticky top-14 z-10">
        {[
          { key: 'info'   as const, label: '기본 정보' },
          { key: 'care'   as const, label: '사육 가이드' },
          { key: 'morphs' as const, label: `모프 (${morphs.length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3.5 text-xs font-semibold transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-[#111] text-[#111]'
                : 'text-[#9A9A94]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-5 py-5 pb-24">

        {/* ── 탭 1: 기본 정보 ── */}
        {activeTab === 'info' && (
          <div className="flex flex-col gap-4">
            {/* ⚠ 생태계교란생물 경고 — red-eared-slider 전용 */}
            {sp.slug === 'red-eared-slider' && (
              <div className="bg-red-50 rounded-xl border border-red-200 p-4 flex gap-3 items-start">
                <span className="text-lg leading-none mt-0.5">⚠</span>
                <div>
                  <p className="text-[12px] font-bold text-[#D94035] mb-1">
                    환경부 지정 생태계교란생물
                  </p>
                  <p className="text-[12px] text-red-700 leading-relaxed">
                    사육은 가능하나 야외 방생은 법적으로 금지되어 있습니다.
                    책임감 있는 사육을 부탁드립니다.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-[#E8E8E4] p-5">
              <p className="text-[10px] text-[#9A9A94] tracking-[0.15em] font-semibold mb-3 uppercase">
                기본 정보
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: '사육 난이도', val: sp.difficulty },
                  { label: '평균 수명',   val: sp.lifespan   },
                  { label: '성체 크기',   val: sp.adult_size },
                  { label: '원산지',      val: sp.origin     },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-[10px] text-[#C8C8C4] mb-1">{item.label}</p>
                    <p className="text-sm font-semibold text-[#111]">{item.val}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E8E4] p-5">
              <p className="text-[10px] text-[#9A9A94] tracking-[0.15em] font-semibold mb-2 uppercase">
                성격
              </p>
              <p className="text-sm text-[#333] leading-relaxed">{sp.temperament}</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E8E4] p-5">
              <p className="text-[10px] text-[#9A9A94] tracking-[0.15em] font-semibold mb-2 uppercase">
                종 설명
              </p>
              <p className="text-sm text-[#333] leading-relaxed">{sp.description}</p>
            </div>

            {sp.beginner_friendly && (
              <div className="bg-green-50 rounded-xl border border-green-100 p-4">
                <p className="text-[11px] text-[#1A7F4B] font-bold mb-1">입문 추천 종</p>
                <p className="text-[12px] text-[#1A7F4B] leading-relaxed">
                  초보 사육자도 부담 없이 시작할 수 있는 종입니다.
                </p>
              </div>
            )}

            {morphs.length > 0 && (
              <button
                onClick={() => setActiveTab('morphs')}
                className="w-full bg-white border border-[#E8E8E4] rounded-2xl p-4 flex items-center justify-between hover:border-[#9A9A94] transition-colors"
              >
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#111]">모프 도감 보기</p>
                  <p className="text-[11px] text-[#9A9A94] mt-0.5">{morphs.length}가지 모프 수록</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-[#9A9A94] rotate-180" />
              </button>
            )}

            <Link href={`/deals?q=${encodeURIComponent(sp.name_korean)}`}>
              <div className="w-full bg-[#111] text-white rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">타임딜 보러가기</p>
                  <p className="text-[11px] text-white/60 mt-0.5">{sp.name_korean} 매물 검색</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-white/60 rotate-180" />
              </div>
            </Link>
          </div>
        )}

        {/* ── 탭 2: 사육 가이드 ── */}
        {activeTab === 'care' && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-[#E8E8E4] p-5">
              <div className="flex items-center gap-2 mb-4">
                <Thermometer className="w-4 h-4 text-[#D94035]" />
                <p className="text-[10px] text-[#9A9A94] tracking-[0.15em] font-semibold uppercase">
                  온도 & 습도
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="bg-[#F7F7F5] rounded-xl p-3">
                  <p className="text-[10px] text-[#C8C8C4] mb-1">온도</p>
                  <p className="text-sm font-bold text-[#111]">{sp.temperature}</p>
                </div>
                <div className="bg-[#F7F7F5] rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Droplets className="w-3 h-3 text-[#1A56DB]" />
                    <p className="text-[10px] text-[#C8C8C4]">습도</p>
                  </div>
                  <p className="text-sm font-bold text-[#111]">{sp.humidity}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E8E4] p-5">
              <p className="text-[10px] text-[#9A9A94] tracking-[0.15em] font-semibold mb-2 uppercase">
                사육장 설정
              </p>
              <p className="text-sm text-[#333] leading-relaxed">{sp.housing}</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E8E4] p-5">
              <p className="text-[10px] text-[#9A9A94] tracking-[0.15em] font-semibold mb-2 uppercase">
                먹이
              </p>
              <p className="text-sm text-[#333] leading-relaxed">{sp.diet}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border border-[#E8E8E4] p-4">
                <p className="text-[10px] text-[#C8C8C4] mb-1">평균 수명</p>
                <p className="text-sm font-bold text-[#111]">{sp.lifespan}</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#E8E8E4] p-4">
                <p className="text-[10px] text-[#C8C8C4] mb-1">성체 크기</p>
                <p className="text-sm font-bold text-[#111]">{sp.adult_size}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── 탭 3: 모프 목록 ── */}
        {activeTab === 'morphs' && (
          <div className="flex flex-col gap-3">

            {/* 모프 안내 박스 */}
            {sp.morph_note && (
              <div className="bg-[#F7F7F5] border border-[#E8E8E4] rounded-xl p-4 flex items-start gap-3 mb-1">
                <Info className="w-4 h-4 text-[#9A9A94] flex-shrink-0 mt-0.5" />
                <div>
                  {sp.morph_count_label && (
                    <p className="text-[10px] text-[#9A9A94] tracking-[0.15em] font-semibold uppercase mb-1">
                      모프 규모: {sp.morph_count_label}
                    </p>
                  )}
                  <p className="text-[13px] text-[#111] leading-relaxed">
                    {sp.morph_note}
                  </p>
                </div>
              </div>
            )}

            {/* 모프 카드 목록 */}
            {morphs.length === 0 ? null : (
              morphs.map(morph => {
                const open = selectedMorph === morph.id;
                return (
                  <div
                    key={morph.id}
                    className={`bg-white rounded-2xl border overflow-hidden transition-colors ${
                      open ? 'border-[#111]' : 'border-[#E8E8E4] hover:border-[#9A9A94]'
                    }`}
                  >
                    {/* 클릭 헤더 */}
                    <button
                      onClick={() => setSelectedMorph(open ? null : morph.id)}
                      className="w-full text-left"
                    >
                      {/* 큰 색상 그라디언트 영역 */}
                      <div
                        className="h-32 relative"
                        style={{
                          background: `linear-gradient(135deg, ${morph.color_main} 0%, ${morph.color_secondary} 50%, ${morph.color_accent} 100%)`
                        }}
                      >
                        {/* 좌상단: 희귀도 배지 */}
                        <div className="absolute top-3 left-3">
                          <span className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded backdrop-blur-sm ${RARITY_BADGE[morph.rarity] ?? 'bg-white/90 text-[#9A9A94]'}`}>
                            {morph.rarity}
                          </span>
                        </div>
                        {/* 우상단: 콤보 배지 */}
                        {morph.is_combo && (
                          <div className="absolute top-3 right-3">
                            <span className="text-[10px] font-bold bg-white/90 backdrop-blur-sm text-[#111] px-2 py-1 rounded">
                              콤보 모프
                            </span>
                          </div>
                        )}
                        {/* 우하단: 펼침 아이콘 */}
                        <div className="absolute bottom-3 right-3">
                          {open
                            ? <ChevronUp   className="w-5 h-5 text-white/70" />
                            : <ChevronDown className="w-5 h-5 text-white/70" />
                          }
                        </div>
                      </div>

                      {/* 이름 + 시세 + aliases */}
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0 mr-3">
                            <h3 className="font-serif text-lg font-bold text-[#111] leading-tight">
                              {morph.name_korean}
                            </h3>
                            <p className="text-xs text-[#C8C8C4] mt-0.5">{morph.name_english}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-[10px] text-[#C8C8C4] tracking-wider mb-0.5">국내 시세</p>
                            <p className="font-serif text-base font-bold text-[#111]">
                              {(morph.price_min / 10000).toFixed(0)}~{(morph.price_max / 10000).toFixed(0)}만원
                            </p>
                          </div>
                        </div>
                        {/* 별칭 칩 */}
                        {morph.aliases?.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap mt-2">
                            {morph.aliases.map(a => (
                              <span
                                key={a}
                                className="text-[10px] bg-[#F7F7F5] text-[#9A9A94] px-2 py-0.5 rounded border border-[#E8E8E4]"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>

                    {/* 펼침 상세 */}
                    {open && (
                      <div className="border-t border-[#E8E8E4] px-5 pb-5 pt-4 flex flex-col gap-4">
                        {/* 외형 */}
                        <div>
                          <p className="text-[10px] text-[#9A9A94] tracking-[0.15em] font-semibold uppercase mb-2">외형</p>
                          <p className="text-sm text-[#111] leading-relaxed">{morph.appearance}</p>
                        </div>

                        {/* 설명 */}
                        <div>
                          <p className="text-[10px] text-[#9A9A94] tracking-[0.15em] font-semibold uppercase mb-2">설명</p>
                          <p className="text-sm text-[#111] leading-relaxed">{morph.description}</p>
                        </div>

                        {/* 유전자 구성 */}
                        {morph.genes?.length > 0 && (
                          <div>
                            <p className="text-[10px] text-[#9A9A94] tracking-[0.15em] font-semibold uppercase mb-2">유전자 구성</p>
                            <div className="flex flex-col gap-2">
                              {morph.genes.map((gene, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2 bg-[#F7F7F5] border border-[#E8E8E4] rounded-lg px-3 py-2"
                                >
                                  <span className="text-sm font-semibold text-[#111]">{gene}</span>
                                  {morph.gene_types?.[i] && (
                                    <span className="text-[10px] text-[#9A9A94] tracking-wider ml-auto">
                                      {morph.gene_types[i]}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 색상 팔레트 */}
                        <div>
                          <p className="text-[10px] text-[#9A9A94] tracking-[0.15em] font-semibold uppercase mb-2">색상 팔레트</p>
                          <div className="flex gap-3">
                            {[
                              { color: morph.color_main,      label: '주색' },
                              { color: morph.color_secondary, label: '보조색' },
                              { color: morph.color_accent,    label: '강조색' },
                            ].map(({ color, label }) => (
                              <div key={label} className="flex flex-col items-center gap-1">
                                <div
                                  className="w-10 h-10 rounded-lg border border-[#E8E8E4]"
                                  style={{ backgroundColor: color }}
                                />
                                <p className="text-[9px] text-[#C8C8C4]">{label}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 시세 상세 */}
                        <div className="bg-[#F7F7F5] rounded-xl p-4">
                          <p className="text-[10px] text-[#9A9A94] tracking-[0.15em] font-semibold uppercase mb-2">국내 예상 시세</p>
                          <p className="font-serif text-2xl font-bold text-[#111]">
                            {morph.price_min.toLocaleString()}
                            <span className="text-[#9A9A94] text-xl"> — </span>
                            {morph.price_max.toLocaleString()}원
                          </p>
                        </div>

                        <Link
                          href={`/deals?q=${encodeURIComponent(morph.name_korean)}`}
                          className="w-full bg-[#111] text-white rounded-lg py-3 text-sm font-bold text-center block"
                          onClick={e => e.stopPropagation()}
                        >
                          이 모프 타임딜 보러가기
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
