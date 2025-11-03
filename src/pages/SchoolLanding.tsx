import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  School, 
  Users, 
  TrendingUp, 
  FileText, 
  Settings, 
  Bell, 
  BarChart3, 
  Calendar,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function SchoolLanding() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Effortlessly manage student accounts, track performance, and monitor engagement in one centralized dashboard."
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Get detailed insights into student performance with comprehensive charts, trends, and comparison tools."
    },
    {
      icon: Calendar,
      title: "Exam Scheduling",
      description: "Schedule and manage exams for your students with our intuitive exam control system."
    },
    {
      icon: FileText,
      title: "Detailed Reports",
      description: "Generate and export comprehensive reports on student performance and school-wide metrics."
    },
    {
      icon: Bell,
      title: "Real-time Alerts",
      description: "Stay informed with real-time activity feeds and instant notifications about student progress."
    },
    {
      icon: TrendingUp,
      title: "Performance Tracking",
      description: "Monitor top performers, identify struggling students, and track improvement over time."
    },
    {
      icon: Settings,
      title: "Customizable Settings",
      description: "Tailor the platform to your school's needs with flexible configuration options."
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security to protect your school's data and student information."
    }
  ];

  const pricingTiers = [
    { range: "1-50 students", price: "₦1,000 per student" },
    { range: "51-100 students", price: "₦900 per student" },
    { range: "101-200 students", price: "₦850 per student" },
    { range: "201-250 students", price: "₦800 per student" },
    { range: "250+ students", price: "Contact Support" }
  ];

  const benefits = [
    "3-month subscription duration",
    "Unlimited exam access for students",
    "Real-time performance analytics",
    "Export capabilities for reports",
    "Priority customer support",
    "Regular feature updates",
    "Mobile-friendly interface",
    "Bulk student management"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <School className="w-4 h-4 mr-2 inline" />
              For Schools & Educational Institutions
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Empower Your School with
              <span className="text-primary block mt-2">Smart Learning Management</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform how you manage student performance, track progress, and deliver results 
              with our comprehensive school management platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => navigate("/school-registration")}
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6"
                onClick={() => navigate("/school-login")}
              >
                Sign In
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>3-Month Plans</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Flexible Pricing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Priority Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Powerful Features for Modern Schools</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage your school effectively in one platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Affordable Pricing for Every School</h2>
            <p className="text-xl text-muted-foreground">
              Transparent pricing based on your student count. The more students, the better the rate!
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-2">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">3-Month Subscription Plans</CardTitle>
                <CardDescription>Choose the plan that fits your school size</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pricingTiers.map((tier, index) => (
                    <div 
                      key={index}
                      className="flex justify-between items-center p-4 bg-background rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary" />
                        <span className="font-medium">{tier.range}</span>
                      </div>
                      <span className="text-lg font-bold text-primary">{tier.price}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-primary/10 rounded-lg">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    What's Included:
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="text-lg px-12 py-6"
              onClick={() => navigate("/school-registration")}
            >
              Start Your School Registration
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Transform Your School?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of schools already using our platform to deliver better learning outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                size="lg" 
                className="text-lg px-8"
                onClick={() => navigate("/school-registration")}
              >
                Register Your School
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.open("https://wa.me/2349061615303?text=Hello,%20I%20want%20to%20learn%20more%20about%20the%20school%20portal", "_blank")}
              >
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}