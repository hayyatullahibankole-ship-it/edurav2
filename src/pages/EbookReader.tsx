import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, BookOpen, KeyRound, List, Lock, Minus, Plus } from "lucide-react";

interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  content: string;
  is_preview: boolean;
}

export default function EbookReader() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { isAkboy } = useDomainDetection();
  const { toast } = useToast();
  const navigate = useNavigate();
  const basePath = isAkboy ? "" : "/akboy";

  const [book, setBook] = useState<any>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [index, setIndex] = useState(0);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [showToc, setShowToc] = useState(false);
  const [code, setCode] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: b } = await supabase.from("ebooks").select("*").eq("slug", slug).maybeSingle();
      if (!b) {
        setLoading(false);
        return;
      }
      setBook(b);

      if (user) {
        const { data: acc } = await supabase
          .from("ebook_access")
          .select("id, expires_at")
          .eq("ebook_id", b.id)
          .eq("user_id", user.id)
          .maybeSingle();
        setHasAccess(!!acc && (!acc.expires_at || new Date(acc.expires_at) > new Date()));
      } else {
        setHasAccess(false);
      }

      const { data: ch } = await supabase
        .from("ebook_chapters")
        .select("id, chapter_number, title, content, is_preview")
        .eq("ebook_id", b.id)
        .order("chapter_number", { ascending: true });
      setChapters((ch as Chapter[]) || []);
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, user?.id]);

  // Reading protections: block context menu, copy, and text selection inside the reader
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const block = (e: Event) => e.preventDefault();
    el.addEventListener("contextmenu", block);
    el.addEventListener("copy", block);
    el.addEventListener("cut", block);
    el.addEventListener("dragstart", block);
    return () => {
      el.removeEventListener("contextmenu", block);
      el.removeEventListener("copy", block);
      el.removeEventListener("cut", block);
      el.removeEventListener("dragstart", block);
    };
  }, [chapters, index]);

  const current = chapters[index];
  const locked = useMemo(() => !!current && !current.is_preview && !hasAccess, [current, hasAccess]);

  const redeem = async () => {
    if (!user) {
      navigate(`${basePath}/auth`);
      return;
    }
    const { data, error } = await supabase.rpc("redeem_ebook_code", { _code: code.trim() });
    const res = data as any;
    if (error || !res?.success) {
      toast({ title: "Could not redeem", description: error?.message || res?.error || "Invalid code", variant: "destructive" });
      return;
    }
    toast({ title: "Access granted" });
    setCode("");
    setHasAccess(true);
    const { data: ch } = await supabase
      .from("ebook_chapters")
      .select("id, chapter_number, title, content, is_preview")
      .eq("ebook_id", book.id)
      .order("chapter_number", { ascending: true });
    setChapters((ch as Chapter[]) || []);
  };

  if (loading) return <div className="min-h-screen grid place-items-center text-stone-500">Loading book...</div>;
  if (!book)
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <div>
          <BookOpen className="w-10 h-10 mx-auto text-stone-400 mb-3" />
          <p className="text-stone-600 mb-4">This book is not available.</p>
          <Button asChild variant="outline"><Link to={`${basePath}/ebooks`}>Back to library</Link></Button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-stone-50">
      <Helmet>
        <title>{`${book.title} | AKBOY Ebooks`}</title>
        <meta name="description" content={book.description?.slice(0, 155) || `Read ${book.title} online on AKBOY.`} />
        <style>{`@media print { .ebook-content { display: none !important; } }`}</style>
      </Helmet>

      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link to={`${basePath}/ebooks`} className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900">
            <ArrowLeft className="w-4 h-4" /> Library
          </Link>
          <p className="truncate text-sm font-medium text-stone-900">{book.title}</p>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" onClick={() => setFontSize((f) => Math.max(14, f - 1))} aria-label="Decrease text size">
              <Minus className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setFontSize((f) => Math.min(26, f + 1))} aria-label="Increase text size">
              <Plus className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setShowToc((s) => !s)} aria-label="Table of contents">
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {showToc && (
          <Card className="p-4 mb-6 border-stone-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">Contents</p>
            <ul className="space-y-1">
              {chapters.map((c, i) => (
                <li key={c.id}>
                  <button
                    onClick={() => { setIndex(i); setShowToc(false); window.scrollTo({ top: 0 }); }}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded flex items-center justify-between ${i === index ? "bg-emerald-50 text-emerald-800" : "hover:bg-stone-100 text-stone-700"}`}
                  >
                    <span>{c.chapter_number}. {c.title}</span>
                    {!c.is_preview && !hasAccess && <Lock className="w-3.5 h-3.5 text-stone-400" />}
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {chapters.length === 0 ? (
          <Card className="p-10 text-center border-stone-200 text-stone-600">No chapters published yet.</Card>
        ) : locked ? (
          <Card className="p-10 text-center border-stone-200">
            <Lock className="w-10 h-10 mx-auto text-stone-400 mb-3" />
            <h2 className="text-xl font-semibold text-stone-900 mb-2">This chapter is locked</h2>
            <p className="text-stone-600 mb-6">
              {user ? "Enter your access code to continue reading." : "Sign in and enter your access code to continue reading."}
            </p>
            <div className="max-w-sm mx-auto flex gap-2">
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Access code" />
              <Button onClick={redeem} className="bg-emerald-700 hover:bg-emerald-800">
                <KeyRound className="w-4 h-4 mr-1" /> Unlock
              </Button>
            </div>
          </Card>
        ) : (
          <article
            ref={contentRef}
            className="ebook-content relative select-none"
            style={{ userSelect: "none", WebkitUserSelect: "none" }}
          >
            {/* Watermark tied to the reader */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
              <span className="rotate-[-30deg] text-4xl md:text-6xl font-bold text-stone-900/[0.04] whitespace-nowrap">
                {user?.email || "AKBOY"}
              </span>
            </div>

            <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-2">
              Chapter {current.chapter_number}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-900 mb-6">{current.title}</h1>
            <div
              className="whitespace-pre-wrap leading-relaxed text-stone-800"
              style={{ fontSize: `${fontSize}px` }}
            >
              {current.content}
            </div>
          </article>
        )}

        {chapters.length > 0 && (
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-stone-200">
            <Button
              variant="outline"
              disabled={index === 0}
              onClick={() => { setIndex((i) => i - 1); window.scrollTo({ top: 0 }); }}
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <span className="text-sm text-stone-500">{index + 1} / {chapters.length}</span>
            <Button
              variant="outline"
              disabled={index >= chapters.length - 1}
              onClick={() => { setIndex((i) => i + 1); window.scrollTo({ top: 0 }); }}
            >
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
