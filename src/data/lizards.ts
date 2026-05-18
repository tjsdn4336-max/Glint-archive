// ─── Types ────────────────────────────────────────────────────────────────────

export type Status = 'available' | 'reserved' | 'sold';

export interface Morph {
  id: string;
  nameKo: string;
  nameEn: string;
  price: number;
  status: Status;
  description: string;
  imageUrl: string;
  tags: string[];
}

export interface Species {
  id: string;
  nameKo: string;
  nameEn: string;
  tagline: string;
  morphs: Morph[];
}

// ─── Unsplash 고정 파충류 이미지 (photo ID 고정, 랜덤 아님) ────────────────────

const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&h=680&q=85`;

// ─── Data ──────────────────────────────────────────────────────────────────────

const SPECIES: Species[] = [
  // ── 크레스티드 게코 ─────────────────────────────────────────────────────────
  {
    id: 'crested-gecko',
    nameKo: '크레스티드 게코',
    nameEn: 'Crested Gecko',
    tagline: '부드러운 성격과 무한한 컬러 다양성 — 파충류 애호가의 첫 선택',
    morphs: [
      {
        id: 'cg-lily-white',
        nameKo: '릴리 화이트',
        nameEn: 'Lily White',
        price: 580000,
        status: 'available',
        description:
          '크레스티드 게코 중 가장 희귀하고 고가의 모프 중 하나. 등과 옆구리에 크리미한 흰색 줄기 무늬가 선명하게 발현되며, 피부 전반에 걸쳐 극도로 낮은 색소 침착을 보입니다. 정품 릴리 화이트는 최소 30% 이상의 화이트 익스프레션을 충족해야 하며, 성숙 후 발색이 더욱 또렷해지는 특성이 있습니다. 수집 가치가 매우 높아 전 세계 브리더 간 프리미엄 거래가 이루어집니다.',
        imageUrl: u('1597200381847-30ec200eeb9b'),
        tags: ['RARE', 'HIGH CONTRAST', 'COLLECTOR'],
      },
      {
        id: 'cg-extreme-harlequin',
        nameKo: '익스트림 할리퀸',
        nameEn: 'Extreme Harlequin',
        price: 320000,
        status: 'available',
        description:
          '크레스티드 게코의 대표 모프로, 등부터 옆구리까지 이어지는 고대비 패턴이 특징입니다. 베이스 컬러와 패턴 컬러 간 대비가 70% 이상 달성될 때 익스트림 등급으로 분류됩니다. 오렌지·크림·초콜릿 등 베이스에 따라 전혀 다른 인상을 주며, 패턴 커버리지가 머리부터 꼬리 끝까지 빈틈없이 이어지는 개체가 최상급으로 평가됩니다.',
        imageUrl: u('1558618666-fcd25c85cd64'),
        tags: ['HIGH CONTRAST', 'PATTERN', 'POPULAR'],
      },
      {
        id: 'cg-cappuccino',
        nameKo: '카푸치노',
        nameEn: 'Cappuccino',
        price: 180000,
        status: 'available',
        description:
          '따뜻한 갈색 계열 베이스 위에 크림빛 패턴이 얹힌 모프. 커피 음료를 연상케 하는 부드럽고 고급스러운 색감이 매력이며, 조명 조건에 따라 색조가 미묘하게 변화합니다. 성격이 온순하고 관리 난이도가 낮아 초보 파충류 사육자에게 이상적인 입문용 고급 모프로 손꼽힙니다.',
        imageUrl: u('1591005218028-7acafcf7f43f'),
        tags: ['WARM TONE', 'BEGINNER FRIENDLY'],
      },
      {
        id: 'cg-flame',
        nameKo: '플레임',
        nameEn: 'Flame',
        price: 150000,
        status: 'reserved',
        description:
          '등쪽 중심부를 따라 불꽃처럼 뻗어 나가는 밝은 컬러 스트라이프가 특징인 클래식 모프. 머리에서 꼬리 방향으로 이어지는 단일 줄기 패턴은 크레스티드 게코의 기본 모프이지만, 발색 강도와 색상 순도에 따라 가치 차이가 크게 납니다. 고발색 오렌지·레드 플레임은 수집 가치가 높습니다.',
        imageUrl: u('1580901368258-b5b60e8ab0c2'),
        tags: ['DORSAL STRIPE', 'CLASSIC'],
      },
      {
        id: 'cg-pinstripe',
        nameKo: '핀스트라이프',
        nameEn: 'Pinstripe',
        price: 220000,
        status: 'available',
        description:
          '등 위쪽 크레스트 라인을 따라 선명한 선형 발색이 이어지는 독특한 패턴. 코도미넌트 유전자를 가지며 핀스트라이프 간 교배로 슈퍼 핀스트라이프를 생산할 수 있습니다. 라인의 선명도와 연속성이 품질 평가의 핵심 기준이며, 전체 크레스트 길이에서 90% 이상 이어지는 개체가 풀 익스프레션으로 분류됩니다.',
        imageUrl: u('1614027164847-1b28cfe1df60'),
        tags: ['CO-DOMINANT', 'STRIPE', 'LINEAGE'],
      },
      {
        id: 'cg-brindle',
        nameKo: '브린들',
        nameEn: 'Brindle',
        price: 130000,
        status: 'available',
        description:
          '등과 옆구리에 불규칙하고 복잡한 혼합 무늬가 특징인 모프. 마치 대리석 결처럼 서로 다른 색조가 엉켜 자연스러운 카모플라주 패턴을 형성합니다. 개체마다 패턴이 완전히 달라 세상에 하나뿐인 디자인을 가지며, 브리더들 사이에서 창의적인 교배 프로젝트에 자주 활용됩니다.',
        imageUrl: u('1601049541-f3b86f7de977'),
        tags: ['UNIQUE PATTERN', 'NATURAL'],
      },
      {
        id: 'cg-tricolor',
        nameKo: '트라이 컬러',
        nameEn: 'Tri-Color',
        price: 290000,
        status: 'available',
        description:
          '세 가지 뚜렷한 색상이 조화롭게 발현되는 고급 모프. 머리·몸통·패턴 각 영역에서 독립적인 색상이 명확히 구분되며, 각 색상이 전체 면적의 15% 이상을 차지해야 인증됩니다. 발색이 성체까지 안정적으로 유지되어야 하며, 세 색상 모두가 채도 높게 유지되는 개체는 극히 희귀합니다.',
        imageUrl: u('1617471346271-d74abec7b81e'),
        tags: ['THREE-TONE', 'PREMIUM', 'CERTIFIED'],
      },
      {
        id: 'cg-quad-stripe',
        nameKo: '쿼드 스트라이프',
        nameEn: 'Quad Stripe',
        price: 350000,
        status: 'sold',
        description:
          '핀스트라이프의 발전형으로, 등 위쪽 두 줄과 옆구리 두 줄 총 네 개의 선명한 줄기 패턴이 발현된 희귀 모프. 네 줄 모두가 머리에서 꼬리까지 끊김 없이 이어지는 풀 익스프레션 개체는 극히 드물며, 브리더 간 높은 프리미엄으로 거래됩니다.',
        imageUrl: u('1542491026-b9eb8dfc781a'),
        tags: ['RARE', 'QUAD', 'BREEDER GRADE'],
      },
    ],
  },

  // ── 레오파드 게코 ───────────────────────────────────────────────────────────
  {
    id: 'leopard-gecko',
    nameKo: '레오파드 게코',
    nameEn: 'Leopard Gecko',
    tagline: '모프 유전학 연구가 가장 활발한 종 — 수백 가지 표현형의 집합체',
    morphs: [
      {
        id: 'lg-diablo-blanco',
        nameKo: '디아블로 블랑코',
        nameEn: 'Diablo Blanco',
        price: 450000,
        status: 'available',
        description:
          'RAPTOR와 블리자드 유전자의 복합 결과로 탄생한 슈퍼 모프. 전신 순백색 바탕에 루비 레드 또는 짙은 와인 색조의 눈이 특징이며, 피부에는 어떠한 색소나 패턴도 존재하지 않습니다. 여러 열성 유전자를 동시에 발현시켜야 하기 때문에 브리딩 난이도가 매우 높아, 완성도 높은 개체는 수집가들 사이에서 최우선 목록에 오릅니다.',
        imageUrl: u('1507620910736-7f33de8e6cd5'),
        tags: ['RUBY EYES', 'PURE WHITE', 'SUPER MORPH'],
      },
      {
        id: 'lg-tangerine',
        nameKo: '탠저린',
        nameEn: 'Tangerine',
        price: 180000,
        status: 'available',
        description:
          '레오파드 게코에서 가장 역사 깊고 인기 있는 컬러 모프 중 하나. 진한 주황빛에서 거의 붉은빛을 띠는 베이스 컬러를 기반으로, 선택적 브리딩을 통해 색의 강도가 지속적으로 높아지고 있습니다. 하이퍼 탠저린·블러드 탠저린 등 파생 라인이 존재하며 각각 색상 표현의 상한선이 다릅니다.',
        imageUrl: u('1564349683136-77e08dba1ef7'),
        tags: ['CLASSIC MORPH', 'VIBRANT', 'LINE-BRED'],
      },
      {
        id: 'lg-zero',
        nameKo: '제로',
        nameEn: 'Zero',
        price: 320000,
        status: 'available',
        description:
          '패턴을 완전히 제거한 리세시브 유전 모프. 전신에 걸쳐 어떠한 반점이나 줄기도 없는 크리미 화이트 또는 라벤더 빛 베이스가 특징입니다. 슈퍼 제로는 색소마저 크게 줄어 거의 유백색에 가까우며, 레오파드 게코 컬렉터 사이에서 가장 깔끔한 외형의 모프로 꼽힙니다.',
        imageUrl: u('1576836165612-8b9e6cb8d44a'),
        tags: ['PATTERNLESS', 'RECESSIVE', 'CLEAN'],
      },
      {
        id: 'lg-raptor',
        nameKo: '랩터',
        nameEn: 'RAPTOR',
        price: 260000,
        status: 'reserved',
        description:
          'Red Eye Albino Patternless Tremper ORange의 약자. 트렘퍼 알비노·이클립스·패턴리스 세 유전자가 결합된 컴보 모프로, 밝은 주황빛 바탕에 패턴이 최소화되고 홍채 없이 전체가 붉게 채워진 이클립스 눈을 가집니다. 눈의 발색 일관성과 오렌지 강도가 품질 평가의 핵심입니다.',
        imageUrl: u('1560715799-7fc93be8ce3c'),
        tags: ['COMBO MORPH', 'ECLIPSE EYES', 'TRI-GENE'],
      },
      {
        id: 'lg-mack-snow',
        nameKo: '맥 스노우',
        nameEn: 'Mack Snow',
        price: 150000,
        status: 'available',
        description:
          '2004년 맥 스노우 라인에서 최초 분리된 코도미넌트 모프. 어릴 때는 흑백의 강렬한 대비를 보이며 성장하면서 황색과 크림 사이의 절제된 색감으로 변합니다. 슈퍼 맥 스노우는 동형접합 발현 시 거의 완전한 흑백 패턴을 유지하며, 설원을 연상시키는 고결한 외형이 특징입니다.',
        imageUrl: u('1542491026-b9eb8dfc781a'),
        tags: ['CO-DOMINANT', 'B&W', 'LINEAGE'],
      },
      {
        id: 'lg-enigma',
        nameKo: '에니그마',
        nameEn: 'Enigma',
        price: 200000,
        status: 'available',
        description:
          '소용돌이치는 불규칙 패턴이 특징인 도미넌트 모프. 기존 레오파드 패턴을 추상화처럼 해체하는 것이 매력이지만, 에니그마 신드롬이라 불리는 신경계 이상이 일부 개체에서 관찰되어 책임 브리딩이 필요합니다. 패턴의 독창성은 레오파드 게코 중 단연 최상위입니다.',
        imageUrl: u('1614027164847-1b28cfe1df60'),
        tags: ['DOMINANT', 'SWIRL PATTERN', 'UNIQUE'],
      },
      {
        id: 'lg-bold-stripe',
        nameKo: '볼드 스트라이프',
        nameEn: 'Bold Stripe',
        price: 190000,
        status: 'available',
        description:
          '등 중앙을 가로지르는 선명하고 굵은 단일 스트라이프가 특징입니다. 일반 스트라이프 대비 줄기의 폭과 색상 농도가 두드러지며, 스트라이프 경계의 선명도가 품질 기준이 됩니다. 탠저린·알비노 등 다른 모프와의 결합 시 더욱 강렬한 시각적 효과를 발휘합니다.',
        imageUrl: u('1617471346271-d74abec7b81e'),
        tags: ['STRIPE', 'BOLD', 'COMBINABLE'],
      },
      {
        id: 'lg-blizzard',
        nameKo: '블리자드',
        nameEn: 'Blizzard',
        price: 170000,
        status: 'available',
        description:
          '완전한 패턴리스를 달성한 리세시브 모프. 순백색부터 연한 라벤더까지 다양한 배경색을 보이며, 피부 전체에 걸쳐 어떠한 반점이나 줄기도 없는 클린한 외형이 특징입니다. 디아블로 블랑코의 핵심 베이스 재료이며, 고품질 블리자드 라인은 라벤더 발색이 진할수록 희귀 가치가 높아집니다.',
        imageUrl: u('1601049541-f3b86f7de977'),
        tags: ['PATTERNLESS', 'RECESSIVE', 'BASE MORPH'],
      },
    ],
  },

  // ── 비어디드 드래곤 ─────────────────────────────────────────────────────────
  {
    id: 'bearded-dragon',
    nameKo: '비어디드 드래곤',
    nameEn: 'Bearded Dragon',
    tagline: '사람과의 친화력이 뛰어난 대형 파충류 — 표현력 풍부한 인격체',
    morphs: [
      {
        id: 'bd-citrus-tiger',
        nameKo: '시트러스 타이거',
        nameEn: 'Citrus Tiger',
        price: 280000,
        status: 'available',
        description:
          '선명한 노란빛과 주황빛의 혼합 베이스 위에 타이거 패턴이 겹쳐진 컬러 모프. 레몬에서 만다린 사이의 따뜻한 색조 스펙트럼이 발현되며, 고발색 라인은 성체에서 거의 형광에 가까운 강렬한 시트러스 컬러를 보입니다. 라인 브리딩을 통해 색상 순도를 지속적으로 높이고 있는 인기 모프입니다.',
        imageUrl: u('1504450874802-0ba2bcd9b5ae'),
        tags: ['LINE-BRED', 'VIBRANT', 'YELLOW-ORANGE'],
      },
      {
        id: 'bd-german-giant',
        nameKo: '저먼 자이언트',
        nameEn: 'German Giant',
        price: 400000,
        status: 'available',
        description:
          '비어디드 드래곤 중 최대 체장을 자랑하는 자이언트 모프. 독일 브리더 라인에서 유래했으며, 성체 기준 70cm를 초과하는 개체도 존재합니다. 체격의 웅장함이 가장 큰 매력이며 성격도 온순해 핸들링에 적극적입니다. 진정한 저먼 자이언트 인증 개체는 계보 검증이 반드시 동반됩니다.',
        imageUrl: u('1567880905822-56f8e06fe630'),
        tags: ['GIANT STRAIN', 'LARGE SIZE', 'VERIFIED'],
      },
      {
        id: 'bd-leatherback',
        nameKo: '레더백',
        nameEn: 'Leatherback',
        price: 220000,
        status: 'available',
        description:
          '등 쪽 비늘의 크기가 현저히 감소하여 피부 표면이 매끈하고 부드러운 코도미넌트 모프. 일반 개체 대비 색상이 더욱 선명하게 보이는 효과가 있으며, 비늘이 빛을 반사하지 않아 특유의 무광 질감이 매력적입니다. 슈퍼 레더백은 실크백에 근접한 극도의 매끄러운 표면을 보입니다.',
        imageUrl: u('1523117514792-3fe3cba9e6f8'),
        tags: ['CO-DOMINANT', 'SMOOTH SCALE', 'COLOR ENHANCED'],
      },
      {
        id: 'bd-silkback',
        nameKo: '실크백',
        nameEn: 'Silkback',
        price: 350000,
        status: 'reserved',
        description:
          '레더백의 슈퍼 형태(동형접합)로 비늘이 완전히 소실되어 피부가 비단처럼 매끄럽습니다. 색상이 극도로 선명하게 발현되며 시각적으로 매우 독특한 인상을 줍니다. 건조 취약성·탈피 장애·부상 위험이 높아 경험 있는 사육자에게만 권장되며, 세심한 환경 관리가 필수입니다.',
        imageUrl: u('1571348736756-d2bed9b7bf8e'),
        tags: ['SCALELESS', 'SUPER FORM', 'EXPERT ONLY'],
      },
      {
        id: 'bd-hypo',
        nameKo: '하이포멜라닉',
        nameEn: 'Hypomelanistic',
        price: 160000,
        status: 'available',
        description:
          '멜라닌 색소 생성이 억제된 리세시브 모프. 발톱과 눈이 선명히 밝아지고 전체적인 색상이 더욱 깨끗하고 밝게 발현됩니다. 다른 컬러 모프와 결합 시 채도와 명도를 동시에 향상시켜 복합 모프 프로젝트에서 핵심 재료로 활용됩니다. 클리어 네일과 밝은 복부가 진품 하이포 인증의 기준입니다.',
        imageUrl: u('1520087619250-584b0e63dfd0'),
        tags: ['RECESSIVE', 'BRIGHT', 'CLEAR NAILS'],
      },
      {
        id: 'bd-translucent',
        nameKo: '트랜스루센트',
        nameEn: 'Translucent',
        price: 250000,
        status: 'available',
        description:
          '비늘과 피부에 반투명 특성이 생기는 리세시브 모프. 눈이 짙은 블루-블랙 단색(솔리드 아이)으로 변하는 것이 가장 두드러진 특징이며, 비늘 아래 내부 구조가 옅게 비치는 독특한 시각 효과를 줍니다. 솔리드 아이의 완성도와 피부 반투명도가 품질 평가의 양대 기준입니다.',
        imageUrl: u('1607623814075-e51df9b5b4b4'),
        tags: ['RECESSIVE', 'SOLID EYES', 'SEE-THROUGH'],
      },
      {
        id: 'bd-dunner',
        nameKo: '더너',
        nameEn: 'Dunner',
        price: 190000,
        status: 'available',
        description:
          '비늘 방향성이 완전히 무작위로 변형된 도미넌트 모프. 일반 개체의 비늘이 정방향으로 배열되는 것과 달리 더너는 비늘이 사방으로 혼재되어 피부 표면에 특유의 거친 텍스처를 만듭니다. 이 특성은 컬러 발현 방식에도 영향을 미쳐 독특한 시각적 깊이감을 형성합니다.',
        imageUrl: u('1583400574819-33c6a8f3e2c9'),
        tags: ['DOMINANT', 'SCALE TEXTURE', 'DEPTH'],
      },
      {
        id: 'bd-zero',
        nameKo: '제로',
        nameEn: 'Zero',
        price: 380000,
        status: 'available',
        description:
          '패턴이 완전히 소실된 극히 드문 리세시브 모프. 전신이 크리미 화이트에서 연한 그레이 사이의 단색으로 발현되며 일체의 줄기나 반점이 없습니다. 성체가 되면서 색조가 더욱 정제되어 거의 도자기 같은 피부 표면을 보이며, 컬렉터 가치가 매우 높습니다.',
        imageUrl: u('1560715799-7fc93be8ce3c'),
        tags: ['PATTERNLESS', 'RECESSIVE', 'RARE'],
      },
    ],
  },

  // ── 가고일 게코 ─────────────────────────────────────────────────────────────
  {
    id: 'gargoyle-gecko',
    nameKo: '가고일 게코',
    nameEn: 'Gargoyle Gecko',
    tagline: '두꺼운 피부 질감과 특유의 머리 돌기 — 뉴칼레도니아의 야행성 조각품',
    morphs: [
      {
        id: 'gg-orange-stripe',
        nameKo: '오렌지 스트라이프',
        nameEn: 'Orange Stripe',
        price: 200000,
        status: 'available',
        description:
          '가고일 게코에서 가장 선명한 주황빛 발색을 자랑하는 스트라이프 패턴 모프. 등 중앙의 굵은 주황 줄기를 중심으로 짙은 갈색 또는 회색 바탕이 대비를 이루며, 고발색 라인은 성체에서 탠저린 수준의 짙은 오렌지를 보입니다. 색상 강도는 라인마다 차이가 크므로 부모 발색 확인이 중요합니다.',
        imageUrl: u('1597200381847-30ec200eeb9b'),
        tags: ['STRIPE', 'VIBRANT', 'LINE-BRED'],
      },
      {
        id: 'gg-red-stripe',
        nameKo: '레드 스트라이프',
        nameEn: 'Red Stripe',
        price: 280000,
        status: 'available',
        description:
          '가고일 게코 중 가장 붉은 색상 발현을 보이는 고가 모프. 스트라이프 패턴 내 색소가 오렌지를 넘어 진한 레드에 가까울수록 가치가 높으며, 레드 익스프레션이 꼬리 끝까지 이어지는 개체는 특히 희귀합니다. 여러 세대에 걸친 집중 라인 브리딩의 결과물입니다.',
        imageUrl: u('1558618666-fcd25c85cd64'),
        tags: ['RARE', 'DEEP RED', 'PREMIUM LINE'],
      },
      {
        id: 'gg-reticulated',
        nameKo: '레티큘레이티드',
        nameEn: 'Reticulated',
        price: 160000,
        status: 'available',
        description:
          '그물망처럼 복잡하게 얽힌 무늬가 전신에 균일하게 퍼진 패턴. 각 그물 코마다 색상 차이가 발생하여 전체적으로 입체적이고 정교한 텍스처 효과를 냅니다. 베이스 컬러에 따라 골드 레티큘레이티드·오렌지 레티큘레이티드 등 다양한 파생 패턴을 형성하며 조각품 같은 외형을 자랑합니다.',
        imageUrl: u('1591005218028-7acafcf7f43f'),
        tags: ['NET PATTERN', 'COMPLEX', 'TEXTURED'],
      },
      {
        id: 'gg-blotched',
        nameKo: '블로치드',
        nameEn: 'Blotched',
        price: 140000,
        status: 'available',
        description:
          '크고 불규칙한 반점이 등과 옆구리에 퍼져 있는 기본 패턴 유형. 자연 서식지의 가고일 게코에서 가장 흔히 나타나는 형태로, 반점의 크기·형태·색상 조합은 개체마다 완전히 다릅니다. 심플하지만 개성 있는 패턴으로 사육 목적의 입문 모프로 적합합니다.',
        imageUrl: u('1580901368258-b5b60e8ab0c2'),
        tags: ['NATURAL PATTERN', 'CLASSIC', 'BEGINNER'],
      },
      {
        id: 'gg-super-red',
        nameKo: '슈퍼 레드',
        nameEn: 'Super Red',
        price: 450000,
        status: 'reserved',
        description:
          '가고일 게코의 레드 라인 중 가장 높은 발색 등급에 해당하는 개체에 붙이는 칭호. 전신 대부분이 짙은 레드-오렌지로 뒤덮이며, 패턴보다 순수한 색상의 강도가 평가 기준입니다. 수 세대의 선택 교배 없이는 달성이 어려운 수준의 발색으로, 가고일 게코 컬렉터 간 최고 선호 모프입니다.',
        imageUrl: u('1614027164847-1b28cfe1df60'),
        tags: ['TOP GRADE', 'DEEP RED', 'COLLECTOR'],
      },
      {
        id: 'gg-yellow-flame',
        nameKo: '옐로우 플레임',
        nameEn: 'Yellow Flame',
        price: 230000,
        status: 'available',
        description:
          '가고일 게코에서 드물게 발현되는 노란빛 스트라이프 패턴 모프. 황금빛 레몬 노란색이 등 중앙을 가로지르며, 짙은 다크 브라운 베이스와의 대비가 강렬한 시각적 인상을 줍니다. 레드·오렌지 라인에 비해 상대적으로 희귀하여 수집 가치가 꾸준히 상승 중입니다.',
        imageUrl: u('1601049541-f3b86f7de977'),
        tags: ['YELLOW STRIPE', 'RARE COLOR', 'RISING VALUE'],
      },
      {
        id: 'gg-high-white',
        nameKo: '하이 화이트',
        nameEn: 'High White',
        price: 310000,
        status: 'available',
        description:
          '화이트 발색 비율을 극대화한 셀렉티브 브리딩 모프. 등과 옆구리의 패턴 영역 내 화이트가 50% 이상을 차지하며, 화이트 마킹의 선명도와 순도가 높을수록 상급으로 분류됩니다. 크레스티드 게코의 릴리 화이트와 유사한 포지셔닝으로 가고일 라인에서 가장 고가에 거래됩니다.',
        imageUrl: u('1617471346271-d74abec7b81e'),
        tags: ['HIGH WHITE', 'PREMIUM', 'SELECT LINE'],
      },
      {
        id: 'gg-olive',
        nameKo: '올리브',
        nameEn: 'Olive',
        price: 120000,
        status: 'available',
        description:
          '카키·녹색 계열의 베이스 컬러를 가진 가고일 게코 모프. 자연광 아래에서는 짙은 그린이 도는 브라운으로 보이며, 암실에서는 더욱 선명한 올리브 빛을 띱니다. 자연 서식지 색상에 가장 가까운 원시적 매력을 지니며, 어스 톤 컬러 트렌드와 맞물려 최근 재조명받고 있습니다.',
        imageUrl: u('1542491026-b9eb8dfc781a'),
        tags: ['EARTH TONE', 'NATURAL', 'UNDERRATED'],
      },
    ],
  },
];

export default SPECIES;
