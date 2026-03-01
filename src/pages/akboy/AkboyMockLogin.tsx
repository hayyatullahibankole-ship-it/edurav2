import { useState } from "react";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader2, BookOpen, Clock, AlertTriangle, Play, CheckCircle2 } from "lucide-react";

export default function AkboyMockLogin() {
  const [regNumber, setRegNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!regNumber.trim()) {
      toast.error("Please enter your registration number");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("validate_mock_exam_login" as any, {
        p_registration_number: regNumber.trim().toUpperCase(),
      });

      if (error) throw error;

      const result = data as any;
      if (!result.valid) {
        toast.error(result.message);
        return;
      }

      setLoginData(result);
      setShowInstructions(true);
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const startExam = () => {
    // Navigate to mock exam page with the registration data
    navigate(`/akboy/mock-exam?reg=${regNumber.trim().toUpperCase()}`);
  };

  return (
    <AkboyLayout title="Mock Exam Login" description="Login to take the AKBOY JAMB Mock Examination">
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4">
        <div className="max-w-lg mx-auto">
          {!showInstructions ? (
            <Card>
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <img src="/akboy-logo.png" alt="AKBOY" className="w-10 h-10 rounded-full" />
                </div>
                <CardTitle className="text-2xl">Mock Exam Login</CardTitle>
                <CardDescription>
                  Enter your registration number to access the exam
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="regNumber">Registration Number</Label>
                  <Input
                    id="regNumber"
                    placeholder="e.g., AKBM2600001"
                    value={regNumber}
                    onChange={e => setRegNumber(e.target.value.toUpperCase())}
                    className="text-center text-lg font-mono tracking-wider"
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                  />
                </div>

                <Button
                  onClick={handleLogin}
                  disabled={loading || !regNumber.trim()}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Validating...</> : "Login to Exam"}
                </Button>
              </CardContent>
            </Card>
          ) : loginData && (
            <Card className="border-2 border-orange-300">
              <CardHeader className="bg-orange-500 text-white text-center">
                <CardTitle className="text-xl flex items-center justify-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  AKBOY JAMB Mock Examination
                </CardTitle>
                <CardDescription className="text-orange-100">Instruction Page</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <p className="text-lg font-bold">{loginData.full_name}</p>
                  <p className="text-sm text-muted-foreground font-mono">{regNumber}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Your Subjects:</h3>
                  <div className="flex flex-wrap gap-2">
                    {(loginData.subjects || []).map((s: any, i: number) => (
                      <Badge key={i} className="bg-orange-100 text-orange-700 border-orange-300">
                        {s.name} ({s.questions}Q)
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" /> Exam Rules
                  </h3>
                  <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside">
                    <li>Total Questions: <strong>180</strong> (English: 60, Others: 40 each)</li>
                    <li>Duration: <strong>120 minutes (2 hours)</strong></li>
                    <li>Timer starts immediately when you click START EXAM</li>
                    <li>Exam auto-submits when time expires</li>
                    <li>No going back once submitted</li>
                    <li>Results will be released at a later date</li>
                    <li className="text-destructive font-medium">Do NOT close the browser during the exam</li>
                  </ul>
                </div>

                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                  <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <p className="text-yellow-800">
                    <strong>Timer Warning:</strong> The 120-minute countdown begins as soon as you click "START EXAM". Make sure you are ready.
                  </p>
                </div>

                {loginData.mode === 'physical' && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertDescription className="text-blue-800 text-sm">
                      <strong>Physical Mode:</strong> Ensure your payment receipt is available for verification.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => { setShowInstructions(false); setLoginData(null); }} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={startExam} className="flex-1 bg-green-600 hover:bg-green-700 text-lg py-6">
                    <Play className="w-5 h-5 mr-2" /> START EXAM
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AkboyLayout>
  );
}
