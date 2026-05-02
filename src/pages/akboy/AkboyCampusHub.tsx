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
import {
  Search, Calendar, ArrowRight, GraduationCap, School as SchoolIcon,
  Sparkles, Briefcase, BookOpen, Megaphone, Award, Users,
  TrendingUp, Newspaper, Lightbulb, Flame, FileText, ChevronRight,
  Building2, Filter, ChevronLeft, Mail, Tag, Eye, MessageCircle,
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
  { key: "Admissions",           title: "Admissions",          desc: "ND, HND, UTME, DE & PG forms",      icon: GraduationCap, gradient: "from-emerald-500 to-teal-500" },
  { key: "Scholarships",         title: "Scholarships",        desc: "Local & international funding",     icon: Award,         gradient: "from-amber-500 to-orange-500" },
  { key: "Exams & JAMB",         title: "Exams & JAMB",        desc: "JAMB, WAEC, NECO, Post-UTME",       icon: FileText,      gradient: "from-blue-500 to-indigo-500" },
  { key: "Academic Calendar",    title: "Academic Calendar",   desc: "Resumption, semesters, timetables", icon: Calendar,      gradient: "from-purple-500 to-fuchsia-500" },
  { key: "Accreditation",        title: "Accreditation",       desc: "NUC, NBTE, programme approvals",    icon: Award,         gradient: "from-indigo-500 to-blue-500" },
  { key: "Convocation & Events", title: "Convocation & Events", desc: "Matriculation, convocation, fests", icon: Megaphone,    gradient: "from-orange-500 to-red-500" },
  { key: "Career & Internships", title: "Career",              desc: "Internships, jobs & opportunities", icon: Briefcase,     gradient: "from-teal-500 to-emerald-500" },
  { key: "News & Updates",       title: "News & Updates",      desc: "Breaking education news",           icon: Newspaper,     gradient: "from-rose-500 to-pink-500" },
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<CampusPost[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [selectedSchool, setSelectedSchool] = useState(searchParams.get("school") || "All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 18;
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  useEffect(() => { fetchPosts(); }, []);

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
    posts.forEach(p => { const c = p.category || "News & Updates"; counts[c] = (counts[c] || 0) + 1; });
    return counts;
  }, [posts]);

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
          <div className="flex-shrink-0 text-right flex flex-col justify-between">
            <div className="text-[10px] font-bold text-gray-500">{timeAgo(post.created_at)}</div>
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
      title="Campus Hub — Nigerian Admissions, Scholarships & Education News"
      description="Latest admission updates, scholarships, JAMB/WAEC news and academic calendars from Nigerian universities, polytechnics and colleges. All in one hub."
    >
      {/* ============= 1. HERO WITH SEARCH ============= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-full text-emerald-100 text-xs md:text-sm font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              NIGERIAN ADMISSIONS · SCHOLARSHIPS · EXAMS
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-5 font-poppins leading-[1.05]">
              AKBOY<br/>
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-100 bg-clip-text text-transparent">Campus Hub.</span>
            </h1>
            <p className="text-base md:text-xl text-emerald-50/90 mb-8 max-w-2xl leading-relaxed">
              Admission forms, scholarships, JAMB news, accreditation, academic calendars and opportunities — from <b>every</b> Nigerian university, polytechnic and college. Updated daily.
            </p>

            {/* Live search */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-700" />
              <Input
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); updateParam("q", e.target.value); setCurrentPage(1); }}
                placeholder="Search by school (e.g. UNILAG), course, or keyword…"
                className="pl-12 h-14 text-base bg-white border-0 rounded-2xl shadow-2xl focus-visible:ring-2 focus-visible:ring-emerald-400"
              />
              {searchTerm && (
                <a href="#feed" className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700 hover:text-emerald-900">
                  See {filtered.length} results →
                </a>
              )}
            </div>

            {/* Live stats */}
            <div className="flex flex-wrap gap-6 mt-8 text-emerald-100/80 text-xs md:text-sm">
              <span className="flex items-center gap-2"><Flame className="w-4 h-4 text-orange-300" /><b className="text-white">{posts.length}</b> updates live</span>
              <span className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-emerald-300" /><b className="text-white">{categoryCounts["Admissions"] || 0}</b> admissions</span>
              <span className="flex items-center gap-2"><Award className="w-4 h-4 text-amber-300" /><b className="text-white">{categoryCounts["Scholarships"] || 0}</b> scholarships</span>
              <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-teal-300" /><b className="text-white">{schoolList.length}</b> institutions</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============= 2. NEWS SLIDESHOW ============= */}
      {!loading && slideShowPosts.length > 0 && (
        <section className="py-12 md:py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2">Latest News</p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 font-poppins">What's new</h2>
            </div>

            {/* Slideshow Container */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 group">
              {/* Main Slide */}
              <Link to={`/blog/${slideShowPosts[currentSlide].slug || slideShowPosts[currentSlide].id}`} className="block">
                <div className="relative h-96 md:h-[500px] overflow-hidden">
                  {slideShowPosts[currentSlide].featured_image_url ? (
                    <img 
                      src={slideShowPosts[currentSlide].featured_image_url} 
                      alt={slideShowPosts[currentSlide].title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-200 to-teal-200 text-6xl">
                      {CATEGORY_META[slideShowPosts[currentSlide].category || "News & Updates"]?.emoji || "📰"}
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`${CATEGORY_META[slideShowPosts[currentSlide].category || "News & Updates"].bg} ${CATEGORY_META[slideShowPosts[currentSlide].category || "News & Updates"].color} px-3 py-1 rounded-full text-xs font-bold`}>
                        {slideShowPosts[currentSlide].category || "News"}
                      </span>
                      {slideShowPosts[currentSlide].school && (
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                          {slideShowPosts[currentSlide].school}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl md:text-4xl font-bold mb-2 line-clamp-3">{slideShowPosts[currentSlide].title}</h3>
                    <p className="text-sm text-white/90 line-clamp-2">{slideShowPosts[currentSlide].excerpt || slideShowPosts[currentSlide].content?.replace(/<[^>]*>/g, '').substring(0, 150)}</p>
                  </div>
                </div>
              </Link>

              {/* Navigation Arrows */}
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + slideShowPosts.length) % slideShowPosts.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all backdrop-blur"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slideShowPosts.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all backdrop-blur"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {slideShowPosts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentSlide ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============= 3. BROWSE BY CATEGORY (COMPACT) ============= */}
      <section className="py-12 md:py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2">Browse by Category</p>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 font-poppins">Find what you need</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {QUICK_ACCESS.map((q) => {
              const Icon = q.icon;
              const count = categoryCounts[q.key] || 0;
              return (
                <button
                  key={q.key}
                  onClick={() => { setSelectedCategory(q.key); updateParam("category", q.key); setCurrentPage(1); document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="group relative overflow-hidden text-left rounded-lg p-3 bg-white border border-gray-200 hover:border-emerald-400 hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  <div className="relative">
                    <div className={`inline-flex w-8 h-8 rounded-lg bg-gradient-to-br ${q.gradient} items-center justify-center text-white mb-2 shadow`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-xs mb-0.5 line-clamp-2">{q.title}</h3>
                    <p className="text-[10px] text-gray-500 line-clamp-1">{count} updates</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============= 4. BROWSE BY SCHOOL ============= */}
      {featuredSchools.length > 0 && (
        <section className="py-12 md:py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2">Browse by School</p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 font-poppins">Pick your institution</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setSelectedSchool("All"); updateParam("school", "All"); setCurrentPage(1); document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" }); }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border-2 font-bold text-sm transition-all ${
                  selectedSchool === "All"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-gray-800 border-gray-200 hover:border-emerald-400"
                }`}
              >
                All Schools
              </button>
              {featuredSchools.map(({ school, count }) => {
                const active = selectedSchool === school;
                return (
                  <button
                    key={school}
                    onClick={() => {
                      setSelectedSchool(school);
                      updateParam("school", school);
                      setCurrentPage(1);
                      document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border-2 font-bold text-sm transition-all ${
                      active
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-gray-800 border-gray-200 hover:border-emerald-400"
                    }`}
                  >
                    <SchoolIcon className="w-3.5 h-3.5" />
                    {school}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${active ? "bg-white/20" : "bg-gray-100"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============= 4. BROWSE BY TOPIC ============= */}
      <section className="py-12 md:py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2">Browse by Topic</p>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 font-poppins">Jump into the latest campus beats</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BROWSE_BY_TOPIC.map((topic) => {
              const Icon = topic.icon;
              return (
                <button
                  key={topic.title}
                  onClick={() => {
                    setSelectedCategory(topic.category);
                    updateParam("category", topic.category);
                    setCurrentPage(1);
                    document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="group overflow-hidden rounded-3xl border border-gray-200 bg-slate-950 p-6 text-left text-white transition hover:-translate-y-0.5 hover:shadow-2xl"
                >
                  <div className={`inline-flex items-center justify-center rounded-2xl p-4 mb-5 bg-white/10 ${topic.gradient}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{topic.title}</h3>
                  <p className="text-sm text-slate-200/80 leading-relaxed">Quick access to top updates for this topic.</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============= 5. THE FEED & SIDEBAR ============= */}
      <section id="feed" className="py-12 md:py-16 px-4 bg-gray-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
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
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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

            <aside className="space-y-6">
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
                  <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white grid place-items-center"><FileText className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-blue-700 font-bold">Categories</p>
                    <h3 className="text-lg font-bold text-slate-900">Browse by topic</h3>
                  </div>
                </div>
                <div className="space-y-2">
                  {Object.entries(categoryCounts).sort((a,b)=>b[1]-a[1]).slice(0, 8).map(([category, count]) => (
                    <button
                      key={category}
                      onClick={() => { setSelectedCategory(category); updateParam("category", category); setCurrentPage(1); }}
                      className="flex w-full items-center justify-between rounded-2xl border border-gray-100 bg-slate-50 px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-white"
                    >
                      <span>{category}</span>
                      <span className="text-xs text-slate-500">{count}</span>
                    </button>
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

              <Card className="p-6 bg-slate-950 text-white border border-slate-900 shadow-xl">
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-3xl bg-emerald-500 grid place-items-center mb-4"><Mail className="w-5 h-5" /></div>
                  <h3 className="text-xl font-bold">Stay informed</h3>
                  <p className="mt-2 text-sm text-slate-200">Campus news, admissions & scholarships — delivered to your inbox.</p>
                </div>
                <div className="space-y-3">
                  <Input
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-400"
                  />
                  <Button
                    className="w-full rounded-2xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
                    onClick={() => setNewsletterSuccess(true)}
                  >
                    Subscribe
                  </Button>
                  {newsletterSuccess && (
                    <p className="text-sm text-emerald-200">Thanks! You’ll hear from us soon.</p>
                  )}
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </section>

      {/* ============= 6. CTA ============= */}
      <section className="py-14 md:py-20 px-4 bg-gradient-to-br from-emerald-900 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold font-poppins mb-4">Never miss an admission update</h2>
          <p className="text-emerald-100/85 mb-8 max-w-2xl mx-auto">
            From JAMB news to scholarship deadlines and admission forms — Campus Hub keeps every Nigerian student in the loop.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/akboy/services">
              <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold rounded-xl">
                Explore Akboy Services <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/akboy/mock-exam">
              <Button size="lg" variant="outline" className="border-2 border-white/40 bg-transparent text-white hover:bg-white/10 font-bold rounded-xl">
                Try Mock Exams
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </AkboyLayout>
  );
}
