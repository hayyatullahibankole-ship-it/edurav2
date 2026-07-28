import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Lock, KeyRound, ArrowRight } from "lucide-react";

interface Ebook {
  id: string;
  title: string;
  slug: string;
  author: string;
  description: string | null;
  cover_url: string | null;
}

export default function EbookLibrary() {
  const { user } = useAuth();
  const { isAkboy } = useDomainDetection();
  const { toast } = useToast();
  const navigate = useNavigate();
  const basePath = isAkboy ? "" : "/akboy";

  const [books, setBooks] = useState<Ebook[]>([]);
  const [accessIds, setAccessIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("ebooks")
      .select("id, title, slug, author, description, cover_url")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    setBooks((data as Ebook[]) || []);

    if (user) {
      const { data: acc } = await supabase.from("ebook_access").select("ebook_id");
      setAccessIds((acc || []).map((a: any) => a.ebook_id));
    } else {
      setAccessIds([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const redeem = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to redeem an access code." });
      navigate(`${basePath}/auth`);
      return;
    }
    if (!code.trim()) return;
    setRedeeming(true);
    const { data, error } = await supabase.rpc("redeem_ebook_code", { _code: code.trim() });
    setRedeeming(false);
    const res = data as any;
    if (error || !res?.success) {
      toast({ title: "Could not redeem", description: error?.message || res?.error || "Invalid code", variant: "destructive" });
      return;
    }
    toast({ title: "Access granted", description: "You can now read this book." });
    setCode("");
    await load();
    if (res.slug) navigate(`${basePath}/ebooks/${res.slug}`);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Helmet>
        <title>Ebook Library | AKBOY</title>
        <meta name="description" content="Read AKBOY ebooks online. Access-controlled reading library for students and creatives." />
      </Helmet>

      <header className="bg-emerald-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <Badge className="bg-white/10 text-emerald-50 border-0 mb-4">Reading Library</Badge>
          <h1 className="text-3xl md:text-5xl font-bold">Ebooks</h1>
          <p className="mt-3 text-emerald-100 max-w-2xl">
            Read online with your access pass. Books are read-only — no downloads, no sharing.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <Card className="p-5 border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <KeyRound className="w-4 h-4 text-emerald-700" /> Have an access code?
            </div>
            <div className="flex flex-1 gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter access code"
                className="uppercase"
              />
              <Button onClick={redeem} disabled={redeeming} className="bg-emerald-700 hover:bg-emerald-800">
                {redeeming ? "Checking..." : "Unlock"}
              </Button>
            </div>
          </div>
        </Card>

        {loading ? (
          <p className="text-stone-500">Loading library...</p>
        ) : books.length === 0 ? (
          <Card className="p-12 text-center border-stone-200">
            <BookOpen className="w-10 h-10 mx-auto text-stone-400 mb-3" />
            <p className="text-stone-600">No books published yet. Check back soon.</p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((b) => {
              const unlocked = accessIds.includes(b.id);
              return (
                <Card key={b.id} className="overflow-hidden border-stone-200 flex flex-col">
                  <div className="aspect-[3/4] bg-stone-100 overflow-hidden">
                    {b.cover_url ? (
                      <img src={b.cover_url} alt={`${b.title} cover`} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-stone-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h2 className="font-semibold text-lg text-stone-900">{b.title}</h2>
                    <p className="text-sm text-stone-500 mb-2">by {b.author}</p>
                    {b.description && <p className="text-sm text-stone-600 line-clamp-3 mb-4">{b.description}</p>}
                    <div className="mt-auto flex items-center justify-between">
                      <Badge variant="outline" className={unlocked ? "border-emerald-300 text-emerald-700" : "border-stone-300 text-stone-500"}>
                        {unlocked ? "Unlocked" : "Access required"}
                      </Badge>
                      <Button asChild size="sm" variant={unlocked ? "default" : "outline"} className={unlocked ? "bg-emerald-700 hover:bg-emerald-800" : ""}>
                        <Link to={`${basePath}/ebooks/${b.slug}`}>
                          {unlocked ? <>Read <ArrowRight className="w-4 h-4 ml-1" /></> : <><Lock className="w-4 h-4 mr-1" /> Preview</>}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
