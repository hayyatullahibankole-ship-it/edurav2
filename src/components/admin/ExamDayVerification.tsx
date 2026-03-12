import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, XCircle, Loader2, Search, RefreshCw, Clock, MapPin, AlertCircle, Camera, Volume2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { BrowserQRCodeReader } from "@zxing/library";

interface StudentRecord {
  id: string;
  registration_number: string;
  full_name: string;
  phone: string;
  exam_status: string;
  exam_started_at: string | null;
  batch?: {
    id: string;
    title: string;
    exam_date: string;
    exam_venue: string;
  };
  verified_present?: boolean;
  verified_at?: string;
}

export function ExamDayVerification() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [batches, setBatches] = useState<any[]>([]);
  const [scanInput, setScanInput] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [verificationDialog, setVerificationDialog] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, selectedBatch]);

  // Initialize camera when scanner opens
  useEffect(() => {
    if (scannerOpen && videoRef.current) {
      let stream: MediaStream | null = null;
      let decodeInterval: NodeJS.Timeout | null = null;
      let isScanning = true;
      
      const initializeScanner = async () => {
        try {
          // Initialize reader first
          const reader = new BrowserQRCodeReader();
          readerRef.current = reader;
          
          // Request camera permissions and get video stream
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false,
          });
          
          if (!videoRef.current || !isScanning) return;
          
          // Set the stream to the video element
          videoRef.current.srcObject = stream;
          
          // Ensure video plays before starting decode
          await new Promise<void>((resolve) => {
            const checkPlaying = () => {
              if (videoRef.current && videoRef.current.readyState >= 2) {
                // readyState 2 = HAVE_CURRENT_DATA
                videoRef.current.play().catch(() => {
                  // Video play may fail but we can still try to decode
                });
                resolve();
              } else if (isScanning) {
                setTimeout(checkPlaying, 100);
              }
            };
            checkPlaying();
          });
          
          if (!isScanning) return;
          
          // Start continuous decoding
          decodeInterval = setInterval(async () => {
            if (!videoRef.current || !isScanning || !readerRef.current) return;
            
            try {
              const result = await readerRef.current.decodeFromVideoElement(videoRef.current);
              if (result) {
                const text = result.getText().trim();
                if (text && isScanning) {
                  // Stop scanning after successful read
                  isScanning = false;
                  if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                  }
                  if (decodeInterval) {
                    clearInterval(decodeInterval);
                  }
                  if (videoRef.current) {
                    videoRef.current.srcObject = null;
                  }
                  readerRef.current?.reset();
                  handleQrResult(text);
                }
              }
            } catch (err: any) {
              // NotFoundException is expected when no QR code is in frame
              // Only log actual errors
              if (err.name !== "NotFoundException" && !err.message?.includes("NotFoundException")) {
                console.debug("QR decode attempt:", err.message);
              }
            }
          }, 100); // Faster polling for better detection
        } catch (error: any) {
          console.error("Camera access error:", error);
          toast({
            title: "Camera access denied",
            description: "Please enable camera permissions in your browser settings to use QR scanning.",
            variant: "destructive",
          });
          setScannerOpen(false);
        }
      };
      
      initializeScanner();
      
      return () => {
        // Cleanup
        isScanning = false;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        if (decodeInterval) {
          clearInterval(decodeInterval);
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        readerRef.current?.reset();
      };
    }
  }, [scannerOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch registrations with batch info
      const { data: regsData, error: regsError } = await supabase
        .from("mock_registrations")
        .select(`
          id,
          registration_number,
          full_name,
          phone,
          exam_status,
          exam_started_at,
          batch:mock_batches(id, title, exam_date, exam_venue)
        `)
        .order("created_at", { ascending: false });

      if (regsError) throw regsError;

      // Fetch all batches
      const { data: batchesData, error: batchesError } = await supabase
        .from("mock_batches")
        .select("*")
        .eq("is_active", true)
        .order("exam_date", { ascending: false });

      if (batchesError) throw batchesError;

      setStudents(regsData || []);
      setBatches(batchesData || []);
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

  const filterStudents = () => {
    let filtered = students;

    // Filter by search term (registration number, name, or phone)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(student =>
        student.registration_number.toLowerCase().includes(term) ||
        student.full_name.toLowerCase().includes(term) ||
        student.phone.includes(term)
      );
    }

    // Filter by batch
    if (selectedBatch !== "all") {
      filtered = filtered.filter(student => student.batch?.id === selectedBatch);
    }

    setFilteredStudents(filtered);
  };

  const handleScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && scanInput.trim()) {
      const student = students.find(s =>
        s.registration_number.toLowerCase() === scanInput.trim().toLowerCase()
      );

      if (student) {
        setSelectedStudent(student);
        setVerificationDialog(true);
        setScanInput("");
      } else {
        toast({
          title: "Student not found",
          description: `No student found with registration number: ${scanInput}`,
          variant: "destructive",
        });
        setScanInput("");
      }
    }
  };

  // Handle QR code scan result
  const handleQrResult = async (text: string) => {
    if (!text) return;

    const student = students.find(s =>
      s.registration_number.toLowerCase() === text.toLowerCase()
    );

    if (student) {
      setScannerOpen(false);
      await verifyStudent(true, student);
    } else {
      toast({
        title: "Code not recognised",
        description: `Scanned value '${text}' did not match any registration`,
        variant: "destructive",
      });
    }
  };

  const verifyStudent = async (present: boolean, studentParam?: StudentRecord) => {
    const student = studentParam || selectedStudent;
    if (!student) return;

    setVerifying(true);
    try {
      const { error } = await supabase
        .from("mock_registrations")
        .update({
          verified_present: present,
          verified_at: new Date().toISOString(),
          exam_status: present ? "started" : "registered"
        })
        .eq("id", student.id);

      if (error) throw error;

      toast({
        title: present ? "Student verified" : "Student marked absent",
        description: `${selectedStudent.full_name} has been marked ${present ? "present" : "absent"}`,
      });

      // Update local state
      setStudents(students.map(s =>
        s.id === student.id
          ? { ...s, verified_present: present, verified_at: new Date().toISOString() }
          : s
      ));

      setVerificationDialog(false);
      setScanInput("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const getStats = () => {
    const totalForBatch = selectedBatch === "all"
      ? students
      : students.filter(s => s.batch?.id === selectedBatch);

    return {
      total: totalForBatch.length,
      verified: filteredStudents.filter(s => s.exam_status === "started").length,
      notVerified: filteredStudents.filter(s => s.exam_status === "registered").length,
      submitted: filteredStudents.filter(s => s.exam_status === "submitted").length,
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <Card className="border-2 border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-yellow-700 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900">Exam Day Verification</h3>
              <p className="text-sm text-yellow-800 mt-1">
                Use this interface to check in students on exam day. You can scan their registration number or search manually.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Total Registrations</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
              <p className="text-xs text-muted-foreground mt-1">Verified Present</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.notVerified}</div>
              <p className="text-xs text-muted-foreground mt-1">Not Yet Verified</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.submitted}</div>
              <p className="text-xs text-muted-foreground mt-1">Exams Submitted</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Check-In Students</CardTitle>
          <CardDescription>
            Enter or scan a registration number to verify student presence
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Scan Input with camera button */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Scan Registration Number</label>
            <div className="flex flex-col sm:flex-row gap-2 items-start">
              <Input
                placeholder="Scan or enter registration number..."
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyDown={handleScan}
                className="flex-1 w-full"
                autoFocus
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScannerOpen(true)}
                className="flex-shrink-0"
              >
                <Camera className="w-4 h-4 mr-1" />
                Scan QR
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter after scanning or typing
            </p>
          </div>

          {/* Manual search block separated */}
          <div className="border-t pt-4">
            <label className="text-sm font-semibold mb-2 block">Or Search Manually</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Search by name, reg number, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card className="overflow-x-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Registered Students</CardTitle>
            <CardDescription>
              {filteredStudents.length} of {students.length} students
            </CardDescription>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading students...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No students found
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredStudents.map(student => {
                const isVerified = student.exam_status === "started";

                return (
                  <div
                    key={student.id}
                    className={`p-4 border rounded-lg flex items-center justify-between ${
                      isVerified ? "bg-green-50 border-green-200" : "bg-muted/30"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold">{student.full_name}</div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="font-mono">Reg: {student.registration_number}</div>
                        <div>Phone: {student.phone}</div>
                        {student.batch && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5" />
                            {student.batch.title}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-4">
                      {isVerified ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div className="text-sm">
                            <div className="font-semibold text-green-700">Verified</div>
                            {student.verified_at && (
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(student.verified_at), "HH:mm")}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50">
                          Pending
                        </Badge>
                      )}

                      <Button
                        onClick={() => {
                          setSelectedStudent(student);
                          setVerificationDialog(true);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        {isVerified ? "Update" : "Verify"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      <Dialog open={verificationDialog} onOpenChange={setVerificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Student Presence</DialogTitle>
            <DialogDescription>
              Mark student as present or absent on exam day
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Student Name</label>
                  <div className="text-lg font-semibold">{selectedStudent.full_name}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Registration Number</label>
                  <div className="font-mono">{selectedStudent.registration_number}</div>
                </div>
                {selectedStudent.batch && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Batch</label>
                    <div>{selectedStudent.batch.title}</div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm">Is this student present for the exam?</p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => verifyStudent(true)}
                    disabled={verifying}
                    className="flex-1 gap-2"
                    variant="default"
                  >
                    {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    Yes, Mark Present
                  </Button>
                  <Button
                    onClick={() => verifyStudent(false)}
                    disabled={verifying}
                    className="flex-1 gap-2"
                    variant="outline"
                  >
                    {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    No, Mark Absent
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR scanner dialog */}
      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
            <DialogDescription>Point your camera at the student's admit slip QR code.</DialogDescription>
          </DialogHeader>
          <div className="w-full bg-black rounded-lg overflow-hidden relative">
            <video 
              ref={videoRef}
              style={{ 
                width: "100%", 
                height: "400px",
                objectFit: "cover",
                display: "block"
              }}
              autoPlay
              muted
              playsInline
              webkit-playsinline="true"
            />
            <div className="absolute inset-0 border-2 border-yellow-400 pointer-events-none rounded-lg" 
              style={{
                backgroundImage: "linear-gradient(0deg, rgba(255, 224, 0, 0.1) 1px, transparent 1px)",
                backgroundSize: "100% 20px",
                opacity: 0.3
              }}
            />
          </div>
          <div className="text-xs text-muted-foreground text-center">
            Align the QR code within the frame. Scanning...
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
