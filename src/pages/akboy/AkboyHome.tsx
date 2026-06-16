import { Link } from "react-router-dom";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import {
  ArrowRight, ArrowUpRight, GraduationCap, Palette, Code, BookOpen,
  Megaphone, Star, Quote, MessageCircle, Sparkles,
  Users, Briefcase, TrendingUp, Award, BookMarked, Play,
} from "lucide-react";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import hero1 from "@/assets/akboy-hero-1.jpg";
import hero2 from "@/assets/akboy-hero-2.jpg";
import hero3 from "@/assets/akboy-hero-3.jpg";
import hero4 from "@/assets/akboy-hero-4.jpg";

/* ============================================================
   AKBOY — Editorial Magazine Direction
   Fraunces serif display · Inter body · Forest & Moss palette
   Numbered editorial sections, generous negative space
   ============================================================ */

const Eyebrow = ({ children, dark }: { children: React.ReactNode; dark?: boolean }) => (
  <span className={`inline-block text-[10px] font-semibold uppercase tracking-[0.28em] ${
    dark ? "text-akboy-moss" : "text-akboy-forest/60"
  }`}>{children}</span>
);

const Rule = ({ dark }: { dark?: boolean }) => (
  <div className={`h-px w-full ${dark ? "bg-white/15" : "bg-akboy-forest/15"}`} />
);

/* ---------------- MASTHEAD ---------------- */
function Masthead() {
  return (
    <div className="border-b border-akboy-forest/10 bg-akboy-cream">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-akboy-forest/55 font-medium">
        <span>Vol. VIII · Issue 03</span>
        <span className="hidden sm:inline font-serif italic tracking-normal text-akboy-forest/70 text-sm">The Creative Hub Journal</span>
        <span>Lagos · 2026</span>
      </div>
    </div>
  );
}

