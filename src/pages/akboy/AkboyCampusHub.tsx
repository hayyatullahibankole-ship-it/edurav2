import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Search, Calendar, ArrowRight, Tag, GraduationCap, School as SchoolIcon, Filter } from "lucide-react";

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

const CATEGORIES = [
  "All",
  "Admission List",
  "Exam Tips",
  "Opportunities",
  "School Updates",
  "News",
  "Updates",
  "Education",
];

const INSTITUTION_TYPES = ["All", "University", "Polytechnic", "College of Education", "Other"];

export default function AkboyCampusHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<CampusPost[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [selectedInstitution, setSelectedInstitution] = useState(searchParams.get("type") || "All");
  const [selectedSchool, setSelectedSchool] = useState(searchParams.get("school") || "All");
  const [selectedYear, setSelectedYear] = useState(searchParams.get("year") || "All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, content, featured_image_url, category, tags, created_at, school, institution_type, year")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setPosts((data as any) || []);
    } catch (err) {
      console.error("Error fetching campus posts:", err);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const schools = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.school && set.add(p.school));
    return ["All", ...Array.from(set).sort()];
  }, [posts]);

  const years = useMemo(() => {
    const set = new Set<number>();
    posts.forEach((p) => p.year && set.add(p.year));
    return ["All", ...Array.from(set).sort((a, b) => b - a).map(String)];
  }, [posts]);

  const filtered = posts.filter((p) => {
    const text = `${p.title || ""} ${p.excerpt || ""} ${p.school || ""}`.toLowerCase();
    const matchSearch = !searchTerm || text.includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === "All" || (p.category || "").toLowerCase() === selectedCategory.toLowerCase();
    const matchInst = selectedInstitution === "All" || (p.institution_type || "").toLowerCase() === selectedInstitution.toLowerCase();
    const matchSchool = selectedSchool === "All" || p.school === selectedSchool;
    const matchYear = selectedYear === "All" || String(p.year || "") === selectedYear;
    return matchSearch && matchCat && matchInst && matchSchool && matchYear;
  });

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== "All") next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  return (
    <AkboyLayout>
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-emerald-950">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-6 px-5 py-2 bg-emerald-800 border border-emerald-700 rounded-full text-emerald-100 text-sm font-semibold">
            <GraduationCap className="w-4 h-4" />
            ADMISSION INTELLIGENCE
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white font-poppins">
            Campus Hub
          </h1>
          <p className="text-lg md:text-xl text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            Admission lists, exam tips, school updates and student opportunities — all in one place.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 px-4 bg-white border-b border-gray-100 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
            <Input
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); updateParam("q", e.target.value); }}
              placeholder="Search by school, exam, or topic..."
              className="pl-12 h-12 text-base border-2 border-emerald-200 focus:border-emerald-500 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); updateParam("category", e.target.value); }}
              className="h-11 px-3 rounded-lg border-2 border-emerald-200 bg-white text-sm font-medium text-gray-800"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>📚 {c}</option>)}
            </select>
            <select
              value={selectedInstitution}
              onChange={(e) => { setSelectedInstitution(e.target.value); updateParam("type", e.target.value); }}
              className="h-11 px-3 rounded-lg border-2 border-emerald-200 bg-white text-sm font-medium text-gray-800"
            >
              {INSTITUTION_TYPES.map((c) => <option key={c} value={c}>🏛️ {c}</option>)}
            </select>
            <select
              value={selectedSchool}
              onChange={(e) => { setSelectedSchool(e.target.value); updateParam("school", e.target.value); }}
              className="h-11 px-3 rounded-lg border-2 border-emerald-200 bg-white text-sm font-medium text-gray-800"
            >
              {schools.map((c) => <option key={c} value={c}>🎓 {c}</option>)}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => { setSelectedYear(e.target.value); updateParam("year", e.target.value); }}
              className="h-11 px-3 rounded-lg border-2 border-emerald-200 bg-white text-sm font-medium text-gray-800"
            >
              {years.map((c) => <option key={c} value={c}>📅 {c}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-6 text-gray-600">Loading posts...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchPosts} className="bg-emerald-600 hover:bg-emerald-700">Try Again</Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No matching posts</h3>
              <p className="text-gray-600">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-sm text-gray-600 font-medium">
                Showing <span className="text-emerald-700 font-bold">{filtered.length}</span> {filtered.length === 1 ? "post" : "posts"}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug || post.id}`}
                    className="group"
                  >
                    <Card className="overflow-hidden border border-gray-200 hover:border-emerald-400 hover:shadow-xl transition-all duration-300 rounded-xl bg-white h-full flex flex-col">
                      <div className="relative h-48 overflow-hidden bg-emerald-50 flex-shrink-0">
                        {post.featured_image_url ? (
                          <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-emerald-100">
                            <SchoolIcon className="w-12 h-12 text-emerald-600" />
                          </div>
                        )}
                        {post.category && (
                          <span className="absolute top-3 left-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                            {post.category}
                          </span>
                        )}
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {post.created_at ? new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent"}
                          </span>
                          {post.year && <span className="text-emerald-700 font-semibold">{post.year}</span>}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                          {post.title}
                        </h3>
                        {post.school && (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mb-2">
                            <SchoolIcon className="w-3.5 h-3.5" />
                            <span className="truncate">{post.school}</span>
                          </div>
                        )}
                        <p className="text-sm text-gray-600 line-clamp-2 flex-grow mb-4">
                          {post.excerpt || post.content?.substring(0, 120)}
                        </p>
                        <div className="inline-flex items-center gap-2 text-emerald-600 font-bold text-sm group-hover:gap-3 transition-all mt-auto">
                          Read More
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </AkboyLayout>
  );
}
