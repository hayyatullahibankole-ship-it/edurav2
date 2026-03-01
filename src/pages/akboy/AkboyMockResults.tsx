import { useState } from "react";
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
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);

  const checkResult = async () => {
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

              <Button variant="outline" onClick={() => window.print()} className="w-full print:hidden">
                <Printer className="w-4 h-4 mr-2" /> Print Result Slip
              </Button>
            </div>
          )}
        </div>
      </div>
    </AkboyLayout>
  );
}
