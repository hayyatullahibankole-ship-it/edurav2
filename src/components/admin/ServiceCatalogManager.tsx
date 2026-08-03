import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
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
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, ArrowUp, ArrowDown } from "lucide-react";

type ServiceField = {
  key: string;
  label: string;
  type: string;
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
  icon: string | null;
  fields: ServiceField[];
  is_active: boolean;
  is_automated: boolean;
  sort_order: number;
  product_type: string | null;
  pricing_mode?: string | null;
  vendor_code: string | null;
};

type ServiceRequest = {
  id: string;
  service_name: string;
  provider: string;
  amount: number;
  status: string;
  admin_note: string | null;
  form_data: Record<string, unknown>;
  created_at: string;
};

const FIELD_TYPES = ["text", "tel", "email", "number", "date", "textarea", "select"];

const PROVIDERS = ["jamb", "waec", "neco", "nabteb", "admission", "other"];
const STATUSES = ["pending", "processing", "completed", "failed", "cancelled"];

const emptyForm = {
  provider: "jamb",
  slug: "",
  name: "",
  description: "",
  price: 0,
  turnaround: "",
  icon: "",
  is_active: true,
  is_automated: false,
  sort_order: 0,
  product_type: "request",
  pricing_mode: "fixed",
  vendor_code: "",
};

