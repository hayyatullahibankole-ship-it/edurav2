import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  BookOpen, 
  Target, 
  Settings, 
  Plus,
  CheckCircle2,
  Lock,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { Link } from "react-router-dom";

interface ScheduleTestModalProps {
  children: React.ReactNode;
}

const ScheduleTestModal: React.FC<ScheduleTestModalProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const { isPremium, loading: subscriptionLoading } = useSubscription();
  const [testConfig, setTestConfig] = useState({
    title: "",
    description: "",
    examType: "",
    duration: 90,
    date: new Date() as Date | undefined,
    time: "",
    subjects: [] as string[],
    difficulty: "mixed",
    questionCount: 40,
    autoSubmit: true,
    showResults: true
  });

  const examTypes = [
    { value: "jamb", label: "JAMB Practice", description: "Joint Admissions and Matriculation Board" },
    { value: "waec", label: "WAEC Practice", description: "West African Examinations Council" },
    { value: "neco", label: "NECO Practice", description: "National Examinations Council" },
    { value: "post-utme", label: "Post-UTME", description: "University Entrance Examination" },
    { value: "custom", label: "Custom Test", description: "Create your own test format" }
  ];

  const subjects = [
    "Mathematics", "English Language", "Physics", "Chemistry", 
    "Biology", "Economics", "Geography", "Literature", 
    "Government", "History", "Agricultural Science", "Commerce"
  ];

  const difficulties = [
    { value: "easy", label: "Easy", description: "Basic concepts and simple problems" },
    { value: "medium", label: "Medium", description: "Standard exam-level difficulty" },
    { value: "hard", label: "Hard", description: "Advanced and challenging questions" },
    { value: "mixed", label: "Mixed", description: "Combination of all difficulty levels" }
  ];

  const handleSubjectToggle = (subject: string) => {
    setTestConfig(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleScheduleTest = () => {
    if (!testConfig.title || !testConfig.examType || testConfig.subjects.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Here you would typically save to database
    toast({
      title: "Test Started Successfully!",
      description: `${testConfig.title} has been started`,
    });
    
    setOpen(false);
    setStep(1);
    setTestConfig({
      title: "",
      description: "",
      examType: "",
      duration: 90,
      date: new Date(),
      time: "",
      subjects: [],
      difficulty: "mixed",
      questionCount: 40,
      autoSubmit: true,
      showResults: true
    });
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        {examTypes.map((type) => (
          <Card 
            key={type.value}
            className={`cursor-pointer transition-all hover:shadow-md ${
              testConfig.examType === type.value ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => setTestConfig(prev => ({ ...prev, examType: type.value }))}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{type.label}</CardTitle>
                {testConfig.examType === type.value && (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                )}
              </div>
              <CardDescription className="text-sm">{type.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={() => setStep(2)}
          disabled={!testConfig.examType}
        >
          Next: Configure Test
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Test Title *</Label>
          <Input
            id="title"
            value={testConfig.title}
            onChange={(e) => setTestConfig(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., JAMB Practice Test - Week 1"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Select value={testConfig.duration.toString()} onValueChange={(value) => 
            setTestConfig(prev => ({ ...prev, duration: parseInt(value) }))
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="60">1 Hour</SelectItem>
              <SelectItem value="90">1.5 Hours</SelectItem>
              <SelectItem value="120">2 Hours</SelectItem>
              <SelectItem value="150">2.5 Hours</SelectItem>
              <SelectItem value="180">3 Hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={testConfig.description}
          onChange={(e) => setTestConfig(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Add any additional notes about this test..."
          rows={3}
        />
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button onClick={() => setStep(3)}>
          Next: Select Subjects
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium mb-4 block">Select Subjects *</Label>
        <div className="grid md:grid-cols-3 gap-3">
          {subjects.map((subject) => (
            <div
              key={subject}
              className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                testConfig.subjects.includes(subject) ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => handleSubjectToggle(subject)}
            >
              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={testConfig.subjects.includes(subject)}
                  onChange={() => {}}
                />
                <span className="text-sm font-medium">{subject}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Selected: {testConfig.subjects.length} subjects
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Difficulty Level</Label>
          <Select value={testConfig.difficulty} onValueChange={(value) => 
            setTestConfig(prev => ({ ...prev, difficulty: value }))
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map((diff) => (
                <SelectItem key={diff.value} value={diff.value}>
                  <div>
                    <div className="font-medium">{diff.label}</div>
                    <div className="text-sm text-muted-foreground">{diff.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="questionCount">Questions per Subject</Label>
          <Select value={testConfig.questionCount.toString()} onValueChange={(value) => 
            setTestConfig(prev => ({ ...prev, questionCount: parseInt(value) }))
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 Questions</SelectItem>
              <SelectItem value="20">20 Questions</SelectItem>
              <SelectItem value="40">40 Questions</SelectItem>
              <SelectItem value="50">50 Questions</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setStep(2)}>
          Back
        </Button>
        <Button onClick={() => setStep(4)} disabled={testConfig.subjects.length === 0}>
          Next: Start Test
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Select Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !testConfig.date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {testConfig.date ? format(testConfig.date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={testConfig.date}
                onSelect={(date) => setTestConfig(prev => ({ ...prev, date }))}
                disabled={(date) => date < new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Select Time</Label>
          <Input
            id="time"
            type="time"
            value={testConfig.time}
            onChange={(e) => setTestConfig(prev => ({ ...prev, time: e.target.value }))}
          />
        </div>
      </div>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Test Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Type:</span> {examTypes.find(t => t.value === testConfig.examType)?.label}
            </div>
            <div>
              <span className="font-medium">Duration:</span> {testConfig.duration} minutes
            </div>
            <div>
              <span className="font-medium">Subjects:</span> {testConfig.subjects.length} selected
            </div>
            <div>
              <span className="font-medium">Questions:</span> {testConfig.questionCount} per subject
            </div>
          </div>
          <div className="text-sm">
            <span className="font-medium">Total Questions:</span> {testConfig.subjects.length * testConfig.questionCount}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setStep(3)}>
          Back
        </Button>
        <Button onClick={handleScheduleTest} className="flex-1">
          <Plus className="mr-2 h-4 w-4" />
          Start Test
        </Button>
      </div>
    </div>
  );

  const stepTitles = {
    1: "Choose Exam Type",
    2: "Test Configuration",
    3: "Select Subjects & Difficulty",
    4: "Start & Confirm"
  };

  // Show premium upgrade if user is not premium
  if (!subscriptionLoading && !isPremium) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Premium Feature
            </DialogTitle>
            <DialogDescription>
              Starting tests requires a premium subscription
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Upgrade to Premium</CardTitle>
                <CardDescription>
                  Unlock unlimited practice tests and advanced features
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2 justify-center">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Unlimited practice tests
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <Target className="h-4 w-4 text-primary" />
                    Detailed performance analytics
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <Users className="h-4 w-4 text-primary" />
                    Priority support
                  </div>
                </div>
                <Link to="/pricing">
                  <Button className="w-full">
                    Upgrade Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {stepTitles[step as keyof typeof stepTitles]}
          </DialogTitle>
          <DialogDescription>
            Step {step} of 4 - Create a comprehensive practice test
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-6">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i + 1 <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {i + 1}
              </div>
              {i < 3 && (
                <div className={`w-12 h-0.5 ${
                  i + 1 < step ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleTestModal;