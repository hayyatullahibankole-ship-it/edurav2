import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, ExternalLink, School } from "lucide-react";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import { Link } from "react-router-dom";

export default function AkboyMockSubmitted() {
  const { isAkboy } = useDomainDetection();
  const basePath = isAkboy ? "" : "/akboy";
  const searchParams = new URLSearchParams(window.location.search);
  const regParam = searchParams.get('reg') || '';

  return (
    <AkboyLayout title="Exam Submitted" description="Your mock exam has been submitted successfully">
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-white py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <Card className="shadow-lg border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-8">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <CardTitle className="text-2xl">Exam Submitted!</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <p className="text-lg text-muted-foreground">
                Your AKBOY JAMB Mock Examination has been submitted successfully.
              </p>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <p className="font-semibold text-orange-700">Results Not Yet Available</p>
                </div>
                <p className="text-sm text-orange-600">
                  Results will be released on the announced date. Check the Result Portal with your registration number.
                </p>
              </div>

              <div className="space-y-3">
                <Link to={`${basePath}/mock-results${regParam ? `?reg=${encodeURIComponent(regParam)}` : ''}`}>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 h-12 font-semibold">
                    <ExternalLink className="w-4 h-4 mr-2" /> Go to Result Portal
                  </Button>
                </Link>
                <a href="https://edura.space/#/school-registration" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full mt-2 h-11">
                    <School className="w-4 h-4 mr-2" /> Register as a School
                  </Button>
                </a>
                <Link to={basePath || "/"}>
                  <Button variant="ghost" className="w-full mt-1">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AkboyLayout>
  );
}
