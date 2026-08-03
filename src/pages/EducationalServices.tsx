import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Calendar as CalendarIcon, Clock, FileText, Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ServicesMobileNav from "@/components/edura/ServicesMobileNav";


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

const EducationalServices = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

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

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return services;
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.provider.toLowerCase().includes(term) ||
        (s.description || "").toLowerCase().includes(term)
    );
  }, [services, search]);

  useEffect(() => {
    if (!services.length) return;
    const provider = searchParams.get("provider");
    const slug = searchParams.get("service");
    if (provider) setSearch(provider);
    if (slug) {
      const match = services.find((s) => s.slug === slug);
      if (match) {
        setActiveService(match);
        setFormValues({});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services]);

  const openService = (service: Service) => {
    setActiveService(service);
    setFormValues({});
  };

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
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 pb-28 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Educational Services</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">
              e-PINs, registrations, result checking and admission support
            </p>
          </div>
          <SideSwitcher compact className="shrink-0" />
        </div>

        <Tabs defaultValue={searchParams.get("tab") === "requests" ? "requests" : "catalog"} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-sm">
            <TabsTrigger value="catalog">Services</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="space-y-6">
            <Card className="border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg border bg-muted p-2.5">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold">Expert Consultation</h2>
                  <p className="text-xs text-muted-foreground">Book a session with an admission or subject expert</p>
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
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              PROVIDERS.map((provider) => {
                const items = filtered.filter((s) => s.provider === provider.key);
                if (!items.length) return null;
                return (
                  <section key={provider.key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        {provider.label}
                      </h2>
                      <Badge variant="secondary">{items.length}</Badge>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {items.map((service) => (
                        <Card
                          key={service.id}
                          className="border transition-colors hover:border-primary/60"
                        >
                          <CardContent className="flex h-full flex-col gap-3 p-4">
                            <div className="space-y-1">
                              <h3 className="font-semibold leading-tight">{service.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {service.description}
                              </p>
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
                              <Button size="sm" onClick={() => openService(service)}>
                                Request
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your requests</CardTitle>
                <CardDescription>Track the status of every service you requested</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {requests.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No requests yet.</p>
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
                          {new Date(request.created_at).toLocaleDateString()} ·{" "}
                          {naira(request.amount)}
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

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

      <ServicesMobileNav activeTab={searchParams.get("tab") === "requests" ? "requests" : "services"} />
    </div>

  );
};

export default EducationalServices;
