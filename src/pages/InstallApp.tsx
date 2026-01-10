import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, CheckCircle, Loader2, RefreshCw } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Global prompt storage to persist across component remounts
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [showManualInstructions, setShowManualInstructions] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // iOS doesn't support beforeinstallprompt, show manual instructions immediately
    if (iOS) {
      setShowManualInstructions(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      globalDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Show manual instructions after 3 seconds if no prompt is available
    const timer = setTimeout(() => {
      if (!globalDeferredPrompt) {
        setShowManualInstructions(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    const prompt = deferredPrompt || globalDeferredPrompt;

    if (!prompt) {
      setShowManualInstructions(true);
      return;
    }

    setInstalling(true);

    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;

      if (outcome === "accepted") {
        globalDeferredPrompt = null;
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error("Install prompt error:", error);
      setShowManualInstructions(true);
    }

    setInstalling(false);
  }, [deferredPrompt]);

  const retryInstall = () => {
    // Try to trigger the prompt again
    if (globalDeferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt);
      handleInstall();
    } else {
      setShowManualInstructions(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-20 w-80 h-80 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-gradient-to-br from-secondary/20 to-success/15 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 md:p-6 space-y-6 max-w-4xl mx-auto pb-24 pt-20">
        {/* Hero Section */}
        <div
          className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-primary via-primary-glow to-secondary p-8 shadow-2xl text-center animate-fade-in"
          style={{ boxShadow: "0 25px 70px rgba(0, 123, 255, 0.4)" }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/30 rounded-full blur-2xl animate-pulse" />

          <div className="relative z-10">
            <div className="inline-flex p-6 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl mb-6">
              <Smartphone className="h-16 w-16 text-white" strokeWidth={2.5} />
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">Install EduRa App</h2>
            <p className="text-white/90 text-lg font-semibold mb-8 max-w-2xl mx-auto">
              Get the full mobile app experience with offline access, faster loading, and push notifications for your
              exam preparation.
            </p>

            {/* Install Button */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleInstall}
                disabled={installing}
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-black text-lg px-8 py-6 h-auto shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-70"
              >
                {installing ? (
                  <Loader2 className="h-6 w-6 mr-2 animate-spin" strokeWidth={2.5} />
                ) : (
                  <Download className="h-6 w-6 mr-2" strokeWidth={2.5} />
                )}
                {installing ? "Installing..." : "Install From Web"}
              </Button>

              <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white font-black">
                <a href="https://dashboard.ionicframework.com/#" download>
                  Download Android APP
                </a>
              </Button>

              {!deferredPrompt && !isIOS && (
                <Button
                  onClick={retryInstall}
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Installation
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <h3 className="text-2xl font-black mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center">
            Why Install?
          </h3>

          {[
            { title: "Offline Access", description: "Practice tests even without internet connection" },
            { title: "Faster Loading", description: "Instant app startup and smoother performance" },
            { title: "Push Notifications", description: "Stay updated with exam reminders and tips" },
            { title: "Home Screen Icon", description: "Quick access directly from your phone" },
          ].map((benefit, index) => (
            <Card key={index} className="border-2 border-primary/20 overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-primary" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg mb-1">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground font-semibold">{benefit.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Manual Instructions - Show after delay or if install not available */}
        {showManualInstructions && (
          <Card className="border-2 border-secondary/30 overflow-hidden shadow-xl animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent" />
            <CardContent className="p-8 relative z-10">
              <h1 className="text-xl font-black mb-4 text-center">Manual Installation</h1>
              <div className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <p className="font-semibold">
                    <strong>iPhone/iPad:</strong> Tap the Share button (square with arrow), then scroll down and tap
                    "Add to Home Screen"
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <p className="font-semibold">
                    <strong>Android:</strong> Tap the menu (three dots), then tap "Add to Home screen" or "Install app"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
