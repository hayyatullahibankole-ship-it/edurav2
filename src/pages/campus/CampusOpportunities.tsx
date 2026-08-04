import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import CampusShell from "@/components/campus/CampusShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ExternalLink, MapPin, CalendarClock, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["all", "scholarship", "internship", "job", "conference", "grant", "training"];

const CampusOpportunities = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => { document.title = "Opportunities | Edura Campus"; }, []);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("campus_opportunities")
        .select("*")
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });
      setItems(data ?? []);
      setLoading(false);
    };
    run();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      const matchCat = category === "all" || i.category === category;
      const matchQ = !q || [i.title, i.organisation, i.summary, i.field].some((v: string) => v?.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [items, query, category]);

  return (
    <CampusShell title="Opportunities" subtitle="Scholarships, internships, grants and jobs curated for higher-institution students.">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search opportunities" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium capitalize whitespace-nowrap transition-colors",
                category === c ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">
          No opportunities match your filter yet.
        </CardContent></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((o) => (
            <Card key={o.id} className="flex flex-col">
              <CardContent className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize text-[11px]">{o.category}</Badge>
                  {o.is_featured && <Badge className="text-[11px]">Featured</Badge>}
                </div>
                <h3 className="mt-3 font-semibold leading-snug">{o.title}</h3>
                {o.organisation && <p className="text-xs text-muted-foreground mt-0.5">{o.organisation}</p>}
                {o.summary && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{o.summary}</p>}
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                  {o.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{o.location}</span>}
                  {o.amount && <span className="flex items-center gap-1"><Banknote className="h-3 w-3" />{o.amount}</span>}
                  {o.deadline && <span className="flex items-center gap-1"><CalendarClock className="h-3 w-3" />{new Date(o.deadline).toLocaleDateString()}</span>}
                </div>
                {o.external_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 gap-1 self-start"
                    onClick={() => window.open(o.external_url, "_blank", "noopener,noreferrer")}
                  >
                    Apply <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </CampusShell>
  );
};

export default CampusOpportunities;
