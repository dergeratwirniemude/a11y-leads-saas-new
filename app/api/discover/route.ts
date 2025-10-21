import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { detectWordPress } from "@/lib/wpCheck";
import { findContact } from "@/lib/impressum";

const prisma = new PrismaClient();

function toOrigin(input: string) {
  try {
    const u = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    return `${u.protocol}//${u.host}`;
  } catch { return null; }
}

function json(data: any, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    let body: any = {};
    try { body = bodyText ? JSON.parse(bodyText) : {}; } catch {}
    const query = (body?.query ?? "").toString();
    const num = Number(body?.num ?? 10);

    if (!process.env.SERPAPI_KEY) {
      return json({ error: "SERPAPI_KEY missing" }, 500);
    }
    if (!query.trim()) {
      return json({ error: "query required" }, 400);
    }

    const u = new URL("https://serpapi.com/search.json");
    u.searchParams.set("engine", "google");
    u.searchParams.set("q", query);
    u.searchParams.set("hl", "de");
    u.searchParams.set("num", String(Math.min(20, Math.max(1, num))));
    u.searchParams.set("api_key", process.env.SERPAPI_KEY!);

    const serpRes = await fetch(u.toString(), { cache: "no-store" });
    const serpText = await serpRes.text();

    let serp: any = null;
    try { serp = JSON.parse(serpText); }
    catch {
      console.error("SerpAPI non-JSON:", serpText.slice(0, 400));
      return json({ error: "SerpAPI returned non-JSON", status: serpRes.status }, 502);
    }
    if (!serpRes.ok) {
      return json({ error: "SerpAPI error", status: serpRes.status, details: serp?.error ?? serp }, 502);
    }

    const links: string[] =
      serp?.organic_results?.map((r: any) => r?.link).filter(Boolean) ?? [];

    const origins = Array.from(new Set(links.map(toOrigin).filter(Boolean)));

    const results: any[] = [];
    for (const origin of origins) {
      const lead = await prisma.lead.upsert({
        where: { domain: origin! },
        update: {},
        create: { domain: origin!, urlDiscovered: origin! },
      });

      try {
        const res = await fetch(origin!, { cache: "no-store" });
        const html = await res.text();
        const wp = await detectWordPress(html, origin!);
        const contact = await findContact(origin!);

        const updated = await prisma.lead.update({
          where: { id: lead.id },
          data: {
            isWordPress: wp.isWordPress,
            wpConfidence: wp.score,
            contactEmail: contact?.email ?? null,
            contactSource: contact?.url ?? null,
            urlDiscovered: lead.urlDiscovered ?? origin!,
          },
        });
        results.push(updated);
      } catch (e: any) {
        console.error("Check failed for", origin, e);
        results.push({ id: lead.id, domain: origin, error: String(e?.message ?? e) });
      }
    }

    const onlyWp = results.filter((r: any) => r?.isWordPress === true);
    return json({ total: origins.length, wpCount: onlyWp.length, leads: onlyWp });
  } catch (e: any) {
    console.error("discover fatal:", e);
    return json({ error: "internal error", details: String(e?.message ?? e) }, 500);
  }
}
