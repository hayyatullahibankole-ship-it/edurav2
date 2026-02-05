import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useInstalledApp } from '@/hooks/useInstalledApp';
import eduraLogo from '@/assets/edura-logo.png';

const UPTODOWN_URL = "https://edura-advanced-cbt-platform.en.uptodown.com/android/download";
const POPUP_STORAGE_KEY = "edura_app_popup_dismissed";
const POPUP_DELAY_MS = 3000;

export const AppDownloadPopup = () => {
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const { isInstalledApp } = useInstalledApp();

  useEffect(() => {
    // Only show on homepage
    if (location.pathname !== '/') return;

    // Check if user has already dismissed the popup
    const dismissed = localStorage.getItem(POPUP_STORAGE_KEY);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Reset after 24 hours
      if (Date.now() - dismissedTime < 24 * 60 * 60 * 1000) return;
    }

    // Don't show if already installed
    if (isInstalledApp) return;

    // Show popup after delay
    const timer = setTimeout(() => {
      setVisible(true);
    }, POPUP_DELAY_MS);

    return () => clearTimeout(timer);
  }, [location.pathname, isInstalledApp]);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(POPUP_STORAGE_KEY, Date.now().toString());
  };

  const handleDownload = () => {
    window.open(UPTODOWN_URL, '_blank');
    handleDismiss();
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-300 md:left-auto md:right-6 md:max-w-sm">
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-glow to-secondary" />
        
        <div className="p-4 flex items-center gap-4">
          {/* Mini phone mockup */}
          <div className="shrink-0 relative">
            <div className="w-12 h-20 bg-foreground/90 rounded-xl p-0.5 shadow-lg">
              <div className="w-full h-full bg-gradient-to-br from-primary to-primary-glow rounded-[10px] flex items-center justify-center">
                <img src={eduraLogo} alt="Edura" className="h-5 w-auto" />
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
              <Smartphone className="h-2.5 w-2.5 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-sm">
              Get the Edura App
            </h3>
            <p className="text-muted-foreground text-xs mt-0.5">
              50K+ downloads • 4.8★ rating
            </p>
          </div>

          {/* Actions */}
          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Get
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};