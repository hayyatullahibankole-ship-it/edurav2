import { Link } from "react-router-dom";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import {
  ArrowRight, ArrowUpRight, GraduationCap, Palette, Code, BookOpen,
  Megaphone, Heart, Star, Quote, Trophy, Users, Briefcase,
} from "lucide-react";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import hero1 from "@/assets/akboy-hero-1.jpg";
import hero2 from "@/assets/akboy-hero-2.jpg";
import hero3 from "@/assets/akboy-hero-3.jpg";
import hero4 from "@/assets/akboy-hero-4.jpg";

/* ============================================================
   AKBOY — Structured Magazine
   Palette: bone #F2EFE6 · ink #0B2A1F · forest #234B36 · citrus #D7F26A
   Type: Space Grotesk (display) · DM Sans (body)
   Clear hierarchy · consistent 24px/96px rhythm · hairline rules
   ============================================================ */

const BONE = "#F2EFE6";
const INK = "#0B2A1F";
const FOREST = "#234B36";
const CITRUS = "#D7F26A";

const display = { fontFamily: "'Space Grotesk', system-ui, sans-serif" };
const body = { fontFamily: "'DM Sans', system-ui, sans-serif" };

const Eyebrow = ({ children, light }: { children: React.ReactNode; light?: boolean }) => (
  <span
    className="inline-block text-[11px] font-bold uppercase tracking-[0.28em]"
    style={{ color: light ? CITRUS : FOREST }}
  >
    {children}
  </span>
);

const SectionHead = ({
  eyebrow, title, lede, light,
}: { eyebrow: string; title: string; lede?: string; light?: boolean }) => (
  <div className="grid md:grid-cols-12 gap-8 md:gap-10 items-end mb-12 md:mb-16">
    <div className="md:col-span-7">
      <Eyebrow light={light}>{eyebrow}</Eyebrow>
      <h2
        className="mt-4 text-4xl md:text-6xl font-bold leading-[0.95] tracking-tight"
        style={{ ...display, color: light ? BONE : INK }}
      >
        {title}
      </h2>
    </div>
    {lede && (
      <div className="md:col-span-5 md:pb-3">
        <p className="text-lg leading-relaxed" style={{ color: light ? `${BONE}B3` : `${INK}B3` }}>
          {lede}
        </p>
      </div>
    )}
  </div>
);

