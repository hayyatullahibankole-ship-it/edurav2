import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, Clock, Target, Users, Trophy, FileText, Video,
  ArrowRight, CheckCircle, LogIn, Star, Smartphone, Shield,
  Zap, BarChart3, Download, ChevronRight, Play
} from "lucide-react";
import { Link } from "react-router-dom";
import phoneMockup from "@/assets/phone-mockup.png";
import eduraLogo from "@/assets/edura-logo.png";
import Footer from "@/components/Footer";
import ScheduleTestModal from "@/components/ScheduleTestModal";
import { useAuth } from "@/hooks/useAuth";
import { useInstalledApp } from "@/hooks/useInstalledApp";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useRef, useState } from "react";

// Animated counter hook
const useCounter = (end: number, duration = 2000, suffix = "") => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = 0;
          const increment = end / (duration / 16);
          let current = start;
          const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref, suffix };
};

const Home = () => {
  const { user } = useAuth();
  const { isInstalledApp } = useInstalledApp();
  const isMobile = useIsMobile();
  const isMobileWeb = isMobile && !isInstalledApp;

  const students = useCounter(50000, 2000, "+");
  const questions = useCounter(25000, 2200, "+");
  const successRate = useCounter(98, 1800, "%");
  const subjects = useCounter(15, 1200, "+");

  const features = [
    {
      icon: <Target className="h-6 w-6" />,
      title: "Smart CBT Engine",
      description: "Real exam simulation with JAMB & WAEC authentic interfaces and timing",
      color: "from-primary to-secondary",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "AI Analytics",
      description: "Track weak topics, get personalized study plans and score predictions",
      color: "from-info to-primary",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Offline Mode",
      description: "Download exams and practice anywhere — no internet needed",
      color: "from-warning to-destructive",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Results",
      description: "Get detailed breakdowns with explanations immediately after each test",
      color: "from-secondary to-primary",
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: "Video Lessons",
      description: "Expert-created tutorials for every topic and difficulty level",
      color: "from-primary to-accent",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "School Portal",
      description: "Dedicated dashboards for schools to monitor student performance",
      color: "from-accent to-info",
    },
  ];

  const testimonials = [
    { name: "Chioma A.", score: "342/400", text: "Edura helped me prepare so well — I scored way above my target in JAMB!", avatar: "CA" },
    { name: "Emeka O.", score: "A1 in 7 subjects", text: "The WAEC practice was exactly like the real thing. I felt so prepared.", avatar: "EO" },
    { name: "Fatima M.", score: "289/400", text: "The AI study plans showed me exactly where to focus. Game changer!", avatar: "FM" },
  ];

  const CTAButton = ({ variant = "primary" }: { variant?: "primary" | "secondary" }) => {
    if (variant === "secondary") {
      return (
        <Link to="/demo">
          <Button size="lg" variant="outline" className="border-2 border-primary/30 bg-card hover:bg-primary/5 px-8 py-6 text-lg font-semibold gap-2 rounded-2xl shadow-sm">
            <Play className="h-5 w-5" />
            Try Demo
          </Button>
        </Link>
      );
    }

    if (isMobileWeb) {
      return (
        <Link to="/auth">
          <Button size="lg" className="px-8 py-6 text-lg font-bold gap-2 rounded-2xl shadow-lg hover:shadow-xl transition-all">
            <LogIn className="h-5 w-5" />
            Get Started Free
          </Button>
        </Link>
      );
    }

    if (user) {
      return (
        <ScheduleTestModal defaultExamType="jamb">
          <Button size="lg" className="px-8 py-6 text-lg font-bold gap-2 rounded-2xl shadow-lg hover:shadow-xl transition-all">
            Start Practice
            <ArrowRight className="h-5 w-5" />
          </Button>
        </ScheduleTestModal>
      );
    }

    return (
      <Link to="/auth">
        <Button size="lg" className="px-8 py-6 text-lg font-bold gap-2 rounded-2xl shadow-lg hover:shadow-xl transition-all">
          Get Started Free
          <ArrowRight className="h-5 w-5" />
        </Button>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ========== HERO ========== */}
      <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-accent/3 blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-semibold text-primary">Nigeria's #1 CBT Practice App</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-6 animate-fade-in-up">
                <span className="text-foreground">Ace Your</span>
                <br />
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  JAMB & WAEC
                </span>
                <br />
                <span className="text-foreground">Exams</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
                Smart CBT practice with real exam interfaces, AI-powered analytics, and 25,000+ questions. Available on web & mobile.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <CTAButton />
                <CTAButton variant="secondary" />
              </div>

              {/* Social proof badges */}
              <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {["bg-primary", "bg-secondary", "bg-info", "bg-warning"].map((bg, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-background flex items-center justify-center`}>
                      <span className="text-[10px] font-bold text-primary-foreground">
                        {["C", "E", "F", "A"][i]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground font-medium">
                  50,000+ students
                </span>
              </div>
            </div>

            {/* Right: Phone mockup */}
            <div className="relative order-1 lg:order-2 flex justify-center">
              <div className="relative">
                {/* Glow behind phone */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-[3rem] blur-3xl scale-90" />
                <img
                  src={phoneMockup}
                  alt="Edura CBT Practice App"
                  className="relative w-64 sm:w-72 md:w-80 lg:w-96 drop-shadow-2xl animate-float mx-auto"
                />
                {/* Floating badges */}
                <div className="absolute -left-4 top-1/4 bg-card border border-border rounded-2xl px-4 py-3 shadow-lg animate-fade-in hidden sm:flex items-center gap-3" style={{ animationDelay: "0.5s" }}>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg. Improvement</p>
                    <p className="text-sm font-bold text-foreground">+92 points</p>
                  </div>
                </div>
                <div className="absolute -right-4 bottom-1/3 bg-card border border-border rounded-2xl px-4 py-3 shadow-lg animate-fade-in hidden sm:flex items-center gap-3" style={{ animationDelay: "0.8s" }}>
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                    <p className="text-sm font-bold text-foreground">98%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== STATS BAR ========== */}
      <section className="py-8 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { ref: students.ref, count: students.count, suffix: "+", label: "Students", icon: <Users className="h-5 w-5" /> },
              { ref: questions.ref, count: questions.count, suffix: "+", label: "Questions", icon: <FileText className="h-5 w-5" /> },
              { ref: successRate.ref, count: successRate.count, suffix: "%", label: "Success Rate", icon: <Trophy className="h-5 w-5" /> },
              { ref: subjects.ref, count: subjects.count, suffix: "+", label: "Subjects", icon: <BookOpen className="h-5 w-5" /> },
            ].map((stat, i) => (
              <div key={i} ref={stat.ref} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-primary">{stat.icon}</span>
                  <span className="text-2xl md:text-3xl font-black text-foreground">
                    {stat.count.toLocaleString()}{stat.suffix}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== EXAM CARDS ========== */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-medium">
              Practice Modes
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black mb-4 text-foreground">
              Choose Your Exam
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Authentic exam simulations built to match the real thing
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* JAMB Card */}
            <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl rounded-3xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-5 shadow-md">
                  <Target className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-foreground">JAMB UTME</h3>
                <p className="text-muted-foreground mb-5">180 questions · 120 minutes · Scored out of 400</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {["English", "+3 Subjects", "Real Format"].map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
                {isMobileWeb ? (
                  <Link to="/auth"><Button className="w-full rounded-xl" size="lg">Start JAMB Practice <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
                ) : user ? (
                  <ScheduleTestModal defaultExamType="jamb"><Button className="w-full rounded-xl" size="lg">Start JAMB Practice <ArrowRight className="ml-2 h-4 w-4" /></Button></ScheduleTestModal>
                ) : (
                  <Link to="/auth"><Button className="w-full rounded-xl" size="lg">Start JAMB Practice <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
                )}
              </CardContent>
            </Card>

            {/* WAEC Card */}
            <Card className="group relative overflow-hidden border-2 hover:border-secondary/50 transition-all duration-300 hover:shadow-xl rounded-3xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-info flex items-center justify-center mb-5 shadow-md">
                  <BookOpen className="h-7 w-7 text-secondary-foreground" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-foreground">WAEC SSCE</h3>
                <p className="text-muted-foreground mb-5">50-60 questions · Per subject · A1-F9 grading</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {["All Subjects", "Past Questions", "Auto-Grade"].map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
                {isMobileWeb ? (
                  <Link to="/auth"><Button className="w-full rounded-xl" size="lg" variant="secondary">Start WAEC Practice <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
                ) : user ? (
                  <ScheduleTestModal defaultExamType="waec"><Button className="w-full rounded-xl" size="lg" variant="secondary">Start WAEC Practice <ArrowRight className="ml-2 h-4 w-4" /></Button></ScheduleTestModal>
                ) : (
                  <Link to="/auth"><Button className="w-full rounded-xl" size="lg" variant="secondary">Start WAEC Practice <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ========== FEATURES GRID ========== */}
      <section className="py-20 md:py-28 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-medium">
              Built for Success
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black mb-4 text-foreground">
              More Than Just Practice
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              A complete exam preparation platform packed with smart tools
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <Card key={i} className="group border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 rounded-2xl bg-card">
                <CardContent className="p-7">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 text-primary-foreground group-hover:scale-110 transition-transform shadow-sm`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-medium">
              Student Stories
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black mb-4 text-foreground">
              Real Results, Real Students
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <Card key={i} className="border border-border/50 rounded-2xl hover:shadow-lg transition-all">
                <CardContent className="p-7">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed italic">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-foreground">{t.avatar}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{t.name}</p>
                      <p className="text-xs text-primary font-semibold">{t.score}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ========== DOWNLOAD / SCHOOL CTA ========== */}
      <section className="py-20 md:py-28 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Download Card */}
            <Card className="border-2 border-primary/20 rounded-3xl overflow-hidden bg-gradient-to-br from-card to-primary/5">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-5 shadow-md">
                  <Smartphone className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-black mb-3 text-foreground">Get the App</h3>
                <p className="text-muted-foreground mb-6">
                  Download Edura on your phone for the best exam practice experience
                </p>
                <Link to="/install-app">
                  <Button size="lg" className="rounded-xl px-8 gap-2">
                    <Download className="h-5 w-5" />
                    Download Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* School Card */}
            <Card className="border-2 border-info/20 rounded-3xl overflow-hidden bg-gradient-to-br from-card to-info/5">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-info to-primary flex items-center justify-center mx-auto mb-5 shadow-md">
                  <Users className="h-8 w-8 text-info-foreground" />
                </div>
                <h3 className="text-2xl font-black mb-3 text-foreground">For Schools</h3>
                <p className="text-muted-foreground mb-6">
                  Register your school and monitor student exam preparation progress
                </p>
                <Link to="/school-landing">
                  <Button size="lg" variant="outline" className="rounded-xl px-8 gap-2 border-2 border-info/30 hover:bg-info/5">
                    <ChevronRight className="h-5 w-5" />
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 text-primary-foreground leading-tight">
              Start Practicing Today
            </h2>
            <p className="text-lg md:text-xl mb-10 text-primary-foreground/90 max-w-xl mx-auto leading-relaxed">
              Join 50,000+ students already using Edura to prepare for their JAMB and WAEC exams. Free to start.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-card text-primary hover:bg-card/90 px-10 py-6 text-lg font-bold rounded-2xl shadow-xl">
                  {isMobileWeb ? "Practice Now" : "Start Free Trial"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/payment">
                <Button size="lg" variant="outline" className="bg-primary-foreground/10 backdrop-blur-sm text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/20 px-10 py-6 text-lg font-semibold rounded-2xl">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
