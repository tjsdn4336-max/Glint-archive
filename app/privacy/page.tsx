'use client';
export default function PrivacyPage() {
  const today = '2026년 5월 28일';
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px', fontFamily: 'inherit', lineHeight: 1.8, color: '#111' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>개인정보처리방침</h1>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 40 }}>시행일자: {today}</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>1. 수집하는 개인정보 항목</h2>
        <p>글린트 아카이브(이하 "서비스")는 서비스 제공을 위해 아래 최소한의 정보를 수집합니다.</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li><strong>회원가입 시:</strong> 이메일 주소, 닉네임</li>
          <li><strong>Google 로그인 시:</strong> 구글 계정 이메일, 프로필 이름</li>
          <li><strong>서비스 이용 시:</strong> AI 모프 감정 이미지(분석 후 서버 미보관), 분석 결과, 사육 일지 정보</li>
          <li><strong>자동 수집:</strong> 접속 IP(해시 처리), 브라우저 정보(통계 목적)</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>2. 개인정보의 수집·이용 목적</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>회원 식별 및 로그인 서비스 제공</li>
          <li>AI 모프 감정 서비스 이용 이력 관리</li>
          <li>사육 일지, 여권 기능 등 개인화 서비스 제공</li>
          <li>서비스 개선 및 통계 분석(익명화된 데이터)</li>
          <li>법령 준수 및 분쟁 해결</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>3. 개인정보 보유 및 이용기간</h2>
        <p>회원 탈퇴 시 즉시 삭제합니다. 단, 관계 법령에 따라 아래 정보는 일정 기간 보관됩니다.</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li>계약 또는 청약철회 기록: 5년 (전자상거래법)</li>
          <li>소비자 불만·분쟁 처리 기록: 3년 (전자상거래법)</li>
          <li>접속 로그: 3개월 (통신비밀보호법)</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>4. 개인정보의 제3자 제공</h2>
        <p>서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 아래 경우는 예외입니다.</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li>이용자가 사전에 동의한 경우</li>
          <li>법령 규정에 의하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>5. 개인정보 처리 위탁</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li><strong>Supabase Inc.</strong> — 데이터베이스 및 인증 서비스 (미국)</li>
          <li><strong>Vercel Inc.</strong> — 서버 호스팅 (미국)</li>
          <li><strong>Anthropic PBC</strong> — AI 분석 처리 (미국, 이미지는 분석 후 즉시 파기)</li>
        </ul>
        <p style={{ marginTop: 8, color: '#666', fontSize: 14 }}>위 업체들은 서비스 제공 목적 외 개인정보를 이용하지 않으며, 각사의 개인정보처리방침을 준수합니다.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>6. 이용자의 권리</h2>
        <p>이용자는 언제든지 아래 권리를 행사할 수 있습니다.</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li><strong>열람권:</strong> 내 데이터 다운로드 (계정 설정 → 데이터 내보내기)</li>
          <li><strong>정정권:</strong> 닉네임 등 프로필 정보 수정 (계정 설정에서 직접 수정)</li>
          <li><strong>삭제권(잊힐 권리):</strong> 계정 탈퇴 시 즉시 삭제 (계정 설정 → 계정 삭제)</li>
          <li><strong>처리정지권:</strong> 개인정보 처리 정지 요청 (하단 연락처로 문의)</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>7. 쿠키 및 자동 수집 정보</h2>
        <p>서비스는 로그인 상태 유지를 위해 쿠키를 사용합니다. 브라우저 설정에서 쿠키를 거부할 수 있으나, 일부 서비스 이용이 제한될 수 있습니다. 광고 목적의 쿠키는 사용하지 않습니다.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>8. 개인정보보호책임자</h2>
        <ul style={{ paddingLeft: 20, listStyle: 'none' }}>
          <li>서비스명: 글린트 아카이브 (GLINT ARCHIVE)</li>
          <li>이메일: tjsdn4336@gmail.com</li>
          <li>개인정보 관련 문의·불만·피해구제 접수 처리</li>
        </ul>
        <p style={{ marginTop: 8, color: '#666', fontSize: 13 }}>
          기타 개인정보침해에 관한 신고·상담은 개인정보분쟁조정위원회(www.kopico.go.kr, 1833-6972) 또는
          개인정보침해신고센터(privacy.kisa.or.kr, 118)에 문의하실 수 있습니다.
        </p>
      </section>

      <p style={{ color: '#999', fontSize: 13, borderTop: '1px solid #eee', paddingTop: 24 }}>
        본 방침은 {today}부터 적용됩니다. 방침 변경 시 서비스 내 공지사항을 통해 사전 고지합니다.
      </p>
    </div>
  );
}
