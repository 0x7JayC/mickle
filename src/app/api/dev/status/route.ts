import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    demo_cheat: process.env.ALLOW_DEMO_CHEAT === "true",
  });
}
