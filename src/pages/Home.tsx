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

const Home = () => {
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
              <Link to="/signup">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white">
                  Start Free Practice
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
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
                Why Choose EduCBT?
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
              <Link to="/signup">
                <Button size="lg" variant="secondary">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;