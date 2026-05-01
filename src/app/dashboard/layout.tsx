// CDP provider is mounted here, scoped to /dashboard only. Landing
// and /treasury render without it so they don't pay the SDK init
// handshake on first paint. Anyone clicking 'Sign in' on a public
// page is routed to /dashboard, which initializes CDP once and gates
// access via the AuthButton inline if the user isn't signed in.

import CdpProviders from "@/components/CdpProviders";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CdpProviders>
      <div className="calm-bg flex-1 flex flex-col">{children}</div>
    </CdpProviders>
  );
}
