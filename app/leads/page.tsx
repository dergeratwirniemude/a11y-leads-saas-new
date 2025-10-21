'use client';
import { useState, useEffect } from "react";

type Lead = {
  id: string;
  domain: string;
  isWordPress: boolean | null;
  wpConfidence: number | null;
  contactEmail: string | null;
  contactSource: string | null;
  urlDiscovered?: string | null;
  createdAt: string;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [domain, setDomain] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchLeads() {
    const res = await fetch("/api/leads");
    const data = await res.json();
    setLeads(data);
  }

  async function addLead(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim()) return;
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
    });
    setDomain("");
    fetchLeads();
  }

    async function discover(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, num: 10 }),
      });

      // Robust: erst Text holen, dann versuchen zu parsen
      const text = await res.text();
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch {
        throw new Error(`Keine gültige JSON-Antwort (HTTP ${res.status}): ${text.slice(0,200)}`);
      }
      if (!res.ok) {
        throw new Error(data?.error ? `${data.error} (HTTP ${res.status})` : `HTTP ${res.status}`);
      }

      alert(`Gefunden: ${data.wpCount} WP-Leads von ${data.total} Treffern`);
      setQuery("");
      fetchLeads();
    } catch (err: any) {
      alert(`Fehler bei der Suche: ${err.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => { fetchLeads(); }, []);

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Leads</h1>

      {/* Einzel-Lead hinzufügen */}
      <form onSubmit={addLead} className="flex gap-2">
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com oder https://example.com"
          className="flex-1 border rounded px-3 py-2"
        />
        <button className="bg-black text-white rounded px-3 py-2">Add</button>
      </form>

      {/* Google/SerpAPI Discovery */}
      <form onSubmit={discover} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Google-Query, z.B. site:.de "verlag" wordpress'
          className="flex-1 border rounded px-3 py-2"
        />
        <button className="border rounded px-3 py-2" disabled={loading}>
          {loading ? "Suche…" : "Von Google suchen"}
        </button>
      </form>

      <div className="space-y-2">
        {leads.map((l) => (
          <div key={l.id} className="border rounded p-3">
            <div className="font-medium">{l.domain}</div>
            <div className="text-sm text-gray-700 mt-1">
              WP: {l.isWordPress === null ? 'prüfe…' : String(l.isWordPress)}
              {" · "}Score: {l.wpConfidence ?? '-'}
              {" · "}Email: {l.contactEmail ?? '-'}
              {l.contactSource ? <>{" · "}Quelle: <a className="underline" href={l.contactSource} target="_blank" rel="noreferrer">Impressum</a></> : null}
            </div>
            {l.urlDiscovered ? <div className="text-xs text-gray-500">Gefunden über: {l.urlDiscovered}</div> : null}
            <div className="text-xs text-gray-500 mt-1">
              Angelegt: {new Date(l.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
