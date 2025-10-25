'use client';
import { useState, useEffect } from "react";
import Link from "next/link";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                A11y Leads
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {leads.length} Lead{leads.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Lead Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Verwalte deine WordPress-Leads und entdecke neue Opportunities
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Einzel-Lead hinzufügen */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Lead hinzufügen</h2>
            </div>
            <form onSubmit={addLead} className="space-y-3">
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com oder https://example.com"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
              />
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg px-4 py-3 font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                Lead hinzufügen
              </button>
            </form>
          </div>

          {/* Google/SerpAPI Discovery */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Google Suche</h2>
            </div>
            <form onSubmit={discover} className="space-y-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='z.B. site:.de "verlag" wordpress'
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
              />
              <button
                className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-purple-600 rounded-lg px-4 py-3 font-semibold hover:bg-purple-50 dark:hover:bg-gray-600 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Suche läuft...
                  </span>
                ) : "Von Google suchen"}
              </button>
            </form>
          </div>
        </div>

        {/* Leads List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Deine Leads
          </h2>
          {leads.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Noch keine Leads vorhanden. Füge deinen ersten Lead hinzu!
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {leads.map((l) => (
                <div key={l.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Domain */}
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {l.domain}
                        </h3>
                        {l.isWordPress && (
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                            WordPress
                          </span>
                        )}
                      </div>

                      {/* Info Grid */}
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400">WP-Status:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {l.isWordPress === null ? (
                              <span className="text-yellow-600 dark:text-yellow-400">Wird geprüft...</span>
                            ) : l.isWordPress ? (
                              <span className="text-green-600 dark:text-green-400">Erkannt</span>
                            ) : (
                              <span className="text-gray-600 dark:text-gray-400">Nicht erkannt</span>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400">Confidence:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {l.wpConfidence ? `${(l.wpConfidence * 100).toFixed(0)}%` : '-'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400">Email:</span>
                          {l.contactEmail ? (
                            <a href={`mailto:${l.contactEmail}`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                              {l.contactEmail}
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>

                        {l.contactSource && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400">Quelle:</span>
                            <a
                              href={l.contactSource}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Impressum
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Discovery Source */}
                      {l.urlDiscovered && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          Gefunden über: {l.urlDiscovered}
                        </div>
                      )}

                      {/* Created Date */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(l.createdAt).toLocaleString('de-DE')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
