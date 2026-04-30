// Metaplex Core / OpenSea-shaped JSON for streak milestone NFTs.
// The milestones table's asset_address will eventually point at real
// on-chain Core assets; their `uri` field will resolve here.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TIERS: Record<
  string,
  { name: string; description: string; emoji: string; color: string }
> = {
  "7": {
    name: "Mickle · Week One",
    description:
      "Seven days of showing up. The hardest part — proving to yourself that the streak is real.",
    emoji: "🌱",
    color: "#10b981",
  },
  "30": {
    name: "Mickle · The Mickle",
    description:
      "Thirty days of $1 into the S&P 500. Many a mickle makes a muckle. You are no longer experimenting; you are practising.",
    emoji: "🔥",
    color: "#ff7a59",
  },
  "100": {
    name: "Mickle · The Muckle",
    description:
      "One hundred days. Quiet, consistent, compounding. A discipline NFT — proof of the patience that crypto rarely rewards.",
    emoji: "💎",
    color: "#6d5ef5",
  },
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const day = searchParams.get("day") ?? "30";
  const tier = TIERS[day];
  if (!tier) {
    return NextResponse.json({ error: "unknown tier" }, { status: 404 });
  }

  const origin = new URL(req.url).origin;
  const image = `${origin}/api/nft-metadata/image?day=${day}`;

  return NextResponse.json({
    name: tier.name,
    description: tier.description,
    image,
    external_url: "https://mickle-gamma.vercel.app",
    attributes: [
      { trait_type: "Streak", value: `Day ${day}` },
      { trait_type: "Tier", value: tier.name.split("·")[1].trim() },
      { trait_type: "Soulbound", value: "true" },
    ],
    properties: {
      category: "image",
      files: [{ uri: image, type: "image/svg+xml" }],
    },
  });
}