/* ===================== HERO ===================== */
function Hero({ basePath }: { basePath: string }) {
  return (
    <header className="border-b" style={{ borderColor: INK }}>
      <div className="grid lg:grid-cols-12 min-h-[78vh]">
        {/* Copy */}
        <div
          className="lg:col-span-7 px-6 lg:px-16 py-16 lg:py-24 flex flex-col justify-center lg:border-r"
          style={{ borderColor: INK }}
        >
          <span
            className="inline-flex w-fit items-center px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] mb-8"
            style={{ backgroundColor: CITRUS, color: INK }}
          >
            Next Intake · March 2026
          </span>
          <h1
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold leading-[0.92] tracking-tight mb-8"
            style={{ ...display, color: INK }}
          >
            Grow your future<br />
            with <span className="italic" style={{ color: FOREST }}>smart</span><br />
            creative solutions.
          </h1>
          <p className="text-lg md:text-xl max-w-xl mb-10 leading-relaxed" style={{ color: `${INK}CC` }}>
            AKBOY Creative Hub blends admission consultancy, tutorials, design and digital training
            into one premium ecosystem for students, schools and brands.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to={`${basePath}/services`}
              className="inline-flex items-center gap-3 px-8 py-4 font-bold uppercase tracking-[0.18em] text-sm"
              style={{ backgroundColor: FOREST, color: CITRUS }}
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={`${basePath}/contact`}
              className="inline-flex items-center px-8 py-4 font-bold uppercase tracking-[0.18em] text-sm border transition-colors hover:bg-[#0B2A1F] hover:text-[#F2EFE6]"
              style={{ borderColor: INK, color: INK }}
            >
              Explore
            </Link>
          </div>

          {/* Trust row */}
          <div className="flex items-center gap-5 mt-10 pt-8 border-t" style={{ borderColor: `${INK}1A` }}>
            <div className="flex -space-x-2.5">
              {[hero1, hero2, hero3, hero4].map((src, i) => (
                <img key={i} src={src} alt="" className="w-10 h-10 rounded-full border-2 object-cover" style={{ borderColor: BONE }} />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5" style={{ color: FOREST }}>
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                <span className="ml-2 text-xs font-bold" style={{ color: INK }}>4.9</span>
              </div>
              <div className="text-xs mt-0.5" style={{ color: `${INK}80` }}>
                1,200+ students &amp; brands trust us
              </div>
            </div>
          </div>
        </div>

        {/* Featured stat panel */}
        <div className="lg:col-span-5 relative overflow-hidden min-h-[360px] lg:min-h-full" style={{ backgroundColor: FOREST }}>
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `linear-gradient(${CITRUS} 1px, transparent 1px), linear-gradient(90deg, ${CITRUS} 1px, transparent 1px)`,
              backgroundSize: "48px 48px",
            }}
          />
          <div className="relative h-full flex flex-col justify-between p-10 lg:p-14">
            <div className="flex items-start justify-between">
              <Eyebrow light><span>// Featured Outcome</span></Eyebrow>
              <GraduationCap className="h-6 w-6" style={{ color: CITRUS }} />
            </div>
            <div>
              <div
                className="text-[6rem] md:text-[8rem] font-bold leading-none tracking-tighter"
                style={{ ...display, color: CITRUS }}
              >
                98%
              </div>
              <div className="mt-4 pl-5 border-l-2" style={{ borderColor: CITRUS, color: BONE }}>
                <p className="text-2xl font-bold" style={display}>Admission Success</p>
                <p className="text-sm opacity-70 mt-1">Students placed in UNILAG, UI &amp; LASU through our consultancy.</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-px pt-px" style={{ backgroundColor: `${CITRUS}33` }}>
              {[
                { v: "1,200+", l: "Students" },
                { v: "300+", l: "Brands" },
                { v: "8+", l: "Years" },
              ].map((s) => (
                <div key={s.l} className="px-3 py-5 text-center" style={{ backgroundColor: FOREST, color: BONE }}>
                  <div className="text-xl font-bold" style={display}>{s.v}</div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ===================== TRUSTED LOGOS ===================== */
function TrustedBy() {
  const items = ["UI", "OAU", "LASU", "JAMB", "WAEC", "NECO", "Covenant", "UNILAG"];
  return (
    <section className="px-6 lg:px-10 py-10 border-b" style={{ borderColor: INK }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-10">
        <span className="text-[10px] font-bold uppercase tracking-[0.28em] whitespace-nowrap" style={{ color: `${INK}80` }}>
          Trusted By Students Placed At
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: `${INK}1A` }} />
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {items.map((x) => (
            <span key={x} className="text-lg font-bold tracking-tight opacity-60 hover:opacity-100 transition-opacity" style={display}>
              {x}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== ECOSYSTEM (6 disciplines) ===================== */
function Ecosystem({ basePath }: { basePath: string }) {
  const items = [
    { icon: <GraduationCap className="h-7 w-7" />, n: "01", tag: "Education", title: "Admission Consultancy", desc: "Strategic university placement guidance — UNILAG, UI, LASU, overseas." },
    { icon: <BookOpen className="h-7 w-7" />, n: "02", tag: "Learning", title: "Tutorial Services", desc: "JAMB · WAEC · Post-UTME live and on-demand classes.", dark: true },
    { icon: <Palette className="h-7 w-7" />, n: "03", tag: "Creative", title: "Graphics Design", desc: "Brand identity, social, packaging and print collateral." },
    { icon: <Code className="h-7 w-7" />, n: "04", tag: "Digital", title: "Web & App Design", desc: "Modern, conversion-ready websites and product apps." },
    { icon: <Megaphone className="h-7 w-7" />, n: "05", tag: "Bootcamp", title: "Digital Skills Training", desc: "Bootcamps in design, no-code, marketing and AI." },
    { icon: <Heart className="h-7 w-7" />, n: "06", tag: "Spiritual", title: "Quran & Tajweed", desc: "Personalised recitation classes with expert tutors." },
  ];
  return (
    <section className="px-6 lg:px-10 py-24 border-b" style={{ borderColor: INK }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12 md:mb-16 gap-6">
          <div>
            <Eyebrow>Our Ecosystem</Eyebrow>
            <h2 className="mt-4 text-4xl md:text-6xl font-bold leading-[0.95] tracking-tight" style={{ ...display, color: INK }}>
              Six disciplines.<br />
              <span className="italic" style={{ color: FOREST }}>One creative hub.</span>
            </h2>
          </div>
          <Link
            to={`${basePath}/services`}
            className="hidden md:inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] hover:opacity-60 transition-opacity"
            style={{ color: INK }}
          >
            View All Services <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px border" style={{ backgroundColor: INK, borderColor: INK }}>
          {items.map((f) => {
            const dark = f.dark;
            return (
              <Link
                key={f.n}
                to={`${basePath}/services`}
                className="p-8 lg:p-10 flex flex-col min-h-[260px] transition-colors group"
                style={{ backgroundColor: dark ? FOREST : BONE, color: dark ? BONE : INK }}
              >
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: dark ? CITRUS : `${INK}80` }}>
                    {f.n} · {f.tag}
                  </span>
                  <div style={{ color: dark ? CITRUS : FOREST }}>{f.icon}</div>
                </div>
                <h4
                  className="text-xl font-bold mb-3 uppercase tracking-tight leading-tight"
                  style={{ ...display, color: dark ? CITRUS : INK }}
                >
                  {f.title}
                </h4>
                <p className="text-sm leading-relaxed flex-1" style={{ color: dark ? `${BONE}CC` : `${INK}B3` }}>
                  {f.desc}
                </p>
                <span
                  className="mt-6 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: dark ? CITRUS : FOREST }}
                >
                  Learn more <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ===================== BENTO (Why AKBOY) ===================== */
function Bento({ basePath }: { basePath: string }) {
  return (
    <section className="px-6 lg:px-10 py-24 border-b" style={{ borderColor: INK }}>
      <div className="max-w-7xl mx-auto">
        <SectionHead
          eyebrow="Why Akboy"
          title="Built on outcomes, not promises."
          lede="Every program is anchored in measurable results — score gains, admissions secured, brands launched."
        />

        {/* Top row: testimonial + project + impact */}
        <div className="grid md:grid-cols-12 gap-px border mb-px" style={{ backgroundColor: INK, borderColor: INK }}>
          {/* Testimonial */}
          <article className="md:col-span-5 p-10 lg:p-12" style={{ backgroundColor: BONE }}>
            <Quote className="h-8 w-8 mb-6" style={{ color: FOREST }} />
            <p className="text-xl md:text-2xl leading-snug font-medium mb-8" style={{ ...display, color: INK }}>
              "AKBOY didn't just prep me for JAMB — they reshaped how I study. Scored 312 and got into UNILAG Medicine."
            </p>
            <div className="flex items-center gap-3 pt-6 border-t" style={{ borderColor: `${INK}1A` }}>
              <img src={hero1} alt="" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <div className="text-sm font-bold" style={{ color: INK }}>Aisha Bello</div>
                <div className="text-xs" style={{ color: `${INK}80` }}>UNILAG Medical Student</div>
              </div>
            </div>
          </article>

          {/* Project image */}
          <article
            className="md:col-span-4 relative overflow-hidden min-h-[360px]"
            style={{ backgroundColor: FOREST, backgroundImage: `url(${hero2})`, backgroundSize: "cover", backgroundPosition: "center" }}
          >
            <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 40%, ${INK}E6 100%)` }} />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <Eyebrow light>Spotlight</Eyebrow>
              <h3 className="mt-2 text-2xl font-bold leading-tight" style={{ ...display, color: BONE }}>
                Featured Project:<br />Greenwood Brand Identity
              </h3>
              <Link
                to={`${basePath}/portfolio`}
                className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em]"
                style={{ color: CITRUS }}
              >
                View portfolio <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>

          {/* Impact panel */}
          <article className="md:col-span-3 p-10 lg:p-12" style={{ backgroundColor: INK, color: BONE }}>
            <Eyebrow light>Live Impact</Eyebrow>
            <div className="mt-6 space-y-5">
              {[
                { l: "JAMB Top Score", v: "342" },
                { l: "Projects Shipped", v: "+27" },
                { l: "Active Cohorts", v: "12" },
              ].map((s) => (
                <div key={s.l} className="flex items-end justify-between pb-3 border-b" style={{ borderColor: `${BONE}1A` }}>
                  <span className="text-xs uppercase tracking-[0.18em]" style={{ color: `${BONE}99` }}>{s.l}</span>
                  <span className="text-2xl font-bold" style={{ ...display, color: CITRUS }}>{s.v}</span>
                </div>
              ))}
            </div>
            <Link
              to={`${basePath}/about`}
              className="mt-8 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em]"
              style={{ color: CITRUS }}
            >
              Our story <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </article>
        </div>

        {/* Achievement strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px border" style={{ backgroundColor: INK, borderColor: INK }}>
          {[
            { icon: <Trophy className="h-5 w-5" />, t: "Fast Track", d: "8-week intensive bootcamps" },
            { icon: <Briefcase className="h-5 w-5" />, t: "Full Stack", d: "Education + Creative + Digital" },
            { icon: <Users className="h-5 w-5" />, t: "Global Reach", d: "Local roots, international standards" },
            { icon: <Heart className="h-5 w-5" />, t: "1-on-1 Care", d: "Personalised mentor support" },
          ].map((a) => (
            <div key={a.t} className="p-6 lg:p-8" style={{ backgroundColor: BONE }}>
              <div style={{ color: FOREST }}>{a.icon}</div>
              <div className="mt-4 text-sm font-bold uppercase tracking-tight" style={{ ...display, color: INK }}>{a.t}</div>
              <div className="mt-1 text-xs" style={{ color: `${INK}80` }}>{a.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== PROGRAMS ===================== */
function Programs({ basePath }: { basePath: string }) {
  const tiers = [
    {
      tag: "Starter", title: "JAMB & Post-UTME Prep", subtitle: "Free intro class",
      items: ["Live tutorials", "Past questions bank", "Weekly mocks"], popular: false,
    },
    {
      tag: "Most Popular", title: "Creative Bootcamp", subtitle: "8-week intensive",
      items: ["Design fundamentals", "Live client briefs", "Portfolio build"], popular: true,
    },
    {
      tag: "Premium", title: "Admission Consultancy", subtitle: "1-on-1 placement",
      items: ["University matching", "Application support", "Interview prep"], popular: false,
    },
  ];
  return (
    <section className="px-6 lg:px-10 py-24 border-b" style={{ borderColor: INK }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <Eyebrow>Featured Programs</Eyebrow>
          <h2 className="mt-4 text-4xl md:text-6xl font-bold leading-[0.95] tracking-tight" style={{ ...display, color: INK }}>
            Programs that change<br />
            <span className="italic" style={{ color: FOREST }}>trajectories.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-px border" style={{ backgroundColor: INK, borderColor: INK }}>
          {tiers.map((t) => {
            const pop = t.popular;
            return (
              <article
                key={t.title}
                className="p-10 lg:p-12 flex flex-col"
                style={{
                  backgroundColor: pop ? FOREST : BONE,
                  color: pop ? BONE : INK,
                }}
              >
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.24em] mb-6"
                  style={{ color: pop ? CITRUS : `${INK}80` }}
                >
                  {t.tag}
                </span>
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-2" style={{ ...display, color: pop ? CITRUS : INK }}>
                  {t.title}
                </h3>
                <p className="text-sm mb-8" style={{ color: pop ? `${BONE}B3` : `${INK}80` }}>{t.subtitle}</p>
                <ul className="space-y-3 mb-10 text-sm flex-1">
                  {t.items.map((x) => (
                    <li key={x} className="flex items-center gap-3 font-medium">
                      <span className="text-base" style={{ color: pop ? CITRUS : FOREST }}>/</span>
                      <span style={{ color: pop ? BONE : `${INK}CC` }}>{x}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={`${basePath}/register`}
                  className="w-full py-4 text-center font-bold uppercase tracking-[0.18em] text-xs transition-colors"
                  style={
                    pop
                      ? { backgroundColor: CITRUS, color: INK }
                      : { border: `1px solid ${INK}`, color: INK }
                  }
                >
                  Enroll Now →
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ===================== INSIGHTS ===================== */
function Insights({ basePath }: { basePath: string }) {
  const posts = [
    { tag: "JAMB", title: "How to score 300+ in JAMB: a tactical playbook", img: hero1 },
    { tag: "Design", title: "From zero to client work in 8 weeks", img: hero2 },
    { tag: "Admission", title: "Choosing the right university course in 2026", img: hero3 },
  ];
  return (
    <section className="px-6 lg:px-10 py-24 border-b" style={{ borderColor: INK }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12 md:mb-16 gap-6">
          <div>
            <Eyebrow>Resources &amp; Insights</Eyebrow>
            <h2 className="mt-4 text-4xl md:text-6xl font-bold leading-[0.95] tracking-tight" style={{ ...display, color: INK }}>
              Smart tips for a<br />
              <span className="italic" style={{ color: FOREST }}>stronger future.</span>
            </h2>
          </div>
          <Link
            to={`${basePath}/campus-hub`}
            className="hidden md:inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] hover:opacity-60 transition-opacity"
            style={{ color: INK }}
          >
            View All <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-px border" style={{ backgroundColor: INK, borderColor: INK }}>
          {posts.map((p) => (
            <Link
              key={p.title}
              to={`${basePath}/campus-hub`}
              className="group flex flex-col"
              style={{ backgroundColor: BONE }}
            >
              <div
                className="aspect-[4/3] w-full overflow-hidden"
                style={{ backgroundImage: `url(${p.img})`, backgroundSize: "cover", backgroundPosition: "center" }}
              />
              <div className="p-8">
                <span className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: FOREST }}>{p.tag}</span>
                <h3 className="mt-3 text-xl font-bold tracking-tight leading-tight" style={{ ...display, color: INK }}>
                  {p.title}
                </h3>
                <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: FOREST }}>
                  Read article <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== CTA ===================== */
function CTA({ basePath }: { basePath: string }) {
  return (
    <section className="px-6 lg:px-10 py-28" style={{ backgroundColor: INK, color: BONE }}>
      <div className="max-w-5xl mx-auto grid lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-7">
          <Eyebrow light>Begin With AKBOY</Eyebrow>
          <h2
            className="mt-5 text-5xl md:text-7xl font-bold tracking-tight leading-[0.95]"
            style={display}
          >
            Ready to learn,<br />
            <span className="italic" style={{ color: CITRUS }}>create or grow?</span>
          </h2>
          <p className="mt-6 text-lg max-w-xl" style={{ color: `${BONE}B3` }}>
            Book a free consultation. We'll map a plan tailored to where you are and where you're going.
          </p>
        </div>
        <div className="lg:col-span-5 flex flex-col gap-3">
          <Link
            to={`${basePath}/contact`}
            className="block w-full py-5 text-center font-bold uppercase tracking-[0.18em] text-sm"
            style={{ backgroundColor: CITRUS, color: INK }}
          >
            Book Free Consultation
          </Link>
          <a
            href="https://wa.me/2348101466977"
            target="_blank" rel="noopener noreferrer"
            className="block w-full py-5 text-center font-bold uppercase tracking-[0.18em] text-sm border transition-colors hover:bg-[#234B36]"
            style={{ borderColor: `${BONE}33`, color: BONE }}
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

/* ===================== PAGE ===================== */
export default function AkboyHome() {
  const { isAkboy } = useDomainDetection();
  const basePath = isAkboy ? "" : "/akboy";

  return (
    <AkboyLayout
      title="AKBOY Creative Hub — Grow Your Future With Smart Creative Solutions"
      description="AKBOY Creative Hub blends tutorials, admission consultancy, design and digital training into one premium ecosystem for students, schools and brands."
    >
      <div
        className="min-h-screen w-full overflow-x-hidden selection:bg-[#D7F26A] selection:text-[#0B2A1F]"
        style={{ ...body, backgroundColor: BONE, color: INK }}
      >
        <Hero basePath={basePath} />
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
