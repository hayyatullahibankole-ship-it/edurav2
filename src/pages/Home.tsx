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
  CheckCircle
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
      description: "Comprehensive question banks for both WAEC and JAMB examinations"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Timed Simulations",
      description: "Practice with real exam timing and interface for better preparation"
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "Performance Analytics",
      description: "Track your progress with detailed analytics and recommendations"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Expert Consultation",
      description: "Book 1-on-1 sessions with experienced tutors and mentors"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Study Resources",
      description: "Access past questions, study guides, and comprehensive notes"
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: "Video Tutorials",
      description: "Learn difficult topics with our expert-created video content"
    }
  ];

  const subjects = [
    "English Language", "Mathematics", "Physics", "Chemistry", "Biology",
    "Geography", "Economics", "Government", "Literature", "History"
  ];

  const benefits = [
    "Unlimited practice tests",
    "Detailed performance analytics", 
    "Access to past questions (2015-2024)",
    "Expert consultation booking",
    "Video tutorials & study guides",
    "Mobile & web access"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10"
          style={{
            backgroundImage: `linear-gradient(rgba(30, 64, 175, 0.8), rgba(5, 150, 105, 0.8)), url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              🎓 Trusted by 50,000+ Students
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Master WAEC & JAMB with 
              <span className="block text-accent"> Smart CBT Practice</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Access thousands of practice questions, detailed analytics, and expert guidance. 
              Join successful students who achieved their dream scores.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isMobileWeb ? (
                <Link to="/install-app">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-white">
                    <Download className="mr-2 h-5 w-5" />
                    Install App
                  </Button>
                </Link>
              ) : user ? (
                <ScheduleTestModal defaultExamType="jamb">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-white">
                    Start JAMB Practice
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </ScheduleTestModal>
              ) : (
                <Link to="/auth">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-white">
                    Start JAMB Practice
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Link to="/demo">
                <Button size="lg" variant="outline" className="bg-card text-foreground border-primary-foreground hover:bg-card/90">
                  View Demo
                </Button>
              </Link>
            </div>
            <div className="mt-6 text-center">
              <Link to="/schools">
                <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                  <Users className="mr-2 h-5 w-5" />
                  Register as a School
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Practice Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose Your Exam Practice
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Practice with authentic JAMB and WAEC exam conditions and timing
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
              <CardHeader className="pb-6">
                <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center text-primary mb-4">
                  <Target className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl mb-2">JAMB Practice</CardTitle>
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

            <Card className="text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-accent/50">
              <CardHeader className="pb-6">
                <div className="mx-auto bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center text-accent mb-4">
                  <BookOpen className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl mb-2">WAEC Practice</CardTitle>
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
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools and resources designed specifically for WAEC and JAMB success
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Practice All WAEC & JAMB Subjects
            </h2>
            <p className="text-xl text-muted-foreground">
              Complete coverage of all examination subjects with up-to-date question banks
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {subjects.map((subject, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="px-4 py-2 text-sm hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                {subject}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose Edura?
              </h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of students who achieved their target scores with our platform
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="bg-accent/10 p-2 rounded-full">
                      <CheckCircle className="h-5 w-5 text-accent" />
                    </div>
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <Card className="p-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">92%</div>
                  <p className="text-muted-foreground mb-4">Average Score Improvement</p>
                  
                  <div className="text-3xl font-bold text-accent mb-2">50,000+</div>
                  <p className="text-muted-foreground mb-4">Students Registered</p>
                  
                  <div className="text-3xl font-bold text-warning mb-2">98%</div>
                  <p className="text-muted-foreground">Success Rate</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Ace Your Exams?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Start your journey to exam success today. Free trial available - no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={isMobileWeb ? "/install-app" : "/auth"}>
                <Button size="lg" variant="secondary">
                  {isMobileWeb ? (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      Install App
                    </>
                  ) : (
                    <>
                      Start Free Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </Link>
              <Link to="/payment">
                <Button size="lg" variant="outline" className="bg-card text-foreground border-primary-foreground hover:bg-card/90">
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