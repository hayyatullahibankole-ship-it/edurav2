import { Card, CardContent } from '@/components/ui/card';
import { Download, Smartphone, CheckCircle } from 'lucide-react';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';

export default function InstallApp() {
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
          style={{ boxShadow: '0 25px 70px rgba(0, 123, 255, 0.4)' }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/30 rounded-full blur-2xl animate-pulse" />
          
          <div className="relative z-10">
            <div 
              className="inline-flex p-6 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl mb-6"
            >
              <Smartphone className="h-16 w-16 text-white" strokeWidth={2.5} />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">
              Install EduRa App
            </h1>
            <p className="text-white/90 text-lg font-semibold mb-8 max-w-2xl mx-auto">
              Get the full mobile app experience with offline access, faster loading, and push notifications for your exam preparation.
            </p>
          </div>
        </div>

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />

        {/* Benefits */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-black mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center">
            Why Install?
          </h2>
          
          {[
            { title: 'Offline Access', description: 'Practice tests even without internet connection' },
            { title: 'Faster Loading', description: 'Instant app startup and smoother performance' },
            { title: 'Push Notifications', description: 'Stay updated with exam reminders and tips' },
            { title: 'Home Screen Icon', description: 'Quick access directly from your phone' }
          ].map((benefit, index) => (
            <Card
              key={index}
              className="border-2 border-primary/20 overflow-hidden shadow-lg"
            >
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

        {/* Manual Instructions */}
        <Card 
          className="border-2 border-secondary/30 overflow-hidden shadow-xl animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent" />
          <CardContent className="p-8 relative z-10">
            <h3 className="text-xl font-black mb-4 text-center">
              Manual Installation
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">1</div>
                <p className="font-semibold"><strong>iPhone/iPad:</strong> Tap the Share button (square with arrow), then scroll down and tap "Add to Home Screen"</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">2</div>
                <p className="font-semibold"><strong>Android:</strong> Tap the menu (three dots), then tap "Add to Home screen" or "Install app"</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
