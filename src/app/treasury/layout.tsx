// Treasury page wants the calm cream background, not the brand ambient,
// because it reads like a public report, not the marketing landing.
export default function TreasuryLayout({ children }: { children: React.ReactNode }) {
  return <div className="calm-bg flex-1 flex flex-col">{children}</div>;
}
