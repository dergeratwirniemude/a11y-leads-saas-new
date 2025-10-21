import { NextRequest, NextResponse } from "next/server";
import { detectWordPress } from "@/lib/wpCheck";

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  const res = await fetch(url);
  const html = await res.text();
  const result = await detectWordPress(html, url);
  return NextResponse.json(result);
}
