import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ArrowRight, ArrowUpRight, Sparkles, GraduationCap, Palette, Code, Users, BookOpen, Briefcase,
  Star, Quote, MessageCircle, Send, Mail, Phone, MapPin, ChevronRight, Trophy, Target,
  Zap, Globe, PenTool, Layers, Megaphone, CheckCircle2, Play, Award, Heart, TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import hero1 from "@/assets/akboy-hero-1.jpg";
import hero2 from "@/assets/akboy-hero-2.jpg";
import hero3 from "@/assets/akboy-hero-3.jpg";
import hero4 from "@/assets/akboy-hero-4.jpg";
import eduraMockup from "@/assets/edura-dashboard-mockup.png";

/* ---------------- ANNOUNCEMENT BAR ---------------- */
const ANNOUNCEMENTS = [
  { tag: "NEW", text: "JAMB 2026 Success Orientation — registration open", href: "/register" },
  { tag: "UPDATE", text: "UNILAG, LASU, UI admission lists trending on Campus Hub", href: "/campus-hub" },
  { tag: "FREE", text: "Download our JAMB CBT practice — 5,000+ past questions", href: "https://edura.space" },
  { tag: "BRAND", text: "Now booking creative design projects for Q1 — limited slots", href: "/services" },
];

function AnnouncementBar() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % ANNOUNCEMENTS.length), 4200);
    return () => clearInterval(t);
  }, []);
  const a = ANNOUNCEMENTS[i];
  return (
    <div className="fixed top-16 sm:top-20 inset-x-0 z-40 flex justify-center pointer-events-none px-3">
      <a
        href={a.href}
        className="pointer-events-auto akboy-glass-dark text-white rounded-full pl-2 pr-4 py-1.5 flex items-center gap-3 text-xs sm:text-sm shadow-xl hover:scale-[1.02] transition-transform max-w-full"
      >
        <span className="bg-akboy-butter text-akboy-forest font-bold text-[10px] tracking-wider px-2 py-0.5 rounded-full">{a.tag}</span>
        <span className="truncate font-medium">{a.text}</span>
        <ArrowUpRight className="w-3.5 h-3.5 opacity-80 flex-shrink-0" />
      </a>
    </div>
  );
}

