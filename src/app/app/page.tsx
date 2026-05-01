// Permanent redirect /app → /dashboard.
//
// The dashboard route was renamed on 2026-05-01. We keep this stub so:
//   - Old bookmarks resolve.
//   - The Coinbase Onramp redirect URLs we already issued (which point
//     at /app?onramp=success&amount=N) keep working until any in-flight
//     transactions finish settling.

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AppRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") qs.set(k, v);
    else if (Array.isArray(v)) v.forEach((x) => qs.append(k, x));
  }
  const tail = qs.toString();
  redirect(`/dashboard${tail ? `?${tail}` : ""}`);
}
