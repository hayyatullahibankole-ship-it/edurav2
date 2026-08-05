import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Calculator,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Download,
  GraduationCap,
  LineChart,
  Sparkles,
  Wallet,
  WifiOff,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Course materials",
    body: "Lecture notes, handouts and past papers organised by your department and level.",
  },
  {
    icon: ClipboardCheck,
    title: "Project support",
    body: "Topic ideas, structure guides and supervision-ready templates for final-year work.",
  },
  {
    icon: Calculator,
    title: "CGPA tools",
    body: "Track results semester by semester and calculate the grades you need to hit your target.",
  },
  {
    icon: Calendar,
    title: "Deadlines & planner",
    body: "Tests, assignments, project milestones and exam dates in one academic timeline.",
  },
  {
    icon: Briefcase,
    title: "Opportunities",
    body: "Scholarships, internships, SIWES/IT and campus openings matched to your level.",
  },
  {
    icon: WifiOff,
    title: "Works offline",
    body: "Download materials and keep practising even when your network disappears.",
  },
];

const steps = [
  { n: "01", t: "Create your account", d: "Sign up for free and choose your institution, faculty and department." },
  { n: "02", t: "Pick your level", d: "Tell us your study level so Campus shows the right materials and tools." },
  { n: "03", t: "Switch to Campus mode", d: "Tap “I've been admitted” in your dashboard, or sign in and go straight to Campus." },
  { n: "04", t: "Start using your workspace", d: "Access course files, track CGPA, plan projects and apply for opportunities." },
];

const audiences = [
  "100–500 level students",
  "Final-year / project students",
  "SIWES, IT & NYSC candidates",
  "Postgraduate students",
  "Polytechnic & college students",
];

export default function CampusLanding() {
  useEffect(() => {
    document.title = "Edura Campus — University Workspace for Nigerian Students";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Edura Campus helps Nigerian undergraduates manage courses, CGPA, projects, deadlines and opportunities in one organised workspace."
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <div className="pointer-events-none absolute -top-40 right-0 h-[38rem] w-[38rem] rounded-full bg-primary/10 blur-[140px]" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-16 items-center">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-ink-soft px-3 py-1.5">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  For undergraduates & graduates
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
                Your university workspace,
                <br />
                <span className="text-primary">organised.</span>
              </h1>

              <p className="max-w-xl text-base md:text-lg leading-relaxed text-ink-foreground/70">
                Everything a Nigerian higher-institution student needs in one place — course materials, CGPA tracking,
                project planning, deadlines and opportunities. Same Edura wallet, same offline power, built for campus life.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/auth">
                  <Button size="lg" className="h-12 w-full sm:w-auto px-8 text-base font-bold text-ink">
                    Create free Campus account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 w-full sm:w-auto border-white/20 bg-transparent px-8 text-base font-bold text-ink-foreground hover:bg-ink-soft hover:text-ink-foreground"
                  >
                    I'm already a student
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-ink-foreground/50">
                {["Free to start", "Works on mobile", "No card required"].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Preview card */}
            <div className="rounded-2xl border border-white/10 bg-ink-soft overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/5 bg-ink px-4 py-2.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-foreground/40">
                  Semester dashboard
                </span>
                <Badge variant="secondary" className="rounded-full text-[10px]">
                  200 Level
                </Badge>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-foreground/60">Current CGPA</span>
                  <span className="font-display text-2xl font-bold text-primary">4.32</span>
                </div>
                <div className="h-2 rounded-full bg-ink overflow-hidden">
                  <div className="h-full w-[86%] bg-primary" />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {[
                    { label: "Courses", value: "6" },
                    { label: "Assignments", value: "3 due" },
                    { label: "Projects", value: "1 active" },
                    { label: "Opportunities", value: "5 new" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-white/10 bg-ink p-3 text-center">
                      <div className="font-display text-lg font-bold text-ink-foreground">{s.value}</div>
                      <div className="text-[10px] uppercase tracking-wide text-ink-foreground/50">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 bg-ink px-4 py-3">
                <span className="text-xs text-ink-foreground/50">Next deadline</span>
                <span className="text-xs font-semibold text-primary">CHM 201 test — Friday</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Built for campus life</span>
            <h2 className="mt-4 font-display text-3xl md:text-4xl font-bold text-foreground">
              Everything you juggle, in one workspace
            </h2>
            <p className="mt-3 text-muted-foreground">
              Stop scattering notes across WhatsApp, screenshots and email. Edura Campus is the single dashboard that grows
              with you from fresher to finalist.
            </p>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-surface p-8 md:p-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">How to switch to Campus</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              If you used Edura for JAMB or WAEC, your account stays. Just change your stage to “Undergraduate” or
              “Graduate” and the whole dashboard transforms.
            </p>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((s) => (
                <div key={s.n}>
                  <div className="font-display text-sm font-bold text-primary">{s.n}</div>
                  <div className="mt-2 font-display text-base font-bold text-foreground">{s.t}</div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHO IT'S FOR ============ */}
      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1.2fr,1fr] gap-10 items-center rounded-3xl border border-border bg-card p-8 md:p-12">
            <div>
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">Who it's for</span>
              </div>
              <h2 className="mt-4 font-display text-3xl md:text-4xl font-bold text-foreground">
                Made for every kind of higher-institution student
              </h2>
              <p className="mt-3 text-muted-foreground">
                University, polytechnic, college of education or postgraduate — if you're chasing a degree in Nigeria,
                Campus gives you the structure you need.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {audiences.map((a) => (
                  <Badge key={a} variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid gap-3">
              {[
                { icon: Wallet, t: "Same Edura wallet", d: "Fund one account and use it across services, PINs and campus tools." },
                { icon: LineChart, t: "Carry your history forward", d: "Everything from your candidate years stays intact in one account." },
                { icon: Download, t: "Offline-first", d: "Download materials and papers so missing data never misses a deadline." },
              ].map((x) => (
                <div key={x.t} className="flex items-start gap-4 rounded-xl border border-border bg-surface p-4">
                  <x.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <div className="font-display text-sm font-bold text-foreground">{x.t}</div>
                    <div className="text-sm text-muted-foreground">{x.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="bg-ink py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mx-auto max-w-3xl font-display text-3xl md:text-5xl font-bold leading-tight text-ink-foreground">
            Take your campus life seriously
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-foreground/60">
            Join Edura Campus and keep every course, project and opportunity in one place.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/auth">
              <Button size="lg" className="h-12 w-full sm:w-auto px-8 text-base font-bold text-ink">
                Get started free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/install-app">
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full sm:w-auto border-white/20 bg-transparent px-8 text-base font-bold text-ink-foreground hover:bg-ink-soft hover:text-ink-foreground"
              >
                <Download className="mr-2 h-5 w-5" />
                Install the app
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
