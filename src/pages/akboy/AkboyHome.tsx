import { Link } from "react-router-dom";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import {
  ArrowRight, Phone, Play, CheckCircle2, GraduationCap, Code2, Palette,
  Lightbulb, Trophy, Users, BookOpen, Sparkles, Star, Quote, Calendar,
} from "lucide-react";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import hero from "@/assets/akboy-hero.jpg";
import heroAlt from "@/assets/akboy-about-hero.jpg";
import h1 from "@/assets/akboy-hero-1.jpg";
import h2 from "@/assets/akboy-hero-2.jpg";
import h3 from "@/assets/akboy-hero-3.jpg";
import h4 from "@/assets/akboy-hero-4.jpg";
import team from "@/assets/akboy-team.jpg";
import portfolio from "@/assets/akboy-portfolio-hero.jpg";
import events from "@/assets/akboy-events-hero.jpg";

/* ============================================================
   AKBOY — Infotek-style structure
   Pillars: Education · Technology · Creativity
   Palette: bone #F2EFE6 · ink #0B2A1F · forest #234B36 · citrus #D7F26A
   ============================================================ */

const BONE = "#F2EFE6";
const INK = "#0B2A1F";
const FOREST = "#234B36";
const CITRUS = "#D7F26A";

const display = { fontFamily: "'Space Grotesk', system-ui, sans-serif" };

const Eyebrow = ({ children, light }: { children: React.ReactNode; light?: boolean }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="h-px w-8" style={{ backgroundColor: light ? CITRUS : FOREST }} />
    <span
      className="text-[11px] font-bold uppercase tracking-[0.3em]"
      style={{ color: light ? CITRUS : FOREST }}
    >
      {children}
    </span>
  </div>
);

/* ===================== 1. HERO ===================== */
function Hero({ basePath }: { basePath: string }) {
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: BONE }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Copy */}
        <div>
          <Eyebrow>Best Creative Hub</Eyebrow>
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight mb-6"
            style={{ ...display, color: INK }}
          >
            Grow Your Future <br />
            With <span style={{ color: FOREST }}>Education,</span> <br />
            Tech &amp; Creativity.
          </h1>
          <p className="text-lg max-w-xl mb-10 leading-relaxed" style={{ color: `${INK}CC` }}>
            AKBOY is a creative learning ecosystem helping students, schools and brands
            unlock potential through expert tutorials, modern technology training and
            high-impact design.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to={`${basePath}/services`}
              className="inline-flex items-center gap-3 px-7 py-4 rounded-full font-semibold text-sm transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: FOREST, color: CITRUS }}
            >
              Explore More <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={`${basePath}/contact`}
              className="inline-flex items-center gap-3 px-7 py-4 rounded-full font-semibold text-sm border-2 transition-colors hover:bg-[#0B2A1F] hover:text-[#F2EFE6]"
              style={{ borderColor: INK, color: INK }}
            >
              Contact Us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Visual */}
        <div className="relative">
          <div
            className="absolute -top-6 -left-6 w-40 h-40 rounded-full opacity-30 blur-3xl"
            style={{ backgroundColor: CITRUS }}
          />
          <div
            className="relative aspect-[4/5] rounded-[120px_120px_24px_120px] overflow-hidden border-4"
            style={{ borderColor: INK }}
          >
            <img src={hero} alt="Students learning" className="w-full h-full object-cover" />
          </div>
          {/* floating badge */}
          <div
            className="absolute -bottom-6 -left-6 px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
            style={{ backgroundColor: INK, color: BONE }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: CITRUS }}>
              <Trophy className="w-5 h-5" style={{ color: INK }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={display}>98%</div>
              <div className="text-[10px] uppercase tracking-widest opacity-70">Success Rate</div>
            </div>
          </div>
          <div
            className="absolute top-8 -right-4 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2"
            style={{ backgroundColor: CITRUS, color: INK }}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Award Winning</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===================== 2. ABOUT ===================== */
function About({ basePath }: { basePath: string }) {
  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: BONE }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Visual */}
        <div className="relative">
          <div
            className="aspect-square rounded-[140px_24px_140px_24px] overflow-hidden border-4"
            style={{ borderColor: INK }}
          >
            <img src={heroAlt} alt="Akboy learning" className="w-full h-full object-cover" />
          </div>
          <button
            className="absolute inset-0 m-auto w-20 h-20 rounded-full flex items-center justify-center shadow-2xl"
            style={{ backgroundColor: CITRUS, color: INK }}
            aria-label="Play intro"
          >
            <Play className="w-7 h-7 ml-1 fill-current" />
          </button>
          <div
            className="absolute -bottom-6 -right-6 px-6 py-5 rounded-2xl shadow-xl"
            style={{ backgroundColor: FOREST, color: BONE }}
          >
            <div className="text-3xl font-bold" style={display}>6,561+</div>
            <div className="text-xs uppercase tracking-widest opacity-80 mt-1">Learners Trained</div>
          </div>
        </div>

        {/* Copy */}
        <div>
          <Eyebrow>About Akboy</Eyebrow>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6" style={{ ...display, color: INK }}>
            We Empower Minds With Education &amp; Creativity
          </h2>
          <p className="text-base leading-relaxed mb-8" style={{ color: `${INK}B3` }}>
            From admission consultancy and JAMB tutorials to design bootcamps and web
            engineering — AKBOY is where ambitious learners build the skills the future
            actually rewards.
          </p>
          <ul className="space-y-3 mb-8">
            {[
              "Expert-led tutorials & mentorship",
              "Hands-on technology bootcamps",
              "Creative design & brand training",
            ].map((line) => (
              <li key={line} className="flex items-center gap-3 text-sm font-medium" style={{ color: INK }}>
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: FOREST }} />
                {line}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-6">
            <Link
              to={`${basePath}/about`}
              className="inline-flex items-center gap-3 px-7 py-4 rounded-full font-semibold text-sm"
              style={{ backgroundColor: FOREST, color: CITRUS }}
            >
              Explore More <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: CITRUS }}>
                <Phone className="w-4 h-4" style={{ color: INK }} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest" style={{ color: `${INK}80` }}>Call Us Now</div>
                <div className="text-sm font-bold" style={{ color: INK }}>+234 801 234 5678</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===================== 3. BRANDS STRIP ===================== */
