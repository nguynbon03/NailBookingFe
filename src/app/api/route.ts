import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://nailbooking-be:3000";

export async function GET() {
  try {
    const upstream = await fetch(new URL("/api/health", INTERNAL_API_URL), {
      cache: "no-store",
    });
    const backend = await upstream.json().catch(() => null);

    return NextResponse.json({
      ok: upstream.ok,
      service: "nailbooking-fe-api-proxy",
      backend,
    }, { status: upstream.ok ? 200 : 502 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, service: "nailbooking-fe-api-proxy", error: error instanceof Error ? error.message : String(error) },
      { status: 502 }
    );
  }
}
