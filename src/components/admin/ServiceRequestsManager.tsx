import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from "lucide-react";

const BUCKET = "service-results";
const ONE_YEAR = 60 * 60 * 24 * 365;
const MAX_SIZE = 15 * 1024 * 1024;

type ResultFile = {
  path: string;
  name: string;
  type: string;
  size?: number;
  uploaded_at?: string;
};

type ServiceRequest = {
  id: string;
  user_id: string;
  service_name: string;
  provider: string;
  amount: number;
  status: string;
  form_data: any;
  admin_note: string | null;
  result_files: ResultFile[];
  user_files: ResultFile[];
  created_at: string;
};

const STATUSES = [
  "awaiting_details",
  "pending",
  "processing",
  "needs_resubmission",
  "completed",
  "failed",
];

const statusStyles: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  awaiting_details: "bg-primary/10 text-primary",
  processing: "bg-primary/10 text-primary",
  needs_resubmission: "bg-destructive/10 text-destructive",
  completed: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
};

const naira = (v: number) => `₦${Number(v || 0).toLocaleString("en-NG")}`;

export default function ServiceRequestsManager() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [active, setActive] = useState<ServiceRequest | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("processing");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("service_requests")
      .select(
        "id, user_id, service_name, provider, amount, status, form_data, admin_note, result_files, user_files, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      toast({ title: "Could not load requests", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const rows = (data || []).map((r: any) => ({
      ...r,
      result_files: Array.isArray(r.result_files) ? (r.result_files as ResultFile[]) : [],
      user_files: Array.isArray(r.user_files) ? (r.user_files as ResultFile[]) : [],
    })) as ServiceRequest[];
    setRequests(rows);

    const ids = [...new Set(rows.map((r) => r.user_id).filter(Boolean))];
    if (ids.length) {
      const { data: users } = await supabase
        .from("users")
        .select("auth_user_id, email, first_name, last_name")
        .in("auth_user_id", ids);
      const map: Record<string, string> = {};
      (users || []).forEach((u: any) => {
        map[u.auth_user_id] = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email;
      });
      setEmails(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.service_name.toLowerCase().includes(q) ||
        r.provider.toLowerCase().includes(q) ||
        (emails[r.user_id] || "").toLowerCase().includes(q)
      );
    });
  }, [requests, search, statusFilter, emails]);

  const openRequest = (request: ServiceRequest) => {
    setActive(request);
    setNote(request.admin_note || "");
    setStatus(request.status === "awaiting_details" ? "awaiting_details" : request.status);
  };

  const persistFiles = async (files: ResultFile[]) => {
    if (!active) return;
    const { error } = await supabase
      .from("service_requests")
      .update({ result_files: files as any })
      .eq("id", active.id);
    if (error) throw error;
    setActive({ ...active, result_files: files });
    setRequests((prev) =>
      prev.map((r) => (r.id === active.id ? { ...r, result_files: files } : r))
    );
  };

  const handleUpload = async (list: FileList | null) => {
    if (!list?.length || !active) return;
    setUploading(true);
    try {
      const added: ResultFile[] = [];
      for (const file of Array.from(list)) {
        if (file.size > MAX_SIZE) {
          toast({ title: `${file.name} is larger than 15MB`, variant: "destructive" });
          continue;
        }
        const ext = file.name.split(".").pop() || "bin";
        const path = `${active.user_id}/${active.id}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
        if (error) throw error;
        added.push({
          path,
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          uploaded_at: new Date().toISOString(),
        });
      }
      if (added.length) {
        await persistFiles([...(active.result_files || []), ...added]);
        toast({ title: `${added.length} file(s) uploaded` });
      }
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeFile = async (file: ResultFile) => {
    if (!active) return;
    try {
      await supabase.storage.from(BUCKET).remove([file.path]);
      await persistFiles((active.result_files || []).filter((f) => f.path !== file.path));
    } catch (e: any) {
      toast({ title: "Could not remove file", description: e.message, variant: "destructive" });
    }
  };

  const previewFile = async (file: ResultFile) => {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(file.path, 600);
    if (error || !data?.signedUrl) {
      toast({ title: "Could not open file", variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  };

  const saveRequest = async () => {
    if (!active) return;
    setSaving(true);
    const { error } = await supabase
      .from("service_requests")
      .update({ status, admin_note: note || null })
      .eq("id", active.id);
    setSaving(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    setRequests((prev) =>
      prev.map((r) => (r.id === active.id ? { ...r, status, admin_note: note || null } : r))
    );
    toast({ title: "Request updated" });
    setActive(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by service, provider or customer"
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border py-12 text-center text-sm text-muted-foreground">
          {loading ? "Loading requests…" : "No service requests found."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <Card key={r.id} className="border shadow-none">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.service_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {emails[r.user_id] || "Customer"} · {new Date(r.created_at).toLocaleString()} ·{" "}
                    {naira(r.amount)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {r.result_files.length > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <FileText className="h-3 w-3" /> {r.result_files.length}
                    </Badge>
                  )}
                  <Badge
                    className={`border-0 capitalize ${statusStyles[r.status] || statusStyles.pending}`}
                  >
                    {r.status.replace("_", " ")}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => openRequest(r)}>
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{active?.service_name}</DialogTitle>
            <DialogDescription>
              {active ? `${emails[active.user_id] || "Customer"} · ${naira(active.amount)}` : ""}
            </DialogDescription>
          </DialogHeader>

          {active && (
            <div className="space-y-4">
              {active.form_data && Object.keys(active.form_data).length > 0 && (
                <div className="rounded-lg border p-3">
                  <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                    Submitted details
                  </p>
                  <div className="space-y-1 text-sm">
                    {Object.entries(active.form_data).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-3">
                        <span className="text-muted-foreground">{k.replace(/_/g, " ")}</span>
                        <span className="text-right font-medium">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium">Response files (image or document)</p>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Upload response
                </Button>

                {active.result_files.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {active.result_files.map((f) => (
                      <div
                        key={f.path}
                        className="flex items-center justify-between gap-2 rounded-lg border p-2"
                      >
                        <button
                          type="button"
                          onClick={() => previewFile(f)}
                          className="flex min-w-0 items-center gap-2 text-left text-sm hover:underline"
                        >
                          {f.type.startsWith("image/") ? (
                            <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          ) : (
                            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                          )}
                          <span className="truncate">{f.name}</span>
                        </button>
                        <Button size="icon" variant="ghost" onClick={() => removeFile(f)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Status</p>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Note to customer</p>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Optional message shown with the response"
                />
              </div>

              <Button className="w-full" onClick={saveRequest} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
