import { Link } from "react-router-dom";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  Sparkles,
  GraduationCap,
  Palette,
  Globe,
  Megaphone,
  BookOpen,
  Star,
  Quote,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";

export default function AkboyHome() {
  const { isAkboy, isCampusHub } = useDomainDetection();
  const basePath = isCampusHub ? "" : isAkboy ? "" : "/akboy";

  const services = [
    {
      icon: GraduationCap,
      title: "Educational Consultancy",
      desc: "Career guidance, JAMB/WAEC strategy and admissions support for students, parents and schools.",
      tag: "Education",
    },
    {
      icon: BookOpen,
      title: "Tutorials & Exam Prep",
      desc: "Structured JAMB & WAEC tutorials with experienced tutors, mock exams and result analytics.",
      tag: "Education",
    },
    {
      icon: Palette,
      title: "Graphic Design",
      desc: "Flyers, posters, social campaigns and print-ready visuals that look premium and on-brand.",
      tag: "Creative",
    },
    {
      icon: Globe,
      title: "Web Design",
      desc: "Modern, fast websites and landing pages for schools, businesses and personal brands.",
      tag: "Digital",
    },
    {
      icon: Megaphone,
      title: "Branding & Identity",
      desc: "Logos, brand systems and social-media identity that make you instantly recognisable.",
      tag: "Creative",
    },
  ];

  const reasons = [
    { title: "Education + Creativity in one place", desc: "We bridge classrooms and design studios — rare in Nigeria, essential for modern brands and modern students." },
    { title: "Premium work, accessible pricing", desc: "Agency-grade output without agency overhead. We protect both quality and your budget." },
    { title: "Trusted by students, schools & founders", desc: "From JAMB candidates to schools and small businesses, our clients keep coming back — and bringing friends." },
    { title: "Strategy before pixels", desc: "Every project starts with the goal: results, enrolments, leads — not just pretty deliverables." },
  ];

  const projects = [
    { title: "School Rebrand — Greenfield Academy", category: "Branding", color: "from-akboy-emerald to-akboy-forest" },
    { title: "JAMB Mastery Campaign", category: "Education Campaign", color: "from-akboy-butter to-akboy-moss" },
    { title: "Lumen Studio Website", category: "Web Design", color: "from-akboy-forest to-akboy-forest-deep" },
    { title: "Founders' Pitch Deck", category: "Graphic Design", color: "from-akboy-moss to-akboy-emerald" },
    { title: "Exam Prep E-book Series", category: "Educational Project", color: "from-akboy-butter to-akboy-leaf" },
    { title: "Bloom Bakery Identity", category: "Branding", color: "from-akboy-forest-deep to-akboy-emerald" },
  ];

  const stats = [
    { value: "1,200+", label: "Students impacted" },
    { value: "180+", label: "Projects delivered" },
    { value: "95%", label: "Client satisfaction" },
    { value: "5+", label: "Years of practice" },
  ];

  const testimonials = [
    {
      quote: "AKBOY didn't just design our school's identity — they reshaped how parents see us. Enrolment for the new session is up clearly.",
      name: "Mrs. Adebisi O.",
      role: "Principal, Greenfield Academy",
    },
    {
      quote: "I went from struggling with JAMB topics to scoring 287. The tutorials were focused, and the team genuinely cared.",
      name: "Tunde A.",
      role: "JAMB Candidate, 2025",
    },
    {
      quote: "Our brand finally feels intentional. The website, the visuals, the consistency — clients comment on it constantly.",
      name: "Chidinma E.",
      role: "Founder, Lumen Studio",
    },
  ];

  return (
    <AkboyLayout
      title="AKBOY Creative Hub — Education, Design & Digital Excellence"
      description="A Nigerian creative & educational hub helping students, schools, businesses and organizations grow through tutorials, graphic design, web design, branding and consultancy."
    >
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden bg-akboy-cream akboy-grain">
        <div className="absolute inset-0 akboy-gradient-mesh opacity-70 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 lg:pt-20 lg:pb-28">
          <div className="grid lg:grid-cols-[1.15fr,1fr] gap-12 lg:gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-white border border-akboy-stone rounded-full pl-1 pr-4 py-1 text-xs font-medium text-akboy-ink/80 shadow-sm">
                <span className="bg-akboy-forest text-akboy-cream rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider">New</span>
                Empowering students, schools & brands across Nigeria
              </span>

              <h1 className="mt-6 font-display text-[2.6rem] sm:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tight text-akboy-ink">
                Where <span className="text-akboy-forest">education</span> meets{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">creativity</span>
                  <span className="absolute left-0 right-0 bottom-1 h-3 sm:h-4 bg-akboy-butter -z-0 rounded-sm" />
                </span>
                .
              </h1>

              <p className="mt-6 text-lg text-akboy-ink/70 max-w-xl leading-relaxed">
                AKBOY Creative Hub helps students excel in exams and helps brands look the part — through tutorials, graphic design, web design, branding and educational consultancy.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-akboy-forest hover:bg-akboy-forest-deep text-akboy-cream rounded-full px-6 h-12 font-semibold shadow-lg shadow-akboy-forest/20">
                  <Link to={`${basePath}/consultation`}>
                    Book a free consultation
                    <ArrowUpRight className="ml-1 w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-6 h-12 border-akboy-ink/20 hover:border-akboy-forest text-akboy-ink hover:text-akboy-forest font-semibold bg-white/60">
                  <Link to={`${basePath}/portfolio`}>View portfolio</Link>
                </Button>
              </div>

              <div className="mt-10 flex items-center gap-6 text-sm text-akboy-ink/60">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-9 h-9 rounded-full ring-2 ring-akboy-cream bg-gradient-to-br from-akboy-emerald to-akboy-forest" />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-akboy-forest">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                  </div>
                  <p className="text-xs mt-0.5">Trusted by 1,200+ students & 80+ brands</p>
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative">
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden akboy-shadow-soft border border-white">
                <div className="absolute inset-0 akboy-gradient-forest" />
                <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, white, transparent 60%)" }} />
                <div className="relative h-full flex flex-col justify-between p-7 text-akboy-cream">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.2em] text-akboy-butter">Creative · Educational</span>
                    <Sparkles className="w-5 h-5 text-akboy-butter" />
                  </div>
                  <div>
                    <p className="font-display text-3xl sm:text-4xl leading-tight">
                      "Empowering growth through creativity and education."
                    </p>
                    <div className="mt-4 h-px bg-akboy-butter/40" />
                    <p className="mt-3 text-sm text-akboy-cream/75">Sulaimon Abdulhakeem Sonayon — Founder, AKBOY Creative Hub</p>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <div className="hidden sm:block absolute -left-6 top-10 bg-white rounded-2xl shadow-xl border border-akboy-stone p-4 w-56">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-akboy-butter flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-akboy-ink" />
                  </div>
                  <div>
                    <p className="text-xs text-akboy-ink/60">Average JAMB lift</p>
                    <p className="font-display font-semibold text-akboy-ink">+72 marks</p>
                  </div>
                </div>
              </div>
              <div className="hidden sm:block absolute -right-4 bottom-10 bg-white rounded-2xl shadow-xl border border-akboy-stone p-4 w-60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-akboy-forest flex items-center justify-center text-akboy-butter">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-akboy-ink/60">Brands rebuilt this year</p>
                    <p className="font-display font-semibold text-akboy-ink">38 identities</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TRUSTED BY ===================== */}
      <section className="bg-white border-y border-akboy-stone">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs uppercase tracking-[0.2em] text-akboy-ink/50">Trusted by students, schools & founders across Nigeria</p>
            <div className="flex flex-wrap items-center gap-x-10 gap-y-3 opacity-70">
              {["Greenfield Academy","Lumen Studio","Bloom Bakery","JAMB Hub","Edura","Campus Hub"].map(n => (
                <span key={n} className="font-display text-sm md:text-base font-semibold text-akboy-ink/60 tracking-wide">{n}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== ABOUT PREVIEW ===================== */}
      <section className="bg-akboy-cream py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative">
              <div className="aspect-[5/6] rounded-3xl bg-akboy-forest akboy-gradient-forest overflow-hidden relative">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 70% 20%, white, transparent 55%)" }} />
                <button className="absolute inset-0 flex items-center justify-center group">
                  <span className="w-20 h-20 rounded-full bg-akboy-butter text-akboy-ink flex items-center justify-center shadow-2xl group-hover:scale-110 transition">
                    <PlayCircle className="w-10 h-10" />
                  </span>
                </button>
              </div>
              <div className="absolute -bottom-6 -right-4 sm:-right-8 bg-white rounded-2xl shadow-xl border border-akboy-stone p-5 max-w-[240px]">
                <p className="font-display text-3xl font-semibold text-akboy-forest">5+ yrs</p>
                <p className="text-xs text-akboy-ink/60 mt-1">Helping the next generation of Nigerian students & brands win.</p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-akboy-forest font-semibold">About AKBOY</p>
              <h2 className="mt-3 font-display text-4xl lg:text-5xl font-semibold leading-tight text-akboy-ink">
                A hub for the next generation of Nigerian students & brands.
              </h2>
              <p className="mt-5 text-akboy-ink/70 leading-relaxed">
                AKBOY Creative Hub is a creative & educational company built on a simple belief — when education and creativity work together, growth is unstoppable.
                We support students preparing for JAMB and WAEC, advise schools on positioning, and help businesses and organizations design brands and websites that actually convert.
              </p>

              <div className="mt-7 grid sm:grid-cols-2 gap-4">
                {[
                  "Education-first thinking",
                  "Premium creative execution",
                  "Youth-driven, modern voice",
                  "Lagos based, working nationwide",
                ].map((t) => (
                  <div key={t} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-akboy-forest flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-akboy-ink/85">{t}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="bg-akboy-forest hover:bg-akboy-forest-deep text-akboy-cream rounded-full px-6 font-semibold">
                  <Link to={`${basePath}/about`}>Our story</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full px-6 border-akboy-ink/20 text-akboy-ink hover:text-akboy-forest hover:border-akboy-forest">
                  <Link to={`${basePath}/services`}>Explore services</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SERVICES ===================== */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.22em] text-akboy-forest font-semibold">What we do</p>
              <h2 className="mt-3 font-display text-4xl lg:text-5xl font-semibold leading-tight text-akboy-ink">
                Five disciplines. One mission — your growth.
              </h2>
            </div>
            <Link to={`${basePath}/services`} className="inline-flex items-center gap-2 text-akboy-forest font-semibold hover:gap-3 transition-all">
              All services <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => {
              const Icon = s.icon;
              const featured = i === 0;
              return (
                <Link
                  key={s.title}
                  to={`${basePath}/services`}
                  className={`group relative rounded-3xl p-7 border transition-all hover:-translate-y-1 ${
                    featured
                      ? "bg-akboy-forest text-akboy-cream border-akboy-forest sm:col-span-2 lg:col-span-1 lg:row-span-2 flex flex-col justify-between"
                      : "bg-akboy-cream border-akboy-stone hover:border-akboy-forest hover:bg-white"
                  }`}
                >
                  <div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${featured ? "bg-akboy-butter text-akboy-ink" : "bg-white text-akboy-forest border border-akboy-stone"}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${featured ? "text-akboy-butter" : "text-akboy-ink/50"}`}>{s.tag}</p>
                    <h3 className={`font-display text-2xl font-semibold leading-tight ${featured ? "text-akboy-cream" : "text-akboy-ink"}`}>{s.title}</h3>
                    <p className={`mt-3 text-sm leading-relaxed ${featured ? "text-akboy-cream/80" : "text-akboy-ink/65"}`}>{s.desc}</p>
                  </div>
                  <span className={`mt-6 inline-flex items-center gap-2 text-sm font-semibold ${featured ? "text-akboy-butter" : "text-akboy-forest"}`}>
                    Learn more <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== WHY CHOOSE US ===================== */}
      <section className="bg-akboy-cream py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs uppercase tracking-[0.22em] text-akboy-forest font-semibold">Why choose AKBOY</p>
            <h2 className="mt-3 font-display text-4xl lg:text-5xl font-semibold leading-tight text-akboy-ink">
              Built different — because growth isn't a template.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {reasons.map((r, i) => (
              <div key={r.title} className="relative bg-white border border-akboy-stone rounded-3xl p-7 hover:border-akboy-forest transition">
                <div className="absolute top-7 right-7 font-display text-5xl text-akboy-butter/70">0{i + 1}</div>
                <h3 className="font-display text-xl font-semibold text-akboy-ink pr-12">{r.title}</h3>
                <p className="mt-3 text-sm text-akboy-ink/65 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FEATURED PROJECTS ===================== */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.22em] text-akboy-forest font-semibold">Selected work</p>
              <h2 className="mt-3 font-display text-4xl lg:text-5xl font-semibold leading-tight text-akboy-ink">
                Recent projects.
              </h2>
            </div>
            <Link to={`${basePath}/portfolio`} className="inline-flex items-center gap-2 text-akboy-forest font-semibold hover:gap-3 transition-all">
              See full portfolio <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p) => (
              <Link key={p.title} to={`${basePath}/portfolio`} className="group">
                <div className={`aspect-[4/5] rounded-3xl bg-gradient-to-br ${p.color} relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, white, transparent 60%)" }} />
                  <div className="absolute top-4 left-4 bg-white/15 backdrop-blur-sm border border-white/20 text-akboy-cream text-[10px] uppercase tracking-[0.18em] px-3 py-1 rounded-full">{p.category}</div>
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                    <h3 className="font-display text-xl text-akboy-cream font-semibold pr-4 leading-tight">{p.title}</h3>
                    <span className="w-10 h-10 bg-akboy-butter text-akboy-ink rounded-full flex items-center justify-center flex-shrink-0 group-hover:rotate-45 transition-transform">
                      <ArrowUpRight className="w-5 h-5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== STATS ===================== */}
      <section className="bg-akboy-forest-deep akboy-grain py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center lg:text-left lg:border-l lg:border-akboy-cream/15 lg:pl-6">
                <p className="font-display text-5xl lg:text-6xl font-semibold text-akboy-butter leading-none">{s.value}</p>
                <p className="mt-3 text-sm text-akboy-cream/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== TESTIMONIALS ===================== */}
      <section className="bg-akboy-cream py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs uppercase tracking-[0.22em] text-akboy-forest font-semibold">Success stories</p>
            <h2 className="mt-3 font-display text-4xl lg:text-5xl font-semibold leading-tight text-akboy-ink">
              From students, schools and founders.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <figure key={t.name} className="bg-white border border-akboy-stone rounded-3xl p-7 flex flex-col">
                <Quote className="w-7 h-7 text-akboy-butter" />
                <blockquote className="mt-4 font-display text-lg leading-snug text-akboy-ink flex-1">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-6 pt-5 border-t border-akboy-stone">
                  <p className="font-semibold text-akboy-ink">{t.name}</p>
                  <p className="text-xs text-akboy-ink/55 mt-0.5">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to={`${basePath}/testimonials`} className="inline-flex items-center gap-2 text-akboy-forest font-semibold hover:gap-3 transition-all">
              Read more stories <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== BLOG / INSIGHTS PREVIEW ===================== */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.22em] text-akboy-forest font-semibold">Insights</p>
              <h2 className="mt-3 font-display text-4xl lg:text-5xl font-semibold leading-tight text-akboy-ink">
                Fresh from Campus Hub.
              </h2>
            </div>
            <Link to={`${basePath}/campus-hub`} className="inline-flex items-center gap-2 text-akboy-forest font-semibold hover:gap-3 transition-all">
              Browse all posts <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { cat: "Admissions", title: "How to navigate post-UTME like a pro in 2026", time: "5 min read" },
              { cat: "Exam Tips", title: "The WAEC mistake 80% of students still make", time: "4 min read" },
              { cat: "Design", title: "Why your school logo is quietly losing you enrolments", time: "6 min read" },
            ].map((b) => (
              <Link key={b.title} to={`${basePath}/campus-hub`} className="group block">
                <div className="aspect-[5/3] rounded-2xl bg-akboy-cream border border-akboy-stone overflow-hidden relative">
                  <div className="absolute inset-0 akboy-gradient-mesh opacity-90" />
                  <span className="absolute top-3 left-3 bg-white text-akboy-forest text-[10px] uppercase tracking-[0.18em] font-semibold px-2.5 py-1 rounded-full">{b.cat}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-akboy-ink group-hover:text-akboy-forest transition leading-snug">{b.title}</h3>
                <p className="mt-1 text-xs text-akboy-ink/50">{b.time}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="bg-akboy-cream pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] akboy-gradient-forest p-10 lg:p-16">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white, transparent 55%), radial-gradient(circle at 80% 70%, hsl(var(--akboy-butter)), transparent 55%)" }} />
            <div className="relative grid lg:grid-cols-[1.4fr,1fr] gap-10 items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-akboy-butter font-semibold">Ready when you are</p>
                <h2 className="mt-3 font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-akboy-cream leading-[1.05]">
                  Let's turn your idea — or your grades — into something remarkable.
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                <Button asChild size="lg" className="bg-akboy-butter hover:brightness-95 text-akboy-ink font-semibold rounded-full h-14 px-6">
                  <Link to={`${basePath}/consultation`}>Book a consultation</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-transparent border-akboy-cream/30 text-akboy-cream hover:bg-akboy-cream/10 hover:text-akboy-cream rounded-full h-14 px-6 font-semibold">
                  <Link to={`${basePath}/contact`}>Send a message</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AkboyLayout>
  );
}
