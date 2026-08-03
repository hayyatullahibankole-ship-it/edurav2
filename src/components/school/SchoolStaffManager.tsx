import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserPlus, Trash2, Mail, Loader2, Users, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Props {
  schoolId: string;
}

export default function SchoolStaffManager({ schoolId }: Props) {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [form, setForm] = useState({ email: "", full_name: "", role: "teacher" });

  const fetchStaff = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("school_staff")
      .select("*")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load staff: " + error.message);
    setStaff(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim()) return;
    setInviting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-school-staff`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData.session?.access_token}`,
          },
          body: JSON.stringify({
            school_id: schoolId,
            email: form.email.trim().toLowerCase(),
            full_name: form.full_name.trim(),
            role: form.role,
          }),
        },
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to send invite");
      toast.success("Invite sent to " + form.email);
      setForm({ email: "", full_name: "", role: "teacher" });
      setInviteOpen(false);
      fetchStaff();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setInviting(false);
    }
  };

  const resendInvite = async (member: any) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-school-staff`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData.session?.access_token}`,
          },
          body: JSON.stringify({
            school_id: schoolId,
            email: member.email,
            full_name: member.full_name || "",
            role: member.role || "teacher",
            resend: true,
          }),
        },
      );
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "Failed to resend");
      }
      toast.success("Invite resent to " + member.email);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const removeStaff = async (id: string) => {
    if (!confirm("Remove this staff member? They will lose access immediately.")) return;
    const { error } = await supabase.from("school_staff").delete().eq("id", id);
    if (error) return toast.error("Failed to remove: " + error.message);
    toast.success("Staff member removed");
    fetchStaff();
  };

  const statusBadge = (status: string) => {
    if (status === "accepted")
      return <Badge className="bg-green-100 text-green-700">Active</Badge>;
    if (status === "pending")
      return <Badge className="bg-amber-100 text-amber-700">Invite sent</Badge>;
    return <Badge variant="secondary">{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" /> Staff
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Invite teachers to help manage exams and view reports without sharing your login.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" /> Invite Staff
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : staff.length === 0 ? (
        <Card className="p-10 text-center">
          <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">No staff members yet. Invite a teacher to get started.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {staff.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                  {(s.full_name || s.email || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {s.full_name || "Unnamed"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                </div>
                <Badge variant="outline" className="capitalize">{s.role || "teacher"}</Badge>
                {statusBadge(s.invite_status)}
                <div className="flex gap-1">
                  {s.invite_status === "pending" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => resendInvite(s)}
                      title="Resend invite"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => removeStaff(s.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite a staff member</DialogTitle>
            <DialogDescription>
              They'll receive an email with a link to join your school dashboard.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={sendInvite} className="space-y-4">
            <div>
              <Label>Full name</Label>
              <Input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="e.g. Mr. Adeyemi"
              />
            </div>
            <div>
              <Label>Email address *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="teacher@example.com"
                required
              />
            </div>
            <div>
              <Label>Role</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="teacher">Teacher — manage exams & view reports</option>
                <option value="assistant">Assistant — view only</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={inviting}>
                {inviting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                Send Invite
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
