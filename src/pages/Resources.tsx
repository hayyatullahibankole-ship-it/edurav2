import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search,
  Download,
  FileText,
  Video,
  BookOpen,
  Clock,
  Star,
  Filter,
  Play,
  Lock
} from "lucide-react";
import { Link } from "react-router-dom";

const Resources = () => {
  const resourceCategories = [
    { name: "All Resources", count: 2450 },
    { name: "Past Questions", count: 850 },
    { name: "Study Guides", count: 320 },
    { name: "Video Tutorials", count: 180 },
    { name: "Practice Tests", count: 650 },
    { name: "Exam Tips", count: 150 }
  ];

  const subjects = [
    "Mathematics", "English Language", "Physics", "Chemistry", "Biology",
    "Geography", "Economics", "Government", "Literature", "History"
  ];

  const featuredResources = [
    {
      type: "PDF",
      title: "JAMB Mathematics Past Questions (2015-2024)",
      description: "Complete collection of JAMB Mathematics questions with detailed solutions",
      subject: "Mathematics",
      year: "2024",
      downloads: 15420,
      rating: 4.9,
      premium: false,
      icon: <FileText className="h-6 w-6" />
    },
    {
      type: "Video",
      title: "Mastering WAEC English Language Comprehension",
      description: "Step-by-step guide to excel in English comprehension passages",
      subject: "English Language", 
      duration: "45 mins",
      views: 8932,
      rating: 4.8,
      premium: true,
      icon: <Video className="h-6 w-6" />
    },
    {
      type: "PDF",
      title: "Chemistry Practical Guide for WAEC",
      description: "Laboratory procedures and experiment analysis for Chemistry practical",
      subject: "Chemistry",
      year: "2024",
      downloads: 12650,
      rating: 4.7,
      premium: false,
      icon: <FileText className="h-6 w-6" />
    },
    {
      type: "Video",
      title: "Physics Problem Solving Techniques",
      description: "Master complex Physics calculations with proven methods",
      subject: "Physics",
      duration: "62 mins",
      views: 6741,
      rating: 4.9,
      premium: true,
      icon: <Video className="h-6 w-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              📚 Resource Library
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Study Resources & Materials
            </h1>
            <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
              Access thousands of study materials, past questions, video tutorials, and expert guides 
              to boost your WAEC and JAMB preparation.
            </p>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                placeholder="Search for resources, subjects, or topics..." 
                className="pl-12 pr-4 py-6 text-lg"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Categories */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Categories */}
            <div className="lg:w-1/4">
              <h3 className="font-semibold mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Categories
              </h3>
              <div className="space-y-2">
                {resourceCategories.map((category, index) => (
                  <button 
                    key={index}
                    className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors flex justify-between items-center"
                  >
                    <span>{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Subjects Filter */}
            <div className="lg:w-3/4">
              <h3 className="font-semibold mb-4">Filter by Subject</h3>
              <div className="flex flex-wrap gap-2">
                {subjects.map((subject, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className="px-3 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Resources</h2>
              <p className="text-muted-foreground">Most popular and highly-rated study materials</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                All PDFs
              </Button>
              <Button variant="outline">
                <Video className="h-4 w-4 mr-2" />
                All Videos
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredResources.map((resource, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${
                      resource.type === 'Video' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {resource.icon}
                    </div>
                    {resource.premium && (
                      <Badge className="bg-accent/10 text-accent border-accent/20">
                        <Lock className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {resource.subject}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {resource.type}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <CardTitle className="text-lg leading-tight mb-2">
                      {resource.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {resource.description}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{resource.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {resource.type === 'Video' ? (
                        <>
                          <Clock className="h-4 w-4" />
                          <span>{resource.duration}</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          <span>{resource.downloads?.toLocaleString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    variant={resource.premium ? "default" : "outline"}
                    disabled={resource.premium}
                  >
                    {resource.type === 'Video' ? (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        {resource.premium ? 'Premium Required' : 'Watch Video'}
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        {resource.premium ? 'Premium Required' : 'Download PDF'}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA */}
      <section className="py-20 bg-gradient-to-r from-accent/10 to-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-4xl mx-auto text-center p-8">
            <CardHeader>
              <div className="mx-auto bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="text-3xl mb-4">
                Unlock Premium Resources
              </CardTitle>
              <CardDescription className="text-lg">
                Get access to exclusive video tutorials, detailed study guides, and premium past questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Video className="h-5 w-5 text-accent" />
                  <span>150+ Video Tutorials</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-5 w-5 text-accent" />
                  <span>500+ Premium PDFs</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Download className="h-5 w-5 text-accent" />
                  <span>Unlimited Downloads</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/pricing">
                  <Button size="lg" className="bg-accent hover:bg-accent/90">
                    Upgrade to Premium
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="lg" variant="outline">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Resources;