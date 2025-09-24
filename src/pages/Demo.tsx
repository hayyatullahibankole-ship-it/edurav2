import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  BookOpen, 
  ArrowRight,
  Play,
  CheckCircle,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";

const Demo = () => {
  const demoFeatures = [
    {
      title: "Real Exam Interface",
      description: "Experience the exact same interface used in actual JAMB CBT exams"
    },
    {
      title: "Timer & Navigation", 
      description: "Practice with authentic timing and question navigation system"
    },
    {
      title: "Instant Results",
      description: "Get immediate feedback with detailed performance analytics"
    },
    {
      title: "Subject Coverage",
      description: "Access questions from all WAEC and JAMB subjects"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              🎯 Interactive Demo
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Experience Our CBT Platform
              <span className="block text-accent">Before You Sign Up</span>
            </h1>
            <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
              Take a guided tour through our comprehensive CBT practice environment. 
              See exactly how our platform can help you excel in your exams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/practice">
                <Button size="lg" className="bg-accent hover:bg-accent/90">
                  <Play className="mr-2 h-5 w-5" />
                  Start Demo Test
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline">
                  Skip Demo - Sign Up Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Features */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What You'll Experience in the Demo
            </h2>
            <p className="text-xl text-muted-foreground">
              Get a complete preview of our CBT platform features
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {demoFeatures.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center text-primary mb-4">
                    <CheckCircle className="h-6 w-6" />
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
      </section>

      {/* Demo Preview */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary to-accent text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">JAMB CBT Practice Test</CardTitle>
                    <CardDescription className="text-white/80">
                      Mathematics - Question 1 of 40
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      <span className="font-mono text-lg">2:59:45</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      If 3x + 7 = 25, what is the value of x?
                    </h3>
                    <div className="space-y-3">
                      {['A. 4', 'B. 6', 'C. 8', 'D. 10'].map((option, index) => (
                        <button
                          key={index}
                          className="w-full text-left p-4 rounded-lg border hover:bg-accent/5 hover:border-accent transition-colors"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-6 border-t">
                    <Button variant="outline">Previous</Button>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">
                        Progress: 1/40 questions
                      </span>
                    </div>
                    <Button>Next</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your Preparation?
            </h2>
            <p className="text-xl mb-8 text-muted-foreground">
              Join thousands of students who improved their scores with our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/practice">
                <Button size="lg" className="bg-accent hover:bg-accent/90">
                  <Play className="mr-2 h-5 w-5" />
                  Try Full Demo
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Demo;