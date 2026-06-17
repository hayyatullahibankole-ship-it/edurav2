import { useEffect, useState } from "react";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileText, BookOpen, Filter } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  file_url: string | null;
  type?: string | null;
}

const CATS = ["All", "JAMB", "WAEC", "E-books", "Templates"];

export default function AkboyResources() {
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("All");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("resources").select("*").limit(100);
      setItems((data as any) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = filter === "All" ? items : items.filter((i) => (i.category || "").toLowerCase().includes(filter.toLowerCase()));

  return (
    <AkboyLayout
      title="Resources — JAMB, WAEC, E-books & Templates"
      description="Free downloads from AKBOY Creative Hub: JAMB materials, WAEC materials, e-books and design templates."
    >
      <section className="bg-akboy-cream akboy-grain py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.22em] text-akboy-forest font-semibold">Resources</p>
          <h1 className="mt-3 font-display text-5xl lg:text-6xl font-semibold leading-[1.05] text-akboy-ink max-w-3xl">
            Materials to help you learn, teach and build — free.
          </h1>
          <p className="mt-5 text-lg text-akboy-ink/70 max-w-2xl">
            JAMB & WAEC past questions, study notes, e-books and design templates curated by the AKBOY team.
          </p>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 flex-wrap mb-8">
            <Filter className="w-4 h-4 text-akboy-ink/60" />
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  filter === c
                    ? "bg-akboy-forest text-akboy-cream"
                    : "bg-akboy-cream text-akboy-ink/70 hover:bg-akboy-stone"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-akboy-ink/50">Loading resources…</p>
          ) : filtered.length === 0 ? (
            <div className="border border-dashed border-akboy-stone rounded-3xl p-12 text-center">
              <BookOpen className="w-10 h-10 text-akboy-forest/40 mx-auto" />
              <p className="mt-4 font-display text-xl text-akboy-ink">Fresh resources are on the way.</p>
              <p className="mt-2 text-sm text-akboy-ink/60">Check back soon — we publish new materials every month.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((r) => (
                <div key={r.id} className="border border-akboy-stone rounded-3xl p-6 bg-akboy-cream hover:border-akboy-forest transition flex flex-col">
                  <div className="w-12 h-12 rounded-2xl bg-akboy-forest text-akboy-butter flex items-center justify-center mb-4">
                    <FileText className="w-5 h-5" />
                  </div>
                  {r.category && <p className="text-[11px] uppercase tracking-[0.18em] text-akboy-ink/50">{r.category}</p>}
                  <h3 className="mt-1 font-display text-xl font-semibold text-akboy-ink">{r.title}</h3>
                  {r.description && <p className="mt-2 text-sm text-akboy-ink/65 flex-1">{r.description}</p>}
                  {r.file_url && (
                    <a
                      href={r.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-akboy-forest hover:gap-3 transition-all"
                    >
                      <Download className="w-4 h-4" /> Download
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </AkboyLayout>
  );
}
