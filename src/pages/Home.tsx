import { Link } from "react-router-dom";
import {
  BookOpen, Clock, Target, Users, Trophy, FileText, Video, MessageCircle,
  ArrowRight, ArrowUpRight, CheckCircle, LogIn, BarChart3, GraduationCap,
} from "lucide-react";
import Footer from "@/components/Footer";
import ScheduleTestModal from "@/components/ScheduleTestModal";
import { useAuth } from "@/hooks/useAuth";
import { useInstalledApp } from "@/hooks/useInstalledApp";
import { useIsMobile } from "@/hooks/use-mobile";

/* ============================================================
   EDURA — Structured Magazine
   Palette: bone #F2EFE6 · ink #0B2A1F · forest #234B36 · citrus #D7F26A
   Type: Space Grotesk (display) · DM Sans (body)
   ============================================================ */

const BONE = "#F2EFE6";
const INK = "#0B2A1F";
const FOREST = "#234B36";
const CITRUS = "#D7F26A";

const display = { fontFamily: "'Space Grotesk', system-ui, sans-serif" };
const body = { fontFamily: "'DM Sans', system-ui, sans-serif" };

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block text-[11px] font-bold uppercase tracking-[0.28em]" style={{ color: FOREST }}>
    {children}
  </span>
);

const SectionHead = ({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) => (
  <div className="grid md:grid-cols-12 gap-8 md:gap-10 items-end mb-12 md:mb-16">
    <div className="md:col-span-7">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-4xl md:text-6xl font-bold leading-[0.95] tracking-tight" style={{ ...display, color: INK }}>
        {title}
      </h2>
    </div>
    {lede && (
      <div className="md:col-span-5 md:pb-3">
        <p className="text-lg leading-relaxed" style={{ color: `${INK}B3` }}>{lede}</p>
      </div>
    )}
  </div>
);

const Home = () => {
  const { user } = useAuth();
  const { isInstalledApp } = useInstalledApp();
  const isMobile = useIsMobile();
  const isMobileWeb = isMobile && !isInstalledApp;

  const startJambHref = isMobileWeb ? "/auth" : user ? null : "/auth";

  const features = [
    { n: "01", icon: <Target className="h-7 w-7" />, title: "WAEC & JAMB Banks", desc: "Comprehensive question banks across every science and arts subject, updated each session." },
    { n: "02", icon: <Clock className="h-7 w-7" />, title: "Timed Simulations", desc: "Real exam timing and interface — build the stamina that wins on the actual paper.", dark: true },
    { n: "03", icon: <BarChart3 className="h-7 w-7" />, title: "Performance Analytics", desc: "Granular charts and recommendations that point straight to your weakest topics." },
    { n: "04", icon: <Users className="h-7 w-7" />, title: "Expert Consultation", desc: "Book 1-on-1 sessions with experienced tutors and mentors when you hit a wall." },
    { n: "05", icon: <FileText className="h-7 w-7" />, title: "Study Resources", desc: "Past questions, study guides, and structured notes curated by subject experts." },
    { n: "06", icon: <Video className="h-7 w-7" />, title: "Video Tutorials", desc: "Visual breakdowns of difficult topics from expert-created video lessons." },
  ];

  const subjects = [
    "English Language", "Mathematics", "Physics", "Chemistry", "Biology",
    "Geography", "Economics", "Government", "Literature", "History",
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden selection:bg-[#D7F26A] selection:text-[#0B2A1F]"
      style={{ ...body, backgroundColor: BONE, color: INK }}>

      {/* ============== NAV ============== */}
      <nav className="border-b px-6 lg:px-10 py-5 flex items-center justify-between" style={{ borderColor: `${INK}1A` }}>
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-sm flex items-center justify-center" style={{ backgroundColor: FOREST }}>
            <span className="text-xl font-bold" style={{ ...display, color: CITRUS }}>E</span>
          </div>
          <span className="text-xl font-bold tracking-tight" style={display}>edura</span>
        </Link>
        <div className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-[0.18em]">
          <Link to="/demo" className="hover:opacity-60 transition-opacity">Practice Tests</Link>
          <Link to="/resources" className="hover:opacity-60 transition-opacity">Resources</Link>
          <Link to="/consultation" className="hover:opacity-60 transition-opacity">Consultation</Link>
          <Link to="/payment" className="hover:opacity-60 transition-opacity">Pricing</Link>
        </div>
        <Link to={user ? "/dashboard" : "/auth"}
          className="px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] transition-colors"
          style={{ backgroundColor: INK, color: BONE }}>
          {user ? "Dashboard" : "Get Started"}
        </Link>
      </nav>

      {/* ============== HERO ============== */}
      <header className="border-b" style={{ borderColor: INK }}>
        <div className="grid lg:grid-cols-12 min-h-[78vh]">
          {/* Copy column */}
          <div className="lg:col-span-7 px-6 lg:px-16 py-16 lg:py-24 flex flex-col justify-center lg:border-r"
            style={{ borderColor: INK }}>
            <span className="inline-flex w-fit items-center px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] mb-8"
              style={{ backgroundColor: CITRUS, color: INK }}>
              Trusted by 50,000+ Students Nationwide
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold leading-[0.92] tracking-tight mb-8"
              style={{ ...display, color: INK }}>
              Master WAEC<br />
              & JAMB with<br />
              <span className="italic" style={{ color: FOREST }}>Smart</span> CBT.
            </h1>
            <p className="text-lg md:text-xl max-w-xl mb-10 leading-relaxed" style={{ color: `${INK}CC` }}>
              Access thousands of practice questions, detailed analytics, and expert guidance — engineered for the Nigerian student.
            </p>
            <div className="flex flex-wrap gap-3">
              {user && !isMobileWeb ? (
                <ScheduleTestModal defaultExamType="jamb">
                  <button className="inline-flex items-center gap-3 px-8 py-4 font-bold uppercase tracking-[0.18em] text-sm"
                    style={{ backgroundColor: FOREST, color: CITRUS }}>
                    Start JAMB Practice <ArrowRight className="h-4 w-4" />
                  </button>
                </ScheduleTestModal>
              ) : (
                <Link to={startJambHref || "/auth"}
                  className="inline-flex items-center gap-3 px-8 py-4 font-bold uppercase tracking-[0.18em] text-sm"
                  style={{ backgroundColor: FOREST, color: CITRUS }}>
                  Start JAMB Practice <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <Link to="/demo"
                className="inline-flex items-center px-8 py-4 font-bold uppercase tracking-[0.18em] text-sm border transition-colors hover:bg-[#0B2A1F] hover:text-[#F2EFE6]"
                style={{ borderColor: INK, color: INK }}>
                View Demo
              </Link>
            </div>
            <Link to="/school-landing"
              className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] hover:opacity-60 transition-opacity w-fit"
              style={{ color: FOREST }}>
              <Users className="h-4 w-4" /> Register as a School <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Feature column */}
          <div className="lg:col-span-5 relative overflow-hidden min-h-[320px] lg:min-h-full"
            style={{ backgroundColor: FOREST }}>
            <div className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: `linear-gradient(${CITRUS} 1px, transparent 1px), linear-gradient(90deg, ${CITRUS} 1px, transparent 1px)`,
                backgroundSize: "48px 48px",
              }} />
            <div className="relative h-full flex flex-col justify-between p-10 lg:p-14">
              <div className="flex items-start justify-between">
                <Eyebrow><span style={{ color: CITRUS }}>// Featured Stat</span></Eyebrow>
                <GraduationCap className="h-6 w-6" style={{ color: CITRUS }} />
              </div>
              <div>
                <div className="text-[6rem] md:text-[8rem] font-bold leading-none tracking-tighter" style={{ ...display, color: CITRUS }}>
                  98%
                </div>
                <div className="mt-4 pl-5 border-l-2" style={{ borderColor: CITRUS, color: BONE }}>
                  <p className="text-2xl font-bold" style={display}>Pass Rate</p>
                  <p className="text-sm opacity-70 mt-1">Among students who completed our 6-week JAMB program.</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-px pt-px" style={{ backgroundColor: `${CITRUS}33` }}>
                {[
                  { v: "180", l: "Questions" },
                  { v: "120m", l: "Timer" },
                  { v: "10+", l: "Subjects" },
                ].map((s) => (
                  <div key={s.l} className="px-4 py-5 text-center" style={{ backgroundColor: FOREST, color: BONE }}>
                    <div className="text-2xl font-bold" style={display}>{s.v}</div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ============== EXAM PICKER ============== */}
      <section className="px-6 lg:px-10 py-24 border-b" style={{ borderColor: INK }}>
        <div className="max-w-7xl mx-auto">
          <SectionHead
            eyebrow="Choose Pathway"
            title="Your Exam Practice"
            lede="Practice with authentic JAMB and WAEC conditions, official question counts, and precise timing."
          />
          <div className="grid md:grid-cols-2 gap-px border" style={{ backgroundColor: INK, borderColor: INK }}>
            {/* JAMB */}
            <article className="p-10 lg:p-14 group transition-colors" style={{ backgroundColor: BONE }}>
              <div className="flex items-start justify-between mb-10">
                <div className="w-14 h-14 rounded-full border flex items-center justify-center transition-colors group-hover:bg-[#0B2A1F] group-hover:text-[#F2EFE6]"
                  style={{ borderColor: INK }}>
                  <Target className="h-6 w-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: `${INK}80` }}>Paper A</span>
              </div>
              <h3 className="text-4xl font-bold mb-4 tracking-tight" style={display}>JAMB Practice</h3>
              <p className="mb-10 leading-relaxed text-base" style={{ color: `${INK}B3` }}>
                Subject-based practice with 180 questions (English + 3 subjects) in 120 minutes — official JAMB format.
              </p>
              <ul className="space-y-3 mb-12 text-sm">
                {["120 minutes duration", "180 questions total", "Score out of 400"].map((x) => (
                  <li key={x} className="flex items-center gap-3 font-medium" style={{ color: `${INK}CC` }}>
                    <span className="text-base" style={{ color: FOREST }}>/</span> {x}
                  </li>
                ))}
              </ul>
              {user && !isMobileWeb ? (
                <ScheduleTestModal defaultExamType="jamb">
                  <button className="w-full py-4 border font-bold uppercase tracking-[0.18em] text-xs transition-colors hover:bg-[#0B2A1F] hover:text-[#F2EFE6]"
                    style={{ borderColor: INK }}>
                    Start JAMB
                  </button>
                </ScheduleTestModal>
              ) : (
                <Link to="/auth"
                  className="block w-full py-4 border text-center font-bold uppercase tracking-[0.18em] text-xs transition-colors hover:bg-[#0B2A1F] hover:text-[#F2EFE6]"
                  style={{ borderColor: INK }}>
                  Start JAMB
                </Link>
              )}
            </article>

            {/* WAEC */}
            <article className="p-10 lg:p-14 group transition-colors" style={{ backgroundColor: BONE }}>
              <div className="flex items-start justify-between mb-10">
                <div className="w-14 h-14 rounded-full border flex items-center justify-center transition-colors group-hover:bg-[#0B2A1F] group-hover:text-[#F2EFE6]"
                  style={{ borderColor: INK }}>
                  <BookOpen className="h-6 w-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: `${INK}80` }}>Paper B</span>
              </div>
              <h3 className="text-4xl font-bold mb-4 tracking-tight" style={display}>WAEC Practice</h3>
              <p className="mb-10 leading-relaxed text-base" style={{ color: `${INK}B3` }}>
                Subject-based practice with 50–60 questions per paper — authentic WAEC experience.
              </p>
              <ul className="space-y-3 mb-12 text-sm">
                {["Subject-specific timing", "50–60 questions per paper", "A1–F9 grading system"].map((x) => (
                  <li key={x} className="flex items-center gap-3 font-medium" style={{ color: `${INK}CC` }}>
                    <span className="text-base" style={{ color: FOREST }}>/</span> {x}
                  </li>
                ))}
              </ul>
              {user && !isMobileWeb ? (
                <ScheduleTestModal defaultExamType="waec">
                  <button className="w-full py-4 border font-bold uppercase tracking-[0.18em] text-xs transition-colors hover:bg-[#0B2A1F] hover:text-[#F2EFE6]"
                    style={{ borderColor: INK }}>
                    Start WAEC
                  </button>
                </ScheduleTestModal>
              ) : (
                <Link to="/auth"
                  className="block w-full py-4 border text-center font-bold uppercase tracking-[0.18em] text-xs transition-colors hover:bg-[#0B2A1F] hover:text-[#F2EFE6]"
                  style={{ borderColor: INK }}>
                  Start WAEC
                </Link>
              )}
            </article>
          </div>
        </div>
      </section>

      {/* ============== FEATURES ============== */}
      <section className="px-6 lg:px-10 py-24 border-b" style={{ borderColor: INK }}>
        <div className="max-w-7xl mx-auto">
          <SectionHead
            eyebrow="The Toolkit"
            title="Everything You Need to Excel"
            lede="Engineered specifically for the Nigerian academic landscape — high-stakes simulation paired with deep educational insight."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px border" style={{ backgroundColor: INK, borderColor: INK }}>
            {features.map((f) => {
              const dark = f.dark;
              return (
                <div key={f.n}
                  className="p-8 lg:p-10 flex flex-col min-h-[260px] transition-colors"
                  style={{
                    backgroundColor: dark ? FOREST : BONE,
                    color: dark ? BONE : INK,
                  }}>
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-[11px] font-bold uppercase tracking-[0.24em]"
                      style={{ color: dark ? CITRUS : `${INK}80` }}>{f.n}</span>
                    <div style={{ color: dark ? CITRUS : FOREST }}>{f.icon}</div>
                  </div>
                  <h4 className="text-xl font-bold mb-3 uppercase tracking-tight leading-tight"
                    style={{ ...display, color: dark ? CITRUS : INK }}>
                    {f.title}
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: dark ? `${BONE}CC` : `${INK}B3` }}>
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============== SUBJECTS ============== */}
      <section className="px-6 lg:px-10 py-24 border-b" style={{ borderColor: INK }}>
        <div className="max-w-7xl mx-auto">
          <div className="border-l-[3px] pl-6 mb-12" style={{ borderColor: FOREST }}>
            <Eyebrow>Subject Spectrum</Eyebrow>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight" style={display}>
              Practice All WAEC &amp; JAMB Subjects
            </h2>
            <p className="mt-3 text-base" style={{ color: `${INK}B3` }}>
              Complete coverage with up-to-date question banks.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {subjects.map((s) => (
              <span key={s}
                className="px-5 py-3 border text-sm font-bold uppercase tracking-tight transition-colors cursor-default hover:bg-[#D7F26A]"
                style={{ borderColor: INK, color: INK }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============== WHY EDURA + STATS ============== */}
      <section className="px-6 lg:px-10 py-24 border-b" style={{ backgroundColor: INK, color: BONE, borderColor: INK }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          <div className="lg:col-span-6">
            <Eyebrow><span style={{ color: CITRUS }}>Why Edura</span></Eyebrow>
            <h2 className="mt-4 text-4xl md:text-6xl font-bold leading-[0.95] tracking-tight" style={display}>
              Built for students who refuse to guess.
            </h2>
            <div className="mt-10 space-y-6">
              {[
                "Unrivaled accuracy in JAMB exam pattern matching — we model the cognitive load of the real paper, not just the questions.",
                "Over 50,000 students have used our analytics to convert weak subjects into core strengths within weeks.",
                "Expert consultation and mentorship booking, on your schedule.",
              ].map((t, i) => (
                <div key={i} className="flex gap-5 border-b pb-6" style={{ borderColor: `${BONE}1A` }}>
                  <div className="w-1 flex-shrink-0" style={{ backgroundColor: CITRUS }} />
                  <p className="text-base lg:text-lg leading-relaxed" style={{ color: `${BONE}CC` }}>{t}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-6 grid grid-cols-2 gap-px" style={{ backgroundColor: `${BONE}1A` }}>
            {[
              { v: "92%", l: "Avg. Score Improvement" },
              { v: "50k+", l: "Registered Students" },
              { v: "98%", l: "Success Rate" },
              { v: "24/7", l: "Portal Access" },
            ].map((s) => (
              <div key={s.l} className="p-10 lg:p-12 text-center" style={{ backgroundColor: FOREST }}>
                <div className="text-5xl lg:text-6xl font-bold mb-3" style={{ ...display, color: CITRUS }}>{s.v}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: `${BONE}99` }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== FINAL CTA ============== */}
      <section className="px-6 lg:px-10 py-28 text-center" style={{ backgroundColor: BONE }}>
        <div className="max-w-4xl mx-auto">
          <Eyebrow>Begin</Eyebrow>
          <h2 className="mt-5 text-5xl md:text-7xl font-bold tracking-tight leading-[0.95]" style={display}>
            Ready to <span className="italic" style={{ color: FOREST, textDecoration: `underline ${CITRUS}`, textUnderlineOffset: "8px" }}>Ace Your Exams?</span>
          </h2>
          <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto" style={{ color: `${INK}B3` }}>
            Start your journey to exam success today. Free trial available — no credit card required.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/auth"
              className="px-10 py-5 font-bold uppercase tracking-[0.18em] text-sm transition-colors hover:bg-[#234B36]"
              style={{ backgroundColor: INK, color: BONE }}>
              {isMobileWeb ? "Practice Now" : "Start Free Trial"}
            </Link>
            <Link to="/payment"
              className="px-10 py-5 font-bold uppercase tracking-[0.18em] text-sm border transition-colors hover:bg-[#0B2A1F] hover:text-[#F2EFE6]"
              style={{ borderColor: INK, color: INK }}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
