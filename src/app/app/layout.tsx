import PrivyProviders from "@/components/PrivyProviders";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProviders>
      <div className="calm-bg flex-1 flex flex-col">{children}</div>
    </PrivyProviders>
  );
}
