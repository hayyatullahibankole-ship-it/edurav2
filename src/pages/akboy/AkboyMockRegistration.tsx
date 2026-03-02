import { useState, useEffect } from "react";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import { BookOpen, CheckCircle2, Clock, MapPin, Phone, User, Mail, Loader2, Download, GraduationCap, School } from "lucide-react";

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
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const { isAkboy } = useDomainDetection();
  const basePath = isAkboy ? "" : "/akboy";

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    mode: "" as string,
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
        try { settingsMap[s.key] = typeof s.value === 'string' ? JSON.parse(s.value) : s.value; }
        catch { settingsMap[s.key] = s.value; }
      }
    }
    setSettings(settingsMap);
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
      const { data: regNum, error: regError } = await supabase.rpc("generate_mock_reg_number" as any);
      if (regError) throw regError;

      const subjects = getSelectedSubjectsWithEnglish().map(s => ({
        id: s.id, name: s.name, questions: s.questions,
      }));

      let assignedBatch: any = null;
      const { getOrCreateBatch } = await import("@/utils/mockBatch");
      assignedBatch = await getOrCreateBatch(supabase, settings);

      const insertPayload: any = {
        registration_number: regNum,
        full_name: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        mode: form.mode,
        subjects,
        batch_id: assignedBatch?.id || null,
      };

      if (form.mode === 'virtual') insertPayload.payment_status = 'waived';

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

  const downloadAdmitSlip = () => {
    if (!result) return;

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AKBOY Mock Exam Admit Slip - ${result.registrationNumber}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Segoe UI','Arial',sans-serif; padding:20px; background:#f8fafc; }
    .container { max-width:600px; margin:0 auto; }
    .slip { background:white; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
    .header { text-align:center; background:linear-gradient(135deg,#f97316,#f59e0b); color:white; padding:24px 20px; }
    .header h1 { font-size:22px; margin-bottom:4px; }
    .header p { font-size:13px; opacity:0.9; }
    .content { padding:24px; }
    .reg-box { text-align:center; background:#fff7ed; padding:16px; border-radius:12px; border:2px dashed #fdba74; margin:16px 0; }
    .reg-box .number { font-size:28px; font-weight:800; font-family:monospace; color:#ea580c; letter-spacing:2px; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px; }
    .info-item label { display:block; font-size:11px; color:#9ca3af; text-transform:uppercase; }
    .info-item span { display:block; font-size:14px; font-weight:600; color:#1f2937; }
    .subjects { display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; }
    .subject-badge { background:#f97316; color:white; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:500; }
    .footer { border-top:1px solid #e5e7eb; padding:16px 24px; text-align:center; font-size:11px; color:#9ca3af; }
    @media print { body { background:white; } .slip { box-shadow:none; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="slip">
      <div class="header">
        <h1>AKBOY Creative Hub</h1>
        <p>JAMB Mock Examination Admit Slip</p>
      </div>
      <div class="content">
        <div class="reg-box">
          <div style="font-size:12px;color:#9ca3af;margin-bottom:4px;">REGISTRATION NUMBER</div>
          <div class="number">${result.registrationNumber}</div>
        </div>
        <div class="info-grid">
          <div class="info-item"><label>Full Name</label><span>${result.fullName}</span></div>
          <div class="info-item"><label>Mode</label><span style="text-transform:capitalize;">${result.mode}</span></div>
          ${result.batchTitle ? `<div class="info-item"><label>Batch</label><span>${result.batchTitle}</span></div>` : ''}
          ${result.examDate ? `<div class="info-item"><label>Date</label><span>${new Date(result.examDate).toLocaleString()}</span></div>` : ''}
        </div>
        <div>
          <div style="font-size:12px;color:#9ca3af;text-transform:uppercase;margin-bottom:8px;font-weight:600;">Subjects</div>
          <div class="subjects">
            ${result.subjects.map((s: any) => `<span class="subject-badge">${s.name} (${s.questions}Q)</span>`).join('')}
          </div>
        </div>
      </div>
      <div class="footer">
        <p>For exam updates: www.akboys.ng | Contact: 08101466977</p>
        <p style="margin-top:4px;">Generated: ${new Date().toLocaleString()}</p>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AKBOY_Admit_Slip_${result.registrationNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Admit slip downloaded!");
  };

  const fee = settings.registration_fee || "1000";
  const paymentAccount = settings.payment_account || {};

  return (
    <AkboyLayout title="Mock Exam Registration" description="Register for the AKBOY JAMB Mock Examination">
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Hero Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-medium">
              <GraduationCap className="w-4 h-4" />
              JAMB Mock CBT
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Mock Exam Registration</h1>
            <p className="text-muted-foreground">180 questions • 120 minutes • JAMB-style scoring</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step >= s ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                {s < 3 && <div className={`w-12 h-1 rounded-full transition-all ${step > s ? 'bg-orange-500' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-8 text-xs text-muted-foreground">
            <span className={step >= 1 ? 'text-orange-600 font-semibold' : ''}>Details & Subjects</span>
            <span className={step >= 2 ? 'text-orange-600 font-semibold' : ''}>Payment</span>
            <span className={step >= 3 ? 'text-orange-600 font-semibold' : ''}>Confirmation</span>
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-500" />
                  Registration Details
                </CardTitle>
                <CardDescription>Fill in your details and select subjects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
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
                  <Label className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Exam Mode *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {['virtual', 'physical'].map(mode => (
                      <button key={mode} type="button"
                        onClick={() => setForm(p => ({ ...p, mode }))}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          form.mode === mode
                            ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}>
                        <div className="font-semibold capitalize">{mode}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {mode === 'virtual' ? 'Take exam online' : 'Exam at venue'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Select Subjects (English + 3 others)
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AVAILABLE_SUBJECTS.map(subject => {
                      const isSelected = subject.locked || form.selectedSubjects.includes(subject.id);
                      return (
                        <button key={subject.id} type="button"
                          onClick={() => toggleSubject(subject.id)}
                          disabled={subject.locked}
                          className={`p-3 rounded-xl border-2 text-left text-sm transition-all ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50 text-orange-700'
                              : 'border-gray-200 hover:border-orange-300'
                          } ${subject.locked ? 'cursor-not-allowed opacity-80' : ''}`}>
                          <div className="flex items-center gap-2">
                            <Checkbox checked={isSelected} disabled={subject.locked} className="pointer-events-none" />
                            <span className="font-medium text-xs leading-tight">{subject.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {subject.questions}Q
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
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 font-semibold text-base"
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
                      handleSubmit();
                      return;
                    }
                    setStep(2);
                  }}>
                  {form.mode === 'virtual' ? 'Complete Registration' : 'Continue to Payment'}
                </Button>

                <div className="text-center">
                  <Link to="/school-registration" className="inline-flex items-center gap-2 text-sm text-orange-600 font-semibold hover:underline">
                    <School className="w-4 h-4" /> Register as a School
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>Registration fee: ₦{Number(fee).toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-orange-200 bg-orange-50 rounded-xl">
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
                  <Alert className="border-blue-200 bg-blue-50 rounded-xl">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Physical Mode:</strong> Bring your payment receipt to the exam venue.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm border">
                  <h4 className="font-semibold">Summary</h4>
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
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">Back</Button>
                  <Button onClick={handleSubmit} disabled={loading} className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 font-semibold">
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Registering...</> : "Complete Registration"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && result && (
            <div className="space-y-4">
              <Card className="shadow-lg border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-center py-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <img src="/akboy-logo.png" alt="AKBOY" className="w-10 h-10 rounded-full bg-white p-1" />
                    <CardTitle className="text-xl">AKBOY Mock Examination</CardTitle>
                  </div>
                  <CardDescription className="text-orange-100">Admit Slip / Confirmation</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <p className="text-lg font-bold text-green-700">Registration Successful!</p>
                  </div>

                  <div className="bg-orange-50 border-2 border-dashed border-orange-300 rounded-xl p-5 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Your Registration Number</p>
                    <p className="text-3xl font-extrabold text-orange-600 tracking-widest mt-1">{result.registrationNumber}</p>
                    <p className="text-xs text-muted-foreground mt-2">Keep this number safe for exam access and results</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase">Full Name</p>
                      <p className="font-semibold">{result.fullName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase">Mode</p>
                      <p className="font-semibold capitalize">{result.mode}</p>
                    </div>
                    {result.batchTitle && (
                      <div>
                        <p className="text-muted-foreground text-xs uppercase">Batch</p>
                        <p className="font-semibold">{result.batchTitle}</p>
                      </div>
                    )}
                    {result.examDate && (
                      <div>
                        <p className="text-muted-foreground text-xs uppercase">Exam Date</p>
                        <p className="font-semibold">{new Date(result.examDate).toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-2">Subjects</p>
                    <div className="flex flex-wrap gap-2">
                      {result.subjects.map((s: any) => (
                        <Badge key={s.id} className="bg-orange-100 text-orange-700 border-orange-200 px-3 py-1">
                          {s.name} ({s.questions}Q)
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl text-sm space-y-1 border">
                    <p className="font-semibold">📋 Exam Instructions:</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Total: 180 questions (English: 60, Others: 40 each)</li>
                      <li>Duration: 120 minutes</li>
                      <li>Login at the exam portal with your registration number</li>
                      {result.mode === 'physical' && (
                        <>
                          <li><strong>Bring payment receipt to venue</strong></li>
                          {result.examVenue && <li>Venue: {result.examVenue}</li>}
                        </>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={downloadAdmitSlip} className="flex-1 h-12 font-semibold">
                  <Download className="w-4 h-4 mr-2" /> Download Admit Slip
                </Button>
                <Button
                  className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 font-semibold"
                  onClick={() => {
                    setStep(1);
                    setResult(null);
                    setForm({ fullName: "", phone: "", email: "", mode: "", selectedSubjects: [] });
                  }}>
                  Register Another
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AkboyLayout>
  );
}
