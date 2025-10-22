import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  response: string;
  created_at: string;
}

export function AkboyInquiriesManager() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [response, setResponse] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from("akboy_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("akboy_inquiries")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      toast({ title: `Inquiry marked as ${status}` });
      fetchInquiries();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRespond = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setResponse(inquiry.response || "");
    setDialogOpen(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedInquiry) return;

    try {
      const { error } = await supabase
        .from("akboy_inquiries")
        .update({
          response,
          status: "responded",
          responded_at: new Date().toISOString(),
        })
        .eq("id", selectedInquiry.id);

      if (error) throw error;
      toast({ title: "Response saved successfully" });
      setDialogOpen(false);
      fetchInquiries();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" } = {
      new: "default",
      in_progress: "secondary",
      responded: "secondary",
      resolved: "secondary",
    };

    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (loading) return <div className="text-center p-8">Loading inquiries...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">AKBOY Contact Inquiries</h2>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span>Total: {inquiries.length}</span>
          <span>•</span>
          <span>New: {inquiries.filter(i => i.status === 'new').length}</span>
        </div>
      </div>

      <div className="grid gap-4">
        {inquiries.map((inquiry) => (
          <Card key={inquiry.id} className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{inquiry.name}</h3>
                    {getStatusBadge(inquiry.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{inquiry.email}</p>
                  {inquiry.phone && <p className="text-sm text-muted-foreground">{inquiry.phone}</p>}
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(inquiry.created_at), "MMM dd, yyyy HH:mm")}
                </span>
              </div>

              <div>
                <p className="font-medium text-sm">{inquiry.subject}</p>
                <p className="text-sm text-muted-foreground mt-1">{inquiry.message}</p>
              </div>

              {inquiry.response && (
                <div className="bg-muted/50 p-3 rounded">
                  <p className="text-sm font-medium mb-1">Response:</p>
                  <p className="text-sm">{inquiry.response}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRespond(inquiry)}
                >
                  <Mail className="w-4 h-4 mr-1" />
                  {inquiry.response ? "Edit Response" : "Respond"}
                </Button>
                {inquiry.status !== "resolved" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus(inquiry.id, "resolved")}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Mark Resolved
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respond to Inquiry</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">From: {selectedInquiry.name}</p>
                <p className="text-sm text-muted-foreground">{selectedInquiry.email}</p>
                <p className="text-sm mt-2"><strong>Subject:</strong> {selectedInquiry.subject}</p>
                <p className="text-sm mt-1"><strong>Message:</strong> {selectedInquiry.message}</p>
              </div>
              <div>
                <Label>Your Response</Label>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={6}
                  placeholder="Type your response here..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitResponse}>
                  Save Response
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
