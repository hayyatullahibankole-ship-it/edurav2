import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <Card 
      className="border-2 border-primary/30 overflow-hidden shadow-2xl animate-fade-in"
      style={{ boxShadow: '0 20px 60px rgba(0, 123, 255, 0.3)' }}
    >
      <div className="absolute inset-0 bg-primary/10" />
      <CardContent className="p-6 relative z-10">
        <button
          onClick={() => setShowPrompt(false)}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition-all"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div 
            className="p-4 rounded-2xl bg-primary shadow-2xl flex-shrink-0"
            style={{ boxShadow: '0 10px 30px rgba(0, 123, 255, 0.5)' }}
          >
            <Smartphone className="h-8 w-8 text-white" strokeWidth={2.5} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-black mb-2 bg-primary">
              Install EduRa App
            </h3>
            <p className="text-sm text-muted-foreground mb-4 font-semibold">
              Get the full experience! Install our app for offline access, faster loading, and push notifications.
            </p>
            
            <Button
              onClick={handleInstall}
              className="w-full bg-primary hover:shadow-2xl hover:scale-105 active:scale-95 transition-all font-bold shadow-xl"
              style={{ boxShadow: '0 10px 30px rgba(0, 123, 255, 0.4)' }}
            >
              <Download className="h-5 w-5 mr-2" strokeWidth={2.5} />
              Install Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
