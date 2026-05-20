import { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CertificateCard from '../components/CertificateCard';
import type {
  Certificate,
  IssuanceForm,
  SpeciesId,
  Gender,
  MorphGene,
  GeneticsOffspring,
  GeneticType,
  ZygosityRecessive,
  ZygosityCodominant,
} from '../types';

// ─── 상수 데이터 ──────────────────────────────────────────────────────────────

const SPECIES_OPTIONS: { id: SpeciesId; label: string }[] = [
  { id: 'crestie',  label: '크레스티드 게코' },
  { id: 'leopard',  label: '레오파드 게코' },
  { id: 'beardie',  label: '비어디드 드래곤' },
  { id: 'gargoyle', label: '가고일 게코' },
  { id: 'other',    label: '기타' },
];

const GENDER_OPTIONS: Gender[] = ['수컷', '암컷', '미확인'];

// 더미 인증서 4개 — 실제 위키미디어 이미지 사용
const DUMMY_CERTS: Certificate[] = [
  {
    id: 'GLINT-2026-0001',
    shopName: '달빛 파충류샵',
    animalName: '소나기',
    species: 'crestie',
    speciesLabel: '크레스티드 게코',
    morphName: '핀스트라이프 달마시안',
    gender: '수컷',
    hatchDate: '2025-03-14',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Correlophus_ciliatus01.jpg/640px-Correlophus_ciliatus01.jpg',
    isPremium: true,
    issuedAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 'GLINT-2026-0002',
    shopName: '에메랄드 렙타일',
    animalName: '달빛이',
    species: 'leopard',
    speciesLabel: '레오파드 게코',
    morphName: '블리자드',
    gender: '암컷',
    hatchDate: '2025-06-20',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Pet_Leopard_Gecko.PNG/640px-Pet_Leopard_Gecko.PNG',
    isPremium: false,
    issuedAt: '2026-02-05T12:00:00Z',
  },
  {
    id: 'GLINT-2026-0003',
    shopName: '정글 파충류 전문점',
    animalName: '구름',
    species: 'beardie',
    speciesLabel: '비어디드 드래곤',
    morphName: '레더백 하이포',
    gender: '수컷',
    hatchDate: '2024-11-08',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Eastern_Bearded_Dragon_defence.JPG/640px-Eastern_Bearded_Dragon_defence.JPG',
    isPremium: true,
    issuedAt: '2026-03-18T15:00:00Z',
  },
  {
    id: 'GLINT-2026-0004',
    shopName: '글린트 직영점',
    animalName: '모래알',
    species: 'leopard',
    speciesLabel: '레오파드 게코',
    morphName: '트렘퍼 알비노 맥스노우',
    gender: '암컷',
    hatchDate: '2025-09-01',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Eublepharis_macularius_-_Blizzard.JPG/640px-Eublepharis_macularius_-_Blizzard.JPG',
    isPremium: false,
    issuedAt: '2026-04-22T10:00:00Z',
  },
];

// ─── 유전자 데이터 ─────────────────────────────────────────────────────────────

const MORPH_GENES: Record<SpeciesId, MorphGene[]> = {
  leopard: [
    { id: 'normal',   name: '노말',            type: 'normal',      gene: '',   description: '야생형 표현형' },
    { id: 'blizzard', name: '블리자드',         type: 'recessive',   gene: 'Bz', description: '열성 단순 유전' },
    { id: 'tremper',  name: '트렘퍼 알비노',    type: 'recessive',   gene: 'Ta', description: '열성 단순 유전' },
    { id: 'eclipse',  name: '이클립스',         type: 'recessive',   gene: 'Ec', description: '열성 단순 유전' },
    { id: 'macksnow', name: '맥스노우',         type: 'codominant',  gene: 'Ms', description: '공우성 — 슈퍼 스노우 있음' },
    { id: 'bold',     name: '볼드 스트라이프',  type: 'recessive',   gene: 'Bs', description: '열성 단순 유전' },
    { id: 'murphy',   name: '머피 패턴리스',    type: 'recessive',   gene: 'Mp', description: '열성 단순 유전' },
    { id: 'lavender', name: '라벤더',           type: 'recessive',   gene: 'Lv', description: '열성 단순 유전' },
  ],
  crestie: [
    { id: 'normal',      name: '노말/올리브',      type: 'normal',     gene: '',   description: '야생형' },
    { id: 'flame',       name: '플레임',           type: 'polygenic',  gene: '',   description: '선택 교배 (다인자)' },
    { id: 'harlequin',   name: '할리퀸',           type: 'polygenic',  gene: '',   description: '선택 교배 (다인자)' },
    { id: 'pinstripe',   name: '핀스트라이프',     type: 'dominant',   gene: 'Ps', description: '우성 단순 유전' },
    { id: 'axanthic',    name: '엑산틱',           type: 'recessive',  gene: 'Ax', description: '열성 단순 유전' },
    { id: 'phantom',     name: '팬텀',             type: 'recessive',  gene: 'Ph', description: '열성 단순 유전' },
  ],
  beardie: [
    { id: 'normal',      name: '노말',             type: 'normal',     gene: '',   description: '야생형' },
    { id: 'leatherback', name: '레더백',           type: 'codominant', gene: 'Lb', description: '공우성 — 실크백 있음' },
    { id: 'dunner',      name: '더너',             type: 'dominant',   gene: 'Du', description: '우성 단순 유전' },
    { id: 'hypo',        name: '하이포멜라닌',     type: 'recessive',  gene: 'Hy', description: '열성 단순 유전' },
    { id: 'trans',       name: '트랜스루센트',     type: 'recessive',  gene: 'Tr', description: '열성 단순 유전' },
    { id: 'zero',        name: '제로',             type: 'recessive',  gene: 'Zr', description: '열성 단순 유전' },
  ],
  gargoyle: [
    { id: 'normal',   name: '노말',   type: 'normal',    gene: '', description: '야생형' },
    { id: 'stripe',   name: '스트라이프', type: 'polygenic', gene: '', description: '선택 교배 (다인자)' },
    { id: 'blotched', name: '블로치드', type: 'polygenic', gene: '', description: '선택 교배 (다인자)' },
  ],
  other: [
    { id: 'normal', name: '노말', type: 'normal', gene: '', description: '야생형' },
  ],
};

// ─── 유전율 계산 함수 ──────────────────────────────────────────────────────────

function calcRecessive(
  p1: ZygosityRecessive,
  p2: ZygosityRecessive,
  morphName: string
): GeneticsOffspring[] {
  // 열성 유전자 심볼: v = recessive, V = dominant wild-type
  // visual = vv, het = Vv, normal = VV
  const alleles: Record<ZygosityRecessive, [string, string]> = {
    visual: ['v', 'v'],
    het:    ['V', 'v'],
    normal: ['V', 'V'],
  };
  const a1 = alleles[p1];
  const a2 = alleles[p2];
  const combos = [
    `${a1[0]}${a2[0]}`,
    `${a1[0]}${a2[1]}`,
    `${a1[1]}${a2[0]}`,
    `${a1[1]}${a2[1]}`,
  ];
  const counts = { visual: 0, het: 0, normal: 0 };
  combos.forEach((c) => {
    if (c === 'vv') counts.visual++;
    else if (c.includes('v')) counts.het++;
    else counts.normal++;
  });
  const results: GeneticsOffspring[] = [];
  if (counts.visual > 0)
    results.push({ label: `비주얼 ${morphName}`, probability: counts.visual * 25, isVisual: true, isHet: false });
  if (counts.het > 0)
    results.push({ label: `헤테로 ${morphName}`, probability: counts.het * 25, isVisual: false, isHet: true });
  if (counts.normal > 0)
    results.push({ label: '노말 (헤테로 없음)', probability: counts.normal * 25, isVisual: false, isHet: false });
  return results;
}

function calcCodominant(
  p1: ZygosityCodominant,
  p2: ZygosityCodominant,
  morphName: string,
  superName: string
): GeneticsOffspring[] {
  // codominant: C = gene allele, c = wild-type
  // super = CC, visual = Cc, normal = cc
  const alleles: Record<ZygosityCodominant, [string, string]> = {
    super:  ['C', 'C'],
    visual: ['C', 'c'],
    normal: ['c', 'c'],
  };
  const a1 = alleles[p1];
  const a2 = alleles[p2];
  const combos = [
    `${a1[0]}${a2[0]}`,
    `${a1[0]}${a2[1]}`,
    `${a1[1]}${a2[0]}`,
    `${a1[1]}${a2[1]}`,
  ];
  const counts = { super: 0, visual: 0, normal: 0 };
  combos.forEach((c) => {
    if (c === 'CC') counts.super++;
    else if (c.includes('C')) counts.visual++;
    else counts.normal++;
  });
  const results: GeneticsOffspring[] = [];
  if (counts.super > 0)
    results.push({ label: `슈퍼 ${superName}`, probability: counts.super * 25, isVisual: true, isHet: false });
  if (counts.visual > 0)
    results.push({ label: `비주얼 ${morphName}`, probability: counts.visual * 25, isVisual: true, isHet: false });
  if (counts.normal > 0)
    results.push({ label: '노말', probability: counts.normal * 25, isVisual: false, isHet: false });
  return results;
}

// ─── 일련번호 생성 ─────────────────────────────────────────────────────────────

let certCounter = 5;
function generateCertId(): string {
  const num = String(certCounter++).padStart(4, '0');
  return `GLINT-2026-${num}`;
}

// ─── 탭 1: 보증서 발급 폼 ────────────────────────────────────────────────────

interface IssuanceTabProps {
  onIssue: (cert: Certificate) => void;
}

function IssuanceTab({ onIssue }: IssuanceTabProps) {
  const uid = useId();
  const [form, setForm] = useState<IssuanceForm>({
    shopName: '', animalName: '', species: '', morphName: '',
    gender: '', hatchDate: '', imageUrl: '', isPremium: false,
  });
  const [toast, setToast] = useState(false);

  function update<K extends keyof IssuanceForm>(key: K, val: IssuanceForm[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function canIssue() {
    return (
      form.shopName.trim() &&
      form.animalName.trim() &&
      form.species &&
      form.morphName.trim() &&
      form.gender
    );
  }

  function handleIssue() {
    if (!canIssue()) return;
    const speciesLabel = SPECIES_OPTIONS.find((s) => s.id === form.species)?.label ?? '';
    const cert: Certificate = {
      id: generateCertId(),
      shopName: form.shopName.trim(),
      animalName: form.animalName.trim(),
      species: form.species as SpeciesId,
      speciesLabel,
      morphName: form.morphName.trim(),
      gender: form.gender as Gender,
      hatchDate: form.hatchDate,
      imageUrl: form.imageUrl.trim(),
      isPremium: form.isPremium,
      issuedAt: new Date().toISOString(),
    };
    onIssue(cert);
    setToast(true);
    setTimeout(() => setToast(false), 2800);
    setForm({ shopName: '', animalName: '', species: '', morphName: '', gender: '', hatchDate: '', imageUrl: '', isPremium: false });
  }

  const speciesLabel = SPECIES_OPTIONS.find((s) => s.id === form.species)?.label ?? '';
  const previewReady = !!form.animalName && !!form.species;

  const previewCert: Certificate | null = previewReady
    ? {
        id: 'GLINT-2026-미리보기',
        shopName: form.shopName || '샵 이름 입력',
        animalName: form.animalName || '개체 이름',
        species: form.species as SpeciesId,
        speciesLabel,
        morphName: form.morphName || '모프명 입력',
        gender: (form.gender as Gender) || '미확인',
        hatchDate: form.hatchDate,
        imageUrl: form.imageUrl,
        isPremium: form.isPremium,
        issuedAt: new Date().toISOString(),
      }
    : null;

  const labelClass = 'block text-[11px] font-sans font-semibold tracking-widest text-slate-400 uppercase mb-1.5';
  const inputClass = 'w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-sans text-slate-800 placeholder-slate-300 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all duration-200';

  return (
    <div className="relative">
      {/* 토스트 알림 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-teal-600 text-white px-5 py-3 rounded-2xl shadow-lg"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-sans font-semibold">보증서가 발급되었습니다 — 지갑에서 확인하세요</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* 왼쪽: 입력 폼 */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-7 space-y-5">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-800 mb-1">보증서 즉시 발급</h2>
            <p className="text-sm font-sans text-slate-400">아래 정보를 입력하면 오른쪽에 실시간으로 미리보기됩니다</p>
          </div>

          {/* 발급 샵 이름 */}
          <div>
            <label htmlFor={`${uid}-shop`} className={labelClass}>발급 샵 이름</label>
            <input
              id={`${uid}-shop`}
              type="text"
              value={form.shopName}
              onChange={(e) => update('shopName', e.target.value)}
              placeholder="예: 달빛 파충류샵"
              className={inputClass}
            />
          </div>

          {/* 개체 이름 + 종 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={`${uid}-name`} className={labelClass}>개체 이름 *</label>
              <input
                id={`${uid}-name`}
                type="text"
                value={form.animalName}
                onChange={(e) => update('animalName', e.target.value)}
                placeholder="예: 소나기"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor={`${uid}-species`} className={labelClass}>종 *</label>
              <select
                id={`${uid}-species`}
                value={form.species}
                onChange={(e) => update('species', e.target.value as SpeciesId | '')}
                className={inputClass}
              >
                <option value="">선택하세요</option>
                {SPECIES_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 모프명 + 성별 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={`${uid}-morph`} className={labelClass}>모프명 *</label>
              <input
                id={`${uid}-morph`}
                type="text"
                value={form.morphName}
                onChange={(e) => update('morphName', e.target.value)}
                placeholder="예: 블리자드"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor={`${uid}-gender`} className={labelClass}>성별 *</label>
              <select
                id={`${uid}-gender`}
                value={form.gender}
                onChange={(e) => update('gender', e.target.value as Gender | '')}
                className={inputClass}
              >
                <option value="">선택하세요</option>
                {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* 해칭일 */}
          <div>
            <label htmlFor={`${uid}-hatch`} className={labelClass}>해칭일</label>
            <input
              id={`${uid}-hatch`}
              type="date"
              value={form.hatchDate}
              onChange={(e) => update('hatchDate', e.target.value)}
              className={inputClass}
            />
          </div>

          {/* 이미지 URL */}
          <div>
            <label htmlFor={`${uid}-img`} className={labelClass}>개체 사진 URL</label>
            <input
              id={`${uid}-img`}
              type="url"
              value={form.imageUrl}
              onChange={(e) => update('imageUrl', e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </div>

          {/* 프리미엄 인증 체크박스 */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100">
            <input
              id={`${uid}-premium`}
              type="checkbox"
              checked={form.isPremium}
              onChange={(e) => update('isPremium', e.target.checked)}
              className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
            />
            <label htmlFor={`${uid}-premium`} className="cursor-pointer">
              <span className="text-sm font-sans font-semibold text-amber-800">프리미엄 인증 개체</span>
              <span className="block text-xs font-sans text-amber-600 mt-0.5">
                골드 아우라 보더 및 PREMIUM 배지가 부여됩니다
              </span>
            </label>
          </div>

          {/* 발급 버튼 */}
          <button
            onClick={handleIssue}
            disabled={!canIssue()}
            className="w-full rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-sans font-bold text-sm py-4 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            디지털 보증서 즉시 발급
          </button>
        </div>

        {/* 오른쪽: 라이브 프리뷰 */}
        <div className="sticky top-24">
          <h3 className="text-xs font-sans font-semibold tracking-widest text-slate-400 uppercase mb-4 text-center">
            실시간 미리보기
          </h3>
          <AnimatePresence mode="wait">
            {previewCert ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <CertificateCard cert={previewCert} compact />
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 flex flex-col items-center justify-center gap-4 min-h-[360px] cert-bg"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-sans font-semibold text-slate-400">보증서 미리보기</p>
                  <p className="text-xs font-sans text-slate-300 mt-1">
                    개체 이름과 종을 입력하면<br />보증서가 실시간으로 생성됩니다
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── 탭 2: 보증서 지갑 ───────────────────────────────────────────────────────

interface WalletTabProps {
  newCerts: Certificate[];
}

function WalletTab({ newCerts }: WalletTabProps) {
  const allCerts = [...newCerts, ...DUMMY_CERTS];

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs font-sans tracking-[0.3em] text-teal-600 uppercase mb-1">디지털 지갑</p>
          <h2 className="font-display text-3xl font-bold text-slate-800">내 보증서</h2>
        </div>
        <span className="text-sm font-sans text-slate-400">
          총 <strong className="text-slate-700">{allCerts.length}</strong>건
        </span>
      </div>

      {allCerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-300">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm font-sans">발급된 보증서가 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {allCerts.map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <CertificateCard cert={cert} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 탭 3: 유전율 계산기 ─────────────────────────────────────────────────────

function GeneticsTab() {
  const [species, setSpecies] = useState<SpeciesId>('leopard');
  const [morph1Id, setMorph1Id] = useState<string>('normal');
  const [morph2Id, setMorph2Id] = useState<string>('normal');
  const [zyg1R, setZyg1R] = useState<ZygosityRecessive>('visual');
  const [zyg2R, setZyg2R] = useState<ZygosityRecessive>('visual');
  const [zyg1C, setZyg1C] = useState<ZygosityCodominant>('visual');
  const [zyg2C, setZyg2C] = useState<ZygosityCodominant>('visual');
  const [results, setResults] = useState<GeneticsOffspring[] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [calculated, setCalculated] = useState(false);

  const morphList = MORPH_GENES[species] ?? [];
  const morph1 = morphList.find((m) => m.id === morph1Id);
  const morph2 = morphList.find((m) => m.id === morph2Id);

  function handleSpeciesChange(s: SpeciesId) {
    setSpecies(s);
    setMorph1Id('normal');
    setMorph2Id('normal');
    setResults(null);
    setNotice(null);
    setCalculated(false);
  }

  function handleCalculate() {
    if (!morph1 || !morph2) return;
    setCalculated(true);

    // 같은 유전자인지, 다른 유전자인지 체크
    const type1 = morph1.type as GeneticType;
    const type2 = morph2.type as GeneticType;

    // 노말 × 노말
    if (type1 === 'normal' && type2 === 'normal') {
      setResults([{ label: '노말', probability: 100, isVisual: false, isHet: false }]);
      setNotice(null);
      return;
    }

    // 다인자(polygenic) 조합 안내
    if (type1 === 'polygenic' || type2 === 'polygenic') {
      setResults(null);
      setNotice(
        '다인자 유전 형질은 단순 퍼네트 계산이 불가합니다. 부모의 표현 강도에 따라 자손의 패턴이 결정되며, 경험 있는 브리더의 선택 교배가 필요합니다.'
      );
      return;
    }

    // 서로 다른 유전자 조합 (독립 유전 가정)
    if (morph1Id !== morph2Id) {
      setResults(null);
      setNotice(
        '두 모프의 유전자가 독립적으로 분리됩니다. 각 유전자의 결합 확률이 곱해지므로, 더블 비주얼·콤보 모프 출현 확률은 낮아집니다. 단일 유전자 결과를 각각 확인하세요.'
      );
      return;
    }

    // 동일 유전자 조합
    if (type1 === 'recessive') {
      const r = calcRecessive(zyg1R, zyg2R, morph1.name);
      setResults(r);
      setNotice(null);
    } else if (type1 === 'codominant') {
      const superMap: Record<string, string> = {
        macksnow: '슈퍼 스노우',
        leatherback: '실크백',
      };
      const superLabel = superMap[morph1Id] ?? `슈퍼 ${morph1.name}`;
      const r = calcCodominant(zyg1C, zyg2C, morph1.name, superLabel);
      setResults(r);
      setNotice(null);
    } else if (type1 === 'dominant') {
      setResults(null);
      setNotice('우성 유전자는 부모 중 한 마리가 보유하면 자손에게 50% 확률로 발현됩니다.');
    } else {
      setResults([{ label: '노말', probability: 100, isVisual: false, isHet: false }]);
      setNotice(null);
    }
  }

  const selectClass =
    'w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-sans text-slate-700 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all duration-200';

  const progressColor = (o: GeneticsOffspring) => {
    if (o.isVisual) return 'from-teal-500 to-emerald-500';
    if (o.isHet) return 'from-sky-400 to-teal-400';
    return 'from-slate-300 to-slate-200';
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-sans tracking-[0.3em] text-teal-600 uppercase mb-1">유전율 시뮬레이터</p>
        <h2 className="font-display text-3xl font-bold text-slate-800">모프 유전 계산기</h2>
        <p className="text-sm font-sans text-slate-400 mt-2">
          부모 모프를 선택하고 조합하면 자손의 출현 확률을 시각화합니다
        </p>
      </div>

      {/* 종 선택 */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 mb-6">
        <p className="text-xs font-sans font-semibold tracking-widest text-slate-400 uppercase mb-4">종 선택</p>
        <div className="flex flex-wrap gap-2">
          {SPECIES_OPTIONS.slice(0, 4).map((s) => (
            <button
              key={s.id}
              onClick={() => handleSpeciesChange(s.id)}
              className={`px-4 py-2 rounded-full text-sm font-sans font-semibold transition-all duration-200 ${
                species === s.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 부모 선택 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* 부모 1 */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-[10px] font-bold font-sans">♀</span>
            <p className="text-xs font-sans font-semibold tracking-widest text-slate-400 uppercase">어미 (모체)</p>
          </div>
          <div>
            <label className="block text-[11px] font-sans text-slate-400 mb-1.5">모프</label>
            <select value={morph1Id} onChange={(e) => { setMorph1Id(e.target.value); setResults(null); setCalculated(false); }} className={selectClass}>
              {morphList.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          {morph1 && morph1.type === 'recessive' && (
            <div>
              <label className="block text-[11px] font-sans text-slate-400 mb-1.5">접합도</label>
              <select value={zyg1R} onChange={(e) => { setZyg1R(e.target.value as ZygosityRecessive); setResults(null); setCalculated(false); }} className={selectClass}>
                <option value="visual">비주얼 (열성 발현)</option>
                <option value="het">헤테로 (보인자)</option>
                <option value="normal">노말 (유전자 없음)</option>
              </select>
            </div>
          )}
          {morph1 && morph1.type === 'codominant' && (
            <div>
              <label className="block text-[11px] font-sans text-slate-400 mb-1.5">접합도</label>
              <select value={zyg1C} onChange={(e) => { setZyg1C(e.target.value as ZygosityCodominant); setResults(null); setCalculated(false); }} className={selectClass}>
                <option value="super">슈퍼 (동형접합)</option>
                <option value="visual">비주얼 (이형접합)</option>
                <option value="normal">노말</option>
              </select>
            </div>
          )}
          {morph1 && (
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-[10px] font-sans text-slate-400">{morph1.description}</p>
            </div>
          )}
        </div>

        {/* 부모 2 */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 text-[10px] font-bold font-sans">♂</span>
            <p className="text-xs font-sans font-semibold tracking-widest text-slate-400 uppercase">아비 (부체)</p>
          </div>
          <div>
            <label className="block text-[11px] font-sans text-slate-400 mb-1.5">모프</label>
            <select value={morph2Id} onChange={(e) => { setMorph2Id(e.target.value); setResults(null); setCalculated(false); }} className={selectClass}>
              {morphList.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          {morph2 && morph2.type === 'recessive' && (
            <div>
              <label className="block text-[11px] font-sans text-slate-400 mb-1.5">접합도</label>
              <select value={zyg2R} onChange={(e) => { setZyg2R(e.target.value as ZygosityRecessive); setResults(null); setCalculated(false); }} className={selectClass}>
                <option value="visual">비주얼 (열성 발현)</option>
                <option value="het">헤테로 (보인자)</option>
                <option value="normal">노말 (유전자 없음)</option>
              </select>
            </div>
          )}
          {morph2 && morph2.type === 'codominant' && (
            <div>
              <label className="block text-[11px] font-sans text-slate-400 mb-1.5">접합도</label>
              <select value={zyg2C} onChange={(e) => { setZyg2C(e.target.value as ZygosityCodominant); setResults(null); setCalculated(false); }} className={selectClass}>
                <option value="super">슈퍼 (동형접합)</option>
                <option value="visual">비주얼 (이형접합)</option>
                <option value="normal">노말</option>
              </select>
            </div>
          )}
          {morph2 && (
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-[10px] font-sans text-slate-400">{morph2.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* 계산 버튼 */}
      <button
        onClick={handleCalculate}
        className="w-full rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-sans font-bold text-sm py-4 mb-8 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        유전 조합 계산하기
      </button>

      {/* 결과 */}
      <AnimatePresence mode="wait">
        {calculated && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-7"
          >
            <p className="text-xs font-sans font-semibold tracking-widest text-slate-400 uppercase mb-6">자손 출현 확률</p>

            {notice && (
              <div className="rounded-2xl bg-amber-50 border border-amber-100 px-5 py-4 text-sm font-sans text-amber-800 leading-relaxed">
                {notice}
              </div>
            )}

            {results && results.length > 0 && (
              <div className="space-y-4">
                {results.map((o) => (
                  <div key={o.label}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {o.isVisual && (
                          <span className="text-[10px] font-sans font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full tracking-widest">비주얼</span>
                        )}
                        {o.isHet && (
                          <span className="text-[10px] font-sans font-bold bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full tracking-widest">헤테로</span>
                        )}
                        {!o.isVisual && !o.isHet && (
                          <span className="text-[10px] font-sans font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full tracking-widest">노말</span>
                        )}
                        <span className="text-sm font-sans font-semibold text-slate-700">{o.label}</span>
                      </div>
                      <span className="text-lg font-display font-bold text-teal-600">{o.probability}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${progressColor(o)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${o.probability}%` }}
                        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                ))}

                <p className="text-[11px] font-sans text-slate-300 pt-2">
                  * 단일 유전자 멘델 법칙 기준. 실제 자손은 표본 크기에 따라 달라질 수 있습니다.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── 탭 정의 ──────────────────────────────────────────────────────────────────

type TabId = 'issue' | 'wallet' | 'genetics';

interface TabDef {
  id: TabId;
  label: string;
  sub: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  {
    id: 'issue',
    label: '보증서 발급',
    sub: '샵 전용',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'wallet',
    label: '디지털 지갑',
    sub: '유저 전용',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    id: 'genetics',
    label: '유전 계산기',
    sub: '무료 제공',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
];

// ─── 메인 대시보드 ────────────────────────────────────────────────────────────

export default function MainDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('issue');
  const [issuedCerts, setIssuedCerts] = useState<Certificate[]>([]);

  function handleIssue(cert: Certificate) {
    setIssuedCerts((prev) => [cert, ...prev]);
    // 0.5초 딜레이 후 지갑 탭으로 이동
    setTimeout(() => setActiveTab('wallet'), 600);
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* ── 히어로 헤더 ───────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[11px] font-sans tracking-[0.45em] text-teal-600 uppercase mb-3">
              Digital Certificate Platform for Reptile Breeders
            </p>
            <h1 className="font-display text-5xl font-bold text-slate-900 leading-tight mb-3">
              파충류 디지털 보증서
            </h1>
            <p className="text-base font-sans text-slate-500 max-w-xl leading-relaxed">
              분양 개체의 진정성을 증명하는 프리미엄 디지털 인증서를 즉시 발급하고, 명품처럼 소장하세요.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── 탭 네비게이션 ──────────────────────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2.5 px-6 py-4 text-sm font-sans font-medium transition-colors duration-200 border-b-2 ${
                  activeTab === tab.id
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
                }`}
              >
                <span className={activeTab === tab.id ? 'text-teal-600' : 'text-slate-400'}>
                  {tab.icon}
                </span>
                <span className="hidden sm:block">{tab.label}</span>
                <span className="hidden lg:block text-[10px] tracking-widest text-slate-300 font-normal uppercase ml-0.5">
                  {tab.sub}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 탭 콘텐츠 ─────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeTab === 'issue'    && <IssuanceTab onIssue={handleIssue} />}
            {activeTab === 'wallet'   && <WalletTab newCerts={issuedCerts} />}
            {activeTab === 'genetics' && <GeneticsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
