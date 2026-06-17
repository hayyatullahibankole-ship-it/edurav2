import { useState } from "react";
import { Link } from "react-router-dom";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import { CalendarCheck, Clock, MessageSquare, Phone } from "lucide-react";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  phone: z.string().trim().min(7, "Enter a valid phone").max(40),
  service: z.string().min(1, "Pick a service"),
  preferred_date: z.string().optional(),
  message: z.string().trim().min(5, "Tell us a little more").max(1500),
});

const SERVICES = [
  "Educational Consultancy",
  "Tutorials / Exam Prep",
  "Graphic Design",
  "Web Design",
  "Branding & Identity",
  "Something else",
];

export default function AkboyConsultation() {
  const { isAkboy, isCampusHub } = useDomainDetection();
  const basePath = isCampusHub ? "" : isAkboy ? "" : "/akboy";

  const [form, setForm] = useState({ name: "", email: "", phone: "", service: SERVICES[0], preferred_date: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Please fix the form", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("akboy_inquiries").insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      subject: `Consultation: ${form.service}`,
      message: `Preferred date: ${form.preferred_date || "Flexible"}\n\n${form.message}`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Could not submit", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
      toast({ title: "Request received", description: "We'll reach out within 24 hours." });
    }
  };

  return (
    <AkboyLayout
      title="Book a Consultation"
      description="Tell us about your goal — academic, creative or digital — and we'll get back within 24 hours to book a free consultation."
    >
      <section className="bg-akboy-cream akboy-grain py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr,1.1fr] gap-12 items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-akboy-forest font-semibold">Book a consultation</p>
            <h1 className="mt-3 font-display text-5xl lg:text-6xl font-semibold leading-[1.05] text-akboy-ink">
              Let's talk about what you want to grow.
            </h1>
            <p className="mt-5 text-lg text-akboy-ink/70 max-w-xl">
              A free, no-pressure 30-minute call. Bring your idea, your goal or your grade target — we'll bring honest direction and a plan.
            </p>

            <div className="mt-10 space-y-4">
              {[
                { icon: Clock, t: "30-minute focused session", d: "Strategy, scope and next steps — no fluff." },
                { icon: CalendarCheck, t: "Reply within 24 hours", d: "We'll confirm a time that works for you." },
                { icon: MessageSquare, t: "Honest, useful advice", d: "Even if we're not the right fit, you leave with clarity." },
              ].map(({ icon: Icon, t, d }) => (
                <div key={t} className="flex items-start gap-4 bg-white border border-akboy-stone rounded-2xl p-5">
                  <div className="w-10 h-10 rounded-xl bg-akboy-forest text-akboy-butter flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-akboy-ink">{t}</p>
                    <p className="text-sm text-akboy-ink/60 mt-0.5">{d}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <a href="https://wa.me/2348101466977" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-akboy-forest text-akboy-cream px-5 py-2.5 rounded-full font-semibold hover:bg-akboy-forest-deep">
                <MessageSquare className="w-4 h-4" /> WhatsApp
              </a>
              <a href="tel:+2348101466977" className="inline-flex items-center gap-2 bg-white border border-akboy-stone text-akboy-ink px-5 py-2.5 rounded-full font-semibold hover:border-akboy-forest">
                <Phone className="w-4 h-4" /> +234 810 146 6977
              </a>
            </div>
          </div>

          <div className="bg-white border border-akboy-stone rounded-3xl p-7 lg:p-9 akboy-shadow-soft">
            {sent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-akboy-butter text-akboy-ink mx-auto flex items-center justify-center mb-5">
                  <CalendarCheck className="w-8 h-8" />
                </div>
                <h2 className="font-display text-3xl font-semibold text-akboy-ink">Request received.</h2>
                <p className="mt-3 text-akboy-ink/65 max-w-md mx-auto">We'll confirm your consultation slot within 24 hours by email or WhatsApp.</p>
                <div className="mt-7 flex gap-3 justify-center">
                  <Button asChild className="bg-akboy-forest hover:bg-akboy-forest-deep text-akboy-cream rounded-full px-6">
                    <Link to={`${basePath}/portfolio`}>Browse our work</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full px-6">
                    <Link to={`${basePath}`}>Back to home</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <h2 className="font-display text-2xl font-semibold text-akboy-ink">Tell us about your project</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Full name *">
                    <input required value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Email *">
                    <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} className={inputCls} />
                  </Field>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Phone (WhatsApp) *">
                    <input required value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Service interested in *">
                    <select value={form.service} onChange={(e) => update("service", e.target.value)} className={inputCls}>
                      {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Preferred date (optional)">
                  <input type="date" value={form.preferred_date} onChange={(e) => update("preferred_date", e.target.value)} className={inputCls} />
                </Field>
                <Field label="Tell us briefly what you need *">
                  <textarea rows={5} required value={form.message} onChange={(e) => update("message", e.target.value)} className={inputCls + " resize-none"} />
                </Field>
                <Button type="submit" disabled={loading} className="w-full bg-akboy-forest hover:bg-akboy-forest-deep text-akboy-cream rounded-full h-12 font-semibold">
                  {loading ? "Sending…" : "Request consultation"}
                </Button>
                <p className="text-xs text-akboy-ink/50 text-center">By submitting you agree to our terms & privacy.</p>
              </form>
            )}
          </div>
        </div>
      </section>
    </AkboyLayout>
  );
}

const inputCls = "w-full px-4 py-3 rounded-xl bg-akboy-cream border border-akboy-stone text-akboy-ink placeholder:text-akboy-ink/40 focus:outline-none focus:border-akboy-forest focus:bg-white transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-akboy-ink/60 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
