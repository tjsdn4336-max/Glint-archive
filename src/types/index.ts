// ─── 디지털 보증서 타입 ────────────────────────────────────────────────────────

export type SpeciesId = 'crestie' | 'leopard' | 'beardie' | 'gargoyle' | 'other';
export type Gender = '수컷' | '암컷' | '미확인';

export interface Certificate {
  id: string;                    // GLINT-YYYY-NNNN
  shopName: string;              // 발급 샵 이름
  animalName: string;            // 개체 이름
  species: SpeciesId;            // 종
  speciesLabel: string;          // 한글 종명
  morphName: string;             // 모프명
  gender: Gender;                // 성별
  hatchDate: string;             // 해칭일 (YYYY-MM-DD)
  imageUrl: string;              // 개체 사진 URL
  isPremium: boolean;            // 프리미엄 인증 여부
  issuedAt: string;              // 발급일 (ISO)
}

// ─── 발급 폼 타입 ──────────────────────────────────────────────────────────────

export interface IssuanceForm {
  shopName: string;
  animalName: string;
  species: SpeciesId | '';
  morphName: string;
  gender: Gender | '';
  hatchDate: string;
  imageUrl: string;
  isPremium: boolean;
}

// ─── 유전자 타입 ──────────────────────────────────────────────────────────────

export type GeneticType = 'normal' | 'recessive' | 'codominant' | 'dominant' | 'polygenic';
export type ZygosityRecessive = 'visual' | 'het' | 'normal';
export type ZygosityCodominant = 'super' | 'visual' | 'normal';

export interface MorphGene {
  id: string;
  name: string;               // 한글 모프명
  type: GeneticType;
  gene: string;               // 유전자 심볼 (recessive/codominant 전용)
  description: string;        // 유전 방식 한글 설명
}

export interface GeneticsOffspring {
  label: string;              // 예: "비주얼 블리자드", "헤테로 블리자드", "노말"
  probability: number;        // 0–100 (%)
  isVisual: boolean;
  isHet: boolean;
}
