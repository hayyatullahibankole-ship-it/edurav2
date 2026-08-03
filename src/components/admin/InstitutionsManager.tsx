import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Building2, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";

type Institution = {
  id: string;
  name: string;
  short_code: string | null;
  type: string;
  state: string | null;
  form_fee: number;
  service_fee_override: number | null;
  is_active: boolean;
};

const naira = (value: number) =>
  `₦${Number(value || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

export const tierFee = (formFee: number) => {
  if (formFee <= 5000) return 3000;
  if (formFee < 10000) return 4000;
  return 5000;
};

const emptyForm = {
  name: "",
  short_code: "",
  type: "university",
  state: "",
  form_fee: "",
  service_fee_override: "",
  is_active: true,
};

export default function InstitutionsManager() {
  const [items, setItems] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Institution | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("institutions")
      .select("id, name, short_code, type, state, form_fee, service_fee_override, is_active")
      .order("name");
    if (error) {
      console.error("institutions load failed", error);
      toast.error("Could not load institutions");
    }
    setItems((data as Institution[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.short_code || "").toLowerCase().includes(q) ||
        (i.state || "").toLowerCase().includes(q),
    );
  }, [items, search]);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setOpen(true);
  };

  const openEdit = (item: Institution) => {
    setEditing(item);
    setForm({
      name: item.name,
      short_code: item.short_code || "",
      type: item.type,
      state: item.state || "",
      form_fee: String(item.form_fee ?? ""),
      service_fee_override:
        item.service_fee_override === null || item.service_fee_override === undefined
          ? ""
          : String(item.service_fee_override),
      is_active: item.is_active,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Institution name is required");
      return;
    }
    const formFee = Number(form.form_fee) || 0;
    const payload = {
      name: form.name.trim(),
      short_code: form.short_code.trim() || null,
      type: form.type,
      state: form.state.trim() || null,
      form_fee: formFee,
      service_fee_override:
        form.service_fee_override.trim() === "" ? null : Number(form.service_fee_override),
      is_active: form.is_active,
    };

    setSaving(true);
    const { error } = editing
      ? await supabase.from("institutions").update(payload).eq("id", editing.id)
      : await supabase.from("institutions").insert(payload);
    setSaving(false);

    if (error) {
      console.error("save institution failed", error);
      toast.error(error.message.includes("unique") ? "That institution already exists" : "Could not save");
      return;
    }
    toast.success(editing ? "Institution updated" : "Institution added");
    setOpen(false);
    load();
  };

  const remove = async (item: Institution) => {
    if (!confirm(`Remove ${item.name}?`)) return;
    const { error } = await supabase.from("institutions").delete().eq("id", item.id);
    if (error) {
      toast.error("Could not remove institution");
      return;
    }
    toast.success("Institution removed");
    load();
  };

  const previewFee =
    form.service_fee_override.trim() !== ""
      ? Number(form.service_fee_override) || 0
      : tierFee(Number(form.form_fee) || 0);
  const previewTotal = (Number(form.form_fee) || 0) + previewFee;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Institutions & form prices</h2>
          <p className="text-sm text-muted-foreground">
            Students pick a school and pay the form fee plus your service fee automatically.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Add institution
        </Button>
      </div>

      <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
        Automatic service fee: form fee ₦5,000 or less → <strong>₦3,000</strong> · ₦5,001–₦9,999 →{" "}
        <strong>₦4,000</strong> · ₦10,000 and above → <strong>₦5,000</strong>. Set an override on any
        school to charge something different.
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search institutions"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border p-10 text-center">
          <Building2 className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No institutions yet.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((item) => {
            const fee =
              item.service_fee_override ?? tierFee(Number(item.form_fee) || 0);
            return (
              <Card key={item.id} className="border">
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold">{item.name}</h3>
                      {item.short_code && (
                        <Badge variant="secondary" className="text-[10px]">
                          {item.short_code}
                        </Badge>
                      )}
                      {!item.is_active && (
                        <Badge variant="outline" className="text-[10px]">
                          Hidden
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs capitalize text-muted-foreground">
                      {item.type}
                      {item.state ? ` · ${item.state}` : ""}
                    </p>
                    <p className="text-sm">
                      Form {naira(item.form_fee)} + fee {naira(Number(fee))} ={" "}
                      <span className="font-semibold">
                        {naira(Number(item.form_fee) + Number(fee))}
                      </span>
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(item)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit institution" : "Add institution"}</DialogTitle>
            <DialogDescription>
              Enter what the school charges for its form. Your fee is added automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Institution name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="University of Lagos"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Short code</Label>
                <Input
                  value={form.short_code}
                  onChange={(e) => setForm({ ...form, short_code: e.target.value })}
                  placeholder="UNILAG"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="university">University</SelectItem>
                    <SelectItem value="polytechnic">Polytechnic</SelectItem>
                    <SelectItem value="college">College of Education</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>State</Label>
              <Input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="Lagos"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>School form fee (₦)</Label>
                <Input
                  type="number"
                  value={form.form_fee}
                  onChange={(e) => setForm({ ...form, form_fee: e.target.value })}
                  placeholder="2500"
                />
              </div>
              <div className="space-y-2">
                <Label>Your fee override (₦)</Label>
                <Input
                  type="number"
                  value={form.service_fee_override}
                  onChange={(e) => setForm({ ...form, service_fee_override: e.target.value })}
                  placeholder="Auto"
                />
              </div>
            </div>

            <div className="rounded-lg border p-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>School form fee</span>
                <span>{naira(Number(form.form_fee) || 0)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Your service fee</span>
                <span>{naira(previewFee)}</span>
              </div>
              <div className="mt-1 flex justify-between border-t pt-1 font-semibold">
                <span>Student pays</span>
                <span>{naira(previewTotal)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Visible to students</p>
                <p className="text-xs text-muted-foreground">Turn off to hide this school</p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
            </div>

            <Button className="w-full" onClick={save} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Save changes" : "Add institution"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
