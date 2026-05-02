import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import {
  Search, Calendar, ArrowRight, GraduationCap, School as SchoolIcon,
  Sparkles, Briefcase, BookOpen, Megaphone, Star, Users, MapPin,
  TrendingUp, Bell, Zap, Heart, Coffee, Target, Trophy, ChevronRight,
  Newspaper, Lightbulb, Filter, Flame
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
  "Events":             { color: "text-orange-700", bg: "bg-orange-100", emoji: "🎉", icon: Calendar },
  "Opportunities":      { color: "text-emerald-700", bg: "bg-emerald-100", emoji: "💼", icon: Briefcase },
  "Articles":           { color: "text-blue-700", bg: "bg-blue-100", emoji: "📝", icon: BookOpen },
  "Academic Resources": { color: "text-purple-700", bg: "bg-purple-100", emoji: "📚", icon: Lightbulb },
  "Campus Updates":     { color: "text-rose-700", bg: "bg-rose-100", emoji: "📢", icon: Megaphone },
  "Student Spotlight":  { color: "text-amber-700", bg: "bg-amber-100", emoji: "⭐", icon: Star },
};
const CATEGORIES = ["All", ...Object.keys(CATEGORY_META)];

const QUICK_ACCESS = [
  { key: "Events",             title: "Events",             desc: "Matriculations, hangouts, fests", icon: Calendar,   gradient: "from-orange-500 to-pink-500" },
  { key: "Opportunities",      title: "Opportunities",      desc: "Jobs, internships, scholarships", icon: Briefcase,  gradient: "from-emerald-500 to-teal-500" },
  { key: "Articles",           title: "Blog & Articles",    desc: "Stories, hot takes, advice",       icon: BookOpen,   gradient: "from-blue-500 to-indigo-500" },
  { key: "Academic Resources", title: "Academic Resources", desc: "PQs, syllabi, study tips",          icon: Lightbulb,  gradient: "from-purple-500 to-fuchsia-500" },
  { key: "Campus Updates",     title: "Campus Updates",     desc: "ASUU, calendar, news",              icon: Megaphone,  gradient: "from-rose-500 to-red-500" },
  { key: "Student Spotlight",  title: "Student Spotlight",  desc: "Real LASU Epe student voices",      icon: Star,       gradient: "from-amber-500 to-yellow-500" },
];

