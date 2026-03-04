import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { BookOpen, FileText, LogIn, CheckCircle2, Trophy, BarChart3, ArrowRight } from "lucide-react";
import { useDomainDetection } from "@/hooks/useDomainDetection";

export default function AkboyMockPages() {
  const { isAkboy } = useDomainDetection();
  const basePath = isAkboy ? "" : "/akboy";

  const mockPages = [
    {
      title: "Mock Registration",
      description: "Register for the mock exam and select your preferred subjects",
      icon: FileText,
      path: `${basePath}/mock-registration`,
      color: "from-blue-500 to-cyan-500",
      step: 1,
      details: "Complete your registration, select up to 3 subjects from available options"
    },
    {
      title: "Mock Login",
      description: "Access the mock exam using your registration details",
      icon: LogIn,
      path: `${basePath}/mock-login`,
      color: "from-purple-500 to-pink-500",
      step: 2,
      details: "Log in with your registration number and other required information"
    },
    {
      title: "Mock Exam",
      description: "Take the full mock examination in real exam conditions",
      icon: BookOpen,
      path: `${basePath}/mock-exam`,
      color: "from-emerald-500 to-teal-500",
      step: 3,
      details: "Complete the mock exam with timed questions and interactive interface"
    },
    {
      title: "Exam Submitted",
      description: "Confirmation page after completing the mock exam",
      icon: CheckCircle2,
      path: `${basePath}/mock-submitted`,
      color: "from-green-500 to-emerald-600",
      step: 4,
      details: "View confirmation message and next steps"
    },
    {
      title: "Mock Results",
      description: "View your exam results and performance analysis",
      icon: Trophy,
      path: `${basePath}/mock-results`,
      color: "from-yellow-500 to-orange-500",
      step: 5,
      details: "Check your scores, performance metrics, and detailed feedback"
    },
  ];

  return (
    <AkboyLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <BarChart3 className="h-12 w-12 text-emerald-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Mock Examination Portal
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Complete the mock examination process step by step. Register, login, take the exam, and review your results with detailed performance insights.
            </p>
          </div>

          {/* Process Timeline */}
          <div className="mb-20">
            <div className="hidden md:flex justify-between items-center mb-12">
              {mockPages.map((page, index) => (
                <div key={page.path} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${page.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {page.step}
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mt-2 text-center">{page.title}</p>
                  </div>
                  {index < mockPages.length - 1 && (
                    <div className="flex-1 h-1 bg-gradient-to-r from-emerald-400 to-emerald-200 mx-2"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {mockPages.map((page) => {
              const Icon = page.icon;
              return (
                <Card 
                  key={page.path} 
                  className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden"
                >
                  <div className={`h-2 bg-gradient-to-r ${page.color}`}></div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${page.color} flex items-center justify-center text-white`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`text-sm font-bold text-white bg-gradient-to-r ${page.color} px-3 py-1 rounded-full`}>
                        Step {page.step}
                      </span>
                    </div>
                    <CardTitle className="text-xl text-gray-900">{page.title}</CardTitle>
                    <CardDescription className="text-gray-600 mt-2">{page.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">{page.details}</p>
                    <Button
                      asChild
                      className={`w-full bg-gradient-to-r ${page.color} hover:shadow-lg transition-all group-hover:translate-x-1`}
                    >
                      <Link to={page.path} className="flex items-center justify-between">
                        Access
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Start Section */}
          <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Quick Start Guide</CardTitle>
              <CardDescription>Follow these steps to complete your mock examination</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Register for the Mock Exam</h4>
                    <p className="text-sm text-gray-600">Start by filling out your details and selecting your preferred subjects (maximum 3)</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Login to Your Exam</h4>
                    <p className="text-sm text-gray-600">Use your registration details to log in and start the mock examination</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Complete the Exam</h4>
                    <p className="text-sm text-gray-600">Answer all questions within the time limit. Your answers are automatically saved</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Submit Your Exam</h4>
                    <p className="text-sm text-gray-600">Review your answers and submit when you're ready</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                    5
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">View Results</h4>
                    <p className="text-sm text-gray-600">Check your performance, scores, and detailed feedback for each subject</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Group CTA */}
          <Card className="border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg overflow-hidden">
            <CardContent className="py-6 px-6 text-center space-y-3">
              <h3 className="text-xl font-bold">Join Our WhatsApp Group</h3>
              <p className="text-sm opacity-90">Stay updated on exam schedules, results, and tips from other candidates</p>
              <a href="https://chat.whatsapp.com/JQ61pyPVTfT5MlW1X7P4TH?mode=gi_t" target="_blank" rel="noopener noreferrer">
                <Button className="bg-white text-green-600 hover:bg-white/90 font-bold h-11 px-8 mt-2" size="lg">
                  JOIN NOW
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* CTA Button */}
          <div className="text-center mt-8">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl transition-all"
            >
              <Link to={`${basePath}/mock-registration`} className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Start Mock Examination
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </AkboyLayout>
  );
}
