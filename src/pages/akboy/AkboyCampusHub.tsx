import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import {
  Search, Calendar, ArrowRight, GraduationCap, School as SchoolIcon,
  Sparkles, Briefcase, BookOpen, Megaphone, Award, Users,
  TrendingUp, Newspaper, Lightbulb, Flame, FileText, ChevronRight,
  Building2, Filter, ChevronLeft, Mail, Tag, Eye, MessageCircle,
} from "lucide-react";
import { CampusHubAdvancedSection, WhatsAppConsultButton } from "@/components/akboy/CampusHubAdvanced";

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

const CATEGORY_META: Record<string, { color: string; bg: string; emoji: string; icon: any }> = {
  "Admissions":            { color: "text-emerald-700", bg: "bg-emerald-100", emoji: "🎓", icon: GraduationCap },
  "Scholarships":          { color: "text-amber-700",   bg: "bg-amber-100",   emoji: "💰", icon: Award },
  "Exams & JAMB":          { color: "text-blue-700",    bg: "bg-blue-100",    emoji: "📝", icon: FileText },
  "Academic Calendar":     { color: "text-purple-700",  bg: "bg-purple-100",  emoji: "📅", icon: Calendar },
  "Accreditation":         { color: "text-indigo-700",  bg: "bg-indigo-100",  emoji: "✅", icon: Award },
  "Convocation & Events":  { color: "text-orange-700",  bg: "bg-orange-100",  emoji: "🎉", icon: Calendar },
  "Career & Internships":  { color: "text-teal-700",    bg: "bg-teal-100",    emoji: "💼", icon: Briefcase },
  "News & Updates":        { color: "text-rose-700",    bg: "bg-rose-100",    emoji: "📢", icon: Megaphone },
  "Study Tips":            { color: "text-fuchsia-700", bg: "bg-fuchsia-100", emoji: "💡", icon: Lightbulb },
};
const CATEGORIES = ["All", ...Object.keys(CATEGORY_META)];

const QUICK_ACCESS = [
  { key: "Admissions",           title: "Admissions",     icon: GraduationCap },
  { key: "Scholarships",         title: "Scholarships",   icon: Award },
  { key: "Exams & JAMB",         title: "Exams & JAMB",   icon: FileText },
  { key: "Academic Calendar",    title: "Calendar",       icon: Calendar },
  { key: "Accreditation",        title: "Accreditation",  icon: Award },
  { key: "Convocation & Events", title: "Events",         icon: Megaphone },
  { key: "Career & Internships", title: "Career",         icon: Briefcase },
  { key: "News & Updates",       title: "News",           icon: Newspaper },
];

const BROWSE_BY_TOPIC = [
  { title: "University News", icon: GraduationCap, gradient: "from-blue-600 to-blue-800", category: "News & Updates" },
  { title: "JAMB / Admission", icon: FileText, gradient: "from-emerald-600 to-emerald-800", category: "Exams & JAMB" },
  { title: "Scholarships", icon: Award, gradient: "from-amber-600 to-amber-800", category: "Scholarships" },
  { title: "Trending", icon: TrendingUp, gradient: "from-orange-600 to-orange-800", category: "All" },
];

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" }) : "Recent";

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

