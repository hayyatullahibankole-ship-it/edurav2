import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Clock,
  Target,
  Users,
  Trophy,
  FileText,
  Video,
  MessageCircle,
  ArrowRight,
  CheckCircle,
  LogIn,
} from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-students.jpg";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";
import ScheduleTestModal from "@/components/ScheduleTestModal";
import { useAuth } from "@/hooks/useAuth";
import { useInstalledApp } from "@/hooks/useInstalledApp";
import { useIsMobile } from "@/hooks/use-mobile";
import { Download } from "lucide-react";
const Home = () => {
  const { user } = useAuth();
  const { isInstalledApp } = useInstalledApp();
  const isMobile = useIsMobile();
  const isMobileWeb = isMobile && !isInstalledApp;
  const features = [
    {
      icon: <Target className="h-6 w-6" />,
      title: "WAEC & JAMB Practice",
      description: "Comprehensive question banks for both WAEC and JAMB examinations",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Timed Simulations",
      description: "Practice with real exam timing and interface for better preparation",
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "Performance Analytics",
      description: "Track your progress with detailed analytics and recommendations",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Expert Consultation",
      description: "Book 1-on-1 sessions with experienced tutors and mentors",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Study Resources",
      description: "Access past questions, study guides, and comprehensive notes",
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: "Video Tutorials",
      description: "Learn difficult topics with our expert-created video content",
    },
  ];
  const subjects = [
    "English Language",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Geography",
    "Economics",
    "Government",
    "Literature",
    "History",
  ];
  const benefits = [
    "Unlimited practice tests",
    "Detailed performance analytics",
    "Access to past questions (2015-2024)",
    "Expert consultation booking",
    "Video tutorials & study guides",
    "Mobile & web access",
  ];
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(16, 185, 129, 0.85), rgba(59, 130, 246, 0.85)), url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/10" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30 transition-all px-6 py-2 text-sm font-medium backdrop-blur-sm">
              ✨ Trusted by 50,000+ Students Nationwide
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight animate-fade-in-up text-white drop-shadow-lg">
              Master WAEC & JAMB
              <span className="block mt-2 text-white">with Smart CBT Practice</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-white/95 max-w-3xl mx-auto leading-relaxed font-light drop-shadow-md">
              Access thousands of practice questions, detailed analytics, and expert guidance. Join successful students
              who achieved their dream scores.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              {isMobileWeb ? (
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all px-8 py-6 text-lg font-semibold"
                  >
                    <LogIn className="mr-2 h-6 w-6" />
                    Get Started
                  </Button>
                </Link>
              ) : user ? (
                <ScheduleTestModal defaultExamType="jamb">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all px-8 py-6 text-lg font-semibold"
                  >
                    Start JAMB Practice
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                </ScheduleTestModal>
              ) : (
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all px-8 py-6 text-lg font-semibold"
                  >
                    Start JAMB Practice
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                </Link>
              )}
              <Link to="/demo" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 shadow-lg transition-all px-8 py-6 text-lg font-semibold"
                >
                  View Demo
                </Button>
              </Link>
            </div>
            <div className="mt-8 text-center">
              <Link to="/school-landing">
                <Button
                  size="lg"
                  variant="secondary"
                  className="border-2 border-white/40 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all px-6 py-3 font-semibold"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Register as a School
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Practice Section */}
      <section className="py-20 md:py-24 bg-gradient-to-b from-background via-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-medium">
              Start Practicing Now
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Choose Your Exam Practice
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Practice with authentic JAMB and WAEC exam conditions and timing
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="group text-center hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/60 hover:scale-105 bg-gradient-to-br from-card to-primary/5">
              <CardHeader className="pb-6">
                <div className="mx-auto bg-gradient-to-br from-primary to-primary/80 w-20 h-20 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <Target className="h-10 w-10" />
                </div>
                <CardTitle className="text-3xl mb-3 font-bold">JAMB Practice</CardTitle>
                <CardDescription className="text-base">
                  Practice with 180 questions (English + 3 subjects) in 120 minutes - official JAMB format
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    120 minutes
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    180 questions total
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Trophy className="h-4 w-4" />
                    Score out of 400
                  </div>
                </div>
                {isMobileWeb ? (
                  <Link to="/install-app">
                    <Button className="w-full" size="lg">
                      <Download className="mr-2 h-5 w-5" />
                      Install App
                    </Button>
                  </Link>
                ) : user ? (
                  <ScheduleTestModal defaultExamType="jamb">
                    <Button className="w-full" size="lg">
                      Start JAMB Practice
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </ScheduleTestModal>
                ) : (
                  <Link to="/auth">
                    <Button className="w-full" size="lg">
                      Start JAMB Practice
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card className="group text-center hover:shadow-2xl transition-all duration-500 border-2 hover:border-accent/60 hover:scale-105 bg-gradient-to-br from-card to-accent/5">
              <CardHeader className="pb-6">
                <div className="mx-auto bg-gradient-to-br from-accent to-accent/80 w-20 h-20 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <BookOpen className="h-10 w-10" />
                </div>
                <CardTitle className="text-3xl mb-3 font-bold">WAEC Practice</CardTitle>
                <CardDescription className="text-base">
                  Subject-based practice with 50-60 questions per paper - authentic WAEC experience
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Subject-specific timing
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    50-60 questions per paper
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Trophy className="h-4 w-4" />
                    A1-F9 grading system
                  </div>
                </div>
                {isMobileWeb ? (
                  <Link to="/install-app">
                    <Button className="w-full" size="lg" variant="secondary">
                      <Download className="mr-2 h-5 w-5" />
                      Install App
                    </Button>
                  </Link>
                ) : user ? (
                  <ScheduleTestModal defaultExamType="waec">
                    <Button className="w-full" size="lg" variant="secondary">
                      Start WAEC Practice
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </ScheduleTestModal>
                ) : (
                  <Link to="/auth">
                    <Button className="w-full" size="lg" variant="secondary">
                      Start WAEC Practice
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-medium">
              Powerful Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Comprehensive tools and resources designed specifically for WAEC and JAMB success
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group text-center hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-primary/30 bg-gradient-to-br from-card to-muted/20"
              >
                <CardHeader className="pb-4">
                  <div className="mx-auto bg-gradient-to-br from-primary/10 to-accent/10 w-16 h-16 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform shadow-sm">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold mb-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="py-24 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-medium">
              All Subjects Covered
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Practice All WAEC & JAMB Subjects
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Complete coverage of all examination subjects with up-to-date question banks
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
            {subjects.map((subject, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-6 py-3 text-base font-medium hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                {subject}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-medium">
                Why Students Love Us
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Why Choose Edura?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of students who achieved their target scores with our platform
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-5 group hover:translate-x-2 transition-transform">
                    <div className="bg-gradient-to-br from-accent/20 to-primary/20 p-3 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                      <CheckCircle className="h-6 w-6 text-accent" />
                    </div>
                    <span className="text-lg font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              <Card className="p-10 bg-gradient-to-br from-primary/5 to-accent/5 border-2 shadow-2xl">
                <div className="text-center space-y-8">
                  <div className="space-y-2">
                    <div className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      92%
                    </div>
                    <p className="text-muted-foreground text-lg font-medium">Average Score Improvement</p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-5xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                      50,000+
                    </div>
                    <p className="text-muted-foreground text-lg font-medium">Students Registered</p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      98%
                    </div>
                    <p className="text-muted-foreground text-lg font-medium">Success Rate</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">Ready to Ace Your Exams?</h2>
            <p className="text-xl md:text-2xl mb-12 opacity-95 leading-relaxed font-light max-w-2xl mx-auto">
              Start your journey to exam success today. Free trial available - no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link to={isMobileWeb ? "/install-app" : "/auth"} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 shadow-2xl hover:shadow-3xl transition-all px-10 py-6 text-lg font-semibold"
                >
                  {isMobileWeb ? (
                    <>
                      <Download className="mr-2 h-6 w-6" />
                      Install App
                    </>
                  ) : (
                    <>
                      Start Free Trial
                      <ArrowRight className="ml-2 h-6 w-6" />
                    </>
                  )}
                </Button>
              </Link>
              <Link to="/payment" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-white/10 backdrop-blur-sm text-white border-white/40 hover:bg-white/20 shadow-lg transition-all px-10 py-6 text-lg font-semibold"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section - Moved to AKBOY */}
      {/* <BlogSection /> */}

      {/* Footer */}
      <Footer />
    </div>
  );
};
export default Home;
