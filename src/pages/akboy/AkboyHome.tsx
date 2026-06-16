import { Link } from "react-router-dom";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import {
  ArrowRight, ArrowUpRight, GraduationCap, Palette, Code, BookOpen,
  Megaphone, Heart, Star, Quote, MessageCircle, Sparkles, Search,
  Trophy, Users, CheckCircle2, Play, TrendingUp, Award, Briefcase,
  Layers, Zap, Globe, BookMarked,
} from "lucide-react";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import hero1 from "@/assets/akboy-hero-1.jpg";
import hero2 from "@/assets/akboy-hero-2.jpg";
import hero3 from "@/assets/akboy-hero-3.jpg";
import hero4 from "@/assets/akboy-hero-4.jpg";

/* ============================================================
   AKBOY — Souice-inspired premium SaaS layout
   Light airy hero · floating glass cards · dark stats panel
   Asymmetric bento · pricing strip · Forest & Moss palette
   ============================================================ */

const Pill = ({ children, dark }: { children: React.ReactNode; dark?: boolean }) => (
  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur text-[10px] font-bold uppercase tracking-[0.18em] ${
    dark
      ? "bg-white/8 border-white/15 text-akboy-moss"
      : "bg-white/70 border-akboy-ink/5 text-akboy-forest/70 shadow-sm"
  }`}>
    <span className="w-1.5 h-1.5 rounded-full bg-akboy-moss animate-pulse" />
    {children}
  </div>
);

const Eyebrow = ({ children, dark }: { children: React.ReactNode; dark?: boolean }) => (
  <span className={`text-[10px] font-bold uppercase tracking-[0.22em] ${dark ? "text-akboy-moss" : "text-akboy-forest/55"}`}>
    {children}
  </span>
);

/* ---------------- HERO (Souice-style: copy left, floating glass right) ---------------- */
function Hero({ basePath }: { basePath: string }) {
  return (
    <section className="relative px-5 sm:px-8 pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden">
      {/* Soft mesh background */}
      <div className="absolute inset-0 akboy-gradient-mesh opacity-60 pointer-events-none" />
      <div className="absolute -top-32 right-1/4 w-[40rem] h-[40rem] bg-akboy-moss/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-12 items-center">
        {/* Copy */}
        <div className="space-y-7">
          <Pill>Next Intake · March 2026</Pill>

          <h1 className="text-[2.75rem] sm:text-5xl lg:text-[4.25rem] xl:text-7xl font-extrabold leading-[0.98] tracking-[-0.03em] text-akboy-ink">
            Grow your future<br />
            with <span className="italic font-serif text-akboy-forest">smart</span>{" "}
            <span className="text-akboy-forest">creative solutions.</span>
          </h1>

          <p className="text-base sm:text-lg text-akboy-ink/60 max-w-lg leading-relaxed">
            AKBOY Creative Hub blends admission consultancy, tutorials, design and
            digital training into one premium ecosystem for students, schools and brands.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-md">
            <Link
              to={`${basePath}/services`}
              className="flex-1 py-3.5 px-6 rounded-full bg-akboy-forest text-akboy-cream font-bold text-sm shadow-xl shadow-akboy-forest/25 flex items-center justify-center gap-2 hover:bg-akboy-forest-deep active:scale-[0.98] transition-all"
            >
              Get Started
              <ArrowRight className="w-4 h-4 text-akboy-moss" />
            </Link>
            <Link
              to={`${basePath}/contact`}
              className="flex-1 py-3.5 px-6 rounded-full bg-white text-akboy-forest font-bold text-sm border border-akboy-ink/8 shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" /> Explore
            </Link>
          </div>

          {/* Trust row */}
          <div className="flex items-center gap-5 pt-3">
            <div className="flex -space-x-2.5">
              {[hero1, hero2, hero3, hero4].map((src, i) => (
                <img key={i} src={src} alt="" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5 text-akboy-moss">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                <span className="ml-1.5 text-xs font-bold text-akboy-ink">4.9</span>
              </div>
              <div className="text-xs text-akboy-ink/55 mt-0.5">1,200+ students & brands trust us</div>
            </div>
          </div>
        </div>

        {/* Floating glass composition */}
        <div className="relative h-[440px] lg:h-[520px]">
          {/* Glass plate (back) */}
          <div className="absolute right-0 top-8 w-[78%] aspect-square rounded-[2.5rem] bg-gradient-to-br from-akboy-moss/30 via-white/40 to-akboy-emerald/20 backdrop-blur-xl border border-white/60 shadow-2xl shadow-akboy-forest/15" />

          {/* Hero portrait */}
          <div className="absolute right-6 top-16 w-[64%] aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl ring-4 ring-white/60 akboy-float-slow">
            <img src={hero2} alt="AKBOY students" className="w-full h-full object-cover" />
          </div>

          {/* Floating glass card — Success */}
          <div className="absolute top-0 left-0 lg:left-4 bg-white/85 backdrop-blur-xl border border-white shadow-2xl shadow-akboy-forest/15 rounded-2xl p-4 pr-6 flex items-center gap-3 akboy-float-slow" style={{ animationDelay: "0.5s" }}>
            <div className="w-11 h-11 rounded-xl bg-akboy-moss/25 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-akboy-forest" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-akboy-ink/55">Avg JAMB</p>
              <p className="text-base font-extrabold text-akboy-ink leading-tight">320+ Score</p>
            </div>
          </div>

          {/* Floating glass card — Admission */}
          <div className="absolute bottom-12 left-0 bg-akboy-forest text-white rounded-2xl p-4 pr-6 shadow-2xl flex items-center gap-3 border border-white/10 akboy-float-slow" style={{ animationDelay: "1.5s" }}>
            <div className="w-11 h-11 rounded-xl bg-akboy-moss/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-akboy-moss" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/55">Admission</p>
              <p className="text-base font-extrabold leading-tight">98% Success</p>
            </div>
          </div>

          {/* Floating mini icon tile — Design */}
          <div className="hidden sm:flex absolute top-32 right-0 w-14 h-14 bg-white/90 backdrop-blur border border-white rounded-2xl shadow-xl items-center justify-center akboy-float-slow" style={{ animationDelay: "1s" }}>
            <Palette className="w-6 h-6 text-akboy-forest" />
          </div>
          <div className="hidden sm:flex absolute bottom-4 right-12 w-14 h-14 bg-akboy-moss/90 rounded-2xl shadow-xl items-center justify-center akboy-float-slow" style={{ animationDelay: "2s" }}>
            <Code className="w-6 h-6 text-akboy-forest" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- DARK STATS PANEL (Souice signature) ---------------- */
function StatsPanel() {
  return (
    <section className="px-5 sm:px-8 -mt-6">
      <div className="max-w-6xl mx-auto bg-akboy-forest text-white rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-8 shadow-2xl shadow-akboy-forest/25 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-akboy-moss/15 rounded-full blur-3xl" />
        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-2">
          {[
            { icon: Users, n: "1,200+", l: "Students Guided" },
            { icon: Briefcase, n: "300+", l: "Brands Built" },
            { icon: TrendingUp, n: "98%", l: "Admission Rate" },
            { icon: Award, n: "8+", l: "Years of Craft" },
          ].map((s, i) => (
            <div key={i} className={`flex items-center gap-3 lg:gap-4 lg:px-4 ${i > 0 ? "lg:border-l lg:border-white/10" : ""}`}>
              <div className="w-11 h-11 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
                <s.icon className="w-5 h-5 text-akboy-moss" />
              </div>
              <div>
                <p className="text-xl lg:text-2xl font-extrabold tracking-tight">{s.n}</p>
                <p className="text-[10px] lg:text-[11px] font-semibold uppercase tracking-wider text-white/55 mt-0.5">{s.l}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- LOGO MARQUEE ---------------- */
function TrustedBy() {
  const logos = ["UNILAG", "UI", "OAU", "LASU", "JAMB", "WAEC", "NECO", "Covenant"];
  return (
    <section className="py-10 lg:py-14 overflow-hidden">
      <p className="text-center text-[10px] font-bold uppercase tracking-[0.25em] text-akboy-ink/40 mb-6">
        Trusted by students placed at
      </p>
      <div className="relative">
        <div className="flex gap-12 akboy-marquee whitespace-nowrap">
          {[...logos, ...logos].map((l, i) => (
            <span key={i} className="text-2xl lg:text-3xl font-serif italic text-akboy-forest/30 font-bold">
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- ECOSYSTEM (Souice-style asymmetric bento) ---------------- */
const SERVICES = [
  { icon: GraduationCap, title: "Admission Consultancy", desc: "Strategic university placement guidance — UNILAG, UI, LASU, overseas.", tag: "Education" },
  { icon: BookOpen, title: "Tutorial Services", desc: "JAMB · WAEC · Post-UTME live and on-demand classes.", tag: "Learning" },
  { icon: Palette, title: "Graphics Design", desc: "Brand identity, social, packaging and print collateral.", tag: "Creative" },
  { icon: Code, title: "Web & App Design", desc: "Modern, conversion-ready websites and product apps.", tag: "Digital" },
  { icon: Megaphone, title: "Digital Skills Training", desc: "Bootcamps in design, no-code, marketing and AI.", tag: "Bootcamp" },
  { icon: BookMarked, title: "Quran & Tajweed", desc: "Personalised recitation classes with expert tutors.", tag: "Spiritual" },
];

function Ecosystem({ basePath }: { basePath: string }) {
  return (
    <section className="px-5 sm:px-8 py-14 lg:py-20 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 lg:mb-14">
          <div className="max-w-xl">
            <Eyebrow>Our ecosystem</Eyebrow>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-3 leading-[1.05] text-akboy-ink">
              Six disciplines.<br />
              <span className="italic font-serif text-akboy-forest">One creative hub.</span>
            </h2>
          </div>
          <Link to={`${basePath}/services`} className="self-start inline-flex items-center gap-2 text-akboy-forest font-bold text-xs uppercase tracking-widest border-b-2 border-akboy-moss pb-1">
            View all services <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {SERVICES.map((s, i) => (
            <Link
              key={s.title}
              to={`${basePath}/services`}
              className={`group relative p-6 lg:p-7 rounded-[1.75rem] border transition-all hover:-translate-y-1 ${
                i === 0
                  ? "bg-akboy-forest text-white border-akboy-forest shadow-xl shadow-akboy-forest/20"
                  : "bg-white text-akboy-ink border-akboy-ink/8 hover:border-akboy-moss/40 hover:shadow-lg"
              }`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  i === 0 ? "bg-white/10 text-akboy-moss" : "bg-akboy-mint text-akboy-forest"
                }`}>
                  <s.icon className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                  i === 0 ? "bg-white/10 text-akboy-moss" : "bg-akboy-cream text-akboy-forest/70"
                }`}>{s.tag}</span>
              </div>
              <h3 className="text-lg lg:text-xl font-extrabold leading-tight">{s.title}</h3>
              <p className={`text-sm leading-relaxed mt-2 ${i === 0 ? "text-white/65" : "text-akboy-ink/60"}`}>{s.desc}</p>
              <div className={`mt-5 inline-flex items-center gap-1.5 text-xs font-bold ${i === 0 ? "text-akboy-moss" : "text-akboy-forest"}`}>
                Learn more <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- ASYMMETRIC BENTO (Souice signature row) ---------------- */
function Bento({ basePath }: { basePath: string }) {
  return (
    <section className="px-5 sm:px-8 py-14 lg:py-20 bg-akboy-cream">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 lg:mb-14 max-w-xl">
          <Eyebrow>Why AKBOY</Eyebrow>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-3 leading-[1.05] text-akboy-ink">
            Built on outcomes,<br />
            <span className="italic font-serif text-akboy-forest">not promises.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
          {/* Big testimonial card */}
          <div className="lg:col-span-5 bg-white rounded-[2rem] p-8 lg:p-10 border border-akboy-ink/5 shadow-sm flex flex-col justify-between min-h-[340px]">
            <Quote className="w-8 h-8 text-akboy-moss" />
            <p className="text-xl lg:text-2xl font-bold text-akboy-ink leading-snug">
              "AKBOY didn't just prep me for JAMB — they reshaped how I study. Scored 312 and got into UNILAG Medicine."
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-akboy-ink/8">
              <img src={hero1} alt="" className="w-11 h-11 rounded-full object-cover" />
              <div>
                <p className="font-bold text-sm text-akboy-ink">Aisha Bello</p>
                <p className="text-xs text-akboy-ink/55">UNILAG Medical Student</p>
              </div>
            </div>
          </div>

          {/* Portrait card */}
          <div className="lg:col-span-4 relative rounded-[2rem] overflow-hidden min-h-[340px] group">
            <img src={hero3} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-akboy-forest via-akboy-forest/40 to-transparent" />
            <div className="relative h-full flex flex-col justify-end p-7 text-white">
              <Eyebrow dark>Spotlight</Eyebrow>
              <h3 className="text-2xl font-extrabold mt-2 leading-tight">Featured Project: Greenwood Brand Identity</h3>
              <Link to={`${basePath}/portfolio`} className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-akboy-moss">
                View portfolio <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Dashboard preview / mini stats */}
          <div className="lg:col-span-3 bg-akboy-forest text-white rounded-[2rem] p-7 flex flex-col justify-between min-h-[340px] relative overflow-hidden">
            <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-akboy-moss/15 rounded-full blur-2xl" />
            <div className="relative">
              <Eyebrow dark>Live impact</Eyebrow>
              <div className="mt-4 space-y-3">
                {[
                  { l: "JAMB Top Score", v: "342" },
                  { l: "Projects Shipped", v: "+27" },
                  { l: "Active Cohorts", v: "12" },
                ].map((x) => (
                  <div key={x.l} className="flex items-baseline justify-between border-b border-white/10 pb-2">
                    <span className="text-[11px] uppercase tracking-wider text-white/55 font-semibold">{x.l}</span>
                    <span className="text-xl font-extrabold">{x.v}</span>
                  </div>
                ))}
              </div>
            </div>
            <Link to={`${basePath}/about`} className="relative inline-flex items-center gap-2 text-xs font-bold text-akboy-moss">
              Our story <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Achievement wall (full width small) */}
          <div className="lg:col-span-12 bg-white rounded-[2rem] p-7 border border-akboy-ink/5 grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Zap, t: "Fast Track", d: "8-week intensive bootcamps" },
              { icon: Layers, t: "Full Stack", d: "Education + Creative + Digital" },
              { icon: Globe, t: "Global Reach", d: "Local roots, international standards" },
              { icon: Heart, t: "1-on-1 Care", d: "Personalised mentor support" },
            ].map((x) => (
              <div key={x.t} className="flex flex-col gap-2">
                <div className="w-10 h-10 rounded-xl bg-akboy-mint flex items-center justify-center">
                  <x.icon className="w-4 h-4 text-akboy-forest" />
                </div>
                <p className="font-extrabold text-sm text-akboy-ink">{x.t}</p>
                <p className="text-xs text-akboy-ink/55 leading-relaxed">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- PROGRAMS (pricing-tier-style strip) ---------------- */
const PROGRAMS = [
  { tag: "Starter", title: "JAMB & Post-UTME Prep", price: "Free intro class", feats: ["Live tutorials", "Past questions bank", "Weekly mocks"], href: "/register", featured: false },
  { tag: "Popular", title: "Creative Bootcamp", price: "8-week intensive", feats: ["Design fundamentals", "Live client briefs", "Portfolio build"], href: "/services", featured: true },
  { tag: "Premium", title: "Admission Consultancy", price: "1-on-1 placement", feats: ["University matching", "Application support", "Interview prep"], href: "/services", featured: false },
];

function Programs({ basePath }: { basePath: string }) {
  return (
    <section className="px-5 sm:px-8 py-14 lg:py-20 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Eyebrow>Featured programs</Eyebrow>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-3 leading-[1.05] text-akboy-ink">
            Programs that change<br />
            <span className="italic font-serif text-akboy-forest">trajectories.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 lg:gap-5">
          {PROGRAMS.map((p) => (
            <div
              key={p.title}
              className={`relative p-7 lg:p-8 rounded-[2rem] border ${
                p.featured
                  ? "bg-akboy-forest text-white border-akboy-forest shadow-2xl shadow-akboy-forest/25 lg:scale-105 z-10"
                  : "bg-white text-akboy-ink border-akboy-ink/8"
              }`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-akboy-moss text-akboy-forest text-[10px] font-extrabold uppercase tracking-wider">
                  Most Popular
                </span>
              )}
              <span className={`text-[10px] font-bold uppercase tracking-widest ${p.featured ? "text-akboy-moss" : "text-akboy-forest/55"}`}>
                {p.tag}
              </span>
              <h3 className="text-2xl font-extrabold mt-2 leading-tight">{p.title}</h3>
              <p className={`text-sm mt-2 ${p.featured ? "text-white/65" : "text-akboy-ink/60"}`}>{p.price}</p>

              <ul className="mt-6 space-y-3">
                {p.feats.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${p.featured ? "text-akboy-moss" : "text-akboy-forest"}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to={`${basePath}${p.href}`}
                className={`mt-7 w-full py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                  p.featured
                    ? "bg-akboy-moss text-akboy-forest hover:bg-akboy-mint"
                    : "bg-akboy-cream text-akboy-forest hover:bg-akboy-mint"
                }`}
              >
                Enroll now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- BLOG / TIPS ---------------- */
function Insights({ basePath }: { basePath: string }) {
  const posts = [
    { tag: "JAMB", title: "How to score 300+ in JAMB: a tactical playbook", img: hero1 },
    { tag: "Design", title: "From zero to client work in 8 weeks", img: hero3 },
    { tag: "Admission", title: "Choosing the right university course in 2026", img: hero4 },
  ];
  return (
    <section className="px-5 sm:px-8 py-14 lg:py-20 bg-akboy-cream">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <Eyebrow>Resources & insights</Eyebrow>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-3 leading-[1.05] text-akboy-ink">
              Smart tips for a<br />
              <span className="italic font-serif text-akboy-forest">stronger future.</span>
            </h2>
          </div>
          <Link to={`${basePath}/blog`} className="self-start inline-flex items-center gap-2 text-akboy-forest font-bold text-xs uppercase tracking-widest border-b-2 border-akboy-moss pb-1">
            View all <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {posts.map((p) => (
            <Link key={p.title} to={`${basePath}/blog`} className="group bg-white rounded-[1.75rem] overflow-hidden border border-akboy-ink/5 hover:-translate-y-1 transition-transform">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-akboy-forest/60">{p.tag}</span>
                <h3 className="font-extrabold text-base lg:text-lg mt-2 leading-snug text-akboy-ink">{p.title}</h3>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-akboy-forest">
                  Read article <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CTA ---------------- */
function CTA({ basePath }: { basePath: string }) {
  return (
    <section className="px-5 sm:px-8 py-14 lg:py-20 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="bg-akboy-forest text-white rounded-[2.5rem] lg:rounded-[3rem] p-10 lg:p-16 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-akboy-moss/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-akboy-moss/10 rounded-full blur-3xl" />

          <div className="relative z-10 grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
            <div>
              <Pill dark><Sparkles className="w-3 h-3" /> Begin with AKBOY</Pill>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-5 leading-[1.05]">
                Ready to learn,<br />
                <span className="italic font-serif text-akboy-moss">create or grow?</span>
              </h2>
              <p className="text-white/65 mt-4 text-base lg:text-lg max-w-md">
                Book a free consultation. We'll map a plan tailored to where you are and where you're going.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link to={`${basePath}/contact`} className="py-4 px-6 rounded-full bg-akboy-moss text-akboy-forest font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform">
                Book Free Consultation <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="https://wa.me/2348101466977" target="_blank" rel="noopener noreferrer"
                className="py-4 px-6 rounded-full bg-white/10 border border-white/15 backdrop-blur text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/15 transition-colors">
                <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
              </a>
              <Link to={`${basePath}/services`} className="py-4 px-6 rounded-full bg-transparent text-white/70 font-semibold text-sm flex items-center justify-center gap-2 hover:text-white transition-colors">
                <Play className="w-4 h-4" /> See how it works
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- PAGE ---------------- */
export default function AkboyHome() {
  const { isAkboy } = useDomainDetection();
  const basePath = isAkboy ? "" : "/akboy";

  return (
    <AkboyLayout
      title="AKBOY Creative Hub — Grow Your Future With Smart Creative Solutions"
      description="AKBOY Creative Hub blends tutorials, admission consultancy, design and digital training into one premium ecosystem for students, schools and brands."
    >
      <div className="bg-akboy-cream text-akboy-ink font-body min-h-screen">
        <Hero basePath={basePath} />
        <StatsPanel />
        <TrustedBy />
        <Ecosystem basePath={basePath} />
        <Bento basePath={basePath} />
        <Programs basePath={basePath} />
        <Insights basePath={basePath} />
        <CTA basePath={basePath} />
      </div>
    </AkboyLayout>
  );
}
