import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Smartphone, Zap, Wifi, Bell, Shield, Clock, Star, CheckCircle } from "lucide-react";
import eduraLogo from "@/assets/edura-logo.png";

const UPTODOWN_URL = "https://edura-advanced-cbt-platform.en.uptodown.com/android/download";

export default function InstallApp() {
  const navigate = useNavigate();

  const steps = [
    { num: "1", text: "Tap the download button below" },
    { num: "2", text: "Install the APK from Uptodown" },
    { num: "3", text: "Open the app & start practicing" },
  ];

  const features = [
    { icon: Zap, text: "Lightning fast performance" },
    { icon: Wifi, text: "Practice offline anytime" },
    { icon: Bell, text: "Get exam reminders" },
    { icon: Shield, text: "Secure & private" },
    { icon: Clock, text: "Accurate exam timing" },
    { icon: Star, text: "Full CBT experience" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold text-lg">Get the App</h1>
      </div>

      <div className="max-w-lg mx-auto px-5 py-8 space-y-8">
        {/* App Card */}
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center p-2 shrink-0">
            <img src={eduraLogo} alt="Edura" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-xl">Edura CBT</h2>
            <p className="text-muted-foreground text-sm">Your Gateway to Exam Success</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> 4.8
              </span>
              <span className="text-xs text-muted-foreground">50K+ downloads</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">FREE</span>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <a
          href={UPTODOWN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button
            size="lg"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base py-6 rounded-xl gap-2 shadow-lg shadow-emerald-600/20"
          >
            <Download className="h-5 w-5" />
            Download from Uptodown
          </Button>
        </a>

        {/* How to Install */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">How to install</h3>
          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.num} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                  {step.num}
                </div>
                <p className="text-sm text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Why use the app?</h3>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/50">
                <feature.icon className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm text-foreground">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* iOS Note */}
        <div className="p-4 rounded-xl bg-muted/50 border">
          <div className="flex items-start gap-3">
            <Smartphone className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">iPhone Users</p>
              <p className="text-xs text-muted-foreground">
                Open Safari → tap Share → "Add to Home Screen" for the best experience.
              </p>
            </div>
          </div>
        </div>

        {/* Trust badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pb-4">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
          <span>Safe & Secure • No Registration Required</span>
        </div>
      </div>
    </div>
  );
}
