import { useState, useEffect } from "react";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookOpen, CheckCircle2, FileText, Clock, MapPin, Phone, User, Mail, Loader2, Download, Printer } from "lucide-react";

const AVAILABLE_SUBJECTS = [
  { id: "f01354df-283f-4069-a750-dba247a6bf97", name: "English Language", locked: true, questions: 60 },
  { id: "d9bbd411-3623-4553-937c-cfe55a7ac82b", name: "Mathematics", locked: false, questions: 40 },
  { id: "d165bc08-818b-403d-bd31-f2c1965a2bfb", name: "Physics", locked: false, questions: 40 },
  { id: "76f33a39-4903-4336-84da-17d082f99498", name: "Chemistry", locked: false, questions: 40 },
  { id: "ce4023fd-9a2c-4065-9b83-8b5734f895a0", name: "Biology", locked: false, questions: 40 },
  { id: "ed819500-1ca7-4067-832b-13161a598a07", name: "Economics", locked: false, questions: 40 },
  { id: "2ec36942-176e-4fad-b451-c84c25ad30ec", name: "Government", locked: false, questions: 40 },
  { id: "be93668a-3fe1-4410-8062-6a1fcc8fd9d1", name: "Literature in English", locked: false, questions: 40 },
  { id: "2035b922-b680-40a7-8fc1-d7cd945d303b", name: "Commerce", locked: false, questions: 40 },
  { id: "f76a7b84-7c85-4d81-8aa9-fc406668a965", name: "Accounting", locked: false, questions: 40 },
  { id: "d482c961-afec-4078-919b-d52dee4b91d3", name: "Geography", locked: false, questions: 40 },
  { id: "fad0bc61-15f1-4b95-9f93-e3ff39bf48e4", name: "Christian Religious Studies", locked: false, questions: 40 },
  { id: "dab9e461-f4f4-4eb8-a070-6364344339ca", name: "Agricultural Science", locked: false, questions: 40 },
  { id: "3b6a9813-585f-403f-88d0-13b9e1576070", name: "History", locked: false, questions: 40 },
  { id: "dd65ca96-b892-4b14-93ea-994c921ea826", name: "Further Mathematics", locked: false, questions: 40 },
];

interface RegistrationResult {
  registrationNumber: string;
  fullName: string;
  subjects: any[];
  mode: string;
  batchTitle?: string;
  examDate?: string;
  examVenue?: string;
}

