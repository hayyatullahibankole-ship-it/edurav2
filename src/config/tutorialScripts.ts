// Detailed Recording Scripts for School Tutorial Videos
// Use these scripts when recording your screen to ensure comprehensive coverage

export interface TutorialScript {
  id: string;
  title: string;
  duration: string;
  intro: string;
  sections: {
    title: string;
    duration: string;
    steps: string[];
    talkingPoints: string[];
  }[];
  outro: string;
  keyFeaturesToShow: string[];
}

export const tutorialScripts: Record<string, TutorialScript[]> = {
  gettingStarted: [
    {
      id: "intro",
      title: "Welcome to Edura Schools",
      duration: "5:30",
      intro: "Welcome to Edura Schools! In this video, I'll give you a complete tour of your school dashboard and show you all the amazing features available to help you manage your institution effectively.",
      sections: [
        {
          title: "Dashboard Overview",
          duration: "2:00",
          steps: [
            "Log into your school dashboard",
            "Point out the main navigation menu on the left",
            "Highlight the overview cards showing student count, active exams, and performance metrics",
            "Show the quick action buttons at the top"
          ],
          talkingPoints: [
            "This is your command center where you can see everything at a glance",
            "The dashboard updates in real-time as students take exams",
            "You can customize which metrics appear on your dashboard"
          ]
        },
        {
          title: "Navigation Menu Tour",
          duration: "2:00",
          steps: [
            "Click through each menu item: Overview, Students, Exams, Reports, Settings",
            "Briefly show what each section contains",
            "Demonstrate how to collapse/expand the sidebar"
          ],
          talkingPoints: [
            "The navigation is organized to match your workflow",
            "Everything you need is just one click away",
            "The sidebar adapts to your screen size for mobile use"
          ]
        },
        {
          title: "Quick Actions",
          duration: "1:30",
          steps: [
            "Show the quick action buttons",
            "Demonstrate creating a new exam from the dashboard",
            "Show how to add a student quickly",
            "Display the notification center"
          ],
          talkingPoints: [
            "Quick actions save you time on common tasks",
            "You don't need to navigate away from the dashboard",
            "Notifications keep you updated on important events"
          ]
        }
      ],
      outro: "That's a quick overview of your Edura Schools dashboard! In the next videos, we'll dive deeper into each feature. Let's get started!",
      keyFeaturesToShow: [
        "Main dashboard with all cards visible",
        "Sidebar navigation",
        "Quick action buttons",
        "Notification bell",
        "User profile menu"
      ]
    },
    {
      id: "setup",
      title: "Initial Setup & Configuration",
      duration: "8:15",
      intro: "Let's set up your school profile properly so you can get the most out of Edura Schools. I'll walk you through every setting you need to configure.",
      sections: [
        {
          title: "School Profile Setup",
          duration: "3:00",
          steps: [
            "Navigate to Settings > School Profile",
            "Fill in school name, address, contact information",
            "Upload school logo",
            "Set school colors/branding",
            "Configure academic year and term settings"
          ],
          talkingPoints: [
            "Your school profile appears on student dashboards and reports",
            "The logo will appear on all generated reports",
            "Setting up terms helps organize exams by academic period"
          ]
        },
        {
          title: "Subscription & Billing",
          duration: "2:30",
          steps: [
            "Navigate to Settings > Billing",
            "Show current subscription plan",
            "Explain student limits and features",
            "Demonstrate how to upgrade if needed",
            "Show billing history"
          ],
          talkingPoints: [
            "Choose a plan based on your student count",
            "You can upgrade or downgrade anytime",
            "All plans include core exam and reporting features"
          ]
        },
        {
          title: "Exam Preferences",
          duration: "2:45",
          steps: [
            "Navigate to Settings > Exam Preferences",
            "Configure default exam duration",
            "Set passing marks",
            "Enable/disable calculator access",
            "Configure anti-cheat settings",
            "Set result visibility options"
          ],
          talkingPoints: [
            "These defaults apply to all new exams you create",
            "You can override these settings for individual exams",
            "Anti-cheat features help maintain exam integrity"
          ]
        }
      ],
      outro: "Great! Your school is now fully configured. You're ready to start adding students and creating exams!",
      keyFeaturesToShow: [
        "Complete settings panel",
        "School profile form",
        "Logo upload process",
        "Billing page",
        "Exam preferences page"
      ]
    }
  ],
  students: [
    {
      id: "add-students",
      title: "Adding Students to Your School",
      duration: "6:45",
      intro: "There are multiple ways to add students to your school. I'll show you both individual and bulk methods so you can choose what works best for you.",
      sections: [
        {
          title: "Adding Individual Students",
          duration: "2:30",
          steps: [
            "Navigate to Students section",
            "Click 'Add Student' button",
            "Fill in student details: name, email, class, ID number",
            "Set student password or auto-generate",
            "Assign to class/group",
            "Click Create Student"
          ],
          talkingPoints: [
            "Each student gets a unique login credential",
            "You can organize students by class or year",
            "Students receive welcome email with login instructions"
          ]
        },
        {
          title: "Bulk Student Upload",
          duration: "3:15",
          steps: [
            "Download the CSV template",
            "Show template format in spreadsheet",
            "Fill sample data for 5-10 students",
            "Upload the CSV file",
            "Review import preview",
            "Confirm and create all students",
            "Show success confirmation"
          ],
          talkingPoints: [
            "Bulk upload saves time when adding many students",
            "The system validates all data before creating accounts",
            "You can upload hundreds of students in seconds",
            "Any errors in the CSV will be highlighted for correction"
          ]
        },
        {
          title: "Verifying Student Accounts",
          duration: "1:00",
          steps: [
            "View newly created students in the list",
            "Show student details page",
            "Demonstrate password reset if needed",
            "Show how to print/export student credentials"
          ],
          talkingPoints: [
            "Always verify students can log in after creation",
            "You can reset passwords anytime from the admin panel",
            "Export credentials to share with students securely"
          ]
        }
      ],
      outro: "Now you know how to add students efficiently! Next, let's look at how to manage them effectively.",
      keyFeaturesToShow: [
        "Add student form",
        "Bulk upload interface",
        "CSV template",
        "Student list with filters",
        "Student detail page"
      ]
    },
    {
      id: "manage-students",
      title: "Managing Student Accounts",
      duration: "7:20",
      intro: "Once students are in the system, you'll need to manage their accounts. Let me show you all the management tools available.",
      sections: [
        {
          title: "Editing Student Information",
          duration: "2:00",
          steps: [
            "Navigate to student list",
            "Click on a student name",
            "Edit student details",
            "Update class assignment",
            "Save changes",
            "Show confirmation"
          ],
          talkingPoints: [
            "You can update student information anytime",
            "Changes take effect immediately",
            "Students see updated info on their dashboard"
          ]
        },
        {
          title: "Password Management",
          duration: "2:00",
          steps: [
            "Access student detail page",
            "Click 'Reset Password'",
            "Generate new password",
            "Copy and share securely with student",
            "Verify student can log in"
          ],
          talkingPoints: [
            "Students often forget passwords - this is easy to fix",
            "Always use secure methods to share passwords",
            "Encourage students to change default passwords"
          ]
        },
        {
          title: "Suspending & Activating Accounts",
          duration: "1:30",
          steps: [
            "Show active students list",
            "Demonstrate suspending a student account",
            "Show how suspended students cannot log in",
            "Reactivate the account",
            "Explain when to use suspension vs deletion"
          ],
          talkingPoints: [
            "Suspend accounts for temporary leave or behavior issues",
            "Suspended students retain all their data and history",
            "Reactivation is instant when needed"
          ]
        },
        {
          title: "Organizing Students",
          duration: "1:50",
          steps: [
            "Create class/group categories",
            "Assign students to classes",
            "Use filters to view by class",
            "Bulk edit student classes",
            "Show how classes help in exam assignment"
          ],
          talkingPoints: [
            "Organization makes management much easier",
            "You can assign exams to entire classes at once",
            "Filter by class to view specific student groups"
          ]
        }
      ],
      outro: "You now have complete control over student account management. Let's move on to tracking their progress!",
      keyFeaturesToShow: [
        "Student edit form",
        "Password reset flow",
        "Account suspension toggle",
        "Class management",
        "Bulk actions"
      ]
    },
    {
      id: "student-progress",
      title: "Tracking Student Progress",
      duration: "9:10",
      intro: "Understanding student progress is crucial. I'll show you all the analytics and tracking tools to monitor individual and class performance.",
      sections: [
        {
          title: "Individual Student Dashboard",
          duration: "3:00",
          steps: [
            "Open a student's detail page",
            "Review exam history and scores",
            "Check subject-wise performance",
            "View weak topics identified by system",
            "Show attendance and engagement metrics",
            "Review performance trends over time"
          ],
          talkingPoints: [
            "Each student has a comprehensive performance profile",
            "The system automatically identifies weak areas",
            "Trends help you see improvement or decline over time",
            "Use this data for personalized interventions"
          ]
        },
        {
          title: "Class Performance Overview",
          duration: "3:00",
          steps: [
            "Navigate to Reports > Class Analytics",
            "Show overall class averages",
            "Compare performance across subjects",
            "Identify top and struggling students",
            "View class progress charts",
            "Show participation and completion rates"
          ],
          talkingPoints: [
            "Class analytics give you the big picture",
            "Spot trends that need attention quickly",
            "Compare classes to identify teaching effectiveness",
            "Use data to adjust curriculum or teaching methods"
          ]
        },
        {
          title: "Progress Reports & Exports",
          duration: "3:10",
          steps: [
            "Generate individual student report",
            "Show report card format",
            "Export to PDF",
            "Generate class report",
            "Export data to Excel for custom analysis",
            "Schedule automatic weekly reports"
          ],
          talkingPoints: [
            "Professional reports you can share with parents",
            "All data is exportable for your own analysis",
            "Automated reports save you time",
            "Reports include detailed breakdowns and recommendations"
          ]
        }
      ],
      outro: "With these tracking tools, you'll always know exactly how your students are performing. No student will fall through the cracks!",
      keyFeaturesToShow: [
        "Student analytics dashboard",
        "Performance charts and graphs",
        "Class comparison views",
        "Report generation interface",
        "Export options"
      ]
    }
  ],
  exams: [
    {
      id: "create-exam",
      title: "Creating Custom Exams",
      duration: "10:30",
      intro: "Creating exams in Edura is powerful and flexible. I'll show you how to design the perfect exam for your students.",
      sections: [
        {
          title: "Basic Exam Setup",
          duration: "3:00",
          steps: [
            "Navigate to Exams > Create New",
            "Enter exam title and description",
            "Select exam type (JAMB, WAEC, Custom)",
            "Set duration and passing marks",
            "Choose subjects to include",
            "Set number of questions per subject"
          ],
          talkingPoints: [
            "Exam types come with pre-configured settings",
            "You can customize every aspect of the exam",
            "Multi-subject exams work like real standardized tests"
          ]
        },
        {
          title: "Question Selection",
          duration: "4:00",
          steps: [
            "Browse question bank by subject and topic",
            "Select questions manually",
            "Use auto-generate to randomly select questions",
            "Preview selected questions",
            "Adjust difficulty distribution",
            "Rearrange question order",
            "Save question set"
          ],
          talkingPoints: [
            "Question bank has thousands of verified questions",
            "Auto-generate creates balanced exams instantly",
            "You can mix manual and auto-generated questions",
            "Preview ensures exam quality before publishing"
          ]
        },
        {
          title: "Exam Settings & Options",
          duration: "2:30",
          steps: [
            "Configure time limits",
            "Enable/disable calculator",
            "Set question randomization",
            "Configure anti-cheat measures",
            "Set result visibility options",
            "Add instructions for students",
            "Preview exam as student would see it"
          ],
          talkingPoints: [
            "Randomization prevents cheating in group settings",
            "Anti-cheat features include tab monitoring",
            "You control when students see their results",
            "Always preview before publishing"
          ]
        },
        {
          title: "Publishing the Exam",
          duration: "1:00",
          steps: [
            "Review all settings",
            "Click Publish",
            "Confirm exam is live",
            "Show how to share exam code with students"
          ],
          talkingPoints: [
            "Published exams appear on student dashboards",
            "Students can start immediately unless scheduled",
            "You can unpublish anytime if needed"
          ]
        }
      ],
      outro: "You've just created a professional exam! Now let's see how to assign it to the right students.",
      keyFeaturesToShow: [
        "Exam creation form",
        "Question bank browser",
        "Question preview",
        "Settings configuration",
        "Exam preview mode",
        "Publish confirmation"
      ]
    },
    {
      id: "assign-exam",
      title: "Assigning Exams to Students",
      duration: "5:50",
      intro: "Once your exam is ready, you need to assign it to students. Let me show you the different assignment methods.",
      sections: [
        {
          title: "Assigning to Classes",
          duration: "2:00",
          steps: [
            "Open exam details",
            "Click 'Assign to Students'",
            "Select entire class or multiple classes",
            "Set start date and time",
            "Set deadline",
            "Send notification to students",
            "Confirm assignment"
          ],
          talkingPoints: [
            "Class assignment is fastest for large groups",
            "Students get notified automatically",
            "Set reasonable deadlines to ensure completion",
            "You can schedule exams for future dates"
          ]
        },
        {
          title: "Individual Assignment",
          duration: "1:30",
          steps: [
            "Select specific students from list",
            "Assign exam with custom deadlines",
            "Set individual accommodations if needed",
            "Send personalized notifications"
          ],
          talkingPoints: [
            "Use individual assignment for makeup exams",
            "You can give extra time to specific students",
            "Accommodations help students with special needs"
          ]
        },
        {
          title: "Scheduled & Timed Exams",
          duration: "2:20",
          steps: [
            "Configure exam schedule",
            "Set exact start time",
            "Set auto-submission deadline",
            "Show countdown timer students will see",
            "Demonstrate what happens at deadline"
          ],
          talkingPoints: [
            "Scheduled exams start automatically at set time",
            "Students cannot access exam before start time",
            "Auto-submission prevents late submissions",
            "Perfect for proctored or standardized exams"
          ]
        }
      ],
      outro: "Your students are now assigned and ready to take the exam. Let's learn how to monitor them during the exam.",
      keyFeaturesToShow: [
        "Assignment interface",
        "Class selector",
        "Individual student selector",
        "Schedule settings",
        "Notification preview"
      ]
    },
    {
      id: "monitor-exam",
      title: "Monitoring Active Exams",
      duration: "7:40",
      intro: "While exams are in progress, you need to monitor what's happening. I'll show you all the real-time monitoring tools.",
      sections: [
        {
          title: "Real-Time Exam Dashboard",
          duration: "2:30",
          steps: [
            "Navigate to Exams > Active Exams",
            "View list of students currently taking exam",
            "Check progress for each student",
            "See time remaining",
            "View completion status",
            "Check for flagged activities"
          ],
          talkingPoints: [
            "Dashboard updates in real-time every few seconds",
            "You can see exactly who's taking the exam now",
            "Progress bars show how far each student has gotten",
            "Flags appear for suspicious activities"
          ]
        },
        {
          title: "Anti-Cheat Monitoring",
          duration: "2:30",
          steps: [
            "Show anti-cheat alerts panel",
            "Demonstrate tab switch detection",
            "Show copy-paste attempt logging",
            "Review flagged students list",
            "Explain what each alert means",
            "Show how to review after exam"
          ],
          talkingPoints: [
            "System monitors for common cheating behaviors",
            "Alerts don't auto-fail students - you review them",
            "Multiple tab switches may indicate searching for answers",
            "Use alerts to have conversations with students"
          ]
        },
        {
          title: "Managing Active Exams",
          duration: "2:40",
          steps: [
            "Extend time for entire class",
            "Give extra time to individual student",
            "Pause exam if technical issues occur",
            "Resume paused exam",
            "Force submit for a student if needed",
            "Cancel exam in emergency"
          ],
          talkingPoints: [
            "Technical issues happen - you have control",
            "Time extensions help with connectivity problems",
            "Pause feature freezes exam for everyone",
            "Force submit helps students who can't submit normally"
          ]
        }
      ],
      outro: "You now have full control during exam time. Your students can focus on doing their best while you monitor everything!",
      keyFeaturesToShow: [
        "Active exam monitoring dashboard",
        "Student progress list",
        "Anti-cheat alerts panel",
        "Time management controls",
        "Pause/resume functions"
      ]
    }
  ],
  reports: [
    {
      id: "analytics",
      title: "Understanding Analytics Dashboard",
      duration: "11:20",
      intro: "The analytics dashboard is packed with insights. I'll give you a complete tour of all the metrics and what they mean.",
      sections: [
        {
          title: "Overview Metrics",
          duration: "3:00",
          steps: [
            "Navigate to Reports > Analytics",
            "Review total students metric",
            "Check total exams completed",
            "View average performance score",
            "See engagement metrics",
            "Review time-based trends"
          ],
          talkingPoints: [
            "These high-level metrics give school-wide overview",
            "Compare current period to previous periods",
            "Track overall improvement or decline",
            "Use trends to measure initiative effectiveness"
          ]
        },
        {
          title: "Subject Performance Analysis",
          duration: "3:00",
          steps: [
            "View subject-wise performance chart",
            "Compare subjects side by side",
            "Identify strongest and weakest subjects",
            "See topic-level breakdowns",
            "Review which topics need more focus",
            "Show correlation between subjects"
          ],
          talkingPoints: [
            "Subject analysis reveals curriculum strengths",
            "Weak subjects may need additional resources",
            "Topic breakdowns guide lesson planning",
            "Compare subjects to national averages when available"
          ]
        },
        {
          title: "Student Distribution & Trends",
          duration: "2:30",
          steps: [
            "View performance distribution curve",
            "Show top, middle, and struggling student segments",
            "Review improvement trends over time",
            "Check student engagement patterns",
            "Identify at-risk students automatically"
          ],
          talkingPoints: [
            "Distribution shows if most students are succeeding",
            "Bell curve analysis reveals teaching effectiveness",
            "Trend lines show if interventions are working",
            "Early identification helps struggling students"
          ]
        },
        {
          title: "Custom Date Ranges & Filters",
          duration: "2:50",
          steps: [
            "Apply date range filters",
            "Filter by class or grade",
            "Filter by subject",
            "Filter by exam type",
            "Combine multiple filters",
            "Save custom filter combinations"
          ],
          talkingPoints: [
            "Filters let you drill down into specific data",
            "Compare different time periods easily",
            "Isolate performance by class or subject",
            "Saved filters speed up regular reporting"
          ]
        }
      ],
      outro: "You're now an analytics expert! Next, let's learn how to export and share these insights.",
      keyFeaturesToShow: [
        "Full analytics dashboard",
        "Performance charts and graphs",
        "Distribution curves",
        "Trend lines",
        "Filter controls",
        "Comparison views"
      ]
    },
    {
      id: "export-reports",
      title: "Generating & Exporting Reports",
      duration: "8:00",
      intro: "Let me show you how to create professional reports and export data for further analysis or sharing.",
      sections: [
        {
          title: "Individual Student Reports",
          duration: "2:30",
          steps: [
            "Navigate to Students > Select Student",
            "Click 'Generate Report'",
            "Choose report template (progress, transcript, etc.)",
            "Select date range",
            "Preview report",
            "Export to PDF",
            "Show final PDF output"
          ],
          talkingPoints: [
            "Reports include all exam results and analytics",
            "Professional format suitable for parents",
            "Includes performance trends and recommendations",
            "PDF can be printed or emailed"
          ]
        },
        {
          title: "Class & Group Reports",
          duration: "2:30",
          steps: [
            "Select Reports > Class Reports",
            "Choose class or grade",
            "Select report type (summary, detailed, comparison)",
            "Generate report",
            "Review summary statistics",
            "Export to PDF or Excel",
            "Show exported files"
          ],
          talkingPoints: [
            "Class reports summarize group performance",
            "Excel exports allow custom analysis",
            "Share with other teachers or administration",
            "Use for parent-teacher meetings"
          ]
        },
        {
          title: "Custom Report Builder",
          duration: "3:00",
          steps: [
            "Open Custom Report Builder",
            "Select data points to include",
            "Choose visualization types",
            "Add filters and groupings",
            "Preview custom report",
            "Save as template for reuse",
            "Export in multiple formats"
          ],
          talkingPoints: [
            "Build exactly the report you need",
            "Include only relevant metrics",
            "Save templates for recurring reports",
            "Share templates with other administrators"
          ]
        }
      ],
      outro: "You can now create any report you need! Let's look at one more advanced topic - performance insights.",
      keyFeaturesToShow: [
        "Report generation interface",
        "Template selector",
        "PDF preview",
        "Excel export",
        "Custom report builder",
        "Template library"
      ]
    },
    {
      id: "performance-insights",
      title: "Performance Insights & Trends",
      duration: "9:45",
      intro: "The system automatically generates insights from your data. Let me show you how to use these powerful features.",
      sections: [
        {
          title: "Weak Topics Identification",
          duration: "3:00",
          steps: [
            "Navigate to Insights > Weak Topics",
            "View automatically identified weak areas",
            "See which students struggle with each topic",
            "Review difficulty analysis",
            "Check success rates by topic",
            "Get recommended interventions"
          ],
          talkingPoints: [
            "System analyzes all exam data automatically",
            "Identifies patterns across all students",
            "Topics below 60% success are flagged",
            "Use insights to adjust teaching focus"
          ]
        },
        {
          title: "Performance Trend Analysis",
          duration: "3:00",
          steps: [
            "View performance trends over time",
            "See improvement or decline patterns",
            "Compare before/after interventions",
            "Track subject-specific trends",
            "Review cohort analysis",
            "Predict future performance"
          ],
          talkingPoints: [
            "Trends reveal what's working and what's not",
            "Track impact of new teaching methods",
            "Early warning for declining performance",
            "Celebrate improvements with data"
          ]
        },
        {
          title: "Comparative Analytics",
          duration: "2:30",
          steps: [
            "Compare classes against each other",
            "Compare to previous academic year",
            "Compare to school averages",
            "Compare subjects within same class",
            "View benchmark comparisons"
          ],
          talkingPoints: [
            "Comparisons provide context to performance",
            "Identify best-performing classes and why",
            "Learn from successful approaches",
            "Set realistic improvement goals based on data"
          ]
        },
        {
          title: "Action Recommendations",
          duration: "1:15",
          steps: [
            "View AI-generated recommendations",
            "See suggested interventions for weak areas",
            "Get resource suggestions",
            "Review success stories from similar schools",
            "Create action plans from insights"
          ],
          talkingPoints: [
            "System suggests data-driven actions",
            "Not just data - actionable next steps",
            "Recommendations based on proven approaches",
            "Turn insights into improvements"
          ]
        }
      ],
      outro: "Congratulations! You now have all the knowledge to use Edura Schools effectively. Your students are going to achieve amazing results!",
      keyFeaturesToShow: [
        "Weak topics dashboard",
        "Trend charts with annotations",
        "Comparison views",
        "Recommendations panel",
        "Action plan creator"
      ]
    }
  ]
};

// Quick Reference: Recording Checklist
export const recordingChecklist = {
  beforeRecording: [
    "Clear browser cache and cookies",
    "Log out and log back in for fresh session",
    "Close unnecessary browser tabs",
    "Prepare sample data (students, exams) beforehand",
    "Test microphone and screen recording",
    "Set screen resolution to 1920x1080",
    "Hide bookmarks bar and personal information"
  ],
  duringRecording: [
    "Speak clearly and at moderate pace",
    "Pause briefly between sections",
    "Use cursor to highlight important elements",
    "Avoid clicking too fast - let viewers see",
    "Narrate what you're doing as you do it",
    "If you make a mistake, pause and restart that section"
  ],
  afterRecording: [
    "Trim intro/outro if needed",
    "Add simple transitions between sections",
    "Check audio levels are consistent",
    "Add chapter markers for long videos",
    "Create custom thumbnail with title",
    "Upload to YouTube as unlisted or public",
    "Get embed URL (youtube.com/embed/VIDEO_ID)",
    "Paste embed URL into tutorialVideos.ts"
  ]
};
