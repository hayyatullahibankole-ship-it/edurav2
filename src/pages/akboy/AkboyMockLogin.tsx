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
import { useNavigate, Link } from "react-router-dom";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import { Loader2, BookOpen, Clock, AlertTriangle, Play, GraduationCap, School, Camera, Mic, ShieldAlert } from "lucide-react";
import { MockBrandBanner } from "@/components/MockBrandBanner";

export default function AkboyMockLogin() {
  const [regNumber, setRegNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [requestingPermissions, setRequestingPermissions] = useState(false);
  const navigate = useNavigate();
  const { isAkboy } = useDomainDetection();
  const basePath = isAkboy ? "" : "/akboy";

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

  const requestPermissions = async () => {
    setRequestingPermissions(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true,
      });
      // Stop the stream immediately, we just needed permission
      stream.getTracks().forEach(track => track.stop());
      setPermissionsGranted(true);
      toast.success("Camera & microphone access granted");
    } catch (err: any) {
      console.error("Permission denied:", err);
      toast.error("You must allow camera and microphone access to take the exam");
      setPermissionsGranted(false);
    } finally {
      setRequestingPermissions(false);
    }
  };

  const startExam = () => {
    if (!permissionsGranted) {
      toast.error("Camera & microphone access is required to start the exam");
      return;
    }
    navigate(`${basePath}/mock-exam?reg=${regNumber.trim().toUpperCase()}`);
  };

  return (
    <AkboyLayout title="Mock Exam Login" description="Login to take the AKBOY JAMB Mock Examination">
      <div className="min-h-screen bg-orange-50">
        <MockBrandBanner />
        <div className="max-w-lg mx-auto space-y-6 py-8 px-4">
          {/* Hero Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-medium">
              <GraduationCap className="w-4 h-4" />
              JAMB Mock CBT
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Exam Portal</h1>
            <p className="text-muted-foreground">Enter your registration number to begin</p>
          </div>

          {!showInstructions ? (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <img src="/akboy-logo.png" alt="AKBOY" className="w-10 h-10 rounded-full" />
                </div>
                <CardTitle className="text-xl">Mock Exam Login</CardTitle>
                <CardDescription>Use your AKBOY registration number</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label htmlFor="regNumber" className="text-sm font-medium">Registration Number</Label>
                  <Input
                    id="regNumber"
                    placeholder="e.g., AKBM2600001"
                    value={regNumber}
                    onChange={e => setRegNumber(e.target.value.toUpperCase())}
                    className="text-center text-lg font-mono tracking-wider mt-1.5 h-12 border-2 focus:border-orange-400"
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                  />
                </div>

                <Button
                  onClick={handleLogin}
                  disabled={loading || !regNumber.trim()}
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-base font-semibold shadow-md"
                >
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Validating...</> : "Login to Exam"}
                </Button>

                <div className="pt-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Don't have a registration?</span>
                    <Link to={`${basePath}/mock-registration`} className="text-orange-600 font-semibold hover:underline">
                      Register Now
                    </Link>
                  </div>
                  <a href="https://edura.space/#/school-registration" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-orange-600 font-semibold hover:underline">
                    <School className="w-4 h-4" /> Register as a School
                  </a>
                </div>
              </CardContent>
            </Card>
          ) : loginData && (
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardHeader className="bg-orange-500 text-white text-center py-6">
                <CardTitle className="text-xl flex items-center justify-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  AKBOY JAMB Mock Examination
                </CardTitle>
                <CardDescription className="text-orange-100 mt-1">Instruction Page</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="text-center bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <p className="text-lg font-bold text-gray-900">{loginData.full_name}</p>
                  <p className="text-sm text-muted-foreground font-mono tracking-wider">{regNumber}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-sm">Your Subjects:</h3>
                  <div className="flex flex-wrap gap-2">
                    {(loginData.subjects || []).map((s: any, i: number) => (
                      <Badge key={i} className="bg-orange-100 text-orange-700 border-orange-200 px-3 py-1">
                        {s.name} ({s.questions}Q)
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl space-y-2 border">
                  <h3 className="font-semibold flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-orange-500" /> Exam Rules
                  </h3>
                  <ul className="text-sm space-y-1.5 text-muted-foreground list-disc list-inside">
                    <li>Total: <strong>180 questions</strong> (English: 60, Others: 40 each)</li>
                    <li>Duration: <strong>120 minutes</strong></li>
                    <li>Timer starts immediately on START EXAM</li>
                    <li>Exam auto-submits when time expires</li>
                    <li>Results released at a later date</li>
                    <li className="text-red-600 font-medium">Do NOT close the browser during the exam</li>
                  </ul>
                </div>

                {/* Proctoring Notice */}
                <div className="bg-red-50 p-4 rounded-xl space-y-2 border border-red-200">
                  <h3 className="font-semibold flex items-center gap-2 text-sm text-red-700">
                    <ShieldAlert className="w-4 h-4" /> Proctoring & Anti-Cheat
                  </h3>
                  <ul className="text-sm space-y-1.5 text-red-600 list-disc list-inside">
                    <li><strong>Camera & microphone are required</strong> throughout the exam</li>
                    <li>Your camera will monitor for suspicious activity (e.g., looking away, multiple faces)</li>
                    <li><strong>Exam will auto-submit if cheating is detected</strong></li>
                    <li>Tab switching and copy/paste are blocked</li>
                    <li>Right-click and keyboard shortcuts are disabled</li>
                    <li className="font-bold">Anyone who does NOT allow camera/microphone cannot start the exam</li>
                  </ul>
                </div>

                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
                  <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <p className="text-amber-800">
                    <strong>Timer Warning:</strong> The 120-minute countdown begins immediately when you click "START EXAM".
                  </p>
                </div>

                {loginData.mode === 'physical' && (
                  <Alert className="border-blue-200 bg-blue-50 rounded-xl">
                    <AlertDescription className="text-blue-800 text-sm">
                      <strong>Physical Mode:</strong> Ensure your payment receipt is available for verification.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Camera/Mic Permission Button */}
                {!permissionsGranted ? (
                  <Button
                    onClick={requestPermissions}
                    disabled={requestingPermissions}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-semibold"
                  >
                    {requestingPermissions ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Requesting Access...</>
                    ) : (
                      <><Camera className="w-4 h-4 mr-2" /><Mic className="w-4 h-4 mr-2" /> Allow Camera & Microphone</>
                    )}
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-semibold">
                    <Camera className="w-4 h-4" />
                    <Mic className="w-4 h-4" />
                    Camera & Microphone Access Granted ✓
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => { setShowInstructions(false); setLoginData(null); setPermissionsGranted(false); }} className="flex-1 h-12">
                    Back
                  </Button>
                  <Button
                    onClick={startExam}
                    disabled={!permissionsGranted}
                    className={`flex-1 text-lg h-14 shadow-lg font-bold ${
                      permissionsGranted
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Play className="w-5 h-5 mr-2" /> START EXAM
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* WhatsApp Group CTA */}
          <Card className="shadow-lg border-0 bg-green-500 text-white overflow-hidden">
            <CardContent className="py-4 px-6 text-center space-y-2">
              <h3 className="text-base font-bold">Join Our WhatsApp Group for Updates</h3>
              <a href="https://chat.whatsapp.com/JQ61pyPVTfT5MlW1X7P4TH?mode=gi_t" target="_blank" rel="noopener noreferrer">
                <Button className="bg-white text-green-600 hover:bg-white/90 font-bold h-10 px-6 mt-1" size="sm">
                  JOIN NOW
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </AkboyLayout>
  );
}
