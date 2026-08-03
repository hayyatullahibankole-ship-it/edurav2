import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  Download,
  GraduationCap,
  LineChart,
  LogIn,
  ShieldCheck,
  Sparkles,
  Ticket,
  Timer,
  WifiOff,
} from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-students.jpg";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";
import ScheduleTestModal from "@/components/ScheduleTestModal";
import { useAuth } from "@/hooks/useAuth";
import { useInstalledApp } from "@/hooks/useInstalledApp";
import { useIsMobile } from "@/hooks/use-mobile";

const Home = () => {
  const { user } = useAuth();
  const { isInstalledApp } = useInstalledApp();
  const isMobile = useIsMobile();
  const isMobileWeb = isMobile && !isInstalledApp;

  const primaryHref = isMobileWeb ? "/auth" : user ? "/dashboard" : "/auth";

  const stats = [
    { value: "50,000+", label: "Students" },
    { value: "120,000+", label: "Practice questions" },
    { value: "24", label: "Student services" },
    { value: "4.8★", label: "App rating" },
  ];

  const services = [
    {
      icon: Ticket,
      title: "Result checker PINs",
      body: "WAEC, NECO and NABTEB PINs delivered to your screen seconds after payment. No agent, no waiting.",
      tag: "Instant",
    },
    {
      icon: ClipboardCheck,
      title: "Admissions & Post-UTME",
      body: "We fill and submit your Post-UTME or admission form. Pricing follows your institution's own fee.",
      tag: "Done for you",
    },
    {
      icon: CreditCard,
      title: "Edura Wallet",
      body: "Get a dedicated account number, transfer in from any bank, and pay for anything on Edura in one tap.",
      tag: "Dedicated NUBAN",
    },
    {
      icon: GraduationCap,
      title: "JAMB services",
      body: "Profile codes, e-PINs, and correction of data — handled by people who do it every day.",
      tag: "Verified",
    },
  ];

  const practiceFeatures = [
    { icon: Timer, title: "Real exam conditions", body: "180 questions in 120 minutes for JAMB, per-paper timing for WAEC." },
    { icon: LineChart, title: "Analytics that teach", body: "See weak topics, streaks and score trends after every attempt." },
    { icon: WifiOff, title: "Works offline", body: "Download a paper, write it with no data, and it syncs when you're back." },
    { icon: BookOpen, title: "Past questions 2015–2025", body: "Explanations, syllabus coverage, video lessons and a study planner." },
  ];

  const subjects = [
    "English Language", "Mathematics", "Physics", "Chemistry", "Biology",
    "Geography", "Economics", "Government", "Literature", "History",
    "Agricultural Science", "Commerce", "CRS/IRS", "Further Maths",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ============ HERO ============ */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-24">
          <div className="grid lg:grid-cols-[1.05fr,1fr] gap-12 lg:gap-16 items-center">
            {/* Left */}
            <div>
              <Badge variant="secondary" className="mb-6 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
                Edura v2 — two sides, one account
              </Badge>

              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-[1.05] text-foreground">
                Pass the exam.
                <span className="block text-primary">Skip the paperwork.</span>
              </h1>

              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                Edura is Nigeria's CBT practice platform <em className="not-italic font-semibold text-foreground">and</em> your
                student services desk. Practise JAMB and WAEC under real conditions, then buy result PINs, fund a wallet and
                process admissions without leaving the app.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                {user && !isMobileWeb ? (
                  <ScheduleTestModal defaultExamType="jamb">
                    <Button size="lg" className="h-12 px-7 text-base font-semibold">
                      Start practising
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </ScheduleTestModal>
                ) : (
                  <Link to={primaryHref}>
                    <Button size="lg" className="w-full sm:w-auto h-12 px-7 text-base font-semibold">
                      {isMobileWeb ? <LogIn className="mr-2 h-5 w-5" /> : null}
                      Start practising
                      {!isMobileWeb && <ArrowRight className="ml-2 h-5 w-5" />}
                    </Button>
                  </Link>
                )}
                <Link to="/services">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-7 text-base font-semibold border-2">
                    Explore student services
                  </Button>
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4 border-t border-border pt-8">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-bold text-foreground">{s.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — bento preview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 rounded-2xl overflow-hidden border border-border bg-muted">
                <img
                  src={heroImage}
                  alt="Nigerian students preparing for JAMB and WAEC with Edura CBT practice"
                  className="w-full h-44 sm:h-56 object-cover"
                  loading="lazy"
                />
              </div>

              <div className="rounded-2xl border border-border bg-background p-5">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Timer className="h-5 w-5" />
                </div>
                <div className="font-semibold text-foreground">Mock in progress</div>
                <div className="text-sm text-muted-foreground mt-1">Question 42 of 180</div>
                <div className="mt-4 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-[23%] bg-primary" />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background p-5">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="font-semibold text-foreground">Wallet</div>
                <div className="text-sm text-muted-foreground mt-1">Funded by bank transfer</div>
                <div className="mt-3 text-xs font-medium text-primary">Dedicated account ready</div>
              </div>

              <div className="col-span-2 rounded-2xl border border-border bg-background p-5 flex items-center gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Ticket className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-foreground">WAEC checker PIN delivered</div>
                  <div className="text-sm text-muted-foreground truncate">Automatically, 8 seconds after payment</div>
                </div>
                <CheckCircle2 className="h-5 w-5 text-primary ml-auto shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TWO SIDES ============ */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">One app, two sides</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Switch between practice and services any time from inside your dashboard.
            </p>
          </div>

          <div className="mt-10 grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-border bg-card p-7 md:p-9 flex flex-col">
              <Badge className="w-fit rounded-full bg-primary/10 text-primary hover:bg-primary/10 border-0 font-semibold">
                Side 1
              </Badge>
              <h3 className="mt-5 text-2xl font-bold text-foreground">CBT Practice</h3>
              <p className="mt-2 text-muted-foreground">
                JAMB, WAEC, NECO and Post-UTME simulations that behave exactly like the real thing.
              </p>
              <ul className="mt-6 space-y-3 flex-1">
                {["Official JAMB layout and timing", "Instant scoring with full explanations", "Offline mode for poor networks", "Study hub, planner and challenge arena"].map((i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {i}
                  </li>
                ))}
              </ul>
              <Link to="/demo" className="mt-7">
                <Button variant="outline" className="w-full sm:w-auto border-2 font-semibold">
                  Try a free demo test
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="rounded-2xl border border-border bg-foreground p-7 md:p-9 flex flex-col">
              <Badge className="w-fit rounded-full bg-primary text-primary-foreground hover:bg-primary border-0 font-semibold">
                Side 2
              </Badge>
              <h3 className="mt-5 text-2xl font-bold text-background">Student Services</h3>
              <p className="mt-2 text-background/70">
                The errands every Nigerian student runs — automated, priced upfront, and tracked end to end.
              </p>
              <ul className="mt-6 space-y-3 flex-1">
                {["Result checker PINs in seconds", "Post-UTME & admission processing", "Wallet with a dedicated account number", "Every request tracked with uploads"].map((i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-background">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {i}
                  </li>
                ))}
              </ul>
              <Link to="/services" className="mt-7">
                <Button className="w-full sm:w-auto font-semibold">
                  Browse services
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section className="py-16 md:py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Services that used to cost you a trip to town</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Pay with your card or wallet. Automated services deliver instantly; the rest are fulfilled by our team.
            </p>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s) => (
              <div key={s.title} className="rounded-2xl border border-border bg-background p-6 hover:border-primary/50 transition-colors">
                <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="mt-5 flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{s.title}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-primary">{s.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRACTICE FEATURES ============ */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[0.9fr,1.1fr] gap-12 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Practice built for the real exam hall</h2>
              <p className="mt-3 text-lg text-muted-foreground">
                Not a quiz app. Every simulation mirrors the official layout, timing and scoring so exam day feels familiar.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <span key={s} className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {practiceFeatures.map((f) => (
                <div key={f.title} className="rounded-2xl border border-border bg-card p-6">
                  <f.icon className="h-6 w-6 text-primary" />
                  <h3 className="mt-4 font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ SCHOOLS ============ */}
      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-card p-8 md:p-12 grid md:grid-cols-[1.2fr,1fr] gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 text-primary">
                <Building2 className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-widest">For schools</span>
              </div>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold text-foreground">Run your school's CBT on Edura</h2>
              <p className="mt-3 text-muted-foreground max-w-xl">
                Create exams, upload your own question bank, assign students, and get ranked performance reports per class.
                Mock exams are free — pay only when you're ready for full exams and reports.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link to="/school-landing">
                  <Button size="lg" className="w-full sm:w-auto font-semibold">
                    Register your school
                  </Button>
                </Link>
                <Link to="/school-login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 font-semibold">
                    School login
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid gap-3">
              {[
                { icon: ShieldCheck, t: "Anti-cheat & proctoring", d: "Tab locking, shuffling and timed submission." },
                { icon: LineChart, t: "Ranked reports", d: "Class averages, per-subject breakdowns, printable sheets." },
                { icon: ClipboardCheck, t: "Bulk question upload", d: "CSV import for thousands of questions at once." },
              ].map((x) => (
                <div key={x.t} className="flex items-start gap-4 rounded-xl border border-border bg-background p-4">
                  <x.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-sm text-foreground">{x.t}</div>
                    <div className="text-sm text-muted-foreground">{x.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ V3 TEASER ============ */}
      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-8 md:p-12 text-center">
            <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Coming soon
            </Badge>
            <h2 className="mt-5 text-3xl md:text-4xl font-bold text-foreground">Edura v3 is on the way</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              A smarter study companion, richer school tooling and a faster services desk. Everything you build up on Edura
              today carries straight over.
            </p>
            <Link to="/auth" className="inline-block mt-7">
              <Button size="lg" variant="outline" className="border-2 font-semibold">
                Create your account now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <BlogSection />

      {/* ============ FINAL CTA ============ */}
      <section className="bg-foreground py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-background max-w-3xl mx-auto leading-tight">
            Everything a Nigerian student needs, in one place
          </h2>
          <p className="mt-4 text-lg text-background/70 max-w-xl mx-auto">
            Free to start. No card required to practise.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={primaryHref}>
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-semibold">
                Get started free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/install-app">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-12 px-8 text-base font-semibold border-2 border-background/30 bg-transparent text-background hover:bg-background hover:text-foreground"
              >
                <Download className="mr-2 h-5 w-5" />
                Get the app
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
