import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import {
  ArrowRight, ArrowUpRight, GraduationCap, Palette, Code, BookOpen,
  Megaphone, Heart, Star, MessageCircle, Sparkles, Plus, Minus,
  Play, Mail, ArrowDown, Circle,
} from "lucide-react";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import hero1 from "@/assets/akboy-hero-1.jpg";
import hero2 from "@/assets/akboy-hero-2.jpg";
import hero3 from "@/assets/akboy-hero-3.jpg";
import hero4 from "@/assets/akboy-hero-4.jpg";
import portfolioHero from "@/assets/akboy-portfolio-hero.jpg";
import team from "@/assets/akboy-team.jpg";

/* ================================================================
   AKBOY — Noir Edition
   Pitch-black canvas · luminous moss accent · giant editorial type
   ================================================================ */

/* ---------- primitives ---------- */
const Reveal = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShow(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }}
      className={`${className} transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      {children}
    </div>
  );
};

const Counter = ({ to, suffix = "" }: { to: number; suffix?: string }) => {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const start = performance.now(), dur = 1600;
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / dur);
          setN(Math.floor(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick); io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(el); return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
};

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.32em] text-white/45">
    <span className="w-1.5 h-1.5 rounded-full bg-akboy-moss shadow-[0_0_12px_hsl(var(--akboy-moss))]" />
    {children}
  </span>
);

/* ============ HERO ============ */
function Hero({ basePath }: { basePath: string }) {
  return (
    <section className="relative min-h-[100svh] flex flex-col overflow-hidden">
      {/* gradient orbs */}
      <div className="absolute top-1/4 -left-40 w-[40rem] h-[40rem] rounded-full bg-akboy-moss/[0.07] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-[36rem] h-[36rem] rounded-full bg-akboy-emerald/20 blur-[120px] pointer-events-none" />
      {/* grid */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
      {/* noise */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

      {/* meta strip */}
      <div className="relative px-6 lg:px-12 pt-6 lg:pt-8 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.28em] text-white/40">
        <span>Est. 2019 · Lagos</span>
        <span className="hidden md:flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-akboy-moss animate-pulse" /> Now Enrolling — March '26</span>
        <span>№07 / 2026</span>
      </div>

      <div className="relative flex-1 px-6 lg:px-12 flex items-center pt-16 pb-20 lg:pt-20">
        <div className="max-w-[1400px] mx-auto w-full grid lg:grid-cols-12 gap-10 items-center">
          {/* Headline */}
          <Reveal className="lg:col-span-8">
            <Eyebrow>Creative Hub · Est. Lagos</Eyebrow>
            <h1 className="mt-8 font-display font-extrabold tracking-[-0.04em] leading-[0.86] text-white text-[18vw] sm:text-[14vw] lg:text-[10.5vw] xl:text-[9rem]">
              <span className="block">We build</span>
              <span className="block">
                <span className="italic font-light text-akboy-moss">scholars</span>
                <span className="text-white/30"> &</span>
              </span>
              <span className="block">
                <span className="italic font-light text-akboy-moss">brands.</span>
              </span>
            </h1>

            <div className="mt-10 lg:mt-12 grid lg:grid-cols-2 gap-8 items-end">
              <p className="text-base lg:text-lg text-white/55 max-w-md leading-relaxed">
                A creative hub where students earn admissions into top universities and
                businesses earn identities people remember. Tutorials, consultancy, design
                & digital training — under one roof.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to={`${basePath}/services`}
                  className="group relative overflow-hidden py-4 px-7 rounded-full bg-akboy-moss text-akboy-ink font-bold text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:gap-3 transition-all">
                  Start a project <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <button className="group py-4 px-7 rounded-full border border-white/15 text-white font-bold text-sm uppercase tracking-[0.15em] hover:bg-white/5 hover:border-white/30 transition-all flex items-center justify-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-akboy-moss/15 flex items-center justify-center group-hover:bg-akboy-moss/25">
                    <Play className="w-3 h-3 text-akboy-moss fill-akboy-moss ml-0.5" />
                  </span>
                  Show reel
                </button>
              </div>
            </div>
          </Reveal>

          {/* Floating glass card */}
          <Reveal delay={200} className="lg:col-span-4 hidden lg:block">
            <div className="relative">
              <div className="relative rounded-[2rem] overflow-hidden ring-1 ring-white/10 bg-white/[0.02] backdrop-blur-xl">
                <img src={hero2} alt="" className="w-full h-[28rem] object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-akboy-ink via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <Eyebrow>Featured</Eyebrow>
                  <p className="mt-3 font-display text-2xl font-extrabold text-white leading-tight">Class of 2025 — 98% placement rate.</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-akboy-ink border border-white/10 rounded-2xl p-4 pr-6 flex items-center gap-3 shadow-2xl">
                <div className="flex -space-x-2">
                  {[hero1, hero3, hero4].map((s, i) => <img key={i} src={s} className="w-8 h-8 rounded-full border-2 border-akboy-ink object-cover" alt="" />)}
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Trusted by</div>
                  <div className="text-sm font-bold text-white">1,200+ students</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* bottom bar */}
      <div className="relative px-6 lg:px-12 pb-8 flex items-end justify-between text-[10px] font-bold uppercase tracking-[0.28em] text-white/35">
        <span className="flex items-center gap-2"><ArrowDown className="w-3 h-3 animate-bounce" /> Scroll</span>
        <div className="hidden sm:flex items-center gap-6">
          <span>Tutorials</span><Circle className="w-1 h-1 fill-akboy-moss text-akboy-moss" />
          <span>Design</span><Circle className="w-1 h-1 fill-akboy-moss text-akboy-moss" />
          <span>Consultancy</span><Circle className="w-1 h-1 fill-akboy-moss text-akboy-moss" />
          <span>Digital</span>
        </div>
      </div>
    </section>
  );
}

/* ============ INFINITE MARQUEE ============ */
function Marquee() {
  const items = ["Admission Consultancy", "Brand Identity", "Web Development", "JAMB Tutorials", "Quran & Tajweed", "UI/UX Design", "Digital Bootcamps", "Print & Packaging"];
  return (
    <section className="border-y border-white/[0.06] overflow-hidden py-8 bg-white/[0.015]">
      <div className="flex gap-16 whitespace-nowrap animate-[marquee_45s_linear_infinite]">
        {[...items, ...items, ...items].map((x, i) => (
          <span key={i} className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight text-white/15 flex items-center gap-16">
            {x}
            <span className="text-akboy-moss text-2xl">✺</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-33.333%)}}`}</style>
    </section>
  );
}