function Brands() {
  const brands = ["UNILAG", "OAU", "COVENANT", "BABCOCK", "UI"];
  return (
    <section className="py-10 border-y" style={{ backgroundColor: BONE, borderColor: `${INK}1A` }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="h-px w-8" style={{ backgroundColor: `${INK}40` }} />
          <span className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: `${INK}80` }}>
            15+ Partner Institutions
          </span>
          <span className="h-px w-8" style={{ backgroundColor: `${INK}40` }} />
        </div>
        <div className="flex flex-wrap items-center justify-around gap-8">
          {brands.map((b) => (
            <span key={b} className="text-2xl font-bold tracking-tight" style={{ ...display, color: `${INK}40` }}>
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== 4. SERVICES ===================== */
function Services({ basePath }: { basePath: string }) {
  const items = [
    { icon: GraduationCap, title: "Tutorials", desc: "JAMB, WAEC & post-UTME masterclasses by top-scoring tutors.", img: h1 },
    { icon: Code2, title: "Tech Training", desc: "Web development, data and product bootcamps for new careers.", img: h2 },
    { icon: Palette, title: "Creative Design", desc: "Brand identity, social design and visual storytelling.", img: h3 },
    { icon: BookOpen, title: "Consultancy", desc: "Admission guidance and academic counselling that delivers.", img: h4 },
  ];
  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: "#EAE6D8" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div className="max-w-xl">
            <Eyebrow>What We Do</Eyebrow>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight" style={{ ...display, color: INK }}>
              We Solve Real Problems With Education &amp; Technology
            </h2>
          </div>
          <Link
            to={`${basePath}/services`}
            className="inline-flex w-fit items-center gap-3 px-6 py-3 rounded-full font-semibold text-sm"
            style={{ backgroundColor: FOREST, color: CITRUS }}
          >
            See All Services <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(({ icon: Icon, title, desc, img }) => (
            <article
              key={title}
              className="group bg-white rounded-2xl overflow-hidden border transition-transform hover:-translate-y-1"
              style={{ borderColor: `${INK}1A` }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={img} alt={title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div
                  className="absolute top-4 left-4 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: CITRUS, color: INK }}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2" style={{ ...display, color: INK }}>{title}</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: `${INK}99` }}>{desc}</p>
                <Link to={`${basePath}/services`} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: FOREST }}>
                  Read More <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== 5. CTA BANNER ===================== */
function CTABanner({ basePath }: { basePath: string }) {
  return (
    <section className="py-12" style={{ backgroundColor: BONE }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div
          className="rounded-3xl px-8 lg:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ backgroundColor: FOREST, color: BONE }}
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: CITRUS, color: INK }}>
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] opacity-70">Call Us</div>
              <div className="text-lg font-bold" style={display}>+234 801 234 5678</div>
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-center leading-tight" style={display}>
            Stay Ahead With Future-Ready Learning
          </h3>
          <Link
            to={`${basePath}/contact`}
            className="inline-flex items-center gap-3 px-7 py-4 rounded-full font-semibold text-sm whitespace-nowrap"
            style={{ backgroundColor: CITRUS, color: INK }}
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ===================== 6. WORK PROCESS ===================== */
function Process() {
  const steps = [
    { n: "01", title: "Choose a Program", desc: "Pick from tutorials, tech bootcamps or design tracks." },
    { n: "02", title: "Onboard & Plan", desc: "Meet your mentor and set personalised learning goals." },
    { n: "03", title: "Learn by Doing", desc: "Hands-on classes, projects and continuous assessment." },
    { n: "04", title: "Launch Your Future", desc: "Graduate with skills, certificates and real outcomes." },
  ];
  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: BONE }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center mb-14">
        <Eyebrow>How We Work</Eyebrow>
        <h2 className="text-4xl md:text-5xl font-bold" style={{ ...display, color: INK }}>
          Our Standard Learning Process
        </h2>
      </div>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((s, i) => (
          <div key={s.n} className="relative text-center">
            <div
              className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-5 border-2 font-bold text-xl"
              style={{ ...display, borderColor: FOREST, color: FOREST, backgroundColor: BONE }}
            >
              {s.n}
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ ...display, color: INK }}>{s.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: `${INK}99` }}>{s.desc}</p>
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute top-10 -right-3 w-6 h-px" style={{ backgroundColor: `${INK}33` }} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ===================== 7. STATS + PROJECTS (dark) ===================== */
function StatsAndProjects({ basePath }: { basePath: string }) {
  const stats = [
    { icon: Users, num: "6,561+", label: "Active Learners" },
    { icon: Trophy, num: "600+", label: "Success Stories" },
    { icon: GraduationCap, num: "250+", label: "Expert Tutors" },
    { icon: Sparkles, num: "1,001+", label: "Projects Shipped" },
  ];
  const projects = [
    { tag: "Education", title: "JAMB Mastery Program", img: h1 },
    { tag: "Technology", title: "Web Dev Bootcamp", img: portfolio },
    { tag: "Creativity", title: "Brand Design Studio", img: events },
  ];
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden" style={{ backgroundColor: INK }}>
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(${CITRUS} 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-16 mb-16 border-b" style={{ borderColor: `${BONE}1A` }}>
          {stats.map(({ icon: Icon, num, label }) => (
            <div key={label} className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${CITRUS}1A`, color: CITRUS }}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-bold" style={{ ...display, color: BONE }}>{num}</div>
                <div className="text-xs uppercase tracking-widest" style={{ color: `${BONE}80` }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Projects */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <Eyebrow light>Our Programs</Eyebrow>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight" style={{ ...display, color: BONE }}>
              Our Latest Incredible <br /> Learning Experiences
            </h2>
          </div>
          <Link
            to={`${basePath}/portfolio`}
            className="inline-flex w-fit items-center gap-3 px-6 py-3 rounded-full font-semibold text-sm"
            style={{ backgroundColor: CITRUS, color: INK }}
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((p) => (
            <article key={p.title} className="group relative aspect-[4/5] rounded-2xl overflow-hidden">
              <img src={p.img} alt={p.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div
                  className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
                  style={{ backgroundColor: CITRUS, color: INK }}
                >
                  {p.tag}
                </div>
                <h3 className="text-xl font-bold text-white" style={display}>{p.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== 8. MARQUEE ===================== */
function Marquee() {
  const words = ["Education", "Technology", "Creativity", "Mentorship", "Innovation", "Design"];
  return (
    <div className="overflow-hidden py-8 border-y" style={{ backgroundColor: CITRUS, borderColor: INK }}>
      <div className="flex gap-12 animate-[scroll_30s_linear_infinite] whitespace-nowrap">
        {[...words, ...words, ...words].map((w, i) => (
          <span key={i} className="flex items-center gap-12 text-3xl md:text-4xl font-bold" style={{ ...display, color: INK }}>
            {w}
            <Sparkles className="w-6 h-6" />
          </span>
        ))}
      </div>
      <style>{`@keyframes scroll{from{transform:translateX(0)}to{transform:translateX(-33.333%)}}`}</style>
    </div>
  );
}

/* ===================== 9. TEAM ===================== */
function Team() {
  const people = [
    { name: "Lawrence Akboy", role: "Founder / Lead Tutor", img: h1 },
    { name: "Layla Akande", role: "Head of Technology", img: h2 },
    { name: "Daniel Hassan", role: "Creative Director", img: h3 },
    { name: "Sarah Bello", role: "Education Lead", img: h4 },
  ];
  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: BONE }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <Eyebrow>Meet The Team</Eyebrow>
            <h2 className="text-4xl md:text-5xl font-bold" style={{ ...display, color: INK }}>
              Our Dedicated <br /> Faculty Members
            </h2>
          </div>
          <p className="max-w-md text-base" style={{ color: `${INK}99` }}>
            Educators, engineers and creatives uniting to help you build a future you're proud of.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {people.map((p) => (
            <article key={p.name} className="group">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                <div className="absolute inset-x-4 bottom-4 p-3 rounded-xl flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: CITRUS, color: INK }}>
                  <span className="text-xs font-bold uppercase tracking-widest">View</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-lg font-bold" style={{ ...display, color: INK }}>{p.name}</h3>
              <p className="text-sm" style={{ color: `${INK}80` }}>{p.role}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== 10. TESTIMONIALS ===================== */
function Testimonials() {
  const reviews = [
    { name: "Aisha Bello", role: "Medicine, OAU", quote: "AKBOY didn't just teach me — they prepared me. Scored 312 in JAMB and got my dream admission." },
    { name: "Tunde Okafor", role: "Tech Bootcamp Grad", quote: "From zero coding to a junior developer role in 6 months. The mentorship is unreal." },
  ];
  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: "#EAE6D8" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <Eyebrow>Testimonials</Eyebrow>
          <h2 className="text-4xl md:text-5xl font-bold" style={{ ...display, color: INK }}>
            People Who Already Love Us
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {reviews.map((r) => (
            <article key={r.name} className="bg-white rounded-2xl p-8 border" style={{ borderColor: `${INK}1A` }}>
              <Quote className="w-10 h-10 mb-4" style={{ color: FOREST }} />
              <p className="text-lg leading-relaxed mb-6" style={{ color: INK }}>"{r.quote}"</p>
              <div className="flex items-center justify-between border-t pt-5" style={{ borderColor: `${INK}1A` }}>
                <div>
                  <div className="font-bold" style={{ ...display, color: INK }}>{r.name}</div>
                  <div className="text-xs uppercase tracking-widest" style={{ color: `${INK}80` }}>{r.role}</div>
                </div>
                <div className="flex gap-0.5" style={{ color: FOREST }}>
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== 11. BLOG ===================== */
function Blog({ basePath }: { basePath: string }) {
  const posts = [
    { tag: "Education", title: "How to score above 300 in JAMB without burning out", date: "Mar 12, 2026", img: h2 },
    { tag: "Technology", title: "Why every student should learn a programming language", date: "Mar 02, 2026", img: portfolio },
    { tag: "Creativity", title: "Building a portfolio that gets you hired in 2026", date: "Feb 24, 2026", img: events },
  ];
  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: BONE }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <Eyebrow>Our Blog</Eyebrow>
            <h2 className="text-4xl md:text-5xl font-bold" style={{ ...display, color: INK }}>
              Latest News &amp; Articles
            </h2>
          </div>
          <Link
            to={`${basePath}/blog`}
            className="inline-flex w-fit items-center gap-3 px-6 py-3 rounded-full font-semibold text-sm"
            style={{ backgroundColor: FOREST, color: CITRUS }}
          >
            All Articles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((p) => (
            <article key={p.title} className="group bg-white rounded-2xl overflow-hidden border" style={{ borderColor: `${INK}1A` }}>
              <div className="aspect-[4/3] overflow-hidden">
                <img src={p.img} alt={p.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3 text-xs" style={{ color: `${INK}80` }}>
                  <span className="font-bold uppercase tracking-widest" style={{ color: FOREST }}>{p.tag}</span>
                  <span className="w-1 h-1 rounded-full" style={{ backgroundColor: `${INK}40` }} />
                  <span className="inline-flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {p.date}</span>
                </div>
                <h3 className="text-lg font-bold mb-4 leading-snug" style={{ ...display, color: INK }}>{p.title}</h3>
                <Link to={`${basePath}/blog`} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: FOREST }}>
                  Read More <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== PAGE ===================== */
export default function AkboyHome() {
  const { isAkboyDomain: isAkboy } = useDomainDetection();
  const basePath = isAkboy ? "" : "/akboy";

  return (
    <AkboyLayout>
      <main style={{ backgroundColor: BONE, color: INK, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <Hero basePath={basePath} />
        <About basePath={basePath} />
        <Brands />
        <Services basePath={basePath} />
        <CTABanner basePath={basePath} />
        <Process />
        <StatsAndProjects basePath={basePath} />
        <Marquee />
        <Team />
        <Testimonials />
        <Blog basePath={basePath} />
      </main>
    </AkboyLayout>
  );
}
