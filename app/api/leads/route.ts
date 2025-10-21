import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { detectWordPress } from "@/lib/wpCheck";
import { findContact } from "@/lib/impressum";

const prisma = new PrismaClient();

function ensureUrl(domainOrUrl: string) {
  if (/^https?:\/\//i.test(domainOrUrl)) return domainOrUrl;
  return `https://${domainOrUrl.replace(/\/$/, "")}`;
}

export async function GET() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const body = await req.json(); // { domain }
  const domainUrl = ensureUrl(body.domain);

  const lead = await prisma.lead.create({ data: { domain: body.domain } });

  try {
    const res = await fetch(domainUrl);
    const html = await res.text();
    const wp = await detectWordPress(html, domainUrl);
    const contact = await findContact(domainUrl);

    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        isWordPress: wp.isWordPress,
        wpConfidence: wp.score,
        contactEmail: contact?.email ?? null,
        contactSource: contact?.url ?? null,
      },
    });
  } catch (e) {
    console.error("Prüfung fehlgeschlagen:", e);
  }

  return NextResponse.json(lead, { status: 201 });
}