/* ---------------- HERO ---------------- */
function Hero({ basePath }: { basePath: string }) {
  return (
    <section className="px-5 sm:px-8 pt-10 lg:pt-16 pb-12 lg:pb-20">
      <div className="max-w-6xl mx-auto">
        <Eyebrow>The 2026 Edition · Featured</Eyebrow>

        <h1 className="font-serif font-light text-[3rem] sm:text-[4.5rem] lg:text-[7rem] leading-[0.95] tracking-[-0.035em] text-akboy-forest mt-6">
          Grow your future<br />
          with <em className="font-normal italic text-akboy-forest/70">smart</em><br className="hidden sm:block" />
          creative solutions.
        </h1>

        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16 mt-12 lg:mt-16 items-end">
          <div className="space-y-7">
            <p className="font-serif text-xl lg:text-2xl leading-snug text-akboy-ink/80 max-w-xl">
              AKBOY Creative Hub blends admission consultancy, tutorials,
              design and digital training into <em>one premium ecosystem</em> for
              students, schools and brands.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to={`${basePath}/services`}
                className="inline-flex items-center gap-3 px-7 py-4 bg-akboy-forest text-akboy-cream text-sm font-semibold tracking-wide hover:bg-akboy-forest/90 transition-colors"
              >
                Explore the Hub <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={`${basePath}/contact`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-akboy-forest border-b border-akboy-forest pb-1 hover:border-akboy-moss hover:text-akboy-forest/70 transition-colors"
              >
                Book a consultation
              </Link>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2.5">
                {[hero1, hero2, hero3, hero4].map((src, i) => (
                  <img key={i} src={src} alt="" className="w-9 h-9 rounded-full border-2 border-akboy-cream object-cover" />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-akboy-forest">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                  <span className="ml-2 text-xs font-semibold text-akboy-ink">4.9 · 1,200+ reviews</span>
                </div>
                <p className="text-[11px] text-akboy-ink/55 mt-0.5">Trusted by students, schools & brands</p>
              </div>
            </div>
          </div>

          {/* Editorial portrait */}
          <figure className="relative">
            <div className="aspect-[4/5] overflow-hidden">
              <img src={hero2} alt="AKBOY featured cohort" className="w-full h-full object-cover" />
            </div>
            <figcaption className="mt-3 flex items-start justify-between gap-4">
              <span className="font-serif italic text-sm text-akboy-ink/60">Featured cohort · UNILAG placement, March 2026.</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-akboy-forest/50 font-semibold shrink-0">№ 01</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

/* ---------------- STATS (editorial slab) ---------------- */
function StatsPanel() {
  const stats = [
    { icon: Users, n: "1,200+", l: "Students Guided" },
    { icon: Briefcase, n: "300+", l: "Brands Built" },
    { icon: TrendingUp, n: "98%", l: "Admission Rate" },
    { icon: Award, n: "8+", l: "Years of Craft" },
  ];
  return (
    <section className="bg-akboy-forest text-akboy-cream">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 lg:py-20">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-10 items-end mb-10">
          <Eyebrow dark>By the Numbers</Eyebrow>
          <h2 className="font-serif font-light text-3xl lg:text-5xl leading-[1.05] tracking-tight">
            Outcomes, <em className="text-akboy-moss">not promises</em>.
          </h2>
        </div>
        <Rule dark />
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className={`py-8 lg:py-12 px-4 lg:px-8 ${i > 0 ? "lg:border-l border-white/10" : ""} ${i >= 2 ? "border-t border-white/10 lg:border-t-0" : ""} ${i === 1 ? "border-t border-white/10 lg:border-t-0" : ""}`}>
              <s.icon className="w-5 h-5 text-akboy-moss mb-4" strokeWidth={1.5} />
              <div className="font-serif text-4xl lg:text-6xl font-light tracking-tight">{s.n}</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/55 mt-3 font-semibold">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- SERVICES (numbered editorial list) ---------------- */
const SERVICES = [
  { n: "01", icon: GraduationCap, title: "Admission Consultancy", desc: "Strategic university placement — UNILAG, UI, LASU and overseas." },
  { n: "02", icon: BookOpen, title: "Tutorial Services", desc: "JAMB, WAEC & Post-UTME — live and on-demand classes." },
  { n: "03", icon: Palette, title: "Graphic Design", desc: "Brand identity, social, packaging and print collateral." },
  { n: "04", icon: Code, title: "Web & App Design", desc: "Modern, conversion-ready websites and product apps." },
  { n: "05", icon: Megaphone, title: "Digital Skills Training", desc: "Bootcamps in design, no-code, marketing and AI." },
  { n: "06", icon: BookMarked, title: "Quran & Tajweed", desc: "Personalised recitation classes with expert tutors." },
];

function Ecosystem({ basePath }: { basePath: string }) {
  return (
    <section className="bg-akboy-cream">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-10 mb-12 lg:mb-16 items-end">
          <Eyebrow>The Ecosystem</Eyebrow>
          <h2 className="font-serif font-light text-4xl lg:text-6xl leading-[1.02] tracking-tight text-akboy-forest">
            Six disciplines.<br />
            <em className="font-normal">One creative hub.</em>
          </h2>
        </div>

        <Rule />

        <div className="divide-y divide-akboy-forest/10">
          {SERVICES.map((s) => (
            <Link
              key={s.n}
              to={`${basePath}/services`}
              className="group grid grid-cols-[auto_1fr_auto] gap-5 lg:gap-10 py-7 lg:py-10 items-center hover:px-4 transition-all"
            >
              <span className="font-serif italic text-akboy-forest/40 text-xl lg:text-2xl w-10">{s.n}</span>
              <div className="grid sm:grid-cols-[1.2fr_1.5fr] gap-3 sm:gap-10 items-center">
                <div className="flex items-center gap-4">
                  <s.icon className="w-5 h-5 text-akboy-forest shrink-0" strokeWidth={1.5} />
                  <h3 className="font-serif text-2xl lg:text-4xl font-light tracking-tight text-akboy-forest group-hover:italic transition-all">
                    {s.title}
                  </h3>
                </div>
                <p className="text-sm lg:text-base text-akboy-ink/60 leading-relaxed">{s.desc}</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-akboy-forest/60 group-hover:text-akboy-forest group-hover:rotate-12 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- EDITORIAL FEATURE (Why AKBOY) ---------------- */
function Feature() {
  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-5 lg:sticky lg:top-24 self-start space-y-6">
            <Eyebrow>№ 02 · Spotlight</Eyebrow>
            <h2 className="font-serif font-light text-4xl lg:text-6xl leading-[1.02] tracking-tight text-akboy-forest">
              Built for the<br />
              <em>ambitious few.</em>
            </h2>
            <p className="text-akboy-ink/70 text-lg leading-relaxed max-w-md">
              Every cohort, every brand and every student gets the same standard
              of craft — measured, mentored and shipped.
            </p>
          </div>

          <div className="lg:col-span-7 space-y-10">
            <figure>
              <div className="aspect-[5/3] overflow-hidden">
                <img src={hero3} alt="Greenwood brand identity" className="w-full h-full object-cover" />
              </div>
              <figcaption className="mt-3 font-serif italic text-sm text-akboy-ink/60">
                Greenwood Brand Identity — a featured 2026 project.
              </figcaption>
            </figure>

            <div className="bg-akboy-cream p-8 lg:p-10 border-l-2 border-akboy-forest">
              <Quote className="w-7 h-7 text-akboy-forest mb-4" />
              <p className="font-serif text-2xl lg:text-3xl font-light leading-snug text-akboy-forest">
                "AKBOY didn't just prep me for JAMB — they reshaped how I study.
                Scored 312 and got into UNILAG Medicine."
              </p>
              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-akboy-forest/15">
                <img src={hero1} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-sm text-akboy-forest">Aisha Bello</p>
                  <p className="text-xs text-akboy-ink/55">UNILAG Medical Student · Cohort 24</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- PROGRAMS (editorial tier) ---------------- */
const PROGRAMS = [
  { tag: "Starter", title: "JAMB & Post-UTME Prep", price: "Free intro class", feats: ["Live tutorials", "Past questions bank", "Weekly mocks"], href: "/register" },
  { tag: "Popular", title: "Creative Bootcamp", price: "8-week intensive", feats: ["Design fundamentals", "Live client briefs", "Portfolio build"], href: "/services", featured: true },
  { tag: "Premium", title: "Admission Consultancy", price: "1-on-1 placement", feats: ["University matching", "Application support", "Interview prep"], href: "/services" },
];

function Programs({ basePath }: { basePath: string }) {
  return (
    <section className="bg-akboy-cream">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-10 mb-12 items-end">
          <Eyebrow>№ 03 · Programs</Eyebrow>
          <h2 className="font-serif font-light text-4xl lg:text-6xl leading-[1.02] tracking-tight text-akboy-forest">
            Programs that<br />
            <em>change trajectories.</em>
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 border-t border-akboy-forest/15">
          {PROGRAMS.map((p) => (
            <div
              key={p.title}
              className={`p-8 lg:p-10 flex flex-col ${
                p.featured
                  ? "bg-akboy-forest text-akboy-cream lg:-my-6"
                  : "bg-akboy-cream text-akboy-ink border-b lg:border-b-0 lg:border-r border-akboy-forest/15"
              } ${!p.featured && PROGRAMS.indexOf(p) === 0 ? "lg:border-r" : ""}`}
            >
              <Eyebrow dark={p.featured}>{p.tag}</Eyebrow>
              <h3 className={`font-serif font-light text-3xl lg:text-4xl leading-tight tracking-tight mt-4 ${p.featured ? "text-akboy-cream" : "text-akboy-forest"}`}>
                {p.title}
              </h3>
              <p className={`text-sm mt-3 ${p.featured ? "text-akboy-moss" : "text-akboy-ink/60"}`}>{p.price}</p>

              <ul className={`mt-8 space-y-3 flex-1 ${p.featured ? "text-akboy-cream/85" : "text-akboy-ink/75"}`}>
                {p.feats.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm border-b border-current/10 pb-3">
                    <span className="font-serif italic text-xs opacity-60 pt-0.5">·</span> {f}
                  </li>
                ))}
              </ul>

              <Link
                to={`${basePath}${p.href}`}
                className={`mt-8 inline-flex items-center gap-2 text-sm font-semibold border-b pb-1 self-start ${
                  p.featured ? "text-akboy-moss border-akboy-moss" : "text-akboy-forest border-akboy-forest"
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

/* ---------------- INSIGHTS ---------------- */
function Insights({ basePath }: { basePath: string }) {
  const posts = [
    { tag: "JAMB", title: "How to score 300+ in JAMB: a tactical playbook", img: hero1, n: "01" },
    { tag: "Design", title: "From zero to client work in 8 weeks", img: hero3, n: "02" },
    { tag: "Admission", title: "Choosing the right university course in 2026", img: hero4, n: "03" },
  ];
  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 lg:py-24">
        <div className="flex items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <Eyebrow>№ 04 · The Journal</Eyebrow>
            <h2 className="font-serif font-light text-4xl lg:text-6xl leading-[1.02] tracking-tight text-akboy-forest">
              Smart tips for a<br />
              <em>stronger future.</em>
            </h2>
          </div>
          <Link to={`${basePath}/blog`} className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-akboy-forest border-b border-akboy-forest pb-1">
            All articles <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {posts.map((p) => (
            <Link key={p.title} to={`${basePath}/blog`} className="group block">
              <div className="aspect-[4/5] overflow-hidden mb-5">
                <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-akboy-forest/60">{p.tag}</span>
                <span className="font-serif italic text-akboy-forest/40 text-sm">№ {p.n}</span>
              </div>
              <h3 className="font-serif text-xl lg:text-2xl font-light leading-snug tracking-tight text-akboy-forest group-hover:italic transition-all">
                {p.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- LOGOS ---------------- */
function TrustedBy() {
  const logos = ["UNILAG", "UI", "OAU", "LASU", "JAMB", "WAEC", "NECO", "Covenant"];
  return (
    <section className="bg-akboy-cream border-y border-akboy-forest/10">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 overflow-hidden">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-akboy-forest/50 mb-6">
          Students placed at
        </p>
        <div className="flex gap-12 akboy-marquee whitespace-nowrap">
          {[...logos, ...logos].map((l, i) => (
            <span key={i} className="font-serif italic text-2xl lg:text-3xl text-akboy-forest/40">
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CTA ---------------- */
function CTA({ basePath }: { basePath: string }) {
  return (
    <section className="bg-akboy-forest text-akboy-cream">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-12 items-end">
          <div>
            <Eyebrow dark><Sparkles className="w-3 h-3 inline mr-1" /> Begin with AKBOY</Eyebrow>
            <h2 className="font-serif font-light text-5xl lg:text-7xl leading-[1] tracking-tight mt-6">
              Ready to learn,<br />
              create or <em className="text-akboy-moss">grow?</em>
            </h2>
            <p className="text-akboy-cream/65 mt-6 text-lg max-w-md">
              Book a free consultation. We'll map a plan tailored to where you
              are and where you're going.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link to={`${basePath}/contact`} className="py-4 px-6 bg-akboy-moss text-akboy-forest font-semibold text-sm flex items-center justify-between hover:bg-akboy-cream transition-colors">
              Book Free Consultation <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="https://wa.me/2348101466977" target="_blank" rel="noopener noreferrer"
              className="py-4 px-6 border border-akboy-cream/20 text-akboy-cream font-semibold text-sm flex items-center justify-between hover:bg-white/5 transition-colors">
              Chat on WhatsApp <MessageCircle className="w-4 h-4" />
            </a>
            <Link to={`${basePath}/services`} className="py-4 px-6 text-akboy-cream/70 text-sm flex items-center justify-between hover:text-akboy-cream transition-colors">
              See how it works <Play className="w-4 h-4" />
            </Link>
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
        <Masthead />
        <Hero basePath={basePath} />
        <TrustedBy />
        <StatsPanel />
        <Ecosystem basePath={basePath} />
        <Feature />
        <Programs basePath={basePath} />
        <Insights basePath={basePath} />
        <CTA basePath={basePath} />
      </div>
    </AkboyLayout>
  );
}