export default function AkboyMockRegistration() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [batches, setBatches] = useState<any[]>([]);
  const [result, setResult] = useState<RegistrationResult | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    mode: "" as string,
    batchId: "" as string,
    selectedSubjects: [] as string[],
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data: settingsData } = await supabase
      .from("mock_settings" as any)
      .select("key, value");
    
    const settingsMap: any = {};
    if (settingsData) {
      for (const s of settingsData as any[]) {
        try {
          settingsMap[s.key] = typeof s.value === 'string' ? JSON.parse(s.value) : s.value;
        } catch {
          settingsMap[s.key] = s.value;
        }
      }
    }
    setSettings(settingsMap);

    const { data: batchData } = await supabase
      .from("mock_batches" as any)
      .select("*")
      .eq("is_active", true);
    
    if (batchData) setBatches(batchData as any[]);
  };

  const toggleSubject = (subjectId: string) => {
    const subject = AVAILABLE_SUBJECTS.find(s => s.id === subjectId);
    if (subject?.locked) return;

    setForm(prev => {
      const selected = prev.selectedSubjects.includes(subjectId)
        ? prev.selectedSubjects.filter(id => id !== subjectId)
        : prev.selectedSubjects.length < 3
          ? [...prev.selectedSubjects, subjectId]
          : prev.selectedSubjects;
      return { ...prev, selectedSubjects: selected };
    });
  };

  const getSelectedSubjectsWithEnglish = () => {
    const english = AVAILABLE_SUBJECTS.find(s => s.locked)!;
    const others = form.selectedSubjects.map(id => AVAILABLE_SUBJECTS.find(s => s.id === id)!);
    return [english, ...others];
  };

  const handleSubmit = async () => {
    if (!form.fullName.trim() || !form.phone.trim() || !form.mode) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (form.selectedSubjects.length !== 3) {
      toast.error("Please select exactly 3 subjects (English is automatic)");
      return;
    }

    setLoading(true);
    try {
      // Generate registration number
      const { data: regNum, error: regError } = await supabase.rpc("generate_mock_reg_number" as any);
      if (regError) throw regError;

      const subjects = getSelectedSubjectsWithEnglish().map(s => ({
        id: s.id,
        name: s.name,
        questions: s.questions,
      }));

      // Assign or create a batch automatically when none selected
      let assignedBatch: any = null;
      let targetBatchId = form.batchId || null;
      if (!targetBatchId) {
        // Try to find an active batch with available capacity
        const { data: activeBatches } = await supabase
          .from("mock_batches" as any)
          .select("*")
          .eq("is_active", true)
          .order("exam_date", { ascending: true });

        const BATCH_CAPACITY = 30;
        const SLOTS_PER_DAY = 3;
        const SLOT_DURATION_MIN = 150; // 2h30 = 150 minutes
        const BREAK_MIN = 30;

        if (activeBatches && activeBatches.length > 0) {
          // Check counts per batch
          for (const b of activeBatches) {
            if (!b.id) continue;
            const { count, error: cErr } = await supabase
              .from("mock_registrations" as any)
              .select("id", { count: "exact", head: false })
              .eq("batch_id", b.id);
            const regCount = (count as number) || 0;
            if (regCount < BATCH_CAPACITY) {
              assignedBatch = b;
              targetBatchId = b.id;
              break;
            }
          }
        }

        // If still no available batch, create the next scheduled batch
        if (!targetBatchId) {
          // Determine next start slot based on latest batch or default start date April 2
          const now = new Date();
          const year = now.getFullYear();
          const defaultStart = new Date(year, 3, 2, 9, 0, 0); // April is month 3 (0-indexed)

          // Find latest exam_date among existing batches
          let latestDate: Date | null = null;
          if (activeBatches && activeBatches.length > 0) {
            for (const b of activeBatches) {
              if (b.exam_date) {
                const d = new Date(b.exam_date);
                if (!latestDate || d > latestDate) latestDate = d;
              }
            }
          }

          let nextStart: Date;
          if (!latestDate) {
            nextStart = defaultStart;
          } else {
            // Count how many batches are on latestDate's day
            const sameDayBatches = (activeBatches || []).filter((b: any) => b.exam_date && new Date(b.exam_date).toDateString() === latestDate!.toDateString());
            if (sameDayBatches.length < SLOTS_PER_DAY) {
              // schedule after latestDate by slot interval
              nextStart = new Date(latestDate.getTime() + (SLOT_DURATION_MIN + BREAK_MIN) * 60 * 1000);
            } else {
              // next day at 9:00
              nextStart = new Date(latestDate);
              nextStart.setDate(nextStart.getDate() + 1);
              nextStart.setHours(9, 0, 0, 0);
            }
          }

          const title = `Batch ${nextStart.toLocaleDateString()} ${nextStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
          const { data: newBatch, error: insErr } = await supabase
            .from("mock_batches" as any)
            .insert({ title, exam_date: nextStart.toISOString(), exam_venue: settings.default_exam_venue || null } as any)
            .select()
            .single();
          if (insErr) throw insErr;
          assignedBatch = newBatch;
          targetBatchId = newBatch.id;
        }
      } else {
        assignedBatch = batches.find(b => b.id === targetBatchId) || null;
      }

      const insertPayload: any = {
        registration_number: regNum,
        full_name: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        mode: form.mode,
        subjects,
        batch_id: targetBatchId || null,
      };

      // Virtual mode: waive payment
      if (form.mode === 'virtual') {
        insertPayload.payment_status = 'waived';
      }

      const { error: insertError } = await supabase
        .from("mock_registrations" as any)
        .insert(insertPayload as any);

      if (insertError) throw insertError;

      setResult({
        registrationNumber: regNum as string,
        fullName: form.fullName.trim(),
        subjects,
        mode: form.mode,
        batchTitle: assignedBatch?.title,
        examDate: assignedBatch?.exam_date,
        examVenue: assignedBatch?.exam_venue,
      });
      setStep(3);
      toast.success("Registration successful!");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const printAdmitSlip = () => {
    window.print();
  };

  const fee = settings.registration_fee || "1000";
  const paymentAccount = settings.payment_account || {};

  return (
    <AkboyLayout title="Mock Exam Registration" description="Register for the AKBOY JAMB Mock Examination">
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                {s < 3 && <div className={`w-16 h-1 ${step > s ? 'bg-orange-500' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-8 mb-8 text-xs text-muted-foreground">
            <span className={step >= 1 ? 'text-orange-600 font-semibold' : ''}>Details & Subjects</span>
            <span className={step >= 2 ? 'text-orange-600 font-semibold' : ''}>Payment</span>
            <span className={step >= 3 ? 'text-orange-600 font-semibold' : ''}>Confirmation</span>
          </div>

          {/* Step 1: Details & Subject Selection */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-500" />
                  AKBOY JAMB Mock Exam Registration
                </CardTitle>
                <CardDescription>
                  Register for the CBT Mock Examination. Total: 180 questions in 120 minutes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="fullName" className="pl-10" placeholder="Enter your full name"
                          value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="phone" className="pl-10" placeholder="08012345678"
                          value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email (Optional)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" className="pl-10" placeholder="your@email.com"
                        value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                    </div>
                  </div>
                </div>

                {/* Mode */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Exam Mode *</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {['virtual', 'physical'].map(mode => (
                      <button key={mode} type="button"
                        onClick={() => setForm(p => ({ ...p, mode }))}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                          form.mode === mode
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-border hover:border-orange-300'
                        }`}>
                        <div className="font-semibold capitalize">{mode}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {mode === 'virtual' ? 'Take exam online from anywhere' : 'Take exam at the physical venue'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Batch Selection */}
                {batches.length > 0 && (
                  <div className="space-y-2">
                    <Label>Exam Batch (Optional)</Label>
                    <Select value={form.batchId} onValueChange={v => setForm(p => ({ ...p, batchId: v === '__none' ? '' : v }))}>
                      <SelectTrigger><SelectValue placeholder="Select a batch" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">No specific batch</SelectItem>
                        {batches.map(b => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.title} {b.exam_date ? `(${new Date(b.exam_date).toLocaleDateString()})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Subject Selection */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Select Subjects (English + 3 others)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AVAILABLE_SUBJECTS.map(subject => {
                      const isSelected = subject.locked || form.selectedSubjects.includes(subject.id);
                      return (
                        <button key={subject.id} type="button"
                          onClick={() => toggleSubject(subject.id)}
                          disabled={subject.locked}
                          className={`p-3 rounded-lg border text-left text-sm transition-all ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50 text-orange-700'
                              : 'border-border hover:border-orange-300'
                          } ${subject.locked ? 'cursor-not-allowed opacity-80' : ''}`}>
                          <div className="flex items-center gap-2">
                            <Checkbox checked={isSelected} disabled={subject.locked} className="pointer-events-none" />
                            <span className="font-medium text-xs leading-tight">{subject.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {subject.questions} questions
                            {subject.locked && <Badge variant="outline" className="ml-1 text-[10px] px-1">Required</Badge>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selected: {form.selectedSubjects.length}/3 subjects (+ English Language)
                  </p>
                </div>

                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  onClick={() => {
                    if (!form.fullName.trim() || !form.phone.trim() || !form.mode) {
                      toast.error("Please fill all required fields");
                      return;
                    }
                    if (form.selectedSubjects.length !== 3) {
                      toast.error("Select exactly 3 subjects");
                      return;
                    }
                    if (form.mode === 'virtual') {
                      // Virtual mode does not require payment — register immediately
                      handleSubmit();
                      return;
                    }
                    setStep(2);
                  }}>
                  {form.mode === 'virtual' ? 'Complete Registration' : 'Continue to Payment'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>Registration fee: ₦{Number(fee).toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertDescription className="text-orange-800">
                    <p className="font-semibold mb-2">Make payment to:</p>
                    <div className="space-y-1 text-sm">
                      <p><strong>Bank:</strong> {paymentAccount.bank || 'Access Bank'}</p>
                      <p><strong>Account Number:</strong> {paymentAccount.account_number || '0123456789'}</p>
                      <p><strong>Account Name:</strong> {paymentAccount.account_name || 'AKBOY Creative Hub'}</p>
                      <p><strong>Amount:</strong> ₦{Number(fee).toLocaleString()}</p>
                    </div>
                  </AlertDescription>
                </Alert>

                {form.mode === 'physical' && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Physical Mode:</strong> Please bring your payment receipt to the exam venue on the day of the exam.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                  <h4 className="font-semibold">Registration Summary</h4>
                  <p><strong>Name:</strong> {form.fullName}</p>
                  <p><strong>Phone:</strong> {form.phone}</p>
                  <p><strong>Mode:</strong> <span className="capitalize">{form.mode}</span></p>
                  <p><strong>Subjects:</strong></p>
                  <div className="flex flex-wrap gap-1 ml-4">
                    {getSelectedSubjectsWithEnglish().map(s => (
                      <Badge key={s.id} variant="secondary" className="text-xs">{s.name}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                  <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600">
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Registering...</> : "Complete Registration"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Confirmation / Admit Slip */}
          {step === 3 && result && (
            <div className="space-y-6" id="admit-slip">
              <Card className="border-2 border-orange-300">
                <CardHeader className="bg-orange-500 text-white text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <img src="/akboy-logo.png" alt="AKBOY" className="w-10 h-10 rounded-full bg-white p-1" />
                    <CardTitle className="text-xl">AKBOY Mock Examination</CardTitle>
                  </div>
                  <CardDescription className="text-orange-100">Admit Slip / Confirmation</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="text-center mb-4">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="text-lg font-bold text-green-700">Registration Successful!</p>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground">Your Registration Number</p>
                    <p className="text-3xl font-bold text-orange-600 tracking-wider">{result.registrationNumber}</p>
                    <p className="text-xs text-muted-foreground mt-1">Keep this number safe. You'll need it to access the exam and check results.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Full Name</p>
                      <p className="font-semibold">{result.fullName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Mode</p>
                      <p className="font-semibold capitalize">{result.mode}</p>
                    </div>
                    {result.batchTitle && (
                      <div>
                        <p className="text-muted-foreground">Batch</p>
                        <p className="font-semibold">{result.batchTitle}</p>
                      </div>
                    )}
                    {result.examDate && (
                      <div>
                        <p className="text-muted-foreground">Exam Date</p>
                        <p className="font-semibold">{new Date(result.examDate).toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Subjects</p>
                    <div className="flex flex-wrap gap-2">
                      {result.subjects.map((s: any) => (
                        <Badge key={s.id} className="bg-orange-100 text-orange-700 border-orange-300">
                          {s.name} ({s.questions}Q)
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-muted p-3 rounded text-sm space-y-1">
                    <p className="font-semibold">📋 Exam Instructions:</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Total Questions: 180 (English: 60, Others: 40 each)</li>
                      <li>Duration: 120 minutes (2 hours)</li>
                      <li>Login at the exam portal using your registration number</li>
                      {result.mode === 'physical' && (
                        <>
                          <li><strong>Bring your payment receipt to the exam venue</strong></li>
                          {result.examVenue && <li>Venue: {result.examVenue}</li>}
                        </>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3 print:hidden">
                <Button variant="outline" onClick={printAdmitSlip} className="flex-1">
                  <Printer className="w-4 h-4 mr-2" /> Print Admit Slip
                </Button>
                <Button
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  onClick={() => {
                    setStep(1);
                    setResult(null);
                    setForm({ fullName: "", phone: "", email: "", mode: "", batchId: "", selectedSubjects: [] });
                  }}>
                  Register Another Student
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AkboyLayout>
  );
}
