import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import { Link } from "react-router-dom";

export default function AkboyMockSubmitted() {
  const { isAkboy } = useDomainDetection();
  const basePath = isAkboy ? "" : "/akboy";

  return (
    <AkboyLayout title="Exam Submitted" description="Your mock exam has been submitted successfully">
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <Card className="border-2 border-green-300">
            <CardHeader className="bg-green-500 text-white">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-3" />
              <CardTitle className="text-2xl">Exam Submitted Successfully!</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <p className="text-lg text-muted-foreground">
                Your AKBOY JAMB Mock Examination has been submitted successfully.
              </p>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <p className="font-semibold text-orange-700">Results Not Yet Available</p>
                </div>
                <p className="text-sm text-orange-600">
                  Results will be released on the announced date. Please check the Result Portal using your registration number.
                </p>
              </div>

              <div className="space-y-3">
                <Link to={`${basePath}/mock-results`}>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600">
                    <ExternalLink className="w-4 h-4 mr-2" /> Go to Result Portal
                  </Button>
                </Link>
                <Link to={basePath || "/"}>
                  <Button variant="outline" className="w-full mt-2">
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
