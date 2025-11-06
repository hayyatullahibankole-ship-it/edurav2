import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayCircle, Download, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  thumbnail?: string;
}

const tutorialCategories = {
  gettingStarted: [
    {
      id: "intro",
      title: "Welcome to Edura Schools",
      description: "Learn the basics of your school dashboard and available features",
      duration: "5:30",
      videoUrl: "",
    },
    {
      id: "setup",
      title: "Initial Setup & Configuration",
      description: "Set up your school profile, preferences, and subscription details",
      duration: "8:15",
      videoUrl: "",
    },
  ],
  students: [
    {
      id: "add-students",
      title: "Adding Students to Your School",
      description: "Learn how to create student accounts individually or in bulk",
      duration: "6:45",
      videoUrl: "",
    },
    {
      id: "manage-students",
      title: "Managing Student Accounts",
      description: "Edit student information, reset passwords, and manage access",
      duration: "7:20",
      videoUrl: "",
    },
    {
      id: "student-progress",
      title: "Tracking Student Progress",
      description: "Monitor individual and class performance using analytics tools",
      duration: "9:10",
      videoUrl: "",
    },
  ],
  exams: [
    {
      id: "create-exam",
      title: "Creating Custom Exams",
      description: "Design and schedule custom exams for your students",
      duration: "10:30",
      videoUrl: "",
    },
    {
      id: "assign-exam",
      title: "Assigning Exams to Students",
      description: "Learn how to assign exams to specific classes or individuals",
      duration: "5:50",
      videoUrl: "",
    },
    {
      id: "monitor-exam",
      title: "Monitoring Active Exams",
      description: "Track real-time exam progress and manage ongoing assessments",
      duration: "7:40",
      videoUrl: "",
    },
  ],
  reports: [
    {
      id: "analytics",
      title: "Understanding Analytics Dashboard",
      description: "Explore the analytics dashboard and key performance metrics",
      duration: "11:20",
      videoUrl: "",
    },
    {
      id: "export-reports",
      title: "Generating & Exporting Reports",
      description: "Create detailed reports and export data for analysis",
      duration: "8:00",
      videoUrl: "",
    },
    {
      id: "performance-insights",
      title: "Performance Insights & Trends",
      description: "Identify weak topics, track improvements, and spot trends",
      duration: "9:45",
      videoUrl: "",
    },
  ],
};

interface VideoCardProps {
  video: VideoTutorial;
}

function VideoCard({ video }: VideoCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="p-0">
        <div className="relative aspect-video bg-muted flex items-center justify-center">
          {video.videoUrl ? (
            <iframe
              src={video.videoUrl}
              title={video.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <PlayCircle className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Video Coming Soon</p>
                <p className="text-xs text-muted-foreground">This tutorial will be available shortly</p>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base line-clamp-2">{video.title}</CardTitle>
          <Badge variant="secondary" className="shrink-0">
            <Clock className="h-3 w-3 mr-1" />
            {video.duration}
          </Badge>
        </div>
        <CardDescription className="text-sm line-clamp-2">
          {video.description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

export default function VideoTutorials() {
  const handleDownloadManual = () => {
    // This would trigger the download of a comprehensive PDF manual
    window.open("/school-manual.pdf", "_blank");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Video Tutorials</h2>
          <p className="text-muted-foreground mt-1">
            Step-by-step guides to help you master the Edura platform
          </p>
        </div>
        <Button onClick={handleDownloadManual} variant="outline" size="lg">
          <Download className="h-4 w-4 mr-2" />
          Download Manual (PDF)
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <PlayCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">Total Tutorials</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">95 min</p>
                <p className="text-xs text-muted-foreground">Total Duration</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">4</p>
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tutorial Categories */}
      <Tabs defaultValue="gettingStarted" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
          <TabsTrigger value="gettingStarted" className="py-2">
            Getting Started
          </TabsTrigger>
          <TabsTrigger value="students" className="py-2">
            Student Management
          </TabsTrigger>
          <TabsTrigger value="exams" className="py-2">
            Exams & Testing
          </TabsTrigger>
          <TabsTrigger value="reports" className="py-2">
            Reports & Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gettingStarted" className="mt-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Getting Started with Edura</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {tutorialCategories.gettingStarted.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="students" className="mt-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Managing Students</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {tutorialCategories.students.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="exams" className="mt-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Creating & Managing Exams</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {tutorialCategories.exams.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="mt-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Analytics & Reporting</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {tutorialCategories.reports.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Additional Resources */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Need More Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Can't find what you're looking for? We're here to help!
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => window.open("https://wa.me/2347050757085?text=Hello,%20I%20need%20help%20with%20Edura%20Schools", "_blank")}
            >
              Contact Support
            </Button>
            <Button variant="outline">
              View Documentation
            </Button>
            <Button variant="outline">
              Schedule a Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
