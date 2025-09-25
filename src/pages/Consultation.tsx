import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar,
  Clock,
  Users,
  Video,
  MessageCircle,
  Star,
  BookOpen,
  Award,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { sendConsultationBooking, contactSupport } from "@/utils/whatsapp";
import { useToast } from "@/hooks/use-toast";

const Consultation = () => {
  const { toast } = useToast();
  const consultationTypes = [
    {
      title: "1-on-1 Academic Consultation",
      description: "Personal guidance sessions with experienced tutors",
      duration: "60 minutes",
      price: "₦3,500",
      features: [
        "Personalized study plan",
        "Subject-specific guidance", 
        "Performance analysis",
        "Exam strategy discussion",
        "Resource recommendations"
      ],
      icon: <Users className="h-6 w-6" />
    },
    {
      title: "Group Study Session", 
      description: "Join other students for collaborative learning",
      duration: "90 minutes",
      price: "₦1,500",
      features: [
        "Interactive group discussions",
        "Peer learning experience",
        "Expert moderation",
        "Topic-focused sessions",
        "Networking opportunities"
      ],
      icon: <Users className="h-6 w-6" />
    },
    {
      title: "Exam Strategy Workshop",
      description: "Master exam techniques and time management",
      duration: "120 minutes", 
      price: "₦2,000",
      features: [
        "Time management techniques",
        "Question analysis strategies",
        "Stress management tips",
        "Mock exam walkthrough",
        "Success mindset training"
      ],
      icon: <Award className="h-6 w-6" />
    }
  ];

  const tutors = [
    {
      name: "Dr. Adaora Nwosu",
      specialty: "Mathematics & Physics",
      experience: "8 years",
      rating: 4.9,
      reviews: 245,
      qualifications: "PhD Mathematics, University of Ibadan",
      avatar: "AN",
      sessions: 1250,
      successRate: "94%"
    },
    {
      name: "Prof. Kemi Olatunji",
      specialty: "English Language & Literature", 
      experience: "12 years",
      rating: 4.8,
      reviews: 198,
      qualifications: "MA English Literature, University of Lagos",
      avatar: "KO",
      sessions: 980,
      successRate: "96%"
    },
    {
      name: "Dr. Ibrahim Hassan",
      specialty: "Chemistry & Biology",
      experience: "6 years", 
      rating: 4.9,
      reviews: 167,
      qualifications: "PhD Biochemistry, Ahmadu Bello University",
      avatar: "IH",
      sessions: 745,
      successRate: "92%"
    }
  ];

  const upcomingSessions = [
    {
      title: "JAMB Mathematics Problem Solving",
      tutor: "Dr. Adaora Nwosu",
      date: "Oct 28, 2024",
      time: "4:00 PM",
      type: "Group Session",
      spots: "5 spots left"
    },
    {
      title: "WAEC English Essay Writing Workshop",
      tutor: "Prof. Kemi Olatunji", 
      date: "Oct 30, 2024",
      time: "2:00 PM",
      type: "Workshop",
      spots: "8 spots left"
    },
    {
      title: "Chemistry Practical Exam Prep",
      tutor: "Dr. Ibrahim Hassan",
      date: "Nov 2, 2024", 
      time: "10:00 AM",
      type: "Group Session",
      spots: "3 spots left"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              🎯 Expert Guidance
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Book Expert Consultation
              <span className="block text-accent">& Mentorship Sessions</span>
            </h1>
            <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
              Get personalized guidance from experienced tutors and mentors. 
              Accelerate your exam preparation with proven strategies and expert insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90">
                <Calendar className="mr-2 h-5 w-5" />
                Book Session Now
              </Button>
              <Button size="lg" variant="outline">
                View Available Tutors
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation Types */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose Your Consultation Type
            </h2>
            <p className="text-xl text-muted-foreground">
              Flexible options to match your learning style and budget
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {consultationTypes.map((type, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center text-primary mb-4">
                    {type.icon}
                  </div>
                  <CardTitle className="text-xl mb-2">{type.title}</CardTitle>
                  <CardDescription className="mb-4">{type.description}</CardDescription>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {type.duration}
                    </div>
                    <div className="text-2xl font-bold text-accent">{type.price}</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {type.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => {
                      try {
                        sendConsultationBooking("Available Tutor", type.title);
                        toast({
                          title: "Opening WhatsApp",
                          description: "You'll be redirected to WhatsApp to complete your booking.",
                        });
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to open WhatsApp. Please try again.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Book Session
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tutors */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Meet Our Expert Tutors
            </h2>
            <p className="text-xl text-muted-foreground">
              Experienced educators with proven track records
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {tutors.map((tutor, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={`/api/placeholder/80/80`} />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {tutor.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{tutor.name}</CardTitle>
                  <CardDescription>{tutor.specialty}</CardDescription>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{tutor.rating}</span>
                    <span className="text-muted-foreground">({tutor.reviews} reviews)</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">{tutor.qualifications}</p>
                    <div className="flex justify-center gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-accent">{tutor.sessions}</span>
                        <p className="text-muted-foreground">Sessions</p>
                      </div>
                      <div>
                        <span className="font-semibold text-accent">{tutor.successRate}</span>
                        <p className="text-muted-foreground">Success Rate</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      variant="outline"
                      onClick={() => {
                        try {
                          contactSupport(`Message for ${tutor.name}`, `I would like to get in touch with ${tutor.name} regarding ${tutor.specialty} tutoring. Please connect me. Thank you!`);
                          toast({
                            title: "Opening WhatsApp",
                            description: "You'll be connected with the tutor via WhatsApp.",
                          });
                        } catch (error) {
                          toast({
                            title: "Error", 
                            description: "Failed to open WhatsApp. Please try again.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => {
                        try {
                          sendConsultationBooking(tutor.name, "1-on-1 consultation");
                          toast({
                            title: "Opening WhatsApp",
                            description: "You'll be redirected to WhatsApp to book your session.",
                          });
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to open WhatsApp. Please try again.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Sessions */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Upcoming Public Sessions
            </h2>
            <p className="text-xl text-muted-foreground">
              Join group sessions and workshops open to all students
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {upcomingSessions.map((session, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{session.type}</Badge>
                        <Badge variant="outline" className="text-accent border-accent">
                          {session.spots}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{session.title}</h3>
                      <p className="text-muted-foreground mb-2">with {session.tutor}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {session.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {session.time}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Video className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                      <Button
                        onClick={() => {
                          try {
                            sendConsultationBooking(session.tutor, session.title);
                            toast({
                              title: "Opening WhatsApp",
                              description: "You'll be redirected to WhatsApp to join this session.",
                            });
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Failed to open WhatsApp. Please try again.",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        Join Session
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Expert Help?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Don't struggle alone. Get the guidance you need to excel in your exams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => {
                  try {
                    contactSupport("General Consultation Inquiry", "I'm interested in booking a consultation session. Please provide me with more information about available tutors and scheduling options. Thank you!");
                    toast({
                      title: "Opening WhatsApp",
                      description: "You'll be connected with our support team via WhatsApp.",
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to open WhatsApp. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book Consultation
              </Button>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="bg-card text-foreground border-primary-foreground hover:bg-card/90">
                  View Pricing Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Consultation;