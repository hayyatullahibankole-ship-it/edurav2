import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Trophy, 
  Download,
  Zap,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  Newspaper,
  DollarSign,
  HelpCircle,
  GraduationCap,
  Play,
  Lock,
  Smartphone
} from 'lucide-react';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';

export default function MobileWebLanding() {
  const navigate = useNavigate();

  const easyAccessFeatures = [
    { icon: Play, title: "Demo CBT", description: "Try 5-10 questions free", path: "/demo-test", available: true },
    { icon: BookOpen, title: "Study Hub", description: "Browse study materials", path: "/study-hub", available: true },
    { icon: DollarSign, title: "Pricing", description: "View subscription plans", path: "/payment", available: true },
    { icon: HelpCircle, title: "How It Works", description: "Learn about EduRa", path: "/#how-it-works", available: true },
  ];

  const pwaOnlyFeatures = [
    { icon: Trophy, title: "Full CBT Exams", description: "Complete timed exams" },
    { icon: Target, title: "Performance Tracking", description: "Detailed analytics" },
    { icon: Zap, title: "Offline Practice", description: "Study anywhere" },
    { icon: GraduationCap, title: "Progress Reports", description: "Weak topic analysis" },
  ];

  const quickLinks = [
    { icon: Newspaper, title: "Blog & Tips", path: "/blog", description: "Study tips & news" },
    { icon: BookOpen, title: "Resources", path: "/resources", description: "Books & materials" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-20 w-80 h-80 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-gradient-to-br from-secondary/20 to-success/15 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 space-y-6 max-w-lg mx-auto pb-24">
        {/* Hero Section */}
        <div 
          className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-primary via-primary-glow to-secondary p-6 shadow-2xl text-center animate-fade-in"
          style={{ boxShadow: '0 25px 70px rgba(0, 123, 255, 0.4)' }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/30 rounded-full blur-2xl animate-pulse" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-xl border border-white/30">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              <span className="text-white font-bold text-xs">EDURA CBT Platform</span>
            </div>
            
            <h1 className="text-3xl font-black text-white mb-2 drop-shadow-lg">
              Master Your Exams
            </h1>
            <p className="text-white/90 text-sm font-semibold mb-5 max-w-sm mx-auto">
              Practice with real exam questions and track your progress to exam success.
            </p>

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => navigate('/demo-test')}
                size="lg"
                className="w-full h-12 text-base font-bold bg-white text-primary hover:bg-white/90 active:scale-95 transition-all shadow-xl"
              >
                <Play className="h-5 w-5 mr-2" strokeWidth={2.5} />
                Try Free Demo
              </Button>
              <Button
                onClick={() => navigate('/auth')}
                size="lg"
                variant="outline"
                className="w-full h-12 text-base font-bold border-2 border-white text-white hover:bg-white/10 active:scale-95 transition-all"
              >
                Sign In / Sign Up
                <ArrowRight className="h-5 w-5 ml-2" strokeWidth={2.5} />
              </Button>
            </div>
          </div>
        </div>

        {/* Easy Access Features */}
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black">Quick Access</h2>
            <Badge variant="secondary" className="font-semibold">No Install Required</Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {easyAccessFeatures.map((feature, index) => (
              <Card 
                key={index}
                onClick={() => navigate(feature.path)}
                className="border border-border/50 overflow-hidden shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="p-2.5 rounded-xl bg-primary/10 w-fit mb-3">
                    <feature.icon className="h-5 w-5 text-primary" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-bold text-sm mb-0.5">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />

        {/* Quick Links */}
        <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {quickLinks.map((link, index) => (
            <Card
              key={index}
              onClick={() => navigate(link.path)}
              className="border border-border/50 overflow-hidden shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-secondary/10">
                      <link.icon className="h-5 w-5 text-secondary" strokeWidth={2.5} />
                    </div>
                    <div>
                      <span className="font-bold text-sm">{link.title}</span>
                      <p className="text-xs text-muted-foreground">{link.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" strokeWidth={2.5} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* PWA-Only Features Teaser */}
        <Card 
          className="border-2 border-primary/30 overflow-hidden shadow-xl animate-fade-in"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardContent className="p-5 relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Smartphone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Install for Full Access</h3>
                <p className="text-xs text-muted-foreground">Unlock all premium features</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              {pwaOnlyFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/50"
                >
                  <feature.icon className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                  <span className="text-xs font-medium text-muted-foreground">{feature.title}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => navigate('/install-app')}
              className="w-full h-11 font-bold gap-2"
            >
              <Download className="h-4 w-4" strokeWidth={2.5} />
              Install EDURA App
            </Button>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card 
          className="border-2 border-success/30 overflow-hidden shadow-xl animate-fade-in"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-transparent" />
          <CardContent className="p-5 text-center relative z-10">
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-success/20 border border-success/30">
              <CheckCircle className="h-3.5 w-3.5 text-success" strokeWidth={2.5} />
              <span className="text-success font-bold text-xs">Join 10,000+ Students</span>
            </div>
            
            <h3 className="text-lg font-black mb-1">Ready to Start?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your free account and begin your exam preparation journey.
            </p>
            
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              className="w-full h-12 font-bold bg-gradient-to-r from-success to-success/80 hover:shadow-lg active:scale-95 transition-all"
            >
              Create Free Account
              <ArrowRight className="h-5 w-5 ml-2" strokeWidth={2.5} />
            </Button>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="flex justify-center gap-6 text-xs text-muted-foreground pt-4">
          <button onClick={() => navigate('/terms')} className="hover:text-foreground">Terms</button>
          <button onClick={() => navigate('/privacy')} className="hover:text-foreground">Privacy</button>
          <button onClick={() => navigate('/payment')} className="hover:text-foreground">Pricing</button>
        </div>
      </div>
    </div>
  );
}
