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
import ProviderLogo, { providerInfo } from "@/components/edura/ProviderLogo";
import eduraLogo from "@/assets/edura-logo.png";
import {
  ArrowLeft,
  Briefcase,
  ClipboardList,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  Calendar as CalendarIcon,
  Wallet as WalletIcon,
} from "lucide-react";
import ScratchCardDialog from "@/components/edura/ScratchCardDialog";
import { useWallet } from "@/hooks/useWallet";
import { initializePaystackPayment } from "@/utils/paystack";
import { CreditCard, Loader2 } from "lucide-react";



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
  product_type?: string | null;
};

type ServiceRequest = {
  id: string;
  service_id?: string | null;
  service_name: string;
  provider: string;
  amount: number;
  status: string;
  created_at: string;
  admin_note: string | null;
  result_files?: ResultFile[];
  user_files?: ResultFile[];
  form_data?: Record<string, string> | null;
};

type ResultFile = { path: string; name: string; type: string };


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
  awaiting_details: "bg-primary/10 text-primary",
  needs_resubmission: "bg-destructive/10 text-destructive",



  processing: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
  cancelled: "bg-destructive/10 text-destructive",
};

const ServicesHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { balance, refresh: refreshWallet } = useWallet();
  const [searchParams, setSearchParams] = useSearchParams();


  const [services, setServices] = useState<Service[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [scratchService, setScratchService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState(searchParams.get("provider") || "all");
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"pay" | "details">("pay");
  const [paidRequestId, setPaidRequestId] = useState<string | null>(null);


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
        .select("id, provider, slug, name, description, price, turnaround, fields, product_type")
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

  const openResultFile = async (file: ResultFile) => {
    const { data, error } = await supabase.storage
      .from("service-results")
      .createSignedUrl(file.path, 600);
    if (error || !data?.signedUrl) {
      toast.error("Could not open this file");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  };

  const loadRequests = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("service_requests")
      .select("id, service_id, service_name, provider, amount, status, created_at, admin_note, result_files")
      .order("created_at", { ascending: false })
      .limit(50);
    setRequests(
      ((data as any[]) || []).map((r) => ({
        ...r,
        result_files: Array.isArray(r.result_files) ? (r.result_files as ResultFile[]) : [],
      })) as ServiceRequest[]
    );
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
        if (match.product_type === "scratch_card") {
          setScratchService(match);
        } else {
          openService(match);

        }
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

  const providerCards = useMemo(() => {
    const keys = Array.from(new Set(services.map((s) => s.provider)));
    return keys.map((key) => ({
      key,
      ...providerInfo(key),
      count: services.filter((s) => s.provider === key).length,
    }));
  }, [services]);

  const showProviderCards = provider === "all" && !search.trim();



  const counts = useMemo(() => {
    const pending = requests.filter((r) =>
      ["pending", "processing"].includes((r.status ?? "").toLowerCase())
    ).length;
    const completed = requests.filter((r) => (r.status ?? "").toLowerCase() === "completed").length;
    return { total: requests.length, pending, completed };
  }, [requests]);

  const openService = (service: Service) => {
    setActiveService(service);
    setFormValues({});
    setPaidRequestId(null);
    setStep("pay");
  };

  const closeDialog = () => {
    setActiveService(null);
    setFormValues({});
    setPaidRequestId(null);
    setStep("pay");
  };

  const afterPayment = async (payload: Record<string, unknown>) => {
    if (!activeService) return;
    const { data, error } = await supabase.functions.invoke("pay-service-request", {
      body: { service_id: activeService.id, ...payload },
    });

    if (error || data?.error) {
      toast.error(data?.error || "Payment could not be completed. Please try again.");
      return;
    }

    setPaidRequestId(data.request_id as string);
    setStep("details");
    refreshWallet();
    loadRequests();
    toast.success("Payment received. Now fill in your details.");
  };

  const payWithWallet = async () => {
    if (!activeService) return;
    if (!user) {
      toast.error("Please sign in to continue");
      navigate("/auth");
      return;
    }
    setSubmitting(true);
    await afterPayment({ payment_method: "wallet" });
    setSubmitting(false);
  };

  const payWithCard = async () => {
    if (!activeService) return;
    if (!user) {
      toast.error("Please sign in to continue");
      navigate("/auth");
      return;
    }
    setSubmitting(true);
    try {
      await initializePaystackPayment(
        {
          amount: Number(activeService.price) * 100,
          email: user.email || "",
          reference: `srv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          currency: "NGN",
          metadata: { purpose: "service_request", service_slug: activeService.slug },
        },
        async (reference) => {
          await afterPayment({ payment_method: "card", payment_reference: reference });
          setSubmitting(false);
        },
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start payment");
      setSubmitting(false);
    }
  };

  const submitDetails = async () => {
    if (!activeService || !paidRequestId) return;

    const missing = activeService.fields.filter(
      (field) => field.required && !formValues[field.key]?.trim()
    );
    if (missing.length) {
      toast.error(`Please fill: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase
      .from("service_requests")
      .update({ form_data: formValues, status: "pending" })
      .eq("id", paidRequestId);
    setSubmitting(false);

    if (error) {
      toast.error("Could not save your details. Please try again.");
      return;
    }

    toast.success("Details submitted. We'll process your request shortly.");
    closeDialog();
    loadRequests();
    setView("requests");
  };

  const resumeRequest = (request: ServiceRequest) => {
    const service = services.find((s) => s.id === request.service_id);
    if (!service) {
      toast.error("This service is no longer available. Please contact support.");
      return;
    }
    setActiveService(service);
    setFormValues({});
    setPaidRequestId(request.id);
    setStep("details");
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

            <Card className="border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg border bg-muted p-2">
                  <WalletIcon className="h-5 w-5 text-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold">Wallet</h2>
                  <p className="text-xs text-muted-foreground">
                    Fund once and pay for services instantly
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate("/wallet")}>
                  Open
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
                              {service.product_type === "scratch_card" && (
                                <Badge variant="secondary" className="text-[10px]">
                                  Instant delivery
                                </Badge>
                              )}
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
                                if (service.product_type === "scratch_card") {
                                  setScratchService(service);
                                  return;
                                }
                                openService(service);

                              }}
                            >
                              {service.product_type === "scratch_card" ? "Buy now" : "Pay & request"}
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
                  className="flex items-start justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{request.service_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString()} · {naira(request.amount)}
                    </p>
                    {request.admin_note && (
                      <p className="mt-1 text-xs text-muted-foreground">{request.admin_note}</p>
                    )}
                    {(request.result_files?.length ?? 0) > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {request.result_files!.map((file) => (
                          <Button
                            key={file.path}
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 px-2 text-xs"
                            onClick={() => openResultFile(file)}
                          >
                            <FileText className="h-3 w-3" />
                            <span className="max-w-[140px] truncate">{file.name}</span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  {request.status === "awaiting_details" ? (
                    <Button size="sm" className="shrink-0" onClick={() => resumeRequest(request)}>
                      Complete details
                    </Button>
                  ) : (
                    <Badge
                      className={`shrink-0 border-0 capitalize ${
                        statusStyles[request.status] || statusStyles.pending
                      }`}
                    >
                      {request.status}
                    </Badge>
                  )}

                </div>
              ))
            )}
          </div>
        )}
      </main>

      <Dialog open={!!activeService} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{activeService?.name}</DialogTitle>
            <DialogDescription>
              {activeService
                ? step === "pay"
                  ? `${naira(activeService.price)} · pay first, then fill in your details`
                  : `Payment received · ${activeService.turnaround ?? "we'll process shortly"}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {step === "pay" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-lg font-bold">{naira(activeService?.price || 0)}</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <WalletIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm">Wallet balance</span>
                </div>
                <Badge variant="secondary">{naira(balance)}</Badge>
              </div>

              <p className="text-xs text-muted-foreground">
                After payment you'll be asked for the details we need to process this service.
              </p>

              <div className="grid gap-2">
                <Button
                  onClick={payWithWallet}
                  disabled={submitting || balance < Number(activeService?.price || 0)}
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <WalletIcon className="mr-2 h-4 w-4" />
                  )}
                  Pay from wallet
                </Button>
                {balance < Number(activeService?.price || 0) && (
                  <button
                    className="text-left text-xs text-muted-foreground underline"
                    onClick={() => navigate("/wallet")}
                  >
                    Balance too low — fund your wallet
                  </button>
                )}
                <Button variant="outline" onClick={payWithCard} disabled={submitting}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay with card
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 rounded-lg border bg-muted p-3">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <p className="text-sm font-medium">Payment confirmed</p>
                </div>
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
                <Button variant="outline" onClick={closeDialog}>
                  Later
                </Button>
                <Button onClick={submitDetails} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit details"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>


      <ScratchCardDialog service={scratchService} onClose={() => setScratchService(null)} />

      <ServicesMobileNav activeTab={view === "requests" ? "requests" : "home"} />
    </div>
  );
};

export default ServicesHome;
