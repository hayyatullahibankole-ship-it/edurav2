import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import {
  Search, ArrowUpRight, ArrowRight, Sparkles, Flame,
  GraduationCap, Award, FileText, Calendar, Briefcase, Megaphone,
  Lightbulb, Newspaper, ChevronLeft, ChevronRight, Mail,
} from "lucide-react";

interface CampusPost {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featured_image_url?: string;
  category?: string;
  tags?: unknown;
  created_at?: string;
  school?: string | null;
  institution_type?: string | null;
  year?: number | null;
}

const CATEGORY_META: Record<string, { icon: any; tone: string }> = {
  "Admissions":            { icon: GraduationCap, tone: "Admissions" },
  "Scholarships":          { icon: Award,         tone: "Funding" },
  "Exams & JAMB":          { icon: FileText,      tone: "Exams" },
  "Academic Calendar":     { icon: Calendar,      tone: "Calendar" },
  "Accreditation":         { icon: Award,         tone: "Accreditation" },
  "Convocation & Events":  { icon: Megaphone,     tone: "Events" },
  "Career & Internships":  { icon: Briefcase,     tone: "Career" },
  "News & Updates":        { icon: Newspaper,     tone: "News" },
  "Study Tips":            { icon: Lightbulb,     tone: "Study" },
};
const CATEGORIES = ["All", ...Object.keys(CATEGORY_META)];

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" }) : "";

const timeAgo = (d?: string) => {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
};

const stripHtml = (s?: string) => (s || "").replace(/<[^>]*>/g, "").trim();

