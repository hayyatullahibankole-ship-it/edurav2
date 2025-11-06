import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, CheckCircle2, AlertCircle, Info, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function TutorialDocumentation() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Complete Documentation
        </h2>
        <p className="text-muted-foreground mt-1">
          Step-by-step written guides for all Edura Schools features
        </p>
      </div>

      {/* Documentation Tabs */}
      <Tabs defaultValue="getting-started" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="students">Student Management</TabsTrigger>
          <TabsTrigger value="exams">Exams & Testing</TabsTrigger>
          <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
        </TabsList>

        {/* Getting Started */}
        <TabsContent value="getting-started" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Edura Schools</CardTitle>
              <CardDescription>Learn the basics of your school dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="dashboard">
                  <AccordionTrigger>Dashboard Overview</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Your dashboard is the command center for managing your school. Here's what you'll find:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Overview Cards</p>
                          <p className="text-sm text-muted-foreground">Real-time stats showing total students, active exams, and average performance</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Quick Actions</p>
                          <p className="text-sm text-muted-foreground">Fast access buttons for common tasks like creating exams or adding students</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Navigation Menu</p>
                          <p className="text-sm text-muted-foreground">Left sidebar with access to all major sections: Students, Exams, Reports, Settings</p>
                        </div>
                      </div>
                    </div>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Tip</AlertTitle>
                      <AlertDescription>
                        The dashboard updates in real-time as students take exams and complete activities
                      </AlertDescription>
                    </Alert>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="navigation">
                  <AccordionTrigger>Navigation & Menu Structure</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      The navigation is organized to match your workflow:
                    </p>
                    <div className="space-y-3">
                      <div className="border-l-2 border-primary pl-4">
                        <p className="font-medium text-sm">Overview</p>
                        <p className="text-sm text-muted-foreground">Main dashboard with summary stats and quick actions</p>
                      </div>
                      <div className="border-l-2 border-primary pl-4">
                        <p className="font-medium text-sm">Students</p>
                        <p className="text-sm text-muted-foreground">Add, manage, and track all student accounts and performance</p>
                      </div>
                      <div className="border-l-2 border-primary pl-4">
                        <p className="font-medium text-sm">Exams</p>
                        <p className="text-sm text-muted-foreground">Create, assign, and monitor all examinations</p>
                      </div>
                      <div className="border-l-2 border-primary pl-4">
                        <p className="font-medium text-sm">Reports</p>
                        <p className="text-sm text-muted-foreground">Analytics, insights, and exportable reports</p>
                      </div>
                      <div className="border-l-2 border-primary pl-4">
                        <p className="font-medium text-sm">Settings</p>
                        <p className="text-sm text-muted-foreground">School profile, billing, and system preferences</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="setup">
                  <AccordionTrigger>Initial Setup & Configuration</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Follow these steps to configure your school:
                    </p>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>Step 1</Badge>
                          <p className="font-medium text-sm">Complete School Profile</p>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li>Navigate to Settings → School Profile</li>
                          <li>Enter school name, address, and contact details</li>
                          <li>Upload school logo (appears on reports)</li>
                          <li>Set school colors for branding</li>
                          <li>Configure academic year and term dates</li>
                        </ul>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>Step 2</Badge>
                          <p className="font-medium text-sm">Configure Exam Preferences</p>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li>Go to Settings → Exam Preferences</li>
                          <li>Set default exam duration</li>
                          <li>Configure passing marks threshold</li>
                          <li>Enable calculator access if needed</li>
                          <li>Turn on anti-cheat features</li>
                          <li>Set when students can view results</li>
                        </ul>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>Step 3</Badge>
                          <p className="font-medium text-sm">Review Subscription</p>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li>Check Settings → Billing</li>
                          <li>Verify student count limits</li>
                          <li>Upgrade if you need more capacity</li>
                          <li>Set up payment method for auto-renewal</li>
                        </ul>
                      </div>
                    </div>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Important</AlertTitle>
                      <AlertDescription>
                        Your school logo and colors will appear on all generated student reports and certificates
                      </AlertDescription>
                    </Alert>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students */}
        <TabsContent value="students" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>Complete guide to managing student accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="add-individual">
                  <AccordionTrigger>Adding Individual Students</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">To add a single student:</p>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      <li>Navigate to <strong>Students</strong> section</li>
                      <li>Click the <strong>"Add Student"</strong> button</li>
                      <li>Fill in required details:
                        <ul className="list-disc list-inside ml-6 mt-1">
                          <li>Full name</li>
                          <li>Email address (used for login)</li>
                          <li>Student ID or admission number</li>
                          <li>Class or grade level</li>
                        </ul>
                      </li>
                      <li>Either enter a password or click "Auto-generate secure password"</li>
                      <li>Click <strong>"Create Student"</strong></li>
                      <li>Student receives welcome email with login credentials</li>
                    </ol>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Best Practice</AlertTitle>
                      <AlertDescription>
                        Use school email addresses for students when possible. This makes account recovery easier.
                      </AlertDescription>
                    </Alert>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="bulk-upload">
                  <AccordionTrigger>Bulk Student Upload (CSV)</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">Upload many students at once:</p>
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium text-sm mb-2">Step 1: Download Template</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li>Go to Students → Bulk Upload</li>
                          <li>Click "Download CSV Template"</li>
                          <li>Open template in Excel or Google Sheets</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-2">Step 2: Fill in Student Data</p>
                        <p className="text-sm text-muted-foreground mb-2">Required columns:</p>
                        <div className="bg-muted p-3 rounded-md text-sm font-mono">
                          name, email, student_id, class, password
                        </div>
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            Leave password column empty to auto-generate secure passwords
                          </AlertDescription>
                        </Alert>
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-2">Step 3: Upload and Review</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li>Click "Upload CSV File"</li>
                          <li>Select your filled template</li>
                          <li>System validates all data</li>
                          <li>Review preview of students to be created</li>
                          <li>Click "Confirm and Create All"</li>
                          <li>Download credential sheet to distribute</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="edit-students">
                  <AccordionTrigger>Editing Student Information</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">Update student details anytime:</p>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      <li>Go to Students and find the student</li>
                      <li>Click on student name to open details</li>
                      <li>Click "Edit Information"</li>
                      <li>Update any field (name, email, class, ID)</li>
                      <li>Click "Save Changes"</li>
                    </ol>
                    <div className="mt-3">
                      <p className="font-medium text-sm mb-2">What you can edit:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span>Name</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span>Email address</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span>Student ID</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span>Class/Grade</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span>Account status</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span>Password (reset)</span>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="password-reset">
                  <AccordionTrigger>Resetting Student Passwords</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      When students forget passwords:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      <li>Navigate to the student's detail page</li>
                      <li>Click "Reset Password" button</li>
                      <li>System generates a new secure password</li>
                      <li>Copy the new password</li>
                      <li>Share securely with the student (SMS, email, or in person)</li>
                      <li>Advise student to change password after first login</li>
                    </ol>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Security Reminder</AlertTitle>
                      <AlertDescription>
                        Never share passwords through unsecured channels. Use SMS, direct email, or hand delivery.
                      </AlertDescription>
                    </Alert>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="classes">
                  <AccordionTrigger>Organizing Students by Class</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Classes help you organize and assign exams efficiently:
                    </p>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-sm mb-2">Creating Classes</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li>Go to Students → Classes</li>
                          <li>Click "Create New Class"</li>
                          <li>Enter class name (e.g., "SS3 Science A")</li>
                          <li>Add description if needed</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-2">Assigning Students to Classes</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li>Individual: Edit student and select class</li>
                          <li>Bulk: Select multiple students → Actions → "Assign to Class"</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-2">Benefits of Using Classes</p>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground">Assign exams to entire class at once</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground">Generate class-wide performance reports</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground">Filter and view students by class</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground">Compare performance between classes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exams */}
        <TabsContent value="exams" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Creating & Managing Exams</CardTitle>
              <CardDescription>Everything you need to know about examinations</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="create-exam">
                  <AccordionTrigger>Creating a New Exam</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div>
                      <p className="font-medium text-sm mb-2">Step 1: Basic Information</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                        <li>Navigate to Exams → Create New</li>
                        <li>Enter exam title (e.g., "First Term Biology Test")</li>
                        <li>Add description explaining exam purpose</li>
                        <li>Select exam type: JAMB, WAEC, or Custom</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-sm mb-2">Step 2: Configure Settings</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                        <li>Set exam duration (minutes)</li>
                        <li>Set passing marks percentage</li>
                        <li>Choose subjects to include</li>
                        <li>Set number of questions per subject</li>
                        <li>Enable/disable calculator access</li>
                        <li>Configure question randomization</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-sm mb-2">Step 3: Select Questions</p>
                      <p className="text-sm text-muted-foreground mb-2">Two methods available:</p>
                      <div className="space-y-2">
                        <div className="border-l-2 border-primary pl-3">
                          <p className="font-medium text-sm">Manual Selection</p>
                          <p className="text-xs text-muted-foreground">Browse question bank by topic and select specific questions</p>
                        </div>
                        <div className="border-l-2 border-primary pl-3">
                          <p className="font-medium text-sm">Auto-Generate</p>
                          <p className="text-xs text-muted-foreground">System randomly selects questions based on your criteria</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-sm mb-2">Step 4: Preview & Publish</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                        <li>Click "Preview" to see exam as students will</li>
                        <li>Review all questions and settings</li>
                        <li>Make any final adjustments</li>
                        <li>Click "Publish Exam"</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="assign-exam">
                  <AccordionTrigger>Assigning Exams to Students</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">After creating an exam, assign it to students:</p>
                    <div className="space-y-3">
                      <div>
                        <Badge className="mb-2">Method 1: Class Assignment</Badge>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li>Open exam details</li>
                          <li>Click "Assign to Students"</li>
                          <li>Select one or more classes</li>
                          <li>Set start date/time (optional)</li>
                          <li>Set deadline for completion</li>
                          <li>Click "Assign"</li>
                          <li>Students get notified automatically</li>
                        </ol>
                      </div>
                      <div>
                        <Badge className="mb-2">Method 2: Individual Assignment</Badge>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li>Open exam details</li>
                          <li>Click "Assign to Specific Students"</li>
                          <li>Search and select individual students</li>
                          <li>Set custom deadlines per student if needed</li>
                          <li>Add special accommodations (extra time, etc.)</li>
                          <li>Click "Assign"</li>
                        </ol>
                      </div>
                    </div>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Scheduling Tip</AlertTitle>
                      <AlertDescription className="text-xs">
                        Set start times for synchronized exams. Students cannot access the exam until the start time.
                      </AlertDescription>
                    </Alert>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="monitor-exam">
                  <AccordionTrigger>Monitoring Active Exams</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">While exams are in progress:</p>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-sm mb-2">Real-Time Dashboard</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li>Go to Exams → Active Exams</li>
                          <li>See list of students currently taking exam</li>
                          <li>View progress percentage for each student</li>
                          <li>Check time remaining</li>
                          <li>See completion status</li>
                          <li>Dashboard updates every 10 seconds</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-2">Anti-Cheat Monitoring</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li>Tab switches detected and logged</li>
                          <li>Copy-paste attempts recorded</li>
                          <li>Multiple warning flags shown</li>
                          <li>Review alerts after exam completion</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-2">Exam Controls</p>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Extend Time</p>
                              <p className="text-xs text-muted-foreground">Add minutes for whole class or individual</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Pause Exam</p>
                              <p className="text-xs text-muted-foreground">Freeze exam for technical issues</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Force Submit</p>
                              <p className="text-xs text-muted-foreground">Submit exam for student who cannot</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="exam-settings">
                  <AccordionTrigger>Advanced Exam Settings</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-sm mb-2">Question Randomization</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li><strong>Randomize Question Order:</strong> Each student sees questions in different order</li>
                          <li><strong>Randomize Option Order:</strong> A, B, C, D options appear in different order</li>
                          <li><strong>Benefits:</strong> Prevents copying from neighbors in physical classrooms</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-2">Calculator Access</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li>Enable for math, physics, chemistry exams</li>
                          <li>Built-in scientific calculator</li>
                          <li>Students cannot leave exam to use external calculator</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-2">Result Visibility</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li><strong>Immediate:</strong> Students see results right after submission</li>
                          <li><strong>After Deadline:</strong> Results shown when all students complete</li>
                          <li><strong>Manual Release:</strong> You control when to reveal results</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-2">Anti-Cheat Features</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li>Tab switch detection</li>
                          <li>Copy-paste prevention</li>
                          <li>Right-click disable</li>
                          <li>Auto-submit on suspicious activity (optional)</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>Understanding performance data and generating reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="analytics-overview">
                  <AccordionTrigger>Analytics Dashboard Overview</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">The analytics dashboard provides comprehensive insights:</p>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-sm mb-2">Key Metrics</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="border rounded-lg p-3">
                            <p className="font-medium text-sm">Total Students</p>
                            <p className="text-xs text-muted-foreground mt-1">Active student accounts in your school</p>
                          </div>
                          <div className="border rounded-lg p-3">
                            <p className="font-medium text-sm">Exams Completed</p>
                            <p className="text-xs text-muted-foreground mt-1">Total exam attempts across all students</p>
                          </div>
                          <div className="border rounded-lg p-3">
                            <p className="font-medium text-sm">Average Score</p>
                            <p className="text-xs text-muted-foreground mt-1">School-wide performance average</p>
                          </div>
                          <div className="border rounded-lg p-3">
                            <p className="font-medium text-sm">Pass Rate</p>
                            <p className="text-xs text-muted-foreground mt-1">Percentage of students meeting pass threshold</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-2">Performance Charts</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li><strong>Trend Lines:</strong> Performance over time (weekly, monthly, termly)</li>
                          <li><strong>Subject Comparison:</strong> Bar charts comparing performance across subjects</li>
                          <li><strong>Distribution Curves:</strong> Student score distribution</li>
                          <li><strong>Class Comparison:</strong> Performance across different classes</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="student-reports">
                  <AccordionTrigger>Individual Student Reports</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">Generate comprehensive individual reports:</p>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-sm mb-2">How to Generate</p>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li>Go to Students and select a student</li>
                          <li>Click "Generate Report"</li>
                          <li>Choose report type (Progress, Transcript, Summary)</li>
                          <li>Select date range</li>
                          <li>Click "Generate"</li>
                          <li>Preview appears - review before exporting</li>
                          <li>Click "Export to PDF"</li>
                        </ol>
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-2">Report Contents</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li>Student profile and photo</li>
                          <li>All exam scores with grades</li>
                          <li>Subject-wise performance breakdown</li>
                          <li>Weak topics identified</li>
                          <li>Improvement trends</li>
                          <li>Class ranking</li>
                          <li>Attendance record</li>
                          <li>Personalized recommendations</li>
                        </ul>
                      </div>
                    </div>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Reports include your school logo and are formatted professionally for sharing with parents
                      </AlertDescription>
                    </Alert>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="class-reports">
                  <AccordionTrigger>Class & Group Reports</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">Generate reports for entire classes:</p>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-sm mb-2">Class Summary Report</p>
                        <p className="text-sm text-muted-foreground mb-2">Includes:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li>Class average scores</li>
                          <li>Top 10 students</li>
                          <li>Students needing attention</li>
                          <li>Subject-wise class performance</li>
                          <li>Participation rates</li>
                          <li>Common weak topics</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-2">Detailed Class Report</p>
                        <p className="text-sm text-muted-foreground mb-2">Export to Excel with:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li>Full student list with all scores</li>
                          <li>Subject breakdowns per student</li>
                          <li>Attendance records</li>
                          <li>Exam participation tracking</li>
                          <li>Ready for pivot tables and custom analysis</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-2">Comparison Reports</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li>Compare multiple classes side-by-side</li>
                          <li>Identify best-performing classes</li>
                          <li>Spot teaching effectiveness differences</li>
                          <li>Useful for curriculum evaluation</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="insights">
                  <AccordionTrigger>Performance Insights & Recommendations</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">The system automatically generates actionable insights:</p>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-sm mb-2">Weak Topics Detection</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li>System analyzes all exam data</li>
                          <li>Identifies topics with &lt;60% success rate</li>
                          <li>Shows which students struggle with each topic</li>
                          <li>Suggests targeted interventions</li>
                          <li>Tracks if interventions improve scores</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-2">At-Risk Student Identification</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li>Flags students with declining performance</li>
                          <li>Identifies low engagement patterns</li>
                          <li>Highlights students below pass threshold</li>
                          <li>Recommends early intervention strategies</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-2">Improvement Tracking</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li>Monitors month-over-month progress</li>
                          <li>Celebrates improvements automatically</li>
                          <li>Identifies what's working</li>
                          <li>Suggests scaling successful approaches</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-2">Benchmarking</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li>Compare to previous academic years</li>
                          <li>Compare to similar schools (when available)</li>
                          <li>See how you rank regionally</li>
                          <li>Set realistic improvement goals</li>
                        </ul>
                      </div>
                    </div>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Pro Tip</AlertTitle>
                      <AlertDescription className="text-xs">
                        Review insights weekly to catch issues early. Small interventions now prevent big problems later!
                      </AlertDescription>
                    </Alert>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="export-data">
                  <AccordionTrigger>Exporting Data for Custom Analysis</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">Export data in multiple formats:</p>
                    <div className="space-y-3">
                      <div>
                        <Badge className="mb-2">PDF Exports</Badge>
                        <p className="text-sm text-muted-foreground mb-2">Best for:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li>Sharing with parents</li>
                          <li>Printing report cards</li>
                          <li>Archiving records</li>
                          <li>Professional presentations</li>
                        </ul>
                      </div>
                      <div>
                        <Badge className="mb-2">Excel Exports</Badge>
                        <p className="text-sm text-muted-foreground mb-2">Best for:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li>Custom data analysis</li>
                          <li>Creating pivot tables</li>
                          <li>Combining with other data</li>
                          <li>Statistical analysis</li>
                        </ul>
                      </div>
                      <div>
                        <Badge className="mb-2">CSV Exports</Badge>
                        <p className="text-sm text-muted-foreground mb-2">Best for:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                          <li>Importing to other systems</li>
                          <li>Database integration</li>
                          <li>Automated reporting</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Help Section */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Still Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            This documentation covers all major features. If you need additional assistance:
          </p>
          <div className="flex flex-wrap gap-3">
            <a 
              href="https://wa.me/2347050757085?text=Hello,%20I%20need%20help%20with%20Edura%20Schools" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline"
            >
              Contact Support →
            </a>
            <a 
              href="https://wa.me/2347050757085?text=I'd%20like%20to%20schedule%20a%20demo" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline"
            >
              Schedule Demo Call →
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
