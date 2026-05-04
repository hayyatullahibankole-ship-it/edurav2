import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface Subscriber {
  id: string;
  email: string;
  whatsapp: string | null;
  created_at: string;
}

export function AkboyNewsletterSubscribersManager() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("campus_hub_subscribers")
        .select("id, email, whatsapp, created_at")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      setSubscribers((data as Subscriber[]) || []);
    } catch (error: any) {
      toast({ title: "Error loading subscribers", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscribers = subscribers.filter((subscriber) => {
    const text = `${subscriber.email} ${subscriber.whatsapp || ""}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Newsletter Subscribers</h2>
          </div>
          <p className="text-slate-400">View all email and WhatsApp newsletter signups for the Campus Hub.</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by email or WhatsApp"
            className="max-w-xs"
          />
          <Button onClick={fetchSubscribers} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{loading ? "Loading entries..." : `${filteredSubscribers.length} Subscribers`}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-slate-500">Loading newsletter subscribers...</div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No newsletter subscribers found.</div>
          ) : (
            <div className="divide-y divide-slate-200/10">
              {filteredSubscribers.map((subscriber) => (
                <div key={subscriber.id} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-medium text-white">{subscriber.email}</div>
                    <div className="text-sm text-slate-400">WhatsApp: {subscriber.whatsapp || "Not provided"}</div>
                  </div>
                  <div className="text-sm text-slate-500">{format(new Date(subscriber.created_at), "MMM dd, yyyy HH:mm")}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
