import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import {
  ArrowRight, ArrowUpRight, GraduationCap, Palette, Code, BookOpen,
  Megaphone, Heart, Star, Quote, MessageCircle, Sparkles,
  Trophy, CheckCircle2, Plus, Minus, Calendar, Compass,
  PenTool, Rocket, Layers, Mail, ArrowDown,
} from "lucide-react";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import hero1 from "@/assets/akboy-hero-1.jpg";
import hero2 from "@/assets/akboy-hero-2.jpg";
import hero3 from "@/assets/akboy-hero-3.jpg";
import hero4 from "@/assets/akboy-hero-4.jpg";
import portfolioHero from "@/assets/akboy-portfolio-hero.jpg";
import team from "@/assets/akboy-team.jpg";

/* ============================================================
   AKBOY — Forest Bento v2 (designer-grade)
   ============================================================ */

const Eyebrow = ({ children, dark }: { children: React.ReactNode; dark?: boolean }) => (
  <span className={`inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] ${dark ? "text-akboy-moss" : "text-akboy-forest/55"}`}>
    <span className={`w-6 h-px ${dark ? "bg-akboy-moss/50" : "bg-akboy-forest/30"}`} />
    {children}
  </span>
);

/* ---------------- Animated counter ---------------- */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const start = performance.now();
        const dur = 1400;
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / dur);
          setN(Math.floor(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
}

/* ---------------- HERO ---------------- */
function Hero({ basePath }: { basePath: string }) {
  return (
    <section className="relative px-5 sm:px-8 pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden">
      {/* decorative grid */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(to right, #1a3c2a 1px, transparent 1px), linear-gradient(to bottom, #1a3c2a 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="absolute -top-20 -right-20 w-[32rem] h-[32rem] bg-akboy-moss/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-10 w-72 h-72 bg-akboy-forest/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Top meta strip */}
        <div className="hidden lg:flex items-center justify-between mb-10 text-xs font-bold uppercase tracking-[0.22em] text-akboy-forest/60">
          <span>Est. 2019 · Lagos, NG</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-akboy-moss animate-pulse" /> Now Enrolling — March Intake</span>
          <span>Issue №07 · 2026</span>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          {/* Headline */}
          <div className="lg:col-span-7 space-y-7">
            <h1 className="text-[2.75rem] sm:text-6xl lg:text-[5.5rem] xl:text-[6.5rem] font-extrabold leading-[0.92] tracking-[-0.03em] text-akboy-ink">
              Education,<br />
              <span className="italic font-display text-akboy-forest">design</span> &<br />
              the <span className="text-akboy-moss">craft</span> of becoming.
            </h1>

            <p className="text-base sm:text-lg text-akboy-ink/65 max-w-lg leading-relaxed">
              A creative hub where students walk into top universities and brands walk out
              with identities people remember. Tutorials, consultancy, design & digital training under one roof.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-md">
              <Link to={`${basePath}/services`}
                className="flex-1 py-4 px-6 rounded-2xl bg-akboy-forest text-akboy-cream font-bold text-sm uppercase tracking-wider shadow-xl shadow-akboy-forest/20 flex items-center justify-center gap-2 hover:bg-akboy-forest-deep active:scale-[0.98] transition-all">
                Explore Services <ArrowRight className="w-4 h-4 text-akboy-moss" />
              </Link>
              <Link to={`${basePath}/portfolio`}
                className="flex-1 py-4 px-6 rounded-2xl bg-transparent text-akboy-forest font-bold text-sm uppercase tracking-wider border-2 border-akboy-forest/15 hover:border-akboy-forest hover:bg-akboy-forest/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                See the Work <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Visual cluster */}
          <div className="lg:col-span-5 relative">
            <div className="grid grid-cols-5 grid-rows-6 gap-3 h-[26rem] sm:h-[30rem] lg:h-[34rem]">
              <div className="col-span-3 row-span-4 rounded-[2rem] overflow-hidden shadow-xl ring-4 ring-white/60">
                <img src={hero2} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 row-span-3 rounded-[2rem] overflow-hidden shadow-lg ring-4 ring-white/60">
                <img src={hero1} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 row-span-3 rounded-[2rem] bg-akboy-forest text-white p-5 flex flex-col justify-between">
                <Trophy className="w-7 h-7 text-akboy-moss" />
                <div>
                  <p className="text-[9px] text-white/55 font-bold uppercase tracking-wider">Avg Result</p>
                  <p className="text-2xl font-extrabold tracking-tight">320+</p>
                  <p className="text-[10px] text-white/55">JAMB Score</p>
                </div>
              </div>
              <div className="col-span-3 row-span-2 rounded-[2rem] bg-akboy-moss text-akboy-forest p-5 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider opacity-70">Admission</p>
                  <p className="text-2xl font-extrabold tracking-tight">98% Success</p>
                </div>
                <CheckCircle2 className="w-9 h-9" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="mt-14 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-akboy-forest/45">
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" /> Scroll · Six disciplines below
        </div>
      </div>
    </section>
  );
}

/* ---------------- Marquee ---------------- */
function Marquee() {
  const items = ["UNILAG", "University of Ibadan", "OAU", "LASU", "Covenant", "Babcock", "UNILORIN", "FUTA"];
  return (
    <section className="border-y border-akboy-ink/8 bg-akboy-cream overflow-hidden py-5">
      <div className="flex gap-12 animate-[scroll_30s_linear_infinite] whitespace-nowrap">
        {[...items, ...items, ...items].map((x, i) => (
          <span key={i} className="text-akboy-ink/40 font-display font-bold text-xl tracking-tight">
            {x} <span className="text-akboy-moss mx-2">✦</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes scroll{from{transform:translateX(0)}to{transform:translateX(-33.33%)}}`}</style>
    </section>
  );
}

/* ---------------- STATS ---------------- */
function Stats() {
  const items = [
    { n: 1200, s: "+", l: "Students Guided" },
    { n: 300,  s: "+", l: "Brands Built" },
    { n: 98,   s: "%", l: "Admission Rate" },
    { n: 6,    s: "",  l: "Core Services" },
  ];
  return (
    <section className="px-5 sm:px-8 py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-akboy-ink/8 lg:border lg:border-akboy-ink/8 lg:rounded-[2rem] overflow-hidden">
        {items.map((s, i) => (
          <div key={i} className="p-6 lg:p-10 text-center">
            <p className="text-4xl lg:text-6xl font-extrabold tracking-tight text-akboy-forest">
              <Counter to={s.n} suffix={s.s} />
            </p>
            <p className="text-[10px] sm:text-xs font-bold mt-2 uppercase tracking-[0.2em] text-akboy-ink/55">{s.l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- ECOSYSTEM ---------------- */
const SERVICES = [
  { icon: GraduationCap, title: "Admission Consultancy", desc: "Strategic guidance for UNILAG, UI, LASU and overseas placements.", big: true, tone: "cream" },
  { icon: BookOpen,      title: "Tutorial Services",     desc: "Live & on-demand classes for JAMB, WAEC, Post-UTME.",              tone: "forest" },
  { icon: Palette,       title: "Graphics Design",       desc: "Brand identity, social, packaging & print.",                       tone: "white" },
  { icon: Code,          title: "Web & App Design",      desc: "Conversion-ready websites and applications.",                      tone: "forest" },
  { icon: Megaphone,     title: "Digital Skills",        desc: "Bootcamps in design, no-code, marketing & AI.",                    tone: "white" },
  { icon: Heart,         title: "Quran & Tajweed",       desc: "Personalised spiritual growth classes.",                           tone: "moss" },
];

function Ecosystem({ basePath }: { basePath: string }) {
  return (
    <section className="bg-white px-5 sm:px-8 pt-4 lg:pt-8 pb-16 lg:pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10 lg:mb-14">
          <div className="max-w-xl">
            <Eyebrow>§01 — Ecosystem</Eyebrow>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.02em] mt-3 leading-[1.02] text-akboy-ink">
              Six disciplines.<br />
              <span className="italic font-display text-akboy-moss">One creative hub.</span>
            </h2>
          </div>
          <Link to={`${basePath}/services`} className="inline-flex items-center gap-2 text-akboy-forest font-bold text-xs uppercase tracking-[0.2em] border-b-2 border-akboy-moss pb-1 w-fit">
            View all services <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {SERVICES.map((s) => {
            const tone = s.tone;
            const base =
              tone === "forest" ? "bg-akboy-forest text-white" :
              tone === "cream"  ? "bg-akboy-cream border border-akboy-moss/25 text-akboy-ink" :
              tone === "moss"   ? "bg-akboy-moss text-akboy-forest" :
              "bg-white border border-akboy-ink/8 text-akboy-ink shadow-sm";
            const iconWrap =
              tone === "forest" ? "bg-white/10 text-akboy-moss" :
              tone === "moss"   ? "bg-akboy-forest/15 text-akboy-forest" :
              "bg-akboy-moss/15 text-akboy-forest";
            const descCls =
              tone === "forest" ? "text-white/70" :
              tone === "moss"   ? "text-akboy-forest/75" :
              "text-akboy-ink/60";
            return (
              <Link key={s.title} to={`${basePath}/services`}
                className={`group relative overflow-hidden p-6 lg:p-7 rounded-[1.75rem] transition-all hover:-translate-y-1 hover:shadow-xl ${base}
                  ${s.big ? "col-span-2 lg:col-span-2 lg:row-span-2 min-h-[280px] lg:min-h-[380px]" : "min-h-[200px]"}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${iconWrap}`}>
                  <s.icon className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <h3 className={`font-extrabold leading-tight tracking-tight ${s.big ? "text-2xl lg:text-4xl" : "text-base lg:text-lg"}`}>
                  {s.title}
                </h3>
                <p className={`mt-2 leading-relaxed ${descCls} ${s.big ? "text-base max-w-sm" : "text-xs sm:text-sm line-clamp-2"}`}>
                  {s.desc}
                </p>
                {s.big && (
                  <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">Featured</span>
                    <span className="w-12 h-12 rounded-full bg-akboy-forest text-akboy-moss flex items-center justify-center group-hover:rotate-45 transition-transform">
                      <ArrowUpRight className="w-5 h-5" />
                    </span>
                  </div>
                )}
                {!s.big && <ArrowUpRight className="absolute top-6 right-6 w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- PROCESS TIMELINE ---------------- */
const STEPS = [
  { i: "01", icon: MessageCircle, t: "Discovery", d: "Free consultation to map goals, gaps and realistic timelines." },
  { i: "02", icon: Compass,       t: "Strategy",  d: "We design a personalised roadmap — tutorial path, design brief, or both." },
  { i: "03", icon: PenTool,       t: "Execution", d: "Live classes, design sprints, mentorship — done with you, not at you." },
  { i: "04", icon: Rocket,        t: "Launch",    d: "Admission secured. Brand shipped. Skills earning income." },
];

function Process() {
  return (
    <section className="bg-akboy-cream px-5 sm:px-8 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-12 lg:mb-16">
          <Eyebrow>§02 — How we work</Eyebrow>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.02em] mt-3 leading-[1.02] text-akboy-ink">
            A process built for <span className="italic font-display text-akboy-forest">outcomes.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0 lg:divide-x divide-akboy-ink/10">
          {STEPS.map((s, i) => (
            <div key={s.i} className="relative lg:px-8 first:lg:pl-0 last:lg:pr-0">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-xs font-extrabold text-akboy-moss tracking-widest">{s.i}</span>
                <span className="h-px flex-1 bg-akboy-ink/15" />
              </div>
              <s.icon className="w-8 h-8 text-akboy-forest mb-4" strokeWidth={1.5} />
              <h3 className="text-xl lg:text-2xl font-extrabold text-akboy-ink tracking-tight">{s.t}</h3>
              <p className="text-sm text-akboy-ink/60 mt-2 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CAMPUS HUB ---------------- */
function CampusHub({ basePath }: { basePath: string }) {
  return (
    <section className="px-5 sm:px-8 py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Big card */}
          <div className="lg:col-span-7 bg-akboy-forest text-white rounded-[2.5rem] p-8 lg:p-14 relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-akboy-moss/20 rounded-full blur-3xl" />
            <div className="relative">
              <Eyebrow dark>§03 — Campus Hub</Eyebrow>
              <h2 className="text-4xl lg:text-6xl font-extrabold tracking-[-0.02em] mt-3 leading-[1.02]">
                Your shortcut into Nigeria's top universities.
              </h2>
              <p className="text-white/65 mt-5 max-w-md leading-relaxed">
                Cut-off mark calculator, course-fit advice, and one-on-one admission strategy
                with consultants who place 98% of students every year.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-8 max-w-md">
                <Link to={`${basePath}/campus-hub`}
                  className="px-5 py-4 rounded-2xl bg-akboy-moss text-akboy-forest font-bold text-sm flex items-center justify-between hover:scale-[1.02] transition-transform">
                  Aggregate Calc <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to={`${basePath}/contact`}
                  className="px-5 py-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur text-white font-bold text-sm flex items-center justify-between hover:bg-white/15">
                  Book a Mentor <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-5">
                <div className="flex -space-x-2">
                  {[hero1, hero3, hero4, team].map((s, i) => (
                    <img key={i} src={s} className="w-9 h-9 rounded-full border-2 border-akboy-forest object-cover" alt="" />
                  ))}
                </div>
                <div className="text-xs text-white/60"><span className="font-bold text-white">1,200+</span> students placed since 2019</div>
              </div>
            </div>
          </div>

          {/* Side stack */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex-1 bg-akboy-cream rounded-[2rem] p-7 border border-akboy-ink/8 relative overflow-hidden">
              <Calendar className="w-7 h-7 text-akboy-forest" />
              <h3 className="font-extrabold text-2xl text-akboy-ink mt-4 tracking-tight">Next Intake</h3>
              <p className="text-akboy-ink/60 text-sm mt-1">JAMB 2026 prep starts March 4</p>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                {[{n:"12", l:"weeks"}, {n:"6", l:"subjects"}, {n:"₦25k", l:"from"}].map((x) => (
                  <div key={x.l} className="bg-white rounded-2xl py-3">
                    <p className="font-extrabold text-akboy-forest text-lg">{x.n}</p>
                    <p className="text-[10px] uppercase tracking-wider text-akboy-ink/50">{x.l}</p>
                  </div>
                ))}
              </div>
              <Link to={`${basePath}/register`} className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-akboy-forest border-b-2 border-akboy-moss pb-1">
                Register Now <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-akboy-moss text-akboy-forest rounded-[2rem] p-7 relative overflow-hidden">
              <Sparkles className="w-7 h-7" />
              <h3 className="font-extrabold text-xl mt-4 tracking-tight">Mock CBT Simulator</h3>
              <p className="text-akboy-forest/75 text-sm mt-1 mb-4">Real JAMB-style timer, scoring & analytics.</p>
              <Link to={`${basePath}/mock-exam`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-akboy-forest text-akboy-moss text-xs font-bold uppercase tracking-wider">
                Try Free <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- PORTFOLIO SHOWCASE ---------------- */
const PORTFOLIO = [
  { tag: "Brand", title: "Greenwood Academy", img: hero1 },
  { tag: "Web",   title: "Lighthouse Hospital", img: hero2 },
  { tag: "Print", title: "Sahara Coffee Co.",   img: hero3 },
  { tag: "App",   title: "Pulse Fitness",       img: hero4 },
  { tag: "Brand", title: "Northstar Realty",    img: portfolioHero },
];

function Portfolio({ basePath }: { basePath: string }) {
  return (
    <section className="bg-akboy-ink text-akboy-cream px-5 sm:px-8 py-16 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="max-w-7xl mx-auto relative">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 lg:mb-16">
          <div className="max-w-xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-akboy-moss">§04 — Selected Work</span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.02em] mt-3 leading-[1.02]">
              Brands we made <span className="italic font-display text-akboy-moss">unforgettable.</span>
            </h2>
          </div>
          <Link to={`${basePath}/portfolio`} className="inline-flex items-center gap-2 text-akboy-moss font-bold text-xs uppercase tracking-[0.2em] border-b-2 border-akboy-moss/50 pb-1 w-fit">
            Full portfolio <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {PORTFOLIO.map((p, i) => (
            <Link key={p.title} to={`${basePath}/portfolio`}
              className={`group relative rounded-[1.75rem] overflow-hidden ${i === 0 ? "col-span-2 lg:row-span-2 lg:col-span-2 aspect-square lg:aspect-auto" : "aspect-[4/5]"}`}>
              <img src={p.img} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-akboy-ink via-akboy-ink/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-akboy-moss">{p.tag}</span>
                <h3 className={`font-extrabold tracking-tight mt-1 ${i === 0 ? "text-2xl lg:text-4xl" : "text-base lg:text-lg"}`}>{p.title}</h3>
              </div>
              <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-akboy-cream text-akboy-ink flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-5 h-5" />
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
  { quote: "AKBOY didn't just prep me for JAMB — they reshaped how I study. Scored 312.", name: "Aisha Bello", role: "UNILAG Medical" },
  { quote: "The brand identity they built for our school is now copied across the state.", name: "Mr. Ade Okon", role: "Greenwood Academy" },
  { quote: "From zero to landing my first design client in 8 weeks. Bootcamp delivers.", name: "Tunde Adigun", role: "Freelance Designer" },
];

function Testimonials() {
  return (
    <section className="px-5 sm:px-8 py-16 lg:py-24 bg-akboy-cream">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 lg:mb-14 max-w-2xl">
          <Eyebrow>§05 — Voices</Eyebrow>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.02em] mt-3 leading-[1.02] text-akboy-ink">
            Real stories from <span className="italic font-display text-akboy-forest">real people.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 lg:gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className={`p-7 lg:p-9 rounded-[2rem] ${i === 1 ? "bg-akboy-forest text-white md:-translate-y-4" : "bg-white border border-akboy-ink/8 text-akboy-ink shadow-sm"}`}>
              <Quote className="w-7 h-7 text-akboy-moss mb-5" />
              <p className={`text-base lg:text-lg font-semibold leading-snug ${i === 1 ? "text-white/95" : "text-akboy-ink/85"}`}>
                "{t.quote}"
              </p>
              <div className={`mt-7 pt-5 border-t flex items-center gap-1 ${i === 1 ? "border-white/15" : "border-akboy-ink/10"}`}>
                {[...Array(5)].map((_, k) => <Star key={k} className="w-3 h-3 fill-akboy-moss text-akboy-moss" />)}
              </div>
              <div className="mt-3">
                <div className="font-extrabold text-sm">{t.name}</div>
                <div className={`text-xs mt-0.5 ${i === 1 ? "text-white/55" : "text-akboy-ink/55"}`}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
const FAQS = [
  { q: "How long are the tutorial programmes?", a: "Standard JAMB & WAEC prep runs 12 weeks. Intensive (8 weeks) and weekend tracks are available." },
  { q: "Do you guarantee admission?",            a: "We guarantee process. Our consultancy has a 98% placement rate across UNILAG, UI, LASU and OAU." },
  { q: "Can I take design and tutorials together?", a: "Yes. Many students bundle academics with our design or digital-skills bootcamps at a 20% combined discount." },
  { q: "Where are classes held?",                a: "Hybrid — physical hub in Lagos plus live online sessions. All sessions are recorded." },
  { q: "Is payment one-time or instalment?",     a: "Both. Pay in full for a discount, or split across 2–3 instalments — no hidden fees." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="px-5 sm:px-8 py-16 lg:py-24 bg-white">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-4">
          <Eyebrow>§06 — FAQ</Eyebrow>
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-[-0.02em] mt-3 leading-[1.02] text-akboy-ink">
            Common <span className="italic font-display text-akboy-forest">questions.</span>
          </h2>
          <p className="text-akboy-ink/60 text-sm mt-5">Still curious? <Link to="#" className="underline decoration-akboy-moss underline-offset-4 font-bold text-akboy-forest">Talk to us.</Link></p>
        </div>
        <div className="lg:col-span-8 divide-y divide-akboy-ink/10 border-y border-akboy-ink/10">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <button key={i} onClick={() => setOpen(isOpen ? null : i)} className="w-full py-6 text-left flex items-start gap-4 group">
                <span className="text-xs font-extrabold text-akboy-moss tracking-widest pt-1">0{i+1}</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-extrabold text-base lg:text-lg text-akboy-ink tracking-tight">{f.q}</h3>
                    <span className="w-8 h-8 shrink-0 rounded-full border border-akboy-ink/15 flex items-center justify-center group-hover:bg-akboy-forest group-hover:text-akboy-moss group-hover:border-akboy-forest transition-colors">
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </div>
                  <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] mt-3 opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <p className="overflow-hidden text-akboy-ink/60 text-sm leading-relaxed pr-8">{f.a}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- NEWSLETTER + CTA ---------------- */
function CTA({ basePath }: { basePath: string }) {
  return (
    <section className="px-5 sm:px-8 py-16 lg:py-24 bg-akboy-cream">
      <div className="max-w-7xl mx-auto">
        <div className="bg-akboy-forest text-white rounded-[2.5rem] lg:rounded-[3rem] p-10 lg:p-20 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-akboy-moss/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-akboy-moss/10 rounded-full blur-3xl" />
          <Layers className="absolute top-10 right-10 w-32 h-32 text-akboy-moss/10" strokeWidth={0.5} />

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-end">
            <div>
              <Eyebrow dark>§07 — Begin</Eyebrow>
              <h2 className="text-4xl lg:text-7xl font-extrabold tracking-[-0.02em] mt-4 leading-[0.95]">
                Ready to <span className="italic font-display text-akboy-moss">learn, create</span> or grow?
              </h2>
              <p className="text-white/65 mt-6 text-base lg:text-lg max-w-lg">
                Book a free consultation. We'll map a plan tailored to where you are and where you're going.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to={`${basePath}/contact`} className="py-4 px-7 rounded-2xl bg-akboy-moss text-akboy-forest font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                  Book Consultation <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="https://wa.me/2348101466977" target="_blank" rel="noopener noreferrer"
                  className="py-4 px-7 rounded-2xl bg-white/10 border border-white/15 backdrop-blur text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/15 transition-colors">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 backdrop-blur rounded-[2rem] p-7 lg:p-9">
              <Mail className="w-7 h-7 text-akboy-moss" />
              <h3 className="font-extrabold text-xl lg:text-2xl mt-4 tracking-tight">Get the AKBOY brief.</h3>
              <p className="text-white/60 text-sm mt-2">Monthly admission tips, design drops & student spotlights. No spam.</p>
              <form className="mt-6 flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input type="email" required placeholder="you@email.com"
                  className="flex-1 px-4 py-3.5 rounded-xl bg-white/10 border border-white/15 placeholder:text-white/40 text-white text-sm focus:outline-none focus:border-akboy-moss" />
                <button className="px-5 rounded-xl bg-akboy-moss text-akboy-forest font-bold text-sm">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
              <div className="mt-4 text-[11px] text-white/40">Join 2,400+ readers</div>
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
        <Marquee />
        <Stats />
        <Ecosystem basePath={basePath} />
        <Process />
        <CampusHub basePath={basePath} />
        <Portfolio basePath={basePath} />
        <Testimonials />
        <FAQ />
        <CTA basePath={basePath} />
      </div>
    </AkboyLayout>
  );
}
