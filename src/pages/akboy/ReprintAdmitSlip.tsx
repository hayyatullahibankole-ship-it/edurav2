import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface Registration {
  id: string;
  registration_number: string;
  full_name: string;
  phone: string;
  email: string | null;
  subjects: any[];
  mode: string;
  batch_id: string | null;
  exam_status: string;
  batch?: {
    id: string;
    title: string;
    exam_date: string;
    exam_venue: string;
  };
}

export default function ReprintAdmitSlip() {
  const [searchParams] = useSearchParams();
  const regParam = searchParams.get("reg") || "";
  const [registrationNumber, setRegistrationNumber] = useState(regParam);
  const [loading, setLoading] = useState(false);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async (): Promise<boolean> => {
    // when triggered via query param, we don't want to call the RPC twice so
    // guard against being invoked automatically and then manually again. the
    // effect below only fires once on mount.
    if (!registrationNumber.trim()) {
      setError("Please enter your registration number");
      return false;
    }

    setLoading(true);
    setError(null);
    setRegistration(null);

    try {
      // use a security-definer RPC so that anonymous users can lookup a
      // registration by number without RLS blocking the row. the query above
      // used to hit RLS and return PGRST116 even when the record existed.
      const { data, error: rpcError } = await supabase
        .rpc("get_registration_for_admit", {
          p_registration_number: registrationNumber.trim().toUpperCase(),
        });

      if (rpcError) {
        // same message as before so users don't notice the internal change
        setError(
          rpcError.code === "PGRST116" || rpcError.code === "PGRST109"
            ? "Registration number not found. Please check and try again."
            : rpcError.message
        );
        return false;
      }

      if (!data) {
        setError("Registration number not found. Please check and try again.");
        return false;
      }

      // the rpc return type is a loose json record, so cast it to our
      // component-friendly shape. we already defined it above.
      setRegistration(data as unknown as Registration);
      toast({ title: "Registration found", description: "Your admit slip is ready to download" });
      return true;
    } catch (error: any) {
      setError(error.message || "An error occurred");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const downloadAdmitSlip = () => {
    if (!registration) return;

    const examDate = registration.batch?.exam_date
      ? format(new Date(registration.batch.exam_date), "MMMM dd, yyyy HH:mm")
      : "To be announced";
    const examVenue = registration.batch?.exam_venue || "To be announced";
    const batchTitle = registration.batch?.title || "Your Assigned Batch";

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AKBOY Mock Exam Admit Slip - ${registration.registration_number}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      height: 100%;
    }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .container {
      max-width: 650px;
      width: 100%;
    }
    .slip {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    }
    .header {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: white;
      padding: 32px 24px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
      background-size: 20px 20px;
      opacity: 0.5;
    }
    .header > * {
      position: relative;
      z-index: 1;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 800;
      margin-bottom: 4px;
      letter-spacing: -0.5px;
    }
    .header .subtitle {
      font-size: 13px;
      opacity: 0.95;
      margin-bottom: 4px;
    }
    .header .subtext {
      font-size: 12px;
      opacity: 0.85;
    }
    .content {
      padding: 32px;
    }
    .reg-box {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 3px dashed #f97316;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin-bottom: 24px;
    }
    .reg-number {
      font-size: 32px;
      font-weight: 900;
      font-family: 'Courier New', monospace;
      color: #ea580c;
      letter-spacing: 3px;
    }
    .reg-label {
      font-size: 12px;
      text-transform: uppercase;
      color: #92400e;
      font-weight: 600;
      margin-top: 8px;
    }
    .student-name {
      font-size: 22px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 24px;
      text-align: center;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 16px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .info-item {
      background: #f9fafb;
      padding: 14px;
      border-radius: 8px;
      border-left: 4px solid #f97316;
    }
    .info-label {
      font-size: 11px;
      text-transform: uppercase;
      color: #6b7280;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .info-value {
      font-size: 15px;
      font-weight: 600;
      color: #1f2937;
    }
    .info-value.large {
      font-size: 18px;
    }
    .batch-section {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border: 2px solid #3b82f6;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
    }
    .batch-title {
      font-size: 13px;
      text-transform: uppercase;
      color: #1e40af;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .batch-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .batch-item {
      background: white;
      padding: 12px;
      border-radius: 6px;
    }
    .batch-item-label {
      font-size: 10px;
      text-transform: uppercase;
      color: #6b7280;
      font-weight: 600;
    }
    .batch-item-value {
      font-size: 14px;
      font-weight: 600;
      color: #1e40af;
      margin-top: 4px;
    }
    .subjects-section {
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 13px;
      text-transform: uppercase;
      color: #374151;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .subjects {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 10px;
    }
    .subject-badge {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: white;
      padding: 10px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
    }
    .important-note {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 14px;
      border-radius: 6px;
      margin: 24px 0;
      font-size: 12px;
      color: #92400e;
      line-height: 1.5;
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
    }
    .footer-text {
      font-size: 11px;
      color: #6b7280;
      line-height: 1.6;
    }
    .footer-text strong {
      color: #1f2937;
    }
    .print-date {
      font-size: 10px;
      color: #9ca3af;
      margin-top: 12px;
      text-align: right;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        max-width: 100%;
      }
      .slip {
        box-shadow: none;
        border-radius: 0;
      }
      .print-date {
        display: none;
      }
    }
    @media (max-width: 600px) {
      .info-grid,
      .batch-details,
      .subjects {
        grid-template-columns: 1fr;
      }
      .header h1 {
        font-size: 24px;
      }
      .reg-number {
        font-size: 24px;
      }
      .content {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="slip">
      <div class="header">
        <h1>AKBOY MOCK EXAM</h1>
        <div class="subtitle">Admit Slip / Entry Permit</div>
        <div class="subtext">Advanced CBT Learning Platform</div>
      </div>

      <div class="content">
        <div class="reg-box">
          <div class="reg-number">${registration.registration_number}</div>
          <div class="reg-label">Registration Number</div>
        </div>

        <!-- QR code so admins can scan during exam day -->
        <div class="text-center mb-6">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
            registration.registration_number
          )}" alt="QR code" />
          <div class="text-xs text-muted-foreground mt-2">Scan to verify registration</div>
        </div>

        <div class="student-name">${registration.full_name}</div>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Contact</div>
            <div class="info-value">${registration.phone}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Exam Mode</div>
            <div class="info-value">${registration.mode.charAt(0).toUpperCase() + registration.mode.slice(1)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email</div>
            <div class="info-value" style="font-size: 12px; word-break: break-all;">${registration.email || 'Not provided'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Status</div>
            <div class="info-value">${registration.exam_status.charAt(0).toUpperCase() + registration.exam_status.slice(1)}</div>
          </div>
        </div>

        <div class="batch-section">
          <div class="batch-title">📅 Exam Schedule</div>
          <div class="batch-details">
            <div class="batch-item">
              <div class="batch-item-label">Batch</div>
              <div class="batch-item-value">${batchTitle}</div>
            </div>
            <div class="batch-item">
              <div class="batch-item-label">Exam Date & Time</div>
              <div class="batch-item-value">${examDate}</div>
            </div>
            <div class="batch-item" style="grid-column: 1 / -1;">
              <div class="batch-item-label">Exam Venue</div>
              <div class="batch-item-value">${examVenue}</div>
            </div>
          </div>
        </div>

        <div class="subjects-section">
          <div class="section-title">📚 Selected Subjects</div>
          <div class="subjects">
            ${registration.subjects?.map((s: any) => `<div class="subject-badge">${s.name}</div>`).join('')}
          </div>
        </div>

        <div class="important-note">
          <strong>⚠️ Important:</strong> This admit slip is your proof of registration. Please bring a valid form of identification on exam day. Arrive at least 30 minutes before your scheduled exam time. Check the exam venue and date carefully.
        </div>

        <div class="footer">
          <div class="footer-text">
            <strong>Instructions for Exam Day:</strong>
            <br>✓ Arrive early (30 minutes before start time)
            <br>✓ Bring valid ID and this admit slip
            <br>✓ Use registered email for login
            <br>✓ Ensure stable internet connection
            <br><br>For support: contact@akboy.ng
          </div>
          <div class="print-date">
            Printed on: ${format(new Date(), "MMMM dd, yyyy HH:mm:ss")}
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Auto-open print dialog when loaded
      try {
        window.print();
      } catch(e) {
        console.log('Print dialog failed, user can use browser print');
      }
    });
  </script>
</body>
</html>`;

    const printWindow = window.open("", "", "width=800,height=1000");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // automatically search (and print) if the reg query parameter was provided
  useEffect(() => {
    if (regParam) {
      handleSearch().then(found => {
        if (found) {
          // short delay so the registration state has updated and user can see
          // the toast before the print window pops up
          setTimeout(downloadAdmitSlip, 300);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">AKBOY Mock Exam</h1>
          <p className="text-lg text-slate-600">Reprint Your Admit Slip</p>
        </div>

        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle>Enter Your Registration Number</CardTitle>
            <CardDescription>
              Find and download your admit slip with updated exam date and batch information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Registration Number</label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., AKBOY2026001"
                  value={registrationNumber}
                  onChange={(e) => {
                    setRegistrationNumber(e.target.value.toUpperCase());
                    setError(null);
                  }}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="text-lg font-mono"
                  autoFocus
                />
                <Button onClick={handleSearch} disabled={loading || !registrationNumber.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                You received this number when you registered for the exam
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {registration && (
          <div className="space-y-6 mt-8">
            {/* Registration Details */}
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <CheckCircle className="h-5 w-5" />
                  Registration Found
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase">Full Name</label>
                    <div className="text-xl font-bold text-slate-900 mt-1">{registration.full_name}</div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase">Registration #</label>
                    <div className="text-xl font-mono font-bold text-slate-900 mt-1">{registration.registration_number}</div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase">Phone</label>
                    <div className="text-lg text-slate-900 mt-1">{registration.phone}</div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase">Exam Mode</label>
                    <div className="mt-1">
                      <Badge variant={registration.mode === "virtual" ? "secondary" : "outline"}>
                        {registration.mode.charAt(0).toUpperCase() + registration.mode.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {registration.batch && (
                  <div className="border-t pt-4 mt-4">
                    <label className="text-xs font-semibold text-slate-600 uppercase block mb-3">Exam Details</label>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                      <div>
                        <span className="text-sm font-semibold text-slate-700">Batch: </span>
                        <span className="text-sm text-slate-900">{registration.batch.title}</span>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-700">Exam Date: </span>
                        <span className="text-sm text-slate-900">
                          {format(new Date(registration.batch.exam_date), "MMMM dd, yyyy HH:mm")}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-700">Venue: </span>
                        <span className="text-sm text-slate-900">
                          {registration.batch.exam_venue || "TBD"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {registration.subjects && registration.subjects.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <label className="text-xs font-semibold text-slate-600 uppercase block mb-2">Subjects</label>
                    <div className="flex flex-wrap gap-2">
                      {registration.subjects.map((subject: any, idx: number) => (
                        <Badge key={idx} className="bg-orange-500 hover:bg-orange-600">
                          {subject.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Download Button */}
            <Button
              onClick={downloadAdmitSlip}
              size="lg"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Admit Slip
            </Button>

            {/* Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm text-blue-900">
                  <p>
                    <strong>✓</strong> Your admit slip will be automatically opened for printing
                  </p>
                  <p>
                    <strong>✓</strong> You can save it as PDF or print it directly from your browser
                  </p>
                  <p>
                    <strong>✓</strong> The slip contains your exam date, batch, and venue information
                  </p>
                  <p>
                    <strong>✓</strong> Bring this slip and a valid ID on exam day
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
