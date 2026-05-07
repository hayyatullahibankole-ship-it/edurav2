import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import {
  ArrowUpRight, ArrowRight, Sparkles, BookOpen, Palette, Code, GraduationCap,
  Star, Zap, Layers, MousePointer2, Play, CheckCircle2, Phone
} from "lucide-react";
import hero1 from "@/assets/akboy-hero-1.jpg";
import hero2 from "@/assets/akboy-hero-2.jpg";
import hero3 from "@/assets/akboy-hero-3.jpg";

const FOREST = "#0F3D2E";
const BUTTER = "#F4E27A";
const CREAM = "#FAF7F0";

export default function AkboyHome() {
  const { isAkboy } = useDomainDetection();
  const basePath = isAkboy ? "" : "/akboy";
  const [posts, setPosts] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("blog_posts").select("*").eq("is_published", true)
      .order("created_at", { ascending: false }).limit(3)
      .then(({ data }) => setPosts(data || []));
    supabase.from("akboy_portfolio").select("*").eq("is_active", true)
      .order("display_order", { ascending: true }).limit(4)
      .then(({ data }) => setPortfolio(data || []));
  }, []);

  const services = [
    { icon: Palette, title: "Brand & Graphics Design", desc: "Logos, identity systems, social kits, and pitch decks crafted to make you unmissable.", tag: "Design" },
    { icon: Code, title: "Web & Product Development", desc: "Fast, modern websites and platforms built with React, Tailwind & best-in-class tooling.", tag: "Build" },
    { icon: GraduationCap, title: "Tutorials & Mock Exams", desc: "JAMB, WAEC and post-UTME prep with realistic CBT simulation and analytics.", tag: "Learn" },
    { icon: BookOpen, title: "Admission Consultancy", desc: "Cut-off strategy, school choice, and eligibility checks — guided by experts.", tag: "Guide" },
  ];

  const process = [
    { n: "01", t: "Discover", d: "Quick call to understand your goal — admission, brand, or product." },
    { n: "02", t: "Design", d: "We map the strategy and ship a sharp, modern visual direction." },
    { n: "03", t: "Deliver", d: "Production-ready files, deployed sites, or a fully prepared student." },
  ];

  const tools = ["Figma", "React", "Tailwind", "Supabase", "Adobe CC", "Webflow"];

  return (
    <AkboyLayout>
      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{ background: `radial-gradient(1200px 600px at 80% -10%, ${BUTTER}40, transparent 60%), ${CREAM}` }}
      >
        {/* grid lines */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
             style={{ backgroundImage: `linear-gradient(${FOREST} 1px, transparent 1px), linear-gradient(90deg, ${FOREST} 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-24 pb-20 lg:pb-32">
          {/* eyebrow pill */}
          <div className="inline-flex items-center gap-2 bg-white border border-black/5 shadow-sm rounded-full pl-1.5 pr-4 py-1 mb-8">
            <span className="bg-[#0F3D2E] text-[#F4E27A] text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">New</span>
            <span className="text-xs font-medium text-[#0F3D2E]">Now booking Q2 design retainers</span>
            <ArrowRight className="w-3 h-3 text-[#0F3D2E]" />
          </div>

          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8">
              <h1 className="text-[3rem] sm:text-7xl lg:text-[7rem] leading-[0.95] font-bold text-[#0F3D2E] tracking-[-0.04em]">
                Design <span className="italic font-medium" style={{fontFamily:'Fraunces, serif'}}>solutions</span><br/>
                for ambitious<br/>
                <span className="relative inline-block">
                  <span className="relative z-10">brands & students.</span>
                  <span className="absolute inset-x-0 bottom-2 h-4 lg:h-6 bg-[#F4E27A] -z-0 -skew-x-6" />
                </span>
              </h1>

              <p className="mt-8 text-lg lg:text-xl text-[#0F3D2E]/70 max-w-2xl leading-relaxed">
                Akboy is a design & education studio helping Nigerian creators ship bold brands, modern websites,
                and admission-winning prep — all under one roof.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="bg-[#0F3D2E] hover:bg-[#0F3D2E]/90 text-white rounded-full h-12 px-7 text-base shadow-lg shadow-[#0F3D2E]/20">
                  <Link to={`${basePath}/contact`}>
                    Start a project
                    <ArrowUpRight className="ml-1.5 w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-6 text-base border-[#0F3D2E]/15 bg-white hover:bg-white text-[#0F3D2E] hover:text-[#0F3D2E]">
                  <Link to={`${basePath}/portfolio`}>
                    <Play className="w-4 h-4 mr-1.5 fill-[#0F3D2E]" /> See our work
                  </Link>
                </Button>
              </div>

              {/* trust strip */}
              <div className="mt-12 flex flex-wrap items-center gap-6">
                <div className="flex -space-x-2">
                  {[hero1, hero2, hero3].map((src, i) => (
                    <img key={i} src={src} alt="" className="w-9 h-9 rounded-full border-2 border-[#FAF7F0] object-cover" />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {Array.from({length:5}).map((_,i)=>(<Star key={i} className="w-3.5 h-3.5 fill-[#F4E27A] text-[#F4E27A]"/>))}
                    <span className="ml-1.5 text-sm font-semibold text-[#0F3D2E]">4.9</span>
                  </div>
                  <p className="text-xs text-[#0F3D2E]/60">Trusted by 1,200+ students & 50+ brands</p>
                </div>
              </div>
            </div>

            {/* Floating product card */}
            <div className="lg:col-span-4 relative">
              <div className="relative">
                <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-[#0F3D2E] relative shadow-2xl shadow-[#0F3D2E]/20">
                  <img src={hero1} alt="Akboy studio" className="w-full h-full object-cover"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F3D2E] via-[#0F3D2E]/30 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <div className="text-[10px] uppercase tracking-widest text-[#F4E27A] mb-1">Featured</div>
                    <div className="text-lg font-bold leading-tight">Studio · Class of 2026</div>
                    <div className="text-xs text-white/70 mt-0.5">Design + Education, in one hub</div>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/15 backdrop-blur border border-white/20 rounded-full px-2.5 py-1 text-[10px] text-white font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F4E27A] animate-pulse"/> LIVE
                  </div>
                </div>
                {/* metrics card */}
                <div className="absolute -left-4 lg:-left-10 top-10 bg-white rounded-2xl border border-black/5 shadow-xl p-3.5 w-44 hidden sm:block">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-[#F4E27A] rounded-lg grid place-items-center"><Zap className="w-3.5 h-3.5 text-[#0F3D2E]"/></div>
                    <span className="text-[10px] uppercase tracking-widest text-[#0F3D2E]/60 font-bold">Avg. delivery</span>
                  </div>
                  <div className="text-2xl font-bold text-[#0F3D2E]">7 days</div>
                  <div className="text-[10px] text-[#0F3D2E]/50">Brand identity packs</div>
                </div>
                {/* corner badge */}
                <div className="absolute -right-3 -bottom-3 bg-[#F4E27A] text-[#0F3D2E] rounded-2xl p-3 shadow-xl rotate-3">
                  <div className="text-[10px] uppercase tracking-widest font-bold">Est.</div>
                  <div className="text-2xl font-bold leading-none">2020</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE / Tools */}
      <section className="bg-[#0F3D2E] py-6 overflow-hidden">
        <div className="flex gap-12 animate-[marquee_25s_linear_infinite] whitespace-nowrap">
          {Array.from({length:6}).map((_,r)=>(
            <div key={r} className="flex gap-12 shrink-0 items-center">
              {tools.map(t => (
                <span key={t+r} className="text-[#F4E27A]/90 text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-12">
                  {t} <span className="w-2 h-2 rounded-full bg-[#F4E27A]/40" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES grid */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#0F3D2E]/60 font-bold mb-4">
                <span className="w-6 h-px bg-[#0F3D2E]/40" /> What we do
              </div>
              <h2 className="text-4xl lg:text-6xl font-bold text-[#0F3D2E] tracking-[-0.03em] leading-[1.05]">
                Four services.<br/>One studio standard.
              </h2>
            </div>
            <Link to={`${basePath}/services`} className="group inline-flex items-center gap-2 text-sm font-semibold text-[#0F3D2E]">
              All services
              <span className="w-9 h-9 rounded-full bg-[#0F3D2E] grid place-items-center group-hover:bg-[#F4E27A] transition-colors">
                <ArrowRight className="w-4 h-4 text-white group-hover:text-[#0F3D2E]"/>
              </span>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {services.map((s) => (
              <div key={s.title} className="group relative bg-[#FAF7F0] rounded-3xl p-7 lg:p-9 hover:bg-[#0F3D2E] transition-all duration-500 overflow-hidden cursor-pointer border border-black/5">
                <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-[#F4E27A]/0 group-hover:bg-[#F4E27A]/10 transition-all duration-500"/>
                <div className="flex items-start justify-between mb-12">
                  <div className="w-12 h-12 rounded-2xl bg-white group-hover:bg-[#F4E27A] grid place-items-center transition-colors">
                    <s.icon className="w-5 h-5 text-[#0F3D2E]"/>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-white text-[#0F3D2E] group-hover:bg-[#F4E27A]">{s.tag}</span>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-[#0F3D2E] group-hover:text-white tracking-tight mb-3 transition-colors">{s.title}</h3>
                <p className="text-[#0F3D2E]/70 group-hover:text-white/70 leading-relaxed transition-colors mb-6">{s.desc}</p>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F3D2E] group-hover:text-[#F4E27A] transition-colors">
                  Learn more <ArrowUpRight className="w-4 h-4"/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS — stepped */}
      <section className="bg-[#FAF7F0] py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#0F3D2E]/60 font-bold mb-4">
              <Layers className="w-3 h-3"/> Our process
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-[#0F3D2E] tracking-[-0.03em] leading-[1.05]">
              From idea to impact in 3 sharp steps.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 lg:gap-6 relative">
            {process.map((p, i) => (
              <div key={p.n} className="relative bg-white rounded-3xl p-7 border border-black/5 hover:shadow-xl transition-shadow">
                <div className="text-[#F4E27A] text-7xl font-bold leading-none tracking-tighter">{p.n}</div>
                <h3 className="text-2xl font-bold text-[#0F3D2E] mt-4 tracking-tight">{p.t}</h3>
                <p className="text-[#0F3D2E]/70 mt-2 text-sm leading-relaxed">{p.d}</p>
                {i < process.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-[#0F3D2E]/30 z-10"/>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORK / portfolio teaser */}
      {portfolio.length > 0 && (
        <section className="bg-white py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#0F3D2E]/60 font-bold mb-4">
                  <MousePointer2 className="w-3 h-3"/> Selected work
                </div>
                <h2 className="text-4xl lg:text-6xl font-bold text-[#0F3D2E] tracking-[-0.03em] leading-[1.05]">
                  Recent projects.
                </h2>
              </div>
              <Link to={`${basePath}/portfolio`} className="text-sm font-semibold text-[#0F3D2E] inline-flex items-center gap-2 hover:gap-3 transition-all">
                View all <ArrowRight className="w-4 h-4"/>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
              {portfolio.slice(0, 4).map((p, i) => (
                <div key={p.id} className={`group relative aspect-[4/3] rounded-3xl overflow-hidden bg-[#0F3D2E] ${i === 0 ? "md:col-span-2 md:aspect-[16/8]" : ""}`}>
                  {p.image_url && <img src={p.image_url} alt={p.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F3D2E] via-transparent to-transparent"/>
                  <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 text-white flex items-end justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-[#F4E27A] mb-1">{p.category || "Project"}</div>
                      <h3 className="text-xl lg:text-2xl font-bold tracking-tight">{p.title}</h3>
                    </div>
                    <div className="w-11 h-11 rounded-full bg-[#F4E27A] grid place-items-center">
                      <ArrowUpRight className="w-5 h-5 text-[#0F3D2E]"/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* WHY US */}
      <section className="bg-[#0F3D2E] py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#F4E27A]/10 blur-3xl"/>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Sparkles className="w-8 h-8 text-[#F4E27A] mb-5"/>
              <h2 className="text-4xl lg:text-6xl font-bold text-white tracking-[-0.03em] leading-[1.05]">
                Built like a startup.<br/>
                Crafted like a <span className="text-[#F4E27A]">studio.</span>
              </h2>
              <p className="text-white/70 mt-6 text-lg leading-relaxed max-w-lg">
                Akboy combines design rigor with educational depth — so the same team that builds your brand can prep your students for JAMB.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-[#F4E27A] text-[#0F3D2E] hover:bg-[#F4E27A]/90 rounded-full h-12 px-7">
                  <Link to={`${basePath}/about`}>About the studio <ArrowUpRight className="ml-1 w-4 h-4"/></Link>
                </Button>
                <a href="https://wa.me/2348101466977" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 h-12 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors text-sm font-semibold">
                  <Phone className="w-4 h-4"/> Chat on WhatsApp
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { v: "200+", l: "Projects shipped" },
                { v: "50+", l: "Brands served" },
                { v: "1.2k", l: "Students taught" },
                { v: "98%", l: "Satisfaction rate" },
              ].map((s) => (
                <div key={s.l} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                  <div className="text-4xl lg:text-5xl font-bold text-white tracking-tight">{s.v}</div>
                  <div className="text-xs text-[#F4E27A]/80 uppercase tracking-widest mt-2 font-semibold">{s.l}</div>
                </div>
              ))}
              <div className="col-span-2 bg-[#F4E27A] rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#0F3D2E] grid place-items-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-[#F4E27A]"/>
                </div>
                <div>
                  <div className="font-bold text-[#0F3D2E]">Award-winning team</div>
                  <div className="text-xs text-[#0F3D2E]/70">Recognized for excellence in edtech & design '24</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JOURNAL */}
      {posts.length > 0 && (
        <section className="bg-white py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#0F3D2E]/60 font-bold mb-4">
                  <span className="w-6 h-px bg-[#0F3D2E]/40" /> Insights
                </div>
                <h2 className="text-4xl lg:text-6xl font-bold text-[#0F3D2E] tracking-[-0.03em] leading-[1.05]">
                  From the journal.
                </h2>
              </div>
              <Link to={`${basePath}/blog`} className="text-sm font-semibold text-[#0F3D2E] inline-flex items-center gap-2 hover:gap-3 transition-all">
                Read all <ArrowRight className="w-4 h-4"/>
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {posts.map((p) => (
                <Link key={p.id} to={`${basePath}/blog/${p.slug || p.id}`} className="group block">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#FAF7F0] mb-4">
                    {p.cover_image ? (
                      <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#0F3D2E] to-[#0F3D2E]/70 grid place-items-center">
                        <BookOpen className="w-10 h-10 text-[#F4E27A]"/>
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-[#0F3D2E]/50 mb-1.5 font-bold">
                    {new Date(p.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-[#0F3D2E] tracking-tight leading-snug group-hover:text-[#0F3D2E]/70 transition-colors">{p.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className="bg-[#FAF7F0] py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
             style={{ backgroundImage: `radial-gradient(${FOREST} 1.5px, transparent 1.5px)`, backgroundSize: '32px 32px' }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-5xl lg:text-8xl font-bold text-[#0F3D2E] tracking-[-0.04em] leading-[0.95]">
            Ready to <span className="italic font-medium" style={{fontFamily:'Fraunces, serif'}}>level up?</span>
          </h2>
          <p className="mt-6 text-lg text-[#0F3D2E]/70 max-w-xl mx-auto">
            Whether you need a brand, a website, or admission guidance — let's build something worth talking about.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-[#0F3D2E] hover:bg-[#0F3D2E]/90 text-white rounded-full h-12 px-8 shadow-lg shadow-[#0F3D2E]/20">
              <Link to={`${basePath}/contact`}>Start a project <ArrowUpRight className="ml-1.5 w-4 h-4"/></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-7 border-[#0F3D2E]/15 bg-white text-[#0F3D2E]">
              <Link to={`${basePath}/services`}>Explore services</Link>
            </Button>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </AkboyLayout>
  );
}
