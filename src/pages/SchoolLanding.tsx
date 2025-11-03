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
  Zap,
  Clock,
  Award
} from "lucide-react";
import Footer from "@/components/Footer";

export default function SchoolLanding() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Track every student's progress with detailed analytics and performance metrics"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Real-time insights with comprehensive charts and comparison tools"
    },
    {
      icon: TrendingUp,
      title: "Performance Tracking",
      description: "Monitor top performers and identify areas needing attention"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Enterprise-grade security protecting your school's data"
    }
  ];

  const pricingTiers = [
    { students: "1-50", price: "₦1,000", highlight: false },
    { students: "51-100", price: "₦900", highlight: false },
    { students: "101-200", price: "₦850", highlight: true },
    { students: "201-250", price: "₦800", highlight: false },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient */}
      <section className="relative min-h-[80vh] flex items-center bg-gradient-to-br from-primary via-primary/90 to-secondary overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <School className="w-4 h-4" />
              <span className="text-sm font-medium">Transform Your School's Learning</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Smart Management for
              <span className="block mt-2 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Modern Schools
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Empower your students with comprehensive CBT practice. Track performance, 
              manage exams, and drive results—all in one powerful platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button 
                size="lg" 
                className="text-lg px-10 py-7 bg-white text-primary hover:bg-white/90 shadow-2xl"
                onClick={() => navigate("/school-registration")}
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-10 py-7 border-2 border-white text-white hover:bg-white/10"
                onClick={() => navigate("/school-login")}
              >
                Sign In
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 pt-12 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-300" />
                <span>3-Month Plans</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-300" />
                <span>Flexible Pricing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-300" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">Everything Your School Needs</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A complete management solution built for educational excellence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-8 space-y-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Simple Pricing</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">Affordable for Every School</h2>
            <p className="text-xl text-muted-foreground">
              Transparent pricing that scales with your student count
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {pricingTiers.map((tier, index) => (
                <Card 
                  key={index}
                  className={`relative overflow-hidden ${
                    tier.highlight 
                      ? 'border-2 border-primary shadow-xl scale-105' 
                      : 'border shadow-lg hover:shadow-xl'
                  } transition-all duration-300`}
                >
                  {tier.highlight && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                      Popular
                    </div>
                  )}
                  <CardContent className="p-8 text-center space-y-4">
                    <Users className="h-8 w-8 text-primary mx-auto" />
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
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

            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-4 flex-1">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">3-Month Subscription</h3>
                      <p className="text-muted-foreground">
                        Full access to all features for a complete term
                      </p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        "Unlimited exam access",
                        "Real-time analytics",
                        "Bulk student management",
                        "Export reports",
                        "Priority support",
                        "Regular updates"
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

            <div className="text-center mt-8">
              <p className="text-muted-foreground mb-6">
                Need more than 250 students? Contact us for custom enterprise pricing
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="text-lg px-10"
                  onClick={() => navigate("/school-registration")}
                >
                  Start Registration
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => window.open("https://wa.me/2349061615303?text=Hello,%20I%20want%20to%20learn%20more%20about%20school%20pricing", "_blank")}
                >
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary to-secondary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Ready to Elevate Your School's Performance?
            </h2>
            <p className="text-xl text-white/90">
              Join forward-thinking schools using our platform to deliver exceptional results
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                className="text-lg px-10 bg-white text-primary hover:bg-white/90"
                onClick={() => navigate("/school-registration")}
              >
                Get Started Today
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-10 border-2 border-white text-white hover:bg-white/10"
                onClick={() => window.open("https://wa.me/2349061615303?text=Hello,%20I%20want%20to%20learn%20more%20about%20the%20school%20portal", "_blank")}
              >
                Talk to Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}