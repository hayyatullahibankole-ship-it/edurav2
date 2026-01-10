import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Zap, Wifi, Bell, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
}

export const InstallRequiredModal = ({ 
  open, 
  onOpenChange, 
  featureName = 'this feature' 
}: InstallRequiredModalProps) => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      setInstalling(true);
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          onOpenChange(false);
        }
      } catch (error) {
        console.error('Install prompt error:', error);
      }
      setInstalling(false);
    } else {
      // No prompt available, navigate to install page with instructions
      navigate('/install-app');
      onOpenChange(false);
    }
  };

  const benefits = [
    { icon: Zap, text: 'Full CBT Practice Access' },
    { icon: Wifi, text: 'Offline Mode Support' },
    { icon: Bell, text: 'Push Notifications' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-4 rounded-3xl border-2 border-primary/20 p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-primary via-primary-glow to-secondary p-6 text-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/30 rounded-full blur-2xl" />
          
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
          
          <div className="relative z-10">
            <div className="inline-flex p-4 rounded-2xl bg-white/20 backdrop-blur-sm mb-4">
              <Smartphone className="h-10 w-10 text-white" strokeWidth={2.5} />
            </div>
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl font-black text-white">
                Install EduRa App
              </DialogTitle>
              <DialogDescription className="text-white/90 font-semibold">
                To access {featureName}, please install the EduRa app for the full experience.
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Benefits */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground font-semibold text-center">
            Why install?
          </p>
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <benefit.icon className="h-4 w-4 text-primary" strokeWidth={2.5} />
                </div>
                <span className="font-semibold text-sm">{benefit.text}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={handleInstall}
            disabled={installing}
            className="w-full h-14 bg-gradient-to-r from-primary via-primary-glow to-secondary hover:shadow-xl font-bold text-base rounded-2xl mt-4"
          >
            <Download className="h-5 w-5 mr-2" strokeWidth={2.5} />
            {installing ? 'Installing...' : 'Install Now'}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            Quick installation, no app store needed
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
