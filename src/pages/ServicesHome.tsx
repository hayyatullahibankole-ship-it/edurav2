import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { SideSwitcher } from "@/components/edura/SideSwitcher";
import ServicesMobileNav from "@/components/edura/ServicesMobileNav";
import eduraLogo from "@/assets/edura-logo.png";
import {
  Briefcase,
  ClipboardList,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  Calendar as CalendarIcon,
} from "lucide-react";

type ServiceField = {
  key: string;
  label: string;
  type: "text" | "tel" | "number" | "textarea" | "select";
  required?: boolean;
  options?: string[];
};

type Service = {
  id: string;
  provider: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  turnaround: string | null;
  fields: ServiceField[];
};

type ServiceRequest = {
  id: string;
  service_name: string;
  provider: string;
  amount: number;
  status: string;
  created_at: string;
  admin_note: string | null;
};

const PROVIDERS = [
  { key: "all", label: "All" },
  { key: "jamb", label: "JAMB" },
  { key: "waec", label: "WAEC" },
  { key: "neco", label: "NECO" },
  { key: "nabteb", label: "NABTEB" },
  { key: "admission", label: "Admissions" },
];

const naira = (value: number) =>
  `₦${Number(value || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

const statusStyles: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  processing: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
  cancelled: "bg-destructive/10 text-destructive",
};

const ServicesHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [services, setServices] = useState<Service[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState(searchParams.get("provider") || "all");
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const view = searchParams.get("tab") === "requests" ? "requests" : "services";

  const setView = (next: "services" | "requests") => {
    const params = new URLSearchParams(searchParams);
    if (next === "requests") params.set("tab", "requests");
    else params.delete("tab");
    setSearchParams(params, { replace: true });
  };

  useEffect(() => {
    document.title = "Educational Services | Edura";
  }, []);

  useEffect(() => {
    setProvider(searchParams.get("provider") || "all");
  }, [searchParams]);



  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("service_catalog")
        .select("id, provider, slug, name, description, price, turnaround, fields")
        .eq("is_active", true)
        .order("provider")
        .order("sort_order");

      if (error) {
        toast.error("Could not load services");
      } else {
        setServices(
          (data || []).map((row) => ({
            ...row,
            fields: Array.isArray(row.fields) ? (row.fields as unknown as ServiceField[]) : [],
          })) as Service[]
        );
      }
      setLoading(false);
    };
    load();
  }, []);

  const loadRequests = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("service_requests")
      .select("id, service_name, provider, amount, status, created_at, admin_note")
      .order("created_at", { ascending: false })
      .limit(50);
    setRequests((data as ServiceRequest[]) || []);
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Deep link to a specific service
  useEffect(() => {
    if (!services.length) return;
    const slug = searchParams.get("service");
    if (slug) {
      const match = services.find((s) => s.slug === slug);
      if (match) {
        setActiveService(match);
        setFormValues({});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return services.filter((s) => {
      const matchProvider = provider === "all" || s.provider === provider;
      const matchTerm =
        !term ||
        s.name.toLowerCase().includes(term) ||
        s.provider.toLowerCase().includes(term) ||
        (s.description || "").toLowerCase().includes(term);
      return matchProvider && matchTerm;
    });
  }, [services, search, provider]);

  const counts = useMemo(() => {
    const pending = requests.filter((r) =>
      ["pending", "processing"].includes((r.status ?? "").toLowerCase())
    ).length;
    const completed = requests.filter((r) => (r.status ?? "").toLowerCase() === "completed").length;
    return { total: requests.length, pending, completed };
  }, [requests]);

  const submitRequest = async () => {
    if (!activeService) return;
    if (!user) {
      toast.error("Please sign in to request a service");
      navigate("/auth");
      return;
    }

    const missing = activeService.fields.filter(
      (field) => field.required && !formValues[field.key]?.trim()
    );
    if (missing.length) {
      toast.error(`Please fill: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("service_requests").insert({
      user_id: user.id,
      service_id: activeService.id,
      service_slug: activeService.slug,
      service_name: activeService.name,
      provider: activeService.provider,
      amount: activeService.price,
      form_data: formValues,
      status: "pending",
    });
    setSubmitting(false);

    if (error) {
      toast.error("Could not submit request. Please try again.");
      return;
    }

    toast.success("Request submitted. We'll process it shortly.");
    setActiveService(null);
    setFormValues({});
    loadRequests();
    setView("requests");
  };

  const firstName = (user?.email ?? "there").split("@")[0];

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-10">
      <header className="border-b bg-background sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src={eduraLogo} alt="Edura" className="h-7 w-auto shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">Educational Services</p>
              <p className="text-xs text-muted-foreground truncate">
                e-PINs, registrations & admissions
              </p>
            </div>
          </div>
          <SideSwitcher compact />
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-5 space-y-5">
        <section>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Hi, <span className="capitalize">{firstName}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pick a service below and we'll handle it for you.
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
                <div className="mb-2 w-fit rounded-md border bg-muted p-1.5">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                <p className="text-[11px] sm:text-xs text-muted-foreground">{stat.label}</p>
              </Card>
            );
          })}
        </section>

        {/* View switch */}
        <div className="inline-flex rounded-lg border bg-muted p-1">
          {(["services", "requests"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                view === key ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              {key === "services" ? "Services" : "My requests"}
            </button>
          ))}
        </div>

        {view === "services" ? (
          <div className="space-y-4">
            <Card className="border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg border bg-muted p-2.5">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold">Expert Consultation</h2>
                  <p className="text-xs text-muted-foreground">
                    Book a session with an admission or subject expert
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate("/consultation")}>
                  Book
                </Button>
              </CardContent>
            </Card>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search a service..."
                className="pl-9"
              />
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-36 w-full rounded-xl" />
                ))}
              </div>
            ) : showProviderCards ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {providerCards.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setProvider(p.key)}
                    className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition-colors hover:border-primary/60"
                  >
                    <ProviderLogo provider={p.key} className="h-14 w-14" />
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold leading-tight">{p.label}</p>
                      <p className="line-clamp-2 text-[11px] text-muted-foreground">{p.full}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {p.count} service{p.count === 1 ? "" : "s"}
                    </Badge>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {provider !== "all" && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setProvider("all")}>
                      <ArrowLeft className="mr-1.5 h-4 w-4" />
                      All providers
                    </Button>
                    <div className="flex items-center gap-2">
                      <ProviderLogo provider={provider} className="h-7 w-7" />
                      <span className="text-sm font-semibold">
                        {providerInfo(provider).label}
                      </span>
                    </div>
                  </div>
                )}

                {filtered.length === 0 ? (
                  <div className="rounded-lg border p-10 text-center">
                    <Briefcase className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No services match your search.</p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {filtered.map((service) => (
                      <Card
                        key={service.id}
                        className="border transition-colors hover:border-primary/60"
                      >
                        <CardContent className="flex h-full flex-col gap-3 p-4">
                          <div className="flex items-start gap-3">
                            <ProviderLogo provider={service.provider} className="h-10 w-10 shrink-0" />
                            <div className="min-w-0 space-y-1">
                              <h3 className="font-semibold leading-tight">{service.name}</h3>
                              <p className="line-clamp-2 text-sm text-muted-foreground">
                                {service.description}
                              </p>
                            </div>
                          </div>
                          <div className="mt-auto flex items-center justify-between gap-3">
                            <div>
                              <p className="text-lg font-bold">{naira(service.price)}</p>
                              {service.turnaround && (
                                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" /> {service.turnaround}
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                setActiveService(service);
                                setFormValues({});
                              }}
                            >
                              Request
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        ) : (
          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border py-12 text-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No requests yet.</p>
                <Button size="sm" className="mt-2" onClick={() => setView("services")}>
                  Browse services
                </Button>
              </div>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{request.service_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString()} · {naira(request.amount)}
                    </p>
                    {request.admin_note && (
                      <p className="mt-1 text-xs text-muted-foreground">{request.admin_note}</p>
                    )}
                  </div>
                  <Badge
                    className={`shrink-0 border-0 capitalize ${
                      statusStyles[request.status] || statusStyles.pending
                    }`}
                  >
                    {request.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <Dialog open={!!activeService} onOpenChange={(open) => !open && setActiveService(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{activeService?.name}</DialogTitle>
            <DialogDescription>
              {activeService ? `${naira(activeService.price)} · ${activeService.turnaround ?? ""}` : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {activeService?.fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>
                  {field.label}
                  {field.required && <span className="text-destructive"> *</span>}
                </Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.key}
                    value={formValues[field.key] || ""}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                  />
                ) : field.type === "select" ? (
                  <Select
                    value={formValues[field.key] || ""}
                    onValueChange={(value) =>
                      setFormValues((prev) => ({ ...prev, [field.key]: value }))
                    }
                  >
                    <SelectTrigger id={field.key}>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {(field.options || []).map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.key}
                    type={field.type}
                    value={formValues[field.key] || ""}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                  />
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveService(null)}>
              Cancel
            </Button>
            <Button onClick={submitRequest} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ServicesMobileNav activeTab={view === "requests" ? "requests" : "home"} />
    </div>
  );
};

export default ServicesHome;
