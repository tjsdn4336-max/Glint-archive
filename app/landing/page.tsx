'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

function useScrollY() {
  const [y, setY] = useState(0)
  useEffect(() => {
    const fn = () => setY(window.scrollY)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return y
}

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const o = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setV(true) },
      { threshold }
    )
    if (ref.current) o.observe(ref.current)
    return () => o.disconnect()
  }, [])
  return [ref, v] as const
}

function FadeIn({
  children, delay = 0, y = 28, className = '',
}: {
  children: React.ReactNode; delay?: number; y?: number; className?: string
}) {
  const [ref, inView] = useInView()
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'none' : `translateY(${y}px)`,
      transition: `opacity 1.1s cubic-bezier(.16,1,.3,1) ${delay}s, transform 1.1s cubic-bezier(.16,1,.3,1) ${delay}s`,
    }}>
      {children}
    </div>
  )
}

/* ── 전체 배경 워터마크 — 실제 로고 PNG ─────────────────────── */
function Watermark() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-watermark.png"
        alt=""
        aria-hidden="true"
        style={{
          width: 'min(72vw, 860px)',
          height: 'auto',
          opacity: 0.045,
          userSelect: 'none',
          filter: 'grayscale(100%)',
        }}
      />
    </div>
  )
}

/* ── 가는 장식선 ─────────────────────────────────────────────── */
function Rule({ className = '' }: { className?: string }) {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} />
      <svg width="8" height="8" viewBox="0 0 8 8">
        <rect x="2" y="2" width="4" height="4" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" transform="rotate(45 4 4)"/>
      </svg>
      <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} />
    </div>
  )
}

