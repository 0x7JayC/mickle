// CDP provider lives at the root layout so OAuth redirect-returns to
// the landing can detect the new auth state and route to /dashboard.
// This layout just provides the calm background for the signed-in
// surface.

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="calm-bg flex-1 flex flex-col">{children}</div>;
}
