/* 샵 투어 페이지는 전체 뷰포트를 쓰므로 별도 레이아웃으로 overflow를 제어합니다 */
export default function ShopsLayout({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden">{children}</div>;
}
