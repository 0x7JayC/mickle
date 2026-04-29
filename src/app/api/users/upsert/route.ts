import { NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";
import { supabaseAdmin } from "@/lib/supabase";

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || "",
  process.env.PRIVY_APP_SECRET || "",
);

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "missing token" }, { status: 401 });
  }
  const token = auth.slice(7);

  let claims;
  try {
    claims = await privy.verifyAuthToken(token);
  } catch {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }

  const user = await privy.getUserById(claims.userId);
  const wallet = user.linkedAccounts.find(
    (a) => a.type === "wallet" && (a as { chainType?: string }).chainType === "solana",
  ) as { address?: string } | undefined;
  const email = user.linkedAccounts.find((a) => a.type === "email") as { address?: string } | undefined;

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("users")
    .upsert(
      {
        privy_id: claims.userId,
        wallet: wallet?.address ?? null,
        email: email?.address ?? null,
      },
      { onConflict: "privy_id" },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ user: data });
}
