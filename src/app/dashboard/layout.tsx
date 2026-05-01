// PrivyProviders now lives in the root layout so the landing page can
// trigger login. /app keeps its calm-bg subtree wrapper.
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="calm-bg flex-1 flex flex-col">{children}</div>;
}
