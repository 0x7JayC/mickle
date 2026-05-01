// Manual swap trigger for the test loop. Same code path as the daily
// cron but accepts ?date=YYYY-MM-DD so the operator can swap today's
// taps without waiting for 00:05 UTC.
//
// Auth: requires the same CRON_SECRET as the cron — header
// `Authorization: Bearer $CRON_SECRET`. Returns 401 otherwise.

import { NextResponse } from "next/server";
import { runDailySwap } from "@/lib/run-daily-swap";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "CRON_SECRET not set" }, { status: 500 });
  }
  const got = req.headers.get("authorization");
  if (got !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const date =
    url.searchParams.get("date") ||
    new Date().toISOString().slice(0, 10); // default: today

  const result = await runDailySwap(date);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, ...(result.detail ? { detail: result.detail } : {}) },
      { status: result.status },
    );
  }
  return NextResponse.json(result);
}
