import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Smartphone, 
  Clock, 
  WifiOff, 
  BarChart3, 
  Bell,
  ChevronRight,
  Share,
  Plus
} from 'lucide-react';
import eduraLogo from '@/assets/edura-logo.png';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueDemo?: () => void;
  featureName?: string;
}

export const PWAInstallModal = ({ 
  isOpen, 
  onClose, 
  onContinueDemo,
  featureName 
}: PWAInstallModalProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showManualInstructions, setShowManualInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        onClose();
      }
    } else {
      setShowManualInstructions(true);
    }
  };

  const benefits = [
    { icon: Clock, text: 'Accurate exam timing & fullscreen mode' },
    { icon: WifiOff, text: 'Practice offline anywhere' },
    { icon: BarChart3, text: 'Detailed performance analytics' },
    { icon: Bell, text: 'Study reminders & streak alerts' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <img src={eduraLogo} alt="EDURA" className="h-12 w-auto" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold">
            Unlock Full CBT Experience
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {featureName ? (
              <>To access <span className="font-semibold text-foreground">{featureName}</span>, install the EDURA app for the best experience.</>
            ) : (
              <>Install the EDURA app for accurate exam timing, offline access, and better performance tracking.</>
            )}
          </DialogDescription>
        </DialogHeader>

        {!showManualInstructions ? (
          <div className="space-y-4 py-4">
            {/* Benefits */}
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                >
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <benefit.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* Install Button */}
            <Button 
              onClick={handleInstall}
              className="w-full h-12 text-base font-semibold gap-2"
              size="lg"
            >
              <Smartphone className="h-5 w-5" />
              Install EDURA App
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Continue Demo Option */}
            {onContinueDemo && (
              <Button
                variant="ghost"
                onClick={onContinueDemo}
                className="w-full text-muted-foreground"
              >
                Continue with Demo
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="text-sm font-medium text-center text-muted-foreground mb-2">
              Follow these steps to install:
            </div>
            
            {isIOS ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <Share className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">1. Tap the Share button</p>
                    <p className="text-xs text-muted-foreground">At the bottom of Safari</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">2. Tap "Add to Home Screen"</p>
                    <p className="text-xs text-muted-foreground">Scroll down in the menu</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <Smartphone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">3. Tap "Add"</p>
                    <p className="text-xs text-muted-foreground">EDURA will appear on your home screen</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <span className="text-primary font-bold text-sm">⋮</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">1. Tap the menu button</p>
                    <p className="text-xs text-muted-foreground">Three dots at the top right</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">2. Tap "Install app" or "Add to Home screen"</p>
                    <p className="text-xs text-muted-foreground">Look for the install option</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <Smartphone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">3. Confirm installation</p>
                    <p className="text-xs text-muted-foreground">EDURA will appear on your home screen</p>
                  </div>
                </div>
              </div>
            )}

            <Button 
              variant="outline"
              onClick={() => setShowManualInstructions(false)}
              className="w-full"
            >
              Back
            </Button>
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground">
          No app store required • Installs in seconds • Always free
        </p>
      </DialogContent>
    </Dialog>
  );
};
