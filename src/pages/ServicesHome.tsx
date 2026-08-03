import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SideSwitcher } from "@/components/edura/SideSwitcher";
import { ServicesShowcase } from "@/components/edura/ServicesShowcase";
import ServicesMobileNav from "@/components/edura/ServicesMobileNav";
import eduraLogo from "@/assets/edura-logo.png";
import {
  ArrowRight,
  Briefcase,
  ClipboardList,
  CheckCircle2,
  Clock,
  GraduationCap,
  FileCheck,
  KeyRound,
  Award,
  BadgeCheck,
  Calendar,
} from "lucide-react";

interface RequestRow {
  id: string;
  status: string | null;
  created_at: string;
  service_id: string | null;
}

const QUICK_LINKS = [
  { label: "Buy e-PINs", icon: KeyRound, to: "/services?provider=jamb" },
  { label: "Registrations", icon: FileCheck, to: "/services?provider=waec" },
  { label: "Check Results", icon: BadgeCheck, to: "/services?provider=neco" },
  { label: "Admissions", icon: GraduationCap, to: "/services?provider=admission" },
  { label: "Expert Consultation", icon: Calendar, to: "/consultation" },
];

const ServicesHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Educational Services | Edura";
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("service_requests")
        .select("id, status, created_at, service_id")
        .order("created_at", { ascending: false })
        .limit(5);
      if (!cancelled) {
        setRequests((data as RequestRow[]) ?? []);
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const counts = useMemo(() => {
    const pending = requests.filter(
      (r) => (r.status ?? "").toLowerCase() === "pending" || (r.status ?? "").toLowerCase() === "processing"
    ).length;
    const completed = requests.filter((r) => (r.status ?? "").toLowerCase() === "completed").length;
    return { total: requests.length, pending, completed };
  }, [requests]);

  const firstName = (user?.email ?? "there").split("@")[0];

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-10">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src={eduraLogo} alt="Edura" className="h-7 w-auto shrink-0" />
            <div className="hidden sm:block min-w-0">
              <p className="text-sm font-semibold truncate">Educational Services</p>
              <p className="text-xs text-muted-foreground truncate">e-PINs, registrations & admissions</p>
            </div>
          </div>
          <SideSwitcher compact />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Greeting */}
        <section>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Welcome back, <span className="capitalize">{firstName}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Handle every exam and admission task in one place.
          </p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-3">
          {[
            { label: "Requests", value: counts.total, icon: ClipboardList },
            { label: "In progress", value: counts.pending, icon: Clock },
            { label: "Completed", value: counts.completed, icon: CheckCircle2 },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-3 sm:p-4 border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-md bg-muted border">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold">{loading ? "…" : stat.value}</div>
                <p className="text-[11px] sm:text-xs text-muted-foreground">{stat.label}</p>
              </Card>
            );
          })}
        </section>

        {/* Quick links */}
        <section>
          <h2 className="text-sm font-semibold mb-3">Quick actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.label}
                  onClick={() => navigate(link.to)}
                  className="flex items-center gap-2.5 rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary"
                >
                  <div className="p-2 rounded-md bg-muted border shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium leading-tight">{link.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Catalogue */}
        <ServicesShowcase />

        {/* Recent requests */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Recent requests</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/services?tab=requests")}>
              View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>

          <Card className="border divide-y">
            {loading && <div className="p-4 text-sm text-muted-foreground">Loading…</div>}
            {!loading && requests.length === 0 && (
              <div className="p-6 text-center">
                <Briefcase className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No requests yet.</p>
                <Button size="sm" className="mt-3" onClick={() => navigate("/services")}>
                  Browse services
                </Button>
              </div>
            )}
            {!loading &&
              requests.map((request) => (
                <button
                  key={request.id}
                  onClick={() => navigate("/services?tab=requests")}
                  className="w-full flex items-center justify-between gap-3 p-3.5 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">Request #{request.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize shrink-0">
                    {request.status ?? "pending"}
                  </Badge>
                </button>
              ))}
          </Card>
        </section>

        {/* Switch hint */}
        <Card className="border p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-md bg-muted border shrink-0">
              <Award className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">Preparing for an exam?</p>
              <p className="text-xs text-muted-foreground truncate">
                Switch to the CBT Practice side anytime.
              </p>
            </div>
          </div>
          <SideSwitcher compact className="shrink-0 hidden sm:inline-flex" />
        </Card>
      </main>

      <ServicesMobileNav activeTab="home" />
    </div>
  );
};

export default ServicesHome;
