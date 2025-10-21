export function toOrigin(input: string) {
  try {
    const u = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    return `${u.protocol}//${u.host}`;
  } catch { return null; }
}
