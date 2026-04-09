import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Download, Eye, CheckCircle2, XCircle, Settings, Users, BarChart3, Calendar, Loader2, Search, Archive, ArchiveRestore } from "lucide-react";

export default function MockExamManager() {
  const [activeTab, setActiveTab] = useState("registrations");
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchivedBatches, setShowArchivedBatches] = useState(false);
  

  // Batch form
  const [newBatch, setNewBatch] = useState({ title: "", exam_date: "", exam_venue: "" });
  const [showBatchDialog, setShowBatchDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [regsRes, batchRes, resultsRes, settingsRes] = await Promise.all([
        supabase.from("mock_registrations" as any).select("*").order("created_at", { ascending: false }),
        supabase.from("mock_batches" as any).select("*").order("created_at", { ascending: false }),
        supabase.from("mock_results" as any).select("*").order("created_at", { ascending: false }),
        supabase.from("mock_settings" as any).select("key, value"),
      ]);

      if (regsRes.error) console.error('Error loading registrations:', regsRes.error);
      if (batchRes.error) console.error('Error loading batches:', batchRes.error);
      if (resultsRes.error) console.error('Error loading results:', resultsRes.error);
      if (settingsRes.error) console.error('Error loading settings:', settingsRes.error);

      if (regsRes.data) setRegistrations(regsRes.data as any[]);
      if (batchRes.data) setBatches(batchRes.data as any[]);
      if (resultsRes.data) setResults(resultsRes.data as any[]);
      
      const settingsMap: any = {};
      if (settingsRes.data) {
        for (const s of settingsRes.data as any[]) {
          try { settingsMap[s.key] = typeof s.value === 'string' ? JSON.parse(s.value) : s.value; }
          catch { settingsMap[s.key] = s.value; }
        }
      }
      setSettings(settingsMap);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const createBatch = async () => {
    if (!newBatch.title.trim()) { toast.error("Title is required"); return; }
    try {
      const { error } = await supabase.from("mock_batches" as any).insert({
        title: newBatch.title,
        exam_date: newBatch.exam_date || null,
        exam_venue: newBatch.exam_venue || null,
        batch_type: 'virtual'  // Default to virtual for manually created batches
      } as any);
      if (error) throw error;
      toast.success("Batch created");
      setShowBatchDialog(false);
      setNewBatch({ title: "", exam_date: "", exam_venue: "" });
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const toggleBatchActive = async (batchId: string, isActive: boolean) => {
    await supabase.from("mock_batches" as any).update({ is_active: !isActive } as any).eq("id", batchId);
    loadData();
  };

  const verifyPayment = async (regId: string) => {
    await supabase.from("mock_registrations" as any).update({ payment_status: "verified" } as any).eq("id", regId);
    toast.success("Payment verified");
    loadData();
  };

  const releaseResults = async (batchId?: string) => {
    try {
      if (batchId) {
        await supabase.from("mock_results" as any).update({ is_released: true } as any).eq("batch_id", batchId);
        await supabase.from("mock_batches" as any).update({ results_released: true, results_release_date: new Date().toISOString() } as any).eq("id", batchId);
      } else {
        await supabase.from("mock_results" as any).update({ is_released: true } as any).eq("is_released", false);
      }
      toast.success("Results released!");
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const unpublishResults = async (batchId?: string) => {
    try {
      if (batchId) {
        await supabase.from("mock_results" as any).update({ is_released: false } as any).eq("batch_id", batchId);
        await supabase.from("mock_batches" as any).update({ results_released: false } as any).eq("id", batchId);
      } else {
        await supabase.from("mock_results" as any).update({ is_released: false } as any).eq("is_released", true);
      }
      toast.success("Results unpublished");
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      await supabase.from("mock_settings" as any).update({ value: JSON.stringify(value) } as any).eq("key", key);
      toast.success("Setting updated");
      setSettings((prev: any) => ({ ...prev, [key]: value }));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const archiveBatch = async (batchId: string) => {
    try {
      await supabase.from("mock_batches" as any).update({ is_active: false } as any).eq("id", batchId);
      toast.success("Batch archived");
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const restoreBatch = async (batchId: string) => {
    try {
      await supabase.from("mock_batches" as any).update({ is_active: true } as any).eq("id", batchId);
      toast.success("Batch restored");
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const exportRegistrations = () => {
    const csv = [
      ["Reg Number", "Name", "Phone", "Email", "Mode", "Subjects", "Payment", "Exam Status", "Date"],
      ...registrations.map(r => [
        r.registration_number, r.full_name, r.phone, r.email || "",
        r.mode, (r.subjects || []).map((s: any) => s.name).join("; "),
        r.payment_status, r.exam_status,
        new Date(r.created_at).toLocaleDateString()
      ])
    ].map(r => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mock_registrations_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const exportResults = (batchId?: string) => {
    const filteredResults = batchId ? results.filter(r => r.batch_id === batchId) : results;
    const uniqueSubjects = getUniqueSubjects(filteredResults);
    const batchName = batchId ? batches.find(b => b.id === batchId)?.title || "batch" : "all";
    
    const csv = [
      ["Reg Number", "Name", "Total Score", "Max Score", ...uniqueSubjects],
      ...filteredResults.map(r => {
        const reg = registrations.find(reg => reg.registration_number === r.registration_number);
        const subjectMap: Record<string, string> = {};
        (r.subject_scores || []).forEach((s: any) => {
          subjectMap[s.subject_name] = String(s.converted_score ?? s.score ?? '');
        });
        return [
          r.registration_number,
          reg?.full_name || "Unknown",
          r.total_score,
          r.max_score,
          ...uniqueSubjects.map(s => subjectMap[s] || "N/A")
        ];
      })
    ].map(r => r.map(cell => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mock_results_${batchName.replace(/\s+/g, '_')}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Results exported");
  };

  const getUniqueSubjects = (resultsList?: any[]): string[] => {
    const subjects = new Set<string>();
    (resultsList || results).forEach(r => {
      (r.subject_scores || []).forEach((s: any) => {
        if (s.subject_name) subjects.add(s.subject_name);
      });
    });
    return Array.from(subjects).sort();
  };

  // Group results by batch
  const resultsByBatch = batches.map(batch => ({
    batch,
    results: results.filter(r => r.batch_id === batch.id),
  })).filter(g => g.results.length > 0);

  const unbatchedResults = results.filter(r => !r.batch_id || !batches.find(b => b.id === r.batch_id));

  const filteredRegistrations = registrations.filter(r =>
    !searchQuery || 
    r.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.registration_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.phone?.includes(searchQuery)
  );

  const activeBatches = batches.filter(b => b.is_active !== false);
  const archivedBatches = batches.filter(b => b.is_active === false);

  if (loading) return <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mock Exam Management</h2>
          <p className="text-muted-foreground text-sm">Manage AKBOY JAMB Mock Examinations</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{registrations.length} Registrations</Badge>
          <Badge variant="outline">{results.length} Results</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="registrations"><Users className="w-4 h-4 mr-1" /> Registrations</TabsTrigger>
          <TabsTrigger value="batches"><Calendar className="w-4 h-4 mr-1" /> Batches</TabsTrigger>
          <TabsTrigger value="results"><BarChart3 className="w-4 h-4 mr-1" /> Results</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-1" /> Settings</TabsTrigger>
        </TabsList>

        {/* Registrations Tab */}
        <TabsContent value="registrations">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Registrations</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-9 w-48" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  </div>
                  <Button variant="outline" size="sm" onClick={exportRegistrations}>
                    <Download className="w-4 h-4 mr-1" /> Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reg Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Subjects</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map(reg => (
                      <TableRow key={reg.id}>
                        <TableCell className="font-mono text-xs">{reg.registration_number}</TableCell>
                        <TableCell className="font-medium">{reg.full_name}</TableCell>
                        <TableCell className="text-xs">{reg.phone}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize text-xs">{reg.mode}</Badge></TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(reg.subjects || []).slice(0, 2).map((s: any, i: number) => (
                              <Badge key={i} variant="secondary" className="text-[10px]">{s.name?.split(' ')[0]}</Badge>
                            ))}
                            {(reg.subjects || []).length > 2 && <Badge variant="secondary" className="text-[10px]">+{(reg.subjects || []).length - 2}</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={reg.payment_status === "verified" ? "default" : "destructive"} className="text-xs">
                            {reg.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">{reg.exam_status}</Badge>
                        </TableCell>
                        <TableCell>
                          {reg.payment_status !== "verified" && (
                            <Button size="sm" variant="ghost" onClick={() => verifyPayment(reg.id)}>
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Batches Tab */}
        <TabsContent value="batches">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Exam Batches</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={showArchivedBatches ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowArchivedBatches(!showArchivedBatches)}
                  >
                    <Archive className="w-4 h-4 mr-1" />
                    {showArchivedBatches ? "Show Active" : "Show Archived"}
                  </Button>
                  <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm"><Plus className="w-4 h-4 mr-1" /> New Batch</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Create Exam Batch</DialogTitle></DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Title</Label>
                          <Input value={newBatch.title} onChange={e => setNewBatch(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Batch A - March 2026" />
                        </div>
                        <div>
                          <Label>Exam Date</Label>
                          <Input type="datetime-local" value={newBatch.exam_date} onChange={e => setNewBatch(p => ({ ...p, exam_date: e.target.value }))} />
                        </div>
                        <div>
                          <Label>Venue (Physical)</Label>
                          <Input value={newBatch.exam_venue} onChange={e => setNewBatch(p => ({ ...p, exam_venue: e.target.value }))} placeholder="Exam venue address" />
                        </div>
                        <Button onClick={createBatch} className="w-full">Create Batch</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(showArchivedBatches ? archivedBatches : activeBatches).map(batch => {
                  const batchRegs = registrations.filter(r => r.batch_id === batch.id);
                  const batchResults = results.filter(r => r.batch_id === batch.id);
                  return (
                    <Card key={batch.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{batch.title}</h4>
                              {!batch.is_active && <Badge variant="secondary" className="text-xs">Archived</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {batch.exam_date ? new Date(batch.exam_date).toLocaleString() : 'No date set'}
                              {batch.exam_venue && ` • ${batch.exam_venue}`}
                            </p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">{batchRegs.length} registered</Badge>
                              <Badge variant="secondary" className="text-xs">{batchResults.length} results</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {batch.is_active ? (
                              <Button size="sm" variant="outline" onClick={() => archiveBatch(batch.id)}>
                                <Archive className="w-4 h-4 mr-1" /> Archive
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => restoreBatch(batch.id)}>
                                <ArchiveRestore className="w-4 h-4 mr-1" /> Restore
                              </Button>
                            )}
                            {batchResults.length > 0 && (
                              batch.results_released ? (
                                <Button size="sm" variant="destructive" onClick={() => unpublishResults(batch.id)}>Unpublish</Button>
                              ) : (
                                <Button size="sm" onClick={() => releaseResults(batch.id)}>Release Results</Button>
                              )
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {(showArchivedBatches ? archivedBatches : activeBatches).length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">
                    {showArchivedBatches ? "No archived batches" : "No active batches"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Mock Results by Batch</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => exportResults()}>
                    <Download className="w-4 h-4 mr-1" /> Export All
                  </Button>
                  <Button size="sm" onClick={() => releaseResults()}>Release All</Button>
                  <Button size="sm" variant="destructive" onClick={() => unpublishResults()}>Unpublish All</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {resultsByBatch.map(({ batch, results: batchResults }) => (
                <Card key={batch.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{batch.title}</h4>
                          {!batch.is_active && <Badge variant="secondary" className="text-xs">Archived</Badge>}
                          <Badge variant="outline" className="text-xs">{batchResults.length} results</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {batch.exam_date ? new Date(batch.exam_date).toLocaleString() : 'No date set'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => exportResults(batch.id)}>
                          <Download className="w-4 h-4 mr-1" /> Export
                        </Button>
                        {batch.is_active ? (
                          <Button size="sm" variant="outline" onClick={() => archiveBatch(batch.id)}>
                            <Archive className="w-4 h-4 mr-1" /> Archive
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => restoreBatch(batch.id)}>
                            <ArchiveRestore className="w-4 h-4 mr-1" /> Restore
                          </Button>
                        )}
                        {batch.results_released ? (
                          <Button size="sm" variant="destructive" onClick={() => unpublishResults(batch.id)}>Unpublish</Button>
                        ) : (
                          <Button size="sm" onClick={() => releaseResults(batch.id)}>Release</Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reg Number</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Subject Scores</TableHead>
                          <TableHead>Released</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {batchResults.map(r => {
                          const reg = registrations.find(reg => reg.registration_number === r.registration_number);
                          return (
                            <TableRow key={r.id}>
                              <TableCell className="font-mono text-xs">{r.registration_number}</TableCell>
                              <TableCell className="font-medium text-sm">{reg?.full_name || "Unknown"}</TableCell>
                              <TableCell className="font-bold">{r.total_score}/{r.max_score}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {(r.subject_scores || []).map((s: any, i: number) => (
                                    <Badge key={i} variant="outline" className="text-[10px]">
                                      {s.subject_name?.split(' ')[0]}: {s.converted_score}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={r.is_released ? "default" : "secondary"}>
                                  {r.is_released ? "Released" : "Hidden"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}

              {unbatchedResults.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <h4 className="font-semibold">Unbatched Results</h4>
                    <Badge variant="outline" className="text-xs w-fit">{unbatchedResults.length} results</Badge>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reg Number</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Subject Scores</TableHead>
                          <TableHead>Released</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {unbatchedResults.map(r => {
                          const reg = registrations.find(reg => reg.registration_number === r.registration_number);
                          return (
                            <TableRow key={r.id}>
                              <TableCell className="font-mono text-xs">{r.registration_number}</TableCell>
                              <TableCell className="font-medium text-sm">{reg?.full_name || "Unknown"}</TableCell>
                              <TableCell className="font-bold">{r.total_score}/{r.max_score}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {(r.subject_scores || []).map((s: any, i: number) => (
                                    <Badge key={i} variant="outline" className="text-[10px]">
                                      {s.subject_name?.split(' ')[0]}: {s.converted_score}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={r.is_released ? "default" : "secondary"}>
                                  {r.is_released ? "Released" : "Hidden"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {results.length === 0 && <p className="text-center py-8 text-muted-foreground">No results yet</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader><CardTitle>Mock Exam Settings</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Registration Fee (₦)</Label>
                <Input
                  type="number"
                  value={settings.registration_fee || "1000"}
                  onChange={e => setSettings((p: any) => ({ ...p, registration_fee: e.target.value }))}
                  onBlur={() => updateSetting("registration_fee", settings.registration_fee)}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Bank Name</Label>
                  <Input
                    value={settings.payment_account?.bank || ""}
                    onChange={e => setSettings((p: any) => ({ ...p, payment_account: { ...p.payment_account, bank: e.target.value } }))}
                    onBlur={() => updateSetting("payment_account", settings.payment_account)}
                  />
                </div>
                <div>
                  <Label>Account Number</Label>
                  <Input
                    value={settings.payment_account?.account_number || ""}
                    onChange={e => setSettings((p: any) => ({ ...p, payment_account: { ...p.payment_account, account_number: e.target.value } }))}
                    onBlur={() => updateSetting("payment_account", settings.payment_account)}
                  />
                </div>
                <div>
                  <Label>Account Name</Label>
                  <Input
                    value={settings.payment_account?.account_name || ""}
                    onChange={e => setSettings((p: any) => ({ ...p, payment_account: { ...p.payment_account, account_name: e.target.value } }))}
                    onBlur={() => updateSetting("payment_account", settings.payment_account)}
                  />
                </div>
              </div>
              <div>
                <Label>Exam Duration (minutes)</Label>
                <Input
                  type="number"
                  value={settings.exam_duration_minutes || "120"}
                  onChange={e => setSettings((p: any) => ({ ...p, exam_duration_minutes: e.target.value }))}
                  onBlur={() => updateSetting("exam_duration_minutes", settings.exam_duration_minutes)}
                />
              </div>

              {/* Brand Customization */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  🏷️ Brand Customization
                </h3>
                <p className="text-sm text-muted-foreground">Configure external brand identity that appears across the mock exam platform.</p>
                
                <div className="flex items-center gap-3">
                  <Switch
                    checked={settings.brand_enabled === true || settings.brand_enabled === "true"}
                    onCheckedChange={val => {
                      setSettings((p: any) => ({ ...p, brand_enabled: val }));
                      updateSetting("brand_enabled", val);
                    }}
                  />
                  <Label>Enable Brand Banner</Label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Brand Name</Label>
                    <Input
                      placeholder="e.g., XYZ Academy"
                      value={settings.brand_name || ""}
                      onChange={e => setSettings((p: any) => ({ ...p, brand_name: e.target.value }))}
                      onBlur={() => updateSetting("brand_name", settings.brand_name || "")}
                    />
                  </div>
                  <div>
                    <Label>Brand Tagline</Label>
                    <Input
                      placeholder="e.g., Excellence in Education"
                      value={settings.brand_tagline || ""}
                      onChange={e => setSettings((p: any) => ({ ...p, brand_tagline: e.target.value }))}
                      onBlur={() => updateSetting("brand_tagline", settings.brand_tagline || "")}
                    />
                  </div>
                  <div>
                    <Label>Brand Logo</Label>
                    <div className="space-y-2">
                      {settings.brand_logo_url && (
                        <div className="flex items-center gap-2">
                          <img src={settings.brand_logo_url} alt="Brand logo" className="h-10 w-auto object-contain rounded border" />
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSettings((p: any) => ({ ...p, brand_logo_url: "" }));
                            updateSetting("brand_logo_url", "");
                          }}>Remove</Button>
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 2 * 1024 * 1024) {
                            toast.error("Logo must be under 2MB");
                            return;
                          }
                          try {
                            toast.loading("Uploading logo...");
                            const ext = file.name.split('.').pop();
                            const fileName = `brand-logo-${Date.now()}.${ext}`;
                            const { error: uploadErr } = await supabase.storage
                              .from('brand-assets')
                              .upload(fileName, file, { upsert: true });
                            if (uploadErr) throw uploadErr;
                            const { data: urlData } = supabase.storage
                              .from('brand-assets')
                              .getPublicUrl(fileName);
                            const publicUrl = urlData.publicUrl;
                            setSettings((p: any) => ({ ...p, brand_logo_url: publicUrl }));
                            await updateSetting("brand_logo_url", publicUrl);
                            toast.dismiss();
                            toast.success("Logo uploaded successfully");
                          } catch (err: any) {
                            toast.dismiss();
                            toast.error("Upload failed: " + (err.message || "Unknown error"));
                          }
                          e.target.value = '';
                        }}
                      />
                      <p className="text-xs text-muted-foreground">Upload an image (max 2MB). JPG, PNG, or SVG recommended.</p>
                    </div>
                  </div>
                  <div>
                    <Label>Brand Color (hex)</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="#f97316"
                        value={settings.brand_color || "#f97316"}
                        onChange={e => setSettings((p: any) => ({ ...p, brand_color: e.target.value }))}
                        onBlur={() => updateSetting("brand_color", settings.brand_color || "#f97316")}
                      />
                      <div
                        className="w-10 h-10 rounded border shrink-0"
                        style={{ backgroundColor: settings.brand_color || "#f97316" }}
                      />
                    </div>
                  </div>
                </div>

                {(settings.brand_enabled === true || settings.brand_enabled === "true") && settings.brand_name && (
                  <div className="rounded-lg overflow-hidden border">
                    <div className="py-3 px-4 flex items-center justify-center gap-3 text-white"
                      style={{ backgroundColor: settings.brand_color || "#f97316" }}>
                      {settings.brand_logo_url && (
                        <img src={settings.brand_logo_url} alt="" className="h-8 w-auto object-contain rounded" />
                      )}
                      <div className="text-center">
                        <p className="font-bold text-sm">{settings.brand_name}</p>
                        {settings.brand_tagline && <p className="text-xs opacity-90">{settings.brand_tagline}</p>}
                      </div>
                    </div>
                    <p className="text-xs text-center text-muted-foreground py-2">Banner Preview</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
