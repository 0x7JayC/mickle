import PrivyProviders from "@/components/PrivyProviders";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <PrivyProviders>{children}</PrivyProviders>;
}
