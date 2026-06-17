import { Link } from "react-router-dom";
import {
  ArrowUpRight, ArrowRight, BookOpen, Clock, Target, Users, Trophy,
  FileText, Video, MessageCircle, CheckCircle2, LogIn, Sparkles,
  Brain, Briefcase, Palette, Play, Star,
} from "lucide-react";
import heroImage from "@/assets/hero-students.jpg";
import Footer from "@/components/Footer";
import ScheduleTestModal from "@/components/ScheduleTestModal";
import { useAuth } from "@/hooks/useAuth";
import { useInstalledApp } from "@/hooks/useInstalledApp";
import { useIsMobile } from "@/hooks/use-mobile";

/* ============================================================
   EDURA — Editorial-tech homepage
   Forest #0B3B2E · Ivory #F5F1E8 · Signal Lime #C6F432 · Ink #0A0A0A
   Instrument Serif (display, italic) + Inter Tight (UI/body)
   ============================================================ */

const DISPLAY = { fontFamily: "'Instrument Serif', 'DM Serif Display', serif", letterSpacing: "-0.01em" };
const BODY = { fontFamily: "'Inter Tight', 'Inter', system-ui, sans-serif" };

const Eyebrow = ({ children, tone = "ink" }: { children: React.ReactNode; tone?: "ink" | "ivory" }) => (
  <span
    className={`inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] ${
      tone === "ivory" ? "text-[#C6F432]" : "text-[#0B3B2E]/65"
    }`}
    style={BODY}
  >
    <span className={`h-px w-6 ${tone === "ivory" ? "bg-[#C6F432]" : "bg-[#0B3B2E]/40"}`} />
    {children}
  </span>
);

