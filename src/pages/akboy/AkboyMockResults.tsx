import { useState, useEffect } from "react";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import { Loader2, Search, Trophy, TrendingUp, TrendingDown, Download, AlertCircle, Clock, GraduationCap, School } from "lucide-react";
import { MockBrandBanner } from "@/components/MockBrandBanner";

export default function AkboyMockResults() {
  const [regNumber, setRegNumber] = useState("");
  const params = new URLSearchParams(window.location.search);
  const initialReg = params.get('reg') || "";
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);
  const { isAkboy } = useDomainDetection();
  const basePath = isAkboy ? "" : "/akboy";

  const checkResult = async (regNum?: string) => {
    const num = regNum || regNumber;
    if (!num.trim()) {
      toast.error("Please enter your registration number");
      return;
    }

    setLoading(true);
    setResultData(null);
    setStatus(null);

    try {
      const { data, error } = await supabase.rpc("check_mock_result" as any, {
        p_registration_number: num.trim().toUpperCase(),
      });

      if (error) throw error;

      const result = data as any;
      setStatus(result.status);

      if (result.status === "available") {
        setResultData(result);
      } else {
        toast.info(result.message);
      }
    } catch (error: any) {
      console.error("Error checking result:", error);
      toast.error("Failed to check result");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialReg) {
      setRegNumber(initialReg);
      checkResult(initialReg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialReg]);

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 75) return "bg-green-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const scoreColorHex = (score: number) => {
    if (score >= 75) return "#16a34a";
    if (score >= 50) return "#ca8a04";
    return "#dc2626";
  };
  const progressHex = (score: number) => {
    if (score >= 75) return "#22c55e";
    if (score >= 50) return "#eab308";
    return "#ef4444";
  };

  const downloadResultSlip = () => {
    if (!resultData) return;

    const subjectsHtml = (resultData.subject_scores || [])
      .map((s: any) => {
        const color = scoreColorHex(s.converted_score);
        const width = `${s.converted_score}%`;
        return `
          <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin-bottom:10px;background:#fafafa;">
            <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px;">
              <span style="font-weight:600;">${s.subject_name}</span>
              <span style="font-weight:bold;color:${color};">${s.converted_score}/100</span>
            </div>
            <div style="background:#e5e7eb;height:8px;border-radius:4px;overflow:hidden;">
              <div style="background:${progressHex(s.converted_score)};width:${width};height:100%;border-radius:4px;"></div>
            </div>
            <p style="font-size:12px;color:#6b7280;margin-top:6px;">${s.correct}/${s.total} correct answers</p>
          </div>`;
      })
      .join('');

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AKBOY Mock Exam Result Slip - ${resultData.registration_number}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Segoe UI','Arial',sans-serif; padding:20px; background:#f8fafc; }
    .container { max-width:600px; margin:0 auto; }
    .result-slip { background:white; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
    .header { text-align:center; background:linear-gradient(135deg,#f97316,#f59e0b); color:white; padding:24px 20px; }
    .header h1 { font-size:22px; margin-bottom:4px; }
    .header p { font-size:13px; opacity:0.9; }
    .content { padding:24px; }
    .score-box { text-align:center; background:linear-gradient(135deg,#fff7ed,#fefce8); padding:24px; border-radius:12px; border:1px solid #fed7aa; margin:16px 0; }
    .score-box .score { font-size:56px; font-weight:800; color:#ea580c; }
    .score-box .max { font-size:16px; color:#9ca3af; }
    .section-title { font-weight:700; color:#f97316; font-size:13px; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:12px; padding-bottom:8px; border-bottom:2px solid #fed7aa; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px; }
    .info-item label { display:block; font-size:11px; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px; }
    .info-item span { display:block; font-size:14px; font-weight:600; color:#1f2937; }
    .footer { border-top:1px solid #e5e7eb; padding:16px 24px; text-align:center; font-size:11px; color:#9ca3af; }
    @media print { body { background:white; } .result-slip { box-shadow:none; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="result-slip">
      <div class="header">
        <h1>AKBOY Creative Hub</h1>
        <p>JAMB Mock Examination Result Slip</p>
      </div>
      <div class="content">
        <div class="info-grid">
          <div class="info-item"><label>Full Name</label><span>${resultData.full_name}</span></div>
          <div class="info-item"><label>Reg Number</label><span style="font-family:monospace;letter-spacing:1px;">${resultData.registration_number}</span></div>
        </div>
        <div class="score-box">
          <div class="score">${resultData.total_score}</div>
          <div class="max">/ ${resultData.max_score}</div>
        </div>
        <div style="margin-top:20px;">
          <div class="section-title">Subject Breakdown</div>
          ${subjectsHtml}
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
    a.download = `AKBOY_Result_Slip_${resultData.registration_number}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Result slip downloaded!");
  };

  return (
    <AkboyLayout title="Mock Exam Results" description="Check your AKBOY JAMB Mock Exam results">
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Hero Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-medium">
              <GraduationCap className="w-4 h-4" />
              JAMB Mock CBT
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Result Portal</h1>
            <p className="text-muted-foreground">Enter your registration number to view your results</p>
          </div>

          {/* Search Card */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Input
                  placeholder="e.g., AKBM2600001"
                  value={regNumber}
                  onChange={e => setRegNumber(e.target.value.toUpperCase())}
                  className="text-center font-mono tracking-wider h-12 border-2 focus:border-orange-400 text-lg"
                  onKeyDown={e => e.key === "Enter" && checkResult()}
                />
                <Button onClick={() => checkResult()} disabled={loading} className="bg-orange-500 hover:bg-orange-600 h-12 px-6">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                </Button>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Need to register?</span>
                <Link to={`${basePath}/mock-registration`} className="text-orange-600 font-semibold hover:underline">Register Now</Link>
                <span className="text-muted-foreground mx-1">•</span>
                <a href="https://edura.space/#/school-registration" target="_blank" rel="noopener noreferrer" className="text-orange-600 font-semibold hover:underline inline-flex items-center gap-1">
                  <School className="w-3.5 h-3.5" /> Register as a School
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Status Messages */}
          {status === "not_found" && (
            <Card className="border-red-200 bg-red-50 shadow-sm">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-red-700 font-semibold text-lg">No Registration Found</p>
                <p className="text-sm text-red-600 mt-1">Please check your registration number and try again.</p>
              </CardContent>
            </Card>
          )}

          {status === "pending" && (
            <Card className="border-amber-200 bg-amber-50 shadow-sm">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-amber-500" />
                </div>
                <p className="text-amber-700 font-semibold text-lg">Result Being Processed</p>
                <p className="text-sm text-amber-600 mt-1">Your result is still being processed. Please check back later.</p>
              </CardContent>
            </Card>
          )}

          {status === "not_released" && (
            <Card className="border-orange-200 bg-orange-50 shadow-sm">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-orange-700 font-semibold text-lg">Results Not Yet Released</p>
                <p className="text-sm text-orange-600 mt-1">Results have not been released yet. Please check back later.</p>
              </CardContent>
            </Card>
          )}

          {/* Result Display */}
          {status === "available" && resultData && (
            <div className="space-y-4">
              <Card className="shadow-lg border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-center py-6">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <img src="/akboy-logo.png" alt="AKBOY" className="w-8 h-8 rounded-full bg-white p-0.5" />
                    <CardTitle className="text-lg">AKBOY Mock Examination Result</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Student Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Full Name</p>
                      <p className="font-bold text-lg">{resultData.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Reg Number</p>
                      <p className="font-bold text-lg font-mono">{resultData.registration_number}</p>
                    </div>
                  </div>

                  {/* Total Score */}
                  <div className="text-center bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-100">
                    <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Trophy className="w-8 h-8 text-orange-500" />
                    </div>
                    <p className="text-sm text-muted-foreground">Total Score</p>
                    <p className={`text-5xl font-extrabold ${getScoreColor(resultData.total_score / 4)}`}>
                      {resultData.total_score}
                    </p>
                    <p className="text-lg text-muted-foreground">/ {resultData.max_score}</p>
                  </div>

                  {/* Subject Breakdown */}
                  <div>
                    <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Subject Breakdown</h3>
                    <div className="space-y-3">
                      {(resultData.subject_scores || []).map((subject: any, index: number) => (
                        <div key={index} className="border rounded-xl p-4 bg-gray-50/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{subject.subject_name}</span>
                            <span className={`font-bold text-lg ${getScoreColor(subject.converted_score)}`}>
                              {subject.converted_score}/100
                            </span>
                          </div>
                          <div className="relative h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`absolute top-0 left-0 h-full rounded-full transition-all ${getProgressColor(subject.converted_score)}`}
                              style={{ width: `${subject.converted_score}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {subject.correct}/{subject.total} correct answers
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Analysis */}
                  <div className="grid grid-cols-2 gap-4">
                    {resultData.strengths && resultData.strengths.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-sm text-green-700">Strong</span>
                        </div>
                        <div className="space-y-1">
                          {resultData.strengths.map((s: string, i: number) => (
                            <Badge key={i} variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {resultData.weaknesses && resultData.weaknesses.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingDown className="w-4 h-4 text-red-600" />
                          <span className="font-semibold text-sm text-red-700">Weak</span>
                        </div>
                        <div className="space-y-1">
                          {resultData.weaknesses.map((s: string, i: number) => (
                            <Badge key={i} variant="outline" className="bg-red-100 text-red-700 border-red-300 text-xs">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Button variant="outline" onClick={downloadResultSlip} className="w-full h-12 text-base font-semibold">
                <Download className="w-5 h-5 mr-2" /> Download Result Slip
              </Button>

              {/* WhatsApp Group CTA */}
              <Card className="shadow-lg border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white overflow-hidden">
                <CardContent className="py-5 px-6 text-center space-y-3">
                  <div>
                    <h3 className="text-lg font-bold">Join Our WhatsApp Group</h3>
                    <p className="text-sm opacity-90">Get exam updates and connect with other candidates</p>
                  </div>
                  <a href="https://chat.whatsapp.com/JQ61pyPVTfT5MlW1X7P4TH?mode=gi_t" target="_blank" rel="noopener noreferrer">
                    <Button className="bg-white text-green-600 hover:bg-white/90 font-bold h-11 px-8 mt-2">
                      JOIN NOW
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AkboyLayout>
  );
}
