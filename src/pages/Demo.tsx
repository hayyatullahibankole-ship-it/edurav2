import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Clock, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const Demo = () => {
  const demoFeatures = [
    {
      no: "01",
      title: "Real exam interface",
      description: "The exact same layout, timer and navigation used in actual JAMB CBT centres.",
    },
    {
      no: "02",
      title: "Authentic timing",
      description: "Countdown pressure, question jumping and auto-submission behave like the real thing.",
    },
    {
      no: "03",
      title: "Instant results",
      description: "Score breakdown, weak topics and full explanations the moment you submit.",
    },
    {
      no: "04",
      title: "Full subject coverage",
      description: "Questions across every WAEC, NECO and JAMB subject from a 120,000+ question bank.",
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Hero */}
      <section className="bg-ink text-ink-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Interactive demo
            </span>
            <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              Sit a real CBT paper before you create an account.
            </h1>
            <p className="mt-5 max-w-xl text-base sm:text-lg text-ink-foreground/70">
              No sign-up, no card. Run a timed practice paper on the same engine our students use for
              JAMB and WAEC preparation.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/demo-test">
                <Button size="lg" className="h-12 px-8 text-base font-bold text-ink hover:bg-primary-hover">
                  <Play className="mr-2 h-5 w-5" />
                  Start demo test
                </Button>
              </Link>
              <Link to="/auth">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base font-bold border-white/15 bg-ink-soft text-ink-foreground hover:bg-ink-soft/70 hover:text-ink-foreground"
                >
                  Create a free account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">What you get</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight max-w-2xl">
            Everything the real exam throws at you
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {demoFeatures.map((f) => (
              <div key={f.no} className="rounded-2xl border border-border bg-card p-6">
                <span className="font-display text-sm font-bold text-primary">{f.no}</span>
                <h3 className="mt-3 font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview */}
      <section className="bg-surface py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-white/5 bg-ink px-5 py-3 text-ink-foreground">
              <div>
                <p className="font-display text-sm font-bold text-primary">JAMB CBT practice test</p>
                <p className="text-xs text-ink-foreground/50">Mathematics — question 1 of 40</p>
              </div>
              <span className="flex items-center gap-2 rounded border border-destructive/30 bg-destructive/15 px-2 py-1 text-xs font-semibold text-destructive tabular-nums">
                <Clock className="h-3.5 w-3.5" />
                2:59:45
              </span>
            </div>

            <div className="space-y-5 p-6 sm:p-8">
              <h3 className="text-base font-semibold">If 3x + 7 = 25, what is the value of x?</h3>
              <div className="space-y-2">
                {["A. 4", "B. 6", "C. 8", "D. 10"].map((option) => (
                  <div
                    key={option}
                    className="rounded-lg border border-border bg-surface px-4 py-3 text-sm"
                  >
                    {option}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
                <span className="rounded border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  Previous
                </span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BarChart3 className="h-3.5 w-3.5" />
                  1 / 40 answered
                </span>
                <span className="rounded bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
                  Next
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-ink px-6 py-12 sm:px-12 text-ink-foreground">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                Ready to start your preparation?
              </h2>
              <p className="mt-4 text-ink-foreground/70">
                Join 50,000+ students practising on Edura — offline-ready, with explanations on every
                question.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/demo-test">
                  <Button size="lg" className="h-12 px-8 text-base font-bold text-ink hover:bg-primary-hover">
                    Try the full demo
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 text-base font-bold border-white/15 bg-ink-soft text-ink-foreground hover:bg-ink-soft/70 hover:text-ink-foreground"
                  >
                    Create free account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Demo;
