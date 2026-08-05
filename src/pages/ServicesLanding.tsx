import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  FileText,
  GraduationCap,
  Landmark,
  School,
  ShieldCheck,
  Ticket,
  Timer,
  Wallet,
} from "lucide-react";

const groups = [
  {
    provider: "WAEC / NECO / NABTEB",
    icon: Ticket,
    tag: "Automated",
    items: ["Result checker PINs", "Result verification", "Certificate requests"],
    note: "PIN shown on screen seconds after payment.",
  },
  {
    provider: "JAMB",
    icon: GraduationCap,
    tag: "Handled for you",
    items: ["UTME / DE e-PIN", "Profile code retrieval", "Correction of data", "Change of course & institution"],
    note: "Processed by agents who do this daily.",
  },
  {
    provider: "Admissions",
    icon: Landmark,
    tag: "Per institution",
    items: ["Post-UTME form purchase & filling", "Admission processing", "O'Level upload", "Acceptance fee payment"],
    note: "You pay your school's fee plus a flat service fee.",
  },
  {
    provider: "Documents",
    icon: FileText,
    tag: "Fast turnaround",
    items: ["Transcript requests", "Statement of result follow-up", "Scanning & document formatting"],
    note: "Upload once, we handle the back-and-forth.",
  },
];

const steps = [
  { n: "01", t: "Pick a service", d: "Choose the provider and the exact thing you need. Prices are shown upfront — no haggling." },
  { n: "02", t: "Pay your way", d: "Pay with your card or straight from your Edura wallet balance." },
  { n: "03", t: "Submit details", d: "Only after payment do you fill in what's needed. Upload documents right in the form." },
  { n: "04", t: "Get your result", d: "PINs appear instantly. Everything else is delivered as a file or code in your request history." },
];

export default function ServicesLanding() {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Hero */}
      <section className="bg-ink text-ink-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-ink-soft px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Student services desk
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl xl:text-6xl font-bold leading-[1.06] tracking-tight">
                Stop queuing at the cybercafé.
              </h1>
              <p className="max-w-xl text-base md:text-lg text-ink-foreground/70 leading-relaxed">
                Result checker PINs, JAMB e-PINs, Post-UTME forms, admission processing and document requests — paid for
                and delivered from one dashboard, with a wallet that has its own bank account number.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/auth">
                  <Button size="lg" className="h-12 px-8 text-base font-bold text-ink">
                    Open your services account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/payment">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 text-base font-bold border-white/15 bg-ink-soft text-ink-foreground hover:bg-ink-soft/70 hover:text-ink-foreground"
                  >
                    See pricing
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 text-sm text-ink-foreground/50">
                {["No agent runaround", "Receipts for everything", "Refund if we can't deliver"].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Request preview */}
            <div className="rounded-2xl border border-white/10 bg-ink-soft overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/5 bg-ink px-4 py-2.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-foreground/40">
                  My requests
                </span>
                <span className="text-[10px] text-ink-foreground/40">3 active</span>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { t: "WAEC result checker PIN", s: "Delivered", c: "text-primary", d: "PIN: 042 8391 2210" },
                  { t: "UNILAG Post-UTME form", s: "Processing", c: "text-warning", d: "Agent assigned • 1h ago" },
                  { t: "JAMB correction of data", s: "Awaiting details", c: "text-ink-foreground/60", d: "Paid ₦4,000" },
                ].map((r) => (
                  <div key={r.t} className="flex items-center justify-between gap-4 px-4 py-4">
                    <div>
                      <p className="text-sm font-semibold">{r.t}</p>
                      <p className="text-xs text-ink-foreground/50">{r.d}</p>
                    </div>
                    <span className={`text-[11px] font-bold uppercase tracking-wide ${r.c}`}>{r.s}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-white/5 bg-ink px-4 py-3">
                <span className="text-xs text-ink-foreground/50">Wallet balance</span>
                <span className="font-display text-sm font-bold tabular-nums">₦24,850.00</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalogue */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">What we handle</span>
            <h2 className="mt-4 font-display text-3xl md:text-4xl font-bold text-foreground">
              Every errand, grouped by who you're dealing with
            </h2>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 gap-4">
            {groups.map((g) => (
              <div key={g.provider} className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <g.icon className="h-5 w-5 text-primary" />
                  </span>
                  <Badge variant="secondary" className="rounded-full text-[10px] font-semibold uppercase tracking-wide">
                    {g.tag}
                  </Badge>
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-foreground">{g.provider}</h3>
                <ul className="mt-3 space-y-2">
                  {g.items.map((i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {i}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">{g.note}</p>
              </div>
            ))}
          </div>

          <Link
            to="/campus-landing"
            className="mt-4 block rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <School className="h-5 w-5 text-primary" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">Edura Campus</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Already admitted? Track courses, CGPA, projects, deadlines and campus opportunities — undergraduate
                    and postgraduate students welcome.
                  </p>
                </div>
              </div>
              <Button variant="outline" className="shrink-0 border-2 font-semibold">
                Explore Campus
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-surface p-8 md:p-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">How a request works</h2>
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

      {/* Wallet */}
      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-[1.1fr,1fr] gap-8 items-center rounded-3xl border border-border bg-card p-8 md:p-12">
            <div>
              <div className="flex items-center gap-2 text-primary">
                <Wallet className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">Edura wallet</span>
              </div>
              <h2 className="mt-4 font-display text-3xl md:text-4xl font-bold text-foreground">
                One balance for everything you buy here
              </h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Generate a dedicated Nigerian account number in seconds. Transfer from any bank app and your balance
                updates automatically — then pay for services without touching a card.
              </p>
              <Link to="/auth" className="mt-7 inline-block">
                <Button size="lg" className="font-semibold">
                  Create your wallet
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-3">
              {[
                { icon: CreditCard, t: "Dedicated NUBAN", d: "Your own permanent account number, issued instantly." },
                { icon: Timer, t: "Auto reconciliation", d: "Transfers reflect without you pressing anything." },
                { icon: ShieldCheck, t: "Full transaction history", d: "Every credit and debit, receipted and downloadable." },
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

      {/* CTA */}
      <section className="bg-ink py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mx-auto max-w-3xl font-display text-3xl md:text-5xl font-bold leading-tight text-ink-foreground">
            Get it sorted from your phone
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-foreground/60">
            Create a free account, fund your wallet, and place your first request in under five minutes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/auth">
              <Button size="lg" className="h-12 w-full sm:w-auto px-8 text-base font-bold text-ink">
                Get started free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/school-landing">
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full sm:w-auto border-white/20 bg-transparent px-8 text-base font-bold text-ink-foreground hover:bg-ink-soft hover:text-ink-foreground"
              >
                <Building2 className="mr-2 h-5 w-5" />
                I'm a school
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
