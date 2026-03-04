import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, Search, Download, Eye, Filter, RefreshCw, CheckCircle, Clock, MapPin, Phone, Mail,
  ChevronDown, ChevronUp
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

interface Registration {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  registration_number: string;
  mode: string;
  // supabase returns `subjects` as Json, which could be an array or null,
  // so we relax the type here to avoid mismatches when the data comes back.
  subjects: any[] | null;
  batch_id: string | null;
  payment_status: string;
  exam_status: string;
  created_at: string;
  exam_started_at: string | null;
  exam_submitted_at: string | null;
  batch?: {
    id: string;
    title: string;
    exam_date: string;
    exam_venue: string;
    is_active: boolean;
  };
}

export function MockExamDashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch registrations with batch info
      // fetch registrations – result is untyped so we cast below
      const { data: regsData, error: regsError } = await supabase
        .from("mock_registrations")
        .select(`
          *,
          batch:mock_batches(id, title, exam_date, exam_venue, is_active)
        `)
        .order("created_at", { ascending: false });

      if (regsError) throw regsError;

      // Fetch all batches for filter
      const { data: batchesData, error: batchesError } = await supabase
        .from("mock_batches")
        .select(`id,title,exam_date,exam_venue,is_active`)
        .order("exam_date", { ascending: false });

      if (batchesError) throw batchesError;

      // coerce the results to the shapes we expect
      setRegistrations(
        (regsData || [] as any[]).map((r: any) => ({
          ...r,
          subjects: (r.subjects as any) || [],
        })) as Registration[]
      );
      setBatches((batchesData || []) as any[]);
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRegistrations = () => {
    return registrations.filter(reg => {
      const matchesSearch = 
        reg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.phone.includes(searchTerm);
      
      const matchesBatch = batchFilter === "all" || reg.batch_id === batchFilter;
      const matchesMode = modeFilter === "all" || reg.mode === modeFilter;
      const matchesStatus = statusFilter === "all" || reg.exam_status === statusFilter;

      return matchesSearch && matchesBatch && matchesMode && matchesStatus;
    });
  };

  const toggleRowExpand = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const exportToCSV = () => {
    const filtered = getFilteredRegistrations();
    const headers = [
      "Registration Number",
      "Full Name",
      "Phone",
      "Email",
      "Mode",
      "Batch",
      "Exam Date",
      "Exam Venue",
      "Payment Status",
      "Exam Status",
      "Registered At"
    ];

    const rows = filtered.map(r => [
      r.registration_number,
      r.full_name,
      r.phone,
      r.email || "",
      r.mode,
      r.batch?.title || "Unassigned",
      r.batch?.exam_date ? format(new Date(r.batch.exam_date), "yyyy-MM-dd HH:mm") : "",
      r.batch?.exam_venue || "TBD",
      r.payment_status,
      r.exam_status,
      format(new Date(r.created_at), "yyyy-MM-dd HH:mm")
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `mock_exam_registrations_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.csv`);
    link.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "registered":
        return "bg-blue-100 text-blue-800";
      case "started":
        return "bg-yellow-100 text-yellow-800";
      case "submitted":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "waived":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredRegs = getFilteredRegistrations();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{registrations.length}</div>
              <p className="text-sm text-muted-foreground">Total Registrations</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{registrations.filter(r => r.exam_status === "submitted").length}</div>
              <p className="text-sm text-muted-foreground">Exams Submitted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{registrations.filter(r => r.payment_status === "verified").length}</div>
              <p className="text-sm text-muted-foreground">Payments Verified</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{batches.length}</div>
              <p className="text-sm text-muted-foreground">Active Batches</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Mock Exam Registrations
              </CardTitle>
              <CardDescription>
                Manage and monitor all student registrations and their batch assignments
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Search by name, reg number, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9"
                />
              </div>
              <Select value={batchFilter} onValueChange={setBatchFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Filter by batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map(batch => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={modeFilter} onValueChange={setModeFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Filter by mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                  <SelectItem value="physical">Physical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="registered">Registered</SelectItem>
                  <SelectItem value="started">Started</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground">
              Showing {filteredRegs.length} of {registrations.length} registrations
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredRegs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No registrations found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted border-b">
                    <tr>
                      <th className="text-left p-3 w-40">Registration #</th>
                      <th className="text-left p-3">Student Name</th>
                      <th className="text-left p-3">Batch</th>
                      <th className="text-left p-3">Exam Date</th>
                      <th className="text-left p-3">Mode</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Payment</th>
                      <th className="text-center p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegs.map((reg) => (
                      <React.Fragment key={reg.id}>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="p-3 font-mono text-xs font-bold">{reg.registration_number}</td>
                          <td className="p-3">
                            <div>{reg.full_name}</div>
                            <div className="text-xs text-muted-foreground">{reg.phone}</div>
                          </td>
                          <td className="p-3">
                            {reg.batch ? (
                              <div>
                                <div className="font-medium">{reg.batch.title}</div>
                                <div className="text-xs text-muted-foreground">{reg.batch.exam_venue || "TBD"}</div>
                              </div>
                            ) : (
                              <Badge variant="outline">Unassigned</Badge>
                            )}
                          </td>
                          <td className="p-3">
                            {reg.batch?.exam_date ? (
                              <div className="text-sm">{format(new Date(reg.batch.exam_date), "MMM dd, yyyy")}</div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-3">
                            <Badge variant={reg.mode === "virtual" ? "secondary" : "outline"}>
                              {reg.mode}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge className={getStatusColor(reg.exam_status)}>
                              {reg.exam_status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge className={getPaymentColor(reg.payment_status)}>
                              {reg.payment_status}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRowExpand(reg.id)}
                            >
                              {expandedRows.has(reg.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedRegistration(reg);
                                setDetailsOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                        {expandedRows.has(reg.id) && (
                          <tr className="bg-muted/30 border-b">
                            <td colSpan={8} className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <div className="text-xs font-semibold text-muted-foreground uppercase">Contact</div>
                                  <div className="mt-2 space-y-1">
                                    <div className="flex items-center gap-2 text-sm">
                                      <Phone className="h-4 w-4" /> {reg.phone}
                                    </div>
                                    {reg.email && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4" /> {reg.email}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs font-semibold text-muted-foreground uppercase">Subjects</div>
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {reg.subjects?.map((subject: any, idx: number) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {subject.name}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs font-semibold text-muted-foreground uppercase">Timeline</div>
                                  <div className="mt-2 space-y-1 text-sm">
                                    <div>Registered: {format(new Date(reg.created_at), "MMM dd, yyyy HH:mm")}</div>
                                    {reg.exam_started_at && <div>Started: {format(new Date(reg.exam_started_at), "MMM dd, yyyy HH:mm")}</div>}
                                    {reg.exam_submitted_at && <div>Submitted: {format(new Date(reg.exam_submitted_at), "MMM dd, yyyy HH:mm")}</div>}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Registration Number</label>
                  <div className="font-mono text-lg font-bold mt-1">{selectedRegistration.registration_number}</div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Full Name</label>
                  <div className="text-lg mt-1">{selectedRegistration.full_name}</div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Phone</label>
                  <div className="mt-1">{selectedRegistration.phone}</div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Email</label>
                  <div className="mt-1">{selectedRegistration.email || "-"}</div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Mode</label>
                  <div className="mt-1">
                    <Badge variant={selectedRegistration.mode === "virtual" ? "secondary" : "outline"}>
                      {selectedRegistration.mode}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Exam Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedRegistration.exam_status)}>
                      {selectedRegistration.exam_status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="text-sm font-semibold text-muted-foreground">Assigned Batch</label>
                {selectedRegistration.batch ? (
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <div className="font-semibold">{selectedRegistration.batch.title}</div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Date: </span>
                        {format(new Date(selectedRegistration.batch.exam_date), "MMM dd, yyyy HH:mm")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Venue: </span>
                        {selectedRegistration.batch.exam_venue || "TBD"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-muted-foreground">No batch assigned</div>
                )}
              </div>

              <div className="border-t pt-4">
                <label className="text-sm font-semibold text-muted-foreground">Selected Subjects</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedRegistration.subjects?.map((subject: any, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      {subject.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="text-sm font-semibold text-muted-foreground">Payment Status</label>
                <div className="mt-1">
                  <Badge className={getPaymentColor(selectedRegistration.payment_status)}>
                    {selectedRegistration.payment_status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React from "react";
