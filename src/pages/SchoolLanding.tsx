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
  Zap
} from "lucide-react";
import Footer from "@/components/Footer";
import schoolHero from "@/assets/school-hero.jpg";
import dashboardPreview from "@/assets/school-dashboard-preview.jpg";

export default function SchoolLanding() {
  const navigate = useNavigate();

  const stats = [
    { number: "500+", label: "Schools Registered" },
    { number: "50,000+", label: "Students Practicing" },
    { number: "98%", label: "JAMB Pass Rate" },
    { number: "10,000+", label: "Practice Questions" }
  ];

  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Track each student's WAEC, JAMB & NECO preparation progress"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Monitor performance across all subjects and exam types"
    },
    {
      icon: Target,
      title: "CBT Practice Tests",
      description: "Access 10,000+ authentic WAEC, JAMB & NECO questions"
    },
    {
      icon: FileText,
      title: "Detailed Reports",
      description: "Export comprehensive exam performance and readiness reports"
    },
    {
      icon: Bell,
      title: "Progress Tracking",
      description: "Get instant alerts on student performance and weak areas"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Enterprise-grade security for all student data and results"
    }
  ];

  const pricingTiers = [
    { students: "1-50", price: "₦1,000" },
    { students: "51-100", price: "₦900" },
    { students: "101-200", price: "₦850" },
    { students: "201-250", price: "₦800" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Compact & Professional */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                <School className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">WAEC • JAMB • NECO CBT Practice</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Prepare Your Students for
                <span className="text-primary block mt-2">WAEC, JAMB & NECO Success</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Complete CBT practice platform with thousands of past questions, real-time analytics, and comprehensive exam management for WAEC, JAMB, and NECO preparations.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="text-lg px-8 shadow-lg hover:shadow-xl transition-all"
                  onClick={() => navigate("/school-registration")}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8"
                  onClick={() => navigate("/school-login")}
                >
                  Sign In
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">3-Month Plans</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">Flexible Pricing</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">Priority Support</span>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative lg:block animate-scale-in">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/10">
                <img 
                  src={schoolHero} 
                  alt="Students using CBT platform" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -left-6 bg-card border shadow-xl rounded-xl p-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">50,000+</div>
                    <div className="text-sm text-muted-foreground">Active Students</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Simple Pricing</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Affordable Plans for Every School</h2>
            <p className="text-lg text-muted-foreground">
              Transparent pricing based on student count. The more students, the better the rate!
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {pricingTiers.map((tier, index) => (
                <Card 
                  key={index}
                  className="border-2 hover:border-primary hover:shadow-xl transition-all duration-300 group cursor-pointer"
                >
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">
                        {tier.students} students
                      </div>
                      <div className="text-3xl font-bold text-primary">
                        {tier.price}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        per student
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="h-7 w-7 text-primary" />
                  </div>
                  <div className="space-y-4 flex-1">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">3-Month Subscription</h3>
                      <p className="text-muted-foreground">
                        Complete term access for WAEC, JAMB & NECO preparation
                      </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        "10,000+ WAEC/JAMB/NECO questions",
                        "Real-time performance analytics",
                        "Bulk student management",
                        "Export reports (PDF/Excel)",
                        "Subject-specific practice",
                        "Priority 24/7 support"
                      ].map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-12 space-y-6">
              <p className="text-muted-foreground">
                Need more than 250 students? <span className="font-semibold text-foreground">Contact us for custom enterprise pricing</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="text-lg px-10 shadow-lg hover:shadow-xl"
                  onClick={() => navigate("/school-registration")}
                >
                  Start Registration
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-10"
                  onClick={() => window.open("https://wa.me/2347050757085?text=Hello,%20I%20want%20to%20learn%20more%20about%20school%20pricing", "_blank")}
                >
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Simple Process</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Get your school up and running in 4 simple steps
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1 */}
              <Card className="border-2 relative overflow-hidden group hover:border-primary/50 transition-all">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-[3rem] flex items-start justify-end p-3">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <CardContent className="p-6 space-y-4 pt-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <School className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">Register Your School</h3>
                  <p className="text-sm text-muted-foreground">
                    Fill out the registration form with your school details. Get instant approval.
                  </p>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="border-2 relative overflow-hidden group hover:border-primary/50 transition-all">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-[3rem] flex items-start justify-end p-3">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <CardContent className="p-6 space-y-4 pt-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">Choose Your Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a plan based on your student count. Make payment securely online.
                  </p>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="border-2 relative overflow-hidden group hover:border-primary/50 transition-all">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-[3rem] flex items-start justify-end p-3">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <CardContent className="p-6 space-y-4 pt-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">Add Students</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload student list via Excel or add them individually from your dashboard.
                  </p>
                </CardContent>
              </Card>

              {/* Step 4 */}
              <Card className="border-2 relative overflow-hidden group hover:border-primary/50 transition-all">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-[3rem] flex items-start justify-end p-3">
                  <span className="text-2xl font-bold text-primary">4</span>
                </div>
                <CardContent className="p-6 space-y-4 pt-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">Monitor Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Track student practice, view reports, and monitor exam readiness in real-time.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 inline-block">
                <CardContent className="p-6">
                  <p className="text-sm font-medium mb-2">Need help getting started?</p>
                  <Button 
                    variant="outline"
                    onClick={() => window.open("https://wa.me/2347050757085?text=Hello,%20I%20need%20help%20setting%20up%20my%20school%20account", "_blank")}
                  >
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Image */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Powerful Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Complete WAEC, JAMB & NECO Preparation</h2>
            <p className="text-lg text-muted-foreground">
              Everything your students need to excel in their examinations
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
                  <CardContent className="p-6 space-y-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="relative">
              <img 
                src={dashboardPreview} 
                alt="School dashboard preview" 
                className="rounded-2xl shadow-2xl border-4 border-primary/10 w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Give Your Students the Best WAEC, JAMB & NECO Preparation
            </h2>
            <p className="text-xl text-white/90">
              Join hundreds of schools achieving outstanding exam results with our CBT platform
            </p>
            <Button 
              size="lg" 
              className="text-lg px-12 bg-white text-primary hover:bg-white/90 shadow-2xl"
              onClick={() => navigate("/school-registration")}
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}