const SectionNumber = ({ n, label, tone = "ink" }: { n: string; label: string; tone?: "ink" | "ivory" }) => (
  <div className="flex items-center gap-3" style={BODY}>
    <span className={`text-[11px] font-mono ${tone === "ivory" ? "text-[#C6F432]" : "text-[#0B3B2E]"}`}>{n}</span>
    <span className={`h-px w-10 ${tone === "ivory" ? "bg-white/20" : "bg-[#0B3B2E]/20"}`} />
    <span className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${tone === "ivory" ? "text-white/65" : "text-[#0B3B2E]/65"}`}>
      {label}
    </span>
  </div>
);

const Home = () => {
  const { user } = useAuth();
  const { isInstalledApp } = useInstalledApp();
  const isMobile = useIsMobile();
  const isMobileWeb = isMobile && !isInstalledApp;

  const PrimaryCTA = ({ className = "" }: { className?: string }) => {
    const inner = (
      <>
        Start JAMB Practice
        <span className="ml-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#C6F432] text-[#0B3B2E]">
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </span>
      </>
    );
    const base = `inline-flex items-center justify-center rounded-full bg-[#0B3B2E] px-6 py-4 text-sm font-semibold tracking-tight text-[#F5F1E8] shadow-[0_10px_30px_-10px_rgba(11,59,46,0.55)] transition-all hover:bg-[#082c22] active:scale-[0.98] ${className}`;
    if (isMobileWeb || !user) return <Link to="/auth" className={base} style={BODY}>{inner}</Link>;
    return (
      <ScheduleTestModal defaultExamType="jamb">
        <button className={base} style={BODY}>{inner}</button>
      </ScheduleTestModal>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] text-[#0A0A0A] selection:bg-[#C6F432] selection:text-[#0B3B2E]" style={BODY}>

      {/* ============== HERO ============== */}
      <section className="relative overflow-hidden">
        {/* Decorative grain */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "radial-gradient(#0B3B2E 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }} />

        <div className="mx-auto max-w-7xl px-5 pt-10 pb-16 sm:px-8 lg:pt-16 lg:pb-24">
          {/* Top index row */}
          <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.22em] text-[#0B3B2E]/55 mb-10 lg:mb-16">
            <span>Edura — Est. 2018</span>
            <span className="hidden sm:inline">Empowering Minds · Building Business</span>
            <span className="font-mono">N° 001</span>
          </div>

          {/* Headline */}
          <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16 items-end">
            <div>
              <Eyebrow>An Education · Tech · Creative Studio</Eyebrow>
              <h1 className="mt-6 text-[3.25rem] sm:text-[4.5rem] lg:text-[7rem] xl:text-[8.5rem] leading-[0.92] text-[#0B3B2E]" style={DISPLAY}>
                Empowering
                <br />
                minds. <em className="italic font-normal text-[#0B3B2E]/85">Building</em>
                <br />
                <span className="relative inline-block">
                  business.
                  <svg className="absolute -bottom-2 left-0 w-full" height="14" viewBox="0 0 400 14" fill="none" preserveAspectRatio="none">
                    <path d="M2 9 Q 100 1, 200 7 T 398 6" stroke="#C6F432" strokeWidth="5" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>

              <p className="mt-8 max-w-xl text-lg sm:text-xl leading-relaxed text-[#0A0A0A]/70">
                A focused practice platform for WAEC & JAMB, paired with creative and digital training for the next generation of Nigerian thinkers, makers and founders.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <PrimaryCTA />
                <Link
                  to="/demo"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#0B3B2E]/15 bg-white/60 px-6 py-4 text-sm font-semibold text-[#0B3B2E] backdrop-blur transition-all hover:bg-white"
                >
                  <Play className="h-4 w-4 fill-[#0B3B2E]" /> Watch the demo
                </Link>
              </div>

              {/* School link */}
              <div className="mt-6 flex items-center gap-3 text-sm">
                <span className="text-[#0A0A0A]/55">For institutions →</span>
                <Link to="/school-landing" className="font-semibold text-[#0B3B2E] underline decoration-[#C6F432] decoration-4 underline-offset-4">
                  Register your school
                </Link>
              </div>
            </div>

            {/* Right: stacked editorial card */}
            <div className="relative h-[420px] sm:h-[480px] lg:h-[560px]">
              {/* Hero image */}
              <div className="absolute right-0 top-0 h-[78%] w-[88%] overflow-hidden rounded-[28px] shadow-[0_30px_60px_-20px_rgba(11,59,46,0.35)]">
                <img src={heroImage} alt="Students preparing for WAEC & JAMB" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B3B2E]/30 via-transparent to-transparent" />
              </div>

              {/* Floating stat card */}
              <div className="absolute -left-2 sm:left-0 top-12 bg-[#F5F1E8] rounded-2xl p-5 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.18)] border border-[#0B3B2E]/8 max-w-[200px]">
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0B3B2E]/60">Avg. uplift</div>
                <div className="mt-1 text-4xl text-[#0B3B2E]" style={DISPLAY}>+92%</div>
                <div className="mt-1 text-xs text-[#0A0A0A]/55">Score improvement after 6 weeks</div>
                <div className="mt-3 flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-[#C6F432] text-[#C6F432]" />)}
                  <span className="ml-1 text-[11px] font-semibold text-[#0B3B2E]">4.9 · 1.2k reviews</span>
                </div>
              </div>

              {/* Bottom callout */}
              <div className="absolute bottom-0 right-4 lg:right-12 bg-[#0B3B2E] text-[#F5F1E8] rounded-2xl px-5 py-4 flex items-center gap-3 shadow-2xl">
                <div className="h-9 w-9 rounded-xl bg-[#C6F432] text-[#0B3B2E] flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">Admission</div>
                  <div className="text-lg font-semibold leading-tight">98% Placed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Marquee ticker */}
        <div className="border-y border-[#0B3B2E]/10 bg-[#F5F1E8] py-5 overflow-hidden">
          <div className="flex gap-12 whitespace-nowrap animate-[marquee_38s_linear_infinite]">
            {[...Array(2)].map((_, k) => (
              <div key={k} className="flex items-center gap-12 text-[#0B3B2E]/70 text-xl">
                {["UNILAG", "Covenant University", "OAU", "JAMB", "WAEC", "NECO", "LASU", "Babcock", "UI", "FUTA"].map((n) => (
                  <span key={n + k} className="flex items-center gap-12" style={DISPLAY}>
                    <em className="italic">{n}</em>
                    <span className="text-[#C6F432]">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== TWO TRACKS ============== */}
      <section className="px-5 sm:px-8 py-20 lg:py-28 bg-[#F5F1E8]">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 lg:mb-16">
            <div className="max-w-xl">
              <SectionNumber n="01 /04" label="Practice tracks" />
              <h2 className="mt-5 text-4xl sm:text-5xl lg:text-6xl leading-[1.02] text-[#0B3B2E]" style={DISPLAY}>
                Two exams. <em className="italic">One</em> serious prep engine.
              </h2>
            </div>
            <p className="max-w-sm text-[#0A0A0A]/65 leading-relaxed">
              Authentic JAMB and WAEC simulations with timing, scoring and analytics that mirror the real thing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* JAMB - dark featured */}
            <div className="group relative bg-[#0B3B2E] text-[#F5F1E8] rounded-[32px] p-8 lg:p-10 overflow-hidden">
              <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-[#C6F432]/15 blur-3xl" />
              <div className="relative">
                <div className="flex items-start justify-between mb-10">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C6F432]">Track 01 — Flagship</span>
                  <Target className="h-6 w-6 text-[#C6F432]" />
                </div>
                <h3 className="text-5xl lg:text-6xl" style={DISPLAY}>JAMB</h3>
                <p className="mt-3 text-base text-white/65 max-w-sm">
                  Full 180-question simulation across English plus your 3 chosen subjects. 120-minute official format.
                </p>

                <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-white/10 py-5">
                  {[
                    ["120", "minutes"],
                    ["180", "questions"],
                    ["/400", "score"],
                  ].map(([v, l]) => (
                    <div key={l}>
                      <dt className="text-2xl text-[#C6F432]" style={DISPLAY}>{v}</dt>
                      <dd className="text-[10px] font-semibold uppercase tracking-wider text-white/55 mt-0.5">{l}</dd>
                    </div>
                  ))}
                </dl>

                {user ? (
                  <ScheduleTestModal defaultExamType="jamb">
                    <button className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#C6F432] px-5 py-3 text-sm font-semibold text-[#0B3B2E] hover:bg-white transition-colors">
                      Start JAMB Practice <ArrowRight className="h-4 w-4" />
                    </button>
                  </ScheduleTestModal>
                ) : (
                  <Link to="/auth" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#C6F432] px-5 py-3 text-sm font-semibold text-[#0B3B2E] hover:bg-white transition-colors">
                    Start JAMB Practice <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>

            {/* WAEC - ivory */}
            <div className="group relative bg-white rounded-[32px] p-8 lg:p-10 overflow-hidden border border-[#0B3B2E]/8">
              <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-[#C6F432]/20 blur-3xl" />
              <div className="relative">
                <div className="flex items-start justify-between mb-10">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0B3B2E]/65">Track 02 — Subject mastery</span>
                  <BookOpen className="h-6 w-6 text-[#0B3B2E]" />
                </div>
                <h3 className="text-5xl lg:text-6xl text-[#0B3B2E]" style={DISPLAY}>WAEC</h3>
                <p className="mt-3 text-base text-[#0A0A0A]/65 max-w-sm">
                  Subject-by-subject papers with 50–60 questions each, scored on the A1–F9 grading system.
                </p>

                <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-[#0B3B2E]/10 py-5">
                  {[
                    ["50+", "per paper"],
                    ["A1-F9", "grading"],
                    ["10+", "subjects"],
                  ].map(([v, l]) => (
                    <div key={l}>
                      <dt className="text-2xl text-[#0B3B2E]" style={DISPLAY}>{v}</dt>
                      <dd className="text-[10px] font-semibold uppercase tracking-wider text-[#0B3B2E]/55 mt-0.5">{l}</dd>
                    </div>
                  ))}
                </dl>

                {user ? (
                  <ScheduleTestModal defaultExamType="waec">
                    <button className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#0B3B2E] px-5 py-3 text-sm font-semibold text-[#F5F1E8] hover:bg-black transition-colors">
                      Start WAEC Practice <ArrowRight className="h-4 w-4" />
                    </button>
                  </ScheduleTestModal>
                ) : (
                  <Link to="/auth" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#0B3B2E] px-5 py-3 text-sm font-semibold text-[#F5F1E8] hover:bg-black transition-colors">
                    Start WAEC Practice <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== CAPABILITIES BENTO ============== */}
      <section className="px-5 sm:px-8 py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 lg:mb-16">
            <div className="max-w-2xl">
              <SectionNumber n="02 /04" label="What we do" />
              <h2 className="mt-5 text-4xl sm:text-5xl lg:text-6xl leading-[1.02] text-[#0B3B2E]" style={DISPLAY}>
                Built for the modern <em className="italic">Nigerian</em> student.
              </h2>
            </div>
            <p className="max-w-sm text-[#0A0A0A]/65">
              Six tools, one platform — every detail engineered to move you from preparation to placement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 lg:gap-5">
            {/* Big tile */}
            <div className="md:col-span-4 md:row-span-2 bg-[#0B3B2E] text-[#F5F1E8] rounded-[28px] p-8 lg:p-10 relative overflow-hidden min-h-[340px] flex flex-col justify-between">
              <div className="absolute -bottom-32 -right-20 h-72 w-72 bg-[#C6F432]/15 rounded-full blur-3xl" />
              <div className="relative">
                <Brain className="h-8 w-8 text-[#C6F432]" />
                <h3 className="mt-6 text-4xl lg:text-5xl leading-tight max-w-md" style={DISPLAY}>
                  Performance analytics that <em className="italic">actually</em> teach.
                </h3>
                <p className="mt-4 max-w-md text-white/65">
                  Weak-topic detection, syllabus coverage, streaks and per-question explanations — turn every mock into a lesson.
                </p>
              </div>
              <div className="relative flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#C6F432]">
                Inside the dashboard <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>

            {/* small tiles */}
            {[
              { icon: Clock, t: "Timed simulations", d: "Real exam timing, mid-exam pause, auto-submit." },
              { icon: FileText, t: "Past questions", d: "2015 – 2024 archive, fully solved." },
              { icon: Video, t: "Video tutorials", d: "Expert-led explainers on tough topics." },
              { icon: Users, t: "1-on-1 consultation", d: "Book tutors and admission mentors." },
            ].map((f, i) => (
              <div key={f.t} className={`md:col-span-2 bg-[#F5F1E8] rounded-[24px] p-6 lg:p-7 border border-[#0B3B2E]/8 ${i === 3 ? "md:col-span-2" : ""}`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="h-11 w-11 rounded-xl bg-white flex items-center justify-center text-[#0B3B2E]">
                    <f.icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <span className="font-mono text-[10px] text-[#0B3B2E]/45">0{i + 2}</span>
                </div>
                <h4 className="text-xl font-semibold text-[#0B3B2E]" style={DISPLAY}>{f.t}</h4>
                <p className="mt-1.5 text-sm text-[#0A0A0A]/60 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>

          {/* Empowering minds + building business */}
          <div className="mt-5 grid md:grid-cols-2 gap-5">
            <div className="bg-[#C6F432] rounded-[28px] p-8 lg:p-10 relative overflow-hidden">
              <Palette className="h-8 w-8 text-[#0B3B2E]" />
              <h3 className="mt-6 text-3xl lg:text-4xl text-[#0B3B2E]" style={DISPLAY}>
                Empowering <em className="italic">minds.</em>
              </h3>
              <p className="mt-3 text-[#0B3B2E]/75 max-w-md">
                Tutorials, study hubs, mock exams and creative bootcamps — the academic side of Edura.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0B3B2E]">
                Explore academy <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
            <div className="bg-[#0A0A0A] text-[#F5F1E8] rounded-[28px] p-8 lg:p-10 relative overflow-hidden">
              <Briefcase className="h-8 w-8 text-[#C6F432]" />
              <h3 className="mt-6 text-3xl lg:text-4xl" style={DISPLAY}>
                Building <em className="italic text-[#C6F432]">business.</em>
              </h3>
              <p className="mt-3 text-white/65 max-w-md">
                Brand identity, websites and digital skills training — Edura's creative & tech studio for founders and schools.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#C6F432]">
                See the studio <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== SUBJECTS ============== */}
      <section className="px-5 sm:px-8 py-20 lg:py-28 bg-[#F5F1E8]">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 items-center">
            <div>
              <SectionNumber n="03 /04" label="Subjects" />
              <h2 className="mt-5 text-4xl sm:text-5xl lg:text-6xl leading-[1.02] text-[#0B3B2E]" style={DISPLAY}>
                Every subject. <em className="italic">Every</em> paper.
              </h2>
              <p className="mt-5 text-[#0A0A0A]/65 max-w-md">
                Complete coverage of WAEC and JAMB syllabi, updated yearly with the most recent past questions.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {[
                "English Language", "Mathematics", "Physics", "Chemistry", "Biology",
                "Geography", "Economics", "Government", "Literature", "History",
                "Commerce", "Accounting", "Agricultural Science", "CRS", "IRS",
              ].map((s, i) => (
                <span
                  key={s}
                  className={`rounded-full border px-4 py-2 text-sm transition-all hover:scale-105 cursor-default ${
                    i % 5 === 0
                      ? "bg-[#0B3B2E] text-[#F5F1E8] border-[#0B3B2E]"
                      : i % 5 === 2
                      ? "bg-[#C6F432] text-[#0B3B2E] border-[#C6F432]"
                      : "bg-white text-[#0B3B2E] border-[#0B3B2E]/10"
                  }`}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============== PROOF / STATS ============== */}
      <section className="px-5 sm:px-8 py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5">
              <SectionNumber n="04 /04" label="Proof" />
              <h2 className="mt-5 text-4xl sm:text-5xl lg:text-6xl leading-[1.02] text-[#0B3B2E]" style={DISPLAY}>
                The numbers <em className="italic">don't</em> lie.
              </h2>
              <p className="mt-5 text-[#0A0A0A]/65 max-w-md">
                Three years. Tens of thousands of students. A track record we're proud to put in print.
              </p>

              <ul className="mt-8 space-y-3.5">
                {[
                  "Unlimited practice across every WAEC & JAMB subject",
                  "Detailed analytics with weak-topic radar",
                  "Past questions library 2015 – 2024",
                  "Expert consultation & admission mentoring",
                  "Video tutorials, study guides, lesson quizzes",
                  "Web, PWA and mobile — practice anywhere",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#0B3B2E]">
                      <CheckCircle2 className="h-3 w-3 text-[#C6F432]" strokeWidth={3} />
                    </span>
                    <span className="text-[15px] text-[#0A0A0A]/80">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 gap-5 content-start">
              <div className="col-span-2 bg-[#0B3B2E] text-[#F5F1E8] rounded-[28px] p-10 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-[#C6F432]/15 blur-3xl" />
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C6F432]">Average score improvement</div>
                <div className="mt-3 text-[7rem] lg:text-[9rem] leading-none" style={DISPLAY}>92%</div>
                <p className="mt-2 max-w-md text-white/65">
                  Measured across active learners after six weeks on the Edura platform.
                </p>
              </div>

              {[
                { n: "50,000+", l: "Students registered", tone: "ivory" },
                { n: "98%", l: "Admission success rate", tone: "lime" },
              ].map((s, i) => (
                <div key={s.l} className={`rounded-[24px] p-8 ${
                  s.tone === "lime" ? "bg-[#C6F432] text-[#0B3B2E]" : "bg-[#F5F1E8] text-[#0B3B2E] border border-[#0B3B2E]/8"
                }`}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] opacity-70">0{i + 2}</div>
                  <div className="mt-2 text-5xl lg:text-6xl" style={DISPLAY}>{s.n}</div>
                  <div className="mt-2 text-sm font-medium opacity-80">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============== TESTIMONIAL ============== */}
      <section className="px-5 sm:px-8 py-20 lg:py-24 bg-[#F5F1E8]">
        <div className="mx-auto max-w-5xl text-center">
          <div className="flex justify-center mb-6">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-[#0B3B2E] text-[#0B3B2E]" />)}
          </div>
          <blockquote className="text-3xl sm:text-4xl lg:text-5xl leading-[1.15] text-[#0B3B2E]" style={DISPLAY}>
            "Edura didn't just prep me for JAMB — it rewired how I study. I scored <em className="italic">312</em> and got into UNILAG Medicine."
          </blockquote>
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="h-12 w-12 rounded-full bg-[#0B3B2E] text-[#C6F432] flex items-center justify-center font-semibold" style={DISPLAY}>AB</div>
            <div className="text-left">
              <div className="font-semibold text-[#0B3B2E]">Aisha Bello</div>
              <div className="text-xs text-[#0A0A0A]/55 uppercase tracking-wider">UNILAG, Medicine '26</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== CTA ============== */}
      <section className="px-5 sm:px-8 py-16 lg:py-24 bg-[#F5F1E8]">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[36px] bg-[#0B3B2E] text-[#F5F1E8] p-10 sm:p-14 lg:p-20">
            <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#C6F432]/20 blur-3xl" />
            <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-[#C6F432]/10 blur-3xl" />
            <div className="relative grid lg:grid-cols-[1.5fr_1fr] gap-10 items-end">
              <div>
                <Eyebrow tone="ivory"><Sparkles className="h-3 w-3" /> Begin today</Eyebrow>
                <h2 className="mt-5 text-5xl sm:text-6xl lg:text-7xl leading-[0.98]" style={DISPLAY}>
                  Ready to ace<br />your <em className="italic text-[#C6F432]">exams?</em>
                </h2>
                <p className="mt-5 max-w-md text-white/70 text-lg">
                  Free to start. No card required. Join 50,000+ students already practicing on Edura.
                </p>
              </div>
              <div className="flex flex-col gap-3 lg:items-end">
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-3 rounded-full bg-[#C6F432] px-8 py-5 text-base font-semibold text-[#0B3B2E] hover:bg-white transition-colors"
                >
                  {isMobileWeb ? <><LogIn className="h-5 w-5" /> Get Started</> : <>Start Free Trial <ArrowRight className="h-5 w-5" /></>}
                </Link>
                <Link
                  to="/payment"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-5 text-base font-semibold text-[#F5F1E8] backdrop-blur hover:bg-white/10 transition-colors"
                >
                  View Pricing
                </Link>
                <a
                  href="https://wa.me/2348101466977"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white"
                >
                  <MessageCircle className="h-4 w-4" /> Or chat with us on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default Home;
