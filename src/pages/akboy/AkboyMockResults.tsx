import { useState, useEffect } from "react";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Search, Trophy, TrendingUp, TrendingDown, Printer, AlertCircle, Clock } from "lucide-react";

export default function AkboyMockResults() {
  const [regNumber, setRegNumber] = useState("");
  // if ?reg= is provided we prefill and auto-check once the checkResult
  // helper exists below. we declare the params/initialReg here and run the
  // effect later.
  const params = new URLSearchParams(window.location.search);
  const initialReg = params.get('reg') || "";
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);

  const checkResult = async () => {
    // ignore empty input
    if (!regNumber.trim()) {
      toast.error("Please enter your registration number");
      return;
    }

    setLoading(true);
    setResultData(null);
    setStatus(null);

    try {
      const { data, error } = await supabase.rpc("check_mock_result" as any, {
        p_registration_number: regNumber.trim().toUpperCase(),
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

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 75) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  // helpers returning actual color codes for use in generated HTML
  const scoreColorHex = (score: number) => {
    if (score >= 75) return "#16a34a"; // green-600
    if (score >= 50) return "#ca8a04"; // yellow-600
    return "#dc2626"; // red-600
  };
  const progressHex = (score: number) => {
    if (score >= 75) return "#22c55e"; // green-500
    if (score >= 50) return "#eab308"; // yellow-500
    return "#ef4444"; // red-500
  };

  // create a printable/downloadable version of the result slip that mirrors the
  // admit-slip download approach used in registration. this keeps prints from
  // capturing the entire page and ensures consistent styling.
  // once the checkResult helper is declared we can run the initialReg effect
  useEffect(() => {
    if (initialReg) {
      setRegNumber(initialReg);
      checkResult();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialReg]);

  const downloadResultSlip = () => {
    if (!resultData) return;

    // generate subject rows html
    const subjectsHtml = (resultData.subject_scores || [])
      .map((s: any) => {
        const color = scoreColorHex(s.converted_score);
        const width = `${s.converted_score}%`;
        return `
          <div style="border:1px solid #ddd;border-radius:4px;padding:8px;margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;font-size:14px;">
              <span>${s.subject_name}</span>
              <span style="font-weight:bold;color:${color};">${s.converted_score}/100</span>
            </div>
            <div style="background:#f3f3f3;height:8px;border-radius:4px;overflow:hidden;">
              <div style="background:${progressHex(s.converted_score)};width:${width};height:100%;"></div>
            </div>
            <p style="font-size:12px;color:#666;margin-top:4px;">${s.correct}/${s.total} correct answers</p>
          </div>`;
      })
      .join('');

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AKBOY Mock Exam Result Slip</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Arial',sans-serif; padding:20px; background:#f5f5f5; }
    .container { max-width:8.5in; margin:0 auto; }
    .result-slip { background:white; border:2px solid #333; padding:20px; margin-bottom:20px; }
    .header { text-align:center; border-bottom:2px solid #ff8c00; padding-bottom:10px; margin-bottom:15px; }
    .header h1 { color:#ff8c00; font-size:24px; margin-bottom:5px; }
    .header p { color:#666; font-size:12px; }
    .content { margin-bottom:15px; }
    .section { margin-bottom:15px; }
    .section-title { font-weight:bold; color:#ff8c00; font-size:12px; margin-bottom:8px; border-bottom:1px solid #ddd; padding-bottom:5px; }
    .field { display:flex; margin-bottom:6px; font-size:12px; }
    .label { font-weight:bold; width:120px; color:#555; }
    .value { flex:1; color:#333; }
    .score-box { text-align:center; background:linear-gradient(to right,#ffedd5,#fef3c7); padding:20px; border-radius:12px; border:1px solid #ddd; }
    .score-box .score { font-size:48px; font-weight:bold; }
    .subject-breakdown { margin-top:15px; }
    .footer { border-top:1px solid #ddd; padding-top:10px; text-align:center; font-size:10px; color:#666; }
    @media print { body { background:white; } .result-slip { page-break-after:always; } }
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
        <div class="section">
          <div class="section-title">Student Information</div>
          <div class="field"><span class="label">Name:</span><span class="value">${resultData.full_name}</span></div>
          <div class="field"><span class="label">Reg Number:</span><span class="value" style="font-weight:bold;font-family:monospace;">${resultData.registration_number}</span></div>
        </div>
        <div class="section score-box">
          <div class="score">${resultData.total_score}</div>
          <div style="font-size:14px;color:#666;">/ ${resultData.max_score} (Total Score)</div>
        </div>
        <div class="section subject-breakdown">
          <div class="section-title">Subject Breakdown</div>
          ${subjectsHtml}
        </div>
      </div>
      <div class="footer">
        <div>For exam updates and announcements, visit: www.akboys.ng</div>
        <div>Contact: 08101466977 | akboycreativehub@gmail.com</div>
        <div style="margin-top:5px;font-size:9px;">Generated: ${new Date().toLocaleString()}</div>
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
    toast.success("Result slip downloaded successfully");
  };

  return (
    <AkboyLayout title="Mock Exam Results" description="Check your AKBOY JAMB Mock Exam results">
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Search Card */}
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <img src="/akboy-logo.png" alt="AKBOY" className="w-10 h-10 rounded-full" />
              </div>
              <CardTitle className="text-2xl">Result Portal</CardTitle>
              <CardDescription>Enter your registration number to check your mock exam result</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="e.g., AKBM2600001"
                  value={regNumber}
                  onChange={e => setRegNumber(e.target.value.toUpperCase())}
                  className="text-center font-mono tracking-wider"
                  onKeyDown={e => e.key === "Enter" && checkResult()}
                />
                <Button onClick={checkResult} disabled={loading} className="bg-orange-500 hover:bg-orange-600">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status Messages */}
          {status === "not_found" && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-red-700 font-semibold">No Registration Found</p>
                <p className="text-sm text-red-600 mt-1">Please check your registration number and try again.</p>
              </CardContent>
            </Card>
          )}

          {status === "pending" && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6 text-center">
                <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                <p className="text-yellow-700 font-semibold">Result Being Processed</p>
                <p className="text-sm text-yellow-600 mt-1">Your result is still being processed. Please check back later.</p>
              </CardContent>
            </Card>
          )}

          {status === "not_released" && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6 text-center">
                <Clock className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                <p className="text-orange-700 font-semibold">Results Not Yet Released</p>
                <p className="text-sm text-orange-600 mt-1">Results have not been released yet. Please check back later.</p>
              </CardContent>
            </Card>
          )}

          {/* Result Display */}
          {status === "available" && resultData && (
            <div id="result-slip" className="space-y-4">
              <Card className="border-2 border-orange-300">
                <CardHeader className="bg-orange-500 text-white text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <img src="/akboy-logo.png" alt="AKBOY" className="w-8 h-8 rounded-full bg-white p-0.5" />
                    <CardTitle>AKBOY Mock Examination Result</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Student Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Full Name</p>
                      <p className="font-bold text-lg">{resultData.full_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Registration Number</p>
                      <p className="font-bold text-lg font-mono">{resultData.registration_number}</p>
                    </div>
                  </div>

                  {/* Total Score */}
                  <div className="text-center bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-xl border">
                    <Trophy className="w-10 h-10 text-orange-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Total Score</p>
                    <p className={`text-5xl font-bold ${getScoreColor(resultData.total_score / 4)}`}>
                      {resultData.total_score}
                    </p>
                    <p className="text-lg text-muted-foreground">/ {resultData.max_score}</p>
                  </div>

                  {/* Subject Breakdown */}
                  <div>
                    <h3 className="font-semibold mb-3">Subject Breakdown</h3>
                    <div className="space-y-3">
                      {(resultData.subject_scores || []).map((subject: any, index: number) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{subject.subject_name}</span>
                            <span className={`font-bold ${getScoreColor(subject.converted_score)}`}>
                              {subject.converted_score}/100
                            </span>
                          </div>
                          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`absolute top-0 left-0 h-full rounded-full transition-all ${getProgressColor(subject.converted_score)}`}
                              style={{ width: `${subject.converted_score}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {subject.correct}/{subject.total} correct answers
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Analysis */}
                  <div className="grid grid-cols-2 gap-4">
                    {resultData.strengths && resultData.strengths.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-sm text-green-700">Strong Subjects</span>
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
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingDown className="w-4 h-4 text-red-600" />
                          <span className="font-semibold text-sm text-red-700">Weak Subjects</span>
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

              <Button variant="outline" onClick={downloadResultSlip} className="w-full print:hidden">
                <Printer className="w-4 h-4 mr-2" /> Print Result Slip
              </Button>
            </div>
          )}
        </div>
      </div>
    </AkboyLayout>
  );
}