/* ============ MANIFESTO ============ */
function Manifesto() {
  return (
    <section className="px-6 lg:px-12 py-24 lg:py-40 relative">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-3"><Eyebrow>§01 — Manifesto</Eyebrow></div>
        <Reveal className="lg:col-span-9">
          <p className="font-display text-[7vw] lg:text-[3.5rem] xl:text-[4.5rem] leading-[1.05] tracking-[-0.025em] text-white/85 font-light">
            We sit at the intersection of <span className="italic text-akboy-moss font-extrabold">education</span> and
            <span className="italic text-akboy-moss font-extrabold"> design</span> — a place where
            future doctors get their cut-off marks, and young brands get an identity that outlives the trend cycle. <span className="text-white/35">One studio. Two missions.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ STATS ============ */
function Stats() {
  const items = [
    { n: 1200, s: "+", l: "Students Placed" },
    { n: 300,  s: "+", l: "Brands Built" },
    { n: 98,   s: "%", l: "Admission Rate" },
    { n: 7,    s: "y", l: "In the Game" },
  ];
  return (
    <section className="px-6 lg:px-12 py-16 lg:py-20 border-y border-white/[0.06]">
      <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x divide-white/[0.06]">
        {items.map((s, i) => (
          <Reveal key={i} delay={i * 100} className="lg:px-10 first:lg:pl-0">
            <p className="font-display text-6xl lg:text-7xl font-extrabold tracking-[-0.04em] text-white">
              <Counter to={s.n} suffix={s.s} />
            </p>
            <p className="text-[10px] font-bold mt-3 uppercase tracking-[0.28em] text-white/40">{s.l}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ============ ECOSYSTEM (services) ============ */
const SERVICES = [
  { n: "01", icon: GraduationCap, t: "Admission Consultancy", d: "UNILAG, UI, LASU, overseas. Strategy that places." },
  { n: "02", icon: BookOpen,      t: "Tutorial Services",     d: "JAMB, WAEC, Post-UTME. Live & on-demand." },
  { n: "03", icon: Palette,       t: "Graphics Design",       d: "Identity systems, social, packaging & print." },
  { n: "04", icon: Code,          t: "Web & App Design",      d: "Conversion-grade product surfaces." },
  { n: "05", icon: Megaphone,     t: "Digital Skills",        d: "Bootcamps in design, no-code, marketing, AI." },
  { n: "06", icon: Heart,         t: "Quran & Tajweed",       d: "Personalised spiritual growth classes." },
];

function Ecosystem({ basePath }: { basePath: string }) {
  return (
    <section className="px-6 lg:px-12 py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto">
        <Reveal>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16 lg:mb-20">
            <div>
              <Eyebrow>§02 — Capabilities</Eyebrow>
              <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-[-0.03em] mt-6 leading-[0.95] text-white max-w-3xl">
                Six disciplines.<br />
                <span className="italic font-light text-akboy-moss">One creative hub.</span>
              </h2>
            </div>
            <Link to={`${basePath}/services`} className="group inline-flex items-center gap-3 text-akboy-moss font-bold text-xs uppercase tracking-[0.22em] w-fit">
              All services
              <span className="w-10 h-10 rounded-full border border-akboy-moss/40 flex items-center justify-center group-hover:bg-akboy-moss group-hover:text-akboy-ink transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] border border-white/[0.06] rounded-3xl overflow-hidden">
          {SERVICES.map((s, i) => (
            <Reveal key={s.n} delay={i * 80}>
              <Link to={`${basePath}/services`}
                className="group relative bg-akboy-ink p-8 lg:p-10 flex flex-col h-full min-h-[280px] hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-akboy-moss tracking-[0.3em]">{s.n}</span>
                  <ArrowUpRight className="w-5 h-5 text-white/30 group-hover:text-akboy-moss group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="mt-auto pt-16">
                  <s.icon className="w-8 h-8 text-akboy-moss mb-6" strokeWidth={1.25} />
                  <h3 className="font-display text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">{s.t}</h3>
                  <p className="text-sm text-white/45 mt-3 leading-relaxed">{s.d}</p>
                </div>
                <span className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-akboy-moss to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ PROCESS (vertical timeline) ============ */
const STEPS = [
  { n: "01", t: "Discovery",  d: "Free 30-min consultation — goals mapped, gaps surfaced, timelines realistic." },
  { n: "02", t: "Strategy",   d: "Personalised roadmap. Tutorial path. Design brief. Or both, stitched together." },
  { n: "03", t: "Execution",  d: "Live classes, design sprints, mentorship — done with you, not at you." },
  { n: "04", t: "Launch",     d: "Admission secured. Brand shipped. Skills earning income within 90 days." },
];

function Process() {
  return (
    <section className="px-6 lg:px-12 py-24 lg:py-32 border-y border-white/[0.06] bg-white/[0.01]">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-10 lg:gap-20">
        <div className="lg:col-span-4">
          <Eyebrow>§03 — How we work</Eyebrow>
          <h2 className="font-display text-5xl lg:text-7xl font-extrabold tracking-[-0.03em] mt-6 leading-[0.95] text-white">
            A process built for <span className="italic font-light text-akboy-moss">outcomes.</span>
          </h2>
        </div>
        <div className="lg:col-span-8">
          <div className="relative">
            <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-akboy-moss/60 via-white/10 to-transparent" />
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 100} className="relative pl-12 pb-12 last:pb-0">
                <span className="absolute left-0 top-2 w-6 h-6 rounded-full bg-akboy-ink border-2 border-akboy-moss flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-akboy-moss" />
                </span>
                <div className="flex items-baseline gap-4">
                  <span className="text-xs font-bold text-akboy-moss tracking-[0.3em]">{s.n}</span>
                  <h3 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight text-white">{s.t}</h3>
                </div>
                <p className="text-base text-white/50 mt-3 leading-relaxed max-w-lg">{s.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ CAMPUS HUB ============ */
function CampusHub({ basePath }: { basePath: string }) {
  return (
    <section className="px-6 lg:px-12 py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto">
        <Reveal>
          <div className="relative rounded-[2.5rem] overflow-hidden border border-white/[0.08] bg-gradient-to-br from-akboy-emerald/15 via-white/[0.02] to-akboy-moss/10 p-8 lg:p-16">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-akboy-moss/15 blur-3xl" />
            <div className="grid lg:grid-cols-12 gap-10 relative">
              <div className="lg:col-span-7">
                <Eyebrow>§04 — Campus Hub</Eyebrow>
                <h2 className="font-display text-5xl lg:text-7xl font-extrabold tracking-[-0.03em] mt-6 leading-[0.95] text-white">
                  Your shortcut into Nigeria's top <span className="italic font-light text-akboy-moss">universities.</span>
                </h2>
                <p className="text-white/55 mt-6 max-w-lg text-base lg:text-lg leading-relaxed">
                  Cut-off mark calculator, course-fit advice, and 1-on-1 admission strategy
                  with consultants who place 98% of students every year.
                </p>
                <div className="flex flex-wrap gap-3 mt-10">
                  <Link to={`${basePath}/campus-hub`}
                    className="py-4 px-6 rounded-full bg-akboy-moss text-akboy-ink font-bold text-sm uppercase tracking-[0.15em] flex items-center gap-2 hover:gap-3 transition-all">
                    Aggregate Calc <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to={`${basePath}/contact`}
                    className="py-4 px-6 rounded-full border border-white/15 text-white font-bold text-sm uppercase tracking-[0.15em] hover:bg-white/5 transition-colors">
                    Book a Mentor
                  </Link>
                  <Link to={`${basePath}/mock-exam`}
                    className="py-4 px-6 rounded-full border border-white/15 text-white font-bold text-sm uppercase tracking-[0.15em] hover:bg-white/5 transition-colors">
                    Free Mock CBT
                  </Link>
                </div>
              </div>
              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                {[
                  { l: "Next Intake", v: "Mar 4" },
                  { l: "Duration",    v: "12 wks" },
                  { l: "From",        v: "₦25k" },
                  { l: "Cohort",      v: "60 seats" },
                ].map((x) => (
                  <div key={x.l} className="aspect-square bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex flex-col justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">{x.l}</span>
                    <span className="font-display text-3xl lg:text-4xl font-extrabold text-white">{x.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ PORTFOLIO ============ */
const WORK = [
  { tag: "Brand · 2025", title: "Greenwood Academy",  img: hero1 },
  { tag: "Web · 2025",   title: "Lighthouse Hospital", img: hero2 },
  { tag: "Print · 2024", title: "Sahara Coffee Co.",   img: hero3 },
  { tag: "App · 2024",   title: "Pulse Fitness",       img: hero4 },
  { tag: "Identity · '24", title: "Northstar Realty",  img: portfolioHero },
  { tag: "Editorial · '24", title: "The Lagos Brief",  img: team },
];

function Portfolio({ basePath }: { basePath: string }) {
  return (
    <section className="px-6 lg:px-12 py-24 lg:py-32 border-t border-white/[0.06]">
      <div className="max-w-[1400px] mx-auto">
        <Reveal>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
            <div>
              <Eyebrow>§05 — Selected Work</Eyebrow>
              <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-[-0.03em] mt-6 leading-[0.95] text-white">
                Brands we made <span className="italic font-light text-akboy-moss">unforgettable.</span>
              </h2>
            </div>
            <Link to={`${basePath}/portfolio`} className="group inline-flex items-center gap-3 text-akboy-moss font-bold text-xs uppercase tracking-[0.22em] w-fit">
              View archive
              <span className="w-10 h-10 rounded-full border border-akboy-moss/40 flex items-center justify-center group-hover:bg-akboy-moss group-hover:text-akboy-ink transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </Reveal>

        <div className="space-y-1">
          {WORK.map((p, i) => (
            <Reveal key={p.title} delay={i * 60}>
              <Link to={`${basePath}/portfolio`}
                className="group relative grid grid-cols-12 items-center gap-4 py-6 lg:py-8 border-b border-white/[0.06] hover:border-akboy-moss/30 transition-colors">
                <span className="col-span-2 lg:col-span-1 text-xs font-bold text-white/30 tracking-widest">0{i+1}</span>
                <h3 className="col-span-10 lg:col-span-5 font-display text-2xl sm:text-3xl lg:text-5xl font-extrabold tracking-[-0.02em] text-white group-hover:text-akboy-moss group-hover:translate-x-2 transition-all">
                  {p.title}
                </h3>
                <span className="hidden lg:block col-span-3 text-xs font-bold uppercase tracking-[0.2em] text-white/35">{p.tag}</span>
                <div className="hidden lg:block col-span-2 h-24 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                  <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <div className="col-span-12 lg:col-span-1 flex justify-end">
                  <ArrowUpRight className="w-6 h-6 text-white/30 group-hover:text-akboy-moss group-hover:rotate-45 transition-transform duration-500" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ TESTIMONIALS (horizontal scroll) ============ */
const VOICES = [
  { q: "AKBOY didn't just prep me for JAMB — they reshaped how I study. Scored 312.", n: "Aisha Bello", r: "UNILAG Medical" },
  { q: "The brand identity they built for our school is now copied across the state.", n: "Mr. Ade Okon", r: "Greenwood Academy" },
  { q: "From zero to landing my first design client in 8 weeks. Bootcamp delivers.", n: "Tunde Adigun", r: "Freelance Designer" },
  { q: "Their consultant mapped my exact path to Pharmacy at UI. First trial admission.", n: "Funmi Adesina", r: "UI Pharmacy" },
];

function Testimonials() {
  return (
    <section className="py-24 lg:py-32 overflow-hidden">
      <div className="px-6 lg:px-12 max-w-[1400px] mx-auto mb-12">
        <Reveal>
          <Eyebrow>§06 — Voices</Eyebrow>
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.03em] mt-6 leading-[0.95] text-white max-w-3xl">
            Real stories from <span className="italic font-light text-akboy-moss">real people.</span>
          </h2>
        </Reveal>
      </div>
      <div className="flex gap-5 px-6 lg:px-12 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-6">
        {VOICES.map((t, i) => (
          <div key={i} className="snap-start shrink-0 w-[88vw] sm:w-[28rem] lg:w-[32rem] bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 lg:p-10">
            <div className="flex items-center gap-1 mb-6">
              {[...Array(5)].map((_, k) => <Star key={k} className="w-3.5 h-3.5 fill-akboy-moss text-akboy-moss" />)}
            </div>
            <p className="font-display text-2xl lg:text-3xl font-light leading-snug text-white tracking-tight">
              "{t.q}"
            </p>
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-white">{t.n}</div>
                <div className="text-xs text-white/45 mt-0.5">{t.r}</div>
              </div>
              <Sparkles className="w-5 h-5 text-akboy-moss" />
            </div>
          </div>
        ))}
        <div className="shrink-0 w-12" />
      </div>
      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </section>
  );
}

/* ============ FAQ ============ */
const FAQS = [
  { q: "How long are the tutorial programmes?", a: "Standard JAMB & WAEC prep runs 12 weeks. Intensive (8 weeks) and weekend tracks are available." },
  { q: "Do you guarantee admission?",            a: "We guarantee the process. Our consultancy has a 98% placement rate across UNILAG, UI, LASU and OAU." },
  { q: "Can I bundle tutorials and design?",    a: "Yes — bundle academics with our design or digital-skills bootcamps for a 20% combined discount." },
  { q: "Where are classes held?",                a: "Hybrid — physical hub in Lagos plus live online sessions. All sessions are recorded." },
  { q: "Is payment one-time or instalment?",     a: "Both. Pay in full for a discount, or split across 2–3 instalments — no hidden fees." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="px-6 lg:px-12 py-24 lg:py-32 border-t border-white/[0.06]">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-10 lg:gap-20">
        <div className="lg:col-span-4">
          <Eyebrow>§07 — Common Questions</Eyebrow>
          <h2 className="font-display text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] mt-6 leading-[0.95] text-white">
            Things people <span className="italic font-light text-akboy-moss">ask.</span>
          </h2>
        </div>
        <div className="lg:col-span-8">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <button key={i} onClick={() => setOpen(isOpen ? null : i)}
                className="w-full py-7 text-left border-b border-white/[0.08] group">
                <div className="flex items-start justify-between gap-6">
                  <h3 className="font-display text-xl lg:text-2xl font-extrabold tracking-tight text-white group-hover:text-akboy-moss transition-colors">{f.q}</h3>
                  <span className="w-9 h-9 shrink-0 rounded-full border border-white/15 flex items-center justify-center group-hover:bg-akboy-moss group-hover:border-akboy-moss group-hover:text-akboy-ink transition-colors">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </div>
                <div className={`grid transition-all duration-500 ${isOpen ? "grid-rows-[1fr] mt-4 opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <p className="overflow-hidden text-white/55 text-base leading-relaxed pr-12 max-w-2xl">{f.a}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============ CTA + Newsletter ============ */
function CTA({ basePath }: { basePath: string }) {
  return (
    <section className="px-6 lg:px-12 py-24 lg:py-32 border-t border-white/[0.06] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] rounded-full bg-akboy-moss/[0.04] blur-[120px] pointer-events-none" />
      <div className="max-w-[1400px] mx-auto relative">
        <Reveal>
          <Eyebrow>§08 — Begin</Eyebrow>
          <h2 className="font-display text-[14vw] sm:text-[10vw] lg:text-[8.5vw] xl:text-[9rem] font-extrabold tracking-[-0.04em] leading-[0.86] text-white mt-8">
            Let's <span className="italic font-light text-akboy-moss">build</span><br />
            something <span className="italic font-light text-akboy-moss">real.</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <p className="text-white/55 text-base lg:text-lg max-w-lg leading-relaxed">
              Book a free consultation. Whether it's an admission strategy or a new brand —
              we'll map a plan tailored to where you are and where you're going.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={`${basePath}/contact`}
                className="group py-5 px-8 rounded-full bg-akboy-moss text-akboy-ink font-bold text-sm uppercase tracking-[0.18em] flex items-center gap-3 hover:gap-4 transition-all">
                Book consultation <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="https://wa.me/2348101466977" target="_blank" rel="noopener noreferrer"
                className="py-5 px-8 rounded-full border border-white/15 text-white font-bold text-sm uppercase tracking-[0.18em] flex items-center gap-3 hover:bg-white/5">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          </div>
          <div className="lg:col-span-5 bg-white/[0.03] border border-white/[0.08] rounded-3xl p-7">
            <div className="flex items-center gap-3 mb-5">
              <Mail className="w-5 h-5 text-akboy-moss" />
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/50">The AKBOY Brief</span>
            </div>
            <p className="text-white text-base lg:text-lg font-display leading-snug">
              Monthly admission tips, design drops & student spotlights.
            </p>
            <form className="mt-6 flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input type="email" required placeholder="you@email.com"
                className="flex-1 px-4 py-3.5 rounded-full bg-white/[0.04] border border-white/10 placeholder:text-white/30 text-white text-sm focus:outline-none focus:border-akboy-moss" />
              <button className="px-5 rounded-full bg-akboy-moss text-akboy-ink font-bold text-sm">
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-3 text-[11px] text-white/35">Join 2,400+ readers · No spam.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ PAGE ============ */
export default function AkboyHome() {
  const { isAkboy } = useDomainDetection();
  const basePath = isAkboy ? "" : "/akboy";

  return (
    <AkboyLayout
      title="AKBOY Creative Hub — Scholars & Brands, Made Here"
      description="A creative hub where students earn admissions into top universities and brands earn identities people remember."
    >
      <div className="bg-akboy-ink text-white font-body antialiased selection:bg-akboy-moss selection:text-akboy-ink">
        <Hero basePath={basePath} />
        <Marquee />
        <Manifesto />
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