const naira = (value: number) =>
  `₦${Number(value || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function ServiceCatalogManager() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [fields, setFields] = useState<ServiceField[]>([]);

  const addField = () =>
    setFields((prev) => [...prev, { key: "", label: "", type: "text", required: true }]);
  const updateField = (index: number, patch: Partial<ServiceField>) =>
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  const removeField = (index: number) =>
    setFields((prev) => prev.filter((_, i) => i !== index));
  const moveField = (index: number, delta: number) =>
    setFields((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: cat }, { data: reqs }] = await Promise.all([
      supabase
        .from("service_catalog")
        .select("*")
        .order("provider", { ascending: true })
        .order("sort_order", { ascending: true }),
      supabase
        .from("service_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
    ]);
    setServices((cat as unknown as Service[]) || []);
    setRequests((reqs as unknown as ServiceRequest[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return services.filter(
      (s) =>
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.provider.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q)
    );
  }, [services, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFields([]);
    setDialogOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditing(service);
    setForm({
      provider: service.provider,
      slug: service.slug,
      name: service.name,
      description: service.description || "",
      price: Number(service.price) || 0,
      turnaround: service.turnaround || "",
      icon: service.icon || "",
      is_active: service.is_active,
      is_automated: service.is_automated,
      sort_order: service.sort_order ?? 0,
      product_type: service.product_type || "request",
      pricing_mode: service.pricing_mode || "fixed",
      vendor_code: service.vendor_code || "",
    });
    setFields(Array.isArray(service.fields) ? service.fields : []);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const cleaned = fields
      .map((f) => ({
        ...f,
        key: (f.key || slugify(f.label).replace(/-/g, "_")).trim(),
        label: f.label.trim(),
      }))
      .filter((f) => f.key && f.label);

    if (cleaned.length !== fields.length) {
      toast({
        title: "Incomplete field",
        description: "Every field needs a label and a key.",
        variant: "destructive",
      });
      return;
    }
    const parsedFields = cleaned;

    setSaving(true);
    const payload = {
      provider: form.provider,
      slug: form.slug ? slugify(form.slug) : slugify(form.name),
      name: form.name,
      description: form.description || null,
      price: Number(form.price) || 0,
      turnaround: form.turnaround || null,
      icon: form.icon || null,
      fields: parsedFields as any,
      is_active: form.is_active,
      is_automated: form.is_automated,
      sort_order: Number(form.sort_order) || 0,
      product_type: form.product_type,
      pricing_mode: form.pricing_mode,
      vendor_code: form.product_type === "scratch_card" ? form.vendor_code || null : null,
    };

    const { error } = editing
      ? await supabase.from("service_catalog").update(payload).eq("id", editing.id)
      : await supabase.from("service_catalog").insert([payload]);

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editing ? "Service updated" : "Service created" });
    setDialogOpen(false);
    loadAll();
  };

  const toggleActive = async (service: Service) => {
    const { error } = await supabase
      .from("service_catalog")
      .update({ is_active: !service.is_active })
      .eq("id", service.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setServices((prev) =>
      prev.map((s) => (s.id === service.id ? { ...s, is_active: !s.is_active } : s))
    );
  };

  const handleDelete = async (service: Service) => {
    if (!confirm(`Delete "${service.name}"?`)) return;
    const { error } = await supabase.from("service_catalog").delete().eq("id", service.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Service deleted" });
    setServices((prev) => prev.filter((s) => s.id !== service.id));
  };

  const updateRequest = async (id: string, status: string) => {
    const { error } = await supabase.from("service_requests").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast({ title: "Request updated" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Educational Services</h2>
          <p className="text-sm text-muted-foreground">
            Manage the service catalogue students see and process their requests.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Service
        </Button>
      </div>

      <Tabs defaultValue="catalog">
        <TabsList>
          <TabsTrigger value="catalog">Catalogue ({services.length})</TabsTrigger>
          <TabsTrigger value="requests">Requests ({requests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4 pt-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="pl-9"
            />
          </div>

          {loading ? (
            <p className="py-8 text-center text-muted-foreground">Loading services...</p>
          ) : (
            <div className="grid gap-3">
              {filtered.map((service) => (
                <Card key={service.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{service.name}</h3>
                        <Badge variant="outline" className="uppercase">
                          {service.provider}
                        </Badge>
                        {service.is_automated && <Badge variant="secondary">Automated</Badge>}
                        {service.product_type === "scratch_card" && (
                          <Badge variant="secondary">Instant PIN</Badge>
                        )}
                        {!service.is_active && <Badge variant="destructive">Inactive</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {service.description || "No description"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {naira(service.price)} · {service.turnaround || "No turnaround set"} ·{" "}
                        {(service.fields?.length ?? 0)} form field(s) · order {service.sort_order}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={service.is_active}
                        onCheckedChange={() => toggleActive(service)}
                      />
                      <Button size="sm" variant="outline" onClick={() => openEdit(service)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(service)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filtered.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">No services found.</p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-3 pt-4">
          {requests.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No requests yet.</p>
          ) : (
            requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{request.service_name}</h3>
                      <Badge variant="outline" className="uppercase">
                        {request.provider}
                      </Badge>
                      <Badge variant="secondary">{request.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {naira(request.amount)} ·{" "}
                      {new Date(request.created_at).toLocaleString()}
                    </p>
                    <pre className="mt-2 max-w-full overflow-x-auto rounded border bg-muted p-2 text-xs">
                      {JSON.stringify(request.form_data, null, 2)}
                    </pre>
                  </div>
                  <Select
                    value={request.status}
                    onValueChange={(value) => updateRequest(request.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Service" : "Add Service"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Provider</Label>
                <Select
                  value={form.provider}
                  onValueChange={(value) => setForm({ ...form, provider: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {provider.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="JAMB UTME e-PIN"
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="auto-generated from name"
                />
              </div>
              <div>
                <Label>Pricing Mode</Label>
                <Select
                  value={form.pricing_mode}
                  onValueChange={(value) => setForm({ ...form, pricing_mode: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed price</SelectItem>
                    <SelectItem value="institution">
                      Per institution (form fee + service fee)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.pricing_mode !== "institution" && (
                <div>
                  <Label>Price (₦)</Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  />
                </div>
              )}
              <div>
                <Label>Turnaround</Label>
                <Input
                  value={form.turnaround}
                  onChange={(e) => setForm({ ...form, turnaround: e.target.value })}
                  placeholder="Instant / 24 hours"
                />
              </div>
              <div>
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Product Type</Label>
                <Select
                  value={form.product_type}
                  onValueChange={(value) => setForm({ ...form, product_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="request">Request (collect information)</SelectItem>
                    <SelectItem value="scratch_card">Scratch card (instant PIN)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.product_type === "scratch_card" && (
                <div>
                  <Label>Vendor Code (Naijaresultspin)</Label>
                  <Input
                    value={form.vendor_code}
                    onChange={(e) => setForm({ ...form, vendor_code: e.target.value })}
                    placeholder="e.g. waec_result_checker"
                  />
                </div>
              )}
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label>Information to collect</Label>
                  <p className="text-xs text-muted-foreground">
                    Fields the student fills when requesting this service. Leave empty for
                    instant products like scratch cards.
                  </p>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={addField}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add field
                </Button>
              </div>

              {fields.length === 0 ? (
                <p className="rounded border border-dashed p-3 text-center text-xs text-muted-foreground">
                  No information collected — payment only.
                </p>
              ) : (
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div key={index} className="space-y-2 rounded-md border p-3">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <Label className="text-xs">Label</Label>
                          <Input
                            value={field.label}
                            onChange={(e) =>
                              updateField(index, {
                                label: e.target.value,
                                key: field.key || slugify(e.target.value).replace(/-/g, "_"),
                              })
                            }
                            placeholder="Phone Number"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Key</Label>
                          <Input
                            value={field.key}
                            onChange={(e) => updateField(index, { key: e.target.value })}
                            placeholder="phone_number"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Type</Label>
                          <Select
                            value={field.type}
                            onValueChange={(value) => updateField(index, { type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FIELD_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end gap-3">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={!!field.required}
                              onCheckedChange={(checked) =>
                                updateField(index, { required: checked })
                              }
                            />
                            <Label className="text-xs">Required</Label>
                          </div>
                          <div className="ml-auto flex gap-1">
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              className="h-9 w-9"
                              disabled={index === 0}
                              onClick={() => moveField(index, -1)}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              className="h-9 w-9"
                              disabled={index === fields.length - 1}
                              onClick={() => moveField(index, 1)}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="h-9 w-9"
                              onClick={() => removeField(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      {field.type === "select" && (
                        <div>
                          <Label className="text-xs">Options (comma separated)</Label>
                          <Input
                            value={(field.options || []).join(", ")}
                            onChange={(e) =>
                              updateField(index, {
                                options: e.target.value
                                  .split(",")
                                  .map((o) => o.trim())
                                  .filter(Boolean),
                              })
                            }
                            placeholder="Option A, Option B"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_automated}
                  onCheckedChange={(checked) => setForm({ ...form, is_automated: checked })}
                />
                <Label>Automated fulfilment</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || !form.name}>
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
