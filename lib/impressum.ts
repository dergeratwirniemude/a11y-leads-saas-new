const CANDIDATES = ["/impressum","/kontakt","/contact","/ueber-uns","/about","/unternehmen/impressum"];
const EMAIL_RX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
export async function findContact(baseUrl: string) {
  for (const path of CANDIDATES) {
    try {
      const url = new URL(path, baseUrl).toString();
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const html = await res.text();
      const email = html.match(EMAIL_RX)?.[0]?.toLowerCase();
      if (email) return { email, url };
    } catch {}
  }
  return null;
}
