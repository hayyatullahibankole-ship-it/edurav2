import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Download, ExternalLink, School } from "lucide-react";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import { Link } from "react-router-dom";

export default function AkboyMockSubmitted() {
  const { isAkboy } = useDomainDetection();
  const basePath = isAkboy ? "" : "/akboy";
  const searchParams = new URLSearchParams(window.location.search);
  const regParam = searchParams.get('reg') || '';

  return (
    <AkboyLayout title="Exam Submitted" description="Your mock exam has been submitted successfully">
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-50 to-white py-16 px-4">
        <div className="max-w-lg mx-auto space-y-4">
          <Card className="shadow-lg border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-700 text-white py-8">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <CardTitle className="text-2xl text-center">Exam Submitted!</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <p className="text-lg text-muted-foreground text-center">
                Your AKBOY JAMB Mock Examination has been submitted successfully.
              </p>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <p className="font-semibold text-orange-700">Results Not Yet Available</p>
                </div>
                <p className="text-sm text-orange-600 text-center">
                  Results will be released on the announced date. Check the Result Portal with your registration number.
                </p>
              </div>

              <div className="space-y-3">
                <Link to={`${basePath}/mock-results${regParam ? `?reg=${encodeURIComponent(regParam)}` : ''}`}>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 h-12 font-semibold">
                    <ExternalLink className="w-4 h-4 mr-2" /> Go to Result Portal
                  </Button>
                </Link>
                <a href={`${basePath}/reprint-admit-slip${regParam ? `?reg=${encodeURIComponent(regParam)}` : ''}`}>
                  <Button variant="outline" className="w-full h-11">
                    <Download className="w-4 h-4 mr-2" /> Reprint Admit Slip
                  </Button>
                </a>
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

          {/* WhatsApp Group CTA */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-green-500 to-green-700 text-white overflow-hidden">
            <CardContent className="py-5 px-6 text-center space-y-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold">Join Our WhatsApp Group</h3>
                <p className="text-sm opacity-90">Get exam updates, result announcements, and connect with other candidates</p>
              </div>
              <a href="https://chat.whatsapp.com/JQ61pyPVTfT5MlW1X7P4TH?mode=gi_t" target="_blank" rel="noopener noreferrer">
                <Button className="bg-white text-green-600 hover:bg-white/90 font-bold h-11 px-8 mt-2">
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