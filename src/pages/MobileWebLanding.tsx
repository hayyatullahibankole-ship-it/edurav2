import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  DollarSign
} from 'lucide-react';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';

export default function MobileWebLanding() {
  const navigate = useNavigate();

  const features = [
    { icon: BookOpen, title: "Practice Tests", description: "Thousands of questions" },
    { icon: Trophy, title: "Track Progress", description: "Monitor your improvement" },
    { icon: Zap, title: "Offline Mode", description: "Study anywhere, anytime" },
    { icon: Target, title: "Personalized", description: "Tailored to your needs" }
  ];

  const quickLinks = [
    { icon: Newspaper, title: "Blog", path: "/blog" },
    { icon: BookOpen, title: "Resources", path: "/resources" },
    { icon: Trophy, title: "Demo Test", path: "/demo-test" },
    { icon: DollarSign, title: "Pricing", path: "/payment" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-20 w-80 h-80 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-gradient-to-br from-secondary/20 to-success/15 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 md:p-6 space-y-6 max-w-4xl mx-auto pb-24">
        {/* Hero Section */}
        <div 
          className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-primary via-primary-glow to-secondary p-8 shadow-2xl text-center animate-fade-in"
          style={{ boxShadow: '0 25px 70px rgba(0, 123, 255, 0.4)' }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/30 rounded-full blur-2xl animate-pulse" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/20 backdrop-blur-xl border border-white/30">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-white font-bold text-sm">Welcome to EduRa</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">
              Master Your Exams
            </h1>
            <p className="text-white/90 text-lg font-semibold mb-6 max-w-lg mx-auto">
              Practice with thousands of questions, track your progress, and ace your exams with confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => navigate('/auth')}
                size="lg"
                className="h-14 text-base font-bold bg-white text-primary hover:bg-white/90 hover:scale-105 active:scale-95 transition-all shadow-2xl"
              >
                <ArrowRight className="h-5 w-5 mr-2" strokeWidth={2.5} />
                Get Started
              </Button>
              <Button
                onClick={() => navigate('/demo-test')}
                size="lg"
                variant="outline"
                className="h-14 text-base font-bold border-2 border-white text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all"
              >
                <Trophy className="h-5 w-5 mr-2" strokeWidth={2.5} />
                Try Demo
              </Button>
            </div>
          </div>
        </div>

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="border-2 border-primary/20 overflow-hidden shadow-xl hover:scale-105 active:scale-95 transition-all"
              style={{ boxShadow: '0 15px 40px rgba(0, 123, 255, 0.15)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <CardContent className="p-6 text-center relative z-10">
                <div 
                  className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary via-primary-glow to-secondary shadow-2xl mb-4"
                  style={{ boxShadow: '0 10px 30px rgba(0, 123, 255, 0.4)' }}
                >
                  <feature.icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="font-black mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground font-semibold">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-black mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Explore More
          </h2>
          {quickLinks.map((link, index) => (
            <Card
              key={index}
              onClick={() => navigate(link.path)}
              className="border-2 border-primary/20 overflow-hidden shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                      <link.icon className="h-5 w-5 text-primary" strokeWidth={2.5} />
                    </div>
                    <span className="font-black text-lg">{link.title}</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" strokeWidth={2.5} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <Card 
          className="border-2 border-success/30 overflow-hidden shadow-2xl animate-fade-in"
          style={{ 
            animationDelay: '0.3s',
            boxShadow: '0 20px 60px rgba(16, 185, 129, 0.3)' 
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-transparent" />
          <CardContent className="p-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-success/20 backdrop-blur-xl border border-success/30">
              <CheckCircle className="h-4 w-4 text-success" strokeWidth={2.5} />
              <span className="text-success font-bold text-sm">Get Started Today</span>
            </div>
            
            <h3 className="text-2xl font-black mb-2">
              Ready to Excel?
            </h3>
            <p className="text-muted-foreground font-semibold mb-6">
              Join thousands of students achieving their academic goals with EduRa.
            </p>
            
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              className="h-14 text-base font-bold bg-gradient-to-r from-success via-success to-success/80 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
              style={{ boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)' }}
            >
              <Download className="h-5 w-5 mr-2" strokeWidth={2.5} />
              Sign Up & Install App
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
