export async function detectWordPress(html: string, origin: string) {
  let score = 0;

  if (/wp-content\//i.test(html)) score += 0.4;
  if (/wp-includes\//i.test(html)) score += 0.3;
  if (/generator["']?[^>]*WordPress/i.test(html)) score += 0.2;

  try {
    const res = await fetch(new URL("/wp-json", origin).toString(), { cache: "no-store" });
    if (res.ok && (res.headers.get("content-type") || "").includes("json")) score += 0.5;
  } catch {}

  return { isWordPress: score >= 0.6, score: Math.min(1, score) };
}