export default function LandingPage() {
  const scrollY = useScrollY()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  void mounted

  return (
    <div style={{
      fontFamily: "'Noto Sans KR','Apple SD Gothic Neo',sans-serif",
      background: '#F9F9F7',
      color: '#111',
      minHeight: '100vh',
      position: 'relative',
    }}>
      <Watermark />

      {/* ────────────────────────────────────────────────────────
          NAV
      ──────────────────────────────────────────────────────── */}
      <nav className="ga-nav" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px',
        background: scrollY > 60 ? 'rgba(249,249,247,0.94)' : 'transparent',
        backdropFilter: scrollY > 60 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 60 ? '1px solid rgba(0,0,0,0.05)' : 'none',
        transition: 'all 0.5s ease',
      }}>
        {/* 좌 — 로고 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="GA" style={{ width: 22, height: 22, opacity: 0.85, objectFit: 'contain' }} />
          <span style={{
            fontFamily: 'Georgia,serif', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.2em', color: '#111',
          }}>GLINT ARCHIVE</span>
        </div>

        {/* 우 — 데스크탑 링크 */}
        <div className="ga-nav-links" style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
          {[
            { label: '타임딜',   href: '/deals' },
            { label: '샵 투어',  href: '/shops' },
            { label: '모프 감정', href: '/analyze' },
          ].map(n => (
            <Link key={n.href} href={n.href} style={{
              fontSize: 12, color: '#999', textDecoration: 'none',
              fontWeight: 400, letterSpacing: '0.02em',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#111')}
              onMouseLeave={e => (e.currentTarget.style.color = '#999')}
            >{n.label}</Link>
          ))}
          <Link href="/auth" style={{
            fontSize: 11, color: '#111', textDecoration: 'none',
            fontWeight: 700, letterSpacing: '0.1em',
            borderBottom: '1px solid #111', paddingBottom: 2,
          }}>입장하기</Link>
        </div>

        {/* 모바일 전용 — 입장하기 버튼만 */}
        <Link href="/home" className="ga-nav-mobile-cta" style={{
          display: 'none',
          fontSize: 11, color: '#F9F9F7', fontWeight: 700,
          letterSpacing: '0.1em', textDecoration: 'none',
          background: '#111',
          padding: '8px 16px', borderRadius: 4,
        }}>입장하기</Link>
      </nav>

      {/* ────────────────────────────────────────────────────────
          HERO
      ──────────────────────────────────────────────────────── */}
      <section className="ga-hero" style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start', justifyContent: 'flex-end',
        padding: '0 48px 88px',
        position: 'relative', zIndex: 1,
      }}>
        {/* 우상단 서브카피 */}
        <div className="ga-hero-top-right" style={{ position: 'absolute', top: 90, right: 48, textAlign: 'right' }}>
          <FadeIn delay={1.4}>
            <p style={{ fontSize: 10, color: '#C0C0BC', letterSpacing: '0.15em', lineHeight: 2 }}>
              전국 파충류 분양 마켓 플랫폼<br />
              Korea&apos;s Premier Reptile Market
            </p>
          </FadeIn>
        </div>

        {/* 좌하단 — EST 연도 */}
        <FadeIn delay={0.1} y={10}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{ width: 28, height: 1, background: '#CCC' }} />
            <p style={{ fontSize: 10, color: '#C0C0BC', letterSpacing: '0.22em', fontWeight: 500 }}>EST. 2025</p>
          </div>
        </FadeIn>

        {/* 메인 헤드라인 */}
        <div style={{ maxWidth: 820 }}>
          <FadeIn delay={0.25} y={24}>
            <h1 style={{
              fontFamily: 'Georgia,serif',
              fontSize: 'clamp(48px, 7.5vw, 100px)',
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: '-0.035em',
              color: '#0D0D0D',
            }}>
              파충류를<br />
              대하는 방식이<br />
              달라집니다.
            </h1>
          </FadeIn>
        </div>

        {/* 가는 구분선 */}
        <FadeIn delay={0.55} y={0}>
          <div style={{ width: 48, height: 1, background: '#DDD', margin: '40px 0' }} />
        </FadeIn>

        {/* 하단 좌우 */}
        <div className="ga-hero-bottom" style={{
          width: '100%', display: 'flex',
          justifyContent: 'space-between', alignItems: 'flex-end',
        }}>
          <FadeIn delay={0.7}>
            <p style={{
              fontSize: 15, color: '#777', lineHeight: 2, maxWidth: 300,
              letterSpacing: '-0.01em',
            }}>
              AI 모프 감정, 실시간 타임딜,<br />
              디지털 보증서까지.<br />
              파충류 문화의 새로운 기준.
            </p>
          </FadeIn>
          <FadeIn delay={1.0}>
            <Link href="/home" style={{
              display: 'flex', alignItems: 'center', gap: 14,
              color: '#111', textDecoration: 'none',
              fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
            }}>
              서비스 둘러보기
              <span style={{
                display: 'inline-flex', width: 44, height: 44,
                borderRadius: '50%', border: '1px solid rgba(0,0,0,0.2)',
                alignItems: 'center', justifyContent: 'center', fontSize: 15,
                transition: 'all 0.3s',
              }}>→</span>
            </Link>
          </FadeIn>
        </div>

        {/* 스크롤 힌트 */}
        <div style={{
          position: 'absolute', bottom: 36, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          opacity: scrollY > 50 ? 0 : 0.6, transition: 'opacity 0.5s',
        }}>
          <div style={{
            width: 1, height: 52,
            background: 'linear-gradient(to bottom, #999, transparent)',
            animation: 'ga-scroll-line 2.2s ease-in-out infinite',
          }} />
          <p style={{ fontSize: 8, letterSpacing: '0.25em', color: '#BBB', fontWeight: 600 }}>SCROLL</p>
        </div>
      </section>

      {/* ── 구분선 ── */}
      <Rule className="ga-divider" />

      {/* ────────────────────────────────────────────────────────
          WHAT WE DO
      ──────────────────────────────────────────────────────── */}
      <section className="ga-section" style={{ padding: '128px 48px', position: 'relative', zIndex: 1 }}>
        <div className="ga-what-grid" style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '0 88px', maxWidth: 1100, margin: '0 auto', alignItems: 'start',
        }}>
          {/* 좌 — 섹션 헤딩 */}
          <FadeIn>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                <div style={{ width: 20, height: 1, background: '#CCC' }} />
                <p style={{ fontSize: 9, letterSpacing: '0.24em', color: '#BBB', fontWeight: 700 }}>WHAT WE DO</p>
              </div>
              <h2 style={{
                fontFamily: 'Georgia,serif',
                fontSize: 'clamp(30px, 4vw, 50px)',
                fontWeight: 700, lineHeight: 1.18,
                letterSpacing: '-0.025em', color: '#0D0D0D',
              }}>
                파충류 거래의<br />
                모든 불편함을<br />
                해결합니다.
              </h2>
            </div>
          </FadeIn>

          {/* 우 — 기능 목록 */}
          <FadeIn delay={0.2}>
            <div style={{ paddingTop: 72, display: 'flex', flexDirection: 'column', gap: 52 }}>
              {[
                {
                  num: '01', title: 'AI 모프 감정',
                  desc: '사진 한 장으로 종·모프·유전자·국내 시세를 한국어로 분석합니다. 레오파드 게코부터 볼파이톤까지 전 종 커버.',
                },
                {
                  num: '02', title: '실시간 타임딜',
                  desc: '전국 인증 파충류 샵의 48시간 한정 특가를 실시간으로 확인하세요. 마감 카운트다운과 즉시 예약 기능.',
                },
                {
                  num: '03', title: '디지털 패스포트',
                  desc: '분양받은 개체의 출처·모프·건강 이력을 담은 디지털 보증서. 고유 번호로 위변조를 방지합니다.',
                },
              ].map((item, i) => (
                <FadeIn key={item.num} delay={0.08 * i}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 10 }}>
                      <span style={{
                        fontFamily: 'Georgia,serif', fontSize: 10,
                        color: '#D0D0CC', letterSpacing: '0.1em',
                      }}>{item.num}</span>
                      <span style={{ fontFamily: 'Georgia,serif', fontSize: 16, fontWeight: 700, color: '#0D0D0D' }}>
                        {item.title}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: '#888', lineHeight: 1.85, paddingLeft: 26 }}>
                      {item.desc}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <Rule className="ga-divider" />

      {/* ────────────────────────────────────────────────────────
          PULL QUOTE
      ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '88px 48px', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <FadeIn>
          <p style={{
            fontFamily: 'Georgia,serif', fontSize: 'clamp(18px, 2.8vw, 28px)',
            color: '#444', lineHeight: 1.7, letterSpacing: '-0.01em',
            maxWidth: 680, margin: '0 auto', fontStyle: 'italic',
          }}>
            &ldquo;좋은 개체는 언제나 제값을 받아야 하고,<br />
            사는 사람은 믿고 살 수 있어야 합니다.&rdquo;
          </p>
          <p style={{ fontSize: 10, color: '#CCC', letterSpacing: '0.18em', marginTop: 24, fontWeight: 500 }}>
            — GLINT ARCHIVE
          </p>
        </FadeIn>
      </section>

      <Rule className="ga-divider" />

      {/* ────────────────────────────────────────────────────────
          FOR WHOM
      ──────────────────────────────────────────────────────── */}
      <section className="ga-section" style={{ padding: '128px 48px', position: 'relative', zIndex: 1 }}>
        <FadeIn>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 72, justifyContent: 'center' }}>
            <div style={{ width: 20, height: 1, background: '#CCC' }} />
            <p style={{ fontSize: 9, letterSpacing: '0.24em', color: '#BBB', fontWeight: 700 }}>FOR WHOM</p>
            <div style={{ width: 20, height: 1, background: '#CCC' }} />
          </div>
        </FadeIn>

        <div className="ga-for-whom-grid" style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 3, maxWidth: 1040, margin: '0 auto',
        }}>
          {[
            {
              tag: '파충류 매니아', dark: false,
              title: '찾던 모프를\n제값에 만나세요.',
              items: [
                '전국 인증 샵 타임딜 실시간 알림',
                'AI 모프 감정 무료 체험',
                '관심 개체 찜 & 예약',
                '디지털 패스포트로 신뢰 보증',
              ],
              cta: '구매자로 시작하기', href: '/home',
            },
            {
              tag: '파충류 샵 사장님', dark: true,
              title: '재고를 빠르게\n현금화하세요.',
              items: [
                '48시간 타임딜로 악성 재고 해소',
                '복사붙여넣기 없이 한 번에 등록',
                '디지털 패스포트 발급 권한',
                '샵 전용 관리 대시보드',
              ],
              cta: '샵 등록하기', href: '/admin',
            },
          ].map((card, i) => (
            <FadeIn key={card.tag} delay={i * 0.12}>
              <div className="ga-for-whom-card" style={{
                background: card.dark ? '#0D0D0D' : '#F3F3F0',
                padding: '60px 52px', minHeight: 500,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* 배경 로고 아이콘 — 카드 우하단 */}
                <div style={{
                  position: 'absolute', right: -16, bottom: -16,
                  opacity: card.dark ? 0.12 : 0.08, pointerEvents: 'none',
                  filter: card.dark ? 'invert(1)' : 'none',
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-watermark.png" alt="" style={{ width: 180, height: 180, objectFit: 'contain' }} />
                </div>

                <div>
                  <p style={{
                    fontSize: 9, letterSpacing: '0.22em',
                    color: card.dark ? '#555' : '#BBB',
                    marginBottom: 28, fontWeight: 700,
                  }}>{card.tag.toUpperCase()}</p>
                  <h3 style={{
                    fontFamily: 'Georgia,serif', fontSize: 30, fontWeight: 700,
                    lineHeight: 1.22, color: card.dark ? '#F9F9F7' : '#0D0D0D',
                    marginBottom: 44, whiteSpace: 'pre-line', letterSpacing: '-0.025em',
                  }}>{card.title}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {card.items.map(item => (
                      <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                        <span style={{
                          color: card.dark ? '#444' : '#D4D4D0',
                          fontSize: 11, flexShrink: 0, marginTop: 1,
                        }}>—</span>
                        <span style={{ fontSize: 13, color: card.dark ? '#888' : '#555', lineHeight: 1.65 }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link href={card.href} style={{
                  marginTop: 52, display: 'flex', alignItems: 'center', gap: 10,
                  color: card.dark ? '#F9F9F7' : '#0D0D0D',
                  textDecoration: 'none', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
                }}>
                  {card.cta}
                  <span style={{
                    display: 'inline-flex', width: 32, height: 32,
                    border: `1px solid ${card.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                    borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                  }}>→</span>
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <Rule className="ga-divider" />

      {/* ────────────────────────────────────────────────────────
          CLOSING CTA
      ──────────────────────────────────────────────────────── */}
      <section className="ga-cta-section" style={{
        padding: '168px 48px', textAlign: 'center',
        position: 'relative', zIndex: 1,
      }}>
        <FadeIn>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 36 }}>
            <div style={{ width: 20, height: 1, background: '#CCC' }} />
            <p style={{ fontSize: 9, letterSpacing: '0.24em', color: '#BBB', fontWeight: 700 }}>JOIN US</p>
            <div style={{ width: 20, height: 1, background: '#CCC' }} />
          </div>
        </FadeIn>

        <FadeIn delay={0.14}>
          <h2 style={{
            fontFamily: 'Georgia,serif',
            fontSize: 'clamp(38px, 6vw, 80px)',
            fontWeight: 700, lineHeight: 1.08,
            letterSpacing: '-0.035em', color: '#0D0D0D',
            marginBottom: 56,
          }}>
            지금 시작할<br />
            준비가 됐다면.
          </h2>
        </FadeIn>

        <FadeIn delay={0.28}>
          <div className="ga-cta-btns" style={{
            display: 'flex', gap: 12,
            justifyContent: 'center', alignItems: 'center',
          }}>
            <Link href="/home" style={{
              display: 'inline-block',
              background: '#0D0D0D', color: '#F9F9F7',
              textDecoration: 'none', borderRadius: 3,
              padding: '15px 40px', fontSize: 12,
              fontWeight: 700, letterSpacing: '0.08em',
            }}>서비스 입장</Link>
            <Link href="/admin" style={{
              display: 'inline-block', background: 'transparent',
              color: '#0D0D0D', textDecoration: 'none',
              border: '1px solid rgba(0,0,0,0.15)', borderRadius: 3,
              padding: '15px 40px', fontSize: 12,
              fontWeight: 500, letterSpacing: '0.05em',
            }}>샵 등록</Link>
          </div>
        </FadeIn>
      </section>

      {/* ── FOOTER ── */}
      <footer className="ga-footer" style={{
        padding: '36px 48px',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="GA" style={{ width: 16, height: 16, opacity: 0.5, objectFit: 'contain' }} />
          <p style={{ fontFamily: 'Georgia,serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: '#111' }}>
            GLINT ARCHIVE
          </p>
        </div>
        <p style={{ fontSize: 10, color: '#D0D0CC' }}>© 2025 Glint Archive. All rights reserved.</p>
        <div style={{ display: 'flex', gap: 24 }}>
          <Link href="/terms" style={{ fontSize: 10, color: '#C0C0BC', textDecoration: 'none' }}>이용약관</Link>
          <Link href="/privacy" style={{ fontSize: 10, color: '#C0C0BC', textDecoration: 'none' }}>개인정보처리방침</Link>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');
        * { -webkit-font-smoothing: antialiased; }

        @keyframes ga-scroll-line {
          0%   { transform: scaleY(0); transform-origin: top; opacity: 0; }
          40%  { transform: scaleY(1); transform-origin: top; opacity: 1; }
          60%  { transform: scaleY(1); transform-origin: bottom; opacity: 1; }
          100% { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
        }

        /* ── 모바일 반응형 ── */
        @media (max-width: 640px) {
          .ga-nav               { padding: 0 20px !important; }
          .ga-nav-links         { display: none !important; }
          .ga-nav-mobile-cta    { display: block !important; }
          .ga-hero         { padding: 0 20px 68px !important; }
          .ga-hero-top-right { display: none !important; }
          .ga-hero-bottom  { flex-direction: column !important; align-items: flex-start !important; gap: 28px !important; margin-top: 0 !important; }
          .ga-section      { padding: 72px 20px !important; }
          .ga-divider      { margin: 0 20px !important; }
          .ga-what-grid    { grid-template-columns: 1fr !important; gap: 40px !important; }
          .ga-for-whom-grid { grid-template-columns: 1fr !important; }
          .ga-for-whom-card { padding: 40px 28px !important; min-height: auto !important; }
          .ga-numbers-grid { grid-template-columns: 1fr 1fr !important; row-gap: 44px !important; }
          .ga-number-cell  { border-right: none !important; padding: 0 12px !important; }
          .ga-number-cell:nth-child(odd)  { border-right: 1px solid rgba(0,0,0,0.06) !important; }
          .ga-cta-section  { padding: 96px 20px !important; }
          .ga-cta-btns     { flex-direction: column !important; width: 100% !important; }
          .ga-cta-btns a   { text-align: center !important; width: 100% !important; }
          .ga-footer       { padding: 32px 20px !important; flex-direction: column !important; gap: 14px !important; text-align: center !important; }
        }
      `}</style>
    </div>
  )
}
