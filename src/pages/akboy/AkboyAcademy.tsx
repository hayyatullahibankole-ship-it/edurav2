import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Link } from "react-router-dom";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import { Button } from "@/components/ui/button";
import { GraduationCap, Sparkles, BellRing, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function AkboyAcademy() {
  const { isAkboy, isCampusHub } = useDomainDetection();
  const basePath = isCampusHub ? "" : isAkboy ? "" : "/akboy";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const notify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("akboy_inquiries").insert({
      name: "Academy waitlist",
      email: email.trim(),
      subject: "Academy waitlist",
      message: "Notify me when AKBOY Academy launches.",
    });
    setLoading(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "You're on the list", description: "We'll email you the moment Academy opens." });
      setEmail("");
    }
  };

  return (
    <AkboyLayout
      title="Academy — Coming Soon"
      description="The AKBOY Academy is launching soon: structured online courses, recorded lessons, tutorials and certificates for Nigerian students."
    >
      <section className="relative bg-akboy-cream akboy-grain min-h-[80vh] flex items-center py-20">
        <div className="absolute inset-0 akboy-gradient-mesh opacity-70 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 bg-white border border-akboy-stone rounded-full px-4 py-1.5 text-xs font-medium text-akboy-ink/80 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-akboy-forest" /> Phase 2 · Coming soon
          </span>
          <h1 className="mt-6 font-display text-5xl sm:text-7xl font-semibold leading-[1.02] text-akboy-ink tracking-tight">
            The <span className="text-akboy-forest">AKBOY Academy</span> is on the way.
          </h1>
          <p className="mt-6 text-lg text-akboy-ink/70 max-w-2xl mx-auto leading-relaxed">
            A full online learning platform — structured courses, recorded lessons, downloadable resources and certificates — built specifically for Nigerian students.
          </p>

          <div className="mt-10 grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
            {[
              { icon: GraduationCap, label: "Structured courses" },
              { icon: Sparkles, label: "Recorded lessons" },
              { icon: BellRing, label: "Certificates" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="bg-white border border-akboy-stone rounded-2xl p-4 flex flex-col items-center gap-2">
                <Icon className="w-5 h-5 text-akboy-forest" />
                <p className="text-sm font-medium text-akboy-ink">{label}</p>
              </div>
            ))}
          </div>

          <form onSubmit={notify} className="mt-10 max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="flex-1 px-5 py-3.5 rounded-full bg-white border border-akboy-stone text-akboy-ink placeholder:text-akboy-ink/40 focus:outline-none focus:border-akboy-forest"
            />
            <Button type="submit" disabled={loading} className="bg-akboy-forest hover:bg-akboy-forest-deep text-akboy-cream font-semibold rounded-full px-6 h-12">
              {loading ? "Saving…" : "Notify me"}
            </Button>
          </form>

          <p className="mt-10 text-sm text-akboy-ink/60">
            Need help studying right now?{" "}
            <Link to={`${basePath}/register`} className="text-akboy-forest font-semibold inline-flex items-center gap-1">
              Join the Exam Prep Academy <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </section>
    </AkboyLayout>
  );
}
