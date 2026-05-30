import Anthropic from '@anthropic-ai/sdk';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// ── 시스템 프롬프트: 3단계 모프 판별 추론 엔진 ─────────────────────────────
const SYSTEM_PROMPT = `너는 전 세계 파충류 유전학·모프·시장 트렌드를 꿰뚫고 있는 탑클래스 수석 브리더이자 AI 감정 엔진이다.
사진이 입력되면 반드시 아래 3단계 추론을 거쳐 모프를 판별하라.

[1단계: 기본 종 및 아종 동정]
실루엣·두상·비늘 형태·발바닥 흡반 유무·꼬리 두께·혀 색상을 독립 체크하여 종을 확정한다.
(예: 볏 없고 두개골 돌기 존재 → 크레스티드가 아닌 가고일로 즉시 분기)

[2단계: 시각적 형질 독립 분해 — Feature Decomposition]
· 베이스 컬러: 다크/벅스킨/오렌지/옐로우/모노톤 등
· 패턴 형태: 스트라이프/솔리드/달마시안(스팟)/패턴리스 등
· 발현 면적·위치: 측면(Lateral) 백질 채움 비율, 척추(Dorsal) 라인 컬러 대비 및 단색 유지율
· 특수 형질: 반투명(Translucent) 여부, 무늬 제거 정도(Hypo/Blizzard) 확인

[3단계: 조합 및 최종 모프명 도출 — Combination & Synthesis]
분해 형질을 유전학 및 한국/글로벌 시장 통용 명칭과 매칭하여 최종 콤보 모프명을 도출한다.
복잡한 콤보·신생 형질은 억지로 단일명을 찍지 말고 형질 나열 후 종합 명칭으로 정확히 서술하라.
사진 품질 불량 시 confidence를 "낮음"으로 설정하고 이유를 명시하라.

절대 규칙: 순수 JSON만 반환 — { 로 시작 } 로 끝. 마크다운·코드블록·설명 텍스트 절대 금지. 모든 텍스트 한국어.`;