/* ---------------- HERO ---------------- */
function Hero({ basePath }: { basePath: string }) {
  return (
    <section className="relative pt-24 sm:pt-32 pb-20 lg:pb-32 overflow-hidden akboy-gradient-mesh">
      <div className="absolute inset-0 akboy-grain opacity-60 pointer-events-none" />
      {/* floating blobs */}
      <div className="absolute -top-32 -right-24 w-[28rem] h-[28rem] bg-akboy-leaf/20 akboy-blob blur-3xl" />
      <div className="absolute -bottom-40 -left-20 w-[26rem] h-[26rem] bg-akboy-butter/30 akboy-blob blur-3xl" style={{ animationDelay: "3s" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
        {/* copy */}
        <div className="lg:col-span-7 space-y-7">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur border border-akboy-forest/10 text-xs font-semibold text-akboy-forest tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-akboy-butter" />
            CREATIVE HUB · EDUCATION · DIGITAL INNOVATION
          </span>
          <h1 className="font-display text-[2.75rem] sm:text-6xl lg:text-7xl xl:text-[5.5rem] leading-[0.95] tracking-tight text-akboy-ink">
            Where <em className="not-italic text-akboy-forest">Education</em>
            <br />
            meets <span className="relative inline-block">
              <span className="relative z-10">Creativity</span>
              <span className="absolute left-0 right-0 bottom-1 h-3 sm:h-4 bg-akboy-butter/70 -z-0 rounded-sm" />
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-akboy-ink/70 max-w-xl leading-relaxed font-body">
            AKBOY Creative Hub blends <strong>tutorials, admission consultancy, design and digital
            training</strong> into one premium ecosystem — built for ambitious students, schools and brands.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="h-14 px-7 rounded-full bg-akboy-forest hover:bg-akboy-forest-deep text-white text-base font-semibold akboy-shadow-soft group">
              <Link to={`${basePath}/services`}>
                Explore Services
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-7 rounded-full border-2 border-akboy-forest/20 bg-white/60 backdrop-blur text-akboy-forest hover:bg-white text-base font-semibold">
              <Link to={`${basePath}/register`}>
                <Play className="mr-2 w-4 h-4 fill-current" />
                Start Learning
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-6 pt-4">
            <div className="flex -space-x-2">
              {[hero1, hero2, hero3, hero4].map((src, idx) => (
                <img key={idx} src={src} alt="" className="w-9 h-9 rounded-full border-2 border-white object-cover" />
              ))}
            </div>
            <div className="text-sm">
              <div className="flex items-center gap-1 text-akboy-butter">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                <span className="ml-1 font-bold text-akboy-ink">4.9</span>
              </div>
              <div className="text-xs text-akboy-ink/60">Trusted by 1,200+ students & brands</div>
            </div>
          </div>
        </div>

        {/* floating visual cluster */}
        <div className="lg:col-span-5 relative h-[480px] sm:h-[560px] hidden lg:block">
          {/* main mockup card */}
          <div className="absolute top-4 right-0 w-[78%] aspect-[4/5] rounded-[2rem] overflow-hidden akboy-glass akboy-shadow-soft akboy-float-slow" style={{ ['--rot' as any]: '3deg' }}>
            <img src={hero2} alt="Akboy student" className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-4 right-4 akboy-glass-dark rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-akboy-butter flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-akboy-forest" />
                </div>
                <div className="text-white">
                  <div className="text-xs opacity-80">JAMB 2025</div>
                  <div className="font-bold text-sm">320+ scored by our students</div>
                </div>
              </div>
            </div>
          </div>
          {/* portfolio card */}
          <div className="absolute top-24 -left-2 w-[55%] rounded-2xl overflow-hidden akboy-glass-dark akboy-shadow-soft akboy-float-slow" style={{ ['--rot' as any]: '-5deg', animationDelay: '1.4s' }}>
            <div className="aspect-[4/3] bg-gradient-to-br from-akboy-forest via-akboy-emerald to-akboy-leaf flex items-center justify-center">
              <Palette className="w-16 h-16 text-akboy-butter" />
            </div>
            <div className="p-3 text-white">
              <div className="text-[10px] uppercase tracking-wider opacity-70">Brand Identity</div>
              <div className="font-bold text-sm">Latest Project</div>
            </div>
          </div>
          {/* stat pill */}
          <div className="absolute bottom-8 left-4 akboy-glass rounded-2xl p-4 akboy-float-slow" style={{ animationDelay: '2.8s' }}>
            <div className="text-3xl font-display font-bold text-akboy-forest">98%</div>
            <div className="text-xs text-akboy-ink/70 font-medium">Admission success rate</div>
          </div>
          {/* edura mockup small */}
          <div className="absolute bottom-0 right-6 w-40 rounded-xl overflow-hidden border-4 border-white shadow-2xl akboy-float-slow" style={{ ['--rot' as any]: '6deg', animationDelay: '4s' }}>
            <img src={eduraMockup} alt="Edura mockup" className="w-full h-auto object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- TRUSTED BY ---------------- */
function TrustedBy() {
  const items = ["Lagos State University", "University of Ibadan", "UNILAG", "Greenwood Academy", "Bridge International", "Coastline Schools", "BrightFuture Tutors", "EduraCBT", "UNIOSUN", "Covenant Prep"];
  return (
    <section className="py-12 bg-white border-y border-akboy-stone">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs uppercase tracking-[0.25em] text-akboy-ink/50 font-semibold mb-6">
          Trusted by schools, students, parents & brands across Nigeria
        </p>
        <div className="overflow-hidden relative">
          <div className="flex gap-12 akboy-marquee whitespace-nowrap">
            {[...items, ...items].map((name, i) => (
              <div key={i} className="flex items-center gap-2 text-akboy-ink/40 hover:text-akboy-forest transition-colors">
                <div className="w-2 h-2 rounded-full bg-akboy-butter" />
                <span className="font-display text-xl font-semibold">{name}</span>
              </div>
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
        </div>
      </div>
    </section>
  );
}

/* ---------------- ABOUT ---------------- */
function About({ basePath }: { basePath: string }) {
  return (
    <section className="relative py-24 lg:py-32 bg-akboy-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 relative">
          <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden akboy-shadow-soft">
            <img src={hero3} alt="Akboy story" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-akboy-forest/50 to-transparent" />
          </div>
          <div className="absolute -bottom-6 -right-6 akboy-glass rounded-2xl p-5 max-w-[14rem]">
            <Quote className="w-6 h-6 text-akboy-butter mb-2" />
            <p className="text-sm font-display italic text-akboy-ink/80 leading-snug">
              "We build the bridge between learning and creating."
            </p>
          </div>
        </div>
        <div className="lg:col-span-7 space-y-6">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-akboy-forest font-bold">
            <span className="w-8 h-px bg-akboy-forest" /> About AKBOY
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-akboy-ink leading-[1.05] tracking-tight">
            A hub where students become <em className="not-italic text-akboy-forest">scholars</em>,
            and brands become <em className="not-italic text-akboy-forest">stories</em>.
          </h2>
          <p className="text-lg text-akboy-ink/70 font-body leading-relaxed max-w-2xl">
            AKBOY Creative Hub exists at the intersection of education and creativity. We guide students
            into top universities, train the next wave of digital creators, and design brands that move
            people. One ecosystem. Real outcomes.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            {[
              { label: "Mission", text: "Empower youth through education + creative skills." },
              { label: "Vision",  text: "Africa's most loved hub for learning & design." },
              { label: "Impact",  text: "1,200+ students guided. 300+ brands built." },
            ].map((b) => (
              <div key={b.label} className="p-5 rounded-2xl bg-white border border-akboy-stone hover:border-akboy-forest/30 transition-colors">
                <div className="text-xs uppercase tracking-wider text-akboy-butter font-bold mb-1">{b.label}</div>
                <p className="text-sm text-akboy-ink/75 leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
          <Button asChild variant="ghost" className="text-akboy-forest hover:bg-akboy-mint/40 px-4 group">
            <Link to={`${basePath}/about`}>
              Read our full story
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- SERVICES ---------------- */
const SERVICES = [
  { icon: GraduationCap, title: "Educational Consultancy", desc: "JAMB · WAEC · Post-UTME · Admission strategy", tone: "forest", span: "lg:col-span-7 lg:row-span-2" },
  { icon: BookOpen, title: "Tutorial Services", desc: "Live & on-demand classes for secondary & uni students", tone: "butter", span: "lg:col-span-5" },
  { icon: Palette, title: "Graphics Design", desc: "Brand identity · flyers · social · packaging", tone: "leaf", span: "lg:col-span-5" },
  { icon: Code, title: "Web Development", desc: "Modern, fast, conversion-ready websites", tone: "forest", span: "lg:col-span-4" },
  { icon: Megaphone, title: "Digital Skills Training", desc: "Bootcamps in design, no-code, marketing & AI", tone: "butter", span: "lg:col-span-4" },
  { icon: Heart, title: "Quran & Tajweed Classes", desc: "Personalized memorization & pronunciation coaching", tone: "leaf", span: "lg:col-span-4" },
];

function Services({ basePath }: { basePath: string }) {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
          <div>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-akboy-forest font-bold mb-4">
              <span className="w-8 h-px bg-akboy-forest" /> What we do
            </span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-akboy-ink leading-[1.05] max-w-2xl">
              Six services. One <em className="not-italic text-akboy-forest">creative ecosystem</em>.
            </h2>
          </div>
          <Button asChild variant="outline" className="rounded-full border-akboy-forest/20 hover:bg-akboy-forest hover:text-white">
            <Link to={`${basePath}/services`}>All services <ArrowUpRight className="ml-1 w-4 h-4" /></Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-12 gap-4 sm:gap-5 auto-rows-[180px]">
          {SERVICES.map((s, i) => {
            const isForest = s.tone === "forest";
            const isButter = s.tone === "butter";
            return (
              <div
                key={i}
                className={`${s.span} group relative overflow-hidden rounded-3xl p-7 lg:p-8 transition-all hover:-translate-y-1 cursor-pointer
                  ${isForest ? "bg-akboy-forest text-white" : isButter ? "bg-akboy-butter/90 text-akboy-ink" : "bg-akboy-mint/40 text-akboy-ink"}`}
              >
                <div className="flex flex-col h-full justify-between">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isForest ? "bg-white/15" : "bg-white/70"}`}>
                    <s.icon className={`w-6 h-6 ${isForest ? "text-akboy-butter" : "text-akboy-forest"}`} />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl lg:text-3xl mb-2 leading-tight">{s.title}</h3>
                    <p className={`text-sm font-body ${isForest ? "text-white/75" : "text-akboy-ink/70"}`}>{s.desc}</p>
                  </div>
                </div>
                <ArrowUpRight className={`absolute top-6 right-6 w-5 h-5 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all ${isForest ? "text-akboy-butter" : "text-akboy-forest"}`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FEATURED PROGRAMS ---------------- */
const PROGRAMS = [
  { tag: "JAMB · WAEC", title: "Exam Success Orientation", desc: "Intensive prep covering syllabus mastery, exam tactics & mindset.", img: hero1, href: "/register" },
  { tag: "CONSULTANCY", title: "Admission Assistance", desc: "1-on-1 university placement guidance — UNILAG, LASU, UI, UNIOSUN.", img: hero2, href: "/services" },
  { tag: "CREATIVE", title: "Graphics Design Course", desc: "Master Canva, Photoshop & Illustrator with live projects.", img: hero3, href: "/services" },
  { tag: "DIGITAL", title: "Website Design Training", desc: "Build modern responsive websites with no-code & code tools.", img: hero4, href: "/services" },
];

function FeaturedPrograms({ basePath }: { basePath: string }) {
  return (
    <section className="py-24 lg:py-32 bg-akboy-cream relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-akboy-forest font-bold mb-4">
            <span className="w-8 h-px bg-akboy-forest" /> Featured programs
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-akboy-ink leading-[1.05] max-w-3xl">
            Programs built to <em className="not-italic text-akboy-forest">change trajectories</em>.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {PROGRAMS.map((p, i) => (
            <Link
              key={i}
              to={`${basePath}${p.href}`}
              className="group relative rounded-3xl overflow-hidden bg-white akboy-shadow-soft hover:-translate-y-1 transition-transform"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-6 lg:p-7">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-akboy-butter">{p.tag}</span>
                <h3 className="font-display text-2xl lg:text-3xl text-akboy-ink mt-2 mb-2">{p.title}</h3>
                <p className="text-akboy-ink/70 text-sm leading-relaxed">{p.desc}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-akboy-forest font-semibold text-sm">
                  Learn more <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- WHY CHOOSE (animated counters) ---------------- */
function useCounter(target: number, duration = 1600, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min((t - t0) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return val;
}

function WhyChoose() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setActive(true), { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const stats = [
    { n: 1200, suffix: "+", label: "Students Guided" },
    { n: 320,  suffix: "+", label: "Projects Completed" },
    { n: 45,   suffix: "+", label: "Schools Served" },
    { n: 98,   suffix: "%", label: "Success Stories" },
    { n: 6,    suffix: "+", label: "Years Experience" },
  ];
  return (
    <section ref={ref} className="relative py-24 lg:py-32 akboy-gradient-forest text-white overflow-hidden">
      <div className="absolute inset-0 akboy-grain opacity-30" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-akboy-butter/20 akboy-blob blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-akboy-butter font-bold mb-4">
            <span className="w-8 h-px bg-akboy-butter" /> Why choose AKBOY
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
            Numbers that <em className="not-italic text-akboy-butter">tell our story</em>.
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-10">
          {stats.map((s, i) => (
            <StatItem key={i} n={s.n} suffix={s.suffix} label={s.label} active={active} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatItem({ n, suffix, label, active }: { n: number; suffix: string; label: string; active: boolean }) {
  const v = useCounter(n, 1800, active);
  return (
    <div className="border-t border-white/15 pt-5">
      <div className="font-display text-5xl lg:text-6xl text-akboy-butter font-bold tabular-nums">{v}{suffix}</div>
      <div className="text-sm text-white/70 mt-2 font-medium">{label}</div>
    </div>
  );
}


/* ---------------- SUCCESS STORIES ---------------- */
const SUCCESS = [
  { name: "Aisha O.", score: "298", school: "UNILAG · Pharmacy", quote: "Akboy's mentorship turned my JAMB prep around. From 198 to 298 in one cycle.", img: hero1 },
  { name: "Tunde A.", score: "312", school: "UI · Medicine", quote: "The admission consultancy made the impossible feel methodical. I'm in med school today.", img: hero2 },
  { name: "Zainab S.", score: "Brand", school: "FreshLeaf Bakery", quote: "Our brand identity from Akboy doubled our orders in the first month.", img: hero3 },
];

function SuccessStories() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-14 max-w-3xl">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-akboy-forest font-bold mb-4">
            <span className="w-8 h-px bg-akboy-forest" /> Success stories
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-akboy-ink leading-[1.05]">
            Real students. Real brands. <em className="not-italic text-akboy-forest">Real wins.</em>
          </h2>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {SUCCESS.map((s, i) => (
            <div key={i} className="group relative rounded-3xl overflow-hidden akboy-shadow-soft bg-akboy-cream">
              <div className="aspect-[4/5] overflow-hidden">
                <img src={s.img} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-akboy-forest-deep via-akboy-forest/40 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <div className="inline-block bg-akboy-butter text-akboy-forest text-xs font-bold px-2.5 py-1 rounded-full mb-3">{s.score}</div>
                <h3 className="font-display text-2xl mb-1">{s.name}</h3>
                <div className="text-xs text-white/80 mb-3">{s.school}</div>
                <p className="text-sm text-white/90 italic leading-relaxed">"{s.quote}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- PORTFOLIO MASONRY ---------------- */
function Portfolio({ items, basePath }: { items: any[]; basePath: string }) {
  const fallback = [
    { title: "EduraCBT · UI Identity", category: "Web Design", img: eduraMockup },
    { title: "FreshLeaf Brand", category: "Branding", img: hero3 },
    { title: "Campus Hub Launch", category: "Editorial", img: hero1 },
    { title: "JAMB Orientation Flyer", category: "Print", img: hero2 },
    { title: "School Onboarding Pack", category: "Identity", img: hero4 },
    { title: "Founders Talk Series", category: "Social", img: hero3 },
  ];
  const list = items?.length ? items.slice(0, 6).map((p) => ({
    title: p.title, category: p.category || "Project", img: p.image_url || p.cover_image || hero1
  })) : fallback;
  return (
    <section className="py-24 lg:py-32 bg-akboy-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-akboy-forest font-bold mb-4">
              <span className="w-8 h-px bg-akboy-forest" /> Selected work
            </span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-akboy-ink leading-[1.05]">
              Creative <em className="not-italic text-akboy-forest">portfolio</em>.
            </h2>
          </div>
          <Button asChild variant="ghost" className="text-akboy-forest hover:bg-akboy-mint/40 group w-fit">
            <Link to={`${basePath}/portfolio`}>
              See full portfolio <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
          {list.map((p, i) => (
            <div key={i} className="mb-5 break-inside-avoid group relative overflow-hidden rounded-2xl akboy-shadow-soft cursor-pointer">
              <img src={p.img} alt={p.title}
                className={`w-full object-cover ${i % 3 === 0 ? "aspect-[4/5]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/3]"} group-hover:scale-105 transition-transform duration-700`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-akboy-forest-deep/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                <div className="text-white">
                  <div className="text-[10px] uppercase tracking-wider text-akboy-butter font-bold">{p.category}</div>
                  <div className="font-display text-xl mt-1">{p.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- TESTIMONIALS ---------------- */
const TESTIMONIALS = [
  { name: "Mrs. Folake A.", role: "Parent", quote: "Akboy doesn't just teach — they genuinely care. My daughter is now at UNILAG.", rating: 5 },
  { name: "Ifeanyi O.", role: "Student", quote: "From design tutorials to admission help, Akboy is the only hub I trust.", rating: 5 },
  { name: "Prof. Adeyemi", role: "School Owner", quote: "We've partnered for 3 years. Their delivery is consistently world-class.", rating: 5 },
  { name: "Chiamaka Brand Co.", role: "Business Owner", quote: "They rebuilt our identity. Our brand finally feels like us.", rating: 5 },
];

function Testimonials() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((p) => (p + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-akboy-forest font-bold mb-4">
          <span className="w-8 h-px bg-akboy-forest" /> Testimonials
        </span>
        <Quote className="w-12 h-12 text-akboy-butter mx-auto mb-6" />
        <div className="min-h-[220px]">
          <p className="font-display text-2xl sm:text-3xl lg:text-4xl text-akboy-ink leading-snug italic">
            "{TESTIMONIALS[idx].quote}"
          </p>
          <div className="mt-8">
            <div className="flex justify-center gap-0.5 text-akboy-butter mb-2">
              {[...Array(TESTIMONIALS[idx].rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <div className="font-bold text-akboy-ink">{TESTIMONIALS[idx].name}</div>
            <div className="text-sm text-akboy-ink/60">{TESTIMONIALS[idx].role}</div>
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-6">
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-8 bg-akboy-forest" : "w-1.5 bg-akboy-forest/20"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- NEWS / CAMPUS HUB ---------------- */
function News({ posts, basePath }: { posts: any[]; basePath: string }) {
  const items = posts?.length ? posts : [
    { title: "JAMB 2026: Key changes every candidate must know", category: "JAMB Updates", id: "1", created_at: new Date().toISOString() },
    { title: "Top scholarships open for Nigerian students this quarter", category: "Opportunities", id: "2", created_at: new Date().toISOString() },
    { title: "Branding in 2026: trends that move buyers", category: "Design Insights", id: "3", created_at: new Date().toISOString() },
  ];
  const featured = items[0];
  const rest = items.slice(1, 3);
  return (
    <section className="py-24 lg:py-32 bg-akboy-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-akboy-forest font-bold mb-4">
              <span className="w-8 h-px bg-akboy-forest" /> Latest from Campus Hub
            </span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-akboy-ink leading-[1.05] max-w-2xl">
              News, insights & <em className="not-italic text-akboy-forest">opportunities</em>.
            </h2>
          </div>
          <Button asChild variant="outline" className="rounded-full border-akboy-forest/20 hover:bg-akboy-forest hover:text-white w-fit">
            <Link to={`${basePath}/campus-hub`}>Visit Campus Hub <ArrowUpRight className="ml-1 w-4 h-4" /></Link>
          </Button>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Link to={`${basePath}/blog/${featured.id}`} className="group relative rounded-3xl overflow-hidden akboy-shadow-soft bg-akboy-forest text-white p-8 lg:p-10 min-h-[440px] flex flex-col justify-between">
            <div>
              <span className="inline-block bg-akboy-butter text-akboy-forest text-xs font-bold px-2.5 py-1 rounded-full">FEATURED</span>
              <div className="text-[10px] uppercase tracking-wider text-akboy-butter mt-6 font-bold">{featured.category || "Story"}</div>
            </div>
            <div>
              <h3 className="font-display text-3xl lg:text-5xl leading-[1.05] mb-4">{featured.title}</h3>
              <div className="inline-flex items-center gap-1 text-akboy-butter font-semibold">
                Read story <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-akboy-butter/20 akboy-blob blur-3xl" />
          </Link>
          <div className="space-y-6">
            {rest.map((p, i) => (
              <Link key={i} to={`${basePath}/blog/${p.id}`} className="group block bg-white rounded-3xl p-6 lg:p-7 akboy-shadow-soft hover:-translate-y-1 transition-transform">
                <div className="text-[10px] uppercase tracking-wider text-akboy-butter font-bold mb-2">{p.category || "Story"}</div>
                <h3 className="font-display text-xl lg:text-2xl text-akboy-ink leading-tight mb-3">{p.title}</h3>
                <div className="inline-flex items-center gap-1 text-akboy-forest text-sm font-semibold">
                  Read <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- RESOURCES ---------------- */
function Resources() {
  const links = [
    { icon: BookOpen, title: "Past Questions", desc: "JAMB · WAEC · NECO archive", href: "https://edura.space/resources" },
    { icon: Layers, title: "Study Guides", desc: "Subject breakdowns & syllabi", href: "https://edura.space/resources" },
    { icon: PenTool, title: "Design Templates", desc: "Free editable Canva packs", href: "/services" },
    { icon: Globe, title: "Blog Resources", desc: "Articles, how-tos & news", href: "/campus-hub" },
  ];
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-akboy-forest font-bold mb-4">
            <span className="w-8 h-px bg-akboy-forest" /> Resources hub <span className="w-8 h-px bg-akboy-forest" />
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-akboy-ink leading-[1.05] max-w-3xl mx-auto">
            Everything you need to <em className="not-italic text-akboy-forest">level up</em>. Free.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {links.map((l, i) => (
            <a key={i} href={l.href} className="group p-7 rounded-3xl bg-akboy-cream border border-akboy-stone hover:border-akboy-forest hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-xl bg-akboy-forest text-akboy-butter flex items-center justify-center mb-5 group-hover:rotate-6 transition-transform">
                <l.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl text-akboy-ink mb-1">{l.title}</h3>
              <p className="text-sm text-akboy-ink/60">{l.desc}</p>
              <ArrowUpRight className="w-4 h-4 text-akboy-forest mt-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FOUNDER ---------------- */
function Founder() {
  return (
    <section className="py-24 lg:py-32 bg-akboy-forest text-white relative overflow-hidden">
      <div className="absolute inset-0 akboy-grain opacity-30" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-akboy-butter/15 akboy-blob blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5">
          <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden akboy-shadow-soft">
            <img src={hero4} alt="Sulaimon Abdulhakeem Sonayon" className="w-full h-full object-cover" />
            <div className="absolute bottom-6 left-6 right-6 akboy-glass-dark rounded-2xl p-4">
              <div className="text-[10px] uppercase tracking-widest text-akboy-butter font-bold">Founder · CEO</div>
              <div className="font-display text-xl mt-1">Sulaimon Abdulhakeem Sonayon</div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-7 space-y-6">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-akboy-butter font-bold">
            <span className="w-8 h-px bg-akboy-butter" /> Meet the founder
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
            Educator. Designer. <em className="not-italic text-akboy-butter">Builder.</em>
          </h2>
          <p className="text-lg text-white/80 leading-relaxed max-w-2xl font-body">
            Sulaimon is an educator, graphic designer, entrepreneur and the Founder/CEO of AKBOY Creative
            Hub. With years of experience in teaching, design and youth development, he is committed to
            helping students, businesses and organizations achieve their goals through impactful learning
            experiences and creative solutions.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            {[
              { icon: GraduationCap, label: "Educator", val: "6+ yrs teaching" },
              { icon: Palette, label: "Designer", val: "300+ brands" },
              { icon: Briefcase, label: "Founder", val: "AKBOY Hub" },
            ].map((b) => (
              <div key={b.label} className="p-4 rounded-2xl akboy-glass-dark">
                <b.icon className="w-5 h-5 text-akboy-butter mb-2" />
                <div className="text-xs uppercase tracking-wider text-white/60 font-bold">{b.label}</div>
                <div className="text-sm font-semibold mt-0.5">{b.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- COMMUNITY ---------------- */
function Community() {
  const [email, setEmail] = useState("");
  return (
    <section className="py-24 lg:py-32 bg-akboy-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-akboy-forest font-bold mb-4">
            <span className="w-8 h-px bg-akboy-forest" /> Community
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-akboy-ink leading-[1.05] mb-5">
            Join 5,000+ <em className="not-italic text-akboy-forest">ambitious students</em>.
          </h2>
          <p className="text-akboy-ink/70 text-lg mb-6">Get tutorials, admission updates and creative drops weekly. No spam, ever.</p>
          <div className="flex gap-2 max-w-md">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-full px-5 bg-white border-akboy-forest/10"
            />
            <Button className="h-12 px-6 rounded-full bg-akboy-forest hover:bg-akboy-forest-deep text-white">
              Subscribe <Send className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: MessageCircle, name: "WhatsApp", desc: "Daily updates", href: "https://wa.me/2348101466977", color: "bg-emerald-600" },
            { icon: Send, name: "Telegram", desc: "Free resources", href: "#", color: "bg-sky-600" },
            { icon: Mail, name: "Newsletter", desc: "Weekly digest", href: "#", color: "bg-akboy-forest" },
            { icon: Globe, name: "Socials", desc: "@akboycreativehub", href: "https://instagram.com/akboycreativehub", color: "bg-akboy-butter" },
          ].map((c, i) => (
            <a key={i} href={c.href} target="_blank" rel="noopener noreferrer"
              className="group p-5 rounded-2xl bg-white border border-akboy-stone hover:-translate-y-1 hover:border-akboy-forest transition-all">
              <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center mb-3`}>
                <c.icon className="w-5 h-5 text-white" />
              </div>
              <div className="font-display text-lg text-akboy-ink">{c.name}</div>
              <div className="text-xs text-akboy-ink/60">{c.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
const FAQS = [
  { q: "How does Akboy's admission consultancy work?", a: "We assess your JAMB score, O'Level results and goals, then build a step-by-step admission roadmap across UNILAG, LASU, UI, UNIOSUN and more." },
  { q: "Are tutorial classes online or physical?", a: "Both. We run live online classes, on-demand recordings and selected physical centres for intensive prep seasons." },
  { q: "Do you train beginners in graphics design?", a: "Yes. Our bootcamps start from absolute beginner to portfolio-ready in 8–12 weeks." },
  { q: "Can my school partner with Akboy?", a: "Absolutely — we support school-wide CBT, mock exams, branding and digital training. Reach out via Contact." },
  { q: "What payment options do you accept?", a: "Card, bank transfer and Paystack. We also offer installment plans for select training programs." },
];

function FAQ() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-akboy-forest font-bold mb-4">
            <span className="w-8 h-px bg-akboy-forest" /> FAQs
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-akboy-ink leading-[1.05]">
            Questions? <em className="not-italic text-akboy-forest">We've got you.</em>
          </h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`f-${i}`} className="border border-akboy-stone rounded-2xl px-6 bg-akboy-cream data-[state=open]:bg-white data-[state=open]:border-akboy-forest/30">
              <AccordionTrigger className="text-left font-display text-lg text-akboy-ink hover:no-underline py-5">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-akboy-ink/70 text-base leading-relaxed pb-5">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ---------------- CONTACT ---------------- */
function Contact() {
  return (
    <section className="py-24 lg:py-32 bg-akboy-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10">
        <div>
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-akboy-forest font-bold mb-4">
            <span className="w-8 h-px bg-akboy-forest" /> Get in touch
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-akboy-ink leading-[1.05] mb-6">
            Let's start a <em className="not-italic text-akboy-forest">conversation</em>.
          </h2>
          <p className="text-akboy-ink/70 text-lg mb-8 max-w-md">Booking a project, joining a class or simply curious? We respond within 24 hours.</p>
          <div className="space-y-4">
            {[
              { icon: MessageCircle, label: "WhatsApp", val: "+234 810 146 6977", href: "https://wa.me/2348101466977" },
              { icon: Mail, label: "Email", val: "akboycreativehub@gmail.com", href: "mailto:akboycreativehub@gmail.com" },
              { icon: Phone, label: "Phone", val: "+234 810 146 6977", href: "tel:+2348101466977" },
              { icon: MapPin, label: "Location", val: "Lagos, Nigeria", href: "#" },
            ].map((c) => (
              <a key={c.label} href={c.href} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-akboy-stone hover:border-akboy-forest/40 transition-colors group">
                <div className="w-11 h-11 rounded-xl bg-akboy-forest text-akboy-butter flex items-center justify-center group-hover:scale-110 transition-transform">
                  <c.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-akboy-ink/60 uppercase tracking-wider font-bold">{c.label}</div>
                  <div className="font-semibold text-akboy-ink">{c.val}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
        <form className="bg-white rounded-3xl p-7 lg:p-9 akboy-shadow-soft space-y-4 h-fit">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-akboy-ink/60 font-bold">Name</label>
              <Input className="mt-1.5 h-12 bg-akboy-cream border-transparent focus:border-akboy-forest" placeholder="Your name" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-akboy-ink/60 font-bold">Email</label>
              <Input type="email" className="mt-1.5 h-12 bg-akboy-cream border-transparent focus:border-akboy-forest" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-akboy-ink/60 font-bold">What do you need?</label>
            <Input className="mt-1.5 h-12 bg-akboy-cream border-transparent focus:border-akboy-forest" placeholder="e.g. Admission help, brand identity..." />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-akboy-ink/60 font-bold">Message</label>
            <textarea rows={5} className="mt-1.5 w-full rounded-md bg-akboy-cream border border-transparent focus:border-akboy-forest focus:outline-none px-3 py-3 text-sm" placeholder="Tell us a bit more..." />
          </div>
          <Button type="button" className="w-full h-12 rounded-full bg-akboy-forest hover:bg-akboy-forest-deep text-white text-base font-semibold">
            Send message <Send className="ml-2 w-4 h-4" />
          </Button>
        </form>
      </div>
    </section>
  );
}

/* ---------------- BIG CTA ---------------- */
function BigCTA({ basePath }: { basePath: string }) {
  return (
    <section className="relative py-28 lg:py-40 akboy-gradient-forest text-white overflow-hidden">
      <div className="absolute inset-0 akboy-grain opacity-30" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-akboy-butter/10 akboy-blob blur-3xl" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Sparkles className="w-8 h-8 text-akboy-butter mx-auto mb-6" />
        <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95] mb-8">
          Ready to <em className="not-italic text-akboy-butter">Learn</em>,
          <br /> <em className="not-italic text-akboy-butter">Create</em> and <em className="not-italic text-akboy-butter">Succeed</em>?
        </h2>
        <p className="text-xl text-white/75 max-w-2xl mx-auto mb-10">Join the AKBOY ecosystem today. One hub for your education, brand and digital future.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="h-14 px-8 rounded-full bg-akboy-butter hover:bg-akboy-butter/90 text-akboy-forest text-base font-bold">
            <Link to={`${basePath}/register`}>Start Learning <ArrowRight className="ml-2 w-5 h-5" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-14 px-8 rounded-full border-2 border-white/30 bg-white/5 backdrop-blur text-white hover:bg-white hover:text-akboy-forest text-base font-semibold">
            <Link to={`${basePath}/contact`}>Book a Consultation</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ================================================ */
export default function AkboyHome() {
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const { isAkboy } = useDomainDetection();
  const basePath = isAkboy ? "" : "/akboy";

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from("blog_posts").select("*").eq("is_published", true).order("created_at", { ascending: false }).limit(3);
        setBlogPosts(data || []);
      } catch {}
    })();
    (async () => {
      try {
        const { data } = await supabase.from("akboy_portfolio").select("*").eq("is_active", true).order("display_order", { ascending: true }).limit(6);
        setPortfolio(data || []);
      } catch {}
    })();
  }, []);

  return (
    <AkboyLayout
      title="AKBOY Creative Hub — Education meets Creativity"
      description="Premium tutorials, admission consultancy, graphics design, web development and digital training for Nigerian students and brands."
    >
      <div className="font-body text-akboy-ink">
        <AnnouncementBar />
        <Hero basePath={basePath} />
        <TrustedBy />
        <About basePath={basePath} />
        <Services basePath={basePath} />
        <FeaturedPrograms basePath={basePath} />
        <WhyChoose />
        <SuccessStories />
        <Portfolio items={portfolio} basePath={basePath} />
        <Testimonials />
        <News posts={blogPosts} basePath={basePath} />
        <Resources />
        <Founder />
        <Community />
        <FAQ />
        <Contact />
        <BigCTA basePath={basePath} />
      </div>
    </AkboyLayout>
  );
}