export default function AkboyCampusHub() {
  const { isCampusHub } = useDomainDetection();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<CampusPost[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [selectedSchool, setSelectedSchool] = useState(searchParams.get("school") || "All");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [heroIndex, setHeroIndex] = useState(0);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("blog_posts")
          .select("id, title, slug, excerpt, content, featured_image_url, category, tags, created_at, school, institution_type, year")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(500);
        setPosts((data as any) || []);
      } finally { setLoading(false); }
    })();
  }, []);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== "All") next.set(key, value); else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const filtered = useMemo(() => posts.filter((p) => {
    const text = `${p.title || ""} ${p.excerpt || ""} ${p.school || ""}`.toLowerCase();
    const matchSearch = !searchTerm || text.includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === "All" || (p.category || "News & Updates") === selectedCategory;
    const matchSchool = selectedSchool === "All" || (p.school || "Other") === selectedSchool;
    return matchSearch && matchCat && matchSchool;
  }), [posts, searchTerm, selectedCategory, selectedSchool]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedFeed = useMemo(
    () => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filtered, currentPage]
  );

  const heroPosts = useMemo(() => posts.slice(0, 5), [posts]);
  const trending = useMemo(() => posts.slice(5, 10), [posts]);
  const editorsPicks = useMemo(() => posts.slice(10, 14), [posts]);

  useEffect(() => {
    if (heroPosts.length < 2) return;
    const t = setInterval(() => setHeroIndex((i) => (i + 1) % heroPosts.length), 6500);
    return () => clearInterval(t);
  }, [heroPosts.length]);

  const schoolList = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((p) => { if (p.school) counts[p.school] = (counts[p.school] || 0) + 1; });
    return Object.entries(counts)
      .filter(([s]) => !["Other", "Other University"].includes(s))
      .sort((a, b) => b[1] - a[1])
      .map(([school, count]) => ({ school, count }));
  }, [posts]);

  const categoryCounts = useMemo(() => {
    const c: Record<string, number> = {};
    posts.forEach((p) => { const k = p.category || "News & Updates"; c[k] = (c[k] || 0) + 1; });
    return c;
  }, [posts]);

  const featuredHero = heroPosts[heroIndex];

  return (
    <AkboyLayout
      title={isCampusHub ? "Campus Hub — Admissions, Scholarships & Campus News" : "Campus Hub — Nigerian Admissions, Scholarships & Education News"}
      description="The editorial newsroom for Nigerian students — admissions, scholarships, JAMB, WAEC and academic calendars across every major campus."
    >
      {/* ============================================================
          MASTHEAD
      ============================================================ */}
      <header className="border-b border-akboy-ink/10 bg-akboy-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <div className="flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.28em] text-akboy-ink/60">
            <span>Vol. 01 · The Student Edition</span>
            <span className="hidden sm:inline">{new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
            <span>Akboy Press</span>
          </div>
          <div className="mt-6 text-center">
            <h1 className="font-display font-black tracking-tight text-akboy-forest leading-[0.95] text-[14vw] sm:text-[110px] md:text-[140px] lg:text-[180px]">
              Campus<span className="italic text-akboy-ink/85">Hub</span>
            </h1>
            <p className="mt-3 text-akboy-ink/70 text-sm md:text-base max-w-2xl mx-auto font-serif italic">
              An editorial newsroom for Nigerian students — admissions, scholarships, exams and the schools they shape.
            </p>
          </div>

          {/* search */}
          <div className="mt-6 max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-akboy-ink/50" />
            <Input
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); updateParam("q", e.target.value); setCurrentPage(1); }}
              placeholder="Search a school, scholarship, exam…"
              className="pl-11 h-12 bg-akboy-paper border-akboy-ink/15 rounded-full text-sm shadow-[0_8px_28px_-12px_rgba(15,61,46,0.25)] focus-visible:ring-akboy-forest"
            />
          </div>
        </div>

        {/* sticky category rail */}
        <div className="border-t border-akboy-ink/10 bg-akboy-paper">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto custom-scrollbar">
            <div className="flex items-center gap-1 py-2.5 whitespace-nowrap">
              {CATEGORIES.map((c) => {
                const active = selectedCategory === c;
                return (
                  <button
                    key={c}
                    onClick={() => { setSelectedCategory(c); updateParam("category", c); setCurrentPage(1); }}
                    className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold uppercase tracking-wider transition-colors ${
                      active
                        ? "bg-akboy-forest text-akboy-cream"
                        : "text-akboy-ink/70 hover:text-akboy-forest hover:bg-akboy-cream"
                    }`}
                  >
                    {c}
                    {c !== "All" && categoryCounts[c] ? <span className="ml-1.5 opacity-70">{categoryCounts[c]}</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================
          HERO LEAD STORY (editorial split)
      ============================================================ */}
      {featuredHero && (
        <section className="bg-akboy-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <Link to={`/blog/${featuredHero.slug || featuredHero.id}`} className="lg:col-span-7 group block">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] bg-akboy-forest">
                  {featuredHero.featured_image_url ? (
                    <img
                      src={featuredHero.featured_image_url}
                      alt={featuredHero.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-akboy-cream/40 text-7xl font-display">A</div>
                  )}
                  <div className="absolute top-4 left-4 inline-flex items-center gap-2 bg-akboy-butter text-akboy-ink px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> Lead story
                  </div>
                </div>
              </Link>

              <div className="lg:col-span-5">
                <p className="text-[11px] uppercase tracking-[0.28em] text-akboy-forest font-bold mb-4">
                  {featuredHero.category || "News & Updates"}
                  {featuredHero.school ? <span className="text-akboy-ink/50"> · {featuredHero.school}</span> : null}
                </p>
                <Link to={`/blog/${featuredHero.slug || featuredHero.id}`} className="block group">
                  <h2 className="font-display font-black text-akboy-ink leading-[1.05] text-3xl sm:text-4xl lg:text-5xl group-hover:text-akboy-forest transition-colors">
                    {featuredHero.title}
                  </h2>
                </Link>
                <p className="mt-4 text-akboy-ink/70 text-base leading-relaxed line-clamp-4 font-serif">
                  {featuredHero.excerpt || stripHtml(featuredHero.content).substring(0, 240)}
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs text-akboy-ink/55">{timeAgo(featuredHero.created_at)}</span>
                  <Link
                    to={`/blog/${featuredHero.slug || featuredHero.id}`}
                    className="inline-flex items-center gap-1.5 text-akboy-forest font-bold text-sm hover:gap-2.5 transition-all"
                  >
                    Read story <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* hero dots */}
                {heroPosts.length > 1 && (
                  <div className="mt-6 flex items-center gap-2">
                    {heroPosts.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setHeroIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          i === heroIndex ? "w-8 bg-akboy-forest" : "w-1.5 bg-akboy-ink/20 hover:bg-akboy-ink/40"
                        }`}
                        aria-label={`Story ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          ABOVE-THE-FOLD: 3-UP TRENDING
      ============================================================ */}
      {trending.length > 0 && (
        <section className="bg-akboy-paper border-y border-akboy-ink/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-akboy-ink/55 font-bold">The Wire</p>
                <h2 className="font-display text-3xl md:text-4xl text-akboy-ink mt-1 flex items-center gap-3">
                  Trending now <Flame className="w-6 h-6 text-akboy-butter" />
                </h2>
              </div>
              <Link to="?" onClick={(e) => { e.preventDefault(); setSelectedCategory("All"); updateParam("category", "All"); document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" }); }} className="text-sm font-semibold text-akboy-forest hover:underline hidden sm:inline-flex items-center gap-1">
                See all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {trending.slice(0, 3).map((p, idx) => (
                <Link key={p.id} to={`/blog/${p.slug || p.id}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-4 bg-akboy-cream">
                    {p.featured_image_url ? (
                      <img src={p.featured_image_url} alt={p.title} loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl text-akboy-ink/20 font-display">{idx + 1}</div>
                    )}
                    <span className="absolute top-3 left-3 bg-akboy-paper/95 backdrop-blur text-akboy-forest text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                      0{idx + 1} · {p.category || "News"}
                    </span>
                  </div>
                  <h3 className="font-display text-xl md:text-[22px] leading-tight text-akboy-ink group-hover:text-akboy-forest transition-colors">
                    {p.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-xs text-akboy-ink/55">
                    <span>{timeAgo(p.created_at)}</span>
                    {p.school && <><span>·</span><span className="font-semibold">{p.school}</span></>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          MAIN FEED + SIDEBAR (editorial column layout)
      ============================================================ */}
      <section id="feed" className="bg-akboy-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid lg:grid-cols-[1fr_320px] gap-10 lg:gap-14">
            {/* Feed */}
            <div className="min-w-0">
              <div className="flex items-end justify-between mb-6 pb-4 border-b-2 border-akboy-ink">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-akboy-ink/55 font-bold">The Feed</p>
                  <h2 className="font-display text-3xl md:text-4xl text-akboy-ink mt-1">
                    {selectedCategory === "All" ? "Latest stories" : selectedCategory}
                    {selectedSchool !== "All" && <span className="text-akboy-forest"> · {selectedSchool}</span>}
                  </h2>
                </div>
                <span className="text-xs font-semibold text-akboy-ink/60">{filtered.length} stories</span>
              </div>

              {loading ? (
                <div className="space-y-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-5 animate-pulse">
                      <div className="w-40 h-28 bg-akboy-ink/10 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2 py-2">
                        <div className="h-3 w-24 bg-akboy-ink/10 rounded" />
                        <div className="h-5 w-3/4 bg-akboy-ink/10 rounded" />
                        <div className="h-3 w-full bg-akboy-ink/10 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : paginatedFeed.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-akboy-ink/20 rounded-2xl">
                  <p className="font-display text-2xl text-akboy-ink mb-2">Nothing matches that filter.</p>
                  <p className="text-sm text-akboy-ink/60">Try clearing your search or switching categories.</p>
                </div>
              ) : (
                <div>
                  {paginatedFeed.map((p, i) => {
                    // every 5th item gets a wide editorial treatment
                    const wide = i % 5 === 0;
                    return wide ? (
                      <Link key={p.id} to={`/blog/${p.slug || p.id}`} className="group block py-7 border-b border-akboy-ink/10">
                        <div className="grid md:grid-cols-[1.4fr_1fr] gap-6 items-center">
                          <div className="relative aspect-[4/3] md:aspect-[16/10] overflow-hidden rounded-2xl bg-akboy-paper order-1 md:order-2">
                            {p.featured_image_url ? (
                              <img src={p.featured_image_url} alt={p.title} loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-5xl text-akboy-ink/20 font-display">A</div>
                            )}
                          </div>
                          <div className="order-2 md:order-1">
                            <p className="text-[11px] uppercase tracking-[0.24em] text-akboy-forest font-bold mb-2">
                              {p.category || "News"}{p.school ? <span className="text-akboy-ink/45"> · {p.school}</span> : null}
                            </p>
                            <h3 className="font-display text-2xl md:text-3xl leading-tight text-akboy-ink group-hover:text-akboy-forest transition-colors">
                              {p.title}
                            </h3>
                            <p className="mt-3 text-akboy-ink/65 text-sm leading-relaxed line-clamp-3 font-serif">
                              {p.excerpt || stripHtml(p.content).substring(0, 200)}
                            </p>
                            <div className="mt-3 text-xs text-akboy-ink/50 flex items-center gap-2">
                              <span>{timeAgo(p.created_at)}</span><span>·</span><span>5 min read</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <Link key={p.id} to={`/blog/${p.slug || p.id}`} className="group block py-5 border-b border-akboy-ink/10">
                        <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[160px_1fr] gap-4 sm:gap-6 items-start">
                          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-akboy-paper">
                            {p.featured_image_url ? (
                              <img src={p.featured_image_url} alt={p.title} loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-3xl text-akboy-ink/20 font-display">A</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-akboy-forest font-bold mb-1.5">
                              {p.category || "News"}{p.school ? <span className="text-akboy-ink/45"> · {p.school}</span> : null}
                            </p>
                            <h3 className="font-display text-lg sm:text-xl leading-snug text-akboy-ink group-hover:text-akboy-forest transition-colors line-clamp-2">
                              {p.title}
                            </h3>
                            <p className="hidden sm:block mt-2 text-sm text-akboy-ink/60 line-clamp-2 font-serif">
                              {p.excerpt || stripHtml(p.content).substring(0, 160)}
                            </p>
                            <div className="mt-2 text-xs text-akboy-ink/50">{timeAgo(p.created_at)}</div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-8">
                      <button
                        onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: document.getElementById("feed")?.offsetTop || 0, behavior: "smooth" }); }}
                        disabled={currentPage === 1}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border border-akboy-ink/20 text-akboy-ink hover:bg-akboy-paper disabled:opacity-40"
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </button>
                      <span className="text-sm font-semibold text-akboy-ink/70">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: document.getElementById("feed")?.offsetTop || 0, behavior: "smooth" }); }}
                        disabled={currentPage === totalPages}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border border-akboy-ink/20 text-akboy-ink hover:bg-akboy-paper disabled:opacity-40"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-10 lg:sticky lg:top-24 self-start">
              {/* Editor's picks */}
              {editorsPicks.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-akboy-ink/55 font-bold pb-3 border-b border-akboy-ink/15 mb-4">
                    Editor’s picks
                  </p>
                  <ol className="space-y-5">
                    {editorsPicks.map((p, i) => (
                      <li key={p.id}>
                        <Link to={`/blog/${p.slug || p.id}`} className="group flex gap-3">
                          <span className="font-display text-2xl text-akboy-butter font-black leading-none w-7 flex-shrink-0">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-display text-[15px] leading-snug text-akboy-ink group-hover:text-akboy-forest transition-colors line-clamp-3">
                              {p.title}
                            </h4>
                            <p className="text-[11px] text-akboy-ink/50 mt-1">{p.category || "News"} · {timeAgo(p.created_at)}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Schools */}
              {schoolList.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-akboy-ink/55 font-bold pb-3 border-b border-akboy-ink/15 mb-4">
                    Browse by school
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setSelectedSchool("All"); updateParam("school", "All"); setCurrentPage(1); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        selectedSchool === "All"
                          ? "bg-akboy-forest text-akboy-cream"
                          : "bg-akboy-paper border border-akboy-ink/15 text-akboy-ink hover:border-akboy-forest"
                      }`}
                    >
                      All schools
                    </button>
                    {schoolList.slice(0, 16).map(({ school, count }) => (
                      <button
                        key={school}
                        onClick={() => { setSelectedSchool(school); updateParam("school", school); setCurrentPage(1); }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                          selectedSchool === school
                            ? "bg-akboy-forest text-akboy-cream"
                            : "bg-akboy-paper border border-akboy-ink/15 text-akboy-ink hover:border-akboy-forest"
                        }`}
                      >
                        {school} <span className="opacity-60">{count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter */}
              <div className="rounded-3xl bg-akboy-forest text-akboy-cream p-6">
                <Mail className="w-6 h-6 text-akboy-butter mb-3" />
                <h3 className="font-display text-2xl leading-tight">Don’t miss a deadline.</h3>
                <p className="text-sm text-akboy-cream/70 mt-2">
                  The weekly Campus Hub digest — admissions, scholarships and exam alerts in your inbox.
                </p>
                <form
                  onSubmit={(e) => { e.preventDefault(); }}
                  className="mt-4 flex gap-2"
                >
                  <Input
                    type="email"
                    placeholder="you@school.edu.ng"
                    className="bg-akboy-cream/10 border-akboy-cream/20 text-akboy-cream placeholder:text-akboy-cream/40 rounded-full h-10"
                  />
                  <button
                    type="submit"
                    className="bg-akboy-butter text-akboy-ink font-bold rounded-full px-4 text-sm hover:bg-akboy-sun transition-colors"
                  >
                    Join
                  </button>
                </form>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </AkboyLayout>
  );
}
