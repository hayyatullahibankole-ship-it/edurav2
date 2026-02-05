import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Smartphone, Zap, Wifi, Bell, Star, Shield, Clock } from "lucide-react";
import eduraLogo from "@/assets/edura-logo.png";

const UPTODOWN_URL = "https://edura-advanced-cbt-platform.en.uptodown.com/android/download";

export default function InstallApp() {
  const navigate = useNavigate();

  const features = [
    { icon: Zap, title: "Lightning Fast", desc: "Instant loading & smooth performance" },
    { icon: Wifi, title: "Offline Mode", desc: "Practice without internet" },
    { icon: Bell, title: "Notifications", desc: "Never miss exam updates" },
    { icon: Shield, title: "Secure", desc: "Your data stays protected" },
    { icon: Clock, title: "Real-time", desc: "Accurate exam timing" },
    { icon: Star, title: "Premium", desc: "Full CBT experience" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-glow/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-16">
        {/* Phone Mockup */}
        <div className="relative mb-8 animate-fade-in-up">
          {/* Phone Frame */}
          <div className="relative w-48 h-96 md:w-56 md:h-[420px] bg-slate-800 rounded-[3rem] p-2 shadow-2xl border-4 border-slate-700">
            {/* Screen */}
            <div className="w-full h-full bg-gradient-to-br from-primary via-primary-glow to-secondary rounded-[2.5rem] flex flex-col items-center justify-center overflow-hidden relative">
              {/* Notch */}
              <div className="absolute top-2 w-20 h-5 bg-slate-800 rounded-full" />
              
              {/* Screen Content */}
              <div className="flex flex-col items-center gap-4 p-6">
                <div className="bg-white/95 rounded-2xl p-4 shadow-xl">
                  <img src={eduraLogo} alt="Edura" className="h-12 w-auto" />
                </div>
                <h3 className="text-white font-black text-lg drop-shadow-lg">Edura CBT</h3>
                <p className="text-white/80 text-xs text-center font-medium">Your Gateway to Success</p>
                
                {/* Mini stats */}
                <div className="flex gap-3 mt-2">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <p className="text-white text-xs font-bold">50K+</p>
                    <p className="text-white/70 text-[10px]">Users</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <p className="text-white text-xs font-bold">4.8★</p>
                    <p className="text-white/70 text-[10px]">Rating</p>
                  </div>
                </div>
              </div>
              
              {/* Home indicator */}
              <div className="absolute bottom-3 w-24 h-1 bg-white/50 rounded-full" />
            </div>
          </div>
          
          {/* Floating badges around phone */}
          <div className="absolute -top-4 -right-4 bg-success text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce">
            FREE
          </div>
          <div className="absolute top-1/3 -left-6 bg-white/90 text-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            Android
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 drop-shadow-lg">
            Get the App
          </h1>
          <p className="text-white/80 text-lg font-medium max-w-md mx-auto">
            Download Edura CBT for the ultimate exam preparation experience
          </p>
        </div>

        {/* Download Button */}
        <a
          href={UPTODOWN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-success/50 blur-xl rounded-full group-hover:bg-success/70 transition-all" />
            
            <Button
              size="lg"
              className="relative bg-success hover:bg-success/90 text-white font-black text-lg px-10 py-7 h-auto rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 gap-3"
            >
              <Download className="h-6 w-6" strokeWidth={2.5} />
              Download from Uptodown
            </Button>
          </div>
        </a>

        <p className="text-white/50 text-sm mt-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          Safe & Secure • No Registration Required
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-4 mt-12 max-w-lg animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white/20 transition-all"
            >
              <div className="inline-flex p-2 rounded-xl bg-white/20 mb-2">
                <feature.icon className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
              <h4 className="text-white font-bold text-xs mb-0.5">{feature.title}</h4>
              <p className="text-white/60 text-[10px]">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* iOS Note */}
        <div className="mt-10 bg-white/10 backdrop-blur-sm rounded-2xl p-5 max-w-md text-center animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <Smartphone className="h-6 w-6 text-white/80 mx-auto mb-2" />
          <p className="text-white/80 text-sm font-medium">
            <strong>iPhone Users:</strong> Use Safari, tap Share → "Add to Home Screen" for the best experience
          </p>
        </div>
      </div>
    </div>
  );
}
