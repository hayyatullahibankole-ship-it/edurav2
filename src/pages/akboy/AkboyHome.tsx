import { Link } from "react-router-dom";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import {
  ArrowRight, ArrowUpRight, GraduationCap, Palette, Code, BookOpen,
  Megaphone, Heart, Star, Quote, MessageCircle, BookMarked, Sparkles,
  Trophy, Users, CheckCircle2,
} from "lucide-react";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import hero1 from "@/assets/akboy-hero-1.jpg";
import hero2 from "@/assets/akboy-hero-2.jpg";
import hero3 from "@/assets/akboy-hero-3.jpg";
import hero4 from "@/assets/akboy-hero-4.jpg";

/* ============================================================
   AKBOY — Forest Bento (premium polished)
   Cream bg · rounded-3xl/4xl cards · forest primary · moss accent
   Plus Jakarta Sans extrabold headings
   ============================================================ */

const Pill = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-white/60 shadow-sm backdrop-blur">
    <span className="w-1.5 h-1.5 rounded-full bg-akboy-moss animate-pulse" />
    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-akboy-forest/70">{children}</span>
  </div>
);

const Eyebrow = ({ children, dark }: { children: React.ReactNode; dark?: boolean }) => (
  <span className={`text-[10px] font-bold uppercase tracking-[0.22em] ${dark ? "text-akboy-moss" : "text-akboy-forest/55"}`}>
    {children}
  </span>
);

