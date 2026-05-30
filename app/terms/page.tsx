'use client';
export default function TermsPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px', fontFamily: 'inherit', lineHeight: 1.8, color: '#111' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>이용약관</h1>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 40 }}>시행일자: 2026년 5월 28일</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>제1조 (목적)</h2>
        <p>본 약관은 글린트 아카이브(이하 "서비스")가 제공하는 파충류 AI 모프 감정, 종 도감, 사육 일지 등 제반 서비스의 이용과 관련하여 서비스와 이용자 간의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>제2조 (서비스 이용)</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>비회원: 하루 2회 AI 모프 감정 무료 이용</li>
          <li>회원: AI 모프 감정 무제한 이용, 사육 일지·여권 기능 이용 가능</li>
          <li>서비스는 13세 미만 아동의 회원가입을 제한합니다</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>제3조 (AI 감정 결과의 한계)</h2>
        <p>AI 분석 결과는 참고 목적의 정보로, 정확성을 보장하지 않습니다. 실제 거래·의료 결정에 활용 시 전문 브리더 또는 수의사의 확인을 권장하며, 서비스는 분석 결과로 인한 손해에 책임을 지지 않습니다.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>제4조 (금지 행위)</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>타인의 계정 도용 또는 부정 접근</li>
          <li>서비스 운영을 방해하는 행위 (DDoS, 크롤링 등)</li>
          <li>부정한 방법으로 무료 횟수 제한 우회</li>
          <li>불법적인 동물 거래 정보 게시</li>
          <li>타인의 저작권·초상권을 침해하는 이미지 업로드</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>제5조 (지식재산권)</h2>
        <p>서비스가 제공하는 콘텐츠(도감 데이터, UI, 브랜드 등)의 저작권은 서비스에 귀속됩니다. 이용자가 업로드한 이미지의 저작권은 이용자에게 있으며, 서비스는 기능 제공 목적으로만 사용합니다.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>제6조 (서비스 중단 및 변경)</h2>
        <p>서비스는 시스템 점검, 증설, 기술적 문제 등으로 서비스 제공을 일시적으로 중단할 수 있으며, 이에 대해 이용자에게 사전 공지합니다. 불가피한 사유가 있는 경우 사전 공지 없이 중단될 수 있습니다.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>제7조 (면책조항)</h2>
        <p>서비스는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력으로 인해 서비스를 제공할 수 없는 경우 책임을 지지 않습니다. AI 감정 결과의 오류로 인한 거래 손실에 대해서도 책임을 지지 않습니다.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>제8조 (준거법 및 관할법원)</h2>
        <p>본 약관은 대한민국 법령에 따라 규율되며, 서비스 이용으로 발생한 분쟁에 대한 소송은 민사소송법의 규정에 따른 법원을 관할법원으로 합니다.</p>
      </section>

      <p style={{ color: '#999', fontSize: 13, borderTop: '1px solid #eee', paddingTop: 24 }}>
        본 약관은 2026년 5월 28일부터 적용됩니다.
      </p>
    </div>
  );
}
