import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  School,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import dashboardPreview from "@/assets/school-dashboard-preview.jpg";

export default function SchoolLanding() {
  const navigate = useNavigate();

  const stats = [
    { number: "500+", label: "Schools registered" },
    { number: "50,000+", label: "Students practising" },
    { number: "120,000+", label: "Questions available" },
    { number: "Free", label: "Mock exams, always" },
  ];

  const features = [
    { icon: Users, title: "Student management", description: "Create classes, enrol students in bulk and track each one's WAEC, JAMB and NECO progress." },
    { icon: BarChart3, title: "Real-time analytics", description: "Per-subject performance, class averages and ranked leaderboards updated as exams are submitted." },
    { icon: Target, title: "Your own CBT exams", description: "Build exams from our 120,000-question bank or upload your school's own questions by CSV." },
    { icon: FileText, title: "Printable reports", description: "Generate broadsheets and individual result slips ready for parents and staff meetings." },
    { icon: Brain, title: "Weak-topic insights", description: "See exactly which topics a class keeps failing so revision time goes where it matters." },
    { icon: ShieldCheck, title: "Exam integrity", description: "Question shuffling, tab-lock, timed auto-submission and device-level session control." },
  ];

  const steps = [
    { n: "01", t: "Register your school", d: "Fill one form and verify your email. No sales call needed." },
    { n: "02", t: "Add your students", d: "Bulk-upload a class list; each student gets their own login." },
    { n: "03", t: "Create an exam", d: "Pick subjects, question count and duration, then schedule it." },
    { n: "04", t: "Read the results", d: "Rankings, subject breakdowns and printable reports the moment it ends." },
  ];

  const pricingTiers = [
    { students: "1-50", price: "₦1,000", highlight: false },
    { students: "51-100", price: "₦900", highlight: false },
    { students: "101-200", price: "₦850", highlight: true },
    { students: "201-250", price: "₦800", highlight: false },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-display text-lg font-bold">Edura Schools</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <Home className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Main site</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/school-login")}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                School login
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-ink text-ink-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-ink-soft px-3 py-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  For secondary schools & centres
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl xl:text-6xl font-bold leading-[1.06] tracking-tight">
                Run your school's CBT
                <br />
                <span className="text-primary">without the lab headache.</span>
              </h1>
              <p className="max-w-xl text-base md:text-lg leading-relaxed text-ink-foreground/70">
                Set exams, enrol students, and get ranked performance reports the minute a paper closes. Mock exams are
                free forever — you only pay when you're ready for full exams and reports.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="h-12 px-8 text-base font-bold text-ink" onClick={() => navigate("/school-registration")}>
                  Register your school
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base font-bold border-white/15 bg-ink-soft text-ink-foreground hover:bg-ink-soft/70 hover:text-ink-foreground"
                  onClick={() => navigate("/school-login")}
                >
                  School login
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-white/10 pt-6">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="font-display text-2xl font-bold">{s.number}</div>
                    <div className="text-xs text-ink-foreground/50">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-ink-soft p-3 shadow-2xl">
              <img
                src={dashboardPreview}
                alt="Edura school dashboard showing student results and analytics"
                loading="lazy"
                className="w-full rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Platform</span>
            <h2 className="mt-4 font-display text-3xl md:text-4xl font-bold text-foreground">
              Everything an exams officer actually needs
            </h2>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </span>
                <h3 className="mt-5 font-display text-base font-bold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-surface p-8 md:p-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Up and running the same day</h2>
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

      {/* Pricing */}
      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Pricing</span>
            <h2 className="mt-4 font-display text-3xl md:text-4xl font-bold text-foreground">
              Priced per student, per session
            </h2>
            <p className="mt-3 text-muted-foreground">
              The more students you enrol, the less you pay each. Mock exams stay free regardless of your plan.
            </p>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pricingTiers.map((t) => (
              <div
                key={t.students}
                className={`relative rounded-2xl border bg-card p-6 ${
                  t.highlight ? "border-primary" : "border-border"
                }`}
              >
                {t.highlight && (
                  <Badge className="absolute -top-2.5 left-6 rounded-full text-[10px] font-bold uppercase tracking-wide">
                    Most schools
                  </Badge>
                )}
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t.students} students
                </p>
                <div className="mt-3 flex items-end gap-1">
                  <span className="font-display text-3xl font-bold text-foreground tabular-nums">{t.price}</span>
                  <span className="pb-1 text-xs text-muted-foreground">/ student</span>
                </div>
                <ul className="mt-5 space-y-2">
                  {["Full exam engine", "Reports & analytics", "Unlimited mock exams"].map((i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-start gap-3">
              <School className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <div className="font-display text-sm font-bold text-foreground">More than 250 students?</div>
                <div className="text-sm text-muted-foreground">
                  We'll quote a custom rate for large schools and multi-campus groups.
                </div>
              </div>
            </div>
            <Button variant="outline" className="border-2 font-semibold" asChild>
              <a href="https://wa.me/2347050757085" target="_blank" rel="noopener noreferrer">
                Talk to us
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mx-auto max-w-3xl font-display text-3xl md:text-5xl font-bold leading-tight text-ink-foreground">
            Give your students the real exam experience
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-foreground/60">
            Register today and run your first mock exam free.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Button size="lg" className="h-12 w-full sm:w-auto px-8 text-base font-bold text-ink" onClick={() => navigate("/school-registration")}>
              Register your school
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full sm:w-auto border-white/20 bg-transparent px-8 text-base font-bold text-ink-foreground hover:bg-ink-soft hover:text-ink-foreground"
              asChild
            >
              <Link to="/">
                <ClipboardCheck className="mr-2 h-5 w-5" />
                Explore the student side
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