export default function AkboyCampusHub() {
  const { isCampusHub } = useDomainDetection();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<CampusPost[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [selectedSchool, setSelectedSchool] = useState(searchParams.get("school") || "All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  useEffect(() => { fetchPosts(); }, []);

  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "All");
    setSelectedSchool(searchParams.get("school") || "All");
    setSearchTerm(searchParams.get("q") || "");
    setCurrentPage(1);
  }, [searchParams]);

  // Auto-advance slideshow
  useEffect(() => {
    if (posts.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.min(8, posts.length));
    }, 5000);
    return () => clearInterval(interval);
  }, [posts]);

  const fetchPosts = async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, content, featured_image_url, category, tags, created_at, school, institution_type, year")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(500);
      if (fetchError) throw fetchError;
      setPosts((data as any) || []);
    } catch (err) {
      console.error("Error fetching campus posts:", err);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== "All") next.set(key, value); else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const text = `${p.title || ""} ${p.excerpt || ""} ${p.school || ""}`.toLowerCase();
      const matchSearch = !searchTerm || text.includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === "All" || (p.category || "News & Updates") === selectedCategory;
      const matchSchool = selectedSchool === "All" || (p.school || "Other") === selectedSchool;
      return matchSearch && matchCat && matchSchool;
    });
  }, [posts, searchTerm, selectedCategory, selectedSchool]);

  const paginatedFeed = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const trending = useMemo(() => posts.slice(0, 5), [posts]);

  const slideShowPosts = useMemo(() => posts.slice(0, 8), [posts]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach(p => {
      const c = p.category?.trim() || "News & Updates";
      counts[c] = (counts[c] || 0) + 1;
    });
    return counts;
  }, [posts]);

  const categoryOptions = useMemo(() => {
    const categories = new Set<string>(["All"]);
    posts.forEach((post) => {
      if (post.category?.trim()) {
        categories.add(post.category.trim());
      }
    });
    if (selectedCategory && selectedCategory !== "All") {
      categories.add(selectedCategory);
    }
    return Array.from(categories).sort((a, b) => {
      if (a === "All") return -1;
      if (b === "All") return 1;
      const countDiff = (categoryCounts[b] || 0) - (categoryCounts[a] || 0);
      return countDiff !== 0 ? countDiff : a.localeCompare(b);
    });
  }, [posts, selectedCategory, categoryCounts]);

  // Featured schools (top schools by post count, excluding generic buckets)
  const schoolList = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach(p => {
      const s = p.school;
      if (!s) return;
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([school, count]) => ({ school, count }));
  }, [posts]);

  const featuredSchools = useMemo(
    () => schoolList.filter(s => !["Other", "Other University"].includes(s.school)).slice(0, 12),
    [schoolList]
  );

  const popularPosts = useMemo(() => posts.slice(0, 10), [posts]);

  const allTags = useMemo(() => {
    const tagMap: Record<string, number> = {};
    posts.forEach(p => {
      if (p.tags) {
        const tagsArray = Array.isArray(p.tags)
          ? p.tags
          : typeof p.tags === 'string'
            ? (() => {
                try {
                  const parsed = JSON.parse(p.tags);
                  return Array.isArray(parsed) ? parsed : [p.tags];
                } catch {
                  return [p.tags];
                }
              })()
            : [];
        tagsArray.forEach(tag => {
          if (typeof tag === 'string' && tag.trim()) {
            tagMap[tag.trim()] = (tagMap[tag.trim()] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(tagMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([tag, count]) => ({ tag, count }));
  }, [posts]);

  const PostCard = ({ post, compact = false }: { post: CampusPost; compact?: boolean }) => {
    const meta = CATEGORY_META[post.category || "News & Updates"] || CATEGORY_META["News & Updates"];
    return (
      <Link to={`/blog/${post.slug || post.id}`} className="group block h-full">
        <Card className="overflow-hidden border border-gray-200 hover:border-emerald-400 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-2xl bg-white h-full flex flex-col">
          <div className={`relative ${compact ? 'h-32' : 'h-44'} overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 flex-shrink-0`}>
            {post.featured_image_url ? (
              <img src={post.featured_image_url} alt={post.title} loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">{meta.emoji}</div>
            )}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              <span className={`${meta.bg} ${meta.color} px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm`}>
                {meta.emoji} {post.category || "News"}
              </span>
              {post.school && !["Other", "Other University"].includes(post.school) && (
                <span className="bg-gray-900/85 text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm backdrop-blur">
                  {post.school}
                </span>
              )}
            </div>
          </div>
          <div className="p-4 flex flex-col flex-grow">
            <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-2 font-medium">
              <Calendar className="w-3 h-3" />
              <span>{timeAgo(post.created_at)}</span>
            </div>
            <h3 className={`font-bold text-gray-900 ${compact ? 'text-sm line-clamp-2' : 'text-base line-clamp-2'} mb-2 group-hover:text-emerald-700 transition-colors leading-snug`}>
              {post.title}
            </h3>
            {!compact && (
              <p className="text-xs text-gray-600 line-clamp-2 flex-grow mb-3">
                {post.excerpt || post.content?.replace(/<[^>]*>/g, '').substring(0, 100)}
              </p>
            )}
            <div className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs group-hover:gap-2 transition-all mt-auto">
              Read More <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </Card>
      </Link>
    );
  };

  const handleWhatsAppShare = (e: React.MouseEvent, post: CampusPost) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/blog/${post.slug || post.id}`;
    const text = `📢 ${post.title}\n\nRead more: ${url}\n\nShared from Akboy Campus Hub`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const FeedListItem = ({ post }: { post: CampusPost }) => {
    const meta = CATEGORY_META[post.category || "News & Updates"] || CATEGORY_META["News & Updates"];
    return (
      <Link to={`/blog/${post.slug || post.id}`} className="group block">
        <div className="flex gap-4 py-4 px-4 border-b border-gray-200 hover:bg-gray-50 transition-colors rounded-lg">
          {/* Left: Logo/Image */}
          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100">
            {post.featured_image_url ? (
              <img src={post.featured_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">{meta.emoji}</div>
            )}
          </div>

          {/* Middle: Content */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`${meta.bg} ${meta.color} px-2 py-0.5 rounded text-[10px] font-bold uppercase`}>
                {post.category || "News"}
              </span>
              {post.school && !["Other", "Other University"].includes(post.school) && (
                <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                  {post.school}
                </span>
              )}
            </div>
            <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-emerald-700 transition-colors">
              {post.title}
            </h3>
            <p className="text-xs text-gray-600 line-clamp-1">
              {post.excerpt || post.content?.replace(/<[^>]*>/g, '').substring(0, 80)}
            </p>
          </div>

          {/* Right: Metadata */}
          <div className="flex-shrink-0 text-right flex flex-col justify-between items-end gap-2">
            <div className="text-[10px] font-bold text-gray-500">{timeAgo(post.created_at)}</div>
            <button
              onClick={(e) => handleWhatsAppShare(e, post)}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1 text-[10px] font-bold transition"
              aria-label="Share on WhatsApp"
            >
              <MessageCircle className="w-3 h-3" /> Share
            </button>
            <div className="flex items-center justify-end gap-1 text-xs text-emerald-600">
              Read <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <AkboyLayout
      title={isCampusHub ? "Campus Hub — Admissions, Scholarships & Campus News" : "Campus Hub — Nigerian Admissions, Scholarships & Education News"}
      description="Latest admission updates, scholarships, JAMB/WAEC news and academic calendars from Nigerian universities, polytechnics and colleges. All in one hub."
    >
      {/* ============= 1. HERO WITH SEARCH ============= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-10 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center gap-2 mb-5 px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-full text-emerald-100 text-xs md:text-sm font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              CAMPUS NEWS · ADMISSIONS · SCHOLARSHIPS
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 font-poppins leading-tight">
              Campus Hub
            </h1>
            <p className="text-sm md:text-base text-emerald-50/90 mb-6 leading-relaxed">
              Latest admissions, scholarship updates and campus news in one place.
            </p>

            {/* Live search */}
            <div className="relative mx-auto max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-700" />
              <Input
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); updateParam("q", e.target.value); setCurrentPage(1); }}
                placeholder="Search by school, course, or keyword…"
                className="pl-12 h-14 text-base bg-white border-0 rounded-2xl shadow-2xl focus-visible:ring-2 focus-visible:ring-emerald-400"
              />
              {searchTerm && (
                <a href="#feed" className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700 hover:text-emerald-900">
                  See {filtered.length} results →
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============= 2. NEWS SLIDESHOW ============= */}
      {!loading && slideShowPosts.length > 0 && (
        <section className="py-12 md:py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2">Latest News</p>
                <h2 className="text-2xl md:text-4xl font-bold text-gray-900 font-poppins">Breaking campus headlines</h2>
              </div>
              <div className="inline-flex items-center gap-3">
                <span className="rounded-full border border-amber-400 bg-amber-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Latest Update</span>
                <a href="#feed" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">View all →</a>
              </div>
            </div>


            <div className="relative overflow-hidden rounded-[30px] bg-slate-950 text-white">
              <Link to={`/blog/${slideShowPosts[currentSlide].slug || slideShowPosts[currentSlide].id}`} className="block">
                <div className="relative h-72 md:h-[420px]">
                  {slideShowPosts[currentSlide].featured_image_url ? (
                    <img
                      src={slideShowPosts[currentSlide].featured_image_url}
                      alt={slideShowPosts[currentSlide].title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-6xl">
                      {CATEGORY_META[slideShowPosts[currentSlide].category || "News & Updates"]?.emoji || "📰"}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/25 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
                    <div className="flex flex-wrap items-center gap-3 mb-4 justify-center">
                      <span className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em]">{slideShowPosts[currentSlide].category || "News"}</span>
                      {slideShowPosts[currentSlide].school && (
                        <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-100">{slideShowPosts[currentSlide].school}</span>
                      )}
                    </div>
                    <h3 className="mx-auto max-w-4xl text-center text-3xl md:text-4xl font-bold leading-tight mb-4">{slideShowPosts[currentSlide].title}</h3>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-slate-200 mb-6">
                      <span className="inline-flex items-center gap-2"><Calendar className="w-4 h-4" />{timeAgo(slideShowPosts[currentSlide].created_at)}</span>
                      <span className="inline-flex items-center gap-2"><Users className="w-4 h-4" />{slideShowPosts[currentSlide].school || "Campus news"}</span>
                    </div>
                    <div className="flex justify-center">
                      <span className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition">
                        Read Story <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + slideShowPosts.length) % slideShowPosts.length)}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-900/70 text-white shadow-lg hover:bg-slate-900"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slideShowPosts.length)}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-900/70 text-white shadow-lg hover:bg-slate-900"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {slideShowPosts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2.5 rounded-full transition-all ${idx === currentSlide ? 'w-10 bg-amber-500' : 'w-2.5 bg-slate-300/60'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============= QUICK ACCESS — minimal chips ============= */}
      {!loading && (
        <section className="py-8 md:py-10 px-4 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest mb-1">Browse by topic</p>
                <h2 className="text-lg md:text-xl font-bold text-gray-900 font-poppins">What are you looking for?</h2>
              </div>
              {selectedCategory !== "All" && (
                <button
                  onClick={() => { setSelectedCategory("All"); updateParam("category", "All"); }}
                  className="text-xs text-emerald-700 hover:underline font-medium"
                >Clear</button>
              )}
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3">
              {QUICK_ACCESS.map((item) => {
                const Icon = item.icon;
                const count = categoryCounts[item.key] || 0;
                const active = selectedCategory === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      setSelectedCategory(item.key);
                      updateParam("category", item.key);
                      setCurrentPage(1);
                      document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`group flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 transition-all ${
                      active
                        ? "bg-emerald-950 border-emerald-950 text-white"
                        : "bg-white border-gray-200 text-gray-700 hover:border-emerald-600 hover:text-emerald-700"
                    }`}
                  >
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-[10px] md:text-xs font-semibold leading-tight text-center">{item.title}</span>
                    <span className={`text-[9px] font-bold ${active ? "text-emerald-200" : "text-gray-400"}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}


      {!loading && popularPosts.length > 0 && (
        <section className="py-8 md:py-12 px-4 bg-white md:hidden">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white grid place-items-center"><TrendingUp className="w-5 h-5" /></div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-bold">Popular Posts</p>
                <h3 className="text-lg font-bold text-slate-900">What people are reading</h3>
              </div>
            </div>
            <div className="space-y-3">
              {popularPosts.slice(0, 5).map((post, idx) => (
                <Link key={post.id} to={`/blog/${post.slug || post.id}`} className="group block rounded-2xl border border-gray-100 p-3 transition hover:border-emerald-300 hover:bg-emerald-50">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-bold">{idx + 1}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 line-clamp-2">{post.title}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{timeAgo(post.created_at)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============= 6. THE FEED & SIDEBAR ============= */}
      <section id="feed" className="py-12 md:py-16 px-4 bg-gray-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">📰 Campus Feed</p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 font-poppins">Latest updates, fast</h2>
              <p className="text-sm text-gray-600 mt-1">Showing {paginatedFeed.length} of {filtered.length} updates • Page {currentPage} of {totalPages || 1}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select
                value={selectedCategory}
                onValueChange={(v) => { setSelectedCategory(v); updateParam("category", v); setCurrentPage(1); }}
              >
                <SelectTrigger className="w-full sm:w-52 bg-white">
                  <Filter className="w-4 h-4 mr-1 text-emerald-600" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(c => (
                    <SelectItem key={c} value={c}>
                      {c === "All" ? "All Categories" : `${c} (${categoryCounts[c] || 0})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedSchool}
                onValueChange={(v) => { setSelectedSchool(v); updateParam("school", v); setCurrentPage(1); }}
              >
                <SelectTrigger className="w-full sm:w-52 bg-white">
                  <SchoolIcon className="w-4 h-4 mr-1 text-blue-600" />
                  <SelectValue placeholder="School" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  <SelectItem value="All">All Schools</SelectItem>
                  {schoolList.map(({ school, count }) => (
                    <SelectItem key={school} value={school}>{school} ({count})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {BROWSE_BY_TOPIC.map((topic) => {
              const active = selectedCategory === topic.category;
              return (
                <button
                  key={topic.title}
                  onClick={() => {
                    setSelectedCategory(topic.category);
                    updateParam("category", topic.category);
                    setCurrentPage(1);
                  }}
                  className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                    active ? "bg-emerald-600 text-white border-emerald-600" : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  {topic.title}
                </button>
              );
            })}
            {featuredSchools.slice(0, 5).map(({ school }) => {
              const active = selectedSchool === school;
              return (
                <button
                  key={school}
                  onClick={() => {
                    setSelectedSchool(school);
                    updateParam("school", school);
                    setCurrentPage(1);
                  }}
                  className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                    active ? "bg-blue-600 text-white border-blue-600" : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  {school}
                </button>
              );
            })}
          </div>

          {(selectedCategory !== "All" || selectedSchool !== "All" || searchTerm) && (
            <div className="flex flex-wrap gap-2 mb-8 items-center">
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">Search: {searchTerm}</span>
              )}
              {selectedCategory !== "All" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">Category: {selectedCategory}</span>
              )}
              {selectedSchool !== "All" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">School: {selectedSchool}</span>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory("All"); setSelectedSchool("All"); setSearchTerm("");
                  setSearchParams({}, { replace: true });
                  setCurrentPage(1);
                }}
              >
                Clear filters
              </Button>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="h-28 animate-pulse bg-gray-200 border-0" />
                  ))}
                </div>
              ) : error ? (
                <Card className="p-8 text-center border-dashed border-2 border-red-200 bg-red-50">
                  <p className="text-red-700 font-medium">{error}</p>
                  <Button onClick={fetchPosts} className="mt-4">Retry</Button>
                </Card>
              ) : filtered.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2 border-gray-300 bg-white">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-bold mb-1">No matching updates</p>
                  <p className="text-sm text-gray-500">Try clearing filters or a different search term.</p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {paginatedFeed.map(post => <FeedListItem key={post.id} post={post} />)}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 py-4">
                  <button
                    onClick={() => { setCurrentPage(1); document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" }); }}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 font-semibold text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    ← First
                  </button>
                  <button
                    onClick={() => { setCurrentPage(Math.max(1, currentPage - 1)); document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" }); }}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 font-semibold text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                    let pageNum = currentPage - 2 + idx;
                    if (totalPages <= 5) pageNum = idx + 1;
                    else if (currentPage <= 3) pageNum = idx + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + idx;
                    if (pageNum < 1 || pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => { setCurrentPage(pageNum); document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" }); }}
                        className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${
                          currentPage === pageNum ? "bg-emerald-600 text-white" : "border border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => { setCurrentPage(Math.min(totalPages, currentPage + 1)); document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" }); }}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-300 font-semibold text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next →
                  </button>
                  <button
                    onClick={() => { setCurrentPage(totalPages); document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" }); }}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-300 font-semibold text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Last →
                  </button>
                </div>
              )}
            </div>

            <aside className="space-y-6 hidden lg:block">
              <Card className="p-6 bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white grid place-items-center"><TrendingUp className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-bold">Popular Posts</p>
                    <h3 className="text-lg font-bold text-slate-900">What people are reading</h3>
                  </div>
                </div>
                <div className="space-y-3">
                  {popularPosts.slice(0, 5).map((post, idx) => (
                    <Link key={post.id} to={`/blog/${post.slug || post.id}`} className="group block rounded-2xl border border-gray-100 p-3 transition hover:border-emerald-300 hover:bg-emerald-50">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-bold">{idx + 1}</div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 line-clamp-2">{post.title}</p>
                          <p className="text-[11px] text-slate-500 mt-1">{timeAgo(post.created_at)}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-slate-800 text-white grid place-items-center"><Tag className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-600 font-bold">Tags</p>
                    <h3 className="text-lg font-bold text-slate-900">Explore tags</h3>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(({ tag }) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSearchTerm(tag);
                        setCurrentPage(1);
                        updateParam("q", tag);
                      }}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </section>

      {/* ============= ADVANCED: Tools, Booking & Newsletter ============= */}
      <CampusHubAdvancedSection posts={posts} schools={featuredSchools} />

      {/* ============= 6. CTA ============= */}
      <section className="py-14 md:py-20 px-4 bg-gradient-to-br from-emerald-900 to-emerald-950 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold font-poppins mb-4">Never miss an admission update</h2>
          <p className="text-emerald-100/85 mb-8 max-w-2xl mx-auto">
            From JAMB news to scholarship deadlines and admission forms — Campus Hub keeps every Nigerian student in the loop.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-emerald-900 shadow-lg hover:bg-emerald-50"
            >
              Read latest headlines <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <button
              onClick={() => document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center justify-center rounded-xl border-2 border-white/40 bg-transparent px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
            >
              Subscribe for alerts
            </button>
          </div>
        </div>
      </section>

      <WhatsAppConsultButton />
    </AkboyLayout>
  );
}
