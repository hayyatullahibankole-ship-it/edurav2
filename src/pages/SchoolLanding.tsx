import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  School, 
  Users, 
  TrendingUp, 
  BarChart3, 
  Shield,
  CheckCircle2,
  ArrowRight,
  Clock,
  Award,
  Target,
  Bell,
  FileText,
  Zap,
  GraduationCap,
  Brain,
  Globe,
  Sparkles,
  Home,
  LayoutDashboard
} from "lucide-react";
import Footer from "@/components/Footer";
import schoolHero from "@/assets/school-hero.jpg";
import dashboardPreview from "@/assets/school-dashboard-preview.jpg";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function SchoolLanding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSchoolAdmin, setIsSchoolAdmin] = useState(false);

  useEffect(() => {
    const checkSchoolAdmin = async () => {
      if (!user) {
        setIsSchoolAdmin(false);
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!userData) return;

      const { data: school } = await supabase
        .from("schools")
        .select("id")
        .eq("admin_user_id", userData.id)
        .maybeSingle();

      setIsSchoolAdmin(!!school);
    };

    checkSchoolAdmin();
  }, [user]);

  const stats = [
    { number: "500+", label: "Schools Registered", icon: School },
    { number: "50,000+", label: "Students Practicing", icon: Users },
    { number: "98%", label: "JAMB Pass Rate", icon: TrendingUp },
    { number: "10,000+", label: "Practice Questions", icon: FileText }
  ];

  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Track each student's WAEC, JAMB & NECO preparation progress with comprehensive dashboards"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Monitor performance across all subjects with advanced analytics and insights"
    },
    {
      icon: Target,
      title: "CBT Practice Tests",
      description: "Access 10,000+ authentic WAEC, JAMB & NECO questions with instant feedback"
    },
    {
      icon: FileText,
      title: "Detailed Reports",
      description: "Generate and export comprehensive exam performance reports in multiple formats"
    },
    {
      icon: Brain,
      title: "Smart Learning Paths",
      description: "AI-powered recommendations to help students focus on weak areas"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security for all student data, results, and school information"
    }
  ];

  const pricingTiers = [
    { students: "1-50", price: "₦1,000", highlight: false },
    { students: "51-100", price: "₦900", highlight: false },
    { students: "101-200", price: "₦850", highlight: true },
    { students: "201-250", price: "₦800", highlight: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Edura Schools</span>
            </div>
            <div className="flex items-center gap-4">
              {isSchoolAdmin ? (
                <>
                  <Button 
                    variant="ghost"
                    onClick={() => navigate("/")}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Edura Home
                  </Button>
                  <Button 
                    onClick={() => navigate("/school-dashboard")}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost"
                    onClick={() => navigate("/school-login")}
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => navigate("/school-registration")}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={schoolHero} 
            alt="Students learning in modern classroom" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/98 via-background/90 to-primary/20" />
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="space-y-6">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-sm font-semibold text-primary">Trusted by 500+ Schools Nationwide</span>
                  </div>

                  <h1 className="text-5xl md:text-6xl xl:text-7xl font-bold leading-tight">
                    Transforming
                    <span className="block text-gradient-animate mt-2">Exam Preparation</span>
                    <span className="block mt-2">For Nigerian Schools</span>
                  </h1>
                  
                  <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                    Comprehensive CBT platform for WAEC, JAMB & NECO. Monitor student progress, analyze performance, and achieve outstanding results.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/school-registration")}
                    className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:shadow-glow transition-all"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => window.open("https://wa.me/2347050757085?text=Hello,%20I%20want%20to%20schedule%20a%20demo", "_blank")}
                    className="h-14 px-8 text-lg font-semibold border-2 border-primary/30 hover:bg-primary/5 hover:border-primary"
                  >
                    Book a Demo
                  </Button>
                </div>
                
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                    </div>
                    <span>Free 14-day trial</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                    </div>
                    <span>No credit card required</span>
                  </div>
                </div>
              </div>

              {/* Right Content - Feature Cards */}
              <div className="grid grid-cols-1 gap-4">
                {/* Top Card */}
                <Card className="bg-card/95 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/50 hover:shadow-xl transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <BarChart3 className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Real-Time Analytics</h3>
                        <p className="text-sm text-muted-foreground">Track every student's progress with comprehensive performance dashboards and instant insights.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Middle Card - Highlighted */}
                <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm border-2 border-primary hover:border-primary hover:shadow-glow transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                        <Target className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2 text-primary">10,000+ Practice Questions</h3>
                        <p className="text-sm text-muted-foreground">Access authentic WAEC, JAMB & NECO questions with detailed explanations and instant feedback.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bottom Card */}
                <Card className="bg-card/95 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/50 hover:shadow-xl transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Shield className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Enterprise Security</h3>
                        <p className="text-sm text-muted-foreground">Bank-grade encryption protecting all student data, results, and school information.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="text-4xl font-bold">{stat.number}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Premium Design */}
      <section className="py-24 relative bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-sm px-5 py-2.5 rounded-full border border-primary/30">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Flexible Pricing
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Investment in
              <span className="block mt-2 bg-gradient-to-r from-primary via-primary-hover to-secondary bg-clip-text text-transparent">
                Academic Excellence
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Scale pricing designed to grow with your institution. Better rates for larger student bodies.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {pricingTiers.map((tier, index) => (
                <Card 
                  key={index}
                  className={`relative border-2 transition-all duration-300 group cursor-pointer overflow-hidden ${
                    tier.highlight 
                      ? 'border-primary shadow-xl scale-105' 
                      : 'hover:border-primary/50 hover:shadow-lg'
                  }`}
                >
                  {tier.highlight && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                      POPULAR
                    </div>
                  )}
                  <CardContent className="p-8 text-center space-y-6">
                    <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-all ${
                      tier.highlight 
                        ? 'bg-gradient-to-br from-primary/20 to-secondary/20' 
                        : 'bg-gradient-to-br from-muted to-muted/50 group-hover:from-primary/10 group-hover:to-secondary/10'
                    }`}>
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                        {tier.students} students
                      </div>
                      <div className="flex items-start justify-center gap-1 mb-2">
                        <span className="text-2xl font-bold text-primary mt-1">₦</span>
                        <span className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          {tier.price.replace('₦', '')}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">
                        per student / term
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-2 border-primary/30 bg-gradient-to-br from-card via-primary/5 to-secondary/5 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-primary-hover to-secondary" />
              <CardContent className="p-10">
                <div className="flex flex-col lg:flex-row items-start gap-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Clock className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-6 flex-1">
                    <div>
                      <h3 className="text-3xl font-bold mb-3">Complete 3-Month Term Access</h3>
                      <p className="text-lg text-muted-foreground">
                        Everything your school needs for comprehensive WAEC, JAMB & NECO preparation
                      </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { icon: Target, text: "10,000+ WAEC/JAMB/NECO questions" },
                        { icon: BarChart3, text: "Real-time performance analytics" },
                        { icon: Users, text: "Unlimited student management" },
                        { icon: FileText, text: "Export reports (PDF/Excel)" },
                        { icon: Brain, text: "AI-powered weak area detection" },
                        { icon: Shield, text: "Priority 24/7 support" }
                      ].map((benefit, i) => (
                        <div key={i} className="flex items-start gap-3 group">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                            <benefit.icon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium leading-tight">{benefit.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-16 space-y-8">
              <div className="max-w-2xl mx-auto">
                <p className="text-lg text-muted-foreground mb-2">
                  Need more than 250 students?
                </p>
                <p className="text-xl font-semibold">
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Contact us for custom enterprise solutions
                  </span>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <Button 
                  size="lg" 
                  className="text-lg px-12 h-14 shadow-xl hover:shadow-2xl bg-gradient-to-r from-primary to-primary-hover"
                  onClick={() => navigate("/school-registration")}
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-12 h-14 border-2 hover:bg-accent"
                  onClick={() => window.open("https://wa.me/2347050757085?text=Hello,%20I%20want%20to%20learn%20more%20about%20school%20pricing", "_blank")}
                >
                  Talk to Sales
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Enhanced */}
      <section className="py-24 relative bg-gradient-to-b from-background via-muted/10 to-background overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden opacity-40">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20 space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-sm px-5 py-2.5 rounded-full border border-primary/30">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Quick Setup Process
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Get Started in
              <span className="block mt-2 bg-gradient-to-r from-primary via-primary-hover to-secondary bg-clip-text text-transparent">
                Four Simple Steps
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Your school can be fully operational in less than 30 minutes
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  icon: School,
                  title: "Register Your School",
                  description: "Complete our simple registration form. Instant approval within minutes.",
                  color: "from-blue-500/20 to-blue-600/20"
                },
                {
                  step: "02",
                  icon: Award,
                  title: "Choose Your Plan",
                  description: "Select the perfect plan for your student count. Secure online payment.",
                  color: "from-purple-500/20 to-purple-600/20"
                },
                {
                  step: "03",
                  icon: Users,
                  title: "Add Students",
                  description: "Bulk upload via Excel or add students individually. Simple onboarding.",
                  color: "from-pink-500/20 to-pink-600/20"
                },
                {
                  step: "04",
                  icon: BarChart3,
                  title: "Monitor & Excel",
                  description: "Track progress, analyze performance, and guide students to success.",
                  color: "from-green-500/20 to-green-600/20"
                }
              ].map((item, index) => (
                <Card 
                  key={index} 
                  className="relative border-2 hover:border-primary/50 transition-all duration-500 group overflow-hidden hover:shadow-xl"
                >
                  {/* Step number badge */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-3xl font-bold text-primary/30 group-hover:text-primary/50 transition-colors">
                      {item.step}
                    </span>
                  </div>

                  <CardContent className="p-8 space-y-5 relative z-10">
                    <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                      <item.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-bold text-xl">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </CardContent>

                  {/* Connector line (hidden on last item) */}
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
                  )}
                </Card>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Card className="border-2 border-primary/30 bg-gradient-to-br from-card via-primary/5 to-secondary/5 inline-block max-w-md shadow-xl">
                <CardContent className="p-8 space-y-4">
                  <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                    <Bell className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-lg font-semibold">Need assistance getting started?</p>
                  <p className="text-sm text-muted-foreground">Our team is ready to help you set up your school account</p>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-2 hover:bg-accent"
                    onClick={() => window.open("https://wa.me/2347050757085?text=Hello,%20I%20need%20help%20setting%20up%20my%20school%20account", "_blank")}
                  >
                    Contact Support Team
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Premium Design */}
      <section className="py-24 relative bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-sm px-5 py-2.5 rounded-full border border-primary/30">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Comprehensive Platform
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Everything You Need for
              <span className="block mt-2 bg-gradient-to-r from-primary via-primary-hover to-secondary bg-clip-text text-transparent">
                Exam Success
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              A complete ecosystem designed to maximize student performance and school results
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="grid sm:grid-cols-2 gap-6 order-2 lg:order-1">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl group relative overflow-hidden"
                >
                  {/* Subtle gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-secondary/0 group-hover:from-primary/5 group-hover:to-secondary/5 transition-all duration-500" />
                  
                  <CardContent className="p-7 space-y-4 relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Dashboard Preview Image */}
            <div className="relative order-1 lg:order-2">
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-2xl opacity-50" />
                
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-primary/20">
                  <img 
                    src={dashboardPreview} 
                    alt="Comprehensive school dashboard showing student analytics and performance metrics" 
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>

                {/* Floating badges */}
                <div className="absolute -top-8 -left-8 bg-gradient-to-br from-primary to-primary-hover text-primary-foreground px-6 py-4 rounded-2xl shadow-2xl animate-float">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-7 w-7" />
                    <div>
                      <div className="text-xs font-medium opacity-90">Real-time</div>
                      <div className="font-bold text-lg">Analytics</div>
                    </div>
                  </div>
                </div>

                <Card className="absolute -bottom-6 -right-6 bg-card/95 backdrop-blur-sm border-2 shadow-2xl max-w-xs animate-float animation-delay-500">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Student Progress</div>
                        <div className="text-xl font-bold text-green-600">+45%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Premium Design */}
      <section className="py-24 relative bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse animation-delay-1000" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <Card className="border-2 border-primary/30 shadow-2xl max-w-5xl mx-auto overflow-hidden bg-gradient-to-br from-card via-primary/5 to-secondary/5">
            {/* Top accent bar */}
            <div className="h-2 bg-gradient-to-r from-primary via-primary-hover to-secondary" />
            
            <CardContent className="p-12 md:p-16 text-center space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-sm px-5 py-2.5 rounded-full border border-primary/30">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Start Your Free Trial Today
                  </span>
                </div>

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Ready to Transform
                  <span className="block mt-2 bg-gradient-to-r from-primary via-primary-hover to-secondary bg-clip-text text-transparent">
                    Your Students' Results?
                  </span>
                </h2>
                
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Join <span className="font-bold text-primary">500+ schools</span> already using Edura to prepare their students for 
                  <span className="font-semibold text-foreground"> WAEC, JAMB, and NECO success</span>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 justify-center pt-6">
                <Button 
                  size="lg" 
                  className="text-xl px-14 h-16 shadow-xl hover:shadow-2xl bg-gradient-to-r from-primary to-primary-hover transition-all"
                  onClick={() => navigate("/school-registration")}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-xl px-14 h-16 border-2 hover:bg-accent transition-all"
                  onClick={() => window.open("https://wa.me/2347050757085?text=Hello,%20I%20want%20to%20schedule%20a%20demo", "_blank")}
                >
                  Schedule a Demo
                </Button>
              </div>

              <div className="grid sm:grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto">
                {[
                  { icon: CheckCircle2, text: "No credit card required" },
                  { icon: Zap, text: "Instant account setup" },
                  { icon: Shield, text: "24/7 support included" }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 group">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}