const USER_PROMPT = `이 파충류/양서류 사진을 3단계 추론으로 분석하라.
{ 로 시작 } 로 끝나는 순수 JSON만 반환. 마크다운·코드블록 절대 금지.

{
  "identified": true,
  "confidence": "높음|중간|낮음",
  "species": {
    "korean": "종 한국어명",
    "english": "영문명",
    "scientific": "학명",
    "category": "분류 (예: 도마뱀붙이류/뱀류/양서류)"
  },
  "morph": {
    "name": "최종 판별 모프/콤보명 (한국 커뮤니티 통용명)",
    "name_english": "영문 모프명",
    "rarity": "상|중|하",
    "description": "분석된 시각적 형질 조합 상세 설명 3~4문장",
    "history": "해당 모프 유래 및 최신 트렌드 1~2문장"
  },
  "genetics": {
    "traits": ["발현 형질명 (우성/공우성/열성 유형 포함)", "..."],
    "breeding_notes": "브리딩 시 유전학적 주의사항 (치사 유전 등 포함)",
    "possible_offspring": "노말과 메이팅 시 예상 2세 발현 확률"
  },
  "market": {
    "price_min": 0,
    "price_max": 0,
    "price_trend": "상승세|안정세|하락세",
    "demand": "높음|보통|낮음",
    "price_factors": "가치 결정 핵심 포인트"
  },
  "care": {
    "difficulty": "★☆☆☆☆ 형식 별점 및 난이도 요약",
    "temperature": "적정 온도 범위 및 핫존/쿨존 세팅법",
    "humidity": "적정 습도 및 분무 주기",
    "enclosure": "추천 사육장 형태 및 최소 크기",
    "diet": "먹이 종류·급여 횟수·필수 영양제 급여법",
    "lifespan": "평균 수명",
    "special_notes": "종/모프 특유 주의사항",
    "beginner_friendly": true
  },
  "photo_quality": {
    "assessment": "좋음|보통|불량",
    "confidence_reason": "이 확신도를 부여한 구체적 시각적 근거",
    "better_photo_tips": "정확도 향상을 위한 촬영 구도·조명 팁"
  },
  "similar_morphs": [
    { "name": "유사 모프명", "difference": "이번 결과와 헷갈리기 쉬운 점 및 차이점" }
  ],
  "disclaimer": "본 AI 감정 결과는 입력된 사진 기반 참고용 수치입니다. 정확한 모프·유전 평가는 전문 브리더나 수의사 확인을 권장하며, 본 플랫폼은 거래 결과에 책임을 지지 않습니다."
}

파충류/양서류가 아닌 경우: {"identified":false,"reason":"파충류나 양서류가 확인되지 않습니다. 파충류 사진을 올려주세요."}`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY)
    return NextResponse.json({ error: 'CONFIG_ERROR', message: 'API 키가 설정되지 않았습니다.' }, { status: 500 });

  try {
    const { image, user_id, identifier } = await req.json() as { image: string; user_id?: string; identifier?: string };
    if (!image) return NextResponse.json({ error: 'NO_IMAGE' }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = (await createServerSupabaseClient()) as any;
    const today = new Date().toISOString().slice(0, 10);

    // ── 로그인 유저: 모든 제한 완전 우회 ──────────────────────────────────
    // 비로그인 게스트만 하루 2회 무료 제한 적용
    if (!user_id && identifier) {
      const { data: usage } = await sb.from('free_usage').select('count').eq('identifier', identifier).eq('date', today).maybeSingle();
      if (usage && usage.count >= 2)
        return NextResponse.json({ error: 'FREE_LIMIT', message: '하루 무료 횟수(2회)를 모두 사용했습니다.' }, { status: 402 });
    }

    // ── 이미지 파싱 ──────────────────────────────────────────────────────────
    const imageData = image.includes(',') ? image.split(',')[1] : image;
    const mimeMatch = image.match(/data:([^;]+);/);
    const mediaType = (mimeMatch?.[1] || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    if (!imageData) return NextResponse.json({ error: 'INVALID_IMAGE', message: '이미지 형식이 올바르지 않습니다.' }, { status: 400 });

    // ── Claude API 호출 ──────────────────────────────────────────────────────
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    let rawText = '';
    try {
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageData } },
            { type: 'text', text: USER_PROMPT },
          ],
        }],
      });
      rawText = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
    } catch (e) {
      console.error('Claude API error:', e instanceof Error ? e.message : String(e));
      return NextResponse.json({ error: 'API_ERROR', message: e instanceof Error ? e.message : 'AI 분석 중 오류가 발생했습니다.' }, { status: 500 });
    }

    // ── JSON 파싱 ────────────────────────────────────────────────────────────
    let result: Record<string, unknown>;
    try {
      const clean = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
      try { result = JSON.parse(clean); }
      catch { const m = clean.match(/\{[\s\S]*\}/); result = JSON.parse(m![0]); }
    } catch {
      console.error('JSON parse failed:', rawText.slice(0, 300));
      return NextResponse.json({ error: 'PARSE_ERROR', message: '분석 결과를 처리하지 못했습니다. 더 선명한 사진으로 다시 시도해주세요.' }, { status: 500 });
    }

    // ── 게스트 사용 횟수 기록 (로그인 유저는 기록만, 차감 없음) ──────────────
    if (!user_id && identifier) {
      const { data: ex } = await sb.from('free_usage').select('id,count').eq('identifier', identifier).eq('date', today).maybeSingle();
      if (ex) await sb.from('free_usage').update({ count: ex.count + 1 }).eq('id', ex.id);
      else await sb.from('free_usage').insert({ identifier, date: today, count: 1 });
    }

    await sb.from('morph_analyses').insert({ user_id: user_id ?? null, result });
    return NextResponse.json(result);

  } catch (error) {
    console.error('Analyze error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'SERVER_ERROR', message: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