const STUDENT_VOICES = [
  { name: "Adaeze, 300L Mass Comm", quote: "Campus Hub literally saved my JAMB-to-LASU journey. I check it every morning before lectures.", avatar: "A" },
  { name: "Tunde, 200L Accounting", quote: "Found my first internship through the Opportunities feed. Akboy is the plug, no cap.", avatar: "T" },
  { name: "Halima, 400L Law",       quote: "I love that everything LASU Epe is finally in one place. No more hunting WhatsApp groups.", avatar: "H" },
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchPosts(); }, []);

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
      const matchCat = selectedCategory === "All" || (p.category || "Articles") === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [posts, searchTerm, selectedCategory]);

  const trending = useMemo(() => posts.slice(0, 5), [posts]);
  const events = useMemo(() => posts.filter(p => p.category === "Events").slice(0, 3), [posts]);
  const opportunities = useMemo(() => posts.filter(p => p.category === "Opportunities").slice(0, 4), [posts]);
  const articles = useMemo(() => posts.filter(p => p.category === "Articles" || p.category === "Academic Resources").slice(0, 6), [posts]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach(p => { const c = p.category || "Articles"; counts[c] = (counts[c] || 0) + 1; });
    return counts;
  }, [posts]);

  const PostCard = ({ post, compact = false }: { post: CampusPost; compact?: boolean }) => {
    const meta = CATEGORY_META[post.category || "Articles"] || CATEGORY_META["Articles"];
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
            <div className="absolute top-3 left-3 flex gap-2">
              <span className={`${meta.bg} ${meta.color} px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm`}>
                {meta.emoji} {post.category || "Articles"}
              </span>
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

  return (
    <AkboyLayout title="Campus Hub — LASU Epe Student Hub" description="Your campus, one hub. Events, opportunities, blog, resources & spotlights for LASU Epe students.">
      {/* ============= 1. HERO ============= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-full text-emerald-100 text-xs md:text-sm font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              LASU EPE CAMPUS · POWERED BY AKBOY
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-5 font-poppins leading-[1.05]">
              Your Campus.<br/>
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-100 bg-clip-text text-transparent">One Hub.</span>
            </h1>
            <p className="text-base md:text-xl text-emerald-50/90 mb-8 max-w-2xl leading-relaxed">
              Everything LASU Epe in one place — events, opportunities, the latest gist, study resources, and stories from real students. Skip the WhatsApp chaos.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <a href="#feed">
                <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold rounded-xl shadow-xl">
                  <Sparkles className="w-4 h-4 mr-1" /> Explore the Hub
                </Button>
              </a>
              <a href="#events">
                <Button size="lg" variant="outline" className="border-2 border-white/40 bg-transparent text-white hover:bg-white/10 font-bold rounded-xl">
                  <Calendar className="w-4 h-4 mr-1" /> Upcoming Events
                </Button>
              </a>
              <Link to="/akboy/contact">
                <Button size="lg" variant="ghost" className="text-emerald-100 hover:bg-white/10 font-bold rounded-xl">
                  <Users className="w-4 h-4 mr-1" /> Join Community
                </Button>
              </Link>
            </div>

            {/* Live search */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-700" />
              <Input
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); updateParam("q", e.target.value); }}
                placeholder="Search admissions, events, scholarships, lecturers..."
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
              <span className="flex items-center gap-2"><Flame className="w-4 h-4 text-orange-300" /><b className="text-white">{posts.length}</b> posts live</span>
              <span className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-emerald-300" /><b className="text-white">{categoryCounts["Opportunities"] || 0}</b> opportunities</span>
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-orange-300" /><b className="text-white">{categoryCounts["Events"] || 0}</b> events</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============= 2. QUICK ACCESS GRID ============= */}
      <section className="py-12 md:py-16 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2">Quick Access</p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 font-poppins">What do you need today?</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
            {QUICK_ACCESS.map((q) => {
              const Icon = q.icon;
              const count = categoryCounts[q.key] || 0;
              return (
                <button
                  key={q.key}
                  onClick={() => { setSelectedCategory(q.key); updateParam("category", q.key); document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="group relative overflow-hidden text-left rounded-2xl p-4 md:p-6 bg-white border border-gray-200 hover:border-transparent hover:shadow-2xl transition-all hover:-translate-y-1"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${q.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  <div className="relative">
                    <div className={`inline-flex w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${q.gradient} items-center justify-center text-white mb-3 shadow-lg`}>
                      <Icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-white text-sm md:text-base mb-1">{q.title}</h3>
                    <p className="text-[11px] md:text-xs text-gray-500 group-hover:text-white/90 line-clamp-2">{q.desc}</p>
                    <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-700 group-hover:text-white">
                      {count} live <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============= 3. TRENDING ============= */}
      {!loading && trending.length > 0 && (
        <section className="py-12 md:py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">Trending Now</p>
                  <h2 className="text-xl md:text-3xl font-bold text-gray-900 font-poppins">What's hot on campus</h2>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2"><PostCard post={trending[0]} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
                {trending.slice(1, 3).map(p => <PostCard key={p.id} post={p} compact />)}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============= 4. EVENTS ============= */}
      <section id="events" className="py-12 md:py-16 px-4 bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-2">📅 Upcoming Events</p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 font-poppins">Don't miss out</h2>
            </div>
            <button onClick={() => { setSelectedCategory("Events"); updateParam("category", "Events"); document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" }); }}
              className="text-sm font-bold text-orange-700 hover:text-orange-900 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {events.length === 0 ? (
            <Card className="p-8 text-center bg-white/60 border-dashed border-2 border-orange-200">
              <Calendar className="w-12 h-12 text-orange-400 mx-auto mb-3" />
              <p className="text-gray-700 font-medium">No events posted yet — check back soon!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {events.map(p => <PostCard key={p.id} post={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ============= 5. OPPORTUNITIES ============= */}
      <section className="py-12 md:py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2">💼 Opportunities</p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 font-poppins">Land your next big move</h2>
              <p className="text-sm md:text-base text-gray-600 mt-1">Internships, scholarships, admissions & gigs.</p>
            </div>
            <button onClick={() => { setSelectedCategory("Opportunities"); updateParam("category", "Opportunities"); document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" }); }}
              className="text-sm font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {opportunities.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-2 border-emerald-200">
              <Briefcase className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-gray-700 font-medium">New opportunities drop here weekly.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {opportunities.map(p => <PostCard key={p.id} post={p} compact />)}
            </div>
          )}
        </div>
      </section>

      {/* ============= 6. BLOG / ARTICLES ============= */}
      <section className="py-12 md:py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2">📝 From the Blog</p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 font-poppins">Reads for the smart student</h2>
            </div>
          </div>
          {articles.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-2 border-blue-200">
              <BookOpen className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <p className="text-gray-700 font-medium">Articles coming soon.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.map(p => <PostCard key={p.id} post={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ============= 7. STUDENT COMMUNITY ============= */}
      <section className="py-14 md:py-20 px-4 bg-gradient-to-br from-emerald-900 to-teal-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest mb-2">👥 Student Community</p>
            <h2 className="text-3xl md:text-5xl font-bold font-poppins mb-3">Real students. Real voices.</h2>
            <p className="text-emerald-100/80 max-w-2xl mx-auto">From 100L freshers to final-year prefects — Campus Hub is built around the LASU Epe vibe.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STUDENT_VOICES.map((v, i) => (
              <Card key={i} className="p-6 bg-white/5 backdrop-blur border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-300 flex items-center justify-center text-emerald-900 font-extrabold text-lg shadow-lg">
                    {v.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{v.name}</p>
                    <p className="text-[11px] text-emerald-200/70">LASU Epe</p>
                  </div>
                </div>
                <p className="text-sm text-emerald-50/90 leading-relaxed italic">"{v.quote}"</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============= 8. THE FEED (filtered) ============= */}
      <section id="feed" className="py-12 md:py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">📰 The Feed</p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 font-poppins">Everything in one stream</h2>
              <p className="text-sm text-gray-600 mt-1">
                Showing <b className="text-emerald-700">{filtered.length}</b> {filtered.length === 1 ? "post" : "posts"}
                {selectedCategory !== "All" && <> in <b className="text-emerald-700">{selectedCategory}</b></>}
              </p>
            </div>
          </div>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            {CATEGORIES.map(c => {
              const meta = c === "All" ? null : CATEGORY_META[c];
              const active = selectedCategory === c;
              const count = c === "All" ? posts.length : (categoryCounts[c] || 0);
              return (
                <button
                  key={c}
                  onClick={() => { setSelectedCategory(c); updateParam("category", c); }}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs md:text-sm font-bold border-2 transition-all ${
                    active
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-lg"
                      : "bg-white text-gray-700 border-gray-200 hover:border-emerald-400 hover:text-emerald-700"
                  }`}
                >
                  {meta ? `${meta.emoji} ${c}` : `🌍 All`} <span className="opacity-70">({count})</span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-6 text-gray-600">Loading the hub...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchPosts} className="bg-emerald-600 hover:bg-emerald-700">Try Again</Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Nothing matches that</h3>
              <p className="text-gray-600 mb-6">Try a different category or clear your search.</p>
              <Button onClick={() => { setSearchTerm(""); setSelectedCategory("All"); setSearchParams({}, { replace: true }); }}
                className="bg-emerald-600 hover:bg-emerald-700">Reset filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.slice(0, 30).map(p => <PostCard key={p.id} post={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ============= 9. JOIN CTA ============= */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wide">
            <Heart className="w-4 h-4" /> Join the Movement
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 font-poppins">
            Be part of the <span className="text-emerald-600">Campus Hub</span> family
          </h2>
          <p className="text-base md:text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Get the latest LASU Epe gist, opportunities and admissions delivered straight to your phone. Built by students, for students.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/akboy/contact">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xl">
                <Users className="w-5 h-5 mr-1" /> Join the Community
              </Button>
            </Link>
            <Link to="/akboy/services">
              <Button size="lg" variant="outline" className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl">
                <Zap className="w-5 h-5 mr-1" /> Explore AKBOY Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </AkboyLayout>
  );
}