/* ---------------- HERO ---------------- */
function Hero({ basePath }: { basePath: string }) {
  return (
    <section className="relative px-5 sm:px-8 pt-6 pb-12 lg:pt-10 lg:pb-20 overflow-hidden">
      <div className="absolute -top-20 -right-20 w-80 h-80 lg:w-[32rem] lg:h-[32rem] bg-akboy-moss/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-10 w-72 h-72 bg-akboy-moss/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Copy */}
        <div className="relative z-10 space-y-6">
          <Pill>Next Intake · March 2026</Pill>
          <h1 className="text-[2.5rem] sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.02] tracking-tight text-akboy-ink">
            Where <span className="text-akboy-moss">education</span> meets the craft of creating.
          </h1>
          <p className="text-base sm:text-lg text-akboy-ink/65 max-w-xl leading-relaxed">
            We guide students into top universities and train the next wave of digital creators —
            consultancy, tutorials, design and digital skills under one roof.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md">
            <Link
              to={`${basePath}/services`}
              className="flex-1 py-4 px-6 rounded-2xl bg-akboy-forest text-akboy-cream font-bold text-base shadow-xl shadow-akboy-forest/20 flex items-center justify-center gap-2 hover:bg-akboy-forest-deep active:scale-[0.98] transition-all"
            >
              Explore Services
              <ArrowRight className="w-5 h-5 text-akboy-moss" />
            </Link>
            <Link
              to={`${basePath}/contact`}
              className="flex-1 py-4 px-6 rounded-2xl bg-white text-akboy-forest font-bold text-base border border-akboy-ink/5 shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center"
            >
              Quick Consultation
            </Link>
          </div>

          {/* Mini trust row (desktop) */}
          <div className="hidden lg:flex items-center gap-5 pt-4">
            <div className="flex -space-x-2">
              {[hero1, hero2, hero3, hero4].map((src, i) => (
                <img key={i} src={src} alt="" className="w-9 h-9 rounded-full border-2 border-akboy-cream object-cover" />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5 text-akboy-moss">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                <span className="ml-1.5 text-xs font-bold text-akboy-ink">4.9</span>
              </div>
              <div className="text-xs text-akboy-ink/55 mt-0.5">Loved by 1,200+ students & brands</div>
            </div>
          </div>
        </div>

        {/* Hero visual */}
        <div className="relative">
          <div className="aspect-[1.1/1] rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden shadow-2xl shadow-akboy-forest/15 ring-8 ring-white/60 bg-akboy-stone">
            <img src={hero2} alt="AKBOY students" className="w-full h-full object-cover" />
          </div>

          {/* Floating stat badge */}
          <div className="absolute -bottom-6 -right-2 lg:-right-6 bg-akboy-forest text-white p-4 pr-6 rounded-[2rem] shadow-2xl flex items-center gap-3 border-4 border-akboy-cream">
            <div className="w-11 h-11 bg-akboy-moss/20 rounded-2xl flex items-center justify-center border border-white/10">
              <Trophy className="w-5 h-5 text-akboy-moss" />
            </div>
            <div>
              <p className="text-[9px] text-white/55 font-bold uppercase tracking-wider">Avg Result</p>
              <p className="text-lg font-extrabold tracking-tight">320+ JAMB</p>
            </div>
          </div>

          {/* Floating mini card (desktop) */}
          <div className="hidden lg:flex absolute -top-4 -left-6 bg-white p-3 pr-5 rounded-2xl shadow-xl items-center gap-3 border border-akboy-ink/5">
            <div className="w-9 h-9 bg-akboy-moss/15 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-akboy-forest" />
            </div>
            <div>
              <p className="text-[10px] text-akboy-ink/55 font-bold uppercase tracking-wider">Admission</p>
              <p className="text-sm font-extrabold text-akboy-ink">98% Success</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- STATS ROW ---------------- */
function Stats() {
  const items = [
    { n: "1,200+", l: "Students Guided",  tone: "white" },
    { n: "300+",   l: "Brands Built",     tone: "forest" },
    { n: "98%",    l: "Admission Rate",   tone: "moss" },
    { n: "6",      l: "Core Services",    tone: "white" },
  ];
  return (
    <section className="px-5 sm:px-8 pt-6 pb-4 lg:pt-10">
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {items.map((s) => {
          const cls =
            s.tone === "forest" ? "bg-akboy-forest text-white" :
            s.tone === "moss"   ? "bg-akboy-moss text-akboy-forest" :
            "bg-white text-akboy-ink border border-akboy-ink/5";
          const subCls =
            s.tone === "forest" ? "text-white/60" :
            s.tone === "moss"   ? "text-akboy-forest/70" :
            "text-akboy-ink/55";
          return (
            <div key={s.l} className={`${cls} p-5 sm:p-6 rounded-[1.75rem] shadow-sm`}>
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">{s.n}</p>
              <p className={`text-[11px] sm:text-xs font-semibold mt-1 uppercase tracking-wider ${subCls}`}>{s.l}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- ECOSYSTEM (services bento) ---------------- */
const SERVICES = [
  { icon: GraduationCap, title: "Admission Consultancy", desc: "Strategic guidance for UNILAG, UI, LASU and overseas placements.",            big: true,  tone: "cream" },
  { icon: BookOpen,      title: "Tutorial Services",     desc: "Live & on-demand classes for JAMB, WAEC and Post-UTME.",                       tone: "forest" },
  { icon: Palette,       title: "Graphics Design",       desc: "Brand identity, social, packaging & print.",                                   tone: "white" },
  { icon: Code,          title: "Web & App Design",      desc: "Modern, conversion-ready websites and apps.",                                  tone: "forest" },
  { icon: Megaphone,     title: "Digital Skills",        desc: "Bootcamps in design, no-code, marketing & AI.",                                tone: "white" },
];

function Ecosystem({ basePath }: { basePath: string }) {
  return (
    <section className="relative">
      <div className="bg-white rounded-t-[2.5rem] lg:rounded-t-[3.5rem] shadow-[0_-20px_50px_-15px_rgba(26,60,42,0.10)] px-5 sm:px-8 pt-12 lg:pt-20 pb-12 lg:pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-8 lg:mb-12 gap-4">
            <div>
              <Eyebrow>Our ecosystem</Eyebrow>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-2 leading-[1.05] text-akboy-ink">
                Academic rigor.<br className="sm:hidden" /> Creative flair.
              </h2>
              <p className="text-sm sm:text-base text-akboy-ink/55 mt-3 max-w-md font-medium">
                Six disciplines, one creative hub.
              </p>
            </div>
            <Link to={`${basePath}/services`} className="hidden sm:inline-flex items-center gap-2 text-akboy-forest font-bold text-xs uppercase tracking-widest border-b-2 border-akboy-moss pb-1">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {SERVICES.map((s) => {
              const isForest = s.tone === "forest";
              const isCream  = s.tone === "cream";
              const big = s.big;
              const baseCls = isForest
                ? "bg-akboy-forest text-white"
                : isCream
                ? "bg-akboy-cream border border-akboy-moss/25 text-akboy-ink"
                : "bg-white border border-akboy-ink/5 text-akboy-ink shadow-md shadow-akboy-ink/[0.04]";

              const iconWrap = isForest
                ? "bg-white/10 text-akboy-moss"
                : "bg-akboy-moss/15 text-akboy-forest";

              const descCls = isForest ? "text-white/70" : "text-akboy-ink/60";

              return (
                <Link
                  key={s.title}
                  to={`${basePath}/services`}
                  className={`group relative overflow-hidden p-5 sm:p-6 rounded-[1.75rem] sm:rounded-[2rem] transition-transform hover:-translate-y-1
                    ${baseCls}
                    ${big ? "col-span-2 lg:col-span-4" : "aspect-square lg:aspect-auto lg:min-h-[220px]"}`}
                >
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 ${iconWrap}`}>
                    <s.icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.75} />
                  </div>
                  <h3 className={`text-base sm:text-lg font-extrabold leading-tight ${big ? "lg:text-2xl" : ""}`}>{s.title}</h3>
                  <p className={`text-xs sm:text-sm leading-relaxed mt-1.5 ${descCls} ${big ? "max-w-md" : "line-clamp-2"}`}>
                    {s.desc}
                  </p>
                  {big && (
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-akboy-moss/25 rounded-full blur-2xl pointer-events-none" />
                  )}
                  <ArrowUpRight className={`absolute top-5 right-5 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${isForest ? "text-akboy-moss" : "text-akboy-forest"}`} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FEATURED (Quran) ---------------- */
function Featured({ basePath }: { basePath: string }) {
  return (
    <section className="px-5 sm:px-8 py-10 lg:py-16 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="bg-akboy-moss rounded-[2.5rem] lg:rounded-[3rem] p-8 lg:p-14 relative overflow-hidden shadow-2xl shadow-akboy-moss/30">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/15 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-akboy-forest/10 rounded-full -ml-16 -mb-16" />

          <div className="relative z-10 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div>
              <span className="px-2.5 py-1 rounded-lg bg-akboy-forest text-akboy-moss text-[10px] font-bold uppercase tracking-[0.2em] mb-5 inline-block">
                Spiritual Growth
              </span>
              <h2 className="text-3xl lg:text-5xl font-extrabold text-akboy-forest leading-[1.05] tracking-tight">
                Quran & Tajweed Classes
              </h2>
              <p className="text-akboy-forest/80 text-sm lg:text-base leading-relaxed mt-4 font-medium max-w-md">
                Master pronunciation and memorization with personalized feedback from expert tutors —
                one-on-one or in small groups.
              </p>
              <Link to={`${basePath}/services`} className="mt-7 inline-flex items-center gap-3 font-bold text-akboy-forest text-sm">
                Learn More
                <span className="w-9 h-9 rounded-full bg-akboy-forest flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-white" />
                </span>
              </Link>
            </div>

            <div className="hidden lg:block relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl ring-8 ring-white/30">
                <img src={hero3} alt="Quran class" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- PROGRAMS BENTO ---------------- */
const PROGRAMS = [
  { tag: "JAMB · WAEC", title: "Exam Success Orientation", desc: "Intensive prep — syllabus, tactics & mindset.", img: hero1, href: "/register" },
  { tag: "Consultancy", title: "Admission Assistance",     desc: "1-on-1 university placement guidance.",          img: hero2, href: "/services" },
  { tag: "Creative",    title: "Graphics Design Course",   desc: "Canva, Photoshop & Illustrator with live work.", img: hero3, href: "/services" },
];

function Programs({ basePath }: { basePath: string }) {
  return (
    <section className="px-5 sm:px-8 py-12 lg:py-20 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 lg:mb-12">
          <Eyebrow>Featured programs</Eyebrow>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-2 leading-[1.05] text-akboy-ink max-w-2xl">
            Programs built to change trajectories.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {PROGRAMS.map((p) => (
            <Link
              key={p.title}
              to={`${basePath}${p.href}`}
              className="group relative rounded-[2rem] overflow-hidden bg-akboy-cream border border-akboy-ink/5 hover:-translate-y-1 transition-transform"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-5 sm:p-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-akboy-forest/60">{p.tag}</span>
                <h3 className="font-extrabold text-lg lg:text-xl mt-1.5 leading-tight text-akboy-ink">{p.title}</h3>
                <p className="text-xs sm:text-sm text-akboy-ink/60 mt-2 leading-relaxed">{p.desc}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-akboy-forest">
                  Discover <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- TESTIMONIALS ---------------- */
const TESTIMONIALS = [
  { quote: "AKBOY didn't just prep me for JAMB — they reshaped how I study. Scored 312.", name: "Aisha Bello", role: "UNILAG Medical Student" },
  { quote: "The brand identity they built for our school is now copied across the state.", name: "Mr. Ade Okon", role: "Director, Greenwood Academy" },
  { quote: "From zero to landing my first design client in 8 weeks. Bootcamp delivers.", name: "Tunde Adigun", role: "Freelance Designer" },
];

function Testimonials() {
  return (
    <section className="px-5 sm:px-8 py-12 lg:py-20 bg-akboy-cream">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 lg:mb-12 max-w-2xl">
          <Eyebrow>Voices</Eyebrow>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-2 leading-[1.05] text-akboy-ink">
            Real stories from real people.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 lg:gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className={`p-6 lg:p-8 rounded-[2rem] ${i === 1 ? "bg-akboy-forest text-white" : "bg-white border border-akboy-ink/5 text-akboy-ink shadow-sm"}`}>
              <Quote className={`w-6 h-6 mb-5 ${i === 1 ? "text-akboy-moss" : "text-akboy-moss"}`} />
              <p className={`text-base font-semibold leading-snug ${i === 1 ? "text-white/95" : "text-akboy-ink/85"}`}>
                "{t.quote}"
              </p>
              <div className={`mt-6 pt-5 border-t ${i === 1 ? "border-white/15" : "border-akboy-ink/10"}`}>
                <div className="font-bold text-sm">{t.name}</div>
                <div className={`text-xs mt-0.5 ${i === 1 ? "text-white/55" : "text-akboy-ink/55"}`}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CTA ---------------- */
function CTA({ basePath }: { basePath: string }) {
  return (
    <section className="px-5 sm:px-8 py-12 lg:py-20 bg-akboy-cream">
      <div className="max-w-5xl mx-auto">
        <div className="bg-akboy-forest text-white rounded-[2.5rem] lg:rounded-[3rem] p-10 lg:p-16 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-akboy-moss/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-akboy-moss/10 rounded-full blur-3xl" />

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-bold uppercase tracking-[0.2em] text-akboy-moss">
              <Sparkles className="w-3 h-3" /> Begin with AKBOY
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-5 leading-[1.05]">
              Ready to learn, create or grow your brand?
            </h2>
            <p className="text-white/65 mt-4 text-base lg:text-lg max-w-lg mx-auto">
              Book a free consultation. We'll map a plan tailored to where you are and where you're going.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={`${basePath}/contact`} className="py-4 px-7 rounded-2xl bg-akboy-moss text-akboy-forest font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform">
                Book Consultation <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="https://wa.me/2348101466977" target="_blank" rel="noopener noreferrer"
                className="py-4 px-7 rounded-2xl bg-white/10 border border-white/15 backdrop-blur text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/15 transition-colors">
                <MessageCircle className="w-4 h-4" /> WhatsApp Us
              </a>
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
      title="AKBOY Creative Hub — Where Education Meets Creating"
      description="AKBOY Creative Hub blends tutorials, admission consultancy, design and digital training into one premium ecosystem."
    >
      <div className="bg-akboy-cream text-akboy-ink font-body min-h-screen">
        <Hero basePath={basePath} />
        <Stats />
        <Ecosystem basePath={basePath} />
        <Featured basePath={basePath} />
        <Programs basePath={basePath} />
        <Testimonials />
        <CTA basePath={basePath} />
      </div>
    </AkboyLayout>
  );
}
